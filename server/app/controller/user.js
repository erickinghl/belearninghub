'use strict';

const Controller = require('egg').Controller;
const crypto = require('crypto');
class UserController extends Controller {
    // 注册
    async reg() {
        const { ctx, app } = this;

        // 参数验证
        ctx.validate({
            username: {
                required: true,
                type: "string",
                desc: "用户名",
                range: {
                    min: 5,
                    max: 20
                },
            },
            password: {
                required: true,
                type: "string",
                desc: "密码"
            },
            repassword: {
                required: true,
                type: "string",
                desc: "确认密码"
            }
        });

        let { username, password, repassword } = ctx.request.body;

        if (password !== repassword) {
            return ctx.throw(400, '密码和确认密码不相同');
        }

        // 用户名是否存在
        if (await app.model.User.findOne({
            where: {
                username
            }
        })) {
            ctx.throw(400, '用户名已存在');
        }

        // 创建用户
        let user = await app.model.User.create({
            username,
            password
        });

        if (!user) {
            ctx.throw(400, '注册失败');
        }

        user = JSON.parse(JSON.stringify(user));
        delete user.password;

        ctx.apiSuccess(user);
    }


    async login() {
        const { ctx, app } = this;
        // 参数验证
        ctx.validate({
            username: {
                required: true,
                type: "string",
                desc: "用户名"
            },
            password: {
                required: true,
                type: "string",
                desc: "密码"
            }
        });
        // 获取到数据
        let { username, password } = ctx.request.body;
        // 验证用户是否存在
        let user = await app.model.User.findOne({
            where: {
                username
            }
        });

        if (!user) {
            return ctx.apiFail('当前用户不存在');
        }
        // 验证密码
        this.checkPassword(password, user.password);

        user = JSON.parse(JSON.stringify(user));

        // 生成token
        user.token = ctx.getToken(user);
        delete user.password;

        // 加入缓存中
        if (!await this.service.cache.set('user_' + user.id, user.token)) {
            ctx.throw(400, '登录失败');
        }

        ctx.apiSuccess(user);
    }

    // 验证密码
    checkPassword(password, hash_password) {
        const hmac = crypto.createHash("sha256", this.app.config.crypto.secret);
        hmac.update(password);
        if (hmac.digest("hex") !== hash_password) {
            this.ctx.throw(400, '密码错误');
        }
        return true
    }

    // 校验 token 是否有效（auth 中间件已校验，能进来即有效）→ 返回当前用户精简信息
    async checkToken() {
        const { ctx } = this;
        const u = ctx.authUser;
        ctx.apiSuccess({
            id: u.id,
            username: u.username,
            nickname: u.nickname,
            avatar: u.avatar,
            phone: u.phone,
        });
    }

    // 退出登录
    async logout() {
        const { ctx, service } = this;
        const currentUserId = ctx.authUser.id;
        if (!await service.cache.remove('user_' + currentUserId)) {
            ctx.throw(400, '退出登录失败');
        }
        ctx.apiSuccess('退出登录成功');
    }

    // 修改个人资料
    async updateInfo() {
        const { ctx, app } = this;
        const user = ctx.authUser;
        // 允许修改的字段
        const allow = ['nickname', 'avatar', 'sex', 'desc', 'email', 'phone'];
        const data = {};
        for (const k of allow) {
            if (ctx.request.body[k] !== undefined) {
                data[k] = ctx.request.body[k];
            }
        }
        // sex 字段是 enum('男','女','保密')，非法值（如旧前端的"未知"）归一化为"保密"
        if (data.sex !== undefined && !['男', '女', '保密'].includes(data.sex)) {
            data.sex = '保密';
        }
        await app.model.User.update(data, { where: { id: user.id } });
        let newUser = await app.model.User.findByPk(user.id);
        newUser = JSON.parse(JSON.stringify(newUser));
        delete newUser.password;
        ctx.apiSuccess(newUser);
    }

    // 获取手机验证码（模拟：生成6位码存 Redis 5 分钟，直接返回前端 toast 显示）
    async getCaptcha() {
        const { ctx, service } = this;
        const phone = (ctx.request.body.phone || '').trim();
        if (!/^1\d{10}$/.test(phone)) return ctx.throw(400, '请输入正确的手机号');
        // 生成 6 位验证码
        let code = '';
        for (let i = 0; i < 6; i++) code += Math.floor(Math.random() * 10);
        await service.cache.set('captcha_' + phone, code, 300); // 5 分钟有效
        // 模拟短信：把验证码原样返回，前端 toast 显示。接真短信时这里改成调用短信服务。
        ctx.apiSuccess(Number(code));
    }

    // 绑定手机号（需登录）：校验验证码后写入当前用户 phone
    async bindMobile() {
        const { ctx, app, service } = this;
        const user = ctx.authUser;
        const phone = (ctx.request.body.phone || '').trim();
        const code = (ctx.request.body.code || '').trim();
        if (!/^1\d{10}$/.test(phone)) return ctx.throw(400, '请输入正确的手机号');
        if (!code) return ctx.throw(400, '请输入验证码');
        // 校验验证码
        const saved = await service.cache.get('captcha_' + phone);
        if (saved === null || saved === undefined) return ctx.throw(400, '验证码已过期，请重新获取');
        if (String(saved) !== String(code)) return ctx.throw(400, '验证码不正确');
        // 该手机号是否已被别的账号绑定
        const exist = await app.model.User.findOne({ where: { phone } });
        if (exist && exist.id !== user.id) return ctx.throw(400, '该手机号已被绑定');
        await app.model.User.update({ phone }, { where: { id: user.id } });
        await service.cache.remove('captcha_' + phone);
        ctx.apiSuccess({ phone });
    }

    // 修改密码
    async updatePassword() {
        const { ctx, app } = this;
        ctx.validate({
            old_password: { required: true, type: 'string', desc: '原密码' },
            password: { required: true, type: 'string', desc: '新密码' },
            repassword: { required: true, type: 'string', desc: '确认新密码' }
        });
        let { old_password, password, repassword } = ctx.request.body;
        if (password !== repassword) {
            return ctx.throw(400, '新密码和确认密码不相同');
        }
        const user = await app.model.User.findByPk(ctx.authUser.id);
        // 校验原密码
        this.checkPassword(old_password, user.password);
        // 更新（User 模型有 setter 自动加密，见模型 set password）
        user.password = password;
        await user.save();
        ctx.apiSuccess('密码修改成功');
    }

    // 关注
    async follow() {
        const { ctx, app, service } = this;
        const user_id = ctx.authUser.id;

        ctx.validate({
            follow_id: {
                type: 'int',
                required: true,
                desc: '关注用户的ID'
            },
        });

        let { follow_id } = ctx.request.body;

        let follow = await app.model.Follow.findOne({
            where: {
                user_id,
                follow_id
            }
        });

        if (follow) {
            return ctx.apiFail('你已经关注过了');
        }

        if (user_id === follow_id) {
            return ctx.apiFail('不能关注自己');
        }

        if (!(await service.user.exist(follow_id))) {
            return ctx.apiFail('关注的人不存在');
        }

        let res = await app.model.Follow.create({
            user_id,
            follow_id
        });

        ctx.apiSuccess({
            status: true,
            msg: "关注成功"
        });

    }

    // 取消关注
    async unfollow() {
        const { ctx, app, service } = this;
        const user_id = ctx.authUser.id;

        ctx.validate({
            follow_id: {
                type: 'int',
                required: true,
                desc: '取消关注用户的ID'
            },
        });

        let { follow_id } = ctx.request.body;

        let follow = await app.model.Follow.findOne({
            where: {
                user_id,
                follow_id
            }
        });

        if (!follow) {
            return ctx.apiFail('你还没关注对方');
        }

        await follow.destroy();

        ctx.apiSuccess({
            status: false,
            msg: "取消关注成功"
        });
    }

    // 我的关注列表
    async follows() {
        const { ctx, app } = this;
        const user_id = ctx.authUser.id;

        let rows = await ctx.page(app.model.Follow, {
            user_id
        }, {
            include: [{
                model: app.model.User,
                as: "user_follow",
                attributes: ['id', 'nickname', 'username', 'avatar']
            }]
        });

        rows = rows.map(item => {
            return {
                id: item.user_follow.id,
                name: item.user_follow.nickname || item.user_follow.username,
                avatar: item.user_follow.avatar
            }
        });

        ctx.apiSuccess(rows);
    }

    // 我的粉丝列表
    async fens() {
        const { ctx, app } = this;
        const user_id = ctx.authUser.id;

        let rows = await ctx.page(app.model.Follow, {
            follow_id: user_id
        }, {
            include: [{
                model: app.model.User,
                as: "user_fen",
                attributes: ['id', 'nickname', 'username', 'avatar']
            }]
        });

        rows = rows.map(item => {
            return {
                id: item.user_fen.id,
                name: item.user_fen.nickname || item.user_fen.username,
                avatar: item.user_fen.avatar
            }
        });

        ctx.apiSuccess(rows);
    }

    // 统计相关数据
    async statistics() {
        const { ctx, service, app } = this;
        const user_id = ctx.authUser.id;

        let followCount = await service.user.getFollowCount(user_id);

        let videoCount = await service.user.getVideoCount(user_id);

        ctx.apiSuccess({
            followCount,
            videoCount
        });
    }

    // 获取用户相关信息
    async user_info() {
        const { ctx, app, service } = this;
        const currentUser = ctx.authUser;

        ctx.validate({
            user_id: {
                required: true,
                desc: "用户id",
                type: "int"
            }
        });

        let user_id = ctx.query.user_id;

        let res = await service.user.getUserInfo(user_id);

        let fensCount = 0;
        let followCount = 0;

        if (res) {
            followCount = await service.user.getFollowCount(user_id);
            fensCount = await service.user.getFenCount(user_id);
        }

        let follow = false;

        if (currentUser) {
            follow = await service.user.isFollow(currentUser.id, user_id);
        }

        ctx.apiSuccess({
            user: res,
            fensCount,
            followCount,
            follow
        });

    }

}

module.exports = UserController;
