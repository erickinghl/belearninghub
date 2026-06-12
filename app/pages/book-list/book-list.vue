<template>
	<view class="bkl-page">
		<book-list v-for="(item,index) in list" :key="index" :item="item"></book-list>

		<view v-if="!loading && !list.length" class="bkl-empty">
			<text class="bkl-empty-icon">📚</text>
			<text class="bkl-empty-text">暂无电子书</text>
		</view>

		<uni-load-more v-if="list.length" :status="loadStatus"></uni-load-more>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				loadStatus:"loading",
				loading:true,
				page:1,
				limit:10,
				list:[]
			}
		},
		created() {
			this.getData()
		},
		onPullDownRefresh() {
			this.refresh()
		},
		onReachBottom() {
			this.handleLoadMore()
		},
		methods: {
			refresh(){
				this.page = 1
				this.getData().finally(()=>{
					uni.stopPullDownRefresh()
				})
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
				return this.$api.getBookList({
					page:this.page,
					limit:this.limit
				}).then(res=>{
					console.log(res);
					this.list = page == 1 ? res.rows : [...this.list,...res.rows]
					this.loadStatus = res.rows.length < this.limit ? 'noMore' : 'more'
					this.loading = false
				}).catch(err=>{
					this.loadStatus = 'more'
					this.loading = false
					if(page > 1){
						this.page = this.page - 1
					}
				})
			}
		}
	}
</script>

<style>
	.bkl-page{
		min-height: 100vh;
		background-color: #f7f8fa;
		padding-top: 12px;
	}
	/* H5 固定导航栏(44px)会盖住首张卡片，补足顶部留白 */
	/* #ifdef H5 */
	.bkl-page{
		padding-top: 56px;
	}
	/* #endif */
	.bkl-empty{
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 90px;
	}
	.bkl-empty-icon{
		font-size: 48px;
		margin-bottom: 12px;
	}
	.bkl-empty-text{
		font-size: 15px;
		color: #999;
	}
</style>
