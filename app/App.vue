<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
			this.$store.dispatch('init')
			// 启动时静默校验登录态：token 失效则悄悄登出（不打扰、不强制跳登录）
			if(this.$store.state.token){
				this.$api.checkToken().catch(()=>{})
			}
			// 拉取全局配置（默认头像 + 站点信息/footer）
			this.$api.getConfig().then(res=>{
				if(res){
					if(res.default_avatar) this.$store.commit('setDefaultAvatar', res.default_avatar)
					this.$store.commit('setSiteConfig', res)
				}
			}).catch(()=>{})
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
	@import url("~@dcloudio/uni-h5/dist/index.css");
	@import url("./common/free.css");
	@import url("./common/common.css");
	@import url("./common/animate.min.css");
	@import url("./common/iconfont.css");

	/* ===== PC 宽屏（≥1024px）：隐藏手机底部 tabBar，导航走顶部 PC 栏 ===== */
	/* #ifdef H5 */
	@media screen and (min-width: 1024px) {
		/* 解除 uni-app 默认的 480px 最大宽度限制，让 PC 铺满 */
		.uni-app--maxwidth {
			max-width: none !important;
		}
		uni-tabbar, .uni-tabbar, .uni-tabbar__bd, uni-page-wrapper > uni-tabbar {
			display: none !important;
		}
		/* 用自带 pc-header 的页面（tabBar 页 + 主要列表页）：PC 隐藏系统导航栏 */
		body.pages-tabbar-home-home uni-page-head,
		body.pages-tabbar-learn-learn uni-page-head,
		body.pages-tabbar-index-index uni-page-head,
		body.pages-list-list uni-page-head,
		body.pages-test-list-test-list uni-page-head,
		body.pages-book-list-book-list uni-page-head,
		body.pages-practice-practice uni-page-head,
		body.pages-column-column uni-page-head,
		body.pages-course-course uni-page-head,
		body.pages-order-list-order-list uni-page-head,
		body.pages-fava-list-fava-list uni-page-head,
		body.pages-my-book-my-book uni-page-head,
		body.pages-my-test-my-test uni-page-head,
		body.pages-note-list-note-list uni-page-head,
		body.pages-setting-setting uni-page-head,
		body.pages-user-info-user-info uni-page-head,
		body.pages-search-search uni-page-head,
		body.pages-search-result-search-result uni-page-head {
			display: none !important;
		}
		/* 带 pc-header 的页面：内容让出 60px 顶栏高度 */
		.pc-pad {
			padding-top: 60px !important;
		}
		/* tabBar 页底部本来给 tabbar 预留的 50px 占位也去掉 */
		uni-page-body {
			padding-bottom: 0 !important;
		}

		/* ===== 全局：PC 上每个页面内容居中限宽 + 顶部留出 PC 导航栏高度 ===== */
		/* 浅灰底铺满整屏，内容居中成一栏，避免被拉长 */
		uni-page-wrapper {
			background-color: #f2f3f5;
		}
		uni-page-body {
			max-width: 820px;
			margin: 0 auto !important;
			min-height: 100vh;
			background-color: #f2f3f5;
			box-shadow: 0 0 1px rgba(0,0,0,0.04);
		}
		/* 首页/列表页放宽到 1100px（默认 820 太窄，课程网格放不下） */
		body.pages-tabbar-index-index uni-page-body,
		body.pages-list-list uni-page-body,
		body.pages-test-list-test-list uni-page-body,
		body.pages-book-list-book-list uni-page-body {
			max-width: 1100px;
		}
	}
	/* #endif */
</style>

