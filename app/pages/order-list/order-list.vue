<template>
	<view class="ol-page">
		<view class="ol-card" v-for="(item,index) in list" :key="index">
			<!-- 顶部：订单号 + 状态 -->
			<view class="ol-top">
				<text class="ol-no">订单号 {{ item.no }}</text>
				<text class="ol-status" :class="statusClass(item.status)">{{ statusText(item.status) }}</text>
			</view>

			<!-- 商品 + 价格 -->
			<view class="ol-body">
				<view class="ol-cover">
					<text class="ol-cover-icon">{{ goodsIcon(item) }}</text>
				</view>
				<view class="ol-info">
					<text class="ol-goods text-ellipsis">{{ item.goods }}</text>
					<text class="ol-time">{{ item.created_time }}</text>
				</view>
				<text class="ol-price">￥{{ item.price }}</text>
			</view>

			<!-- 底部：操作 -->
			<view class="ol-foot" v-if="item.status == 'pendding'">
				<view class="ol-pay-btn" @click="pay(item.no)">立即支付</view>
			</view>
		</view>

		<view v-if="firstLoad && !list.length" class="ol-empty">
			<text class="ol-empty-icon">📋</text>
			<text class="ol-empty-text">还没有订单</text>
			<text class="ol-empty-tip">去首页选一门课程吧</text>
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
		created() {
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
			statusText(s) {
				return { success: '交易成功', cancel: '已取消', pendding: '等待支付' }[s] || '等待支付'
			},
			statusClass(s) {
				return { success: 'ol-st-success', cancel: 'ol-st-cancel', pendding: 'ol-st-pend' }[s] || 'ol-st-pend'
			},
			goodsIcon(item) {
				const t = item.goods_type || item.type
				if (t === 'book') return '📖'
				if (t === 'column') return '📰'
				return '🎓'
			},
			pay(no) {
				uni.navigateTo({
					url: '../mock-pay/mock-pay?no=' + no,
				});
			},
			handleLoadMore() {
				if (this.loadStatus != 'more') return
				this.page = this.page + 1
				this.getData()
			},
			getData() {
				let page = this.page
				return this.$api.getOrderList({
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
	.ol-page {
		min-height: 100vh;
		background-color: #f7f8fa;
		padding-top: 12px;
		padding-bottom: 30px;
	}
	/* H5 固定导航栏(44px)会盖住首张卡片，补足顶部留白 */
	/* #ifdef H5 */
	.ol-page {
		padding-top: 56px;
	}
	/* #endif */
	.ol-card {
		background-color: #ffffff;
		margin-left: 12px;
		margin-right: 12px;
		margin-bottom: 12px;
		border-radius: 12px;
		box-shadow: 0 2px 10px rgba(0,0,0,0.05);
		overflow: hidden;
	}
	.ol-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 14px;
		border-bottom: 1px solid #f4f5f7;
	}
	.ol-no {
		font-size: 12px;
		color: #999;
	}
	.ol-status {
		font-size: 13px;
		font-weight: 600;
	}
	.ol-st-success { color: #43b876; }
	.ol-st-cancel { color: #bbb; }
	.ol-st-pend { color: #ff9500; }
	.ol-body {
		display: flex;
		align-items: center;
		padding: 14px;
	}
	.ol-cover {
		width: 50px;
		height: 50px;
		border-radius: 10px;
		background-color: #f0f7f3;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		margin-right: 12px;
	}
	.ol-cover-icon {
		font-size: 26px;
	}
	.ol-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}
	.ol-goods {
		font-size: 15px;
		font-weight: 600;
		color: #222;
	}
	.ol-time {
		font-size: 12px;
		color: #aaa;
		margin-top: 6px;
	}
	.ol-price {
		font-size: 16px;
		font-weight: 700;
		color: #ff5b4c;
		margin-left: 10px;
		flex-shrink: 0;
	}
	.ol-foot {
		display: flex;
		justify-content: flex-end;
		padding: 0 14px 14px;
	}
	.ol-pay-btn {
		height: 34px;
		line-height: 34px;
		padding: 0 22px;
		background: linear-gradient(135deg, #5ccc84 0%, #43b876 100%);
		color: #ffffff;
		font-size: 14px;
		border-radius: 17px;
	}
	.ol-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 90px;
	}
	.ol-empty-icon {
		font-size: 48px;
		margin-bottom: 12px;
	}
	.ol-empty-text {
		font-size: 15px;
		color: #666;
	}
	.ol-empty-tip {
		font-size: 13px;
		color: #bbb;
		margin-top: 6px;
	}
</style>
