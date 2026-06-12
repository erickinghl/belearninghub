<template>
	<view class="icon-nav-wrap">
		<view class="icon-nav-item" v-for="(item,index) in list" :key="index" hover-class="bg-light" @click="open(item)">
			<image :src="item.src" mode="aspectFill" class="icon-nav-img"></image>
			<text class="icon-nav-name">{{ item.name }}</text>
		</view>
	</view>
</template>

<script>
	export default {
		name:"icon-nav",
		props: {
			list: Array,
		},
		data() {
			return {
				
			};
		},
		methods: {
			open(item){
				console.log(item)
				if(item.type == 'webview'){
					this.$openWebview(item.url)
					return
				}
				// 优先用 item.url 直接跳（后端可指定任意页面）
				if(item.url){
					uni.navigateTo({ url: item.url });
					return
				}
				switch (item.module){
					case 'test':
					uni.navigateTo({ url: '/pages/test-list/test-list' });
						break;
					case 'my-test':
					uni.navigateTo({ url: '/pages/my-test/my-test' });
						break;
					case 'bbs':
					uni.navigateTo({ url: '/pages/bbs/bbs' });
						break;
					case "book":
					uni.navigateTo({ url: '/pages/book-list/book-list' });
						break;
					case "my-book":
					uni.navigateTo({ url: '/pages/my-book/my-book' });
						break;
					default:
					uni.navigateTo({ url: '/pages/list/list?module='+item.module });
						break;
				}
			}
		},
	}
</script>

<style>
	.icon-nav-wrap {
		display: flex;
		flex-wrap: wrap;
		padding: 6px 0;
	}
	.icon-nav-item {
		width: 25%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 10px 0;
	}
	.icon-nav-img {
		width: 36px !important;
		height: 36px !important;
		border-radius: 50%;
		display: block;
	}
	.icon-nav-name {
		font-size: 13px;
		color: #555;
		margin-top: 8px;
	}
</style>
