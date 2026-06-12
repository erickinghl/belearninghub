<template>
	<view class="tl-page">
		<!-- 分类筛选 -->
		<scroll-view scroll-x class="tl-cats" v-if="cats.length">
			<view class="tl-cat" :class="curCat === 0 ? 'tl-cat-on' : ''" @click="selectCat(0)">全部</view>
			<view class="tl-cat" :class="curCat === c.id ? 'tl-cat-on' : ''" v-for="c in cats" :key="c.id" @click="selectCat(c.id)">{{ c.title }}</view>
		</scroll-view>

		<view v-for="(item,index) in list" :key="index" class="tl-card">
			<view class="tl-head">
				<text class="tl-title">{{ item.title }}</text>
				<text class="tl-tag" v-if="item.is_test">已考过</text>
			</view>
			<view class="tl-meta">
				<view class="tl-meta-item">
					<text class="tl-num">{{ item.question_count }}</text>
					<text class="tl-lbl">题目数</text>
				</view>
				<view class="tl-meta-item">
					<text class="tl-num">{{ item.total_score }}</text>
					<text class="tl-lbl">总分</text>
				</view>
				<view class="tl-meta-item">
					<text class="tl-num">{{ item.pass_score }}</text>
					<text class="tl-lbl">及格分</text>
				</view>
				<view class="tl-meta-item">
					<text class="tl-num">{{ item.expire > 0 ? item.expire : '不限' }}</text>
					<text class="tl-lbl">{{ item.expire > 0 ? '限时(分)' : '时长' }}</text>
				</view>
			</view>
			<view class="tl-btns">
				<view class="tl-btn tl-btn-practice" @click="startPractice(item)">练习模式</view>
				<view class="tl-btn tl-btn-exam" @click="startTest(item.id)">考试模式</view>
			</view>
		</view>

		<view v-if="firstLoad && !list.length" class="tl-empty">暂无试卷</view>
		<uni-load-more :status="loadStatus"></uni-load-more>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				loadStatus:"loading",
				firstLoad:false,
				page:1,
				limit:5,
				list:[],
				cats:[],
				curCat:0
			}
		},
		created() {
			this.getCats()
			this.getData()
			uni.$on('refreshTestList',this.refresh)
		},
		destroyed() {
			uni.$off('refreshTestList',this.refresh)
		},
		onPullDownRefresh() {
			this.refresh()
		},
		onReachBottom() {
			this.handleLoadMore()
		},
		methods: {
			getCats(){
				this.$api.getTestCategories().then(res=>{
					this.cats = res || []
				}).catch(()=>{})
			},
			selectCat(id){
				if(this.curCat === id) return
				this.curCat = id
				this.page = 1
				this.list = []
				this.firstLoad = false
				this.loadStatus = 'loading'
				this.getData()
			},
			refresh(){
				this.page = 1
				this.getData().finally(()=>{
					uni.stopPullDownRefresh()
				})
			},
			startTest(id){
				// 考试模式：整卷顺序答题、交卷判分（test-detail 自身做鉴权）
				uni.navigateTo({
					url: '/pages/test-detail/test-detail?id=' + id
				});
			},
			startPractice(item){
				// 练习模式：题号宫格 + 单题即时判对错
				this.authJump('/pages/practice/practice?id=' + item.id + '&title=' + encodeURIComponent(item.title))
			},
			handleLoadMore(){
				if(this.loadStatus != 'more'){
					return
				}
				this.page = this.page + 1
				this.getData()
			},
			getData(){
				let page = this.page
				let params = { page:this.page, limit:this.limit }
				if(this.curCat){ params.category_id = this.curCat }
				return this.$api.getTestList(params).then(res=>{
					console.log(res);
					this.list = page == 1 ? res.rows : [...this.list,...res.rows],
					this.loadStatus = res.rows.length < this.limit ? 'noMore' : 'more'
				}).catch(err=>{
					this.loadStatus = 'more'
					if(page > 1){
						this.page = this.page - 1
					}
				}).finally(()=>{
					this.firstLoad = true
				})
			}
		}
	}
</script>

<style>
	.tl-page {
		min-height: 100vh;
		background-color: #f7f8fa;
		padding: 24px 12px 12px;
		box-sizing: border-box;
	}
	/* #ifdef H5 */
	.tl-page {
		padding-top: 56px;
	}
	/* #endif */
	/* 分类筛选条 */
	.tl-cats {
		white-space: nowrap;
		margin-bottom: 14px;
	}
	.tl-cat {
		display: inline-block;
		font-size: 14px;
		color: #666;
		background-color: #fff;
		padding: 7px 16px;
		border-radius: 16px;
		margin-right: 10px;
		box-shadow: 0 1px 4px rgba(0,0,0,0.04);
	}
	.tl-cat-on {
		color: #fff;
		background: linear-gradient(135deg, #5ccc84 0%, #43b876 100%);
	}
	.tl-card {
		background-color: #fff;
		border-radius: 14px;
		padding: 18px 16px;
		margin-bottom: 14px;
		box-shadow: 0 2px 12px rgba(0,0,0,0.05);
	}
	.tl-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16px;
	}
	.tl-title {
		font-size: 17px;
		font-weight: bold;
		color: #222;
		flex: 1;
	}
	.tl-tag {
		font-size: 11px;
		color: #999;
		background-color: #f0f2f5;
		padding: 2px 8px;
		border-radius: 8px;
		margin-left: 8px;
	}
	.tl-meta {
		display: flex;
		background-color: #fafbfc;
		border-radius: 10px;
		padding: 12px 0;
		margin-bottom: 16px;
	}
	.tl-meta-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.tl-num {
		font-size: 18px;
		font-weight: bold;
		color: #5ccc84;
	}
	.tl-lbl {
		font-size: 12px;
		color: #999;
		margin-top: 2px;
	}
	.tl-btns {
		display: flex;
	}
	.tl-btn {
		flex: 1;
		height: 44px;
		line-height: 44px;
		text-align: center;
		border-radius: 22px;
		font-size: 15px;
		letter-spacing: 1px;
	}
	.tl-btn-practice {
		color: #43b876;
		background-color: rgba(67,184,118,0.1);
		border: 1px solid #43b876;
		margin-right: 10px;
	}
	.tl-btn-exam {
		color: #fff;
		background: linear-gradient(135deg, #5ccc84 0%, #43b876 100%);
	}
	.tl-empty {
		text-align: center;
		color: #bbb;
		padding: 60px 0;
		font-size: 14px;
	}
</style>
