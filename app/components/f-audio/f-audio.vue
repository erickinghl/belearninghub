<template>
	<view class="bg-light">
		<view class="px-5 pt-5">
			<image :src="poster" mode="aspectFill" style="width: 100%;height: 400rpx;border-radius: 20rpx;" class="bg-hover-light"></image>
		</view>
		
		<view class="f-audio-slider mb-5">
			<slider @changing="onchanging" @change="onchange" :max="duration" :value="position" activeColor="#5ccc84" block-color="#5ccc84" :block-size="15"/>
			<text class="current-time">{{ currentTime | formatTime }}</text>
			<text class="duration">{{ duration  | formatTime }}</text>
		</view>
		
		<view class="f-audio-btn flex align-center justify-center pb-5">
			<text class="iconfont icon-ziyuan11" :style="loopStatus ? 'color:rgb(92, 204, 132);' : ''" @click="loop()"></text>
			<text class="iconfont mx-3" :class="isPlaying ? 'icon-tianchongxing-' : 'icon-bofang2'" @click="play"></text>
			<text class="iconfont icon-shoucang1"></text>
		</view>
		
	</view>
</template>

<script>
	import tool from '@/common/tool.js';
	export default {
		name:"f-audio",
		props: {
			src: {
				type: String,
				default: ''
			},
			poster:{
				type: String,
				default: ''
			}
		},
		filters: {
			formatTime(s) {
				if(s == 0){
					return '00:00:00'
				}
				return tool.formatSeconds(s);
			}
		},
		data() {
			return {
				_audioContext:null,
				isPlaying:false,
				isPlayEnd:false,
				currentTime:0,
				duration:1,
				_isChanging:false,
				loopStatus:false
			};
		},
		computed: {
			position() {
				return this.isPlayEnd ? 0 : this.currentTime
			}
		},
		created() {
			this.createAudio()
		},
		beforeDestroy() {
			if(this._audioContext != null && this.isPlaying){
				this.stop()
			}
		},
		methods:{
			createAudio(){
				this._audioContext = uni.createInnerAudioContext()
				this._audioContext.autoplay = false
				this._audioContext.src = this.src
				this._audioContext.onPlay(()=>{ console.log('开始播放'); })
				this._audioContext.onCanplay(()=>{
					this.duration = this._audioContext.duration
				})
				this._audioContext.onTimeUpdate(()=>{
					if(this._isChanging){
						return
					}
					this.currentTime = this._audioContext.currentTime
					this.duration = this._audioContext.duration
					
					if(this.duration > 0){
						this.$emit('onProgress',((this.currentTime/this.duration)*100).toFixed(2))
					}
				})
				
				this._audioContext.onEnded(()=>{
					this.currentTime = 0
					this.isPlaying = false
					this.isPlayEnd = false
				})
				
				this._audioContext.onError(()=>{
					this.isPlaying = false
				})
			},
			play(){
				if(this.isPlaying){
					return this.pause()
				}
				this.isPlaying = true
				this._audioContext.play()
				this.isPlayEnd = false
			},
			pause(){
				this._audioContext.pause()
				this.isPlaying = false
			},
			onchange(e){
				this._audioContext.seek(e.detail.value)
				this._isChanging = false
			},
			onchanging(){
				this._isChanging = true
			},
			stop(){
				this._audioContext.stop()
				this.isPlaying = false
			},
			loop(){
				this.loopStatus = !this.loopStatus
				this._audioContext.loop = this.loopStatus
				this.$toast((this.loopStatus ? '开启' : '关闭') + '循环')
			}
		}
	}
</script>

<style>
.f-audio-slider{
	position: relative;
}
.f-audio-slider text{
	position: absolute;
	top: 35rpx;
	font-size: 12px;
}
.f-audio-slider .current-time{
	left: 30rpx;
}
.f-audio-slider .duration{
	right: 30rpx;
}
.f-audio-btn text:first-child,.f-audio-btn text:last-child{
	font-size: 30px;
	color: #BBBBBB;
}
.f-audio-btn text:nth-child(2){
	font-size: 50px;
	color: rgb(92, 204, 132);
}
</style>
