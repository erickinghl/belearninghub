<template>
	<view class="nl-page" :class="isPC ? 'pc-pad' : ''">
		<!-- #ifdef H5 -->
		<pc-header v-if="isPC"></pc-header>
		<!-- #endif -->
		<view class="nl-card" v-for="item in list" :key="item.id">
			<view class="nl-head" @click="openNote(item)">
				<text class="nl-title text-ellipsis">{{ item.title }}</text>
				<text class="nl-time">{{ item.updated_time | formatDate }}</text>
			</view>
			<view class="nl-summary" @click="openNote(item)">{{ summary(item.content) }}</view>
			<view class="nl-foot">
				<text class="nl-op nl-edit" @click="openNote(item)">✏️ 编辑</text>
				<text class="nl-op nl-del" @click="del(item)">🗑 删除</text>
			</view>
		</view>

		<view v-if="firstLoad && !list.length" class="nl-empty">
			<text class="nl-empty-icon">📝</text>
			<text class="nl-empty-text">还没有笔记</text>
			<text class="nl-empty-tip">点右下角 + 写一条吧</text>
		</view>

		<uni-load-more v-if="list.length" :status="loadStatus"></uni-load-more>

		<!-- 悬浮新建按钮 -->
		<view class="nl-add" @click="openNote()">
			<text class="nl-add-plus">＋</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				loadStatus: "loading",
				page: 1,
				limit: 10,
				list: [],
				firstLoad: false
			}
		},
		filters: {
			formatDate(ts) {
				if (!ts) return ''
				const d = new Date(ts)
				const p = n => n < 10 ? '0' + n : '' + n
				return `${d.getMonth() + 1}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
			}
		},
		onShow() {
			// 从写笔记页返回时刷新
			this.refresh()
		},
		onPullDownRefresh() {
			this.refresh()
		},
		onReachBottom() {
			this.handleLoadMore()
		},
		methods: {
			summary(content) {
				if (!content) return '（无内容）'
				// 去掉可能的 HTML 标签，截前 60 字
				let text = content.replace(/<[^>]+>/g, '')
				return text.length > 60 ? text.slice(0, 60) + '...' : text
			},
			refresh() {
				this.page = 1
				this.getData().finally(() => {
					uni.stopPullDownRefresh()
				})
			},
			handleLoadMore() {
				if (this.loadStatus != 'more') return
				this.page = this.page + 1
				this.getData()
			},
			getData() {
				let page = this.page
				return this.$api.getNoteList({
					page: this.page,
					limit: this.limit
				}).then(res => {
					this.list = page == 1 ? res.rows : [...this.list, ...res.rows]
					this.loadStatus = res.rows.length < this.limit ? 'noMore' : 'more'
				}).catch(() => {
					this.loadStatus = 'more'
					if (page > 1) this.page = this.page - 1
				}).finally(() => {
					this.firstLoad = true
				})
			},
			openNote(item) {
				let url = '/pages/note-edit/note-edit'
				if (item) url += '?id=' + item.id
				this.authJump(url)
			},
			del(item) {
				uni.showModal({
					content: '确定删除笔记「' + item.title + '」？',
					success: (res) => {
						if (!res.confirm) return
						this.$api.destroyNote({ id: item.id }).then(() => {
							this.$toast('已删除')
							this.refresh()
						})
					}
				})
			}
		}
	}
</script>

<style>
	.nl-page {
		min-height: 100vh;
		background-color: #f7f8fa;
		padding-top: 12px;
		padding-bottom: 30px;
	}
	/* H5 固定导航栏(44px)会盖住首张卡片，补足顶部留白 */
	/* #ifdef H5 */
	.nl-page {
		padding-top: 56px;
	}
	/* #endif */
	.nl-card {
		background-color: #ffffff;
		margin-left: 12px;
		margin-right: 12px;
		margin-bottom: 12px;
		padding: 14px 16px;
		border-radius: 12px;
		box-shadow: 0 2px 10px rgba(0,0,0,0.05);
	}
	.nl-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.nl-title {
		flex: 1;
		min-width: 0;
		font-size: 16px;
		font-weight: 600;
		color: #222;
	}
	.nl-time {
		font-size: 12px;
		color: #bbb;
		margin-left: 10px;
		flex-shrink: 0;
	}
	.nl-summary {
		font-size: 13px;
		color: #888;
		line-height: 1.6;
		margin-top: 8px;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.nl-foot {
		display: flex;
		justify-content: flex-end;
		margin-top: 12px;
		padding-top: 10px;
		border-top: 1px solid #f4f5f7;
	}
	.nl-op {
		font-size: 13px;
		margin-left: 18px;
	}
	.nl-edit {
		color: #43b876;
	}
	.nl-del {
		color: #ff6b6b;
	}
	.nl-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 90px;
	}
	.nl-empty-icon {
		font-size: 48px;
		margin-bottom: 12px;
	}
	.nl-empty-text {
		font-size: 15px;
		color: #666;
	}
	.nl-empty-tip {
		font-size: 13px;
		color: #bbb;
		margin-top: 6px;
	}
	/* 悬浮新建按钮（px，避免 H5 吞 rpx） */
	.nl-add {
		position: fixed;
		right: 20px;
		bottom: 40px;
		width: 52px;
		height: 52px;
		border-radius: 26px;
		background: linear-gradient(135deg, #5ccc84 0%, #43b876 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 14px rgba(92,204,132,0.5);
		z-index: 99;
	}
	.nl-add-plus {
		color: #fff;
		font-size: 30px;
		line-height: 30px;
	}
</style>
