// app/model/question_correction.js —— 题目答案纠错反馈
module.exports = app => {
    const { INTEGER, STRING, DATE, TINYINT } = app.Sequelize;

    const QuestionCorrection = app.model.define('question_correction', {
        id: { type: INTEGER(20), primaryKey: true, autoIncrement: true },
        user_id: { type: INTEGER, allowNull: false, defaultValue: 0 },
        question_id: { type: INTEGER, allowNull: false, defaultValue: 0 },
        testpaper_id: { type: INTEGER, allowNull: false, defaultValue: 0 },
        content: { type: STRING(500), allowNull: false, defaultValue: '', comment: '纠错说明' },
        images: {
            type: app.Sequelize.TEXT, allowNull: true, comment: '纠错图片(JSON数组)',
            get() {
                const v = this.getDataValue('images');
                if (v === null || v === undefined || v === '') return [];
                try { return JSON.parse(v); } catch (e) { return []; }
            }
        },
        status: { type: TINYINT, allowNull: false, defaultValue: 0, comment: '0待处理 1已采纳 2已驳回' },
        reply: { type: STRING(500), allowNull: true, defaultValue: '', comment: '后台回复' },
        created_time: DATE,
        updated_time: DATE
    });

    return QuestionCorrection;
};
