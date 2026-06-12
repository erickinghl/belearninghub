'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { INTEGER, STRING, DATE, DECIMAL } = Sequelize;
    return queryInterface.createTable('order', {
      id: { type: INTEGER(20), primaryKey: true, autoIncrement: true },
      no: { type: STRING(64), allowNull: false, defaultValue: '', comment: '订单号' },
      user_id: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '用户id' },
      // 商品类型：course课程 / book电子书 / column专栏
      goods_type: { type: STRING(20), allowNull: false, defaultValue: 'course', comment: '商品类型' },
      goods_id: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '商品id' },
      goods_title: { type: STRING(150), allowNull: true, defaultValue: '', comment: '商品标题(快照)' },
      price: { type: DECIMAL(10, 2), allowNull: false, defaultValue: 0, comment: '订单金额' },
      // 0待支付 1已支付 2已取消
      status: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '0待支付 1已支付 2已取消' },
      pay_time: { type: DATE, allowNull: true, comment: '支付时间' },
      pay_method: { type: STRING(20), allowNull: true, defaultValue: '', comment: '支付方式(mock/wxpay)' },
      created_time: DATE,
      updated_time: DATE
    });
  },

  down: queryInterface => queryInterface.dropTable('order')
};
