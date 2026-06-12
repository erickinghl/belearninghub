'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { INTEGER, STRING, DATE, DECIMAL, TEXT } = Sequelize;
    return queryInterface.createTable('course', {
      id: { type: INTEGER(20), primaryKey: true, autoIncrement: true },
      title: { type: STRING(100), allowNull: false, defaultValue: '', comment: '课程标题' },
      cover: { type: STRING, allowNull: true, defaultValue: '', comment: '封面' },
      category_id: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '分类id' },
      type: { type: STRING(20), allowNull: false, defaultValue: 'media', comment: '类型 media/audio/video/column' },
      price: { type: DECIMAL(10, 2), allowNull: false, defaultValue: 0, comment: '现价' },
      t_price: { type: DECIMAL(10, 2), allowNull: false, defaultValue: 0, comment: '原价' },
      content: { type: TEXT('long'), allowNull: true, comment: '课程内容' },
      try: { type: TEXT('long'), allowNull: true, comment: '试看简介' },
      desc: { type: STRING(255), allowNull: true, defaultValue: '', comment: '简短描述' },
      study_count: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '学习人数' },
      sort: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '排序' },
      status: { type: INTEGER, allowNull: false, defaultValue: 1, comment: '1上架 0下架' },
      created_time: DATE,
      updated_time: DATE
    });
  },

  down: queryInterface => queryInterface.dropTable('course')
};
