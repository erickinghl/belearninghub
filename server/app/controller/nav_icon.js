'use strict';

const Controller = require('egg').Controller;

class NavIconController extends Controller {
    // 后台：图标列表（全部，含隐藏，按 sort 倒序）
    async adminList() {
        const { ctx, app } = this;
        const rows = await app.model.NavIcon.findAll({
            order: [['sort', 'DESC'], ['id', 'ASC']]
        });
        ctx.apiSuccess(rows);
    }

    // 后台：新增 / 编辑
    async save() {
        const { ctx, app } = this;
        // 必须在 ctx.validate 之前快照 body：valparams 的 validate 会就地过滤掉未声明字段
        const body = Object.assign({}, ctx.request.body);
        ctx.validate({
            name: { required: true, type: 'string', desc: '图标名称' }
        });
        const data = {
            name: body.name,
            emoji: body.emoji || '⭐',
            image_url: body.image_url || '',
            bg_color: body.bg_color || '#e8f3ff',
            jump_type: body.jump_type === 'url' ? 'url' : 'module',
            jump_value: body.jump_value || '',
            sort: body.sort ? parseInt(body.sort) : 0,
            status: (body.status === 0 || body.status === '0') ? 0 : 1
        };
        if (body.id) {
            await app.model.NavIcon.update(data, { where: { id: body.id } });
            return ctx.apiSuccess('更新成功');
        }
        const res = await app.model.NavIcon.create(data);
        ctx.apiSuccess(res);
    }

    // 后台：删除
    async destroy() {
        const { ctx, app } = this;
        const id = ctx.request.body.id;
        if (!id) return ctx.throw(400, '缺少id');
        await app.model.NavIcon.destroy({ where: { id } });
        ctx.apiSuccess('已删除');
    }
}

module.exports = NavIconController;
