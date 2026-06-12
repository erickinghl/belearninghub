'use strict';

const Controller = require('egg').Controller;

class CommentController extends Controller {
    // 发布评论
    async save() {
        const { ctx, app } = this;
        const user_id = ctx.authUser.id;

        ctx.validate({
            content: {
                type: 'string',
                required: true,
                desc: '评论内容'
            },
            video_id: {
                type: 'int',
                required: true,
                desc: '视频ID'
            },
            reply_id: {
                type: 'int',
                required: true,
                desc: '回复id'
            },
            reply_user_id: {
                type: 'int',
                required: true,
                desc: '回复用户id'
            },
        });

        let {
            content,
            video_id,
            reply_id,
            reply_user_id
        } = ctx.request.body;


        if (reply_id > 0) {
            if (reply_user_id === 0) {
                return ctx.apiFail('回复用户id参数错误');
            }
            // 判断被回复评论是否存在
            let c = await app.model.Comment.findOne({
                where: {
                    id: reply_id
                }
            });

            if (!c) {
                return ctx.apiFail('被回复的评论不存在');
            }
        }

        let video = await app.model.Video.findOne({
            where: {
                id: video_id
            }
        });

        if (!video) {
            return ctx.throw(404, '该记录不存在');
        }

        let res = await app.model.Comment.create({
            content,
            video_id,
            reply_id,
            reply_user_id,
            user_id
        });

        ctx.apiSuccess(res);

    }
}

module.exports = CommentController;
