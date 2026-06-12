<template>
	<view class="bk-card" @click="openDetail">
		<view class="bk-cover-wrap">
			<image :src="item.cover || placeholder" mode="aspectFill" class="bk-cover"></image>
			<text class="bk-type">{{ item.type | formatType }}</text>
		</view>
		<view class="bk-body">
			<text class="text-ellipsis bk-title">{{ item.title }}</text>
			<view v-if="item.desc" class="bk-desc text-ellipsis">{{ item.desc }}</view>
			<slot name="desc"></slot>
			<view class="bk-foot">
				<view class="bk-price-box">
					<text class="bk-free" v-if="item.price == 0">免费</text>
					<text class="bk-price" v-else>￥{{ item.price }}</text>
					<text class="bk-oprice" v-if="item.t_price">￥{{ item.t_price }}</text>
				</view>
				<view class="bk-sub" v-if="issub">
					{{ item.sub_count }}人订阅 ›
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	let opt = {
		media:"图文",
		audio:"音频",
		video:"视频",
		column:"专栏"
	}
	export default {
		name:"book-list",
		props: {
			item: Object,
			type:{
				type:String,
				default:"two"
			},
			disabled:{
				type:Boolean,
				default:false
			}
		},
		filters: {
			formatType(k) {
				return opt[k];
			}
		},
		computed: {
			issub() {
				return typeof this.item.sub_count == 'number'
			}
		},
		data() {
			return {
				// 空封面兜底图（灰底 + 书名图标）
				placeholder: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="185" height="235"><rect width="185" height="235" fill="#e9ecf1"/><text x="92" y="135" font-size="70" text-anchor="middle" fill="#b8c0cc">📖</text></svg>')
			};
		},
		methods:{
			openDetail(){
				if(this.disabled){
					return
				}
				uni.navigateTo({
					url:"/pages/book-detail/book-detail?id="+this.item.id,
				});
			}
		}
	}
</script>

<style>
.bk-card{
	display: flex;
	background-color: #ffffff;
	margin-left: 12px;
	margin-right: 12px;
	margin-top: 0;
	margin-bottom: 12px;
	padding-top: 12px;
	padding-bottom: 12px;
	padding-left: 12px;
	padding-right: 14px;
	border-radius: 12px;
	box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
.bk-cover-wrap{
	position: relative;
	width: 84px;
	height: 108px;
	flex-shrink: 0;
	margin-right: 14px;
	border-radius: 8px;
	overflow: hidden;
}
.bk-cover{
	width: 84px !important;
	height: 108px !important;
	border-radius: 8px;
	display: block;
}
.bk-type{
	position: absolute;
	left: 6px;
	top: 6px;
	background-color: rgba(0,0,0,0.5);
	color: #fff;
	font-size: 11px;
	padding-left: 6px;
	padding-right: 6px;
	padding-top: 1px;
	padding-bottom: 1px;
	border-radius: 4px;
}
.bk-body{
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	padding-top: 4px;
	padding-bottom: 4px;
	padding-left: 2px;
}
.bk-title{
	font-size: 15px;
	color: #222;
	font-weight: 600;
	line-height: 1.45;
}
.bk-desc{
	font-size: 12px;
	color: #999;
	margin-top: 6px;
	line-height: 1.5;
}
.bk-foot{
	flex: 1;
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	margin-top: 10px;
}
.bk-price-box{
	display: flex;
	align-items: baseline;
}
.bk-free{
	font-size: 15px;
	color: #ff5b4c;
	font-weight: 700;
}
.bk-price{
	font-size: 16px;
	color: #ff5b4c;
	font-weight: 700;
}
.bk-oprice{
	font-size: 12px;
	color: #bbb;
	text-decoration: line-through;
	margin-left: 8px;
}
.bk-sub{
	font-size: 12px;
	color: #999;
	background-color: #f4f5f7;
	padding-left: 10px;
	padding-right: 10px;
	padding-top: 4px;
	padding-bottom: 4px;
	border-radius: 14px;
}
</style>
