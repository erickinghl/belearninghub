<template>
	<view class="scroll-row-item course" :class="'course-'+type" @click="openDetail">
		<view class="position-relative" :style="imgWrapStyle">
			<image :src="item.cover || coverPlaceholder" :style="imgStyle" mode="aspectFill"></image>
			<view class="text-white font-sm">{{ item.type | formatType }}</view>
		</view>
		<view class="flex flex-column flex-shrink course-body">
			<text class="text-ellipsis font-md course-title">{{ item.title }}</text>
			<slot name="desc"></slot>
			<view class="flex flex-1 align-end course-price-row">
				<slot>
				<text class="course-tag" v-if="tag">{{ tag }}</text>
				<text class="course-free" v-if="item.price == 0">免费</text>
				<text class="course-price" v-else-if="item.price > 0">￥{{ item.price }}</text>
				<text class="course-oprice" v-if="item.t_price">￥{{ item.t_price }}</text>
				</slot>
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
		name:"course-list",
		props: {
			item: Object,
			type:{
				type:String,
				default:"two"
			},
			tag:{
				type:String,
				default:""
			}
		},
		filters: {
			formatType(k) {
				return opt[k];
			}
		},
		computed: {
			// 内联样式直接控制图片尺寸，绕过 uni-image 默认 320x240 的框架样式
			imgStyle() {
				if (this.type === 'one') {
					return 'width:120px;height:75px;border-radius:6px;display:block;'
				}
				// two / 默认：网格小卡片
				return 'width:160px;height:90px;border-top-left-radius:8px;border-top-right-radius:8px;display:block;'
			},
			imgWrapStyle() {
				if (this.type === 'one') {
					return 'width:120px;height:75px;border-radius:6px;overflow:hidden;flex-shrink:0;'
				}
				return 'width:160px;height:90px;border-top-left-radius:8px;border-top-right-radius:8px;overflow:hidden;'
			}
		},
		data() {
			return {
				// 空封面兜底图（渐变绿底 + 🎓）
				coverPlaceholder: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7fd49e"/><stop offset="1" stop-color="#5ccc84"/></linearGradient></defs><rect width="160" height="90" fill="url(#g)"/><text x="80" y="58" font-size="40" text-anchor="middle">🎓</text></svg>')
			};
		},
		methods:{
			openDetail(){
				let params = `id=${this.item.id}`
				
				if(this.item.group_id){
					params += `&group_id=${this.item.group_id}`
				}
				if(this.item.flashsale_id){
					params += `&flashsale_id=${this.item.flashsale_id}`
				}
				
				let url = '/pages/course/course?'+params
				if(!this.item.type || this.item.type == 'column'){
					url = '/pages/column/column?'+params
				}
				if(this.item.type == 'live'){
					url = '/pages/live/live?'+params
				}
				
				uni.navigateTo({ url });
			}
		}
	}
</script>

<style>
/* ===== two 模式：网格小卡片（图小、圆角、白卡片）单值属性 + px，避免编译器吞样式 ===== */
.course-two{
	width: 160px;
	margin-left: 10px;
	margin-top: 0;
	margin-right: 0;
	margin-bottom: 12px;
	background-color: #ffffff;
	border-radius: 8px;
	overflow: hidden;
	box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.course-two>view:last-child{
	padding-top: 8px;
	padding-left: 8px;
	padding-right: 8px;
	padding-bottom: 10px;
}
.course-two>view:last-child>text:first-child{
	margin-top: 0;
	font-size: 13px;
	line-height: 1.5;
}
.course-two>view:first-child{
	width: 160px;
	height: 90px;
	border-top-left-radius: 8px;
	border-top-right-radius: 8px;
	overflow: hidden;
}
.course-two>view:first-child image{
	width: 160px !important;
	height: 90px !important;
	border-top-left-radius: 8px;
	border-top-right-radius: 8px;
	display: block;
}
.course>view:first-child>view{
	position: absolute;
	right: 6px;
	bottom: 6px;
	background-color: rgba(0,0,0,0.5);
	padding-top: 1px;
	padding-bottom: 1px;
	padding-left: 6px;
	padding-right: 6px;
	border-radius: 4px;
	font-size: 11px;
}
/* ===== one 模式：左图右文单行卡片（紧凑不溢出）===== */
.course-one{
	display: flex!important;
	padding-top: 12px;
	padding-bottom: 12px;
	padding-left: 12px;
	padding-right: 14px;
	background-color: #ffffff;
	margin-left: 12px;
	margin-right: 12px;
	margin-top: 0;
	margin-bottom: 12px;
	border-radius: 12px;
	box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
.course-one>view:first-child{
	margin-right: 12px;
	border-radius: 8px;
	overflow: hidden;
	flex-shrink: 0;
	width: 120px;
	height: 78px;
}
.course-one>view:first-child image{
	width: 120px !important;
	height: 78px !important;
	border-radius: 8px;
	display: block;
}
.course-one .course-body{
	flex: 1;
	min-width: 0;
	width: auto;
	justify-content: space-between;
	padding-top: 2px;
	padding-bottom: 2px;
	padding-left: 12px;
}
.course-one .course-title{
	font-size: 15px;
	color: #222;
	font-weight: 600;
	line-height: 1.45;
}
/* 价格行：靠左对齐、底部留白、价格与原价对齐 */
.course-price-row{
	margin-top: 8px;
	align-items: baseline;
}
.course-free{
	font-size: 15px;
	color: #ff5b4c;
	font-weight: 700;
}
.course-price{
	font-size: 16px;
	color: #ff5b4c;
	font-weight: 700;
}
.course-oprice{
	font-size: 12px;
	color: #bbb;
	text-decoration: line-through;
	margin-left: 8px;
}
.course-tag{
	font-size: 11px;
	color: #ff5b4c;
	background-color: rgba(255,91,76,0.1);
	padding: 1px 7px;
	border-radius: 8px;
	margin-right: 6px;
}
</style>
