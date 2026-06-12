// app/model/user_question.js —— 按单题记录用户作答（题号宫格/错题/收藏的基础）
module.exports = app => {
    const { INTEGER, DATE, TEXT, TINYINT } = app.Sequelize;

    const UserQuestion = app.model.define('user_question', {
        id: {
            type: INTEGER(20),
            primaryKey: true,
            autoIncrement: true
        },
        user_id: { type: INTEGER, allowNull: false, defaultValue: 0 },
        testpaper_id: { type: INTEGER, allowNull: false, defaultValue: 0 },
        question_id: { type: INTEGER, allowNull: false, defaultValue: 0 },
        answer: { type: TEXT('long'), allowNull: true },
        is_right: { type: TINYINT, allowNull: false, defaultValue: 0, comment: '1对0错' },
        fava: { type: TINYINT, allowNull: false, defaultValue: 0, comment: '是否收藏该题' },
        created_time: DATE,
        updated_time: DATE
    });

    return UserQuestion;
};
