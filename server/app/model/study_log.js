// app/model/study_log.js —— 学习时长（按 用户+课程+日期 聚合）
module.exports = app => {
    const { INTEGER, DATE, DATEONLY } = app.Sequelize;

    const StudyLog = app.model.define('study_log', {
        id: { type: INTEGER(20), primaryKey: true, autoIncrement: true },
        user_id: { type: INTEGER, allowNull: false, defaultValue: 0 },
        course_id: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '学习的课程id' },
        study_date: { type: DATEONLY, allowNull: false, comment: '学习日期' },
        seconds: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '当天该课程累计秒数' },
        created_time: DATE,
        updated_time: DATE
    });

    return StudyLog;
};
