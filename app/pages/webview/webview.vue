<template>
    <view class="wv-wrap">
        <!-- 自带返回栏，避免 H5 默认返回失效 -->
        <view class="wv-bar">
            <text class="wv-back" @click="goBack">‹ 返回</text>
        </view>
        <web-view v-if="url" :webview-styles="webviewStyles" :src="url"></web-view>
        <view v-else class="wv-empty">
            <text>该内容暂未配置链接</text>
        </view>
    </view>
</template>

<script>
    export default {
        data() {
            return {
                webviewStyles: {
                    progress: {
                        color: '#FF3333'
                    }
                },
				url:""
            }
        },
		onLoad(e) {
			this.url = e.url ? decodeURIComponent(e.url) : ""
			// 空链接：提示并自动返回
			if(!this.url){
				this.$toast('该内容暂未配置链接')
				setTimeout(()=>{ this.goBack() }, 800)
			}
		},
		methods: {
			goBack(){
				// 优先返回上一页，没有则回首页
				const pages = getCurrentPages()
				if(pages.length > 1){
					uni.navigateBack({ delta: 1 })
				} else {
					uni.switchTab({ url: '/pages/tabbar/index/index' })
				}
			}
		}
    }
</script>

<style>
	.wv-wrap {
		display: flex;
		flex-direction: column;
		height: 100vh;
	}
	.wv-bar {
		height: 44px;
		display: flex;
		align-items: center;
		padding-left: 12px;
		background-color: #fff;
		border-bottom: 1px solid #f0f0f0;
	}
	.wv-back {
		font-size: 15px;
		color: #333;
	}
	.wv-empty {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #bbb;
		font-size: 15px;
	}
</style>
