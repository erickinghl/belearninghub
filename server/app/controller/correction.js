'use strict';

const Controller = require('egg').Controller;

class CorrectionController extends Controller {
    // 用户提交纠错
    async submit() {
        const { ctx, app } = this;
        const user_id = ctx.authUser.id;
        const body = Object.assign({}, ctx.request.body);
        const question_id = parseInt(body.question_id);
        const content = (body.content || '').trim();
        // 纠错图片：前端传 JSON 字符串或数组，统一存成 JSON 字符串
        let images = body.images;
        if (Array.isArray(images)) images = JSON.stringify(images);
        else if (typeof images === 'string' && images.trim()) {
            try { images = JSON.stringify(JSON.parse(images)); } catch (e) { images = '[]'; }
        } else images = '[]';
        const hasImages = images !== '[]';
        if (!question_id) return ctx.throw(400, '缺少题目id');
        if (!content && !hasImages) return ctx.throw(400, '请填写纠错说明或上传图片');

        const q = await app.model.Question.findByPk(question_id);
        if (!q) return ctx.throw(404, '题目不存在');

        await app.model.QuestionCorrection.create({
            user_id,
            question_id,
            testpaper_id: q.testpaper_id,
            content,
            images,
            status: 0
        });
        ctx.apiSuccess('提交成功，感谢反馈');
    }

    // ===== 后台 =====
    // 纠错列表（?status= 过滤，默认全部）
    async adminList() {
        const { ctx, app } = this;
        const page = ctx.query.page ? parseInt(ctx.query.page) : 1;
        const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 50;
        const offset = (page - 1) * limit;
        const where = {};
        if (ctx.query.status !== undefined && ctx.query.status !== '') where.status = parseInt(ctx.query.status);

        const result = await app.model.QuestionCorrection.findAndCountAll({
            where, offset, limit,
            order: [['id', 'DESC']]
        });
        // 用 model 实例的 getter 把 images 解析成数组，再转纯对象
        const rows = result.rows.map(r => {
            const o = r.toJSON();
            o.images = r.images; // getter 返回数组
            return o;
        });

        // 附题目信息 + 提交用户
        const qids = [...new Set(rows.map(r => r.question_id))];
        const uids = [...new Set(rows.map(r => r.user_id))];
        const questions = qids.length ? await app.model.Question.findAll({ where: { id: qids } }) : [];
        const users = uids.length ? await app.model.User.findAll({ where: { id: uids }, attributes: ['id', 'username', 'nickname'] }) : [];
        const qmap = {}; JSON.parse(JSON.stringify(questions)).forEach(q => { qmap[q.id] = q; });
        const umap = {}; users.forEach(u => { umap[u.id] = u; });

        rows.forEach(r => {
            const q = qmap[r.question_id];
            r.question_title = q ? q.title : ('题目#' + r.question_id);
            r.question_type = q ? q.type : '';
            r.question_answer = q ? q.answer : '';
            r.question_analysis = q ? q.analysis : '';
            const u = umap[r.user_id];
            r.username = u ? (u.nickname || u.username) : ('用户#' + r.user_id);
            r.status_text = ['待处理', '已采纳', '已驳回'][Number(r.status)] || '待处理';
        });

        ctx.apiSuccess({ rows, total: result.count });
    }

    // 后台处理纠错：更新状态 + 回复
    async adminHandle() {
        const { ctx, app } = this;
        const body = Object.assign({}, ctx.request.body);
        const id = parseInt(body.id);
        const status = parseInt(body.status);
        if (!id || isNaN(status)) return ctx.throw(400, '参数缺失');
        await app.model.QuestionCorrection.update(
            { status, reply: body.reply || '' },
            { where: { id } }
        );
        ctx.apiSuccess('已处理');
    }

    // 后台待处理数量（给标签红点用）
    async adminPendingCount() {
        const { ctx, app } = this;
        const count = await app.model.QuestionCorrection.count({ where: { status: 0 } });
        ctx.apiSuccess({ count });
    }
}

module.exports = CorrectionController;
