<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
			this.$store.dispatch('init')
			// 启动时静默校验登录态：token 失效则悄悄登出（不打扰、不强制跳登录）
			if(this.$store.state.token){
				this.$api.checkToken().catch(()=>{})
			}
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
</style>

