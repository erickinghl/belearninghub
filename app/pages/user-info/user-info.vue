<template>
	<view class="ui-page" :class="isPC ? 'pc-pad' : ''">
		<!-- #ifdef H5 -->
		<pc-header v-if="isPC"></pc-header>
		<!-- #endif -->
		<!-- 头像区：大圆头像居中，可点击更换 -->
		<view class="ui-avatar-box" @click="changeAvatar">
			<view class="ui-avatar-wrap">
				<image class="ui-avatar" :src="form.avatar || $store.state.defaultAvatar" mode="aspectFill"></image>
				<view class="ui-avatar-cam">
					<text class="ui-cam-icon">📷</text>
				</view>
			</view>
			<text class="ui-avatar-tip">{{ uploading ? '上传中…' : '点击更换头像' }}</text>
		</view>

		<!-- 资料卡片 -->
		<view class="ui-card">
			<view class="ui-row">
				<text class="ui-label">昵称</text>
				<input class="ui-input" v-model="form.nickname" type="text" placeholder="未填写" placeholder-class="ui-ph" />
			</view>
			<view class="ui-row" @click="changeSex">
				<text class="ui-label">性别</text>
				<view class="ui-value-box">
					<text class="ui-value">{{ form.sex || '保密' }}</text>
					<text class="ui-arrow">›</text>
				</view>
			</view>
			<view class="ui-row ui-row-last" @click="navigateTo('/pages/bind-phone/bind-phone')">
				<text class="ui-label">手机</text>
				<view class="ui-value-box">
					<text class="ui-value" :class="(user && user.phone) ? '' : 'ui-value-gray'">{{ (user && user.phone) || '未绑定' }}</text>
					<text class="ui-arrow">›</text>
				</view>
			</view>
		</view>

		<!-- 提交 -->
		<view class="ui-submit-box">
			<view class="ui-submit" :class="submitting ? 'ui-submit-disabled' : ''" @click="submit">{{ submitting ? '提交中…' : '保存' }}</view>
		</view>

		<!-- 性别选择底部弹层（替代 H5 下会遮挡的 showActionSheet） -->
		<view class="ui-sheet-mask" v-if="sexSheet" @click="sexSheet = false">
			<view class="ui-sheet" @click.stop>
				<view class="ui-sheet-title">选择性别</view>
				<view class="ui-sheet-opt" v-for="(s,si) in sexOptions" :key="si"
					:class="form.sex === s ? 'ui-sheet-opt-on' : ''" @click="pickSex(s)">
					{{ s }}
					<text class="ui-sheet-check" v-if="form.sex === s">✓</text>
				</view>
				<view class="ui-sheet-cancel" @click="sexSheet = false">取消</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { mapState } from 'vuex'
	export default {
		computed: {
			...mapState({
				user: state => state.user
			})
		},
		data() {
			return {
				uploading: false,
				submitting: false,
				sexSheet: false,
				sexOptions: ['男', '女', '保密'],
				form: {
					avatar: '',
					nickname: '',
					sex: '保密'
				}
			}
		},
		created() {
			const u = this.user || {}
			this.form = {
				avatar: u.avatar || '',
				nickname: u.nickname || '',
				sex: u.sex || '保密'
			}
		},
		methods: {
			navigateTo(url) {
				uni.navigateTo({ url })
			},
			changeAvatar() {
				if (this.uploading) return
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],          // 优先压缩图，大图自动变小
					sourceType: ['album', 'camera'],
					success: (res) => {
						const path = res.tempFilePaths[0]
						this.doCompressUpload(path)
					}
				})
			},
			// 先尝试压缩再上传（H5 下 compressImage 可能不支持，失败则直接传）
			doCompressUpload(path) {
				this.uploading = true
				// #ifndef H5
				uni.compressImage({
					src: path,
					quality: 80,
					success: (r) => this.uploadAvatar(r.tempFilePath || path),
					fail: () => this.uploadAvatar(path)
				})
				// #endif
				// #ifdef H5
				// H5: chooseImage 已用 compressed，sizeType 已压缩；直接上传
				this.uploadAvatar(path)
				// #endif
			},
			uploadAvatar(path) {
				this.$api.upload(path).then((data) => {
					// 后端返回 { url }
					const url = (data && data.url) ? data.url : data
					this.form.avatar = url
					this.uploading = false
					this.$toast('头像已更新，记得点保存')
				}).catch(() => {
					this.uploading = false
					this.$toast('头像上传失败')
				})
			},
			changeSex() {
				this.sexSheet = true
			},
			pickSex(s) {
				this.form.sex = s
				this.sexSheet = false
			},
			submit() {
				if (this.submitting) return
				this.submitting = true
				uni.showLoading({ title: '提交中...' })
				let d = Object.assign({}, this.form)
				this.$api.updateInfo(d).then(() => {
					this.$store.dispatch('updateInfo', d)
					this.$toast('保存成功')
					setTimeout(() => uni.navigateBack({ delta: 1 }), 600)
				}).catch(() => {
					this.$toast('保存失败')
				}).finally(() => {
					this.submitting = false
					uni.hideLoading()
				})
			}
		}
	}
</script>

<style>
	.ui-page {
		min-height: 100vh;
		background-color: #f5f6f8;
	}
	/* #ifdef H5 */
	.ui-page { padding-top: 44px; }
	/* #endif */

	/* 头像区 */
	.ui-avatar-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 28px 0 22px;
		background-color: #fff;
	}
	.ui-avatar-wrap {
		position: relative;
		width: 88px;
		height: 88px;
	}
	.ui-avatar {
		width: 88px;
		height: 88px;
		border-radius: 50%;
		background-color: #eceef1;
		border: 2px solid #fff;
		box-shadow: 0 2px 10px rgba(0,0,0,0.08);
	}
	.ui-avatar-cam {
		position: absolute;
		right: 0;
		bottom: 0;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background-color: #43b876;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid #fff;
	}
	.ui-cam-icon {
		font-size: 14px;
		line-height: 1;
	}
	.ui-avatar-tip {
		margin-top: 12px;
		font-size: 13px;
		color: #9aa0a6;
	}

	/* 资料卡片 */
	.ui-card {
		margin: 12px 0 0;
		background-color: #fff;
	}
	.ui-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 54px;
		padding: 0 16px;
		border-bottom: 1px solid #f1f2f4;
	}
	.ui-row-last {
		border-bottom: none;
	}
	.ui-label {
		font-size: 15px;
		color: #1a1a1a;
		flex-shrink: 0;
	}
	.ui-input {
		flex: 1;
		text-align: right;
		font-size: 15px;
		color: #333;
		margin-left: 16px;
		height: 54px;
	}
	.ui-ph {
		color: #c0c4cc;
	}
	.ui-value-box {
		display: flex;
		align-items: center;
	}
	.ui-value {
		font-size: 15px;
		color: #333;
	}
	.ui-value-gray {
		color: #c0c4cc;
	}
	.ui-arrow {
		font-size: 18px;
		color: #c8ccd1;
		margin-left: 6px;
	}

	/* 提交按钮 */
	.ui-submit-box {
		padding: 28px 16px 0;
	}
	.ui-submit {
		height: 46px;
		line-height: 46px;
		text-align: center;
		font-size: 16px;
		color: #fff;
		background-color: #43b876;
		border-radius: 24px;
		box-shadow: 0 4px 12px rgba(67,184,118,0.3);
	}
	.ui-submit-disabled {
		opacity: 0.6;
	}

	/* 性别底部弹层 */
	.ui-sheet-mask {
		position: fixed;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0,0,0,0.45);
		z-index: 999;
		display: flex;
		align-items: flex-end;
	}
	.ui-sheet {
		width: 100%;
		background-color: #fff;
		border-radius: 16px 16px 0 0;
		padding-bottom: 8px;
		/* #ifdef H5 */
		padding-bottom: 16px;
		/* #endif */
	}
	.ui-sheet-title {
		text-align: center;
		font-size: 14px;
		color: #9aa0a6;
		padding: 16px 0 8px;
	}
	.ui-sheet-opt {
		position: relative;
		text-align: center;
		font-size: 16px;
		color: #1a1a1a;
		padding: 15px 0;
		border-top: 1px solid #f1f2f4;
	}
	.ui-sheet-opt-on {
		color: #43b876;
		font-weight: 600;
	}
	.ui-sheet-check {
		position: absolute;
		right: 28px;
		color: #43b876;
	}
	.ui-sheet-cancel {
		text-align: center;
		font-size: 16px;
		color: #666;
		padding: 15px 0;
		margin-top: 8px;
		border-top: 6px solid #f5f6f8;
	}
</style>
