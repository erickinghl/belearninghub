'use strict';

const Controller = require('egg').Controller;

class OrderController extends Controller {
    // 取商品信息（course/column 走 Course 表，book 走 Book 表）
    async _goods(type, id) {
        const { app } = this;
        if (type === 'book') {
            return await app.model.Book.findByPk(id);
        }
        return await app.model.Course.findByPk(id);
    }

    // 生成订单号
    _genNo(user_id) {
        // 时间戳 + 用户id + 4位随机
        const rand = ('0000' + Math.floor(Math.random() * 10000)).slice(-4);
        return `${Date.now()}${user_id}${rand}`;
    }

    // 免费学习：免费商品直接生成已支付订单
    async learn() {
        const { ctx } = this;
        const user_id = ctx.authUser.id;
        const body = Object.assign({}, ctx.request.body);
        const goods_id = body.goods_id;
        const type = body.type || 'course';
        if (!goods_id) return ctx.throw(400, '缺少商品id');

        const goods = await this._goods(type, goods_id);
        if (!goods) return ctx.throw(404, '商品不存在');
        if (Number(goods.price) !== 0) return ctx.throw(400, '该商品需付费购买');

        const order = await this._ensureOrder(user_id, type, goods, 0);
        // 免费 → 直接置为已支付
        if (Number(order.status) !== 1) {
            await this.app.model.Order.update(
                { status: 1, pay_time: new Date(), pay_method: 'free' },
                { where: { id: order.id } }
            );
        }
        ctx.apiSuccess('学习成功');
    }

    // 创建订单（付费）→ 返回 { no }
    async save() {
        const { ctx } = this;
        const user_id = ctx.authUser.id;
        const body = Object.assign({}, ctx.request.body);
        const goods_id = body.goods_id;
        const type = body.type || 'course';
        if (!goods_id) return ctx.throw(400, '缺少商品id');

        const goods = await this._goods(type, goods_id);
        if (!goods) return ctx.throw(404, '商品不存在');

        // 已购买过则直接返回（避免重复下单）
        const bought = await ctx.service.order.isBuy(user_id, type, goods_id);
        if (bought) return ctx.throw(400, '你已购买该商品');

        const order = await this._ensureOrder(user_id, type, goods, Number(goods.price));
        ctx.apiSuccess({ no: order.no, price: order.price });
    }

    // 复用未支付订单或新建
    async _ensureOrder(user_id, type, goods, price) {
        const { app } = this;
        let order = await app.model.Order.findOne({
            where: { user_id, goods_type: type, goods_id: goods.id, status: 0 },
            order: [['id', 'DESC']]
        });
        if (!order) {
            order = await app.model.Order.create({
                no: this._genNo(user_id),
                user_id,
                goods_type: type,
                goods_id: goods.id,
                goods_title: goods.title,
                price,
                status: 0
            });
        }
        return order;
    }

    // 模拟支付：把订单标记为已支付（替代真实微信支付）
    async mockpay() {
        const { ctx, app } = this;
        const user_id = ctx.authUser.id;
        const no = ctx.request.body.no;
        if (!no) return ctx.throw(400, '缺少订单号');
        const order = await app.model.Order.findOne({ where: { no } });
        if (!order || order.user_id !== user_id) return ctx.throw(404, '订单不存在');
        if (Number(order.status) === 1) return ctx.apiSuccess('该订单已支付');
        await app.model.Order.update(
            { status: 1, pay_time: new Date(), pay_method: 'mock' },
            { where: { id: order.id } }
        );
        ctx.apiSuccess('支付成功');
    }

    // 我的订单列表
    async list() {
        const { ctx, app } = this;
        const user_id = ctx.authUser.id;
        const page = ctx.query.page ? parseInt(ctx.query.page) : 1;
        const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 20;
        const offset = (page - 1) * limit;
        const where = { user_id };
        if (ctx.query.status !== undefined && ctx.query.status !== '') where.status = ctx.query.status;

        const result = await app.model.Order.findAndCountAll({
            where, offset, limit,
            order: [['id', 'DESC']]
        });
        // 适配前端 order-list：goods(商品名)、status 字符串(success/pendding)、created_time 格式化
        const rows = result.rows.map(o => {
            const r = JSON.parse(JSON.stringify(o));
            r.goods = r.goods_title;
            r.status = Number(r.status) === 1 ? 'success' : (Number(r.status) === 2 ? 'cancel' : 'pendding');
            r.created_time = fmtTime(r.created_time);
            return r;
        });
        ctx.apiSuccess({ rows, total: result.count });
    }

    // 我的学习记录（在学）→ 已支付的课程/专栏，带 progress
    // 前端 learn 页按 tab 传 type：course 课程 / column 专栏
    async history() {
        const { ctx, app } = this;
        const user_id = ctx.authUser.id;
        const page = ctx.query.page ? parseInt(ctx.query.page) : 1;
        const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 10;
        const offset = (page - 1) * limit;

        // 已支付订单里的商品类型：column=专栏；其它=课程
        const goodsType = ctx.query.type === 'column' ? 'column' : 'course';
        const orders = await app.model.Order.findAll({
            where: { user_id, status: 1, goods_type: goodsType },
            order: [['id', 'DESC']]
        });

        // 取对应课程详情
        const ids = [...new Set(orders.map(o => o.goods_id))];
        let courses = ids.length
            ? await app.model.Course.findAll({ where: { id: ids } })
            : [];
        courses = JSON.parse(JSON.stringify(courses));
        const cmap = {};
        courses.forEach(c => { cmap[c.id] = c; });

        // 课程 tab 显示非专栏，专栏 tab 显示 column
        let rows = orders.map(o => {
            const c = cmap[o.goods_id];
            if (!c) return null;
            if (goodsType === 'column' && c.type !== 'column') return null;
            if (goodsType === 'course' && c.type === 'column') return null;
            return Object.assign({}, c, { progress: 0, isbuy: true });
        }).filter(Boolean);

        // 分页
        rows = rows.slice(offset, offset + limit);
        ctx.apiSuccess({ rows, total: rows.length });
    }

    // 更新学习进度（占位：记录但不持久化进度字段，避免 404）
    async historyUpdate() {
        const { ctx } = this;
        ctx.apiSuccess('ok');
    }

    // ===== 后台 =====
    async adminList() {
        const { ctx, app } = this;
        const page = ctx.query.page ? parseInt(ctx.query.page) : 1;
        const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 50;
        const offset = (page - 1) * limit;
        const where = {};
        if (ctx.query.status !== undefined && ctx.query.status !== '') where.status = ctx.query.status;

        const result = await app.model.Order.findAndCountAll({
            where, offset, limit,
            order: [['id', 'DESC']]
        });
        // 附用户名
        const uids = [...new Set(result.rows.map(r => r.user_id))];
        const users = uids.length ? await app.model.User.findAll({ where: { id: uids }, attributes: ['id', 'username', 'nickname'] }) : [];
        const umap = {};
        users.forEach(u => { umap[u.id] = u; });
        const rows = result.rows.map(r => {
            const o = JSON.parse(JSON.stringify(r));
            const u = umap[r.user_id];
            o.username = u ? (u.nickname || u.username) : ('用户#' + r.user_id);
            return o;
        });
        ctx.apiSuccess({ rows, total: result.count });
    }

    // 后台手动确认支付 / 关闭订单
    async adminUpdateStatus() {
        const { ctx, app } = this;
        const body = Object.assign({}, ctx.request.body);
        const id = body.id;
        const status = Number(body.status);
        if (!id || isNaN(status)) return ctx.throw(400, '参数缺失');
        const data = { status };
        if (status === 1) { data.pay_time = new Date(); data.pay_method = 'admin'; }
        await app.model.Order.update(data, { where: { id } });
        ctx.apiSuccess('已更新');
    }
}

// 时间戳 → 'YYYY-MM-DD HH:mm'
function fmtTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const p = n => (n < 10 ? '0' + n : '' + n);
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

module.exports = OrderController;
