<template>
	<view class="p-3">
		<view class="text-center py-4">
			<text class="iconfont" style="font-size:100rpx;color:#5ccc84;">￥</text>
			<view class="font-lg mt-2">模拟支付</view>
			<view class="font-sm text-light-muted mt-1">订单号：{{ no }}</view>
			<view class="text-danger mt-3" style="font-size:60rpx;">￥{{ price }}</view>
		</view>

		<view class="border rounded p-3 bg-light font-sm text-muted" style="line-height:1.7;">
			本地/演示环境没有接入真实微信支付（需微信商户号 + 公网域名）。
			点下方按钮即视为支付成功，订单会立即开通，可正常学习/阅读。
		</view>

		<view style="height:60px;"></view>
		<view class="fixed-bottom p-2 border-top bg-white">
			<main-button @click="pay">模拟支付成功（开通）</main-button>
			<view class="text-center font-sm text-light-muted mt-2" @click="cancel">取消，稍后支付</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				no: "",
				price: ""
			}
		},
		onLoad(e) {
			this.no = e.no || ""
			this.price = e.price || ""
			if (!this.no) {
				this.$toast("缺少订单号")
				setTimeout(() => uni.navigateBack({ delta: 1 }), 700)
			}
		},
		methods: {
			pay() {
				uni.showLoading({ title: '支付中...', mask: true })
				this.$api.mockpay({ no: this.no }).then(() => {
					this.$toast('支付成功')
					setTimeout(() => {
						// 返回到下单前的详情页（再后退一层）
						uni.navigateBack({ delta: 2 })
					}, 700)
				}).catch(() => {
					// 找不到上一页就回首页
					uni.navigateBack({ delta: 1 })
				}).finally(() => {
					uni.hideLoading()
				})
			},
			cancel() {
				uni.navigateBack({ delta: 1 })
			}
		}
	}
</script>

<style>
</style>
