<template>
	<view class="sr-page">
		<view class="sr-kw">搜索：<text class="sr-kw-text">{{ keyword }}</text></view>
		<tab :tabs="tabs" :current="current" @change="clickTab"></tab>
		<view class="sr-list">
			<course-list type="one" v-for="(item,index) in cur.list" :key="index" :item="item"></course-list>
			<view v-if="cur.loaded && !cur.list.length" class="sr-empty">
				<text class="sr-empty-icon">🔍</text>
				<text class="sr-empty-text">没有找到"{{ keyword }}"相关的{{ cur.name }}</text>
				<text class="sr-empty-tip">换个关键词试试吧</text>
			</view>
			<uni-load-more v-if="cur.list.length" :status="cur.loadStatus"></uni-load-more>
		</view>
	</view>
</template>

<script>
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
				keyword:""
			}
		},
		computed: {
			cur(){
				return this.tabs[this.current]
			}
		},
		onNavigationBarSearchInputClicked() {
			uni.navigateBack({
				delta: 1
			});
		},
		onLoad(e) {
			this.keyword = e.keyword
			this.getData()
		},
		onReachBottom() {
			this.handleLoadMore(this.cur)
		},
		methods: {
			clickTab(index){
				this.current = index
				let tab = this.tabs[index]
				// 切到未加载过的 tab 自动加载
				if(!tab.loaded){
					this.getData()
				}
			},
			swiperChange(e){
				this.current = e.detail.current
				let tab = this.tabs[this.current]
				if(tab.loadStatus == 'more' && tab.page == 1){
					this.getData()
				}
			},
			getData(){
				let tab = this.tabs[this.current]
				tab.loadStatus = 'loading'
				this.$api.search({
					keyword:this.keyword,
					page:tab.page,
					type:tab.type
				}).then(res=>{
					console.log(res.rows)
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
	.sr-page{
		min-height: 100vh;
		background-color: #f7f8fa;
	}
	.sr-kw{
		padding: 10px 14px;
		font-size: 13px;
		color: #999;
		background-color: #fff;
	}
	.sr-kw-text{
		color: #333;
	}
	.sr-list{
		padding-top: 8px;
	}
.sr-empty{
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: 80px;
}
.sr-empty-icon{
	font-size: 48px;
	margin-bottom: 12px;
}
.sr-empty-text{
	font-size: 15px;
	color: #666;
}
.sr-empty-tip{
	font-size: 13px;
	color: #bbb;
	margin-top: 6px;
}
</style>
