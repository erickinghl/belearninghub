'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { INTEGER, STRING, DATE, DECIMAL, TEXT } = Sequelize;
    return queryInterface.createTable('book', {
      id: { type: INTEGER(20), primaryKey: true, autoIncrement: true },
      title: { type: STRING(100), allowNull: false, defaultValue: '', comment: '书名' },
      cover: { type: STRING, allowNull: true, defaultValue: '', comment: '封面' },
      author: { type: STRING(50), allowNull: true, defaultValue: '', comment: '作者' },
      category_id: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '分类id' },
      // 复用前端 type 标签（media图文等），电子书统一用 media
      type: { type: STRING(20), allowNull: false, defaultValue: 'media', comment: '类型标签' },
      price: { type: DECIMAL(10, 2), allowNull: false, defaultValue: 0, comment: '现价' },
      t_price: { type: DECIMAL(10, 2), allowNull: false, defaultValue: 0, comment: '原价' },
      try: { type: TEXT('long'), allowNull: true, comment: '简介(富文本)' },
      desc: { type: STRING(255), allowNull: true, defaultValue: '', comment: '简短描述' },
      sub_count: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '订阅/阅读人数' },
      sort: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '排序' },
      status: { type: INTEGER, allowNull: false, defaultValue: 1, comment: '1上架 0下架' },
      created_time: DATE,
      updated_time: DATE
    });
  },

  down: queryInterface => queryInterface.dropTable('book')
};
