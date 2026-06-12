'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { INTEGER, DATE, TEXT } = Sequelize;
    return queryInterface.createTable('user_test', {
      id: { type: INTEGER(20), primaryKey: true, autoIncrement: true },
      user_id: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '用户id' },
      testpaper_id: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '试卷id' },
      value: { type: TEXT('long'), allowNull: true, comment: '用户答案(JSON)' },
      result: { type: TEXT('long'), allowNull: true, comment: '判分明细(JSON:每题对错+正确答案+解析)' },
      score: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '得分' },
      total_score: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '满分(快照)' },
      is_pass: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '1及格 0不及格' },
      created_time: DATE,
      updated_time: DATE
    });
  },

  down: queryInterface => queryInterface.dropTable('user_test')
};
