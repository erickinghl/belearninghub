<template>
	<view>

		<view class="login-bg">
			<!-- #ifndef MP -->
			<view class="login-back" @click="goHome">
				<text class="login-back-arrow">‹</text>
				<text class="login-back-text">返回首页</text>
			</view>
			<!-- #endif -->
			<!-- 品牌区：Logo + 名称 + 欢迎语 -->
			<view class="brand">
				<view class="brand-logo">📚</view>
				<text class="brand-name">在线教育</text>
				<text class="brand-slogan">{{ type == 'login' ? '欢迎回来，继续你的学习' : '注册账号，开启学习之旅' }}</text>
			</view>
		</view>

		<view class="login">
			<!-- 登录/注册 切换标签 -->
			<view class="login-tabs">
				<text class="login-tab" :class="type=='login' ? 'login-tab-on' : ''" @click="type='login'">登录</text>
				<text class="login-tab" :class="type=='reg' ? 'login-tab-on' : ''" @click="type='reg'">注册</text>
			</view>

			<view class="login-form">
				<text class="form-icon">👤</text>
				<input type="text" placeholder="请输入用户名" class="rounded font-md" v-model="form.username"/>
			</view>
			<view class="login-form">
				<text class="form-icon">🔒</text>
				<input type="password" password placeholder="请输入密码" class="rounded font-md"  v-model="form.password"/>
			</view>
			<view class="login-form" v-if="type == 'reg'">
				<text class="form-icon">🔒</text>
				<input type="password" password placeholder="请再次输入密码" class="rounded font-md" v-model="form.repassword"/>
			</view>

			<view class="bg-main btn" hover-class="bg-main-hover" @click="submit">{{ type == 'login' ? '登 录' : '注 册' }}</view>

			<view class="flex align-center justify-between my-3 font">
				<text class="py-3 text-main" @click="changeType">{{ type == 'login' ? '没有账号？去注册' : '已有账号？去登录' }}</text>
				<text class="py-3 text-light-muted" @click="openForget">忘记密码？</text>
			</view>
			
			
			<!-- #ifdef MP -->
			<view class="flex align-center justify-center wechatlogin">
				<button type="default" open-type="getUserInfo" @getuserinfo="mpWxLogin">
					<text class="wx-icon">微信登录</text>
				</button>
			</view>
			<!-- #endif -->
			<!-- #ifdef APP-PLUS -->
			<view class="flex flex-column align-center justify-center wechatlogin" @click="wxLogin">
				<text class="wx-icon">💬</text>
				<text class="font-sm text-light-muted mt-1">微信登录</text>
			</view>
			<!-- #endif -->
			
			
			<checkbox-group v-if="type == 'login'" class="flex align-center justify-center mt-4" @change="handleCheckboxChange">
				<label class="text-light-muted">
					<checkbox value="1" :checked="confirm" color="#7fd49e" style="transform: scale(0.7);"/><text class="font">已阅读并同意用户协议&隐私声明</text>
				</label>
			</checkbox-group>
			
		</view>
		
	</view>
</template>

<script>
	import tool from '@/common/tool.js';
	export default {
		data() {
			return {
				confirm:true,
				type:"login",
				form:{
					username:"",
					password:"",
					repassword:""
				}
			}
		},
		onLoad(){
			// #ifdef H5
			this.handleH5WxLogin()
			// #endif
		},
		methods: {
			mpWxLogin(e){
				if(!this.beforeLogin()){
					return
				}
				
				let rawData = e.detail.rawData
				uni.login({
					provider:"weixin",
					success: (res) => {
						let code = res.code
						uni.showLoading({
							title: '登录中...',
							mask: false
						});
						this.$api.wxLogin({
							type:"mp",
							rawData,
							code
						}).then(user=>{
							this.handleLoginSuccess(user)
						}).finally(()=>{
							uni.hideLoading()
						})
					}
				})
			},
			handleH5WxLogin(){
				// 获取url中的code
				let code = tool.getUrlCode("code")
				if(!code){
					return
				}
				uni.showLoading({
					title: '登录中...',
					mask: false
				});
				// 拿到code请求接口
				this.$api.wxLogin({
					type:"h5",
					code
				}).then(user=>{
					this.handleLoginSuccess(user)
				}).finally(()=>{
					uni.hideLoading()
				})
			},
			wxLogin(){
				if(!this.beforeLogin()){
					return
				}
				// #ifdef H5
				tool.getH5Code()
				// #endif
				// #ifdef APP-PLUS
				this.appWxLogin()
				// #endif
			},
			appWxLogin(){
				uni.login({
					provider:"weixin",
					success: (res) => {
						let { access_token,openid } = res.authResult
						uni.showLoading({
							title: '登录中...',
							mask: false
						});
						this.$api.wxLogin({
							type:"app",
							access_token,
							openid
						}).then(user=>{
							this.handleLoginSuccess(user)
						}).finally(()=>{
							uni.hideLoading()
						})
					}
				})
			},
			openForget(){
				uni.navigateTo({
					url: '../forget/forget',
				});
			},
			handleCheckboxChange(e){
				this.confirm = !!e.detail.value.length
			},
			back(){
				uni.navigateBack({
					delta: 1
				});
			},
			// 返回首页：优先回首页 tab，回不去再退栈
			goHome(){
				uni.switchTab({
					url: '/pages/tabbar/index/index',
					fail: () => {
						uni.reLaunch({ url: '/pages/tabbar/index/index' })
					}
				})
			},
			changeType(){
				this.type = this.type == 'login' ? 'reg' : 'login'
			},
			resetForm(){
				this.form = {
					username:"",
					password:"",
					repassword:""
				}
			},
			beforeLogin(){
				if(!this.confirm && this.type == 'login'){
					this.$toast('请先阅读并同意用户协议&隐私声明')
					return false
				}
				return true
			},
			handleLoginSuccess(user){
				this.$toast('登录成功')
				this.$store.dispatch('login',user)
				// 教育App不强制绑定手机号（原模板这里会跳绑手机页）
				setTimeout(()=>{
					// #ifdef H5
					uni.switchTab({
						url:"../tabbar/home/home"
					})
					// #endif
					// #ifndef H5
					this.back()
					// #endif
				},350)
			},
			submit(){
				if(!this.beforeLogin()){
					return
				}
				
				uni.showLoading({
					title: '提交中...',
					mask: false
				});
				let data = Object.assign(this.form,{})
				
				this.$api[this.type](data).then(user=>{
					if(this.type == 'reg'){
						this.$toast('注册成功')
						this.resetForm()
						this.changeType()
					} else {
						this.handleLoginSuccess(user)
					}
				}).finally(()=>{
					uni.hideLoading()
				})

			}
		}
	}
</script>

<style>
	page {
		background-color: #f7f8fa;
	}
	/* 顶部绿色渐变背景 */
	/* uni-app H5 编译器会吃掉 rpx 的 height/margin/padding，这里统一用 px */
	.login-bg {
		position: relative;
		height: 260px;
		background: linear-gradient(135deg, #5ccc84 0%, #43b876 100%);
		border-bottom-left-radius: 24px;
		border-bottom-right-radius: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	/* 品牌区 */
	.brand {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: -30px;
	}
	.brand-logo {
		width: 64px;
		height: 64px;
		line-height: 64px;
		text-align: center;
		font-size: 36px;
		background-color: rgba(255,255,255,0.22);
		border-radius: 18px;
	}
	.brand-name {
		font-size: 22px;
		font-weight: 700;
		color: #fff;
		margin-top: 12px;
		letter-spacing: 2px;
	}
	.brand-slogan {
		font-size: 13px;
		color: rgba(255,255,255,0.85);
		margin-top: 6px;
	}
	/* 登录/注册 切换标签 */
	.login-tabs {
		display: flex;
		flex-direction: row;
		margin-bottom: 8px;
	}
	.login-tab {
		font-size: 18px;
		color: #9aa0a6;
		font-weight: 600;
		margin-right: 24px;
		padding-bottom: 6px;
		position: relative;
	}
	.login-tab-on {
		color: #1a1a1a;
	}
	.login-tab-on::after {
		content: '';
		position: absolute;
		left: 0;
		bottom: 0;
		width: 22px;
		height: 3px;
		background-color: #43b876;
		border-radius: 2px;
	}
	.login-back {
		position: absolute;
		top: 16px;
		left: 16px;
		z-index: 10;
		display: flex;
		flex-direction: row;
		align-items: center;
		height: 32px;
		padding: 0 14px 0 10px;
		background-color: rgba(255,255,255,0.28);
		border-radius: 16px;
	}
	.login-back-arrow {
		color: #fff;
		font-size: 22px;
		line-height: 1;
	}
	.login-back-text {
		color: #fff;
		font-size: 13px;
		margin-left: 2px;
	}
	/* 登录卡片，盖在背景上 */
	.login {
		margin-left: 20px;
		margin-right: 20px;
		margin-top: -40px;
		background-color: #fff;
		border-radius: 16px;
		padding: 24px 20px 20px;
		box-shadow: 0 8px 28px rgba(0,0,0,0.10);
	}
	/* #ifdef H5 */
	@media screen and (min-width: 1024px) {
		.login {
			max-width: 400px;
			margin-left: auto;
			margin-right: auto;
		}
		.login-bg { border-radius: 0 0 24px 24px; }
	}
	/* #endif */
	.title {
		font-size: 24px;
		font-weight: bold;
		color: #333;
	}
	/* 输入框行 */
	.login-form {
		display: flex;
		align-items: center;
		background-color: #f5f6f8;
		border-radius: 8px;
		padding-left: 12px;
		padding-right: 12px;
		height: 48px;
		margin-top: 15px;
	}
	.form-icon {
		font-size: 18px;
		width: 24px;
		text-align: center;
	}
	.login-form input {
		flex: 1;
		margin-left: 8px;
		height: 48px;
		font-size: 15px;
		background-color: transparent;
	}
	/* 登录按钮 */
	.btn {
		height: 48px;
		line-height: 48px;
		text-align: center;
		color: #fff;
		font-size: 16px;
		border-radius: 24px;
		margin-top: 25px;
		letter-spacing: 2px;
	}
	.bg-main {
		background: linear-gradient(135deg, #5ccc84 0%, #43b876 100%);
	}
	.bg-main-hover {
		opacity: 0.9;
	}
	.text-main {
		color: #5ccc84;
	}
	.wechatlogin {
		margin-top: 25px;
		padding-top: 20px;
		border-top: 1px solid #f0f0f0;
	}
	.wx-icon {
		font-size: 24px;
	}
</style>
