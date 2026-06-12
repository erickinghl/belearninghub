'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { INTEGER, STRING, DATE, TEXT } = Sequelize;
    return queryInterface.createTable('book_detail', {
      id: { type: INTEGER(20), primaryKey: true, autoIncrement: true },
      book_id: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '所属书id' },
      title: { type: STRING(150), allowNull: false, defaultValue: '', comment: '章节标题' },
      content: { type: TEXT('long'), allowNull: true, comment: '章节内容(富文本/TXT)' },
      isfree: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '1免费试读 0需购买' },
      sort: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '章节顺序' },
      created_time: DATE,
      updated_time: DATE
    });
  },

  down: queryInterface => queryInterface.dropTable('book_detail')
};
