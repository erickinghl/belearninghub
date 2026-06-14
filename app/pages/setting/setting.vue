<template>
	<view class="set-page" :class="isPC ? 'pc-pad' : ''">
		<!-- #ifdef H5 -->
		<pc-header v-if="isPC"></pc-header>
		<!-- #endif -->
		<!-- 账号安全 -->
		<view class="set-group-title">账号安全</view>
		<view class="set-card">
			<view class="set-row" @click="navigateTo('/pages/user-safe/user-safe')">
				<text class="set-icon">🔑</text>
				<text class="set-label">修改密码</text>
				<text class="set-arrow">›</text>
			</view>
			<view class="set-row set-row-last" @click="navigateTo('/pages/bind-phone/bind-phone')">
				<text class="set-icon">📱</text>
				<text class="set-label">绑定手机号</text>
				<view class="set-value-box">
					<text class="set-value" :class="(user && user.phone) ? '' : 'set-value-gray'">{{ phoneText }}</text>
					<text class="set-arrow">›</text>
				</view>
			</view>
		</view>

		<!-- 通用 -->
		<view class="set-group-title">通用</view>
		<view class="set-card">
			<view class="set-row" @click="clearCache">
				<text class="set-icon">🧹</text>
				<text class="set-label">清除缓存</text>
				<view class="set-value-box">
					<text class="set-value">{{ cacheText }}</text>
					<text class="set-arrow">›</text>
				</view>
			</view>
			<view class="set-row set-row-last">
				<text class="set-icon">ℹ️</text>
				<text class="set-label">当前版本</text>
				<text class="set-value">v{{ version }}</text>
			</view>
		</view>

		<!-- 退出登录 -->
		<view class="set-logout-box" v-if="user">
			<view class="set-logout" @click="handleLogout">退出登录</view>
		</view>
	</view>
</template>

<script>
	import { mapState } from 'vuex'
	export default {
		data() {
			return {
				version: '1.0.0',
				cacheBytes: 0,
				cacheKeys: []
			}
		},
		computed: {
			...mapState({
				user: state => state.user
			}),
			phoneText() {
				const p = this.user && this.user.phone
				if (!p) return '未绑定'
				// 手机号脱敏：138****8000
				return p.length === 11 ? p.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : p
			},
			cacheText() {
				const b = this.cacheBytes
				if (!b) return '0 B'
				if (b < 1024) return b + ' B'
				if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB'
				return (b / 1024 / 1024).toFixed(1) + ' MB'
			}
		},
		created() {
			this.getCacheSize()
		},
		methods: {
			navigateTo(url) {
				uni.navigateTo({ url })
			},
			getCacheSize() {
				uni.getStorageInfo({
					success: (res) => {
						// 不清 user / token，避免清缓存后被登出
						this.cacheKeys = res.keys.filter(k => k !== 'user' && k !== 'token')
						this.cacheBytes = (res.currentSize || 0) * 1024  // currentSize 单位是 KB
					}
				})
			},
			clearCache() {
				uni.showModal({
					content: '是否清除缓存？（不影响登录）',
					success: (res) => {
						if (res.cancel) return
						this.cacheKeys.forEach(k => uni.removeStorageSync(k))
						this.$toast('清除成功')
						this.getCacheSize()
					}
				})
			},
			handleLogout() {
				uni.showModal({
					content: '确定要退出登录吗？',
					success: (res) => {
						if (res.cancel) return
						if (this.$api.logout) this.$api.logout()
						this.$store.dispatch('logout')
						this.$toast('已退出登录')
						setTimeout(() => {
							uni.reLaunch({ url: '/pages/tabbar/index/index' })
						}, 600)
					}
				})
			}
		}
	}
</script>

<style>
	.set-page {
		min-height: 100vh;
		background-color: #f5f6f8;
		padding-bottom: 30px;
	}
	/* #ifdef H5 */
	.set-page { padding-top: 44px; }
	/* #endif */

	.set-group-title {
		font-size: 13px;
		color: #9aa0a6;
		padding: 18px 16px 8px;
	}
	.set-card {
		background-color: #fff;
	}
	.set-row {
		display: flex;
		align-items: center;
		height: 54px;
		padding: 0 16px;
		border-bottom: 1px solid #f1f2f4;
	}
	.set-row-last {
		border-bottom: none;
	}
	.set-icon {
		font-size: 18px;
		width: 28px;
		flex-shrink: 0;
	}
	.set-label {
		flex: 1;
		font-size: 15px;
		color: #1a1a1a;
	}
	.set-value-box {
		display: flex;
		align-items: center;
	}
	.set-value {
		font-size: 14px;
		color: #999;
	}
	.set-value-gray {
		color: #c0c4cc;
	}
	.set-arrow {
		font-size: 18px;
		color: #c8ccd1;
		margin-left: 6px;
	}

	.set-logout-box {
		padding: 30px 16px 0;
	}
	.set-logout {
		height: 46px;
		line-height: 46px;
		text-align: center;
		font-size: 16px;
		color: #ff5b5b;
		background-color: #fff;
		border-radius: 12px;
	}
</style>
