<template>
	<view :class="isPC ? 'pc-mode' : ''">
		<!-- #ifdef APP-PLUS -->
		<uni-status-bar bgColor="#ffffff"></uni-status-bar>
		<!-- #endif -->

		<!-- PC 顶部导航栏 -->
		<!-- #ifdef H5 -->
		<pc-header v-if="isPC" active="index"></pc-header>
		<!-- #endif -->

		<index-skeleton v-if="loading"></index-skeleton>

		<view class="index-page animate__animated animate__fadeIn animate__fast" :class="isPC ? 'index-page-pc' : ''" v-else>
			<block v-for="(item,index) in templates" :key="index">
				<!-- 搜索框：贴顶，无卡片（PC 上搜索在顶栏，这里隐藏） -->
				<f-search-bar v-if="item.type == 'search' && !isPC" :placeholder="item.placeholder"></f-search-bar>

				<!-- 轮播图：卡片化，左右留白 + 圆角 -->
				<view v-else-if="item.type == 'swiper'" class="idx-card idx-swiper-card">
					<swiper :indicator-dots="true" :autoplay="true" :interval="3000" :duration="1000" indicator-active-color="#ffffff" indicator-color="rgba(255,255,255,0.5)" style="height: 160px; width: 100%; border-radius: 12px; overflow: hidden;">
						<swiper-item v-for="(s,sI) in item.data" :key="sI" @click="swiperClick(s)" style="overflow:hidden;">
							<image :src="s.src" mode="aspectFill" style="width: 100%; height: 160px; border-radius: 12px; display:block;"></image>
						</swiper-item>
					</swiper>
				</view>

				<!-- 图标导航：白卡片 -->
				<view v-else-if="item.type == 'icons'" class="idx-card">
					<icon-nav :list="item.data"></icon-nav>
				</view>

				<!-- 优惠券 -->
				<coupon-list ref="couponList" v-else-if="item.type == 'coupon'"></coupon-list>

				<view v-else-if="item.type == 'promotion'" class="idx-card">
					<active-list :type="item.listType"></active-list>
				</view>

				<!-- 内容板块：按 dataType 渲染（课程/专栏=course-list，图书=book-list，题库=简单卡） -->
				<view v-else-if="item.type == 'list'" class="idx-list-section">
					<view class="flex align-center justify-between idx-section-head">
						<text class="font-md font-weight-bold">{{ item.title }}</text>
						<text class="font-sm text-light-muted" v-if="item.showMore" @click="openSectionMore(item)">查看更多</text>
					</view>
					<!-- 图书 -->
					<view v-if="item.dataType == 'book'" :class="isPC ? 'idx-course-grid' : ''">
						<book-list v-for="(b,bi) in item.data" :key="bi" :item="b"></book-list>
					</view>
					<!-- 题库 -->
					<view v-else-if="item.dataType == 'testpaper'">
						<view class="idx-tp-card" v-for="(tp,ti) in item.data" :key="ti" @click="openTestpaper(tp)">
							<text class="idx-tp-title">📝 {{ tp.title }}</text>
							<text class="idx-tp-meta">{{ tp.question_count || 0 }} 题 · {{ tp.is_test==1 ? '考试' : '练习' }}</text>
						</view>
					</view>
					<!-- 课程 / 专栏 -->
					<view v-else :class="isPC ? 'idx-course-grid' : ''">
						<course-list :type="item.listType" v-for="(item2,index2) in item.data" :key="index2" :item="item2"></course-list>
					</view>
				</view>

				<view v-else-if="item.type == 'imageAd'" class="idx-card idx-swiper-card">
					<image :src="item.data" mode="aspectFill" style="width: 100%;height: 320rpx; border-radius: 16rpx;" @click="imageAdClick(item)"></image>
				</view>

			</block>
		</view>

		<!-- PC 页脚 -->
		<!-- #ifdef H5 -->
		<pc-footer v-if="isPC && !loading"></pc-footer>
		<!-- #endif -->

	</view>
</template>

<script>
	import indexSkeleton from './index-skeleton.vue';
	export default {
		components: {
			indexSkeleton
		},
		data() {
			return {
				loading:false,
				
				templates:[]
			}
		},
		onPullDownRefresh() {
			this.getData()
			this.refreshCouponList()
		},
		created() {
			this.loading = true
			this.getData()
			
			uni.$on('userLogin',this.refreshCouponList)
			uni.$on('userLogout',this.refreshCouponList)
		},
		destroyed() {
			uni.$off('userLogin',this.refreshCouponList)
			uni.$off('userLogout',this.refreshCouponList)
		},
		methods: {
			imageAdClick(item){
				console.log(item);
			},
			swiperClick(s){
				if(s.type == 'webview'){
					if(!s.url){ return }   // 未配置跳转链接的轮播图不响应
					this.$openWebview(s.url)
				} else if(s.type == 'course'){
					uni.navigateTo({
						url: '/pages/course/course?id='+s.course_id,
					});
				}
			},
			refreshCouponList(){
				if(this.$refs.couponList && this.$refs.couponList[0]){
					this.$refs.couponList[0].getData()
				}
			},
			getData(){
				this.$api.getIndexData().then(data=>{
					this.templates = data
				}).finally(()=>{
					this.loading = false
					uni.stopPullDownRefresh()
				})
			},
			openCourseList(){
				uni.navigateTo({
					url: '../../list/list?module=course',
				});
			},
			// 板块"查看更多"：按类型跳对应列表页
			openSectionMore(item){
				const t = item.dataType
				if(t == 'book') uni.navigateTo({ url: '/pages/book-list/book-list' })
				else if(t == 'testpaper') uni.navigateTo({ url: '/pages/test-list/test-list' })
				else if(t == 'column') uni.navigateTo({ url: '/pages/list/list?module=column' })
				else uni.navigateTo({ url: '/pages/list/list?module=course' })
			},
			openTestpaper(tp){
				uni.navigateTo({ url: '/pages/test-list/test-list' })
			}
		}
	}
</script>

<style>
	/* 首页整体浅灰背景，让白卡片浮起来 */
	.index-page {
		background-color: #f2f3f5;
		min-height: 100%;
		padding-bottom: 16px;
	}

	/* ===== PC 宽屏版 ===== */
	/* #ifdef H5 */
	.pc-mode {
		background-color: #f2f3f5;
		min-height: 100vh;
	}
	/* PC 下内容居中、留出顶栏高度，限制最大宽度 */
	.index-page-pc {
		max-width: 1100px;
		margin: 0 auto;
		padding-top: 76px !important;
		padding-bottom: 40px;
		background-color: transparent;
	}
	/* PC 下轮播图更高更大气 */
	.index-page-pc .idx-swiper-card swiper {
		height: 300px !important;
	}
	.index-page-pc .idx-swiper-card image {
		height: 300px !important;
	}
	/* 课程多列网格 */
	.idx-course-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
	}
	/* 网格内的课程卡片：去掉自带左右 margin，填满格子，禁止撑破 */
	.idx-course-grid :deep(.course) {
		width: 100% !important;
		min-width: 0 !important;
		margin: 0 !important;
		box-sizing: border-box;
	}
	.idx-course-grid :deep(.course-body) {
		min-width: 0 !important;
	}
	/* #endif */
	/* H5 固定导航栏(44px)会盖住搜索栏，补足顶部留白 */
	/* #ifdef H5 */
	.index-page {
		padding-top: 48px;
	}
	/* #endif */

	/* 通用白卡片：圆角 + 阴影 + 左右留白 + 模块间距 */
	.idx-card {
		background-color: #ffffff;
		margin: 12px 12px 0 12px;
		border-radius: 14px;
		box-shadow: 0 2px 12px rgba(0,0,0,0.05);
		overflow: hidden;
	}

	/* 轮播/广告卡片：内边距小一点，让图片更满 */
	.idx-swiper-card {
		padding: 10px;
	}

	/* 图标导航卡片内边距 */
	.idx-card :deep(icon-nav),
	.idx-card icon-nav {
		display: block;
		padding: 8px 0;
	}

	/* 课程列表区：标题在透明背景上，课程项各自成卡片 */
	.idx-list-section {
		margin-top: 6px;
	}
	.idx-section-head {
		padding: 14px 16px 8px 16px;
	}
	/* 题库板块卡片 */
	.idx-tp-card {
		display: flex;
		flex-direction: column;
		background-color: #fff;
		border-radius: 12px;
		margin: 0 12px 10px;
		padding: 14px 16px;
		box-shadow: 0 2px 10px rgba(0,0,0,0.05);
	}
	.idx-tp-title {
		font-size: 15px;
		color: #222;
		font-weight: 600;
	}
	.idx-tp-meta {
		font-size: 12px;
		color: #9aa0a6;
		margin-top: 6px;
	}
	/* #ifdef H5 */
	.index-page-pc .idx-tp-card { margin: 0 0 12px; }
	/* #endif */
</style>
