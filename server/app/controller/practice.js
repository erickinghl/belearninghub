'use strict';

const Controller = require('egg').Controller;

// 练习模式：题号宫格 + 单题作答记录 + 统计
class PracticeController extends Controller {
    // 进入练习 ?id=  → 返回试卷 + 全部题目（含正确答案/解析，练习模式即时判对错）+ 每题历史作答
    async read() {
        const { ctx, app } = this;
        const id = ctx.query.id;
        if (!id) return ctx.throw(400, '缺少试卷id');
        const user_id = ctx.authUser.id;

        const paper = await app.model.Testpaper.findByPk(id);
        if (!paper) return ctx.throw(404, '该试卷不存在');

        const questions = await app.model.Question.findAll({
            where: { testpaper_id: id },
            order: [['sort', 'ASC'], ['id', 'ASC']]
        });

        // 该用户在本卷的历史作答
        const records = await app.model.UserQuestion.findAll({
            where: { user_id, testpaper_id: id }
        });
        const rmap = {};
        records.forEach(r => { rmap[r.question_id] = r; });

        const list = questions.map((q, idx) => {
            const r = rmap[q.id];
            return {
                no: idx + 1,
                id: q.id,
                type: q.type,
                title: q.title,
                options: q.options,
                answer: q.answer,        // 练习模式即时下发正确答案
                analysis: q.analysis,
                analysis_images: q.analysis_images,
                analysis_video: q.analysis_video,
                score: q.score,
                // 历史：done 是否做过, is_right 对错, fava 收藏, my_answer 上次作答
                done: r ? 1 : 0,
                is_right: r ? r.is_right : 0,
                fava: r ? r.fava : 0,
                my_answer: r ? r.answer : null
            };
        });

        ctx.apiSuccess({
            id: paper.id,
            title: paper.title,
            question_count: questions.length,
            questions: list
        });
    }

    // 提交单题 → 判对错并记录（幂等：再次作答覆盖）
    async submitOne() {
        const { ctx, app } = this;
        const user_id = ctx.authUser.id;
        const body = Object.assign({}, ctx.request.body);
        const question_id = parseInt(body.question_id);
        if (!question_id) return ctx.throw(400, '缺少题目id');

        const q = await app.model.Question.findByPk(question_id);
        if (!q) return ctx.throw(404, '题目不存在');

        let is_right;
        if (q.type === 'group') {
            // 组合题：逐小题比对客户端答案数组（也可信任客户端传来的 is_right）
            let correct = body.is_right;
            if (correct === undefined) {
                let answers = [];
                try { answers = JSON.parse(q.answer); } catch (e) { answers = []; }
                const my = Array.isArray(body.answer) ? body.answer : [];
                correct = answers.length > 0 && answers.every((a, i) => Number(my[i]) === Number(a)) ? 1 : 0;
            }
            is_right = correct ? 1 : 0;
        } else {
            // 判对错（复用 judge 服务）
            const verdict = ctx.service.judge.judgeOne(q, body.answer);
            // 问答题无法自动判，按做过处理（is_right=0 不计错，可后续人工）
            is_right = verdict.manual ? 1 : (verdict.correct ? 1 : 0);
        }

        const answerStr = typeof body.answer === 'string' ? body.answer : JSON.stringify(body.answer);

        const exist = await app.model.UserQuestion.findOne({
            where: { user_id, question_id }
        });
        if (exist) {
            await app.model.UserQuestion.update(
                { answer: answerStr, is_right, testpaper_id: q.testpaper_id },
                { where: { id: exist.id } }
            );
        } else {
            await app.model.UserQuestion.create({
                user_id, question_id, testpaper_id: q.testpaper_id,
                answer: answerStr, is_right, fava: 0
            });
        }

        ctx.apiSuccess({
            is_right,
            answer: q.answer,
            analysis: q.analysis
        });
    }

    // 统计 ?id= → {total, done, right, wrong, undone, rate}
    async stat() {
        const { ctx, app } = this;
        const user_id = ctx.authUser.id;
        const id = ctx.query.id;
        if (!id) return ctx.throw(400, '缺少试卷id');

        const total = await app.model.Question.count({ where: { testpaper_id: id } });
        const records = await app.model.UserQuestion.findAll({
            where: { user_id, testpaper_id: id }
        });
        const done = records.length;
        const right = records.filter(r => Number(r.is_right) === 1).length;
        const wrong = done - right;
        const undone = total - done;
        const rate = done > 0 ? Math.round((right / done) * 100) : 0;

        ctx.apiSuccess({ total, done, right, wrong, undone, rate });
    }

    // 收藏/取消收藏单题（题目级收藏，与课程收藏分开）
    async fava() {
        const { ctx, app } = this;
        const user_id = ctx.authUser.id;
        const body = Object.assign({}, ctx.request.body);
        const question_id = parseInt(body.question_id);
        if (!question_id) return ctx.throw(400, '缺少题目id');

        const q = await app.model.Question.findByPk(question_id);
        if (!q) return ctx.throw(404, '题目不存在');

        let rec = await app.model.UserQuestion.findOne({ where: { user_id, question_id } });
        if (!rec) {
            rec = await app.model.UserQuestion.create({
                user_id, question_id, testpaper_id: q.testpaper_id, fava: 1
            });
            return ctx.apiSuccess({ fava: 1 });
        }
        const newFava = Number(rec.fava) === 1 ? 0 : 1;
        await app.model.UserQuestion.update({ fava: newFava }, { where: { id: rec.id } });
        ctx.apiSuccess({ fava: newFava });
    }

    // 取一批题目并拼成 practice 页可渲染的结构（复用 read 的字段约定）
    async _buildQuestions(records) {
        const { app } = this;
        const qids = records.map(r => r.question_id);
        if (!qids.length) return [];
        const questions = await app.model.Question.findAll({ where: { id: qids } });
        const qmap = {};
        JSON.parse(JSON.stringify(questions)).forEach(q => { qmap[q.id] = q; });
        const rmap = {};
        records.forEach(r => { rmap[r.question_id] = r; });
        // 按 records 顺序输出
        return records.map((r, idx) => {
            const q = qmap[r.question_id];
            if (!q) return null;
            return {
                no: idx + 1,
                id: q.id,
                type: q.type,
                title: q.title,
                options: q.options,
                answer: q.answer,
                analysis: q.analysis,
                analysis_images: q.analysis_images,
                analysis_video: q.analysis_video,
                score: q.score,
                done: 1,
                is_right: r.is_right,
                fava: r.fava,
                my_answer: r.answer
            };
        }).filter(Boolean);
    }

    // 我的错题本：is_right=0 的题
    async wrongList() {
        const { ctx, app } = this;
        const user_id = ctx.authUser.id;
        const records = await app.model.UserQuestion.findAll({
            where: { user_id, is_right: 0 },
            order: [['updated_time', 'DESC'], ['id', 'DESC']]
        });
        const questions = await this._buildQuestions(records);
        ctx.apiSuccess({ title: '我的错题', question_count: questions.length, questions });
    }

    // 我的收藏题：fava=1 的题
    async favaList() {
        const { ctx, app } = this;
        const user_id = ctx.authUser.id;
        const records = await app.model.UserQuestion.findAll({
            where: { user_id, fava: 1 },
            order: [['updated_time', 'DESC'], ['id', 'DESC']]
        });
        const questions = await this._buildQuestions(records);
        ctx.apiSuccess({ title: '我的收藏题', question_count: questions.length, questions });
    }

    // 从错题本移除（答对后或手动）→ 这里提供手动移除：把 is_right 置 1（视为已掌握，不再算错题）
    async removeWrong() {
        const { ctx, app } = this;
        const user_id = ctx.authUser.id;
        const question_id = parseInt(ctx.request.body.question_id);
        if (!question_id) return ctx.throw(400, '缺少题目id');
        await app.model.UserQuestion.update(
            { is_right: 1 },
            { where: { user_id, question_id } }
        );
        ctx.apiSuccess('已移出错题本');
    }
}

module.exports = PracticeController;
