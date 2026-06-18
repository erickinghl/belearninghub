<template>
	<!-- 仅 PC 宽屏显示的页脚（居中三行：社交图标 / 快捷链接 / 版权） -->
	<view class="pcf-wrap">
		<!-- 第一行：社交平台图标 -->
		<view class="pcf-socials" v-if="socials.length">
			<view class="pcf-social" v-for="(s,i) in socials" :key="i" @click="openSocial(s)" :title="s.name">
				<image v-if="s.icon && s.icon.indexOf('/')>-1" class="pcf-social-img" :src="s.icon" mode="aspectFit"></image>
				<text v-else class="pcf-social-emoji">{{ s.icon || s.name.slice(0,2) }}</text>
				<text class="pcf-social-name">{{ s.name }}</text>
			</view>
		</view>

		<!-- 第二行：快捷链接 -->
		<view class="pcf-links" v-if="cfg.footer_links && cfg.footer_links.length">
			<text class="pcf-link" v-for="(l,i) in cfg.footer_links" :key="i" @click="openLink(l)">{{ l.name }}</text>
		</view>

		<!-- 第三行：联系方式（可选，居中一行） -->
		<view class="pcf-contact-row" v-if="hasContact">
			<text class="pcf-contact" v-if="cfg.contact_phone">📞 {{ cfg.contact_phone }}</text>
			<text class="pcf-contact" v-if="cfg.contact_email">✉️ {{ cfg.contact_email }}</text>
			<text class="pcf-contact" v-if="cfg.contact_address">📍 {{ cfg.contact_address }}</text>
		</view>

		<!-- 第四行：版权 -->
		<view class="pcf-copy">
			<text class="pcf-copy-text">{{ cfg.copyright || ('© ' + year + ' EduYi 易教') }}</text>
			<text class="pcf-copy-text pcf-copy-link" v-if="cfg.icp" @click="openIcp">{{ cfg.icp }}</text>
		</view>
	</view>
</template>

<script>
	import { mapState } from 'vuex'
	export default {
		name: 'pc-footer',
		computed: {
			...mapState({ cfg: state => state.siteConfig || {} }),
			year() { return new Date().getFullYear() },
			hasContact() { return this.cfg.contact_phone || this.cfg.contact_email || this.cfg.contact_address },
			socials() { return (this.cfg.footer_socials && Array.isArray(this.cfg.footer_socials)) ? this.cfg.footer_socials : [] }
		},
		methods: {
			openSocial(s) {
				if (!s.url) return
				// #ifdef H5
				window.open(s.url, '_blank')
				// #endif
				// #ifndef H5
				uni.navigateTo({ url: '/pages/webview/webview?url=' + encodeURIComponent(s.url) })
				// #endif
			},
			openLink(l) {
				if (!l.url) return
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
		background-color: #ffffff;
		border-top: 1px solid #eef0f2;
		margin-top: 40px;
		padding: 36px 24px 28px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	/* 第一行：社交图标，居中横排 */
	.pcf-socials {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
		align-items: flex-start;
		gap: 28px;
		margin-bottom: 24px;
	}
	.pcf-social {
		display: flex;
		flex-direction: column;
		align-items: center;
		cursor: pointer;
		width: 56px;
	}
	.pcf-social-img {
		width: 30px;
		height: 30px;
	}
	.pcf-social-emoji {
		font-size: 26px;
		line-height: 1;
	}
	.pcf-social-name {
		font-size: 12px;
		color: #8a9099;
		margin-top: 8px;
		white-space: nowrap;
	}
	.pcf-social:hover .pcf-social-name {
		color: #43b876;
	}
	/* 第二行：快捷链接，居中横排带下划线 */
	.pcf-links {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
		gap: 32px;
		margin-bottom: 18px;
	}
	.pcf-link {
		font-size: 14px;
		color: #555;
		cursor: pointer;
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.pcf-link:hover {
		color: #43b876;
	}
	/* 第三行：联系方式 */
	.pcf-contact-row {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
		gap: 24px;
		margin-bottom: 16px;
	}
	.pcf-contact {
		font-size: 13px;
		color: #8a9099;
	}
	/* 第四行：版权，居中 */
	.pcf-copy {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
		gap: 16px;
		padding-top: 16px;
		border-top: 1px solid #f2f3f5;
		width: 100%;
		max-width: 900px;
	}
	.pcf-copy-text {
		font-size: 12px;
		color: #a8acb3;
	}
	.pcf-copy-link {
		cursor: pointer;
	}
	.pcf-copy-link:hover {
		color: #666;
	}
</style>
