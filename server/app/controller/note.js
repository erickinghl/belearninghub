'use strict';

const Controller = require('egg').Controller;

class NoteController extends Controller {
    // 我的笔记列表 → { rows }
    async list() {
        const { ctx, app } = this;
        const user_id = ctx.authUser.id;
        const page = ctx.query.page ? parseInt(ctx.query.page) : 1;
        const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 20;
        const offset = (page - 1) * limit;

        const where = { user_id };
        if (ctx.query.course_id) where.course_id = ctx.query.course_id;
        if (ctx.query.question_id) where.question_id = ctx.query.question_id;

        const result = await app.model.Note.findAndCountAll({
            where, offset, limit,
            order: [['id', 'DESC']]
        });
        ctx.apiSuccess({ rows: result.rows, total: result.count });
    }

    // 笔记详情 ?id=
    async read() {
        const { ctx, app } = this;
        const user_id = ctx.authUser.id;
        const id = ctx.query.id;
        if (!id) return ctx.throw(400, '缺少笔记id');
        const note = await app.model.Note.findByPk(id);
        if (!note || note.user_id !== user_id) return ctx.throw(404, '笔记不存在');
        ctx.apiSuccess(note);
    }

    // 写/改笔记 body: { id?, title, content, course_id? }
    async save() {
        const { ctx, app } = this;
        const user_id = ctx.authUser.id;
        const body = Object.assign({}, ctx.request.body);
        const question_id = parseInt(body.question_id) || 0;
        // 题目笔记可不传标题（自动取内容首句）；普通笔记仍要求标题
        let title = (body.title || '').trim();
        if (!title) {
            if (question_id) {
                title = (body.content || '').trim().slice(0, 20) || '题目笔记';
            } else {
                return ctx.throw(400, '请填写笔记标题');
            }
        }
        // 附件：前端传 JSON 字符串或数组，统一存成 JSON 字符串
        let attachments = body.attachments;
        if (Array.isArray(attachments)) attachments = JSON.stringify(attachments);
        else if (typeof attachments === 'string' && attachments.trim()) {
            try { attachments = JSON.stringify(JSON.parse(attachments)); } catch (e) { attachments = '[]'; }
        } else attachments = '[]';

        const data = {
            user_id,
            title,
            content: body.content || '',
            attachments,
            course_id: body.course_id || 0,
            question_id
        };
        let note;
        if (body.id) {
            // 只能改自己的
            const exist = await app.model.Note.findByPk(body.id);
            if (!exist || exist.user_id !== user_id) return ctx.throw(404, '笔记不存在');
            await app.model.Note.update(data, { where: { id: body.id } });
            note = await app.model.Note.findByPk(body.id);
        } else {
            note = await app.model.Note.create(data);
        }
        ctx.apiSuccess(note);
    }

    // 删笔记 body: { id }
    async destroy() {
        const { ctx, app } = this;
        const user_id = ctx.authUser.id;
        const id = ctx.request.body.id;
        if (!id) return ctx.throw(400, '缺少笔记id');
        const note = await app.model.Note.findByPk(id);
        if (!note || note.user_id !== user_id) return ctx.throw(404, '笔记不存在');
        await app.model.Note.destroy({ where: { id } });
        ctx.apiSuccess('删除成功');
    }
}

module.exports = NoteController;
