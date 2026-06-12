'use strict';

module.exports = app => {
    const { STRING, INTEGER, DATE, DECIMAL, TEXT } = app.Sequelize;

    const Book = app.model.define('book', {
        id: { type: INTEGER(20), primaryKey: true, autoIncrement: true },
        title: { type: STRING(100), allowNull: false, defaultValue: '', comment: '书名' },
        cover: { type: STRING, allowNull: true, defaultValue: '', comment: '封面' },
        author: { type: STRING(50), allowNull: true, defaultValue: '', comment: '作者' },
        category_id: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '分类id' },
        type: { type: STRING(20), allowNull: false, defaultValue: 'media', comment: '类型标签' },
        book_type: { type: STRING(20), allowNull: false, defaultValue: 'chapter', comment: 'chapter章节/pdf/txt' },
        file_url: { type: STRING, allowNull: true, defaultValue: '', comment: 'PDF/TXT 文件地址' },
        price: { type: DECIMAL(10, 2), allowNull: false, defaultValue: 0, comment: '现价' },
        t_price: { type: DECIMAL(10, 2), allowNull: false, defaultValue: 0, comment: '原价' },
        try: { type: TEXT('long'), allowNull: true, comment: '简介' },
        desc: { type: STRING(255), allowNull: true, defaultValue: '', comment: '简短描述' },
        sub_count: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '阅读人数' },
        sort: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '排序' },
        status: { type: INTEGER, allowNull: false, defaultValue: 1, comment: '1上架 0下架' },
        created_time: {
            type: DATE,
            get() {
                const v = this.getDataValue('created_time');
                return v ? (new Date(v)).getTime() : null;
            }
        },
        updated_time: DATE,
    });

    Book.associate = function () {
        Book.hasMany(app.model.BookDetail, { foreignKey: 'book_id' });
    };

    return Book;
};
