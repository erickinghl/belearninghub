// app/model/nav_icon.js —— 首页宫格导航图标（后台可配置）
module.exports = app => {
    const { INTEGER, STRING, TINYINT, DATE } = app.Sequelize;

    const NavIcon = app.model.define('nav_icon', {
        id: { type: INTEGER(20), primaryKey: true, autoIncrement: true },
        name: { type: STRING(20), allowNull: false, defaultValue: '', comment: '图标名称' },
        emoji: { type: STRING(16), allowNull: false, defaultValue: '', comment: '图案(emoji)' },
        image_url: { type: STRING(300), allowNull: false, defaultValue: '', comment: '自定义图标图片url(优先于emoji)' },
        bg_color: { type: STRING(16), allowNull: false, defaultValue: '#e8f3ff', comment: '背景色' },
        jump_type: { type: STRING(10), allowNull: false, defaultValue: 'module', comment: 'module内置 / url自定义页面' },
        jump_value: { type: STRING(200), allowNull: false, defaultValue: '', comment: 'module名 或 页面路径' },
        sort: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '排序，越大越靠前' },
        status: { type: TINYINT, allowNull: false, defaultValue: 1, comment: '1显示 0隐藏' },
        created_time: DATE,
        updated_time: DATE
    });

    return NavIcon;
};
