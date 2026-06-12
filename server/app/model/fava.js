// app/model/fava.js
module.exports = app => {
    const { INTEGER, DATE, STRING } = app.Sequelize;

    const Fava = app.model.define('fava', {
        id: {
            type: INTEGER(20),
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '用户id'
        },
        // 复用原 video_id 列存放商品id（课程/专栏/电子书）
        video_id: {
            type: INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '商品id（course/column 走 Course 表，book 走 Book 表）'
        },
        goods_type: {
            type: STRING(20),
            allowNull: false,
            defaultValue: 'course',
            comment: '商品类型 course/column/book'
        },
        created_time: DATE,
        updated_time: DATE
    });

    Fava.associate = function (models) {
        Fava.belongsTo(app.model.User);
    }

    return Fava;
};
