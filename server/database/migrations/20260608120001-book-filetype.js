'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { STRING } = Sequelize;
    // book_type: chapter章节阅读(默认,原有) / pdf PDF文件 / txt 单文件纯文本
    await queryInterface.addColumn('book', 'book_type', {
      type: STRING(20), allowNull: false, defaultValue: 'chapter', comment: 'chapter章节/pdf/txt'
    });
    // PDF/TXT 文件地址（book_type 为 pdf/txt 时用）
    await queryInterface.addColumn('book', 'file_url', {
      type: STRING, allowNull: true, defaultValue: '', comment: 'PDF/TXT 文件地址'
    });
  },

  down: async queryInterface => {
    await queryInterface.removeColumn('book', 'book_type');
    await queryInterface.removeColumn('book', 'file_url');
  }
};
