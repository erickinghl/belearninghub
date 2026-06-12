'use strict';

const Controller = require('egg').Controller;
let rules = {
    title: {
        type: 'string',
        required: true,
        desc: '作品标题'
    },
    cover: {
        type: 'string',
        required: true,
        desc: '作品封面'
    },
    category_id: {
        type: 'int',
        required: true,
        desc: '分类id'
    },
    desc: {
        type: 'string',
        required: false,
        desc: '作品描述'
    }
};
class VideoController extends Controller {
    async save() {
        const { ctx, app } = this;
        let user_id = ctx.authUser.id;
        // 参数验证
        ctx.validate(rules);

        const {
            title,
            cover,
            category_id,
            desc
        } = ctx.request.body;

        let video = await app.model.Video.create({
            title,
            cover,
            category_id,
            desc,
            user_id
        });

        ctx.apiSuccess(video);
    }

    // 指定用户的作品列表
    async index() {
        const { ctx, app } = this;

        ctx.validate({
            user_id: {
                required: true,
                type: "int",
                desc: "用户id"
            },
            page: {
                required: true,
                type: "int",
                desc: "页码"
            },
            limit: {
                required: false,
                type: "int",
                desc: "每页显示条数"
            }
        });

        let user_id = ctx.query.user_id;
        let rows = await ctx.page(app.model.Video, {
            user_id
        });

        ctx.apiSuccess(rows);
    }


    // 搜索作品
    async search() {
        const { ctx, app } = this;

        ctx.validate({
            keyword: {
                required: true,
                type: "string",
                desc: "关键字"
            },
            page: {
                required: true,
                type: "int",
                desc: "页码"
            },
            limit: {
                required: false,
                type: "int",
                desc: "每页显示条数"
            }
        });

        let keyword = ctx.query.keyword;

        let Op = app.Sequelize.Op;

        let rows = await ctx.page(app.model.Video, {
            title:{
                [Op.like]:'%'+keyword+'%'
            }
        });

        ctx.apiSuccess(rows);
    }

    // 更新作品
    async update() {
        const { ctx, app } = this;
        let user_id = ctx.authUser.id;

        ctx.validate({
            id: {
                required: true,
                type: "int",
                desc: "作品id"
            },
            ...rules
        });

        let {
            title,
            cover,
            category_id,
            desc
        } = ctx.request.body;

        let video = await app.model.Video.findOne({
            where: {
                id: ctx.params.id,
                user_id
            }
        });

        if (!video) {
            ctx.throw(404, "该记录不存在");
        }

        let res = await video.update({
            title,
            cover,
            category_id,
            desc
        });

        ctx.apiSuccess(res);
    }

    // 指定分类下的视频分页
    async list() {
        let { ctx, app } = this;

        ctx.validate({
            page: {
                required: true,
                type: "int",
                desc: "页码"
            },
            category_id: {
                required: true,
                type: "int",
                desc: "分类ID"
            }
        });

        let rows = await ctx.page(app.model.Video, {
            category_id: ctx.params.category_id
        });

        ctx.apiSuccess(rows);
    }

    // 评论列表
    async comment() {
        const { ctx, app } = this;

        ctx.validate({
            id: {
                required: true,
                desc: "作品ID",
                type: "int"
            }
        });

        const id = ctx.params.id;

        let rows = await app.model.Comment.findAll({
            where: {
                video_id: id,
                reply_id: 0
            },
            include: [{
                model: app.model.Comment,
                include: [{
                    model: app.model.User,
                    as: "send_user",
                    attributes: ['id', 'username', 'nickname', 'avatar']
                }, {
                    model: app.model.User,
                    as: "reply_user",
                    attributes: ['id', 'username', 'nickname', 'avatar']
                }]
            }, {
                model: app.model.User,
                as: "send_user",
                attributes: ['id', 'username', 'nickname', 'avatar']
            }, {
                model: app.model.User,
                as: "reply_user",
                attributes: ['id', 'username', 'nickname', 'avatar']
            }]
        });

        ctx.apiSuccess(rows);
    }

    // 视频详情
    async read() {
        const { ctx, app, service } = this;
        let currentUser = ctx.authUser;

        ctx.validate({
            id: {
                type: "int",
                required: true,
                desc: "作品ID"
            },
        });

        let { id } = ctx.params;

        let video = await app.model.Video.findOne({
            where: {
                id
            },
            include: [{
                model: app.model.VideoDetail
            }, {
                model: app.model.User,
                attributes: ['id', 'username', 'nickname', 'avatar']
            }]
        });

        // 5条热门视频
        let hot = await this.hot();

        // 是否已收藏
        let fava = false
        // 是否关注
        let follow = false

        if (currentUser) {
            fava = !!(await app.model.Fava.findOne({
                where: {
                    video_id: id,
                    user_id: currentUser.id
                }
            }))

            follow = await service.user.isFollow(currentUser.id, video.user_id);
        }

        ctx.apiSuccess({
            video,
            hot,
            fava,
            follow
        });
    }

    // 热门视频
    async hot() {
        let { ctx, app } = this;

        return await app.model.Video.findAll({
            order: [
                ['id', 'DESC'],
                ['play_count', 'DESC']
            ],
            limit: 6,
            include:[{
                model:app.model.Category
            }]
        });

    }

    // app首页列表
    async index_data(){
        this.ctx.apiSuccess(await this.hot())
    }

}

module.exports = VideoController;
