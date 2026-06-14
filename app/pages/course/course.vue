<template>
	<view :class="isPC ? 'crs-page-pc' : ''">
		<!-- #ifdef H5 -->
		<pc-header v-if="isPC" active="course"></pc-header>
		<!-- #endif -->

		<!-- 已购的音/视频课：播放器；其余（含已购图文、未购任意）：封面图 -->
		<f-audio v-if="detail.isbuy && detail.type == 'audio'" :poster="detail.cover" :src="detail.content" @onProgress="onAudioProgressUpdate"></f-audio>
		<video v-else-if="detail.isbuy && detail.type == 'video'" :src="detail.content" controls style="width: 100%;height: 210px;" :poster="detail.cover" @timeupdate="onVideoTimeUpdate"></video>
		<view v-else class="position-relative">
			<image :src="detail.cover || coursePlaceholder" mode="aspectFill" style="width: 100%;height: 210px;display:block;" class="bg-light"></image>
			<view class="crs-type-badge">{{ detail.type | formatType }}</view>
		</view>
		
		<!-- 活动条 -->
		<active-bar v-if="activeData && !detail.isbuy" :end_time="activeData.data.end_time" :price="activeData.data.price" :t_price="detail.price">
			<text v-if="activeData.type == 'group'">{{ activeData.data.p_num }}人拼团</text>
			<text v-else>{{ activeData.data.used_num }}人已枪/剩{{ activeData.data.s_num - activeData.data.used_num}}名</text>
		</active-bar>
		
		
		<view class="animate__animated animate__fadeIn animate__faster">
			<!-- 标题 / 人数 / 收藏：始终显示（不再随已购隐藏） -->
			<view v-if="firstLoad" class="crs-head">
				<text class="crs-title">{{ detail.title }}</text>
				<view class="crs-meta">
					<text class="crs-subcount">{{ detail.sub_count || 0 }} 人学过</text>
					<collect-btn :isfava="detail.isfava" :goods_id="detail.id" type="course" @success="detail.isfava = $event"></collect-btn>
				</view>
				<view v-if="!detail.isbuy" class="crs-price-row">
					<text class="crs-price">￥{{ detail.price }}</text>
					<text class="crs-oprice" v-if="detail.t_price">￥{{ detail.t_price }}</text>
				</view>
				<view v-else class="crs-bought">✓ 已拥有，可学习全部内容</view>
			</view>

			<view v-else class="flex flex-column p-3">
				<skeleton width="600rpx" height="75rpx" oClass="mb-2"></skeleton>
				<skeleton width="150rpx" height="70rpx"></skeleton>
			</view>

			<view class="divider"></view>
			
			
			<group-works v-if="!detail.isbuy" ref="groupWorks" @updateData="getData"></group-works>
			
			
			<uni-card :title="(detail.isbuy && detail.type == 'media') ? '课程内容' : '课程简介'" isFull>
				<view id="media">
					<mp-html v-if="mediaContent" :content="mediaContent" @ready="onMediaReady"></mp-html>
					<view v-else class="flex justify-center py-4 text-light-muted">
						{{ firstLoad ? '暂无内容' : '加载中...' }}
					</view>
				</view>
			</uni-card>
			
			<template v-if="!detail.isbuy && firstLoad">
				<view style="height: 75px;"></view>
				<view class="fixed-bottom p-2 border-top bg-white">
					<main-button @click="submit">{{ btn }}</main-button>
				</view>
			</template>
		</view>
		
	</view>
</template>

<script>
	import $tool from '@/common/tool.js';
	let windowHeight = uni.getSystemInfoSync().windowHeight
	export default {
		filters: {
			formatType(t) {
				let c = {
					media:"图文",
					audio:"音频",
					video:"视频"
				}
				return c[t];
			}
		},
		data() {
			return {
				firstLoad:false,
				detail:{
					id: 0,
					title: "",
					cover: "",
					try: "",
					price: "",
					t_price: "",
					type: "media",
					sub_count: 0,
					content: "",
					isbuy: false,
					isfava:false
				},
				// 空封面兜底图
				coursePlaceholder: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="375" height="210"><rect width="375" height="210" fill="#dfe6ee"/><text x="187" y="120" font-size="56" text-anchor="middle" fill="#aebccd">🎓</text></svg>'),

				column_id:0,
				
				scrollTop:0,
				mediaHeight:0,
				
				progress:0,
				
				group_id:0,
				// 拼团/秒杀详情
				activeData:null,
				
				flashsale_id:0
			}
		},
		computed:{
			// 已购显示正文 content，未购显示简介 try；空内容返回空字符串走"暂无内容"占位
			mediaContent(){
				const c = (this.detail.isbuy && this.detail.type == 'media') ? this.detail.content : this.detail.try
				return c || ''
			},
			btn(){
				if(this.detail.flashsale){
					return '立即秒杀￥'+this.detail.flashsale.price
				}
				if(this.detail.group){
					return '立即拼团￥'+this.detail.group.price
				}
				if(this.detail.price == 0){
					return '立即学习'
				}
				return  '立即订购￥'+this.detail.price
			}
		},
		onPageScroll(e){
			if(this.detail.isbuy && this.detail.type == 'media' && e.scrollTop > this.scrollTop){
				this.scrollTop = e.scrollTop
				this.sumMediaProgress()
			}
		},
		onLoad(e) {
			this.detail.id = e.id
			if(!this.detail.id){
				this.$toast('非法参数')
				setTimeout(()=>{
					uni.navigateBack({ delta: 1 });
				},700)
				return
			}
			if(e.column_id){
				this.column_id = e.column_id
			}
			if(e.group_id){
				this.group_id = e.group_id
			}
			if(e.flashsale_id){
				this.flashsale_id = e.flashsale_id
			}
		},
		onShow(){
			this.getData()
			this.startStudyHeartbeat()
		},
		onHide(){
			this.stopStudyHeartbeat()
		},
		beforeDestroy(){
			this.updateUserHistory()
			this.stopStudyHeartbeat()
		},
		methods: {
			// ===== 学习时长心跳：在课程页停留时，每60秒上报一次 =====
			startStudyHeartbeat(){
				if(this._studyTimer) return
				// 只有登录了才上报
				if(!this.$store.state.token) return
				this._studyTimer = setInterval(()=>{
					// 页面不可见时不上报（H5 切到别的标签页/最小化）
					// #ifdef H5
					if(typeof document !== 'undefined' && document.hidden) return
					// #endif
					this.$api.studyHeartbeat({ course_id: this.detail.id || 0, seconds: 60 }).catch(()=>{})
				}, 60000)
			},
			stopStudyHeartbeat(){
				if(this._studyTimer){
					clearInterval(this._studyTimer)
					this._studyTimer = null
				}
			},
			submit(){
				// 立即拼团
				if(this.group_id){
					uni.showLoading({
						title: '发起拼团中...',
						mask: true
					})
					
					this.$api.createOrder({
						group_id:this.group_id,
					},'group').then(res=>{
						// H5支付
						// #ifdef H5
						uni.navigateTo({
							url: '../h5pay/h5pay?no='+res.no,
						});
						// #endif
						
						// app端支付
						// #ifdef APP-PLUS || MP
						$tool.wxpay(res.no,()=>{
							this.getData()
						})
						// #endif
					}).catch(err=>{
						console.log(err);
					}).finally(()=>{
						uni.hideLoading()
					})
					
					return
				}
				
				// 立即学习
				if(this.detail.price == 0){
					uni.showLoading({
						title: '加载中...',
						mask: false
					});
					this.$api.learn({
						goods_id:this.detail.id,
						type:"course"
					}).then(res=>{
						this.getData()
					}).finally(()=>{
						uni.hideLoading()
					})
					return
				}
				
				// 创建订单
				let type = "course"
				let id = this.detail.id
				
				if(this.detail.flashsale){
					type = 'flashsale'
					id = this.flashsale_id
				}
				
				this.authJump(`../create-order/create-order?id=${id}&type=${type}`)
			},
			onAudioProgressUpdate(p){
				this.progress = p
			},
			onVideoTimeUpdate(e){
				let { currentTime,duration } = e.detail
				if(duration > 0){
					this.progress = ((currentTime/duration)*100).toFixed(2)
				}
			},
			updateUserHistory(){
				if(!this.detail.isbuy) return
				let d = {}
				if(this.column_id == 0){
					d = {
						id:this.detail.id,
						type:"course",
						progress:this.progress
					}
				} else {
					d = {
						id:this.column_id,
						type:"column",
						detail_id:this.detail.id
					}
				}
				this.$api.updateUserHistory(d)
			},
			onMediaReady(){
				const Query = uni.createSelectorQuery().in(this)
				Query.select('#media').boundingClientRect(data=>{
					this.mediaHeight = parseInt(data.height)
					this.sumMediaProgress()
				}).exec()
			},
			// 计算图文课程学习进度
			sumMediaProgress(){
				if(this.mediaHeight > 0){
					this.progress = (((this.scrollTop + windowHeight)/this.mediaHeight)*100).toFixed(2)
					this.progress = this.progress > 100 ? 100 : this.progress
					console.log(this.progress);
				}
			},
			getData(){
				this.$api.readCourse({
					id:this.detail.id,
					column_id:this.column_id,
					group_id:this.group_id,
					flashsale_id:this.flashsale_id
				}).then(res=>{
					this.detail = res
					
					if(res.group){
						this.activeData = {
							type:"group",
							data:res.group
						}
						this.$refs.groupWorks.init(this.group_id)
					}
					
					if(res.flashsale){
						this.activeData = {
							type:"flashsale",
							data:res.flashsale
						}
					}
					
					console.log(this.detail);
					uni.setNavigationBarTitle({
						title:this.detail.title
					})
				}).catch(err=>{
					if(err == '该记录不存在'){
						setTimeout(()=>{
							uni.navigateBack({ delta: 1 });
						},700)
					}
				}).finally(()=>{
					this.firstLoad = true
				})
			}
		}
	}
</script>

<style>
	/* #ifdef H5 */
	/* PC：让出顶栏 + 内容居中限宽 + 封面/视频不被拉成超宽 */
	.crs-page-pc {
		padding-top: 60px;
		max-width: 820px;
		margin: 0 auto;
		background-color: #fff;
		min-height: 100vh;
	}
	.crs-page-pc > .position-relative > image,
	.crs-page-pc > video {
		height: 300px !important;
	}
	/* #endif */

	.crs-type-badge {
		position: absolute;
		right: 12px;
		bottom: 12px;
		background-color: rgba(0,0,0,0.5);
		color: #fff;
		font-size: 12px;
		padding: 2px 8px;
		border-radius: 4px;
	}
	.crs-head {
		display: flex;
		flex-direction: column;
		padding: 16px;
		background-color: #fff;
	}
	.crs-title {
		font-size: 19px;
		font-weight: bold;
		color: #222;
		line-height: 1.4;
	}
	.crs-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 10px;
	}
	.crs-subcount {
		font-size: 13px;
		color: #999;
	}
	.crs-price-row {
		display: flex;
		align-items: baseline;
		margin-top: 12px;
	}
	.crs-price {
		font-size: 22px;
		font-weight: 700;
		color: #ff5b4c;
	}
	.crs-oprice {
		font-size: 13px;
		color: #bbb;
		text-decoration: line-through;
		margin-left: 8px;
	}
	.crs-bought {
		margin-top: 12px;
		font-size: 13px;
		color: #43b876;
	}
</style>
