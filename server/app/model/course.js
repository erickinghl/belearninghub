'use strict';

module.exports = app => {
    const { STRING, INTEGER, DATE, DECIMAL, TEXT } = app.Sequelize;

    const Course = app.model.define('course', {
        id: {
            type: INTEGER(20),
            primaryKey: true,
            autoIncrement: true
        },
        title: { type: STRING(100), allowNull: false, defaultValue: '', comment: '课程标题' },
        cover: { type: STRING, allowNull: true, defaultValue: '', comment: '封面' },
        category_id: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '分类id' },
        // 类型：media图文 / audio音频 / video视频 / column专栏
        type: { type: STRING(20), allowNull: false, defaultValue: 'media', comment: '课程类型' },
        price: { type: DECIMAL(10, 2), allowNull: false, defaultValue: 0, comment: '现价' },
        t_price: { type: DECIMAL(10, 2), allowNull: false, defaultValue: 0, comment: '原价' },
        // 课程主内容（富文本/音视频地址）
        content: { type: TEXT('long'), allowNull: true, comment: '课程内容' },
        // 试看/简介内容（未购买时显示）
        try: { type: TEXT('long'), allowNull: true, comment: '试看简介' },
        desc: { type: STRING(255), allowNull: true, defaultValue: '', comment: '简短描述' },
        study_count: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '学习人数' },
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

    Course.associate = function () {
        Course.belongsTo(app.model.Category);
    };

    return Course;
};
