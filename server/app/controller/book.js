'use strict';

const Controller = require('egg').Controller;

class BookController extends Controller {
    // 电子书列表 → { rows } （前端 book-list 读 res.rows）
    async list() {
        const { ctx, app } = this;
        const where = { status: 1 };
        if (ctx.query.category_id) where.category_id = ctx.query.category_id;

        const page = ctx.query.page ? parseInt(ctx.query.page) : 1;
        const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 10;
        const offset = (page - 1) * limit;

        const result = await app.model.Book.findAndCountAll({
            where, offset, limit,
            order: [['sort', 'DESC'], ['id', 'DESC']]
        });
        ctx.apiSuccess({ rows: result.rows, total: result.count });
    }

    // 电子书详情（readBook）：返回书 + 章节列表 book_details + isbuy
    async detail() {
        const { ctx, app } = this;
        const id = ctx.query.id;
        if (!id) return ctx.throw(400, '缺少电子书id');
        let book = await app.model.Book.findByPk(id);
        if (!book) return ctx.throw(404, '该记录不存在');
        book = JSON.parse(JSON.stringify(book));

        const chapters = await app.model.BookDetail.findAll({
            where: { book_id: id },
            attributes: ['id', 'title', 'isfree', 'sort'],
            order: [['sort', 'ASC'], ['id', 'ASC']]
        });

        // 免费书视为已购；付费书查订单
        if (Number(book.price) === 0) {
            book.isbuy = true;
        } else {
            const user_id = ctx.authUser && ctx.authUser.id;
            book.isbuy = await ctx.service.order.isBuy(user_id, 'book', book.id);
        }
        book.book_details = JSON.parse(JSON.stringify(chapters));
        ctx.apiSuccess(book);
    }

    // 读某章内容（getBookDetailContent）：参数 book_id + id(章节id)
    // 返回 { menus(章节列表), content(该章内容), title(章节标题) }
    async read() {
        const { ctx, app } = this;
        const book_id = ctx.query.book_id;
        const id = ctx.query.id;
        if (!book_id || !id) return ctx.throw(400, '参数缺失');

        const book = await app.model.Book.findByPk(book_id);
        if (!book) return ctx.throw(404, '该记录不存在');

        const menus = await app.model.BookDetail.findAll({
            where: { book_id },
            attributes: ['id', 'title', 'isfree', 'sort'],
            order: [['sort', 'ASC'], ['id', 'ASC']]
        });

        const chapter = await app.model.BookDetail.findByPk(id);
        if (!chapter || Number(chapter.book_id) !== Number(book_id)) return ctx.throw(404, '该章节不存在');

        // 权限：免费章节随便读；付费章节需已购（免费书=已购，付费书查订单）
        let isbuy = Number(book.price) === 0;
        if (!isbuy) {
            const user_id = ctx.authUser && ctx.authUser.id;
            isbuy = await ctx.service.order.isBuy(user_id, 'book', book.id);
        }
        if (!chapter.isfree && !isbuy) {
            return ctx.throw(400, '请先购买该电子书');
        }

        ctx.apiSuccess({
            title: chapter.title,
            content: chapter.content || '',
            menus: JSON.parse(JSON.stringify(menus))
        });
    }

    // 我的书架（mybook）：暂无订单，返回免费书 + 已读记录。先返回全部上架免费书占位。
    async mybook() {
        const { ctx, app } = this;
        const page = ctx.query.page ? parseInt(ctx.query.page) : 1;
        const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 10;
        const offset = (page - 1) * limit;

        // 后续做订单后改成查用户已购；现在先返回免费上架书
        const result = await app.model.Book.findAndCountAll({
            where: { status: 1, price: 0 },
            offset, limit,
            order: [['id', 'DESC']]
        });
        ctx.apiSuccess({ rows: result.rows, total: result.count });
    }

    // ===== 后台 =====
    async adminList() {
        const { ctx, app } = this;
        const rows = await app.model.Book.findAll({
            order: [['sort', 'DESC'], ['id', 'DESC']]
        });
        ctx.apiSuccess(rows);
    }

    // 后台书详情（含章节完整内容，供编辑）
    async adminRead() {
        const { ctx, app } = this;
        const id = ctx.query.id;
        if (!id) return ctx.throw(400, '缺少电子书id');
        const book = await app.model.Book.findByPk(id);
        if (!book) return ctx.throw(404, '该记录不存在');
        const chapters = await app.model.BookDetail.findAll({
            where: { book_id: id },
            order: [['sort', 'ASC'], ['id', 'ASC']]
        });
        const data = JSON.parse(JSON.stringify(book));
        data.chapters = JSON.parse(JSON.stringify(chapters));
        ctx.apiSuccess(data);
    }

    async save() {
        const { ctx, app } = this;
        const body = Object.assign({}, ctx.request.body);
        ctx.validate({ title: { required: true, type: 'string', desc: '书名' } });
        const data = {
            title: body.title,
            cover: body.cover || '',
            author: body.author || '',
            category_id: body.category_id || 0,
            type: body.type || 'media',
            book_type: body.book_type || 'chapter',
            file_url: body.file_url || '',
            price: body.price || 0,
            t_price: body.t_price || 0,
            try: body.try || '',
            desc: body.desc || '',
            sub_count: body.sub_count || 0,
            sort: body.sort || 0,
            status: body.status === undefined ? 1 : body.status
        };
        let book;
        if (body.id) {
            await app.model.Book.update(data, { where: { id: body.id } });
            book = await app.model.Book.findByPk(body.id);
        } else {
            book = await app.model.Book.create(data);
        }
        ctx.apiSuccess(book);
    }

    async destroy() {
        const { ctx, app } = this;
        const id = ctx.request.body.id;
        if (!id) return ctx.throw(400, '缺少电子书id');
        await app.model.BookDetail.destroy({ where: { book_id: id } });
        await app.model.Book.destroy({ where: { id } });
        ctx.apiSuccess('删除成功');
    }

    // 后台：新增/更新章节
    async saveChapter() {
        const { ctx, app } = this;
        const body = Object.assign({}, ctx.request.body);
        ctx.validate({
            book_id: { required: true, desc: '所属书' },
            title: { required: true, type: 'string', desc: '章节标题' }
        });
        const data = {
            book_id: body.book_id,
            title: body.title,
            content: body.content || '',
            isfree: body.isfree || 0,
            sort: body.sort || 0
        };
        let chapter;
        if (body.id) {
            await app.model.BookDetail.update(data, { where: { id: body.id } });
            chapter = await app.model.BookDetail.findByPk(body.id);
        } else {
            chapter = await app.model.BookDetail.create(data);
        }
        ctx.apiSuccess(chapter);
    }

    // 后台：删除章节
    async destroyChapter() {
        const { ctx, app } = this;
        const id = ctx.request.body.id;
        if (!id) return ctx.throw(400, '缺少章节id');
        await app.model.BookDetail.destroy({ where: { id } });
        ctx.apiSuccess('删除成功');
    }
}

module.exports = BookController;
