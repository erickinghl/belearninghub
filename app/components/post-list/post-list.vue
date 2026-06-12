<template>
	<view>
		
		<view class="p-3">
			<view class="flex align-center w-100">
				<view class="flex align-center">
					<image :src="item.user.avatar" style="width: 75rpx;height: 75rpx;border-radius: 100%;" class="mr-2 bg-light"></image>
					<view>
						<view class="text-primary font-weight-bold">
							{{ item.user.name }}
						</view>
						<text class="text-muted font">{{ item.user.sex }}</text>
					</view>
				</view>
				<view class="post-tag" v-if="item.is_top">精华</view>
			</view>
			
			<view v-if="!iscontent" class="py-2" @click="open">
				<text>{{ item.desc.text }}</text>
				<view class="flex flex-wrap">
					<view class="flex align-center justify-center mt-1" v-for="(src,srcI) in item.desc.images" :key="srcI" style="width: 33.33%;">
						<image style="width: 220rpx;height: 220rpx;"  class="rounded" :src="src" mode="aspectFill"></image>
					</view>
				</view>
			</view>
			<view v-else class="flex flex-column p-2" v-for="(item2,index2) in item.content" :key="index2">
				<text class="mb-1">{{ item2.text }}</text>
				<image v-for="(img,imgI) in item2.images" :key="imgI" :src="img" mode="widthFix" style="max-width: 100%;"></image>
			</view>
			
			<view v-if="!iscontent" class="flex align-center justify-between mt-2">
				<view class="flex align-center">
					<view class="flex align-center pr-2">
						<text style="font-size: 23px;" class="iconfont icon-pinglun2"></text>
						<text class="ml-1">{{ item.comment_count == 0 ? '评论' :  item.comment_count }}</text>
					</view>
					<view class="flex align-center"
					:class="item.issupport ? 'text-danger' : ''"
					@click="$emit('support',item.id)">
						<text style="font-size: 23px;" class="iconfont icon-dianzan2"></text>
						<text class="ml-1">{{ item.support_count == 0 ? '点赞' :  item.support_count }}</text>
					</view>
					
					<button v-if="showDelete" type="warn" size="mini" class="ml-3" @click="$emit('delete',item.id)">删除</button>
				</view>
				<text class="text-light-muted font">{{ item.created_time }}</text>
			</view>
			
			
		</view>
		
		<view class="divider"></view>
	</view>
</template>

<script>
	export default {
		name:"post-list",
		props: {
			item:Object,
			iscontent:{
				type:Boolean,
				default:false
			},
			showDelete:{
				type:Boolean,
				default:false
			}
		},
		data() {
			return {
				
			};
		},
		methods: {
			open() {
				uni.navigateTo({
					url: '/pages/post-detail/post-detail?id='+this.item.id,
				});
			}
		},
	}
</script>

<style>
.post-tag{
	padding: 10rpx 20rpx;
	color: #FFFFFF;
	background-color: #ffc107;
	margin-left: auto;
	font-size: 14px!important;
}
</style>
