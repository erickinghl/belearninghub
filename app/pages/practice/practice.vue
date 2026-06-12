<template>
	<view class="pr-page">
		<!-- 题号宫格 -->
		<scroll-view scroll-y class="pr-grid-wrap" v-if="showGrid">
			<view class="pr-grid" v-if="questions.length">
				<view class="pr-cell" v-for="(q,i) in questions" :key="q.id"
					:class="cellClass(q,i)" @click="gotoQuestion(i)">
					{{ i + 1 }}
				</view>
			</view>
			<view v-else-if="loaded" class="pr-empty">
				<text class="pr-empty-icon">{{ mode === 'fava' ? '⭐' : '📕' }}</text>
				<text class="pr-empty-text">{{ mode === 'fava' ? '还没有收藏的题' : '还没有错题' }}</text>
				<text class="pr-empty-tip">去题库练习，{{ mode === 'fava' ? '点 ☆ 收藏' : '做错的题会自动收进来' }}</text>
			</view>
		</scroll-view>

		<!-- 答题区 -->
		<view class="pr-body" v-if="!showGrid && cur">
			<view class="pr-qhead">
				<text class="pr-qtype">{{ typeName(cur.type) }}</text>
				<text class="pr-qno">第 {{ index + 1 }} / {{ questions.length }} 题</text>
				<text class="pr-correct" @click="correct">纠错</text>
			</view>
			<view class="pr-title">{{ cur.title }}</view>

			<!-- 选项 -->
			<view class="pr-options">
				<!-- 单选 -->
				<template v-if="cur.type === 'radio'">
					<view class="pr-opt" v-for="(o,oi) in parseOptions(cur.options)" :key="oi"
						:class="optClass(oi)" @click="chooseRadio(oi)">
						<text class="pr-opt-badge">{{ letter(oi) }}</text>
						<text class="pr-opt-text">{{ o }}</text>
					</view>
				</template>
				<!-- 判断 -->
				<template v-else-if="cur.type === 'trueOrfalse'">
					<view class="pr-opt" :class="optClass(1)" @click="chooseRadio(1)">
						<text class="pr-opt-badge">✓</text><text class="pr-opt-text">正确</text>
					</view>
					<view class="pr-opt" :class="optClass(0)" @click="chooseRadio(0)">
						<text class="pr-opt-badge">✕</text><text class="pr-opt-text">错误</text>
					</view>
				</template>
				<!-- 多选 -->
				<template v-else-if="cur.type === 'checkbox'">
					<view class="pr-opt" v-for="(o,oi) in parseOptions(cur.options)" :key="oi"
						:class="optClass(oi)" @click="toggleCheckbox(oi)">
						<text class="pr-opt-badge">{{ letter(oi) }}</text>
						<text class="pr-opt-text">{{ o }}</text>
					</view>
				</template>
				<!-- 填空 -->
				<template v-else-if="cur.type === 'completion'">
					<input class="pr-input" v-model="fillValue" :disabled="answered" placeholder="请输入答案" />
				</template>
				<!-- 问答 -->
				<template v-else>
					<textarea class="pr-textarea" v-model="essayValue" :disabled="answered" placeholder="请输入你的答案" />
				</template>
			</view>

			<!-- 提交 / 判定结果 -->
			<view v-if="!answered" class="pr-submit" @click="submit">提交答案</view>
			<view v-else class="pr-result">
				<view class="pr-verdict" :class="lastRight ? 'pr-ok' : 'pr-no'">
					{{ cur.type === 'answer' ? '已记录（问答题请对照解析自评）' : (lastRight ? '✓ 回答正确' : '✕ 回答错误') }}
				</view>
				<view class="pr-analysis" v-if="cur.answer !== undefined && cur.answer !== null && cur.answer !== ''">
					<text class="pr-ana-label">正确答案：</text>
					<text class="pr-ana-text">{{ showAnswer(cur) }}</text>
				</view>
				<view class="pr-analysis" v-if="cur.analysis || (cur.analysis_images && cur.analysis_images.length) || cur.analysis_video">
					<text class="pr-ana-label">解析：</text>
					<text class="pr-ana-text" v-if="cur.analysis">{{ cur.analysis }}</text>
					<!-- 解析图片 -->
					<view class="pr-ana-imgs" v-if="cur.analysis_images && cur.analysis_images.length">
						<image v-for="(img,ii) in cur.analysis_images" :key="ii" class="pr-ana-img"
							:src="img" mode="widthFix" @click="previewImg(cur.analysis_images, ii)" />
					</view>
					<!-- 解析视频 -->
					<video v-if="cur.analysis_video" class="pr-ana-video" :src="cur.analysis_video" controls></video>
				</view>
				<view class="pr-redo" @click="redo">↻ 重做本题</view>
			</view>

			<!-- 题目功能条（仿医考帮：点赞/收藏/笔记/留言讨论） -->
			<view class="pr-actions">
				<view class="pr-act" :class="act.liked ? 'pr-act-on' : ''" @click="toggleLike">
					<text class="pr-act-icon">{{ act.liked ? '👍' : '👍🏻' }}</text>
					<text class="pr-act-text">{{ act.like_count > 0 ? act.like_count : '点赞' }}</text>
				</view>
				<view class="pr-act" :class="act.faved ? 'pr-act-on' : ''" @click="toggleFava">
					<text class="pr-act-icon">{{ act.faved ? '⭐' : '☆' }}</text>
					<text class="pr-act-text">收藏</text>
				</view>
				<view class="pr-act" :class="act.note_count > 0 ? 'pr-act-on' : ''" @click="openNote">
					<text class="pr-act-icon">📝</text>
					<text class="pr-act-text">{{ act.note_count > 0 ? '笔记·' + act.note_count : '笔记' }}</text>
				</view>
				<view class="pr-act" @click="openComments">
					<text class="pr-act-icon">💬</text>
					<text class="pr-act-text">{{ act.comment_count > 0 ? '讨论·' + act.comment_count : '讨论' }}</text>
				</view>
			</view>

			<!-- 上一题 / 下一题 -->
			<view class="pr-nav">
				<view class="pr-nav-btn" :class="index === 0 ? 'pr-nav-disabled' : ''" @click="prev">‹ 上一题</view>
				<view class="pr-nav-btn pr-nav-grid" @click="showGrid = true">☰ 题卡</view>
				<view class="pr-nav-btn" :class="index >= questions.length - 1 ? 'pr-nav-disabled' : ''" @click="next">下一题 ›</view>
			</view>
		</view>

		<!-- 底部统计 -->
		<view class="pr-stat">
			当前共{{ stat.total }}题，对<text class="pr-st-r">{{ stat.right }}</text>题，错<text class="pr-st-w">{{ stat.wrong }}</text>题，未做<text class="pr-st-u">{{ stat.undone }}</text>题，正确率<text class="pr-st-rate">{{ stat.rate }}%</text>
		</view>

		<!-- ===== 纠错弹层 ===== -->
		<view class="cor-mask" v-if="corVisible" @click="closeCorrect">
			<view class="cor-panel" @click.stop>
				<view class="cor-head">
					<text class="cor-title">答案纠错</text>
					<text class="cor-close" @click="closeCorrect">✕</text>
				</view>
				<view class="cor-sub">如果你认为本题标准答案 / 解析有误，请描述问题并可附上截图</view>
				<textarea class="cor-textarea" v-model="corContent" maxlength="500"
					placeholder="请填写纠错说明，例如：标准答案应为 B，因为……" />
				<view class="cor-count">{{ corContent.length }}/500</view>

				<!-- 图片上传区 -->
				<view class="cor-imgs">
					<view class="cor-img-item" v-for="(img,ii) in corImages" :key="ii">
						<image class="cor-img" :src="img" mode="aspectFill" @click="previewImg(corImages, ii)" />
						<text class="cor-img-del" @click="removeCorImage(ii)">✕</text>
					</view>
					<view class="cor-img-add" v-if="corImages.length < 6" @click="chooseCorImage">
						<text class="cor-add-plus">+</text>
						<text class="cor-add-tip">{{ corUploading ? '上传中…' : '加图片' }}</text>
					</view>
				</view>

				<view class="cor-btns">
					<view class="cor-btn cor-cancel" @click="closeCorrect">取消</view>
					<view class="cor-btn cor-ok" :class="corSubmitting ? 'cor-disabled' : ''" @click="submitCorrect">{{ corSubmitting ? '提交中…' : '提交纠错' }}</view>
				</view>
			</view>
		</view>

		<!-- ===== 讨论区底部弹层 ===== -->
		<view class="dc-mask" v-if="commentVisible" @click="closeComments">
			<view class="dc-sheet" @click.stop>
				<view class="dc-head">
					<text class="dc-title">讨论区（{{ act.comment_count }}）</text>
					<text class="cor-close" @click="closeComments">✕</text>
				</view>
				<scroll-view scroll-y class="dc-list">
					<view v-if="!comments.length" class="dc-empty">还没有讨论，来抢沙发～</view>
					<view class="dc-item" v-for="c in comments" :key="c.id">
						<image class="dc-avatar" :src="c.avatar || '/static/noLogin.png'" mode="aspectFill"></image>
						<view class="dc-body">
							<view class="dc-row1">
								<text class="dc-name">{{ c.username }}</text>
								<text class="dc-del" v-if="c.user_id === myId" @click="delComment(c)">删除</text>
							</view>
							<text class="dc-content">{{ c.content }}</text>
						</view>
					</view>
				</scroll-view>
				<view class="dc-input-bar">
					<input class="dc-input" v-model="commentText" maxlength="1000" placeholder="说点什么…" confirm-type="send" @confirm="sendComment" />
					<view class="dc-send" :class="commentSending ? 'cor-disabled' : ''" @click="sendComment">发送</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				mode: 'paper',
				paperId: 0,
				title: '',
				questions: [],
				loaded: false,
				index: 0,
				showGrid: true,
				// 当前题作答中的临时值
				radioValue: -1,
				checkboxValue: [],
				fillValue: '',
				essayValue: '',
				answered: false,
				lastRight: false,
				stat: { total: 0, done: 0, right: 0, wrong: 0, undone: 0, rate: 0 },
				// 纠错弹层
				corVisible: false,
				corContent: '',
				corImages: [],
				corUploading: false,
				corSubmitting: false,
				// 题目功能条状态（点赞/收藏/笔记数/讨论数）
				act: { liked: false, like_count: 0, faved: false, note_count: 0, comment_count: 0 },
				// 讨论区弹层
				commentVisible: false,
				comments: [],
				commentText: '',
				commentSending: false
			}
		},
		computed: {
			cur() {
				return this.questions[this.index]
			},
			myId() {
				const u = this.$store.state.user
				return u ? u.id : 0
			}
		},
		onLoad(e) {
			this.mode = e.mode || 'paper'   // paper(试卷) / wrong(错题本) / fava(收藏题)
			this.paperId = e.id || 0
			if (this.mode === 'paper' && !this.paperId) {
				this.$toast('非法参数')
				setTimeout(() => uni.navigateBack({ delta: 1 }), 700)
				return
			}
			if (e.title) {
				uni.setNavigationBarTitle({ title: e.title })
			}
			this.getData()
		},
		onShow() {
			// 从笔记编辑页返回时刷新功能条（笔记数等）
			if (!this.showGrid && this.cur) this.loadAct()
		},
		methods: {
			typeName(t) {
				return { radio: '单选题', checkbox: '多选题', trueOrfalse: '判断题', completion: '填空题', answer: '问答题' }[t] || '题目'
			},
			letter(i) {
				return String.fromCharCode(65 + i)
			},
			parseOptions(opts) {
				if (Array.isArray(opts)) return opts
				try { return JSON.parse(opts) } catch (e) { return [] }
			},
			cellClass(q, i) {
				let c = []
				if (i === this.index && !this.showGrid) c.push('pr-cell-cur')
				if (q.done) c.push(q.is_right ? 'pr-cell-right' : 'pr-cell-wrong')
				return c.join(' ')
			},
			gotoQuestion(i) {
				this.index = i
				this.showGrid = false
				this.loadCurrentAnswerState()
			},
			// 进入某题时恢复它的作答状态
			loadCurrentAnswerState() {
				const q = this.cur
				this.radioValue = -1
				this.checkboxValue = []
				this.fillValue = ''
				this.essayValue = ''
				this.answered = !!q.done
				this.lastRight = !!q.is_right
				if (q.done && q.my_answer != null) {
					let v = q.my_answer
					try { v = JSON.parse(q.my_answer) } catch (e) { /* 字符串答案 */ }
					if (q.type === 'radio' || q.type === 'trueOrfalse') this.radioValue = Number(v)
					else if (q.type === 'checkbox') this.checkboxValue = Array.isArray(v) ? v : []
					else if (q.type === 'completion') this.fillValue = Array.isArray(v) ? v[0] : v
					else this.essayValue = typeof v === 'string' ? v : (q.my_answer || '')
				}
				// 加载该题的功能条状态（点赞/收藏/笔记/讨论数）
				this.loadAct()
			},
			// ===== 题目功能条 =====
			loadAct() {
				const q = this.cur
				if (!q) return
				this.$api.questionStat({ question_id: q.id }).then(d => {
					this.act = {
						liked: !!d.liked,
						like_count: d.like_count || 0,
						faved: !!d.faved,
						note_count: d.note_count || 0,
						comment_count: d.comment_count || 0
					}
					// 同步收藏态到题目对象，宫格/其它地方一致
					this.$set(q, 'fava', d.faved ? 1 : 0)
				}).catch(() => {})
			},
			toggleLike() {
				const q = this.cur
				this.$api.questionLike({ question_id: q.id }).then(d => {
					this.act.liked = !!d.liked
					this.act.like_count = d.like_count || 0
				})
			},
			// 笔记：跳转独立笔记编辑页（支持图片/视频/PDF/文档附件）
			openNote() {
				uni.navigateTo({ url: '/pages/note-edit/note-edit?question_id=' + this.cur.id })
			},
			// 讨论区
			openComments() {
				this.commentVisible = true
				this.commentText = ''
				this.loadComments()
			},
			closeComments() {
				this.commentVisible = false
			},
			loadComments() {
				this.$api.questionComments({ question_id: this.cur.id }).then(d => {
					this.comments = (d && d.rows) || []
				}).catch(() => { this.comments = [] })
			},
			sendComment() {
				if (this.commentSending) return
				const content = (this.commentText || '').trim()
				if (!content) return this.$toast('请输入留言内容')
				this.commentSending = true
				this.$api.questionComment({ question_id: this.cur.id, content }).then(() => {
					this.commentSending = false
					this.commentText = ''
					this.act.comment_count++
					this.loadComments()
				}).catch(() => { this.commentSending = false })
			},
			delComment(c) {
				uni.showModal({
					content: '确定删除这条留言？',
					success: (res) => {
						if (res.cancel) return
						this.$api.questionCommentDestroy({ id: c.id }).then(() => {
							this.act.comment_count = Math.max(0, this.act.comment_count - 1)
							this.loadComments()
						})
					}
				})
			},
			optClass(oi) {
				const q = this.cur
				const selected = (q.type === 'checkbox') ? this.checkboxValue.includes(oi) : (this.radioValue === oi)
				let c = []
				if (!this.answered) {
					if (selected) c.push('pr-opt-on')
				} else {
					// 已答：标出正确答案(绿)和我选错的(红)
					const correct = this.isCorrectOption(oi)
					if (correct) c.push('pr-opt-correct')
					else if (selected) c.push('pr-opt-wrong')
				}
				return c.join(' ')
			},
			isCorrectOption(oi) {
				const q = this.cur
				let ans = q.answer
				if (q.type === 'checkbox') {
					let arr = ans
					try { arr = JSON.parse(ans) } catch (e) {}
					return Array.isArray(arr) && arr.map(Number).includes(oi)
				}
				return Number(ans) === oi
			},
			showAnswer(q) {
				let ans = q.answer
				if (q.type === 'radio') return this.letter(Number(ans))
				if (q.type === 'trueOrfalse') return Number(ans) === 1 ? '正确' : '错误'
				if (q.type === 'checkbox') {
					let arr = ans; try { arr = JSON.parse(ans) } catch (e) {}
					return (Array.isArray(arr) ? arr : []).map(i => this.letter(Number(i))).join('、')
				}
				if (q.type === 'completion') {
					let arr = ans; try { arr = JSON.parse(ans) } catch (e) {}
					return Array.isArray(arr) ? arr.join(' / ') : ans
				}
				return ans
			},
			chooseRadio(oi) {
				if (this.answered) return
				this.radioValue = oi
			},
			toggleCheckbox(oi) {
				if (this.answered) return
				const i = this.checkboxValue.indexOf(oi)
				if (i > -1) this.checkboxValue.splice(i, 1)
				else this.checkboxValue.push(oi)
			},
			currentAnswer() {
				const q = this.cur
				if (q.type === 'radio' || q.type === 'trueOrfalse') return this.radioValue
				if (q.type === 'checkbox') return this.checkboxValue.slice().sort((a, b) => a - b)
				if (q.type === 'completion') return [this.fillValue]
				return this.essayValue
			},
			// 重做本题：解除锁定、清空当前作答，可重新选（不删历史，重新提交即覆盖）
			redo() {
				this.answered = false
				this.radioValue = -1
				this.checkboxValue = []
				this.fillValue = ''
				this.essayValue = ''
			},
			submit() {
				const q = this.cur
				const ans = this.currentAnswer()
				// 校验
				if (q.type === 'radio' || q.type === 'trueOrfalse') {
					if (this.radioValue === -1) return this.$toast('请选择答案')
				} else if (q.type === 'checkbox') {
					if (!this.checkboxValue.length) return this.$toast('请选择答案')
				} else if (q.type === 'completion') {
					if (!this.fillValue.trim()) return this.$toast('请填写答案')
				} else {
					if (!this.essayValue.trim()) return this.$toast('请输入答案')
				}
				uni.showLoading({ title: '提交中...', mask: true })
				this.$api.practiceSubmit({ question_id: q.id, answer: ans }).then(res => {
					this.answered = true
					this.lastRight = !!res.is_right
					// 更新本题记录
					this.$set(this.questions[this.index], 'done', 1)
					this.$set(this.questions[this.index], 'is_right', res.is_right)
					this.$set(this.questions[this.index], 'my_answer', typeof ans === 'string' ? ans : JSON.stringify(ans))
					this.loadStat()
				}).finally(() => {
					uni.hideLoading()
				})
			},
			toggleFava() {
				const q = this.cur
				this.$api.practiceFava({ question_id: q.id }).then(res => {
					this.$set(this.questions[this.index], 'fava', res.fava)
					this.act.faved = !!res.fava
					this.$toast(res.fava ? '已收藏' : '已取消收藏')
				})
			},
			// 答案纠错：打开自定义弹层
			correct() {
				this.corContent = ''
				this.corImages = []
				this.corUploading = false
				this.corSubmitting = false
				this.corVisible = true
			},
			closeCorrect() {
				this.corVisible = false
			},
			// 选择并上传纠错图片（自动压缩）
			chooseCorImage() {
				if (this.corUploading) return
				uni.chooseImage({
					count: 6 - this.corImages.length,
					sizeType: ['compressed'],   // 优先使用压缩图，避免大图
					sourceType: ['album', 'camera'],
					success: (res) => {
						const paths = res.tempFilePaths || []
						this.uploadCorImages(paths, 0)
					}
				})
			},
			// 逐张上传（H5 chooseImage 返回 blob/临时路径，uni.uploadFile 直接传）
			uploadCorImages(paths, i) {
				if (i >= paths.length) { this.corUploading = false; return }
				this.corUploading = true
				this.$api.upload(paths[i]).then((data) => {
					if (data && data.url) this.corImages.push(data.url)
					this.uploadCorImages(paths, i + 1)
				}).catch(() => {
					this.$toast('图片上传失败')
					this.uploadCorImages(paths, i + 1)
				})
			},
			removeCorImage(i) {
				this.corImages.splice(i, 1)
			},
			submitCorrect() {
				if (this.corSubmitting) return
				const content = (this.corContent || '').trim()
				if (!content && !this.corImages.length) return this.$toast('请填写纠错说明或上传图片')
				this.corSubmitting = true
				this.$api.correctionSubmit({
					question_id: this.cur.id,
					content,
					images: JSON.stringify(this.corImages)
				}).then(() => {
					this.corSubmitting = false
					this.corVisible = false
					this.$toast('提交成功，感谢反馈')
				}).catch(() => {
					this.corSubmitting = false
				})
			},
			// 预览图片（解析图 / 纠错图通用）
			previewImg(list, current) {
				uni.previewImage({ urls: list, current: list[current] })
			},
			prev() {
				if (this.index === 0) return
				this.index--
				this.loadCurrentAnswerState()
			},
			next() {
				if (this.index >= this.questions.length - 1) return
				this.index++
				this.loadCurrentAnswerState()
			},
			loadStat() {
				// 试卷模式从后端取统计；错题/收藏模式按当前题集本地算
				if (this.mode === 'paper') {
					this.$api.practiceStat({ id: this.paperId }).then(res => {
						this.stat = res
					}).catch(() => {})
				} else {
					this.calcLocalStat()
				}
			},
			calcLocalStat() {
				const total = this.questions.length
				const done = this.questions.filter(q => q.done).length
				const right = this.questions.filter(q => q.done && q.is_right).length
				const wrong = done - right
				const undone = total - done
				const rate = done > 0 ? Math.round((right / done) * 100) : 0
				this.stat = { total, done, right, wrong, undone, rate }
			},
			getData() {
				uni.showLoading({ title: '加载中...' })
				let req
				if (this.mode === 'wrong') req = this.$api.practiceWrong()
				else if (this.mode === 'fava') req = this.$api.practiceFavaList()
				else req = this.$api.practiceRead({ id: this.paperId })
				req.then(res => {
					this.title = res.title
					this.questions = res.questions || []
					uni.setNavigationBarTitle({ title: res.title })
					this.loadStat()
				}).catch(() => {
					if (this.mode === 'paper') setTimeout(() => uni.navigateBack({ delta: 1 }), 700)
				}).finally(() => {
					this.loaded = true
					uni.hideLoading()
				})
			}
		}
	}
</script>

<style>
	.pr-page {
		min-height: 100vh;
		background-color: #f7f8fa;
		padding-bottom: 50px;
		box-sizing: border-box;
	}
	/* #ifdef H5 */
	.pr-page {
		padding-top: 44px;
	}
	/* #endif */

	/* 题号宫格 */
	.pr-grid-wrap {
		height: calc(100vh - 90px);
	}
	.pr-grid {
		display: flex;
		flex-wrap: wrap;
		padding: 12px;
	}
	.pr-cell {
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 15px;
		color: #666;
		background-color: #f0f2f5;
		border-radius: 50%;
		margin: 8px;
	}
	.pr-cell-cur {
		border: 2px solid #43b876;
		color: #43b876;
		font-weight: bold;
	}
	.pr-cell-right {
		background-color: #43b876;
		color: #fff;
		font-weight: bold;
	}
	.pr-cell-wrong {
		background-color: #ff6b6b;
		color: #fff;
		font-weight: bold;
	}
	.pr-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 90px;
	}
	.pr-empty-icon {
		font-size: 48px;
		margin-bottom: 12px;
	}
	.pr-empty-text {
		font-size: 15px;
		color: #666;
	}
	.pr-empty-tip {
		font-size: 13px;
		color: #bbb;
		margin-top: 6px;
	}

	/* 答题区 */
	.pr-body {
		padding: 14px 12px;
	}
	.pr-qhead {
		display: flex;
		align-items: center;
		margin-bottom: 12px;
	}
	.pr-qtype {
		font-size: 12px;
		color: #43b876;
		background-color: rgba(67,184,118,0.12);
		padding: 3px 10px;
		border-radius: 10px;
	}
	.pr-qno {
		flex: 1;
		font-size: 13px;
		color: #999;
		margin-left: 10px;
	}
	.pr-fava {
		font-size: 22px;
		color: #ffb400;
	}
	.pr-correct {
		font-size: 13px;
		color: #ff9500;
		border: 1px solid #ffcf80;
		border-radius: 12px;
		padding: 3px 12px;
		margin-right: 12px;
	}
	.pr-title {
		font-size: 17px;
		color: #222;
		font-weight: 600;
		line-height: 1.6;
		margin-bottom: 16px;
	}
	.pr-options {
		display: flex;
		flex-direction: column;
	}
	.pr-opt {
		display: flex;
		align-items: center;
		background-color: #fff;
		border: 1px solid #eee;
		border-radius: 10px;
		padding: 14px 14px;
		margin-bottom: 12px;
	}
	.pr-opt-badge {
		width: 26px;
		height: 26px;
		line-height: 26px;
		text-align: center;
		border-radius: 50%;
		background-color: #f0f2f5;
		color: #888;
		font-size: 14px;
		margin-right: 12px;
		flex-shrink: 0;
	}
	.pr-opt-text {
		flex: 1;
		font-size: 15px;
		color: #333;
	}
	.pr-opt-on {
		border-color: #43b876;
		background-color: rgba(67,184,118,0.06);
	}
	.pr-opt-on .pr-opt-badge {
		background-color: #43b876;
		color: #fff;
	}
	.pr-opt-correct {
		border-color: #43b876;
		background-color: rgba(67,184,118,0.1);
	}
	.pr-opt-correct .pr-opt-badge {
		background-color: #43b876;
		color: #fff;
	}
	.pr-opt-wrong {
		border-color: #ff6b6b;
		background-color: rgba(255,107,107,0.08);
	}
	.pr-opt-wrong .pr-opt-badge {
		background-color: #ff6b6b;
		color: #fff;
	}
	.pr-input {
		background-color: #fff;
		border: 1px solid #eee;
		border-radius: 10px;
		padding: 14px;
		font-size: 15px;
	}
	.pr-textarea {
		background-color: #fff;
		border: 1px solid #eee;
		border-radius: 10px;
		padding: 14px;
		font-size: 15px;
		min-height: 120px;
		width: 100%;
		box-sizing: border-box;
	}
	.pr-submit {
		height: 46px;
		line-height: 46px;
		text-align: center;
		border-radius: 23px;
		color: #fff;
		font-size: 16px;
		background: linear-gradient(135deg, #5ccc84 0%, #43b876 100%);
		margin-top: 10px;
	}
	.pr-result {
		background-color: #fff;
		border-radius: 10px;
		padding: 14px;
		margin-top: 10px;
	}
	.pr-verdict {
		font-size: 15px;
		font-weight: 600;
		margin-bottom: 10px;
	}
	.pr-ok { color: #43b876; }
	.pr-no { color: #ff6b6b; }
	.pr-analysis {
		font-size: 13px;
		color: #666;
		line-height: 1.7;
		margin-top: 6px;
	}
	.pr-ana-label {
		color: #999;
	}
	.pr-redo {
		display: inline-block;
		margin-top: 14px;
		font-size: 14px;
		color: #43b876;
		border: 1px solid #43b876;
		border-radius: 16px;
		padding: 6px 18px;
	}
	.pr-nav {
		display: flex;
		justify-content: space-between;
		margin-top: 18px;
	}
	.pr-nav-btn {
		flex: 1;
		text-align: center;
		font-size: 14px;
		color: #555;
		padding: 10px 0;
	}
	.pr-nav-grid {
		color: #43b876;
	}
	.pr-nav-disabled {
		color: #ccc;
	}

	/* 底部统计 */
	.pr-stat {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #fff;
		border-top: 1px solid #f0f1f3;
		text-align: center;
		font-size: 13px;
		color: #666;
		padding: 12px 0;
	}
	.pr-st-r { color: #43b876; }
	.pr-st-w { color: #ff6b6b; }
	.pr-st-u { color: #999; }
	.pr-st-rate { color: #ff9500; }

	/* 解析图文 */
	.pr-ana-imgs {
		display: flex;
		flex-wrap: wrap;
		margin-top: 8px;
	}
	.pr-ana-img {
		width: 140px;
		border-radius: 6px;
		margin: 0 8px 8px 0;
		background-color: #f2f3f5;
	}
	.pr-ana-video {
		width: 100%;
		height: 200px;
		margin-top: 8px;
		border-radius: 8px;
		background-color: #000;
	}

	/* ===== 纠错弹层 ===== */
	.cor-mask {
		position: fixed;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0,0,0,0.45);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 999;
		padding: 0 24px;
	}
	.cor-panel {
		width: 100%;
		max-width: 420px;
		background-color: #fff;
		border-radius: 16px;
		padding: 20px;
		box-sizing: border-box;
	}
	.cor-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.cor-title {
		font-size: 17px;
		font-weight: 600;
		color: #1a1a1a;
	}
	.cor-close {
		font-size: 18px;
		color: #bbb;
		padding: 2px 6px;
	}
	.cor-sub {
		font-size: 13px;
		color: #999;
		line-height: 1.6;
		margin-top: 8px;
	}
	.cor-textarea {
		width: 100%;
		height: 96px;
		margin-top: 12px;
		padding: 10px 12px;
		box-sizing: border-box;
		background-color: #f6f7f9;
		border: 1px solid #eceef1;
		border-radius: 10px;
		font-size: 14px;
		color: #333;
		line-height: 1.6;
	}
	.cor-count {
		text-align: right;
		font-size: 12px;
		color: #c0c4cc;
		margin-top: 4px;
	}
	.cor-imgs {
		display: flex;
		flex-wrap: wrap;
		margin-top: 6px;
	}
	.cor-img-item {
		position: relative;
		width: 72px;
		height: 72px;
		margin: 0 10px 10px 0;
	}
	.cor-img {
		width: 72px;
		height: 72px;
		border-radius: 8px;
		background-color: #f2f3f5;
	}
	.cor-img-del {
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
	.cor-img-add {
		width: 72px;
		height: 72px;
		margin-bottom: 10px;
		border: 1px dashed #d4d7dd;
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: #fafbfc;
	}
	.cor-add-plus {
		font-size: 26px;
		color: #c0c4cc;
		line-height: 1;
	}
	.cor-add-tip {
		font-size: 11px;
		color: #a8acb3;
		margin-top: 4px;
	}
	.cor-btns {
		display: flex;
		margin-top: 16px;
	}
	.cor-btn {
		flex: 1;
		text-align: center;
		font-size: 15px;
		padding: 11px 0;
		border-radius: 22px;
	}
	.cor-cancel {
		color: #666;
		background-color: #f2f3f5;
		margin-right: 12px;
	}
	.cor-ok {
		color: #fff;
		background-color: #43b876;
	}
	.cor-disabled {
		opacity: 0.6;
	}

	/* ===== 题目功能条 ===== */
	.pr-actions {
		display: flex;
		margin-top: 16px;
		padding: 10px 0;
		border-top: 1px solid #f1f2f4;
		border-bottom: 1px solid #f1f2f4;
	}
	.pr-act {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.pr-act-icon {
		font-size: 20px;
		line-height: 1.2;
	}
	.pr-act-text {
		font-size: 12px;
		color: #888;
		margin-top: 3px;
	}
	.pr-act-on .pr-act-text {
		color: #43b876;
	}

	/* ===== 讨论区底部弹层 ===== */
	.dc-mask {
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
	.dc-sheet {
		width: 100%;
		height: 70vh;
		background-color: #fff;
		border-radius: 16px 16px 0 0;
		display: flex;
		flex-direction: column;
	}
	.dc-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px;
		border-bottom: 1px solid #f1f2f4;
	}
	.dc-title {
		font-size: 16px;
		font-weight: 600;
		color: #1a1a1a;
	}
	.dc-list {
		flex: 1;
		padding: 8px 16px;
	}
	.dc-empty {
		text-align: center;
		color: #b0b4ba;
		font-size: 13px;
		padding: 40px 0;
	}
	.dc-item {
		display: flex;
		padding: 12px 0;
		border-bottom: 1px solid #f6f7f9;
	}
	.dc-avatar {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background-color: #eceef1;
		margin-right: 10px;
		flex-shrink: 0;
	}
	.dc-body {
		flex: 1;
	}
	.dc-row1 {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.dc-name {
		font-size: 13px;
		color: #43b876;
		font-weight: 600;
	}
	.dc-del {
		font-size: 12px;
		color: #c0c4cc;
	}
	.dc-content {
		display: block;
		font-size: 14px;
		color: #333;
		line-height: 1.6;
		margin-top: 4px;
	}
	.dc-input-bar {
		display: flex;
		align-items: center;
		padding: 10px 12px;
		border-top: 1px solid #f1f2f4;
		/* #ifdef H5 */
		padding-bottom: 14px;
		/* #endif */
	}
	.dc-input {
		flex: 1;
		height: 38px;
		background-color: #f4f5f7;
		border-radius: 19px;
		padding: 0 14px;
		font-size: 14px;
		color: #333;
	}
	.dc-send {
		flex-shrink: 0;
		margin-left: 10px;
		padding: 9px 18px;
		background-color: #43b876;
		color: #fff;
		font-size: 14px;
		border-radius: 19px;
	}
</style>
