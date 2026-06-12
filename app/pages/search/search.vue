<template>
	<view class="se-page">
		<!-- #ifdef MP -->
		<search-bar v-model="keyword" @confirm="handleSearchEvent()"></search-bar>
		<!-- #endif -->

		<!-- H5：页面内搜索栏（App 用原生导航搜索框，H5 这里补一个可靠的） -->
		<!-- #ifdef H5 -->
		<view class="se-bar">
			<view class="se-input-wrap">
				<text class="se-icon">🔍</text>
				<input class="se-input" v-model="keyword" placeholder="搜索课程、专栏" confirm-type="search" @confirm="handleSearchEvent()" />
				<text v-if="keyword" class="se-clear" @click="keyword=''">✕</text>
			</view>
			<text class="se-btn" @click="handleSearchEvent()">搜索</text>
		</view>
		<!-- #endif -->

		<!-- 热门搜索 -->
		<view class="se-section">
			<text class="se-section-title">热门搜索</text>
			<view class="se-tags">
				<text class="se-tag" v-for="(item,index) in hot" :key="index" @click="handleSearchEvent(item)">{{ item }}</text>
			</view>
		</view>

		<!-- 历史记录 -->
		<view class="se-section" v-if="list.length">
			<view class="se-section-head">
				<text class="se-section-title">历史记录</text>
				<text class="se-clear-all" @click="clear">清除</text>
			</view>
			<view class="se-tags">
				<text class="se-tag" v-for="(item,index) in list" :key="index" @click="handleSearchEvent(item)">{{ item }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				list:[],
				keyword:"",
				hot:['Vue3','uni-app','egg.js','JavaScript','前端']
			}
		},
		onNavigationBarSearchInputChanged(e) {
			this.keyword = e.text
		},
		onNavigationBarButtonTap() {
			this.handleSearchEvent()
		},
		onNavigationBarSearchInputConfirmed() {
			this.handleSearchEvent()
		},
		onLoad() {
			let list = uni.getStorageSync('historyKeyword')
			if(list){
				this.list = JSON.parse(list)
			}
		},
		methods: {
			// 搜索
			handleSearchEvent(value = ''){
				if(value){
					this.keyword = value
				}
				if(this.keyword == ''){
					return this.$toast('请输入关键词')
				}
				// 跳转到搜索结果页
				uni.navigateTo({
					url: '../search-result/search-result?keyword='+this.keyword,
				});
				// 加入到历史记录
				this.addHistory()
			},
			addHistory(){
				let index = this.list.findIndex(v=>v == this.keyword)
				if(index != -1){
					this.objToFirst(this.list,index)
				} else {
					this.list.unshift(this.keyword)
				}
				uni.setStorageSync('historyKeyword',JSON.stringify(this.list))
			},
			clear(){
				uni.showModal({
					content: '是否要清除搜索记录？',
					success: (res)=> {
						if (res.confirm) {
							this.list = []
							uni.removeStorageSync('historyKeyword')
						}
					}
				});
			},
			// 置顶数组某一项
			objToFirst(arr,index){
				if(index != 0){
					arr.unshift(arr.splice(index,1)[0])
				}
				return arr
			}
		}
	}
</script>

<style>
	.se-page{ min-height:100vh; background-color:#f7f8fa; }
	.se-bar{ display:flex; align-items:center; padding:10px 12px; background-color:#fff; }
	.se-input-wrap{ flex:1; display:flex; align-items:center; background-color:#f0f2f5; border-radius:20px; padding:0 12px; height:38px; }
	.se-icon{ font-size:15px; color:#999; }
	.se-input{ flex:1; margin-left:8px; height:38px; font-size:14px; background-color:transparent; }
	.se-clear{ color:#bbb; font-size:14px; padding:0 4px; }
	.se-btn{ color:#5ccc84; font-size:15px; padding-left:14px; }
	.se-section{ padding:16px 14px 0; }
	.se-section-head{ display:flex; align-items:center; justify-content:space-between; }
	.se-section-title{ font-size:15px; font-weight:bold; color:#333; }
	.se-clear-all{ font-size:13px; color:#999; }
	.se-tags{ display:flex; flex-wrap:wrap; margin-top:12px; }
	.se-tag{ background-color:#fff; color:#555; font-size:13px; padding:7px 16px; border-radius:16px; margin-right:10px; margin-bottom:10px; box-shadow:0 1px 4px rgba(0,0,0,0.05); }
</style>
