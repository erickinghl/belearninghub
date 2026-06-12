<template>
	<view>
		<view style="height: 60px;"></view>
		<view class="test-actions">
			<view class="ta-item" :class="current <= 1 ? 'ta-disabled' : ''" @click="pre">
				<text class="ta-icon">‹</text>
				<text class="ta-label">上一题</text>
			</view>
			<view class="ta-item" @click="$emit('open')">
				<text class="ta-icon">☰</text>
				<text class="ta-label">{{ current }}/{{ total }} 答题卡</text>
			</view>
			<view class="ta-item" :class="current >= total ? 'ta-disabled' : ''" @click="next">
				<text class="ta-icon">›</text>
				<text class="ta-label">下一题</text>
			</view>
			<view v-if="showSubmit" class="ta-submit" @click="submit">
				<text>交 卷</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name:"test-actions",
		props: {
			current: {
				type: Number,
				default: 1
			},
			total:{
				type: Number,
				default: 1
			},
			showSubmit:{
				type:Boolean,
				default:true
			}
		},
		data() {
			return {

			};
		},
		methods: {
			submit(){
				this.$emit('submit')
			},
			next() {
				if(this.current >= this.total){
					return
				}
				this.$emit('on-page',this.current + 1)
			},
			pre(){
				if(this.current <= 1){
					return
				}
				this.$emit('on-page',this.current - 1)
			}
		},
	}
</script>

<style>
.test-actions{
	display: flex;
	align-items: center;
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: #fff;
	height: 60px;
	border-top: 1px solid #f0f0f0;
	box-shadow: 0 -2px 10px rgba(0,0,0,0.04);
	z-index: 100;
}
.ta-item{
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
}
.ta-icon{
	font-size: 22px;
	line-height: 22px;
	color: #5ccc84;
}
.ta-label{
	font-size: 11px;
	color: #666;
	margin-top: 2px;
}
.ta-disabled .ta-icon,
.ta-disabled .ta-label{
	color: #ccc;
}
.ta-submit{
	flex: 1.4;
	height: 44px;
	margin: 0 12px;
	background: linear-gradient(135deg, #5ccc84 0%, #43b876 100%);
	color: #fff;
	font-size: 16px;
	border-radius: 22px;
	display: flex;
	align-items: center;
	justify-content: center;
	letter-spacing: 2px;
}
</style>
