<template>
	<view class="bp-page">
		<!-- 返回按钮 -->
		<view class="bp-back" @click="back">
			<text class="bp-back-arrow">‹</text>
		</view>
		<view class="bp-header">
			<text class="bp-title">绑定手机号</text>
			<text class="bp-sub">绑定后可用于登录、找回密码与接收通知</text>
		</view>

		<!-- 测试模式验证码提示条（常驻不消失，方便没接短信时直接看到/已自动填入） -->
		<view class="bp-devtip" v-if="devCode">
			<text class="bp-devtip-icon">💡</text>
			<text class="bp-devtip-text">测试验证码：<text class="bp-devtip-code">{{ devCode }}</text>（已自动填入，直接点绑定）</text>
		</view>

		<view class="bp-card">
			<!-- 手机号 -->
			<view class="bp-row">
				<text class="bp-icon">📱</text>
				<input class="bp-input" type="number" maxlength="11" placeholder="请输入手机号"
					placeholder-class="bp-ph" v-model="form.phone" />
			</view>
			<!-- 验证码 -->
			<view class="bp-row bp-row-last">
				<text class="bp-icon">🔒</text>
				<input class="bp-input" type="number" maxlength="6" placeholder="请输入验证码"
					placeholder-class="bp-ph" v-model="form.code" />
				<view class="bp-code-btn" :class="time > 0 ? 'bp-code-disabled' : ''" @click="sendCode">
					{{ time > 0 ? (time + 's') : '获取验证码' }}
				</view>
			</view>
		</view>

		<view class="bp-submit-box">
			<view class="bp-submit" :class="submitting ? 'bp-submit-disabled' : ''" @click="submit">{{ submitting ? '绑定中…' : '绑 定' }}</view>
		</view>
	</view>
</template>

<script>
	let timer = null
	export default {
		data() {
			return {
				submitting: false,
				time: 0,
				devCode: '',     // 测试模式下显示的验证码
				form: {
					phone: "",
					code: ""
				}
			}
		},
		beforeDestroy() {
			if (timer) clearInterval(timer)
		},
		methods: {
			back() {
				// 优先返回上一页；若导航栈里没有上一页（如直接打开/刷新），兜底回「我的」tab
				const pages = getCurrentPages()
				if (pages.length > 1) {
					uni.navigateBack({ delta: 1 })
				} else {
					uni.switchTab({
						url: '/pages/tabbar/home/home',
						fail: () => {
							uni.reLaunch({ url: '/pages/tabbar/home/home' })
						}
					})
				}
			},
			validPhone() {
				return /^1\d{10}$/.test(this.form.phone)
			},
			sendCode() {
				if (this.time > 0) return
				if (!this.validPhone()) return this.$toast('请输入正确的手机号')
				this.$api.getCaptcha({ phone: this.form.phone }).then(res => {
					// 模拟验证码：后端直接返回数字 → 常驻提示条显示 + 自动填入输入框
					if (typeof res === 'number' || /^\d{4,6}$/.test(res)) {
						this.devCode = String(res)
						this.form.code = String(res)   // 自动填入，免手抄
						this.$toast('验证码已发送并自动填入')
					} else {
						this.$toast('发送成功')
					}
					this.time = 60
					timer = setInterval(() => {
						this.time--
						if (this.time <= 0) clearInterval(timer)
					}, 1000)
				})
			},
			submit() {
				if (this.submitting) return
				if (!this.validPhone()) return this.$toast('请输入正确的手机号')
				if (!this.form.code) return this.$toast('请输入验证码')
				this.submitting = true
				uni.showLoading({ title: '提交中...', mask: false })
				let data = Object.assign({}, this.form)
				this.$api.bindMobile(data).then(() => {
					this.$toast('绑定成功')
					this.$store.dispatch('updateInfo', { phone: data.phone })
					setTimeout(() => this.back(), 500)
				}).catch(() => {
					this.$toast('绑定失败')
				}).finally(() => {
					this.submitting = false
					uni.hideLoading()
				})
			}
		}
	}
</script>

<style>
	.bp-page {
		min-height: 100vh;
		background-color: #f5f6f8;
	}
	/* #ifdef H5 */
	.bp-page { padding-top: 44px; }
	/* #endif */

	.bp-back {
		position: absolute;
		left: 8px;
		top: 8px;
		width: 38px;
		height: 38px;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10;
	}
	/* #ifdef H5 */
	.bp-back { top: 50px; }
	/* #endif */
	.bp-back-arrow {
		font-size: 30px;
		color: #1a1a1a;
		line-height: 1;
	}

	.bp-header {
		padding: 20px 20px 20px;
		background-color: #fff;
	}
	/* H5 下返回箭头占顶部，标题区多留些上间距 */
	/* #ifdef H5 */
	.bp-header { padding-top: 36px; }
	/* #endif */
	.bp-title {
		display: block;
		font-size: 22px;
		font-weight: 600;
		color: #1a1a1a;
	}
	.bp-sub {
		display: block;
		margin-top: 8px;
		font-size: 13px;
		color: #9aa0a6;
	}

	.bp-devtip {
		display: flex;
		align-items: center;
		margin: 12px 12px 0;
		padding: 10px 12px;
		background-color: #fff7e6;
		border: 1px solid #ffe2a8;
		border-radius: 10px;
	}
	.bp-devtip-icon {
		font-size: 15px;
		margin-right: 6px;
		flex-shrink: 0;
	}
	.bp-devtip-text {
		font-size: 13px;
		color: #a06a00;
		line-height: 1.5;
	}
	.bp-devtip-code {
		font-size: 16px;
		font-weight: 700;
		color: #e6730b;
		letter-spacing: 2px;
	}

	.bp-card {
		margin-top: 12px;
		background-color: #fff;
	}
	.bp-row {
		display: flex;
		align-items: center;
		height: 56px;
		padding: 0 16px;
		border-bottom: 1px solid #f1f2f4;
	}
	.bp-row-last {
		border-bottom: none;
	}
	.bp-icon {
		font-size: 18px;
		width: 28px;
		flex-shrink: 0;
	}
	.bp-input {
		flex: 1;
		font-size: 15px;
		color: #333;
		height: 56px;
	}
	.bp-ph {
		color: #c0c4cc;
	}
	.bp-code-btn {
		flex-shrink: 0;
		margin-left: 12px;
		padding: 7px 14px;
		font-size: 13px;
		color: #fff;
		background-color: #43b876;
		border-radius: 18px;
	}
	.bp-code-disabled {
		background-color: #bfe6cf;
	}

	.bp-submit-box {
		padding: 30px 16px 0;
	}
	.bp-submit {
		height: 46px;
		line-height: 46px;
		text-align: center;
		font-size: 16px;
		color: #fff;
		background-color: #43b876;
		border-radius: 24px;
		box-shadow: 0 4px 12px rgba(67,184,118,0.3);
	}
	.bp-submit-disabled {
		opacity: 0.6;
	}
</style>
