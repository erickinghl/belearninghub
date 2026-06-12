<template>
	<view class="ln-page">
		<!-- 快捷入口 -->
		<view class="ln-quick">
			<view class="ln-quick-item" @click="authJump('/pages/practice/practice?mode=wrong&title=我的错题')">
				<text class="ln-quick-icon">📕</text>
				<text class="ln-quick-name">错题本</text>
			</view>
			<view class="ln-quick-item" @click="authJump('/pages/practice/practice?mode=fava&title=收藏题')">
				<text class="ln-quick-icon">⭐</text>
				<text class="ln-quick-name">收藏题</text>
			</view>
			<view class="ln-quick-item" @click="authJump('/pages/my-test/my-test')">
				<text class="ln-quick-icon">🏆</text>
				<text class="ln-quick-name">我的考试</text>
			</view>
			<view class="ln-quick-item" @click="authJump('/pages/my-book/my-book')">
				<text class="ln-quick-icon">🔖</text>
				<text class="ln-quick-name">我的书架</text>
			</view>
			<view class="ln-quick-item" @click="authJump('/pages/note-list/note-list')">
				<text class="ln-quick-icon">✏️</text>
				<text class="ln-quick-name">我的笔记</text>
			</view>
		</view>

		<tab :tabs="tabs" :current="current" @change="clickTab"></tab>

		<view class="ln-list">
			<course-list type="one" v-for="(item,index) in cur.list" :key="index" :item="item">
				<view slot="desc" class="ln-tagline">
					<text v-if="index == 0" class="ln-recent">最近学习</text>
					<text class="ln-percent-text">已学习 {{ item.progress || 0 }}%</text>
				</view>
				<!-- 覆盖默认 slot（原价格行）→ 进度条 + 继续学习 -->
				<view class="ln-progress-row">
					<view class="ln-bar">
						<view class="ln-bar-fill" :style="'width:' + (item.progress || 0) + '%'"></view>
					</view>
					<text class="ln-go">继续学习 ›</text>
				</view>
			</course-list>
			<view v-if="cur.loaded && !cur.list.length" class="ln-empty">
				<text class="ln-empty-icon">📚</text>
				<text class="ln-empty-text">还没有在学的{{ cur.name }}</text>
				<text class="ln-empty-tip">去首页选一门开始学习吧</text>
			</view>
			<uni-load-more v-if="cur.list.length" :status="cur.loadStatus"></uni-load-more>
		</view>

		<no-login v-if="!token"></no-login>
	</view>
</template>

<script>
	import { mapState } from 'vuex'
	export default {
		data() {
			return {
				current:0,
				tabs:[{
					name:"课程",
					loadStatus:"more",
					loaded:false,
					list:[],
					page:1,
					type:"course"
				},{
					name:"专栏",
					loadStatus:"more",
					loaded:false,
					list:[],
					page:1,
					type:"column"
				}],
			}
		},
		computed: {
			...mapState({
				token:state=>state.token
			}),
			cur(){
				return this.tabs[this.current]
			}
		},
		onShow(){
			if(this.token){
				this.tabs.forEach(item=>{
					item.page = 1
					item.loadStatus = 'more'
					item.loaded = false
				})
				this.getData()
			}
		},
		onReachBottom(){
			this.handleLoadMore(this.cur)
		},
		methods: {
			clickTab(index){
				this.current = index
				const tab = this.tabs[index]
				if(!tab.loaded){
					this.getData()
				}
			},
			getData(){
				let tab = this.tabs[this.current]
				tab.loadStatus = 'loading'
				this.$api.getUserHistory({
					page:tab.page,
					type:tab.type
				}).then(res=>{
					tab.list = tab.page == 1 ? (res.rows||[]) : [...tab.list,...(res.rows||[])]
					tab.loadStatus = (res.rows||[]).length < 10 ? 'noMore' : 'more'
					tab.loaded = true
				}).catch(err=>{
					tab.loadStatus = 'more'
					tab.loaded = true
					if(tab.page > 1){
						tab.page = tab.page - 1
					}
				})
			},
			handleLoadMore(t){
				if(t.loadStatus != 'more') return
				t.page = t.page + 1
				this.getData()
			}
		}
	}
</script>

<style>
	.ln-page{
		min-height: 100vh;
		background-color: #f7f8fa;
	}
	/* #ifdef H5 */
	.ln-page{
		padding-top: 44px;
	}
	/* #endif */
	.ln-quick{
		display: flex;
		background-color: #fff;
		padding: 16px 0;
	}
	.ln-quick-item{
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.ln-quick-icon{
		font-size: 26px;
	}
	.ln-quick-name{
		font-size: 13px;
		color: #555;
		margin-top: 6px;
	}
	.ln-list{
		padding-top: 8px;
	}
	.ln-tagline{
		display: flex;
		align-items: center;
		margin-top: 8px;
	}
	.ln-recent{
		font-size: 11px;
		color: #ff6b6b;
		background-color: rgba(255,107,107,0.12);
		padding: 2px 8px;
		border-radius: 8px;
		margin-right: 8px;
	}
	.ln-percent-text{
		font-size: 12px;
		color: #999;
	}
	.ln-progress-row{
		display: flex;
		align-items: center;
		margin-top: 10px;
	}
	.ln-bar{
		flex: 1;
		height: 6px;
		background-color: #eef0f2;
		border-radius: 3px;
		overflow: hidden;
	}
	.ln-bar-fill{
		height: 6px;
		background: linear-gradient(90deg, #5ccc84 0%, #43b876 100%);
		border-radius: 3px;
	}
	.ln-go{
		font-size: 12px;
		color: #43b876;
		margin-left: 12px;
		flex-shrink: 0;
	}
	.ln-empty{
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 70px;
	}
	.ln-empty-icon{
		font-size: 48px;
		margin-bottom: 12px;
	}
	.ln-empty-text{
		font-size: 15px;
		color: #666;
	}
	.ln-empty-tip{
		font-size: 13px;
		color: #bbb;
		margin-top: 6px;
	}
</style>
