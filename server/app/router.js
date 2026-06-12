'use strict';

/**
 * 在线教育后端路由（统一 /mobile 前缀，与前端 coder 的 api.js 对齐）
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;

  // 健康检查
  router.get('/', controller.home.index);

  // ===== 阶段0：用户 =====
  router.post('/mobile/reg', controller.user.reg);
  router.post('/mobile/login', controller.user.login);
  router.post('/mobile/logout', controller.user.logout);
  router.get('/mobile/check_token', controller.user.checkToken);   // 启动时静默校验登录态
  router.post('/mobile/update_info', controller.user.updateInfo);
  router.post('/mobile/update_password', controller.user.updatePassword);
  router.post('/mobile/get_captcha', controller.user.getCaptcha);     // 获取验证码（公开）
  router.post('/mobile/bind_mobile', controller.user.bindMobile);     // 绑定手机号（需登录）

  // ===== 阶段1：上传 / 分类 / 首页 / 课程 =====
  router.post('/mobile/upload', controller.file.upload);
  router.get('/mobile/category', controller.category.index);

  // 首页聚合数据（templates 数组）
  router.get('/mobile/index', controller.index.index);

  // 课程
  router.get('/mobile/course/list', controller.course.list);
  router.get('/mobile/course/read', controller.course.read);
  // 专栏列表 / 详情（type=column 的课程）
  router.get('/mobile/column/list', controller.course.columnList);
  router.get('/mobile/column/read', controller.course.columnRead);
  // 商品详情（课程/专栏通用，下单页用）
  router.get('/mobile/goods/read', controller.course.goodsRead);
  // 搜索
  router.get('/mobile/search', controller.course.search);

  // ===== 刷题系统（题库/试卷/答题） =====
  // 题库分类（公开）
  router.get('/mobile/testpaper/categories', controller.category.index);
  // 试卷列表 / 详情（公开，支持 ?category_id= 过滤）
  router.get('/mobile/testpaper/list', controller.testpaper.list);
  router.get('/mobile/testpaper/read', controller.testpaper.read);
  // 练习模式：题号宫格 + 单题作答记录 + 统计（需登录）
  router.get('/mobile/practice/read', controller.practice.read);
  router.post('/mobile/practice/submit', controller.practice.submitOne);
  router.get('/mobile/practice/stat', controller.practice.stat);
  router.post('/mobile/practice/fava', controller.practice.fava);
  router.get('/mobile/practice/wrong', controller.practice.wrongList);
  router.get('/mobile/practice/favalist', controller.practice.favaList);
  router.post('/mobile/practice/remove_wrong', controller.practice.removeWrong);
  // 答案纠错（需登录）
  router.post('/mobile/correction/submit', controller.correction.submit);
  // 题目功能条：点赞 / 留言讨论（需登录）
  router.get('/mobile/question/stat', controller.questionAction.stat);
  router.post('/mobile/question/like', controller.questionAction.like);
  router.get('/mobile/question/comments', controller.questionAction.commentList);
  router.post('/mobile/question/comment', controller.questionAction.commentAdd);
  router.post('/mobile/question/comment_destroy', controller.questionAction.commentDestroy);

  // 提交答案(判分) / 我的记录 / 记录详情（需登录）
  router.post('/mobile/user_test/save', controller.userTest.save);
  router.get('/mobile/user_test/list', controller.userTest.list);
  router.get('/mobile/user_test/read', controller.userTest.read);

  // ===== 电子书 =====
  // 注意前端命名：readBook→/book/read 取书详情+章节；getBookDetailContent→/book/detail 读某章内容
  router.get('/mobile/book/list', controller.book.list);
  router.get('/mobile/book/read', controller.book.detail);      // 书详情 + 章节列表
  router.get('/mobile/book/detail', controller.book.read);      // 读某章内容
  router.get('/mobile/mybook', controller.book.mybook);         // 我的书架（需登录）

  // ===== 订单（全部需登录） =====
  router.post('/mobile/order/learn', controller.order.learn);   // 免费学习
  router.post('/mobile/order/save', controller.order.save);     // 创建订单
  router.post('/mobile/order/mockpay', controller.order.mockpay); // 模拟支付
  router.get('/mobile/order/list', controller.order.list);      // 我的订单
  router.get('/mobile/user_history/list', controller.order.history);   // 学习记录(在学)
  router.post('/mobile/user_history/update', controller.order.historyUpdate);

  // ===== 收藏（全部需登录） =====
  router.post('/mobile/collect', controller.fava.collect);
  router.post('/mobile/uncollect', controller.fava.uncollect);
  router.get('/mobile/user_fava', controller.fava.userFava);

  // ===== 笔记（全部需登录） =====
  router.get('/mobile/note/list', controller.note.list);
  router.get('/mobile/note/read', controller.note.read);
  router.post('/mobile/note/save', controller.note.save);
  router.post('/mobile/note/destroy', controller.note.destroy);

  // ===== 管理后台接口（需登录鉴权 /admin/*） =====
  // 题库：试卷
  router.get('/admin/testpaper/list', controller.testpaper.adminList);
  router.get('/admin/testpaper/read', controller.testpaper.adminRead);
  router.post('/admin/testpaper/save', controller.testpaper.save);
  router.post('/admin/testpaper/destroy', controller.testpaper.destroy);
  // 题库：题目
  router.post('/admin/question/save', controller.question.save);
  router.post('/admin/question/destroy', controller.question.destroy);
  router.post('/admin/question/import', controller.question.batchImport);
  // 订单
  router.get('/admin/order/list', controller.order.adminList);
  router.post('/admin/order/status', controller.order.adminUpdateStatus);
  // 人工阅卷（问答题）
  router.get('/admin/user_test/pending', controller.userTest.adminPendingList);
  router.get('/admin/user_test/read', controller.userTest.adminReadDetail);
  router.post('/admin/user_test/grade', controller.userTest.adminGrade);
  // 电子书
  router.get('/admin/book/list', controller.book.adminList);
  router.get('/admin/book/read', controller.book.adminRead);
  router.post('/admin/book/save', controller.book.save);
  router.post('/admin/book/destroy', controller.book.destroy);
  router.post('/admin/book/chapter/save', controller.book.saveChapter);
  router.post('/admin/book/chapter/destroy', controller.book.destroyChapter);

  // 答案纠错
  router.get('/admin/correction/list', controller.correction.adminList);
  router.post('/admin/correction/handle', controller.correction.adminHandle);
  router.get('/admin/correction/pending_count', controller.correction.adminPendingCount);

  // 课程
  router.get('/admin/course/list', controller.course.adminList);
  router.post('/admin/course/save', controller.course.save);
  router.post('/admin/course/destroy', controller.course.destroy);
  // 轮播图
  router.get('/admin/banner/list', controller.banner.list);
  router.post('/admin/banner/save', controller.banner.save);
  router.post('/admin/banner/destroy', controller.banner.destroy);
  // 分类
  router.get('/admin/category/list', controller.category.index);
  router.post('/admin/category/save', controller.category.save);
  router.post('/admin/category/destroy', controller.category.destroy);
  // 首页图标导航
  router.get('/admin/nav_icon/list', controller.navIcon.adminList);
  router.post('/admin/nav_icon/save', controller.navIcon.save);
  router.post('/admin/nav_icon/destroy', controller.navIcon.destroy);
  // 上传（后台用，复用 file.upload）
  router.post('/admin/upload', controller.file.upload);
};
