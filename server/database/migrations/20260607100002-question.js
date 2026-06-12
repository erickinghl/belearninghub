'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { INTEGER, STRING, DATE, TEXT } = Sequelize;
    return queryInterface.createTable('question', {
      id: { type: INTEGER(20), primaryKey: true, autoIncrement: true },
      testpaper_id: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '所属试卷id' },
      // radio单选 / checkbox多选 / trueOrfalse判断 / completion填空 / answer问答
      type: { type: STRING(20), allowNull: false, defaultValue: 'radio', comment: '题型' },
      title: { type: TEXT('long'), allowNull: true, comment: '题干(富文本)' },
      options: { type: TEXT('long'), allowNull: true, comment: '选项(JSON数组)' },
      answer: { type: TEXT('long'), allowNull: true, comment: '正确答案(JSON)' },
      analysis: { type: TEXT('long'), allowNull: true, comment: '习题解析' },
      score: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '该题分值' },
      sort: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '题目顺序' },
      created_time: DATE,
      updated_time: DATE
    });
  },

  down: queryInterface => queryInterface.dropTable('question')
};
