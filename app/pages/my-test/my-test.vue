<template>
	<view>
		
		<view v-for="(item,index) in list" :key="index">
			<uni-card isFull note="true">
				<view class="flex justify-between">
					<text class="h4 font-weight-bold">{{ item.testpaper.title }}</text>
					<text class="font-sm" :class="item.answer_status ? 'text-success' : 'text-danger'">{{ item.answer_status ? '考试完成' : '考试中' }}</text>
				</view>
				<view class="flex my-3">
					<text class="flex-1">题目总数：{{ item.testpaper.question_count }}</text>
					<text class="flex-1" :class="item.read_status == 0 ? 'text-danger' : ''">最终得分：{{ item.read_status ? item.score : '正在阅卷' }}</text>
				</view>
				<view slot="footer" class="flex text-light-muted">
					{{ item.created_time }}
				</view>
			</uni-card>
			<view class="divider"></view>
		</view>
		
		<uni-load-more :status="loadStatus"></uni-load-more>
		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				loadStatus:"loading",
				page:1,
				limit:5,
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
				return this.$api.getMyTestList({
					page:this.page,
					limit:this.limit
				}).then(res=>{
					console.log(res);
					this.list = page == 1 ? res.rows : [...this.list,...res.rows],
					this.loadStatus = res.rows.length < this.limit ? 'noMore' : 'more'
				}).catch(err=>{
					this.loadStatus = 'more'
					if(page > 1){
						this.page = this.page - 1
					}
				})
			}
		}
	}
</script>

<style>

</style>
