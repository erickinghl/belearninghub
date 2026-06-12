<template>
	<view class="fsb-wrap">
		<view class="fsb-box" @click="open">
			<text class="fsb-icon">🔍</text>
			<text class="fsb-ph">{{ placeholder }}</text>
		</view>
	</view>
</template>

<script>
	export default {
		name:"f-search-bar",
		props: {
			placeholder: {
				type: String,
				default: '请输入搜索内容'
			},
		},
		data() {
			return {
				
			};
		},
		methods:{
			open(){
				uni.navigateTo({
					url: '/pages/search/search',
				});
			}
		}
	}
</script>

<style>
	.fsb-wrap {
		padding: 10px 12px;
		background-color: transparent;
	}
	.fsb-box {
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #ffffff;
		height: 38px;
		border-radius: 19px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.05);
	}
	.fsb-icon {
		font-size: 15px;
		margin-right: 6px;
	}
	.fsb-ph {
		font-size: 14px;
		color: #999;
	}
</style>
