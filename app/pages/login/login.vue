<template>
	<view>

		<!-- #ifndef MP -->
		<view class="login-back" @click="back">
			<text style="color:#fff;font-size:24px;">‹</text>
		</view>
		<!-- #endif -->
		
		<view class="login-bg"></view>
		
		<view class="login">
			<view class="flex">
				<text class="title">{{ type == 'login' ? '登 录' : '注 册' }}</text>
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
				<input type="password" password placeholder="请输入确认密码" class="rounded font-md" v-model="form.repassword"/>
			</view>
			
			<view class="bg-main btn" hover-class="bg-main-hover" @click="submit">{{ type == 'login' ? '登 录' : '注 册' }}</view>
			
			<view class="flex align-center justify-between my-3 font">
				<text class="py-3 text-main" @click="changeType">{{ type == 'login' ? '注册账号' : '去登录' }}</text>
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
		height: 180px;
		background: linear-gradient(135deg, #5ccc84 0%, #43b876 100%);
		border-bottom-left-radius: 20px;
		border-bottom-right-radius: 20px;
	}
	.login-back {
		position: fixed;
		top: 30px;
		left: 15px;
		z-index: 10;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	/* 登录卡片，盖在背景上 */
	.login {
		margin-left: 20px;
		margin-right: 20px;
		margin-top: -90px;
		background-color: #fff;
		border-radius: 12px;
		padding: 25px 20px 20px;
		box-shadow: 0 4px 20px rgba(0,0,0,0.08);
	}
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
