'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { INTEGER, STRING, DATE, TEXT } = Sequelize;
    return queryInterface.createTable('testpaper', {
      id: { type: INTEGER(20), primaryKey: true, autoIncrement: true },
      title: { type: STRING(100), allowNull: false, defaultValue: '', comment: '试卷标题' },
      cover: { type: STRING, allowNull: true, defaultValue: '', comment: '封面' },
      category_id: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '分类id' },
      desc: { type: STRING(255), allowNull: true, defaultValue: '', comment: '简介' },
      question_count: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '题目数(自动统计)' },
      total_score: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '总分' },
      pass_score: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '及格分' },
      expire: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '限时(分钟,0=不限时)' },
      is_test: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '1考试模式 0练习模式' },
      sort: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '排序' },
      status: { type: INTEGER, allowNull: false, defaultValue: 1, comment: '1上架 0下架' },
      created_time: DATE,
      updated_time: DATE
    });
  },

  down: queryInterface => queryInterface.dropTable('testpaper')
};
