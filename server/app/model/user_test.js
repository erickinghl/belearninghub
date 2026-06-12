'use strict';

module.exports = app => {
    const { INTEGER, DATE, TEXT } = app.Sequelize;

    const UserTest = app.model.define('user_test', {
        id: { type: INTEGER(20), primaryKey: true, autoIncrement: true },
        user_id: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '用户id' },
        testpaper_id: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '试卷id' },
        value: {
            type: TEXT('long'), allowNull: true, comment: '用户答案(JSON)',
            get() {
                const v = this.getDataValue('value');
                if (!v) return null;
                try { return JSON.parse(v); } catch (e) { return v; }
            }
        },
        result: {
            type: TEXT('long'), allowNull: true, comment: '判分明细(JSON)',
            get() {
                const v = this.getDataValue('result');
                if (!v) return null;
                try { return JSON.parse(v); } catch (e) { return v; }
            }
        },
        score: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '得分' },
        total_score: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '满分' },
        is_pass: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '1及格 0不及格' },
        answer_status: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '0考试中 1已交卷' },
        read_status: { type: INTEGER, allowNull: false, defaultValue: 0, comment: '0待阅卷 1已阅卷' },
        created_time: {
            type: DATE,
            get() {
                const v = this.getDataValue('created_time');
                return v ? (new Date(v)).getTime() : null;
            }
        },
        updated_time: DATE,
    });

    UserTest.associate = function () {
        UserTest.belongsTo(app.model.Testpaper, { foreignKey: 'testpaper_id' });
    };

    return UserTest;
};
