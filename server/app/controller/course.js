'use strict';

const Controller = require('egg').Controller;

class CourseController extends Controller {
    // 课程列表（支持 ?category_id= & ?type= & 分页 ?page=&limit=）
    async list() {
        const { ctx, app } = this;
        const where = { status: 1 };
        if (ctx.query.category_id) where.category_id = ctx.query.category_id;
        if (ctx.query.type) where.type = ctx.query.type;

        const page = ctx.query.page ? parseInt(ctx.query.page) : 1;
        const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 10;
        const offset = (page - 1) * limit;

        const result = await app.model.Course.findAndCountAll({
            where,
            offset,
            limit,
            order: [['sort', 'DESC'], ['id', 'DESC']]
        });
        // 前端 list 页 / 查看更多 读 res.rows
        ctx.apiSuccess({ rows: result.rows, total: result.count });
    }

    // 专栏列表（前端 getColumnList → /mobile/column/list）。专栏即 type=column 的课程
    async columnList() {
        const { ctx, app } = this;
        const where = { status: 1, type: 'column' };
        if (ctx.query.category_id) where.category_id = ctx.query.category_id;

        const page = ctx.query.page ? parseInt(ctx.query.page) : 1;
        const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 10;
        const offset = (page - 1) * limit;

        const result = await app.model.Course.findAndCountAll({
            where,
            offset,
            limit,
            order: [['sort', 'DESC'], ['id', 'DESC']]
        });
        ctx.apiSuccess({ rows: result.rows, total: result.count });
    }

    // 课程详情（?id=）。返回带 isbuy 字段（是否已购买）
    async read() {
        const { ctx, app } = this;
        const id = ctx.query.id;
        if (!id) return ctx.throw(400, '缺少课程id');
        let course = await app.model.Course.findByPk(id);
        if (!course) return ctx.throw(404, '该记录不存在');
        course = JSON.parse(JSON.stringify(course));
        // 免费课程视为已购；付费课程查用户订单
        if (Number(course.price) === 0) {
            course.isbuy = true;
        } else {
            const user_id = ctx.authUser && ctx.authUser.id;
            course.isbuy = await ctx.service.order.isBuy(user_id, 'course', course.id);
        }
        ctx.apiSuccess(course);
    }

    // 专栏详情（前端 readColumn → /mobile/column/read）。专栏即 type=column 的课程
    async columnRead() {
        const { ctx, app } = this;
        const id = ctx.query.id;
        if (!id) return ctx.throw(400, '缺少专栏id');
        let column = await app.model.Course.findByPk(id);
        if (!column) return ctx.throw(404, '该记录不存在');
        column = JSON.parse(JSON.stringify(column));
        if (Number(column.price) === 0) {
            column.isbuy = true;
        } else {
            const user_id = ctx.authUser && ctx.authUser.id;
            // 专栏下单时 goods_type 传的是 column
            column.isbuy = await ctx.service.order.isBuy(user_id, 'column', column.id)
                || await ctx.service.order.isBuy(user_id, 'course', column.id);
        }
        // 专栏暂无子课程列表，返回空数组（前端目录 tab 用）
        column.column_courses = [];
        ctx.apiSuccess(column);
    }

    // 商品详情（下单页用）。type=book 时取电子书，否则取课程
    async goodsRead() {
        const { ctx, app } = this;
        if (ctx.query.type === 'book') {
            const id = ctx.query.id;
            if (!id) return ctx.throw(400, '缺少商品id');
            let book = await app.model.Book.findByPk(id);
            if (!book) return ctx.throw(404, '该记录不存在');
            book = JSON.parse(JSON.stringify(book));
            if (Number(book.price) === 0) {
                book.isbuy = true;
            } else {
                const user_id = ctx.authUser && ctx.authUser.id;
                book.isbuy = await ctx.service.order.isBuy(user_id, 'book', book.id);
            }
            return ctx.apiSuccess(book);
        }
        return this.read();
    }

    // 搜索（?keyword=）
    async search() {
        const { ctx, app } = this;
        const keyword = ctx.query.keyword || '';
        const Op = app.Sequelize.Op;
        const page = ctx.query.page ? parseInt(ctx.query.page) : 1;
        const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 10;
        const offset = (page - 1) * limit;

        const where = {
            status: 1,
            title: { [Op.like]: `%${keyword}%` }
        };
        // 前端按 tab 传 type：column=专栏；course/其它=非专栏的课程(media/video/audio)
        if (ctx.query.type === 'column') {
            where.type = 'column';
        } else if (ctx.query.type) {
            where.type = { [Op.ne]: 'column' };
        }

        const result = await app.model.Course.findAndCountAll({
            where, offset, limit,
            order: [['id', 'DESC']]
        });
        ctx.apiSuccess({ rows: result.rows, total: result.count });
    }

    // 后台：新增/更新课程
    async save() {
        const { ctx, app } = this;
        // 先取出 body（egg-valparams 会在 validate 后过滤掉未声明字段，故先拷贝）
        const body = Object.assign({}, ctx.request.body);
        ctx.validate({
            title: { required: true, type: 'string', desc: '课程标题' }
        });
        const data = {
            title: body.title,
            cover: body.cover || '',
            category_id: body.category_id || 0,
            type: body.type || 'media',
            price: body.price || 0,
            t_price: body.t_price || 0,
            content: body.content || '',
            try: body.try || '',
            desc: body.desc || '',
            study_count: body.study_count || 0,
            sort: body.sort || 0,
            status: body.status === undefined ? 1 : body.status
        };
        let course;
        if (body.id) {
            await app.model.Course.update(data, { where: { id: body.id } });
            course = await app.model.Course.findByPk(body.id);
        } else {
            course = await app.model.Course.create(data);
        }
        ctx.apiSuccess(course);
    }

    // 后台：课程列表（含下架的，全部返回）
    async adminList() {
        const { ctx, app } = this;
        const rows = await app.model.Course.findAll({
            order: [['sort', 'DESC'], ['id', 'DESC']]
        });
        ctx.apiSuccess(rows);
    }

    // 后台：删除课程
    async destroy() {
        const { ctx, app } = this;
        const id = ctx.request.body.id;
        if (!id) return ctx.throw(400, '缺少课程id');
        await app.model.Course.destroy({ where: { id } });
        ctx.apiSuccess('删除成功');
    }
}

module.exports = CourseController;
