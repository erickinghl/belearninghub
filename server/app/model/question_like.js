// app/model/question_like.js —— 题目点赞
module.exports = app => {
    const { INTEGER, DATE } = app.Sequelize;

    const QuestionLike = app.model.define('question_like', {
        id: { type: INTEGER(20), primaryKey: true, autoIncrement: true },
        user_id: { type: INTEGER, allowNull: false, defaultValue: 0 },
        question_id: { type: INTEGER, allowNull: false, defaultValue: 0 },
        created_time: DATE,
        updated_time: DATE
    });

    return QuestionLike;
};
