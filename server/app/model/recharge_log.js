// app/model/recharge_log.js —— 充值/余额变动流水
module.exports = app => {
    const { INTEGER, STRING, DECIMAL, DATE } = app.Sequelize;

    const RechargeLog = app.model.define('recharge_log', {
        id: { type: INTEGER(20), primaryKey: true, autoIncrement: true },
        user_id: { type: INTEGER, allowNull: false, defaultValue: 0 },
        amount: { type: DECIMAL(10, 2), allowNull: false, defaultValue: 0, comment: '充值金额(可负=扣减)' },
        balance_after: { type: DECIMAL(10, 2), allowNull: false, defaultValue: 0, comment: '充值后余额' },
        type: { type: STRING(20), allowNull: false, defaultValue: 'admin', comment: 'admin手动/pay支付' },
        remark: { type: STRING(200), allowNull: false, defaultValue: '' },
        created_time: DATE,
        updated_time: DATE
    });

    return RechargeLog;
};
