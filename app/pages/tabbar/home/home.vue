<template>
	<view class="my-page">
		<!-- 顶部用户区 -->
		<view class="my-header">
			<view class="my-user" v-if="!user" @click="navigateTo('/pages/login/login')">
				<image src="/static/uni.png" class="my-avatar"></image>
				<view class="my-user-info">
					<text class="my-name">立即登录</text>
					<text class="my-desc">登录后可刷题、购课、记笔记</text>
				</view>
				<text class="my-arrow">›</text>
			</view>

			<view class="my-user" v-else @click="authJump('/pages/user-info/user-info')">
				<image :src="user.avatar || '/static/uni.png'" class="my-avatar"></image>
				<view class="my-user-info">
					<text class="my-name">{{ user.nickname || user.username || user.phone }}</text>
					<text class="my-desc">{{ user.desc || '这个人很懒，什么都没留下' }}</text>
				</view>
				<text class="my-arrow">›</text>
			</view>
		</view>

		<!-- 功能宫格 -->
		<view class="my-grid">
			<view class="my-grid-item" v-for="(it,i) in icons" :key="i" @click="goIcon(it)">
				<text class="my-grid-icon">{{ it.emoji }}</text>
				<text class="my-grid-name">{{ it.name }}</text>
			</view>
		</view>

		<!-- 列表 -->
		<view class="my-list">
			<view class="my-list-item" @click="authJump('/pages/note-list/note-list')">
				<text class="my-li-icon">✏️</text>
				<text class="my-li-title">我的笔记</text>
				<text class="my-li-arrow">›</text>
			</view>
			<view class="my-list-item" @click="authJump('/pages/order-list/order-list')">
				<text class="my-li-icon">📋</text>
				<text class="my-li-title">我的订单</text>
				<text class="my-li-arrow">›</text>
			</view>
			<view class="my-list-item" @click="authJump('/pages/my-test/my-test')">
				<text class="my-li-icon">🏆</text>
				<text class="my-li-title">我的考试</text>
				<text class="my-li-arrow">›</text>
			</view>
			<view class="my-list-item" @click="navigateTo('/pages/setting/setting')">
				<text class="my-li-icon">⚙️</text>
				<text class="my-li-title">设置</text>
				<text class="my-li-arrow">›</text>
			</view>
		</view>

		<view v-if="user" class="my-logout" @click="logout">退出登录</view>
	</view>
</template>

<script>
	import { mapState } from 'vuex';
	export default {
		computed: {
			...mapState({
				user:state=>state.user
			})
		},
		data() {
			return {
				icons:[
					{ emoji:'📋', name:'订单', path:'/pages/order-list/order-list' },
					{ emoji:'⭐', name:'收藏', path:'/pages/fava-list/fava-list' },
					{ emoji:'🔖', name:'书架', path:'/pages/my-book/my-book' },
					{ emoji:'🎓', name:'在学', path:'/pages/tabbar/learn/learn', type:'switchTab' }
				]
			}
		},
		methods: {
			goIcon(it){
				if(it.type === 'switchTab'){
					uni.switchTab({ url: it.path })
				} else {
					this.authJump(it.path)
				}
			},
			logout(){
				uni.showModal({
					content:'确定要退出登录吗？',
					success:(res)=>{
						if(res.confirm){
							this.$store.dispatch('logout')
							this.$toast('已退出')
						}
					}
				})
			}
		}
	}
</script>

<style>
	.my-page{
		min-height: 100vh;
		background-color: #f7f8fa;
	}
	/* 顶部 */
	.my-header{
		background: linear-gradient(135deg, #5ccc84 0%, #43b876 100%);
		padding: 50px 18px 50px;
	}
	.my-user{
		display: flex;
		align-items: center;
	}
	.my-avatar{
		width: 60px;
		height: 60px;
		border-radius: 50%;
		background-color: #fff;
		border: 2px solid rgba(255,255,255,0.6);
	}
	.my-user-info{
		flex: 1;
		display: flex;
		flex-direction: column;
		margin-left: 14px;
	}
	.my-name{
		font-size: 19px;
		color: #fff;
		font-weight: bold;
	}
	.my-desc{
		font-size: 13px;
		color: rgba(255,255,255,0.85);
		margin-top: 6px;
	}
	.my-arrow{
		color: #fff;
		font-size: 22px;
	}
	/* 宫格 */
	.my-grid{
		display: flex;
		background-color: #fff;
		margin: -32px 12px 0;
		border-radius: 14px;
		padding: 18px 0;
		box-shadow: 0 2px 12px rgba(0,0,0,0.06);
	}
	.my-grid-item{
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.my-grid-icon{
		font-size: 26px;
	}
	.my-grid-name{
		font-size: 13px;
		color: #555;
		margin-top: 6px;
	}
	/* 列表 */
	.my-list{
		background-color: #fff;
		margin: 12px;
		border-radius: 14px;
		overflow: hidden;
	}
	.my-list-item{
		display: flex;
		align-items: center;
		padding: 15px 16px;
		border-bottom: 1px solid #f4f5f7;
	}
	.my-li-icon{
		font-size: 18px;
		width: 26px;
	}
	.my-li-title{
		flex: 1;
		font-size: 15px;
		color: #333;
		margin-left: 8px;
	}
	.my-li-arrow{
		color: #ccc;
		font-size: 18px;
	}
	.my-logout{
		margin: 24px 12px;
		height: 46px;
		line-height: 46px;
		text-align: center;
		background-color: #fff;
		color: #ff6b6b;
		border-radius: 23px;
		font-size: 15px;
	}
</style>
