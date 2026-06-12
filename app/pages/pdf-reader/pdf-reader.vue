<template>
	<view class="pdf-wrap">
		<!-- #ifdef H5 -->
		<iframe v-if="viewerUrl" :src="viewerUrl" frameborder="0" class="pdf-frame"></iframe>
		<!-- #endif -->
		<!-- #ifndef H5 -->
		<web-view v-if="viewerUrl" :src="viewerUrl"></web-view>
		<!-- #endif -->
		<view v-if="!viewerUrl" class="flex justify-center py-5 text-muted">加载中...</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				viewerUrl: ""
			}
		},
		onLoad(e) {
			// 参数：url=PDF文件地址（已 encode），title=书名
			let pdfUrl = e.url ? decodeURIComponent(e.url) : ""
			if (!pdfUrl) {
				this.$toast('缺少 PDF 地址')
				setTimeout(() => uni.navigateBack({ delta: 1 }), 700)
				return
			}
			if (e.title) {
				uni.setNavigationBarTitle({ title: decodeURIComponent(e.title) })
			}
			// 本地 pdf.js viewer，file 参数指向 PDF
			// H5 下 static 映射到根，路径 /static/pdfjs/web/viewer.html
			const viewer = '/static/pdfjs/web/viewer.html'
			this.viewerUrl = viewer + '?file=' + encodeURIComponent(pdfUrl)
		}
	}
</script>

<style>
	.pdf-wrap {
		width: 100%;
		height: 100vh;
	}
	.pdf-frame {
		width: 100%;
		height: 100vh;
		border: none;
	}
</style>
