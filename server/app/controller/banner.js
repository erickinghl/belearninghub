'use strict';

const Controller = require('egg').Controller;

class BannerController extends Controller {
    // 新增/更新轮播图
    async save() {
        const { ctx, app } = this;
        const body = Object.assign({}, ctx.request.body);
        const data = {
            title: body.title || '',
            cover: body.cover || '',
            video_id: 0,
            course_id: body.course_id || 0,
            link: body.link || ''
        };
        let res;
        if (body.id) {
            await app.model.Banner.update(data, { where: { id: body.id } });
            res = await app.model.Banner.findByPk(body.id);
        } else {
            res = await app.model.Banner.create(data);
        }
        ctx.apiSuccess(res);
    }

    // 轮播图列表
    async list() {
        const { ctx, app } = this;
        const rows = await app.model.Banner.findAll({ order: [['id', 'DESC']] });
        ctx.apiSuccess(rows);
    }

    // 删除
    async destroy() {
        const { ctx, app } = this;
        const id = ctx.request.body.id;
        if (!id) return ctx.throw(400, '缺少id');
        await app.model.Banner.destroy({ where: { id } });
        ctx.apiSuccess('删除成功');
    }
}

module.exports = BannerController;
