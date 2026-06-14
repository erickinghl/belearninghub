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

    // 后台：智能识别。body: { text } → 返回解析出的题目数组（仅预览，不入库）
    async parse() {
        const { ctx } = this;
        const text = (ctx.request.body.text || '').replace(/\r\n/g, '\n');
        if (!text.trim()) return ctx.throw(400, '请输入题目文本');
        const result = this._parseQuestions(text);
        ctx.apiSuccess(result);   // { questions:[...], errors:[...] }
    }

    // 文本解析器（学习通格式，基础题型）。组合题 {{ }} 暂作二期，遇到会跳过并报提示。
    // 题号：1. / 1、 / 1）  ；题型标记：【单选题】【多选题】【判断题】【填空题】【简答题】【名词解释】等
    // 选项：A. / A、 / A）   ；答案：题干括号内（ABD），或 "答案：C" / "答案：A，B，C"
    // 判断：对/错/正确/错误/T/F/True/False ；填空答案多空用 ；分隔
    // 附加字段：难易程度/难易度、答案解析/解析、知识点、课程目标、标签
    _parseQuestions(text) {
        const errors = [];
        // 先按题号把文本切成一个个题块（题号必须在行首）
        const lines = text.split('\n');
        const blocks = [];
        let buf = null;
        let inCombo = false;   // 处于 {{ }} 组合题块内时，内部的 1./2. 不拆成新题
        const reTitleStart = /^\s*(\d+)\s*[.、．）)]\s*(.*)$/;
        for (const raw of lines) {
            // 进入/离开组合题块
            if (!inCombo && raw.includes('{{')) {
                if (buf) { blocks.push(buf); buf = null; }
                // 组合题块整体作为一个 combo 块（题号取 {{ 前面的数字，若有）
                const noM = raw.match(/^\s*(\d+)\s*[.、．）)]/);
                buf = { no: noM ? parseInt(noM[1]) : (blocks.length + 1), lines: [raw], combo: true };
                if (raw.includes('}}')) { blocks.push(buf); buf = null; }   // 单行闭合
                else inCombo = true;
                continue;
            }
            if (inCombo) {
                buf.lines.push(raw);
                if (raw.includes('}}')) { blocks.push(buf); buf = null; inCombo = false; }
                continue;
            }
            const m = raw.match(reTitleStart);
            if (m) {
                if (buf) blocks.push(buf);
                buf = { no: parseInt(m[1]), lines: [m[2]] };
            } else if (buf) {
                buf.lines.push(raw);
            }
        }
        if (buf) blocks.push(buf);

        const questions = [];
        blocks.forEach((b) => {
            if (b.combo) {
                const q = this._parseComboBlock(b, errors);
                if (q) questions.push(q);
                return;
            }
            const q = this._parseOneBlock(b, errors);
            if (q) questions.push(q);
        });
        return { questions, errors };
    }

    // 解析组合题块（{{ }}）→ { type:'group', groupType, title(材料), children:[小题] }
    // 支持：阅读理解、完型填空、共用选项题、选词填空
    _parseComboBlock(b, errors) {
        const no = b.no;
        // 拼回整块文本，去掉外层 {{ }} 和首行的题号前缀（如 "6."）
        let raw = b.lines.join('\n');
        raw = raw.replace(/\{\{/, '').replace(/\}\}/, '').trim();
        raw = raw.replace(/^\s*\d+\s*[.、．）)]\s*/, '');   // 剥首行 "6."
        const lines = raw.split('\n');

        // 第一行剥题型标记【阅读理解】等
        const reTypeTag = /^\s*【\s*([^】]+?)\s*】\s*/;
        let groupName = '组合题';
        const tagM = lines[0].match(reTypeTag);
        if (tagM) { groupName = tagM[1].trim(); lines[0] = lines[0].replace(reTypeTag, ''); }

        const reSub = /^\s*(\d+)\s*[.、．）)]\s*(.*)$/;        // 小题号 1. 2.
        const reOption = /^\s*([A-Ha-h])\s*[.、．）)]\s*(.+)$/;
        const reKV = /^\s*(知识点|难易度|难易程度|难度|课程目标|标签|答案解析|解析|分析)\s*[:：]/;

        // 共用选项题：开头若干 A. B. ... 是“共用备选答案”，小题没有自己的选项
        // 选词填空：开头 A. B. ... 是备选，小题答案是 "1.A 2.F ..." 形式
        // 我们用一个通用流程：先收集材料行，遇到第一个“小题号”进入小题解析

        const material = [];
        const sharedOptions = [];
        const children = [];
        let cur = null;
        let phase = 'material';   // material → subs

        const flushSub = () => {
            if (!cur) return;
            // 推断小题答案/题型
            const c = this._finalizeSub(cur, sharedOptions);
            if (c) children.push(c);
            cur = null;
        };

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const mSub = line.match(reSub);
            const mOpt = line.match(reOption);

            if (phase === 'material') {
                // 材料阶段：行首大写字母选项=共用备选；数字小题号=进入小题
                if (mSub && !mOpt) { phase = 'subs'; /* 落到下面处理 */ }
                else {
                    if (mOpt && !reKV.test(line)) { sharedOptions.push({ letter: mOpt[1].toUpperCase(), text: mOpt[2].trim() }); continue; }
                    if (reKV.test(line)) continue; // 大题级知识点等忽略
                    material.push(line); continue;
                }
            }

            // subs 阶段
            if (mSub) {
                flushSub();
                // 行内可能直接带选项或答案（完型/选词："39.A.xx B.xx 答案：A" 或 "1.A"）
                cur = { no: mSub[1], rest: mSub[2].trim(), title: '', options: [], answerRaw: '', analysis: '' };
                this._absorbSubLine(cur, mSub[2].trim());
                continue;
            }
            if (!cur) continue;
            if (reKV.test(line)) {
                const am = line.match(/^\s*(?:答案解析|解析|分析)\s*[:：]\s*(.*)$/);
                if (am) cur.analysis = am[1].trim();
                continue; // 其它 KV 忽略
            }
            if (mOpt) { cur.options.push(mOpt[2].trim()); continue; }
            const aInline = line.match(/^\s*答案\s*[:：]\s*(.+)$/);
            if (aInline) { cur.answerRaw = aInline[1].trim(); continue; }
            // 续行接题干
            cur.title += (cur.title ? '\n' : '') + line;
        }
        flushSub();

        if (!children.length) { errors.push(`第${no}题：组合题未识别到小题`); return null; }

        const map = { '阅读理解': 'reading', '完型填空': 'cloze', '完形填空': 'cloze', '共用选项题': 'shared', '共用选项': 'shared', '选词填空': 'wordfill' };
        return {
            type: 'group',
            groupType: map[groupName] || 'reading',
            groupName,
            title: material.join('\n').trim(),
            sharedOptions: sharedOptions.map(o => o.text),   // 共用选项文本数组
            children,
            score: children.length * 3
        };
    }

    // 处理小题号后面那段（可能是 "A.x B.y 答案：A" 完型行，或 "A" 选词答案，或纯题干）
    _absorbSubLine(cur, rest) {
        // 选词填空：整行就是一个答案字母，如 "A"
        if (/^[A-Ha-h]$/.test(rest)) { cur.answerRaw = rest; cur._wordfill = true; return; }
        // 完型一行式：含多个 "A.xx B.xx" 且行尾 "答案：X"
        const ans = rest.match(/答案\s*[:：]\s*([A-Ha-h])/);
        if (ans && /[A-Ha-h]\s*[.、．）)]/.test(rest)) {
            cur.answerRaw = ans[1];
            // 抽取选项 A.xx B.yy ...
            const optPart = rest.replace(/答案\s*[:：].*$/, '');
            const re = /([A-Ha-h])\s*[.、．）)]\s*([^A-Ha-h]+?)(?=(?:[A-Ha-h]\s*[.、．）)])|$)/g;
            let m;
            while ((m = re.exec(optPart)) !== null) cur.options.push(m[2].trim());
            return;
        }
        // 行尾带答案字母（阅读理解 "What...?  B"）
        const tail = rest.match(/^(.*?)[\s　]+([A-Ha-h])\s*$/);
        if (tail) { cur.title = tail[1].trim(); cur.answerRaw = tail[2]; return; }
        // 否则当题干
        cur.title = rest;
    }

    // 规整一个小题
    _finalizeSub(cur, sharedOptions) {
        const letterToIdx = ch => ch.toUpperCase().charCodeAt(0) - 65;
        let opts = cur.options;
        // 共用选项题/选词填空：小题用共用选项
        if (!opts.length && sharedOptions.length) opts = sharedOptions.map(o => o);
        const l = (cur.answerRaw || '').replace(/[^A-Ha-h]/g, '')[0];
        const answer = l !== undefined ? letterToIdx(l) : 0;
        return {
            type: 'radio',
            title: (cur.title || '').trim() || ('小题' + cur.no),
            options: opts,
            answer,
            analysis: (cur.analysis || '').trim()
        };
    }

    // 解析单个基础题块
    _parseOneBlock(b, errors) {
        const no = b.no;
        const reTypeTag = /^\s*【\s*([^】]+?)\s*】\s*/;                       // 【单选题】等
        const reOption = /^\s*([A-Ha-h])\s*[.、．）)]\s*(.+)$/;              // A. 选项
        const reAnswer = /^\s*(?:正确)?答案\s*[:：]\s*(.+)$/;                 // 答案：xxx
        const reAnalysis = /^\s*(?:答案解析|解析|分析)\s*[:：]\s*(.*)$/;
        const reLevel = /^\s*(?:难易程度|难易度|难度)\s*[:：]\s*(.+)$/;
        const reKnow = /^\s*知识点\s*[:：]\s*(.+)$/;
        const reGoal = /^\s*课程目标\s*[:：]\s*(.+)$/;
        const reTag = /^\s*标签\s*[:：]\s*(.+)$/;

        let type = '';                  // radio/checkbox/trueOrfalse/completion/answer
        let typeName = '';              // 原始题型名（自定义题型保留）
        let titleLines = [];
        const options = [];
        let answerRaw = '';
        let analysis = '';
        let inAnalysis = false;

        // 第一行：剥题型标记
        let lines = b.lines.slice();
        let first = (lines[0] || '');
        const tagM = first.match(reTypeTag);
        if (tagM) {
            typeName = tagM[1].trim();
            const map = { '单选题': 'radio', '单选': 'radio', '多选题': 'checkbox', '多选': 'checkbox', '判断题': 'trueOrfalse', '判断': 'trueOrfalse', '填空题': 'completion', '填空': 'completion', '简答题': 'answer', '简答': 'answer', '问答题': 'answer', '问答': 'answer' };
            type = map[typeName] || 'answer';   // 自定义题型（如名词解释）按简答处理
            first = first.replace(reTypeTag, '');
        }
        lines[0] = first;

        for (const raw of lines) {
            const line = raw.trim();
            if (!line) continue;
            let m;
            if ((m = line.match(reAnswer))) { answerRaw = m[1].trim(); inAnalysis = false; continue; }
            if ((m = line.match(reAnalysis))) { analysis = m[1].trim(); inAnalysis = true; continue; }
            if (reLevel.test(line) || reKnow.test(line) || reGoal.test(line) || reTag.test(line)) { inAnalysis = false; continue; } // 这些字段当前库没有对应列，先忽略
            if ((m = line.match(reOption))) { options.push(m[2].trim()); inAnalysis = false; continue; }
            if (inAnalysis) { analysis += '\n' + line; continue; }
            titleLines.push(line);
        }

        let title = titleLines.join('\n').trim();

        // 答案也可能写在题干括号里：题干（ABD） / 题干（对）
        if (!answerRaw) {
            const paren = title.match(/[（(]\s*([A-Ha-h]{1,8}|对|错|正确|错误|[√×]|T|F|True|False)\s*[)）]\s*$/);
            if (paren) { answerRaw = paren[1].trim(); title = title.replace(/[（(]\s*[^）)]*\s*[)）]\s*$/, '（  ）').trim(); }
        }

        // 没有显式题型 → 自动推断
        if (!type) {
            if (options.length) type = answerRaw.replace(/[^A-Ha-h]/g, '').length > 1 ? 'checkbox' : 'radio';
            else if (/^(对|错|正确|错误|√|×|T|F|true|false|是|否)$/i.test(answerRaw)) type = 'trueOrfalse';
            else type = 'answer';
        }

        if (!title) { errors.push(`第${no}题：题干为空`); return null; }

        const letterToIdx = ch => ch.toUpperCase().charCodeAt(0) - 65;
        let answer = null;
        if (type === 'radio') {
            const l = answerRaw.replace(/[^A-Ha-h]/g, '')[0];
            if (l === undefined) { errors.push(`第${no}题：缺少答案`); return null; }
            answer = letterToIdx(l);
        } else if (type === 'checkbox') {
            const ls = answerRaw.replace(/[^A-Ha-h]/g, '').toUpperCase().split('');
            if (!ls.length) { errors.push(`第${no}题：缺少答案`); return null; }
            answer = [...new Set(ls.map(letterToIdx))].sort((a, b) => a - b);
        } else if (type === 'trueOrfalse') {
            if (!answerRaw) { errors.push(`第${no}题：缺少答案`); return null; }
            answer = /^(对|正确|√|T|true|是)$/i.test(answerRaw) ? 1 : 0;
        } else if (type === 'completion') {
            answer = answerRaw.split(/[；;／/｜|]/).map(s => s.trim()).filter(Boolean);
            if (!answer.length) { errors.push(`第${no}题：缺少答案`); return null; }
        } else {
            answer = answerRaw || '';
        }

        const q = {
            type,
            title,
            options: (type === 'radio' || type === 'checkbox') ? options : [],
            answer,
            analysis: analysis.trim(),
            score: (type === 'checkbox' || type === 'answer') ? 5 : (type === 'trueOrfalse' ? 2 : 3)
        };
        if (typeName && type === 'answer' && !['简答题', '简答', '问答题', '问答'].includes(typeName)) {
            q.typeName = typeName;  // 自定义题型名（如"名词解释"）展示用；入库仍按 answer
        }
        return q;
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
            if (!item.type || (!TYPES.includes(item.type) && item.type !== 'group')) {
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
        // 组合题：把 children/共用选项/子类型 打包进 options 字段（answer 存小题答案数组）
        if (body.type === 'group') {
            const pack = {
                groupType: body.groupType || 'reading',
                groupName: body.groupName || '组合题',
                sharedOptions: body.sharedOptions || [],
                children: body.children || []
            };
            return {
                testpaper_id: body.testpaper_id,
                type: 'group',
                title: body.title || '',
                options: JSON.stringify(pack),
                answer: JSON.stringify((body.children || []).map(c => c.answer)),
                analysis: body.analysis || '',
                analysis_images: '[]',
                analysis_video: '',
                score: body.score || (body.children ? body.children.length * 3 : 0),
                sort: body.sort || 0
            };
        }
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
