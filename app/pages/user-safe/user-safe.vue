<template>
	<view class="ps-page">
		<view class="ps-tip">为了账号安全，修改密码后需要重新登录</view>

		<view class="ps-card">
			<view class="ps-row">
				<text class="ps-label">原密码</text>
				<input class="ps-input" v-model="form.old_password" type="password"
					placeholder="请输入原密码" placeholder-class="ps-ph" />
			</view>
			<view class="ps-row">
				<text class="ps-label">新密码</text>
				<input class="ps-input" v-model="form.password" type="password"
					placeholder="6-20位新密码" placeholder-class="ps-ph" />
			</view>
			<view class="ps-row ps-row-last">
				<text class="ps-label">确认密码</text>
				<input class="ps-input" v-model="form.repassword" type="password"
					placeholder="再次输入新密码" placeholder-class="ps-ph" />
			</view>
		</view>

		<view class="ps-submit-box">
			<view class="ps-submit" :class="submitting ? 'ps-submit-disabled' : ''" @click="submit">{{ submitting ? '提交中…' : '保 存' }}</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				submitting: false,
				form: {
					old_password: "",
					password: "",
					repassword: ""
				}
			}
		},
		methods: {
			submit() {
				if (this.submitting) return
				const f = this.form
				if (!f.old_password) return this.$toast('请输入原密码')
				if (!f.password) return this.$toast('请输入新密码')
				if (f.password.length < 6 || f.password.length > 20) return this.$toast('新密码需 6-20 位')
				if (f.password !== f.repassword) return this.$toast('两次输入的新密码不一致')

				this.submitting = true
				uni.showLoading({ title: '提交中...', mask: true })
				this.$api.updatePassword(Object.assign({}, f)).then(() => {
					this.$toast('修改成功，请重新登录')
					setTimeout(() => {
						this.$store.dispatch('logout')
						uni.reLaunch({ url: '/pages/login/login' })
					}, 800)
				}).catch(() => {
					this.$toast('修改失败')
				}).finally(() => {
					this.submitting = false
					uni.hideLoading()
				})
			}
		}
	}
</script>

<style>
	.ps-page {
		min-height: 100vh;
		background-color: #f5f6f8;
	}
	/* #ifdef H5 */
	.ps-page { padding-top: 44px; }
	/* #endif */

	.ps-tip {
		font-size: 13px;
		color: #9aa0a6;
		padding: 18px 16px 10px;
	}
	.ps-card {
		background-color: #fff;
	}
	.ps-row {
		display: flex;
		align-items: center;
		height: 54px;
		padding: 0 16px;
		border-bottom: 1px solid #f1f2f4;
	}
	.ps-row-last {
		border-bottom: none;
	}
	.ps-label {
		font-size: 15px;
		color: #1a1a1a;
		width: 76px;
		flex-shrink: 0;
	}
	.ps-input {
		flex: 1;
		text-align: right;
		font-size: 15px;
		color: #333;
		height: 54px;
	}
	.ps-ph {
		color: #c0c4cc;
	}

	.ps-submit-box {
		padding: 30px 16px 0;
	}
	.ps-submit {
		height: 46px;
		line-height: 46px;
		text-align: center;
		font-size: 16px;
		color: #fff;
		background-color: #43b876;
		border-radius: 24px;
		box-shadow: 0 4px 12px rgba(67,184,118,0.3);
	}
	.ps-submit-disabled {
		opacity: 0.6;
	}
</style>
