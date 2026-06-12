'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.apiSuccess({
      name: '在线教育后端 edu-server',
      status: 'running',
      tip: '本服务是 API 接口服务器，没有网页界面。请用 App(localhost:8080) 访问，或调用 /mobile/* 接口。'
    }, '后端运行正常');
  }
}

module.exports = HomeController;
