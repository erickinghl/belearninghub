'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { INTEGER, STRING, DATE, TEXT } = Sequelize;
    return queryInterface.createTable('note', {
      id: { type: INTEGER(20), primaryKey: true, autoIncrement: true },
      user_id: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '用户id' },
      title: { type: STRING(150), allowNull: false, defaultValue: '', comment: '笔记标题' },
      content: { type: TEXT('long'), allowNull: true, comment: '笔记内容' },
      course_id: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '关联课程id(可选,0=不关联)' },
      created_time: DATE,
      updated_time: DATE
    });
  },

  down: queryInterface => queryInterface.dropTable('note')
};
