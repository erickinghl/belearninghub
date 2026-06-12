import api from './request.js';
export default {
	// 获取首页数据
	getIndexData(){
		return api.get("/mobile/index")
	},
	// 获取可用秒杀列表
	getFlashsale(params = {}){
		params.usable = 1
		return api.get("/mobile/flashsale",params)
	},
	// 获取可用拼团列表
	getGroup(params = {}){
		params.usable = 1
		return api.get("/mobile/group",params)
	},
	// 获取可用优惠券列表
	getCoupon(params = {}){
		return api.get("/mobile/coupon",params)
	},
	// 注册账号
	reg(data){
		return api.post('/mobile/reg',data)
	},
	// 账号登录
	login(data){
		return api.post('/mobile/login',data)
	},
	// 获取手机验证码
	getCaptcha(data){
		return api.post('/mobile/get_captcha',data)
	},
	// 绑定手机号
	bindMobile(data){
		return api.post('/mobile/bind_mobile',data)
	},
	// 找回密码
	forget(data){
		return api.post('/mobile/forget',data)
	},
	// 校验当前登录态(token是否有效)
	checkToken(){
		return api.get('/mobile/check_token',null,{silent:true})
	},
	// 退出登录
	logout(){
		return api.post('/mobile/logout')
	},
	// 找回密码
	updatePassword(data){
		return api.post('/mobile/update_password',data)
	},
	// 上传图片
	upload(filePath,onProgress = null){
		return api.upload('/mobile/upload',{
			filePath
		},{
			onProgress
		})
	},
	// 修改资料
	updateInfo(data){
		return api.post('/mobile/update_info',data)
	},
	// 获取订单列表
	getOrderList(params){
		return api.get('/mobile/order/list',params)
	},
	// 领取优惠券
	receiveCoupon(data){
		return api.post('/mobile/user_coupon/receive',data)
	},
	// 我的优惠券列表
	getUserCoupon(params){
		return api.get('/mobile/user_coupon',params)
	},
	// 搜索
	search(params){
		return api.get('/mobile/search',params)
	},
	// 获取课程详情
	readCourse(params){
		return api.get('/mobile/course/read',params)
	},
	// 获取专栏详情
	readColumn(params){
		return api.get('/mobile/column/read',params)
	},
	// 学习进度列表
	getUserHistory(params){
		return api.get('/mobile/user_history/list',params)
	},
	// 更新学习进度
	updateUserHistory(data){
		return api.post('/mobile/user_history/update',data)
	},
	// 题库分类
	getTestCategories(){
		return api.get('/mobile/testpaper/categories',{type:'testpaper'})
	},
	// 考场列表（支持 ?category_id= 过滤）
	getTestList(params){
		return api.get('/mobile/testpaper/list',params)
	},
	// ===== 练习模式（题号宫格+单题记录） =====
	practiceRead(params){
		return api.get('/mobile/practice/read',params)
	},
	practiceSubmit(data){
		return api.post('/mobile/practice/submit',data)
	},
	practiceStat(params){
		return api.get('/mobile/practice/stat',params)
	},
	practiceFava(data){
		return api.post('/mobile/practice/fava',data)
	},
	practiceWrong(){
		return api.get('/mobile/practice/wrong')
	},
	practiceFavaList(){
		return api.get('/mobile/practice/favalist')
	},
	practiceRemoveWrong(data){
		return api.post('/mobile/practice/remove_wrong',data)
	},
	// 答案纠错
	correctionSubmit(data){
		return api.post('/mobile/correction/submit',data)
	},
	// 题目功能条：点赞/留言/笔记统计
	questionStat(params){
		return api.get('/mobile/question/stat',params)
	},
	questionLike(data){
		return api.post('/mobile/question/like',data)
	},
	questionComments(params){
		return api.get('/mobile/question/comments',params)
	},
	questionComment(data){
		return api.post('/mobile/question/comment',data)
	},
	questionCommentDestroy(data){
		return api.post('/mobile/question/comment_destroy',data)
	},
	// 题目笔记（复用 note 接口，带 question_id）
	noteSave(data){
		return api.post('/mobile/note/save',data)
	},
	noteListByQuestion(params){
		return api.get('/mobile/note/list',params)
	},
	// 开始考试
	readTestpaper(params){
		return api.get('/mobile/testpaper/read',params)
	},
	// 考试交卷
	submitTest(data){
		return api.post('/mobile/user_test/save',data)
	},
	// 我的考试记录
	getMyTestList(params){
		return api.get('/mobile/user_test/list',params)
	},
	// 社区列表
	getBbsList(params){
		return api.get('/mobile/bbs',params)
	},
	// 帖子列表
	getPostList(params){
		return api.get('/mobile/post/list',params)
	},
	// 点赞帖子
	supportPost(data){
		return api.post('/mobile/post/support',data)
	},
	// 取消点赞帖子
	unsupportPost(data){
		return api.post('/mobile/post/unsupport',data)
	},
	// 发布帖子
	addPost(data){
		return api.post('/mobile/post/save',data)
	},
	// 查看帖子
	readPost(params){
		return api.get('/mobile/post/read',params)
	},
	// 查看评论列表
	getPostComments(params){
		return api.get('/mobile/post_comment',params)
	},
	// 发送评论
	replyPost(data){
		return api.post('/mobile/post/reply',data)
	},
	// 我的帖子列表
	getMyPost(params){
		return api.get('/mobile/mypost',params)
	},
	// 删除帖子
	deletePost(data){
		return api.post('/mobile/post/delete',data)
	},
	// 电子书列表
	getBookList(params){
		return api.get('/mobile/book/list',params)
	},
	// 电子书详情
	readBook(params){
		return api.get('/mobile/book/read',params)
	},
	// 查看电子书章节和内容
	getBookDetailContent(params){
		return api.get('/mobile/book/detail',params)
	},
	// 公告列表
	getMsgList(params){
		return api.get('/mobile/notice/list',params)
	},
	// 收藏
	collect(data){
		return api.post('/mobile/collect',data)
	},
	// 取消收藏
	uncollect(data){
		return api.post('/mobile/uncollect',data)
	},
	// 我的收藏列表
	getMyFavaList(params){
		return api.get('/mobile/user_fava',params)
	},
	// 获取课程列表
	getCourseList(params){
		return api.get('/mobile/course/list',params)
	},
	// 获取专栏列表
	getColumnList(params){
		return api.get('/mobile/column/list',params)
	},
	// 立即学习
	learn(data){
		return api.post("/mobile/order/learn",data)
	},
	// 下单前获取产品信息
	readGoods(params){
		return api.get("/mobile/goods/read",params)
	},
	// 获取指定课程/专栏的可用优惠券数
	getUseableCouponCount(params){
		return api.get("/mobile/user_coupon/count",params)
	},
	// 创建订单
	createOrder(data,type = 'save'){
		return api.post("/mobile/order/"+type,data)
	},
	// 微信支付
	wxpay(data){
		return api.post("/mobile/order/wxpay",data)
	},
	// 模拟支付（本地无微信商户号时用）
	mockpay(data){
		return api.post("/mobile/order/mockpay",data)
	},
	// 获取直播列表
	getLive(params){
		return api.get("/mobile/live/list",params)
	},
	// 查看直播间
	readLive(params){
		return api.get("/mobile/live/read",params)
	},
	// 发送弹幕
	sendLiveComment(data){
		return api.post("/mobile/live_comment/save",data)
	},
	// 获取弹幕列表
	getLiveComment(params){
		return api.get("/mobile/live_comment",params)
	},
	// 获取当前拼团专栏/课程的可组团列表
	getGroupWorkList(params){
		return api.get("/mobile/group_work/list",params)
	},
	// 微信app/小程序/H5登录
	wxLogin(data){
		return api.post("/mobile/weixin_login",data)
	},
	// 我的电子书列表
	getMyBookList(params){
		return api.get("/mobile/mybook",params)
	},
	// ===== 笔记 =====
	getNoteList(params){
		return api.get('/mobile/note/list',params)
	},
	readNote(params){
		return api.get('/mobile/note/read',params)
	},
	saveNote(data){
		return api.post('/mobile/note/save',data)
	},
	destroyNote(data){
		return api.post('/mobile/note/destroy',data)
	}
}