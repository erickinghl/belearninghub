'use strict';

const Service = require('egg').Service;

/**
 * 自动判分。
 * @param {object} question 题目（model 实例，answer/options 已被 getter parse 成对象）
 * @param {*} userValue 用户答案
 * 各题型 answer / userValue 约定：
 *  - radio:       answer = 选项索引(number)，          userValue = number
 *  - checkbox:    answer = 索引数组[number]，           userValue = number[]
 *  - trueOrfalse: answer = 0/1 (或 true/false)，        userValue = 0/1
 *  - completion:  answer = 每空答案数组[string]，       userValue = string[]
 *  - answer:      不自动判分（返回 correct=null，得分0，待人工）
 */
class JudgeService extends Service {
    judgeOne(question, userValue) {
        const type = question.type;
        const answer = question.answer;
        const full = Number(question.score || 0);

        let correct = false;
        switch (type) {
            case 'radio':
                correct = this._eqScalar(userValue, answer);
                break;
            case 'trueOrfalse':
                correct = this._eqBool(userValue, answer);
                break;
            case 'checkbox':
                correct = this._eqSet(userValue, answer);
                break;
            case 'completion':
                correct = this._eqBlanks(userValue, answer);
                break;
            case 'answer':
                // 问答题不自动判分
                return { correct: null, gain: 0, manual: true };
            default:
                correct = false;
        }
        return { correct, gain: correct ? full : 0, manual: false };
    }

    _eqScalar(a, b) {
        return Number(a) === Number(b);
    }

    _eqBool(a, b) {
        const norm = v => {
            if (v === true || v === 1 || v === '1' || v === 'true') return 1;
            return 0;
        };
        return norm(a) === norm(b);
    }

    // 多选：集合相等（不计顺序），全对才得分。空答案不得分
    _eqSet(a, b) {
        const A = Array.isArray(a) ? a.map(Number).sort((x, y) => x - y) : [];
        const B = Array.isArray(b) ? b.map(Number).sort((x, y) => x - y) : [];
        if (B.length === 0 || A.length !== B.length) return false;
        return A.every((v, i) => v === B[i]);
    }

    // 填空：逐空比对，忽略首尾空格与大小写，全部正确才得分
    _eqBlanks(a, b) {
        const A = Array.isArray(a) ? a : (a === undefined || a === null ? [] : [a]);
        const B = Array.isArray(b) ? b : (b === undefined || b === null ? [] : [b]);
        if (A.length !== B.length || B.length === 0) return false;
        const clean = s => String(s == null ? '' : s).trim().toLowerCase();
        return B.every((ans, i) => {
            // 单空可配置多个可接受答案：answer[i] 为数组时任一匹配即可
            if (Array.isArray(ans)) return ans.some(x => clean(x) === clean(A[i]));
            return clean(ans) === clean(A[i]);
        });
    }
}

module.exports = JudgeService;
