'use strict';
const crypto = require('crypto');
module.exports = app => {
    const { STRING, INTEGER, DATE, ENUM, TEXT } = app.Sequelize;
    // 配置（重要：一定要配置详细，一定要！！！）
    const User = app.model.define('user', {
        id: {
            type: INTEGER(20),
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: STRING(30),
            allowNull: false,
            defaultValue: '',
            comment: '用户名',
            unique: true
        },
        nickname: {
            type: STRING(30),
            allowNull: false,
            defaultValue: '',
            comment: '昵称',
        },
        email: {
            type: STRING(160),
            allowNull: false,
            defaultValue: '',
            comment: '邮箱'
        },
        password: {
            type: STRING,
            allowNull: false,
            defaultValue: '',
            comment: "密码",
            set(val) {
                const hmac = crypto.createHash("sha256", app.config.crypto.secret);
                hmac.update(val);
                this.setDataValue('password', hmac.digest("hex"));
            }
        },
        avatar: {
            type: STRING,
            allowNull: true,
            defaultValue: '',
            comment: '头像'
        },
        phone: {
            type: STRING(11),
            allowNull: false,
            defaultValue: '',
            comment: '手机'
        },
        sex: {
            type: ENUM,
            values: ["男", '女', '保密'],
            allowNull: false,
            defaultValue: '男',
            comment: '性别'
        },
        desc: {
            type: TEXT,
            allowNull: false,
            defaultValue: '',
            comment: '个性签名',
        },
        status: {
            type: app.Sequelize.TINYINT,
            allowNull: false,
            defaultValue: 1,
            comment: '1正常 0禁用',
        },
        level: {
            type: app.Sequelize.STRING(20),
            allowNull: false,
            defaultValue: '普通',
            comment: '会员等级',
        },
        vip_expire: {
            type: DATE,
            allowNull: true,
            comment: 'VIP到期时间',
        },
        balance: {
            type: app.Sequelize.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
            comment: '账户余额',
        },
        created_time: DATE,
        updated_time: DATE,

    });
    return User;
};