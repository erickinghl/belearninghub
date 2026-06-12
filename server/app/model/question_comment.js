// app/model/question_comment.js —— 题目留言/讨论
module.exports = app => {
    const { INTEGER, STRING, TINYINT, DATE } = app.Sequelize;

    const QuestionComment = app.model.define('question_comment', {
        id: { type: INTEGER(20), primaryKey: true, autoIncrement: true },
        user_id: { type: INTEGER, allowNull: false, defaultValue: 0 },
        question_id: { type: INTEGER, allowNull: false, defaultValue: 0 },
        content: { type: STRING(1000), allowNull: false, defaultValue: '', comment: '留言内容' },
        like_count: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '点赞数' },
        status: { type: TINYINT, allowNull: false, defaultValue: 1, comment: '1正常 0隐藏' },
        created_time: DATE,
        updated_time: DATE
    });

    return QuestionComment;
};
