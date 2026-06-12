# belearninghub 在线教育 App

uni-app（Vue2）前端 + egg.js 后端的在线教育应用。

## 目录结构
- `server/` —— 后端（egg.js + Sequelize/MySQL + Redis + JWT）
- `app/` —— 前端（uni-app Vue2，H5 / App）

## 后端 server
```bash
cd server
npm install
npm run dev        # http://127.0.0.1:7001
```
需要 MySQL（库 `egg-edu`）和 Redis。配置见 `server/config/config.default.js`。
后台管理面板：`server/app/public/admin.html`（访问 `/public/admin.html`）。

## 前端 app
```bash
cd app
npm install
npm run dev:h5     # http://127.0.0.1:8080
```

## 主要功能
课程 / 电子书 / 专栏 / 题库（练习模式·题号宫格·做题记录）/ 错题本 / 收藏 /
答案纠错（可传图）/ 解析图文化（图片·视频）/ 题目功能条（点赞·收藏·笔记·讨论）/
笔记附件（图片·视频·PDF·Office）/ 订单（模拟支付）/ 笔记 /
后台：课程·题库分类·试卷·题目·阅卷·订单·电子书·轮播图·纠错·首页图标配置。
