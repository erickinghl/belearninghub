<template>
	<!-- 仅 PC 宽屏显示的页脚 -->
	<view class="pcf-wrap">
		<view class="pcf-inner">
			<!-- 品牌区 -->
			<view class="pcf-brand">
				<view class="pcf-logo-row">
					<image v-if="cfg.site_logo" class="pcf-logo-img" :src="cfg.site_logo" mode="aspectFit"></image>
					<text v-else class="pcf-logo-emoji">📚</text>
					<text class="pcf-name">{{ cfg.site_name || 'EduYi 易教' }}</text>
				</view>
				<text class="pcf-desc">{{ cfg.site_desc }}</text>
			</view>

			<!-- 快捷链接 -->
			<view class="pcf-col" v-if="cfg.footer_links && cfg.footer_links.length">
				<text class="pcf-col-title">快捷导航</text>
				<text class="pcf-link" v-for="(l,i) in cfg.footer_links" :key="i" @click="openLink(l)">{{ l.name }}</text>
			</view>

			<!-- 联系方式 -->
			<view class="pcf-col" v-if="hasContact">
				<text class="pcf-col-title">联系我们</text>
				<text class="pcf-contact" v-if="cfg.contact_phone">📞 {{ cfg.contact_phone }}</text>
				<text class="pcf-contact" v-if="cfg.contact_email">✉️ {{ cfg.contact_email }}</text>
				<text class="pcf-contact" v-if="cfg.contact_address">📍 {{ cfg.contact_address }}</text>
			</view>
		</view>

		<!-- 版权条 -->
		<view class="pcf-copy">
			<text class="pcf-copy-text">{{ cfg.copyright || ('© ' + year + ' EduYi 易教') }}</text>
			<text class="pcf-copy-text" v-if="cfg.icp" @click="openIcp">{{ cfg.icp }}</text>
		</view>
	</view>
</template>

<script>
	import { mapState } from 'vuex'
	export default {
		name: 'pc-footer',
		computed: {
			...mapState({ cfg: state => state.siteConfig || {} }),
			year() {
				return new Date().getFullYear()
			},
			hasContact() {
				return this.cfg.contact_phone || this.cfg.contact_email || this.cfg.contact_address
			}
		},
		methods: {
			openLink(l) {
				if (!l.url) return
				// 站内页面路径用 navigateTo，http 外链用 webview
				if (l.url.indexOf('http') === 0) {
					// #ifdef H5
					window.open(l.url, '_blank')
					// #endif
					// #ifndef H5
					uni.navigateTo({ url: '/pages/webview/webview?url=' + encodeURIComponent(l.url) })
					// #endif
				} else {
					uni.navigateTo({ url: l.url })
				}
			},
			openIcp() {
				// #ifdef H5
				window.open('https://beian.miit.gov.cn/', '_blank')
				// #endif
			}
		}
	}
</script>

<style>
	.pcf-wrap {
		background-color: #2b2f38;
		margin-top: 40px;
	}
	.pcf-inner {
		max-width: 1100px;
		margin: 0 auto;
		padding: 40px 24px 28px;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: 60px;
	}
	/* 品牌区 */
	.pcf-brand {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 240px;
		max-width: 360px;
	}
	.pcf-logo-row {
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	.pcf-logo-img {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		margin-right: 10px;
	}
	.pcf-logo-emoji {
		font-size: 26px;
		margin-right: 10px;
	}
	.pcf-name {
		font-size: 20px;
		font-weight: 700;
		color: #fff;
	}
	.pcf-desc {
		font-size: 13px;
		color: #9aa0a6;
		line-height: 1.8;
		margin-top: 14px;
	}
	/* 列 */
	.pcf-col {
		display: flex;
		flex-direction: column;
	}
	.pcf-col-title {
		font-size: 15px;
		font-weight: 600;
		color: #fff;
		margin-bottom: 16px;
	}
	.pcf-link {
		font-size: 13px;
		color: #9aa0a6;
		line-height: 1;
		margin-bottom: 14px;
		cursor: pointer;
	}
	.pcf-link:hover {
		color: #43b876;
	}
	.pcf-contact {
		font-size: 13px;
		color: #9aa0a6;
		line-height: 1;
		margin-bottom: 14px;
	}
	/* 版权条 */
	.pcf-copy {
		border-top: 1px solid #3a3f49;
		padding: 18px 24px;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: 20px;
	}
	.pcf-copy-text {
		font-size: 12px;
		color: #6b7280;
	}
	.pcf-copy-text:hover {
		color: #9aa0a6;
		cursor: pointer;
	}
</style>
