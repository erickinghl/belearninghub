'use strict';

module.exports = app => {
    const { STRING, INTEGER, DATE, TEXT } = app.Sequelize;

    const Note = app.model.define('note', {
        id: { type: INTEGER(20), primaryKey: true, autoIncrement: true },
        user_id: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '用户id' },
        title: { type: STRING(150), allowNull: false, defaultValue: '', comment: '笔记标题' },
        content: { type: TEXT('long'), allowNull: true, comment: '笔记内容' },
        attachments: {
            type: TEXT, allowNull: true, comment: '附件(JSON数组[{type,url,name}])',
            get() {
                const v = this.getDataValue('attachments');
                if (v === null || v === undefined || v === '') return [];
                try { return JSON.parse(v); } catch (e) { return []; }
            }
        },
        course_id: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '关联课程id' },
        question_id: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '关联题目id' },
        created_time: {
            type: DATE,
            get() {
                const v = this.getDataValue('created_time');
                return v ? (new Date(v)).getTime() : null;
            }
        },
        updated_time: {
            type: DATE,
            get() {
                const v = this.getDataValue('updated_time');
                return v ? (new Date(v)).getTime() : null;
            }
        },
    });

    return Note;
};
