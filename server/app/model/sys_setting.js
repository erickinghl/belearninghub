// app/model/sys_setting.js —— 全局键值配置（默认头像等）
module.exports = app => {
    const { INTEGER, STRING, DATE } = app.Sequelize;

    const SysSetting = app.model.define('sys_setting', {
        id: { type: INTEGER(20), primaryKey: true, autoIncrement: true },
        skey: { type: STRING(50), allowNull: false, unique: true, comment: '配置键' },
        svalue: { type: STRING(500), allowNull: false, defaultValue: '', comment: '配置值' },
        created_time: DATE,
        updated_time: DATE
    });

    return SysSetting;
};
