<template>
	<view class="fv-page">
		<view class="fv-item" v-for="(item,index) in list" :key="index">
			<course-list type="one" :item="item.goods">
				<view slot="desc" class="fv-desc text-ellipsis" v-if="item.goods.desc || item.goods.try">{{ item.goods.desc || stripHtml(item.goods.try) }}</view>
				<view class="fv-foot">
					<text class="fv-type">{{ typeName(item.type) }}</text>
					<text class="fv-cancel" @click.stop="onCancel(item)">取消收藏</text>
				</view>
			</course-list>
		</view>

		<view v-if="firstLoad && !list.length" class="fv-empty">
			<text class="fv-empty-icon">⭐</text>
			<text class="fv-empty-text">还没有收藏</text>
			<text class="fv-empty-tip">在课程/电子书详情页点收藏吧</text>
		</view>

		<uni-load-more v-if="list.length" :status="loadStatus"></uni-load-more>
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
		onShow() {
			this.page = 1
			this.getData()
		},
		onPullDownRefresh() {
			this.page = 1
			this.getData().finally(() => {
				uni.stopPullDownRefresh()
			})
		},
		onReachBottom() {
			this.handleLoadMore()
		},
		methods: {
			typeName(t) {
				return { course: '课程', column: '专栏', book: '电子书' }[t] || '课程'
			},
			stripHtml(s) {
				if (!s) return ''
				let text = s.replace(/<[^>]+>/g, '')
				return text.length > 40 ? text.slice(0, 40) + '...' : text
			},
			onCancel(item) {
				uni.showModal({
					content: '确定取消收藏「' + (item.goods.title || '') + '」？',
					success: (res) => {
						if (!res.confirm) return
						uni.showLoading({ title: '操作中...', mask: false })
						this.$api.uncollect({
							goods_id: item.goods.id,
							type: item.type
						}).then(() => {
							this.$toast('已取消收藏')
							this.page = 1
							this.getData()
						}).finally(() => {
							uni.hideLoading()
						})
					}
				})
			},
			handleLoadMore() {
				if (this.loadStatus != 'more') return
				this.page = this.page + 1
				this.getData()
			},
			getData() {
				let page = this.page
				return this.$api.getMyFavaList({
					page: this.page,
					limit: this.limit
				}).then(res => {
					this.list = page == 1 ? (res.rows || []) : [...this.list, ...(res.rows || [])]
					this.loadStatus = (res.rows || []).length < this.limit ? 'noMore' : 'more'
				}).catch(() => {
					this.loadStatus = 'more'
					if (page > 1) this.page = this.page - 1
				}).finally(() => {
					this.firstLoad = true
				})
			}
		}
	}
</script>

<style>
	.fv-page {
		min-height: 100vh;
		background-color: #f7f8fa;
		padding-top: 12px;
		padding-bottom: 30px;
	}
	/* H5 固定导航栏(44px)会盖住首张卡片，补足顶部留白 */
	/* #ifdef H5 */
	.fv-page {
		padding-top: 56px;
	}
	/* #endif */
	.fv-desc {
		font-size: 12px;
		color: #999;
		margin-top: 6px;
	}
	.fv-foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 10px;
	}
	.fv-type {
		font-size: 11px;
		color: #43b876;
		background-color: rgba(67,184,118,0.1);
		padding: 2px 8px;
		border-radius: 8px;
	}
	.fv-cancel {
		font-size: 12px;
		color: #ff6b6b;
		border: 1px solid #ffd0d0;
		padding: 4px 12px;
		border-radius: 14px;
	}
	.fv-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 90px;
	}
	.fv-empty-icon {
		font-size: 48px;
		margin-bottom: 12px;
	}
	.fv-empty-text {
		font-size: 15px;
		color: #666;
	}
	.fv-empty-tip {
		font-size: 13px;
		color: #bbb;
		margin-top: 6px;
	}
</style>
