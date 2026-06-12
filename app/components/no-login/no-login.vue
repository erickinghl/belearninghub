<template>
	<view class="noLogin">
		<image src="/static/noLogin.png" style="width: 350rpx;height: 350rpx;"></image>
		<text class="text-muted my-2 font">登录后才可以查看我的学习哦</text>
		<button type="default" size="mini" plain @click="navigateTo('/pages/login/login')">立即登录</button>
	</view>
</template>

<script>
	export default {
		name:"no-login",
		data() {
			return {
				
			};
		}
	}
</script>

<style>
.noLogin{
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background-color: #FFFFFF;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
}
</style>
