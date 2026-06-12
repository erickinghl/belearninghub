'use strict';

const Controller = require('egg').Controller;

class CategoryController extends Controller {
    // 分类列表（?type=course/testpaper，不传则全部）。按 sort 倒序
    async index() {
        const { ctx, app } = this;
        const where = {};
        if (ctx.query.type) where.type = ctx.query.type;
        const rows = await app.model.Category.findAll({
            where,
            order: [['sort', 'DESC'], ['id', 'ASC']]
        });
        ctx.apiSuccess(rows);
    }

    // 后台列表（同 index，便于后台单独取）
    async adminList() {
        return this.index();
    }

    // 后台：新增 / 编辑分类
    async save() {
        const { ctx, app } = this;
        // 先快照 body：valparams 的 validate 会就地过滤掉未声明字段
        const body = Object.assign({}, ctx.request.body);
        ctx.validate({
            title: { required: true, type: 'string', desc: '分类名称' }
        });
        const data = {
            title: body.title,
            type: body.type || 'course',
            sort: body.sort ? parseInt(body.sort) : 0,
            cover: body.cover || '',
            desc: body.desc || ''
        };
        if (body.id) {
            await app.model.Category.update(data, { where: { id: body.id } });
            return ctx.apiSuccess('更新成功');
        }
        const res = await app.model.Category.create(data);
        ctx.apiSuccess(res);
    }

    // 后台：删除分类（同时把该分类下的试卷/课程归零，避免悬挂）
    async destroy() {
        const { ctx, app } = this;
        const id = ctx.request.body.id;
        if (!id) return ctx.throw(400, '缺少id');
        const cat = await app.model.Category.findByPk(id);
        if (cat) {
            if (cat.type === 'testpaper') {
                await app.model.Testpaper.update({ category_id: 0 }, { where: { category_id: id } });
            } else {
                await app.model.Course.update({ category_id: 0 }, { where: { category_id: id } });
            }
        }
        await app.model.Category.destroy({ where: { id } });
        ctx.apiSuccess('已删除');
    }
}

module.exports = CategoryController;
