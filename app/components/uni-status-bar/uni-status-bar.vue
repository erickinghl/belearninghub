<template>
	<view>
		<view :style="{ height: statusBarHeight,background:bgColor }" class="uni-status-bar">
			<slot />
		</view>
		<view :style="{ height: statusBarHeight }"></view>
	</view>
</template>

<script>
	var statusBarHeight = uni.getSystemInfoSync().statusBarHeight + 'px'
	export default {
		name: 'UniStatusBar',
		props: {
			bgColor: {
				type: String,
				default: ""
			},
		},
		data() {
			return {
				statusBarHeight: statusBarHeight
			}
		}
	}
</script>

<style lang="scss" scoped>
	.uni-status-bar {
		// width: 750rpx;
		height: 20px;
		// height: var(--status-bar-height);
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 10000;
	}
</style>
