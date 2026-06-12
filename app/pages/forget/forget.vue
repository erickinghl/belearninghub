<template>
	<view>
		<!-- #ifndef MP -->
		<view class="login-back" @click="back">
			<uni-icons type="arrowleft" size="20" color="#FFFFFF"></uni-icons>
		</view>
		<!-- #endif -->
		
		<view class="login-bg"></view>
		
		<view class="login">
			<view class="flex">
				<text class="title">找回密码</text>
			</view>
			<view class="login-form">
				<uni-icons type="person"></uni-icons>
				<input type="text" placeholder="请输入手机号" class="rounded font-md" v-model="form.phone"/>
			</view>
			<view class="login-form">
				<uni-icons type="locked"></uni-icons>
				<input type="text" placeholder="验证码" class="rounded font-md"  v-model="form.code"/>
				<code-btn :phone="form.phone"></code-btn>
			</view>
			<view class="login-form">
				<uni-icons type="locked"></uni-icons>
				<input type="text" placeholder="请输入密码" class="rounded font-md"  v-model="form.password"/>
			</view>
			<view class="login-form">
				<uni-icons type="locked"></uni-icons>
				<input type="text" placeholder="请输入确认密码" class="rounded font-md" v-model="form.repassword"/>
			</view>

			<view class="bg-main btn" hover-class="bg-main-hover" @click="submit">立即找回</view>
			
		</view>
		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				form:{
					phone:"",
					code:"",
					password:"",
					repassword:""
				}
			}
		},
		methods: {
			back(){
				uni.navigateBack({
					delta: 1
				});
			},
			submit(){
				uni.showLoading({
					title: '提交中...',
					mask: false
				});
				let data = Object.assign(this.form,{})
				
				this.$api.forget(data).then(res=>{
					this.$toast('找回成功')
					setTimeout(()=>{
						this.back()
					},350)
				}).finally(()=>{
					uni.hideLoading()
				})
			}
		}
	}
</script>

<style>

</style>
