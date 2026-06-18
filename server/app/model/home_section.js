// app/model/home_section.js —— 首页内容板块（后台可配，按类型自动拉数据）
module.exports = app => {
    const { INTEGER, STRING, TINYINT, DATE } = app.Sequelize;

    const HomeSection = app.model.define('home_section', {
        id: { type: INTEGER(20), primaryKey: true, autoIncrement: true },
        title: { type: STRING(50), allowNull: false, defaultValue: '', comment: '板块标题' },
        source_type: { type: STRING(20), allowNull: false, defaultValue: 'course', comment: 'course/book/testpaper/column' },
        limit_num: { type: INTEGER, allowNull: false, defaultValue: 6, comment: '显示条数' },
        show_more: { type: TINYINT, allowNull: false, defaultValue: 1, comment: '是否显示查看更多' },
        sort: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '排序越大越靠前' },
        status: { type: TINYINT, allowNull: false, defaultValue: 1, comment: '1显示 0隐藏' },
        created_time: DATE,
        updated_time: DATE
    });

    return HomeSection;
};
