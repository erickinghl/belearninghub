'use strict';
module.exports = app => {
    const { STRING, INTEGER, DATE, ENUM, TEXT } = app.Sequelize;
    // 配置（重要：一定要配置详细，一定要！！！）
    const Category = app.model.define('category', {
        id: {
            type: INTEGER(20),
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: STRING(100),
            allowNull: false,
            defaultValue: '',
            comment: '分类名称'
        },
        type: {
            type: STRING(20),
            allowNull: false,
            defaultValue: 'course',
            comment: '分类用途 course/testpaper'
        },
        sort: {
            type: INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '排序，越大越前'
        },
        cover: {
            type: STRING,
            allowNull: true,
            defaultValue: '',
            comment: '分类图标'
        },
        desc: {
            type: TEXT,
            allowNull: false,
            defaultValue: '',
            comment: '分类描述',
        },
        created_time: DATE,
        updated_time: DATE
    });
    return Category;
};