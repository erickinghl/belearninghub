'use strict';

module.exports = app => {
    const { STRING, INTEGER, DATE, TEXT } = app.Sequelize;

    const Question = app.model.define('question', {
        id: { type: INTEGER(20), primaryKey: true, autoIncrement: true },
        testpaper_id: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '所属试卷id' },
        // radio单选 / checkbox多选 / trueOrfalse判断 / completion填空 / answer问答
        type: { type: STRING(20), allowNull: false, defaultValue: 'radio', comment: '题型' },
        title: { type: TEXT('long'), allowNull: true, comment: '题干' },
        // options/answer 存 JSON 字符串，读取时用 getter 自动 parse
        options: {
            type: TEXT('long'), allowNull: true, comment: '选项(JSON)',
            get() { return parseJSON(this.getDataValue('options'), []); }
        },
        answer: {
            type: TEXT('long'), allowNull: true, comment: '正确答案(JSON)',
            get() { return parseJSON(this.getDataValue('answer'), null); }
        },
        analysis: { type: TEXT('long'), allowNull: true, comment: '习题解析' },
        analysis_images: {
            type: TEXT, allowNull: true, comment: '解析图片(JSON数组)',
            get() { return parseJSON(this.getDataValue('analysis_images'), []); }
        },
        analysis_video: { type: STRING(500), allowNull: true, comment: '解析视频url' },
        score: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '分值' },
        sort: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '顺序' },
        created_time: DATE,
        updated_time: DATE,
    });

    Question.associate = function () {
        Question.belongsTo(app.model.Testpaper, { foreignKey: 'testpaper_id' });
    };

    return Question;
};

// 容错 JSON.parse：非法/空值返回兜底
function parseJSON(v, fallback) {
    if (v === null || v === undefined || v === '') return fallback;
    try { return JSON.parse(v); } catch (e) { return v; }
}
