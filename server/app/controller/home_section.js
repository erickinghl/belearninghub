'use strict';

const Controller = require('egg').Controller;
const TYPES = ['course', 'book', 'testpaper', 'column'];

// 后台：首页内容板块管理
class HomeSectionController extends Controller {
    async adminList() {
        const { ctx, app } = this;
        const rows = await app.model.HomeSection.findAll({ order: [['sort', 'DESC'], ['id', 'ASC']] });
        ctx.apiSuccess(rows);
    }

    async save() {
        const { ctx, app } = this;
        const body = Object.assign({}, ctx.request.body);
        ctx.validate({ title: { required: true, type: 'string', desc: '板块标题' } });
        const data = {
            title: body.title,
            source_type: TYPES.includes(body.source_type) ? body.source_type : 'course',
            limit_num: body.limit_num ? parseInt(body.limit_num) : 6,
            show_more: (body.show_more === 0 || body.show_more === '0' || body.show_more === false) ? 0 : 1,
            sort: body.sort ? parseInt(body.sort) : 0,
            status: (body.status === 0 || body.status === '0' || body.status === false) ? 0 : 1,
        };
        if (body.id) {
            await app.model.HomeSection.update(data, { where: { id: body.id } });
            return ctx.apiSuccess('更新成功');
        }
        const res = await app.model.HomeSection.create(data);
        ctx.apiSuccess(res);
    }

    async destroy() {
        const { ctx, app } = this;
        const id = ctx.request.body.id;
        if (!id) return ctx.throw(400, '缺少id');
        await app.model.HomeSection.destroy({ where: { id } });
        ctx.apiSuccess('已删除');
    }
}

module.exports = HomeSectionController;
