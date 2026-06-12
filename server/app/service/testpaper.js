'use strict';

const Service = require('egg').Service;

class TestpaperService extends Service {
    // 重新统计某试卷的题数 / 总分（pass_score 不动，由后台设定）
    async refreshStats(testpaper_id) {
        const { app } = this;
        const questions = await app.model.Question.findAll({ where: { testpaper_id } });
        const count = questions.length;
        const total = questions.reduce((s, q) => s + Number(q.score || 0), 0);
        await app.model.Testpaper.update(
            { question_count: count, total_score: total },
            { where: { id: testpaper_id } }
        );
        return { count, total };
    }
}

module.exports = TestpaperService;
