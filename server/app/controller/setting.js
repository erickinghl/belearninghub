'use strict';

const Controller = require('egg').Controller;

class SettingController extends Controller {
    // 后台：读取所有设置（键值对象）
    async adminList() {
        const { app, ctx } = this;
        const rows = await app.model.SysSetting.findAll();
        const obj = {};
        rows.forEach(r => { obj[r.skey] = r.svalue; });
        ctx.apiSuccess(obj);
    }

    // 公开：前端拿全局配置（默认头像等）
    async publicConfig() {
        const { app, ctx } = this;
        const da = await app.model.SysSetting.findOne({ where: { skey: 'default_avatar' } });
        let defaultAvatar = da && da.svalue ? da.svalue : '';
        // 后台没传则用内置默认头像（绝对地址，App/H5 都能用）
        if (!defaultAvatar) {
            const { protocol } = ctx.request;
            defaultAvatar = protocol + '://' + app.config.webUrl + '/public/avatar-default.png';
        }
        ctx.apiSuccess({ default_avatar: defaultAvatar });
    }

    // 后台：保存某个设置 body: { skey, svalue }
    async save() {
        const { app, ctx } = this;
        const body = Object.assign({}, ctx.request.body);
        const skey = (body.skey || '').trim();
        if (!skey) return ctx.throw(400, '缺少配置键');
        const svalue = body.svalue || '';
        const exist = await app.model.SysSetting.findOne({ where: { skey } });
        if (exist) {
            await app.model.SysSetting.update({ svalue }, { where: { skey } });
        } else {
            await app.model.SysSetting.create({ skey, svalue });
        }
        ctx.apiSuccess('保存成功');
    }
}

module.exports = SettingController;
