'use strict';

const Controller = require('egg').Controller;

class TestpaperController extends Controller {
    // 试卷列表 ?category_id= &page= &limit=
    // 返回 { rows }（前端 test-list 读 res.rows）。每条的 is_test = 当前用户是否已考过
    async list() {
        const { ctx, app } = this;
        const where = { status: 1 };
        if (ctx.query.category_id) where.category_id = ctx.query.category_id;

        const page = ctx.query.page ? parseInt(ctx.query.page) : 1;
        const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 20;
        const offset = (page - 1) * limit;

        const result = await app.model.Testpaper.findAndCountAll({
            where, offset, limit,
            order: [['sort', 'DESC'], ['id', 'DESC']]
        });

        // 当前用户已交卷的试卷集合 → 前端用 is_test 控制「你考过了」按钮
        let doneSet = new Set();
        const userId = ctx.authUser && ctx.authUser.id;
        if (userId) {
            const ids = result.rows.map(p => p.id);
            if (ids.length) {
                const done = await app.model.UserTest.findAll({
                    where: { user_id: userId, testpaper_id: ids, answer_status: 1 },
                    attributes: ['testpaper_id']
                });
                doneSet = new Set(done.map(d => d.testpaper_id));
            }
        }

        const rows = result.rows.map(p => {
            const o = JSON.parse(JSON.stringify(p));
            o.is_test = doneSet.has(p.id) ? 1 : 0;   // 前端语义：1=已考过(禁用按钮)
            return o;
        });
        ctx.apiSuccess({ rows, total: result.count });
    }

    // 开始答题 ?id=  —— 进入即为当前用户创建一条「考试中」记录，返回 user_test_id + 题目
    // 题目下发 user_value 初值（单选/判断 -1，多选/填空 []），不下发正确答案/解析
    async read() {
        const { ctx, app } = this;
        const id = ctx.query.id;
        if (!id) return ctx.throw(400, '缺少试卷id');
        const user_id = ctx.authUser.id;

        const paper = await app.model.Testpaper.findByPk(id);
        if (!paper) return ctx.throw(404, '该试卷不存在');

        const questions = await app.model.Question.findAll({
            where: { testpaper_id: id },
            order: [['sort', 'ASC'], ['id', 'ASC']]
        });

        // 复用未交卷的记录；否则新建（避免重复进入产生多条空记录）
        let record = await app.model.UserTest.findOne({
            where: { user_id, testpaper_id: id, answer_status: 0 },
            order: [['id', 'DESC']]
        });
        if (!record) {
            record = await app.model.UserTest.create({
                user_id, testpaper_id: id, answer_status: 0, read_status: 0
            });
        }

        // 按题型给出 user_value 初值
        const initValue = type => {
            if (type === 'radio' || type === 'trueOrfalse') return -1;
            if (type === 'completion') return [''];   // 填空默认一个空
            return [];                                  // checkbox / answer
        };
        const list = questions.map(q => ({
            id: q.id,
            type: q.type,
            title: q.title,
            options: q.options,
            score: q.score,
            sort: q.sort,
            user_value: initValue(q.type)
        }));

        ctx.apiSuccess({
            id: paper.id,
            title: paper.title,
            expire: paper.expire,
            pass_score: paper.pass_score,
            total_score: paper.total_score,
            question_count: paper.question_count,
            user_test_id: record.id,
            testpaper_questions: list
        });
    }

    // ===== 后台 =====
    // 新增/更新试卷
    async save() {
        const { ctx, app } = this;
        const body = Object.assign({}, ctx.request.body);
        ctx.validate({
            title: { required: true, type: 'string', desc: '试卷标题' }
        });
        const data = {
            title: body.title,
            cover: body.cover || '',
            category_id: body.category_id || 0,
            desc: body.desc || '',
            total_score: body.total_score || 0,
            pass_score: body.pass_score || 0,
            expire: body.expire || 0,
            is_test: body.is_test || 0,
            sort: body.sort || 0,
            status: body.status === undefined ? 1 : body.status
        };
        let paper;
        if (body.id) {
            await app.model.Testpaper.update(data, { where: { id: body.id } });
            paper = await app.model.Testpaper.findByPk(body.id);
        } else {
            paper = await app.model.Testpaper.create(data);
        }
        await ctx.service.testpaper.refreshStats(paper.id);
        paper = await app.model.Testpaper.findByPk(paper.id);
        ctx.apiSuccess(paper);
    }

    // 后台试卷列表（含下架）
    async adminList() {
        const { ctx, app } = this;
        const rows = await app.model.Testpaper.findAll({
            order: [['sort', 'DESC'], ['id', 'DESC']]
        });
        ctx.apiSuccess(rows);
    }

    // 后台试卷详情（含题目完整数据：答案+解析，供编辑）
    async adminRead() {
        const { ctx, app } = this;
        const id = ctx.query.id;
        if (!id) return ctx.throw(400, '缺少试卷id');
        const paper = await app.model.Testpaper.findByPk(id);
        if (!paper) return ctx.throw(404, '该试卷不存在');
        const questions = await app.model.Question.findAll({
            where: { testpaper_id: id },
            order: [['sort', 'ASC'], ['id', 'ASC']]
        });
        const data = JSON.parse(JSON.stringify(paper));
        data.questions = questions;
        ctx.apiSuccess(data);
    }

    async destroy() {
        const { ctx, app } = this;
        const id = ctx.request.body.id;
        if (!id) return ctx.throw(400, '缺少试卷id');
        await app.model.Question.destroy({ where: { testpaper_id: id } });
        await app.model.Testpaper.destroy({ where: { id } });
        ctx.apiSuccess('删除成功');
    }
}

module.exports = TestpaperController;
