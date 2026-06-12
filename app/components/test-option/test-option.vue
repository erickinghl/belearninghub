<template>
	<view class="opt" :class="checked ? 'opt-checked' : ''" @click="$emit('click',index)">
		<text class="opt-badge" :class="checked ? 'opt-badge-on' : ''">{{ index | formatIndex }}</text>
		<view class="opt-label">
			<mp-html :content="label"></mp-html>
		</view>
		<text v-if="checked" class="opt-tick">✓</text>
	</view>
</template>

<script>
	const en = {
		0:'A',
		1:"B",
		2:"C",
		3:"D",
		4:"E",
		5:"F"
	}
	export default {
		name:"test-option",
		props: {
			checked: {
				type: Boolean,
				default: false
			},
			index:{
				type:Number,
				default:0
			},
			label:{
				type:String,
				default:""
			}
		},
		filters: {
			formatIndex(index) {
				return en[index];
			}
		},
		data() {
			return {

			};
		}
	}
</script>

<style>
	.opt{
		display: flex;
		align-items: center;
		padding: 12px 14px;
		margin-bottom: 12px;
		border: 1px solid #e6e8eb;
		border-radius: 10px;
		background-color: #fff;
	}
	.opt-checked{
		border-color: #5ccc84;
		background-color: #f3fbf6;
	}
	.opt-badge{
		width: 26px;
		height: 26px;
		line-height: 26px;
		text-align: center;
		border-radius: 50%;
		background-color: #f0f2f5;
		color: #888;
		font-size: 14px;
		margin-right: 12px;
		flex-shrink: 0;
	}
	.opt-badge-on{
		background-color: #5ccc84;
		color: #fff;
	}
	.opt-label{
		flex: 1;
		font-size: 15px;
		color: #333;
	}
	.opt-tick{
		color: #5ccc84;
		font-size: 18px;
		margin-left: 8px;
	}
</style>
