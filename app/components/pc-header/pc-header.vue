<template>
	<!-- 仅 PC 宽屏显示的顶部导航栏 -->
	<view class="pch-wrap">
		<view class="pch-inner">
			<!-- Logo -->
			<view class="pch-logo" @click="go('/pages/tabbar/index/index', true)">
				<text class="pch-logo-icon">📚</text>
				<text class="pch-logo-text">在线教育</text>
			</view>

			<!-- 主导航 -->
			<view class="pch-nav">
				<text class="pch-nav-item" :class="active==='index'?'pch-on':''" @click="go('/pages/tabbar/index/index', true)">首页</text>
				<text class="pch-nav-item" :class="active==='course'?'pch-on':''" @click="go('/pages/list/list?module=course')">课程</text>
				<text class="pch-nav-item" :class="active==='test'?'pch-on':''" @click="go('/pages/test-list/test-list')">题库</text>
				<text class="pch-nav-item" :class="active==='book'?'pch-on':''" @click="go('/pages/book-list/book-list')">电子书</text>
				<text class="pch-nav-item" :class="active==='column'?'pch-on':''" @click="go('/pages/list/list?module=column')">专栏</text>
				<text class="pch-nav-item" :class="active==='learn'?'pch-on':''" @click="go('/pages/tabbar/learn/learn', true)">学习</text>
			</view>

			<!-- 搜索 -->
			<view class="pch-search" @click="go('/pages/search/search')">
				<text class="pch-search-icon">🔍</text>
				<text class="pch-search-ph">搜索课程 / 题库</text>
			</view>

			<!-- 用户 -->
			<view class="pch-user" @click="go('/pages/tabbar/home/home', true)">
				<image v-if="user && user.avatar" class="pch-avatar" :src="user.avatar" mode="aspectFill"></image>
				<text v-else class="pch-avatar pch-avatar-default">👤</text>
				<text class="pch-user-name">{{ user ? (user.nickname || user.username) : '登录' }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { mapState } from 'vuex'
	export default {
		name: 'pc-header',
		props: {
			// 当前高亮的导航项：index/course/test/book/column/learn
			active: { type: String, default: '' }
		},
		computed: {
			...mapState({ user: state => state.user })
		},
		methods: {
			go(url, isTab) {
				if (isTab) {
					uni.switchTab({ url, fail: () => uni.navigateTo({ url }) })
				} else {
					uni.navigateTo({ url })
				}
			}
		}
	}
</script>

<style>
	.pch-wrap {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 60px;
		background-color: #fff;
		box-shadow: 0 1px 8px rgba(0,0,0,0.06);
		z-index: 500;
	}
	.pch-inner {
		max-width: 1180px;
		height: 60px;
		margin: 0 auto;
		padding: 0 24px;
		display: flex;
		flex-direction: row;
		align-items: center;
		box-sizing: border-box;
	}
	.pch-logo {
		display: flex;
		flex-direction: row;
		align-items: center;
		cursor: pointer;
		margin-right: 40px;
		flex-shrink: 0;
	}
	.pch-logo-icon {
		font-size: 24px;
		margin-right: 8px;
	}
	.pch-logo-text {
		font-size: 19px;
		font-weight: 700;
		color: #1a1a1a;
	}
	.pch-nav {
		display: flex;
		flex-direction: row;
		align-items: center;
		flex: 1;
	}
	.pch-nav-item {
		font-size: 15px;
		color: #555;
		margin-right: 30px;
		cursor: pointer;
		position: relative;
		line-height: 60px;
	}
	.pch-nav-item:hover {
		color: #43b876;
	}
	.pch-on {
		color: #43b876;
		font-weight: 600;
	}
	.pch-search {
		display: flex;
		flex-direction: row;
		align-items: center;
		width: 220px;
		height: 38px;
		background-color: #f4f5f7;
		border-radius: 19px;
		padding: 0 16px;
		margin-right: 24px;
		cursor: pointer;
		box-sizing: border-box;
		flex-shrink: 0;
	}
	.pch-search-icon {
		font-size: 14px;
		margin-right: 8px;
	}
	.pch-search-ph {
		font-size: 13px;
		color: #aaa;
	}
	.pch-user {
		display: flex;
		flex-direction: row;
		align-items: center;
		cursor: pointer;
		flex-shrink: 0;
	}
	.pch-avatar {
		width: 34px;
		height: 34px;
		border-radius: 50%;
		background-color: #eceef1;
		margin-right: 8px;
	}
	.pch-avatar-default {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 18px;
	}
	.pch-user-name {
		font-size: 14px;
		color: #333;
		max-width: 80px;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
</style>
