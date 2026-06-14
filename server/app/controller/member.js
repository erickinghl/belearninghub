'use strict';

const Controller = require('egg').Controller;

// 后台会员管理 + 统计
class MemberController extends Controller {
    // 会员列表（搜索 ?kw= 用户名/昵称/手机；分页）
    async list() {
        const { ctx, app } = this;
        const { Op } = app.Sequelize;
        const page = ctx.query.page ? parseInt(ctx.query.page) : 1;
        const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 20;
        const offset = (page - 1) * limit;
        const kw = (ctx.query.kw || '').trim();

        const where = {};
        if (kw) {
            where[Op.or] = [
                { username: { [Op.like]: `%${kw}%` } },
                { nickname: { [Op.like]: `%${kw}%` } },
                { phone: { [Op.like]: `%${kw}%` } },
            ];
        }

        const result = await app.model.User.findAndCountAll({
            where, offset, limit,
            order: [['id', 'DESC']],
            attributes: ['id', 'username', 'nickname', 'phone', 'avatar', 'sex', 'status', 'level', 'vip_expire', 'balance', 'created_time'],
        });
        const rows = JSON.parse(JSON.stringify(result.rows));

        // 给每个会员附几个核心数字（做题数 / 订单数）
        const ids = rows.map(r => r.id);
        if (ids.length) {
            const qCounts = await app.model.UserQuestion.findAll({
                attributes: ['user_id', [app.Sequelize.fn('COUNT', app.Sequelize.col('id')), 'c']],
                where: { user_id: ids }, group: ['user_id'], raw: true,
            });
            const oCounts = await app.model.Order.findAll({
                attributes: ['user_id', [app.Sequelize.fn('COUNT', app.Sequelize.col('id')), 'c']],
                where: { user_id: ids, status: 1 }, group: ['user_id'], raw: true,
            });
            const qm = {}; qCounts.forEach(x => { qm[x.user_id] = Number(x.c); });
            const om = {}; oCounts.forEach(x => { om[x.user_id] = Number(x.c); });
            rows.forEach(r => {
                r.question_count = qm[r.id] || 0;
                r.order_count = om[r.id] || 0;
            });
        }

        ctx.apiSuccess({ rows, total: result.count });
    }

    // 会员详情：聚合该会员的全部行为数据
    async detail() {
        const { ctx, app } = this;
        const id = parseInt(ctx.query.id);
        if (!id) return ctx.throw(400, '缺少会员id');
        let user = await app.model.User.findByPk(id);
        if (!user) return ctx.throw(404, '会员不存在');
        user = JSON.parse(JSON.stringify(user));
        delete user.password;

        // 做题统计
        const doneTotal = await app.model.UserQuestion.count({ where: { user_id: id } });
        const rightTotal = await app.model.UserQuestion.count({ where: { user_id: id, is_right: 1 } });
        const favaQ = await app.model.UserQuestion.count({ where: { user_id: id, fava: 1 } });
        const wrongTotal = doneTotal - rightTotal;
        const rate = doneTotal ? Math.round(rightTotal / doneTotal * 100) : 0;

        // 考试记录
        const tests = await app.model.UserTest.findAll({
            where: { user_id: id }, order: [['id', 'DESC']], limit: 20,
        });
        const testRows = JSON.parse(JSON.stringify(tests));
        // 附试卷名
        const tpIds = [...new Set(testRows.map(t => t.testpaper_id))];
        const papers = tpIds.length ? await app.model.Testpaper.findAll({ where: { id: tpIds }, attributes: ['id', 'title'] }) : [];
        const pm = {}; JSON.parse(JSON.stringify(papers)).forEach(p => { pm[p.id] = p.title; });
        testRows.forEach(t => { t.testpaper_title = pm[t.testpaper_id] || ('试卷#' + t.testpaper_id); });

        // 订单
        const orders = await app.model.Order.findAll({
            where: { user_id: id }, order: [['id', 'DESC']], limit: 30,
        });
        const orderRows = JSON.parse(JSON.stringify(orders));
        const paidOrders = orderRows.filter(o => o.status === 1);
        const totalPay = paidOrders.reduce((s, o) => s + Number(o.price || 0), 0);

        // 笔记 / 收藏
        const noteCount = await app.model.Note.count({ where: { user_id: id } });
        const favaCount = await app.model.Fava.count({ where: { user_id: id } });

        // 充值记录
        const recharges = await app.model.RechargeLog.findAll({
            where: { user_id: id }, order: [['id', 'DESC']], limit: 30,
        });
        const rechargeRows = JSON.parse(JSON.stringify(recharges));
        const totalRecharge = rechargeRows.filter(r => Number(r.amount) > 0).reduce((s, r) => s + Number(r.amount), 0);

        // ===== 互动记录：留言 / 点赞 / 纠错（都要关联题目标题，GM 才看得懂在哪道题） =====
        const comments = JSON.parse(JSON.stringify(await app.model.QuestionComment.findAll({ where: { user_id: id }, order: [['id', 'DESC']], limit: 30 })));
        const likes = JSON.parse(JSON.stringify(await app.model.QuestionLike.findAll({ where: { user_id: id }, order: [['id', 'DESC']], limit: 30 })));
        const corrections = JSON.parse(JSON.stringify(await app.model.QuestionCorrection.findAll({ where: { user_id: id }, order: [['id', 'DESC']], limit: 30 })));

        // 一次性查出涉及的题目标题，做成 map
        const qids = [...new Set([...comments, ...likes, ...corrections].map(x => x.question_id))];
        const qmap = {};
        if (qids.length) {
            const qs = await app.model.Question.findAll({ where: { id: qids }, attributes: ['id', 'title'] });
            JSON.parse(JSON.stringify(qs)).forEach(q => { qmap[q.id] = (q.title || '').replace(/<[^>]+>/g, '').slice(0, 40); });
        }
        const qtitle = qid => qmap[qid] || ('题目#' + qid);
        comments.forEach(c => { c.question_title = qtitle(c.question_id); });
        likes.forEach(l => { l.question_title = qtitle(l.question_id); });
        const corrStatusText = ['待处理', '已采纳', '已驳回'];
        corrections.forEach(c => { c.question_title = qtitle(c.question_id); c.status_text = corrStatusText[Number(c.status)] || '待处理'; });

        ctx.apiSuccess({
            user,
            stat: {
                done_total: doneTotal,
                right_total: rightTotal,
                wrong_total: wrongTotal,
                rate,
                fava_question: favaQ,
                test_count: testRows.length,
                order_count: orderRows.length,
                paid_count: paidOrders.length,
                total_pay: totalPay.toFixed(2),
                note_count: noteCount,
                fava_count: favaCount,
                balance: Number(user.balance || 0).toFixed(2),
                total_recharge: totalRecharge.toFixed(2),
                comment_count: comments.length,
                like_count: likes.length,
                correction_count: corrections.length,
            },
            tests: testRows,
            orders: orderRows,
            recharges: rechargeRows,
            comments,
            likes,
            corrections,
        });
    }

    // 重置/修改会员密码 body: { id, password }
    async resetPassword() {
        const { ctx, app } = this;
        const body = Object.assign({}, ctx.request.body);
        const id = parseInt(body.id);
        const password = (body.password || '').trim();
        if (!id) return ctx.throw(400, '缺少会员id');
        if (!password || password.length < 6) return ctx.throw(400, '密码至少6位');
        const user = await app.model.User.findByPk(id);
        if (!user) return ctx.throw(404, '会员不存在');
        // model 的 password setter 会自动加密
        user.password = password;
        await user.save();
        ctx.apiSuccess('密码已重置');
    }

    // 启用/禁用会员 body: { id, status }
    async toggleStatus() {
        const { ctx, app } = this;
        const body = Object.assign({}, ctx.request.body);
        const id = parseInt(body.id);
        const status = parseInt(body.status) === 0 ? 0 : 1;
        if (!id) return ctx.throw(400, '缺少会员id');
        await app.model.User.update({ status }, { where: { id } });
        // 禁用时踢掉登录态
        if (status === 0) {
            try { await ctx.service.cache.remove('user_' + id); } catch (e) { /* ignore */ }
        }
        ctx.apiSuccess(status === 1 ? '已启用' : '已禁用');
    }

    // 设置会员等级/VIP body: { id, level, vip_expire }
    async setLevel() {
        const { ctx, app } = this;
        const body = Object.assign({}, ctx.request.body);
        const id = parseInt(body.id);
        if (!id) return ctx.throw(400, '缺少会员id');
        const data = { level: (body.level || '普通').trim() };
        // vip_expire 传空=清除，传日期字符串=设到期
        if (body.vip_expire !== undefined) {
            data.vip_expire = body.vip_expire ? new Date(body.vip_expire) : null;
        }
        await app.model.User.update(data, { where: { id } });
        ctx.apiSuccess('已更新会员等级');
    }

    // 后台手动充值/扣减 body: { id, amount, remark }
    async recharge() {
        const { ctx, app } = this;
        const body = Object.assign({}, ctx.request.body);
        const id = parseInt(body.id);
        const amount = parseFloat(body.amount);
        if (!id) return ctx.throw(400, '缺少会员id');
        if (isNaN(amount) || amount === 0) return ctx.throw(400, '请输入有效金额');

        const user = await app.model.User.findByPk(id);
        if (!user) return ctx.throw(404, '会员不存在');
        const before = Number(user.balance || 0);
        const after = Math.round((before + amount) * 100) / 100;
        if (after < 0) return ctx.throw(400, '余额不足，无法扣减');

        await app.model.User.update({ balance: after }, { where: { id } });
        await app.model.RechargeLog.create({
            user_id: id,
            amount,
            balance_after: after,
            type: 'admin',
            remark: (body.remark || (amount > 0 ? '后台充值' : '后台扣减')).slice(0, 200),
        });
        ctx.apiSuccess({ balance: after.toFixed(2) });
    }

    // 后台总览统计（顶部数字卡）
    async overview() {
        const { ctx, app } = this;
        const { Op } = app.Sequelize;
        const userTotal = await app.model.User.count();
        // 今日新增（created_time >= 今天 00:00）
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const todayNew = await app.model.User.count({ where: { created_time: { [Op.gte]: today } } });
        const orderPaid = await app.model.Order.count({ where: { status: 1 } });
        const paidOrders = await app.model.Order.findAll({ where: { status: 1 }, attributes: ['price'], raw: true });
        const income = paidOrders.reduce((s, o) => s + Number(o.price || 0), 0);
        const doneTotal = await app.model.UserQuestion.count();
        const testTotal = await app.model.UserTest.count();

        ctx.apiSuccess({
            user_total: userTotal,
            today_new: todayNew,
            order_paid: orderPaid,
            income: income.toFixed(2),
            question_done: doneTotal,
            test_total: testTotal,
        });
    }
}

module.exports = MemberController;
