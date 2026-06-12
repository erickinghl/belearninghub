'use strict';

const Controller = require('egg').Controller;

class FavaController extends Controller {
    // 取商品（course/column 走 Course，book 走 Book）
    async _goods(type, id) {
        const { app } = this;
        if (type === 'book') {
            return await app.model.Book.findByPk(id);
        }
        return await app.model.Course.findByPk(id);
    }

    // 收藏
    async collect() {
        const { ctx, app } = this;
        const user_id = ctx.authUser.id;
        const body = Object.assign({}, ctx.request.body);
        const goods_id = parseInt(body.goods_id);
        const type = body.type || 'course';
        if (!goods_id) return ctx.throw(400, '缺少商品id');

        const goods = await this._goods(type, goods_id);
        if (!goods) return ctx.throw(404, '商品不存在');

        const exist = await app.model.Fava.findOne({
            where: { user_id, video_id: goods_id, goods_type: type }
        });
        if (exist) return ctx.apiSuccess({ status: true, msg: '已收藏' });

        await app.model.Fava.create({ user_id, video_id: goods_id, goods_type: type });
        ctx.apiSuccess({ status: true, msg: '收藏成功' });
    }

    // 取消收藏
    async uncollect() {
        const { ctx, app } = this;
        const user_id = ctx.authUser.id;
        const body = Object.assign({}, ctx.request.body);
        const goods_id = parseInt(body.goods_id);
        const type = body.type || 'course';
        if (!goods_id) return ctx.throw(400, '缺少商品id');

        await app.model.Fava.destroy({
            where: { user_id, video_id: goods_id, goods_type: type }
        });
        ctx.apiSuccess({ status: false, msg: '取消收藏成功' });
    }

    // 我的收藏列表 → 前端按 item.goods / item.type 渲染 course-list
    async userFava() {
        const { ctx, app } = this;
        const user_id = ctx.authUser.id;
        const page = ctx.query.page ? parseInt(ctx.query.page) : 1;
        const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 10;
        const offset = (page - 1) * limit;

        const result = await app.model.Fava.findAndCountAll({
            where: { user_id },
            offset, limit,
            order: [['id', 'DESC']]
        });

        // 按类型分组取商品详情
        const favs = JSON.parse(JSON.stringify(result.rows));
        const courseIds = favs.filter(f => f.goods_type !== 'book').map(f => f.video_id);
        const bookIds = favs.filter(f => f.goods_type === 'book').map(f => f.video_id);

        let courses = courseIds.length ? await app.model.Course.findAll({ where: { id: courseIds } }) : [];
        let books = bookIds.length ? await app.model.Book.findAll({ where: { id: bookIds } }) : [];
        courses = JSON.parse(JSON.stringify(courses));
        books = JSON.parse(JSON.stringify(books));
        const cmap = {}; courses.forEach(c => { cmap[c.id] = c; });
        const bmap = {}; books.forEach(b => { bmap[b.id] = b; });

        const rows = favs.map(f => {
            const goods = f.goods_type === 'book' ? bmap[f.video_id] : cmap[f.video_id];
            if (!goods) return null;
            return { type: f.goods_type, goods };
        }).filter(Boolean);

        ctx.apiSuccess({ rows, total: result.count });
    }
}

module.exports = FavaController;
