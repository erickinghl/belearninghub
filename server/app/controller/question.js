'use strict';

const Controller = require('egg').Controller;

// 合法题型
const TYPES = ['radio', 'checkbox', 'trueOrfalse', 'completion', 'answer'];

class QuestionController extends Controller {
    // 后台：新增/更新单题
    async save() {
        const { ctx, app } = this;
        const body = Object.assign({}, ctx.request.body);
        ctx.validate({
            testpaper_id: { required: true, desc: '所属试卷' },
            type: { required: true, type: 'string', desc: '题型' }
        });
        if (!TYPES.includes(body.type)) return ctx.throw(400, '不支持的题型');

        const data = this._normalize(body);
        let q;
        if (body.id) {
            await app.model.Question.update(data, { where: { id: body.id } });
            q = await app.model.Question.findByPk(body.id);
        } else {
            q = await app.model.Question.create(data);
        }
        await ctx.service.testpaper.refreshStats(data.testpaper_id);
        ctx.apiSuccess(q);
    }

    // 后台：删除题目
    async destroy() {
        const { ctx, app } = this;
        const id = ctx.request.body.id;
        if (!id) return ctx.throw(400, '缺少题目id');
        const q = await app.model.Question.findByPk(id);
        await app.model.Question.destroy({ where: { id } });
        if (q) await ctx.service.testpaper.refreshStats(q.testpaper_id);
        ctx.apiSuccess('删除成功');
    }

    // 后台：批量导入。body: { testpaper_id, questions: [ {type,title,options,answer,analysis,score}, ... ] }
    async batchImport() {
        const { ctx, app } = this;
        const body = Object.assign({}, ctx.request.body);
        const testpaper_id = body.testpaper_id;
        if (!testpaper_id) return ctx.throw(400, '缺少试卷id');
        let questions = body.questions;
        if (typeof questions === 'string') {
            try { questions = JSON.parse(questions); } catch (e) { return ctx.throw(400, 'questions 不是合法 JSON'); }
        }
        if (!Array.isArray(questions) || !questions.length) return ctx.throw(400, 'questions 为空');

        const rows = [];
        const errors = [];
        questions.forEach((item, i) => {
            if (!item.type || !TYPES.includes(item.type)) {
                errors.push(`第${i + 1}题：题型非法(${item.type})`);
                return;
            }
            const d = this._normalize(Object.assign({ testpaper_id }, item));
            rows.push(d);
        });
        if (!rows.length) return ctx.apiFail(errors, '没有可导入的题目');

        await app.model.Question.bulkCreate(rows);
        await ctx.service.testpaper.refreshStats(testpaper_id);
        ctx.apiSuccess({ imported: rows.length, errors });
    }

    // 把 body 规整为可入库的数据：options/answer 序列化成 JSON 字符串
    _normalize(body) {
        const toJSON = v => {
            if (v === undefined || v === null) return null;
            if (typeof v === 'string') {
                // 已是 JSON 字符串就原样存；否则当作纯文本包一层
                const s = v.trim();
                if (s === '') return null;
                if (s[0] === '[' || s[0] === '{') return s;
                return JSON.stringify(v);
            }
            return JSON.stringify(v);
        };
        // analysis_images 统一存成 JSON 数组字符串
        if (!this._normImages) this._normImages = imgs => {
            if (Array.isArray(imgs)) return JSON.stringify(imgs);
            if (typeof imgs === 'string' && imgs.trim()) {
                try { return JSON.stringify(JSON.parse(imgs)); } catch (e) { return '[]'; }
            }
            return '[]';
        };
        return {
            testpaper_id: body.testpaper_id,
            type: body.type,
            title: body.title || '',
            options: toJSON(body.options),
            answer: toJSON(body.answer),
            analysis: body.analysis || '',
            analysis_images: this._normImages(body.analysis_images),
            analysis_video: body.analysis_video || '',
            score: body.score || 0,
            sort: body.sort || 0
        };
    }
}

module.exports = QuestionController;
