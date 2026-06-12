<template>
	<view class="p-2">
		<scroll-view scroll-x="true" class="scroll-row">
			<view v-for="(item,index) in list" :key="index" class="coupon" :class="item.isgetcoupon ? 'coupon-isget' : ''">
				<view :style="item.isgetcoupon ? faceStyleGot : faceStyle">
					<text class="font-md">￥{{ item.price }}</text>
					<text class="font-sm">适用{{ item.type | formatType }}：{{ item.value.title }}</text>
				</view>
				<view hover-class="bg-hover-warning" @click="receive(item)" :style="item.isgetcoupon ? btnStyleGot : btnStyle">
					{{ item.isgetcoupon ? '已领取' : '领取' }}
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		name:"coupon-list",
		filters: {
			formatType(type) {
				let o = {
					course:"课程",
					column:"专栏"
				}
				return o[type];
			}
		},
		data() {
			return {
				list:[],
				// 内联样式绕过编译器吞背景色：券面柔和橙底+深橙字，按钮暖橙底白字
				faceStyle: 'background-color:#fff2e0;color:#c2410c;padding:12px 16px;display:flex;flex-direction:column;align-items:center;justify-content:center;border-right:2px dashed #f0c98a;',
				faceStyleGot: 'background-color:#f1f3f4;color:#9aa0a6;padding:12px 16px;display:flex;flex-direction:column;align-items:center;justify-content:center;border-right:2px dashed #d8dce0;',
				btnStyle: 'background-color:#ff8f1f;color:#ffffff;writing-mode:vertical-rl;letter-spacing:4px;display:flex;align-items:center;justify-content:center;',
				btnStyleGot: 'background-color:#c8ccd0;color:#ffffff;writing-mode:vertical-rl;letter-spacing:4px;display:flex;align-items:center;justify-content:center;'
			};
		},
		created(){
			this.getData()
		},
		methods: {
			getData() {
				this.$api.getCoupon().then(res=>{
					this.list = res
				})
			},
			receive(item){
				if(item.isgetcoupon){
					return this.$toast('你已经领取过了')
				}
				uni.showLoading({
					title: '领取中...',
					mask: false
				});
				this.$api.receiveCoupon({
					coupon_id:item.id
				}).then(res=>{
					this.$toast('领取成功')
					item.isgetcoupon = true
				}).finally(()=>{
					uni.hideLoading()
				})
			}
		},
	}
</script>

<style>
	.coupon{
		min-width: 155px;
		display: inline-flex;
		color: #a8530a;
		margin-right: 15px;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0,0,0,0.06);
	}
	/* 券面：柔和橙底 + 深橙字（辨识度高，不再白字）。px 单值避免被编译器吞 */
	.coupon>view:first-child{
		padding-top: 12px;
		padding-bottom: 12px;
		padding-left: 16px;
		padding-right: 16px;
		background-color: #fff2e0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border-right-width: 2px;
		border-right-style: dashed;
		border-right-color: #f0c98a;
		color: #c2410c;
	}
	/* 领取按钮：实心暖橙 + 白字（对比足够） */
	.coupon>view:last-child{
		width: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #ff8f1f;
		color: #ffffff;
		font-size: 15px!important;
	}
	/* 已领取：灰底灰字 */
	.coupon-isget{
		color: #9aa0a6;
	}
	.coupon-isget>view:first-child{
		background-color: #f1f3f4;
		color: #9aa0a6;
		border-right-color: #d8dce0;
	}
	.coupon-isget>view:last-child{
		background-color: #c8ccd0;
		color: #ffffff;
	}
</style>
