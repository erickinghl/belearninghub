<template>
	<view class="ne-page">
		<view class="ne-card">
			<input v-model="form.title" placeholder="笔记标题" class="ne-title" />
			<view class="ne-divider"></view>
			<textarea v-model="form.content" placeholder="在这里记录你的笔记..." class="ne-content" :maxlength="-1" />
		</view>
		<view class="ne-count">{{ (form.content || '').length }} 字</view>

		<!-- 附件区 -->
		<view class="ne-card ne-attach-card">
			<view class="ne-attach-title">
				<text class="ne-attach-label">附件</text>
				<text class="ne-attach-tip">图片 / 视频 / PDF / Word / PPT / Excel</text>
			</view>

			<!-- 图片附件：缩略图 -->
			<view class="ne-imgs" v-if="imageList.length">
				<view class="ne-img-item" v-for="(a,ai) in imageList" :key="'img'+ai">
					<image class="ne-img" :src="a.url" mode="aspectFill" @click="previewImage(a.url)" />
					<text class="ne-img-del" @click="removeAttach(a)">✕</text>
				</view>
			</view>

			<!-- 非图片附件：文件行 -->
			<view class="ne-file" v-for="(a,fi) in fileList" :key="'file'+fi">
				<text class="ne-file-icon">{{ fileIcon(a) }}</text>
				<text class="ne-file-name" @click="openFile(a)">{{ a.name || a.url }}</text>
				<text class="ne-file-del" @click="removeAttach(a)">✕</text>
			</view>

			<!-- 上传入口 -->
			<view class="ne-add-row">
				<view class="ne-add-btn" @click="chooseImage">
					<text class="ne-add-icon">🖼️</text><text class="ne-add-text">图片</text>
				</view>
				<view class="ne-add-btn" @click="chooseFile">
					<text class="ne-add-icon">📎</text><text class="ne-add-text">{{ uploading ? '上传中…' : '文件/视频' }}</text>
				</view>
			</view>
		</view>

		<view class="ne-bottom">
			<view class="ne-save-btn" :class="saving ? 'ne-disabled' : ''" @click="submit">{{ saving ? '保存中…' : (form.id ? '保存修改' : '保存笔记') }}</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				uploading: false,
				saving: false,
				form: {
					id: 0,
					title: "",
					content: "",
					course_id: 0,
					question_id: 0,
					attachments: []
				}
			}
		},
		computed: {
			imageList() {
				return (this.form.attachments || []).filter(a => a.type === 'image')
			},
			fileList() {
				return (this.form.attachments || []).filter(a => a.type !== 'image')
			}
		},
		onLoad(e) {
			this.form.question_id = e.question_id ? parseInt(e.question_id) : 0
			if (e.course_id) this.form.course_id = parseInt(e.course_id)
			if (e.id) {
				this.form.id = e.id
				this.getData()
				uni.setNavigationBarTitle({ title: '编辑笔记' })
			} else if (this.form.question_id) {
				// 题目笔记：若该题已有笔记则进入编辑
				uni.setNavigationBarTitle({ title: '题目笔记' })
				this.loadQuestionNote()
			} else {
				uni.setNavigationBarTitle({ title: '写笔记' })
			}
		},
		methods: {
			getData() {
				uni.showLoading({ title: '加载中...' })
				this.$api.readNote({ id: this.form.id }).then(res => {
					this.form.title = res.title
					this.form.content = res.content
					this.form.course_id = res.course_id
					this.form.question_id = res.question_id || 0
					this.form.attachments = Array.isArray(res.attachments) ? res.attachments : []
				}).catch(() => {
					uni.navigateBack({ delta: 1 })
				}).finally(() => {
					uni.hideLoading()
				})
			},
			loadQuestionNote() {
				this.$api.noteListByQuestion({ question_id: this.form.question_id }).then(d => {
					const rows = (d && d.rows) || []
					if (rows.length) {
						const n = rows[0]
						this.form.id = n.id
						this.form.title = n.title
						this.form.content = n.content
						this.form.attachments = Array.isArray(n.attachments) ? n.attachments : []
					}
				}).catch(() => {})
			},
			fileIcon(a) {
				if (a.type === 'video') return '🎬'
				if (a.type === 'pdf') return '📕'
				const n = (a.name || a.url || '').toLowerCase()
				if (/\.(doc|docx)$/.test(n)) return '📘'
				if (/\.(ppt|pptx)$/.test(n)) return '📙'
				if (/\.(xls|xlsx)$/.test(n)) return '📗'
				if (/\.txt$/.test(n)) return '📄'
				return '📎'
			},
			detectType(url, name) {
				const s = (name || url || '').toLowerCase()
				if (/\.(jpg|jpeg|png|gif|webp)$/.test(s)) return 'image'
				if (/\.(mp4|mov|webm)$/.test(s)) return 'video'
				if (/\.pdf$/.test(s)) return 'pdf'
				return 'file'
			},
			chooseImage() {
				uni.chooseImage({
					count: 9,
					sizeType: ['compressed'],
					success: (res) => {
						this.uploadAll(res.tempFilePaths.map(p => ({ path: p, name: '' })), 0)
					}
				})
			},
			// 选择任意文件（H5 走 input file；非 H5 用 chooseFile/chooseMedia 兜底）
			chooseFile() {
				if (this.uploading) return
				// #ifdef H5
				const input = document.createElement('input')
				input.type = 'file'
				input.accept = '.mp4,.mov,.webm,.pdf,.txt,.doc,.docx,.ppt,.pptx,.xls,.xlsx'
				input.onchange = (ev) => {
					const f = ev.target.files[0]
					if (!f) return
					this.uploadAll([{ file: f, name: f.name }], 0)
				}
				input.click()
				// #endif
				// #ifndef H5
				if (uni.chooseFile) {
					uni.chooseFile({
						count: 1,
						success: (res) => {
							const fp = res.tempFiles && res.tempFiles[0]
							this.uploadAll([{ path: res.tempFilePaths[0], name: fp ? fp.name : '' }], 0)
						}
					})
				} else {
					this.$toast('当前端暂不支持选择文件')
				}
				// #endif
			},
			// 逐个上传
			uploadAll(items, i) {
				if (i >= items.length) { this.uploading = false; return }
				this.uploading = true
				const it = items[i]
				// #ifdef H5
				if (it.file) {
					// H5 用 FormData 直传，能拿到原始文件名
					const fd = new FormData()
					fd.append('file', it.file)
					const base = this.$api.baseURL || ''
					fetch((base || 'http://127.0.0.1:7001') + '/mobile/upload', {
						method: 'POST',
						headers: { token: uni.getStorageSync('token') || (this.$store.state.token || '') },
						body: fd
					}).then(r => r.json()).then(d => {
						if (d.msg === 'ok' && d.data && d.data.url) this.pushAttach(d.data.url, it.name)
						this.uploadAll(items, i + 1)
					}).catch(() => { this.$toast('上传失败'); this.uploadAll(items, i + 1) })
					return
				}
				// #endif
				this.$api.upload(it.path).then(data => {
					const url = (data && data.url) ? data.url : data
					this.pushAttach(url, it.name)
					this.uploadAll(items, i + 1)
				}).catch(() => { this.$toast('上传失败'); this.uploadAll(items, i + 1) })
			},
			pushAttach(url, name) {
				const type = this.detectType(url, name)
				if (!this.form.attachments) this.form.attachments = []
				this.form.attachments.push({ type, url, name: name || url.split('/').pop() })
			},
			removeAttach(a) {
				const idx = this.form.attachments.indexOf(a)
				if (idx > -1) this.form.attachments.splice(idx, 1)
			},
			previewImage(url) {
				const urls = this.imageList.map(a => a.url)
				uni.previewImage({ urls, current: url })
			},
			openFile(a) {
				// #ifdef H5
				window.open(a.url, '_blank')
				// #endif
				// #ifndef H5
				if (a.type === 'pdf') {
					uni.navigateTo({ url: '/pages/pdf/pdf?url=' + encodeURIComponent(a.url) })
				} else {
					uni.showToast({ title: '请在浏览器中打开', icon: 'none' })
				}
				// #endif
			},
			submit() {
				if (this.saving) return
				const isQuestionNote = !!this.form.question_id
				if (!isQuestionNote && !this.form.title.trim()) {
					return this.$toast('请填写标题')
				}
				if (!this.form.content.trim() && !(this.form.attachments || []).length) {
					return this.$toast('请输入内容或添加附件')
				}
				this.saving = true
				uni.showLoading({ title: '保存中...', mask: true })
				this.$api.saveNote({
					id: this.form.id || undefined,
					title: this.form.title,
					content: this.form.content,
					course_id: this.form.course_id,
					question_id: this.form.question_id || 0,
					attachments: JSON.stringify(this.form.attachments || [])
				}).then(() => {
					this.$toast('已保存')
					setTimeout(() => { uni.navigateBack({ delta: 1 }) }, 500)
				}).catch(() => {
					this.$toast('保存失败')
				}).finally(() => {
					this.saving = false
					uni.hideLoading()
				})
			}
		}
	}
</script>

<style>
	.ne-page {
		min-height: 100vh;
		background-color: #f7f8fa;
		padding-left: 12px;
		padding-right: 12px;
		padding-bottom: 90px;
		padding-top: 12px;
	}
	/* H5 固定导航栏(44px)，补足顶部留白 */
	/* #ifdef H5 */
	.ne-page {
		padding-top: 56px;
	}
	/* #endif */
	.ne-card {
		background-color: #ffffff;
		border-radius: 12px;
		padding: 16px;
		box-shadow: 0 2px 10px rgba(0,0,0,0.05);
	}
	.ne-title {
		width: 100%;
		font-size: 18px;
		font-weight: bold;
		color: #222;
		height: 30px;
		line-height: 30px;
	}
	.ne-divider {
		height: 1px;
		background-color: #f0f1f3;
		margin-top: 12px;
		margin-bottom: 12px;
	}
	.ne-content {
		width: 100%;
		min-height: 200px;
		font-size: 15px;
		line-height: 1.7;
		color: #333;
		box-sizing: border-box;
	}
	.ne-count {
		text-align: right;
		font-size: 12px;
		color: #bbb;
		margin-top: 8px;
		padding-right: 4px;
	}

	/* 附件区 */
	.ne-attach-card {
		margin-top: 12px;
	}
	.ne-attach-title {
		display: flex;
		align-items: baseline;
		margin-bottom: 10px;
	}
	.ne-attach-label {
		font-size: 15px;
		font-weight: 600;
		color: #222;
	}
	.ne-attach-tip {
		font-size: 11px;
		color: #b0b4ba;
		margin-left: 8px;
	}
	.ne-imgs {
		display: flex;
		flex-wrap: wrap;
	}
	.ne-img-item {
		position: relative;
		width: 76px;
		height: 76px;
		margin: 0 10px 10px 0;
	}
	.ne-img {
		width: 76px;
		height: 76px;
		border-radius: 8px;
		background-color: #f2f3f5;
	}
	.ne-img-del {
		position: absolute;
		top: -6px;
		right: -6px;
		width: 20px;
		height: 20px;
		line-height: 20px;
		text-align: center;
		background-color: rgba(0,0,0,0.6);
		color: #fff;
		font-size: 12px;
		border-radius: 50%;
	}
	.ne-file {
		display: flex;
		align-items: center;
		padding: 10px 12px;
		background-color: #f7f8fa;
		border-radius: 8px;
		margin-bottom: 8px;
	}
	.ne-file-icon {
		font-size: 18px;
		margin-right: 8px;
	}
	.ne-file-name {
		flex: 1;
		font-size: 14px;
		color: #4a7bd0;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
	.ne-file-del {
		font-size: 14px;
		color: #c0c4cc;
		padding-left: 10px;
	}
	.ne-add-row {
		display: flex;
		margin-top: 4px;
	}
	.ne-add-btn {
		display: flex;
		align-items: center;
		padding: 8px 14px;
		margin-right: 12px;
		background-color: #f1f7f3;
		border-radius: 18px;
	}
	.ne-add-icon {
		font-size: 15px;
		margin-right: 5px;
	}
	.ne-add-text {
		font-size: 13px;
		color: #43b876;
	}

	.ne-bottom {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #ffffff;
		padding: 10px 12px;
		padding-bottom: 16px;
		border-top: 1px solid #f0f1f3;
		box-shadow: 0 -2px 10px rgba(0,0,0,0.04);
	}
	.ne-save-btn {
		height: 46px;
		line-height: 46px;
		text-align: center;
		background: linear-gradient(135deg, #5ccc84 0%, #43b876 100%);
		color: #ffffff;
		font-size: 16px;
		font-weight: 600;
		border-radius: 23px;
	}
	.ne-disabled {
		opacity: 0.6;
	}
</style>
