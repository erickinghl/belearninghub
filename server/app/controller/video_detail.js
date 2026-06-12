'use strict';

const Controller = require('egg').Controller;
const rules = {
    title: {
        type: 'string',
        required: true,
        desc: '视频标题'
    },
    url: {
        type: 'string',
        required: true,
        desc: '视频地址'
    },
    video_id: {
        type: 'int',
        required: true,
        desc: '所属作品ID'
    },
    desc: {
        type: 'string',
        required: true,
        desc: '描述'
    },
};
class Video_detailController extends Controller {
    async index(){
        const { ctx,app } = this;
        ctx.validate({
            video_id:{
                type:"int",
                required:true,
                desc:"作品ID"
            }
        })

        let rows = await app.model.VideoDetail.findAll({
            where:{
                video_id:ctx.params.video_id
            }
        })

        ctx.apiSuccess(rows)
    }
    async save() {
        const { ctx, app } = this;
        let user_id = ctx.authUser.id;

        ctx.validate(rules);

        let {
            title,
            url,
            video_id,
            desc
        } = ctx.request.body;

        let video = await app.model.Video.findOne({
            where: {
                id: video_id,
                user_id
            }
        });

        if (!video) {
            ctx.throw(404, '该作品不存在');
        }

        let vd = await app.model.VideoDetail.create({
            title,
            url,
            video_id,
            desc,
        });

        ctx.apiSuccess(vd);
    }

    // 修改视频
    async update() {
        const { ctx, app } = this;
        let user_id = ctx.authUser.id;

        ctx.validate({
            id: {
                required: true,
                type: "int",
                desc: "视频ID"
            },
            ...rules
        });

        let {
            title,
            url,
            video_id,
            desc
        } = ctx.request.body;

        let video = await app.model.Video.findOne({
            where: {
                user_id,
                id: video_id
            }
        });
        if (!video) {
            ctx.throw(404, '所属作品不存在');
        }

        let vd = await app.model.VideoDetail.findOne({
            where: {
                id: ctx.params.id,
                video_id
            }
        });

        if (!vd) {
            ctx.throw(404, '该记录不存在');
        }

        let res = await vd.update({
            title,
            url,
            video_id,
            desc
        });

        ctx.apiSuccess(res);
    }

    // 删除视频
    async destroy() {
        const { ctx, app } = this;
        let user_id = ctx.authUser.id;

        ctx.validate({
            id: {
                required: true,
                type: "int",
                desc: "视频ID"
            }
        });

        let { id } = ctx.request.body;

        let vd = await app.model.VideoDetail.findOne({
            where: {
                id
            },
            include: [{
                model: app.model.Video,
                where: {
                    user_id
                }
            }]
        });

        if (!vd) {
            ctx.throw(404, '该记录不存在');
        }

        await vd.destroy();

        ctx.apiSuccess('ok');
    }
}

module.exports = Video_detailController;
