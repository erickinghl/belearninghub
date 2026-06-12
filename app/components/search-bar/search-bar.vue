<template>
	<view>
		<view class="fixed-top bg-white">
			<view style="height: 20px;"></view>
			<view class="flex align-center" style="height: 44px;">
				<view class="flex align-center justify-center"
				style="width: 44px;height: 44px;" @click="back">
					<uni-icons type="arrowleft" size="20"></uni-icons>
				</view>
				<input :value="value" @input="$emit('input',$event.detail.value)" @confirm="$emit('confirm')" type="text" style="height: 35px;width: 400rpx;" placeholder="请输入关键词" class="rounded-circle px-3 bg-light"/>
			</view>
		</view>
		<view style="height: 64px;"></view>
	</view>
</template>

<script>
	export default {
		name:"search-bar",
		props: {
			value: {
				type: [Number,String],
				default: ""
			},
		},
		model:{
			prop:"value",
			event:"input"
		},
		data() {
			return {
				
			};
		},
		methods: {
			back() {
				uni.navigateBack({
					delta: 1
				});
			}
		},
	}
</script>

<style>

</style>
