'use strict';

const Controller = require('egg').Controller;

// 题目功能条：点赞 / 留言（讨论区）。收藏走 practice.fava，笔记走 note.*
class QuestionActionController extends Controller {
    // 题目互动统计 + 当前用户状态（点赞数/是否已赞、留言数、是否已收藏、是否有笔记）
    async stat() {
        const { ctx, app } = this;
        const user_id = ctx.authUser.id;
        const question_id = parseInt(ctx.query.question_id);
        if (!question_id) return ctx.throw(400, '缺少题目id');

        const [likeCount, liked, commentCount, fava, noteCount] = await Promise.all([
            app.model.QuestionLike.count({ where: { question_id } }),
            app.model.QuestionLike.count({ where: { question_id, user_id } }),
            app.model.QuestionComment.count({ where: { question_id, status: 1 } }),
            app.model.UserQuestion.findOne({ where: { user_id, question_id } }),
            app.model.Note.count({ where: { user_id, question_id } })
        ]);

        ctx.apiSuccess({
            like_count: likeCount,
            liked: liked > 0,
            comment_count: commentCount,
            faved: fava ? !!fava.fava : false,
            note_count: noteCount
        });
    }

    // 点赞 / 取消点赞（切换）
    async like() {
        const { ctx, app } = this;
        const user_id = ctx.authUser.id;
        const question_id = parseInt(ctx.request.body.question_id);
        if (!question_id) return ctx.throw(400, '缺少题目id');

        const exist = await app.model.QuestionLike.findOne({ where: { user_id, question_id } });
        let liked;
        if (exist) {
            await app.model.QuestionLike.destroy({ where: { id: exist.id } });
            liked = false;
        } else {
            await app.model.QuestionLike.create({ user_id, question_id });
            liked = true;
        }
        const like_count = await app.model.QuestionLike.count({ where: { question_id } });
        ctx.apiSuccess({ liked, like_count });
    }

    // 留言列表（讨论区）?question_id=
    async commentList() {
        const { ctx, app } = this;
        const question_id = parseInt(ctx.query.question_id);
        if (!question_id) return ctx.throw(400, '缺少题目id');
        const page = ctx.query.page ? parseInt(ctx.query.page) : 1;
        const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 50;
        const offset = (page - 1) * limit;

        const result = await app.model.QuestionComment.findAndCountAll({
            where: { question_id, status: 1 },
            offset, limit,
            order: [['id', 'DESC']]
        });
        const rows = JSON.parse(JSON.stringify(result.rows));

        // 附用户昵称 + 头像
        const uids = [...new Set(rows.map(r => r.user_id))];
        const users = uids.length
            ? await app.model.User.findAll({ where: { id: uids }, attributes: ['id', 'username', 'nickname', 'avatar'] })
            : [];
        const umap = {};
        users.forEach(u => { umap[u.id] = u; });
        rows.forEach(r => {
            const u = umap[r.user_id];
            r.username = u ? (u.nickname || u.username) : ('用户' + r.user_id);
            r.avatar = u ? u.avatar : '';
        });

        ctx.apiSuccess({ rows, total: result.count });
    }

    // 发表留言 body: { question_id, content }
    async commentAdd() {
        const { ctx, app } = this;
        const user_id = ctx.authUser.id;
        const question_id = parseInt(ctx.request.body.question_id);
        const content = (ctx.request.body.content || '').trim();
        if (!question_id) return ctx.throw(400, '缺少题目id');
        if (!content) return ctx.throw(400, '请输入留言内容');
        if (content.length > 1000) return ctx.throw(400, '留言过长');

        const c = await app.model.QuestionComment.create({ user_id, question_id, content, status: 1 });
        ctx.apiSuccess(c);
    }

    // 删除自己的留言 body: { id }
    async commentDestroy() {
        const { ctx, app } = this;
        const user_id = ctx.authUser.id;
        const id = parseInt(ctx.request.body.id);
        if (!id) return ctx.throw(400, '缺少留言id');
        const c = await app.model.QuestionComment.findByPk(id);
        if (!c || c.user_id !== user_id) return ctx.throw(404, '留言不存在');
        await app.model.QuestionComment.destroy({ where: { id } });
        ctx.apiSuccess('删除成功');
    }
}

module.exports = QuestionActionController;
