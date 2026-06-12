'use strict';

const Controller = require('egg').Controller;

class UserTestController extends Controller {
    // 交卷判分
    // body: { user_test_id, value: [按题目顺序的答案数组] }
    // value 顺序 = read 返回的 testpaper_questions 顺序（sort ASC, id ASC）
    async save() {
        const { ctx, app } = this;
        const user_id = ctx.authUser.id;
        const body = Object.assign({}, ctx.request.body);
        const user_test_id = body.user_test_id;
        if (!user_test_id) return ctx.throw(400, '缺少 user_test_id');

        let value = body.value;
        if (typeof value === 'string') {
            try { value = JSON.parse(value); } catch (e) { value = []; }
        }
        if (!Array.isArray(value)) value = [];

        const record = await app.model.UserTest.findByPk(user_test_id);
        if (!record || record.user_id !== user_id) return ctx.throw(404, '答题记录不存在');
        if (Number(record.answer_status) === 1) return ctx.throw(400, '该试卷已交卷');

        const paper = await app.model.Testpaper.findByPk(record.testpaper_id);
        if (!paper) return ctx.throw(404, '该试卷不存在');

        const questions = await app.model.Question.findAll({
            where: { testpaper_id: record.testpaper_id },
            order: [['sort', 'ASC'], ['id', 'ASC']]
        });

        let score = 0;
        let hasManual = false;
        const detail = questions.map((q, i) => {
            const userValue = value[i];   // 按顺序取
            const r = ctx.service.judge.judgeOne(q, userValue);
            if (r.manual) hasManual = true;
            score += r.gain;
            return {
                id: q.id,
                type: q.type,
                title: q.title,
                options: q.options,
                userValue: userValue === undefined ? null : userValue,
                answer: q.answer,          // 正确答案（交卷后下发）
                analysis: q.analysis,      // 解析（交卷后下发）
                score: q.score,
                correct: r.correct,        // true/false/null(问答待人工)
                gain: r.gain,
                manual: r.manual
            };
        });

        const total_score = questions.reduce((s, q) => s + Number(q.score || 0), 0);
        const is_pass = score >= Number(paper.pass_score || 0) ? 1 : 0;
        // 含问答题需人工阅卷 → read_status=0；纯客观题立即阅完 → 1
        const read_status = hasManual ? 0 : 1;

        await app.model.UserTest.update({
            value: JSON.stringify(value),
            result: JSON.stringify(detail),
            score,
            total_score,
            is_pass,
            answer_status: 1,
            read_status
        }, { where: { id: record.id } });

        ctx.apiSuccess({
            id: record.id,
            testpaper_id: record.testpaper_id,
            title: paper.title,
            score,
            total_score,
            pass_score: paper.pass_score,
            is_pass,
            read_status,
            has_manual: hasManual,   // 含问答题，得分仅为客观题
            detail
        });
    }

    // 我的答题记录列表 → { rows }
    // 前端 my-test 读 item.testpaper.{title,question_count}、answer_status、read_status、score、created_time
    async list() {
        const { ctx, app } = this;
        const user_id = ctx.authUser.id;
        const page = ctx.query.page ? parseInt(ctx.query.page) : 1;
        const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 20;
        const offset = (page - 1) * limit;

        const result = await app.model.UserTest.findAndCountAll({
            where: { user_id },
            attributes: ['id', 'testpaper_id', 'score', 'total_score', 'is_pass', 'answer_status', 'read_status', 'created_time'],
            include: [{
                model: app.model.Testpaper,
                attributes: ['id', 'title', 'cover', 'question_count']
            }],
            offset, limit,
            order: [['id', 'DESC']]
        });

        const fmt = ts => {
            if (!ts) return '';
            const d = new Date(ts);
            const p = n => (n < 10 ? '0' + n : '' + n);
            return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
        };

        const rows = result.rows.map(r => {
            const o = JSON.parse(JSON.stringify(r));
            // 关联别名：belongsTo 默认是模型名 testpaper
            o.testpaper = o.testpaper || { title: '', question_count: 0 };
            o.created_time = fmt(r.created_time);
            return o;
        });
        ctx.apiSuccess({ rows, total: result.count });
    }

    // 单次答题记录详情（看解析）?id=
    async read() {
        const { ctx, app } = this;
        const user_id = ctx.authUser.id;
        const id = ctx.query.id;
        if (!id) return ctx.throw(400, '缺少记录id');
        const record = await app.model.UserTest.findByPk(id);
        if (!record || record.user_id !== user_id) return ctx.throw(404, '记录不存在');
        const paper = await app.model.Testpaper.findByPk(record.testpaper_id);
        const data = JSON.parse(JSON.stringify(record));
        data.title = paper ? paper.title : '';
        data.pass_score = paper ? paper.pass_score : 0;
        data.detail = record.result;   // getter 已 parse
        ctx.apiSuccess(data);
    }

    // ===== 后台人工阅卷 =====
    // 待阅卷列表（含问答题、read_status=0）
    async adminPendingList() {
        const { ctx, app } = this;
        const page = ctx.query.page ? parseInt(ctx.query.page) : 1;
        const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 50;
        const offset = (page - 1) * limit;
        // status 参数：pending(默认,待阅)/done(已阅)/all
        const status = ctx.query.status || 'pending';
        const where = {};
        if (status === 'pending') where.read_status = 0;
        else if (status === 'done') where.read_status = 1;

        const result = await app.model.UserTest.findAndCountAll({
            where,
            attributes: ['id', 'user_id', 'testpaper_id', 'score', 'total_score', 'is_pass', 'read_status', 'created_time'],
            include: [{ model: app.model.Testpaper, attributes: ['id', 'title', 'pass_score'] }],
            offset, limit,
            order: [['id', 'DESC']]
        });

        // 附上用户名
        const uids = [...new Set(result.rows.map(r => r.user_id))];
        const users = uids.length ? await app.model.User.findAll({ where: { id: uids }, attributes: ['id', 'username', 'nickname'] }) : [];
        const umap = {};
        users.forEach(u => { umap[u.id] = u; });

        const rows = result.rows.map(r => {
            const o = JSON.parse(JSON.stringify(r));
            const u = umap[r.user_id];
            o.username = u ? (u.nickname || u.username) : ('用户#' + r.user_id);
            return o;
        });
        ctx.apiSuccess({ rows, total: result.count });
    }

    // 后台看某记录的完整答卷（含问答题作答 + 当前给分）
    async adminReadDetail() {
        const { ctx, app } = this;
        const id = ctx.query.id;
        if (!id) return ctx.throw(400, '缺少记录id');
        const record = await app.model.UserTest.findByPk(id);
        if (!record) return ctx.throw(404, '记录不存在');
        const paper = await app.model.Testpaper.findByPk(record.testpaper_id);
        const data = JSON.parse(JSON.stringify(record));
        data.title = paper ? paper.title : '';
        data.pass_score = paper ? paper.pass_score : 0;
        data.detail = record.result;   // getter 已 parse
        ctx.apiSuccess(data);
    }

    // 提交问答题评分。body: { id, grades: { [questionId]: 给的分 } }
    // 重新累加客观题得分 + 问答题人工分 → 更新 score/is_pass/read_status=1
    async adminGrade() {
        const { ctx, app } = this;
        const body = Object.assign({}, ctx.request.body);
        const id = body.id;
        if (!id) return ctx.throw(400, '缺少记录id');
        let grades = body.grades;
        if (typeof grades === 'string') {
            try { grades = JSON.parse(grades); } catch (e) { grades = {}; }
        }
        grades = grades || {};

        const record = await app.model.UserTest.findByPk(id);
        if (!record) return ctx.throw(404, '记录不存在');
        const detail = record.result;   // getter parse 成数组
        if (!Array.isArray(detail)) return ctx.throw(400, '该记录无判分明细');

        let total = 0;
        const newDetail = detail.map(q => {
            if (q.manual) {
                // 问答题：取人工给分，封顶该题满分
                let g = Number(grades[q.id]);
                if (isNaN(g) || g < 0) g = 0;
                if (g > Number(q.score)) g = Number(q.score);
                q.gain = g;
                q.correct = g >= Number(q.score) ? true : (g > 0 ? null : false);
            }
            total += Number(q.gain || 0);
            return q;
        });

        const paper = await app.model.Testpaper.findByPk(record.testpaper_id);
        const is_pass = total >= Number(paper ? paper.pass_score : 0) ? 1 : 0;

        await app.model.UserTest.update({
            result: JSON.stringify(newDetail),
            score: total,
            is_pass,
            read_status: 1
        }, { where: { id } });

        ctx.apiSuccess({ id, score: total, is_pass, read_status: 1 });
    }
}

module.exports = UserTestController;
