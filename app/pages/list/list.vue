<template>
	<view class="lst-page">
		<view class="lst-wrap flex flex-wrap" v-if="module == 'live'">
			<course-list v-for="(item,index) in list" :key="index" :item="item" :type="module == 'course' || module == 'column' ? 'one' : 'two'" :tag="tag">
				<text slot="desc" class="font-sm my-1 " :class="item.status == '直播中' ? 'text-danger' : 'text-light-muted'">{{ item.status }}</text>
			</course-list>
		</view>
		<view class="lst-wrap" :class="(module=='course'||module=='column') ? 'lst-col' : 'flex flex-wrap'" v-else>
			<course-list v-for="(item,index) in list" :key="index" :item="item" :type="module == 'course' || module == 'column' ? 'one' : 'two'" :tag="tag"></course-list>
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
				limit:10,
				list:[],
				module:"course"
			}
		},
		onLoad(e) {
			if(e.module){
				this.module = e.module
			}
			let t = {
				course:"课程",
				column:"专栏",
				flashsale:"秒杀",
				group:"拼团",
				live:"直播"
			}
			uni.setNavigationBarTitle({
				title:t[this.module] + '列表'
			})
			this.getData()
		},
		computed: {
			tag() {
				if(this.module == 'course' || this.module == 'column' || this.module == 'live'){
					return ''
				}
				return this.module == 'group' ? '拼团价' : '秒杀价'
			}
		},
		onPullDownRefresh() {
			this.page = 1
			this.getData().finally(()=>{
				uni.stopPullDownRefresh()
			})
		},
		onReachBottom() {
			this.handleLoadMore()
		},
		methods: {
			handleLoadMore(){
				if(this.loadStatus != 'more'){
					return
				}
				this.page = this.page + 1
				this.getData()
			},
			getData(){
				let page = this.page
				let fun = {
					course:"getCourseList",
					column:"getColumnList",
					flashsale:"getFlashsale",
					group:"getGroup",
					live:"getLive"
				}
				return this.$api[fun[this.module]]({
					page:this.page,
					limit:this.limit
				}).then(res=>{
					if(this.module == 'live'){
						res.rows = res.rows.map(o=>{
							let start_time = (new Date(o.start_time)).getTime()
							let end_time = (new Date(o.end_time)).getTime()
							let now = Date.now()
							
							if(start_time > now){
								o.status = '未开始'
							} else if(end_time < now){
								o.status = '已结束'
							} else {
								o.status = '直播中'
							}
							
							o.type = 'live'
							
							return o
						})
					}
					console.log(res);
					this.list = page == 1 ? res.rows : [...this.list,...res.rows]
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
	.lst-page{
		min-height: 100vh;
		background-color: #f7f8fa;
		padding-top: 12px;
		padding-bottom: 20px;
	}
	/* H5 固定导航栏(44px)会盖住首张卡片，补足顶部留白 */
	/* #ifdef H5 */
	.lst-page{
		padding-top: 56px;
	}
	/* #endif */
	.lst-wrap{
		padding-top: 2px;
	}
	/* 单列全宽卡片：纵向排列，卡片撑满 */
	.lst-col{
		display: flex;
		flex-direction: column;
	}
	.lst-col .course-one{
		align-self: stretch;
		width: auto;
	}
</style>
