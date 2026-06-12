'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { INTEGER } = Sequelize;
    await queryInterface.addColumn('user_test', 'answer_status', {
      type: INTEGER, allowNull: false, defaultValue: 0, comment: '0考试中 1已交卷'
    });
    await queryInterface.addColumn('user_test', 'read_status', {
      type: INTEGER, allowNull: false, defaultValue: 0, comment: '0待阅卷 1已阅卷(无问答题自动置1)'
    });
  },

  down: async queryInterface => {
    await queryInterface.removeColumn('user_test', 'answer_status');
    await queryInterface.removeColumn('user_test', 'read_status');
  }
};
