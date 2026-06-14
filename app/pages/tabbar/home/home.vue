<template>
	<view class="my-page" :class="isPC ? 'my-page-pc' : ''">
		<!-- #ifdef H5 -->
		<pc-header v-if="isPC"></pc-header>
		<!-- #endif -->
		<!-- 顶部用户区 -->
		<view class="my-header">
			<view class="my-user" v-if="!user" @click="navigateTo('/pages/login/login')">
				<image :src="$store.state.defaultAvatar" class="my-avatar" mode="aspectFill"></image>
				<view class="my-user-info">
					<text class="my-name">立即登录</text>
					<text class="my-desc">登录后可刷题、购课、记笔记</text>
				</view>
				<text class="my-arrow">›</text>
			</view>

			<view class="my-user" v-else @click="authJump('/pages/user-info/user-info')">
				<image :src="user.avatar || $store.state.defaultAvatar" class="my-avatar" mode="aspectFill"></image>
				<view class="my-user-info">
					<text class="my-name">{{ user.nickname || user.username || user.phone }}</text>
					<text class="my-desc">{{ user.desc || '这个人很懒，什么都没留下' }}</text>
				</view>
				<text class="my-arrow">›</text>
			</view>
		</view>

		<!-- 功能宫格：常驻的 tab 行（订单/收藏/书架/笔记），点击只换下方内容 -->
		<view class="my-grid">
			<view class="my-grid-item" v-for="(it,i) in tabs" :key="i"
				:class="curTab === it.key ? 'my-grid-on' : ''" @click="switchTab(it.key)">
				<text class="my-grid-icon">{{ it.emoji }}</text>
				<text class="my-grid-name">{{ it.name }}</text>
			</view>
		</view>

		<!-- ===== 内容区：按 curTab 显示 ===== -->
		<view class="my-content">
			<!-- 未登录提示 -->
			<view v-if="!user" class="my-empty">
				<text class="my-empty-icon">🔒</text>
				<text class="my-empty-text">登录后查看</text>
			</view>

			<!-- 订单 -->
			<block v-else-if="curTab === 'order'">
				<view class="ol-card" v-for="(o,i) in orderList" :key="i">
					<view class="ol-top">
						<text class="ol-no">订单号 {{ o.no }}</text>
						<text class="ol-status" :class="o.status==1?'ol-st-ok':'ol-st-gray'">{{ orderStatusText(o.status) }}</text>
					</view>
					<view class="ol-body">
						<text class="ol-goods-icon">{{ goodsIcon(o.goods_type) }}</text>
						<view class="ol-info">
							<text class="ol-name">{{ o.goods_title || o.title || '商品' }}</text>
							<text class="ol-time">{{ o.created_time }}</text>
						</view>
						<text class="ol-price">￥{{ o.pay_price != null ? o.pay_price : o.price }}</text>
					</view>
				</view>
				<view v-if="loaded && !orderList.length" class="my-empty"><text class="my-empty-icon">📋</text><text class="my-empty-text">还没有订单</text></view>
			</block>

			<!-- 收藏 -->
			<block v-else-if="curTab === 'fava'">
				<view class="my-cl" v-for="(f,i) in favaList" :key="i" @click="openFava(f)">
					<course-list type="one" :item="f.goods"></course-list>
				</view>
				<view v-if="loaded && !favaList.length" class="my-empty"><text class="my-empty-icon">⭐</text><text class="my-empty-text">还没有收藏</text></view>
			</block>

			<!-- 书架 -->
			<block v-else-if="curTab === 'book'">
				<book-list v-for="(b,i) in bookList" :key="i" :item="b"></book-list>
				<view v-if="loaded && !bookList.length" class="my-empty"><text class="my-empty-icon">🔖</text><text class="my-empty-text">书架还是空的</text></view>
			</block>

			<!-- 笔记 -->
			<block v-else-if="curTab === 'note'">
				<view class="nl-card" v-for="(n,i) in noteList" :key="i" @click="openNote(n)">
					<text class="nl-title">{{ n.title }}</text>
					<text class="nl-content">{{ n.content }}</text>
				</view>
				<view v-if="loaded && !noteList.length" class="my-empty"><text class="my-empty-icon">✏️</text><text class="my-empty-text">还没有笔记</text></view>
			</block>

			<!-- 考试 -->
			<block v-else-if="curTab === 'test'">
				<view class="te-card" v-for="(t,i) in testList" :key="i">
					<view class="te-top">
						<text class="te-title">{{ t.testpaper && t.testpaper.title }}</text>
						<text class="te-status" :class="t.answer_status ? 'ol-st-ok' : 'ol-st-gray'">{{ t.answer_status ? '考试完成' : '考试中' }}</text>
					</view>
					<view class="te-body">
						<text class="te-meta">题目总数：{{ t.testpaper && t.testpaper.question_count }}</text>
						<text class="te-meta" :class="t.read_status == 0 ? 'te-grading' : ''">最终得分：{{ t.read_status ? t.score : '正在阅卷' }}</text>
					</view>
					<text class="te-time">{{ t.created_time }}</text>
				</view>
				<view v-if="loaded && !testList.length" class="my-empty"><text class="my-empty-icon">🏆</text><text class="my-empty-text">还没有考试记录</text></view>
			</block>
		</view>

		<!-- 设置入口 + 退出 -->
		<view class="my-list">
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
				tabs:[
					{ key:'order', emoji:'📋', name:'订单' },
					{ key:'fava',  emoji:'⭐', name:'收藏' },
					{ key:'book',  emoji:'🔖', name:'书架' },
					{ key:'note',  emoji:'✏️', name:'笔记' },
					{ key:'test',  emoji:'🏆', name:'考试' }
				],
				curTab:'order',
				loaded:false,
				orderList:[],
				favaList:[],
				bookList:[],
				noteList:[],
				testList:[]
			}
		},
		onShow(){
			// 每次回到「我的」刷新当前 tab（如登录态变化）
			if(this.user) this.loadTab(this.curTab, true)
		},
		methods: {
			switchTab(key){
				if(this.curTab === key) return
				this.curTab = key
				this.loadTab(key)
			},
			loadTab(key){
				if(!this.user) return
				this.loaded = false
				if(key === 'order'){
					this.$api.getOrderList({ page:1, limit:20 }).then(res=>{ this.orderList = res.rows || res || []; }).finally(()=>this.loaded=true)
				} else if(key === 'fava'){
					this.$api.getMyFavaList({ page:1, limit:20 }).then(res=>{ this.favaList = (res.rows || res || []).filter(x=>x.goods); }).finally(()=>this.loaded=true)
				} else if(key === 'book'){
					this.$api.getMyBookList({ page:1, limit:20 }).then(res=>{ this.bookList = res.rows || res || []; }).finally(()=>this.loaded=true)
				} else if(key === 'note'){
					this.$api.getNoteList({ page:1, limit:20 }).then(res=>{ this.noteList = res.rows || res || []; }).finally(()=>this.loaded=true)
				} else if(key === 'test'){
					this.$api.getMyTestList({ page:1, limit:20 }).then(res=>{ this.testList = res.rows || res || []; }).finally(()=>this.loaded=true)
				}
			},
			orderStatusText(s){ return { 0:'待支付', 1:'交易成功', 2:'已取消', 3:'已退款' }[s] || '—'; },
			goodsIcon(t){ return t === 'book' ? '📖' : (t === 'column' ? '📰' : '🎓'); },
			openFava(f){
				const g = f.goods || {}
				if(f.type === 'book') this.authJump('/pages/book-detail/book-detail?id='+g.id)
				else if(f.type === 'column') this.authJump('/pages/column/column?id='+g.id)
				else this.authJump('/pages/course/course?id='+g.id)
			},
			openNote(n){ this.authJump('/pages/note-edit/note-edit?id='+n.id); },
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
	/* #ifdef H5 */
	.my-page-pc {
		padding-top: 60px;   /* 让出 PC 顶部导航栏 */
	}
	/* #endif */
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

	/* 选中的 tab */
	.my-grid-on .my-grid-name{
		color: #43b876;
		font-weight: 600;
	}
	.my-grid-on{
		position: relative;
	}
	.my-grid-on::after{
		content: '';
		position: absolute;
		bottom: -6px;
		left: 50%;
		transform: translateX(-50%);
		width: 20px;
		height: 3px;
		background-color: #43b876;
		border-radius: 2px;
	}

	/* 内容区 */
	.my-content{
		margin: 12px;
		min-height: 120px;
	}
	.my-cl{
		margin-bottom: 10px;
	}
	.my-empty{
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 50px 0;
	}
	.my-empty-icon{
		font-size: 40px;
		margin-bottom: 10px;
	}
	.my-empty-text{
		font-size: 14px;
		color: #aaa;
	}
	/* 订单卡片（内联简版） */
	.ol-card{
		background-color: #fff;
		border-radius: 12px;
		padding: 12px 14px;
		margin-bottom: 10px;
	}
	.ol-top{
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 8px;
		border-bottom: 1px solid #f4f5f7;
	}
	.ol-no{ font-size: 12px; color: #999; }
	.ol-status{ font-size: 13px; }
	.ol-st-ok{ color: #43b876; }
	.ol-st-gray{ color: #bbb; }
	.ol-body{
		display: flex;
		align-items: center;
		padding-top: 10px;
	}
	.ol-goods-icon{ font-size: 26px; margin-right: 10px; }
	.ol-info{ flex: 1; display: flex; flex-direction: column; }
	.ol-name{ font-size: 14px; color: #222; }
	.ol-time{ font-size: 12px; color: #aaa; margin-top: 4px; }
	.ol-price{ font-size: 15px; color: #ff5b5b; font-weight: 600; }
	/* 笔记卡片（内联简版） */
	.nl-card{
		background-color: #fff;
		border-radius: 12px;
		padding: 12px 14px;
		margin-bottom: 10px;
		display: flex;
		flex-direction: column;
	}
	.nl-title{ font-size: 15px; color: #222; font-weight: 600; }
	.nl-content{
		font-size: 13px;
		color: #888;
		margin-top: 6px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	/* 考试卡片 */
	.te-card{
		background-color: #fff;
		border-radius: 12px;
		padding: 12px 14px;
		margin-bottom: 10px;
	}
	.te-top{
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.te-title{ font-size: 15px; color: #222; font-weight: 600; flex: 1; }
	.te-status{ font-size: 13px; margin-left: 10px; }
	.te-body{
		display: flex;
		justify-content: space-between;
		margin-top: 10px;
	}
	.te-meta{ font-size: 13px; color: #666; }
	.te-grading{ color: #ff9500; }
	.te-time{ display: block; font-size: 12px; color: #aaa; margin-top: 8px; }
</style>
