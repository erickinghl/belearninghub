'use strict';

module.exports = app => {
    const { STRING, INTEGER, DATE, DECIMAL } = app.Sequelize;

    const Order = app.model.define('order', {
        id: { type: INTEGER(20), primaryKey: true, autoIncrement: true },
        no: { type: STRING(64), allowNull: false, defaultValue: '', comment: '订单号' },
        user_id: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '用户id' },
        goods_type: { type: STRING(20), allowNull: false, defaultValue: 'course', comment: '商品类型' },
        goods_id: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '商品id' },
        goods_title: { type: STRING(150), allowNull: true, defaultValue: '', comment: '商品标题快照' },
        price: { type: DECIMAL(10, 2), allowNull: false, defaultValue: 0, comment: '订单金额' },
        status: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '0待支付 1已支付 2已取消' },
        pay_time: { type: DATE, allowNull: true, comment: '支付时间' },
        pay_method: { type: STRING(20), allowNull: true, defaultValue: '', comment: '支付方式' },
        created_time: {
            type: DATE,
            get() {
                const v = this.getDataValue('created_time');
                return v ? (new Date(v)).getTime() : null;
            }
        },
        updated_time: DATE,
    }, {
        // 表名 order 是 SQL 保留字，sequelize 会自动加引号；明确指定表名
        tableName: 'order'
    });

    return Order;
};
