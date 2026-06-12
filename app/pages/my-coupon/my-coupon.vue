<template>
	<view>
		
		<view v-for="(item,index) in list" :key="index" class="flex text-white mb-3" :class="item.btn != '立即使用' ? 'coupon-used' : ''">
			<view class="flex flex-column flex-1 bg-hover-warning p-2"
			style="border-right: 4rpx dashed #FFFFFF;">
				<text class="font-lg">￥{{ item.price }}</text>
				<text class="font-sm">适用{{ item.typeName }}：{{ item.title }}</text>
			</view>
			<view hover-class="bg-hover-warning" class="flex align-center justify-center bg-warning" style="width: 200rpx;" @click="onClickCoupon(item)">{{ item.btn }}</view>
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
				goods_id:null,
				type:null
			}
		},
		created() {
			this.getData()
		},
		onLoad(e) {
			if(e.goods_id && e.type){
				this.goods_id = e.goods_id
				this.type = e.type
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
				return this.$api.getUserCoupon({
					page:this.page,
					limit:this.limit
				}).then(res=>{
					res.rows = this.formatList(res.rows)
					console.log(res.rows)
					this.list = page == 1 ? res.rows : [...this.list,...res.rows]
					this.loadStatus = res.rows.length < this.limit ? 'noMore' : 'more'
				}).catch(err=>{
					this.loadStatus = 'more'
					if(page > 1){
						this.page = this.page - 1
					}
				})
			},
			formatList(list){
				list.forEach(v=>{
					const now = (new Date()).getTime()
					const end = (new Date(v.end_time)).getTime()
					v.expired = end < now
					v.btn = v.used == 1 ? '已使用' : (v.expired ? '已过期' : '立即使用')
					v.typeName = v.type == 'course' ? '课程' : '专栏'
					if((this.type && this.goods_id && v.btn == '立即使用') && (v.type != this.type || v.goods_id != this.goods_id)){
						v.btn = '不可用'
					}
				})
				return list
			},
			onClickCoupon(item){
				if(item.btn != "立即使用"){
					return
				}
				if(this.type && this.goods_id){
					uni.$emit("chooseCoupon",{
						user_coupon_id:item.id,
						price:parseFloat(item.price)
					})
					return uni.navigateBack({
						delta: 1
					});
				}
			}
		}
	}
</script>

<style>
page{
	padding: 30rpx;
	box-sizing: border-box;
}
.coupon-used>view{
	background-color: #CCCCCC!important;
}
</style>
