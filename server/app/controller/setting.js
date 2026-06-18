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

    // 公开：前端拿全局配置（默认头像 + 站点信息 + footer）
    async publicConfig() {
        const { app, ctx } = this;
        const rows = await app.model.SysSetting.findAll();
        const m = {};
        rows.forEach(r => { m[r.skey] = r.svalue; });

        // 默认头像：没设就用内置图
        let defaultAvatar = m.default_avatar || '';
        if (!defaultAvatar) {
            const { protocol } = ctx.request;
            defaultAvatar = protocol + '://' + app.config.webUrl + '/public/avatar-default.png';
        }
        // footer_links / footer_socials 是 JSON 字符串，解析成数组
        let footerLinks = [];
        try { footerLinks = JSON.parse(m.footer_links || '[]'); } catch (e) { footerLinks = []; }
        let footerSocials = [];
        try { footerSocials = JSON.parse(m.footer_socials || '[]'); } catch (e) { footerSocials = []; }

        ctx.apiSuccess({
            default_avatar: defaultAvatar,
            site_name: m.site_name || 'EduYi 易教',
            site_logo: m.site_logo || '',
            site_desc: m.site_desc || '',
            footer_links: footerLinks,
            footer_socials: footerSocials,
            contact_phone: m.contact_phone || '',
            contact_email: m.contact_email || '',
            contact_address: m.contact_address || '',
            copyright: m.copyright || '',
            icp: m.icp || '',
        });
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
