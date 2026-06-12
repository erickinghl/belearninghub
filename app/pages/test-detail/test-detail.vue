<template>
	<view class="td-page">
		<timer-box v-if="expire > 0" :expire="expire" @end="end"></timer-box>
		<view class="q-card">
			<view class="q-head">
				<text class="q-type">{{ q.type | formatType }}</text>
				<text class="q-progress">第 {{ current }}/{{ total }} 题</text>
			</view>
			<view class="q-title">
				<mp-html :content="q.title">
					<view class="flex justify-center py-3 text-muted">加载中...</view>
				</mp-html>
			</view>

			<!-- 问答题 -->
			<textarea v-if="q.type == 'answer'" v-model="q.user_value[0]" placeholder="请输入你的答案..." class="q-textarea"/>

			<!-- 填空题 -->
			<view v-else-if="q.type == 'completion'">
				<view v-for="(item,index) in q.user_value" :key="index" class="q-blank-row">
					<text class="q-blank-no">第{{ index+1 }}空</text>
					<input v-model="q.user_value[index]" placeholder="请填写答案" class="q-blank-input"/>
				</view>
				<view class="q-add-blank" @click="addCompletion">+ 添加填空</view>
			</view>

			<!-- 判断题：固定 正确/错误（value 1/0） -->
			<view v-else-if="q.type == 'trueOrfalse'">
				<view class="tf-opt" :class="q.user_value === 1 ? 'tf-on' : ''" @click="handleTf(1)">
					<text class="tf-mark">✓</text><text>正确</text>
				</view>
				<view class="tf-opt" :class="q.user_value === 0 ? 'tf-on tf-on-x' : ''" @click="handleTf(0)">
					<text class="tf-mark">✗</text><text>错误</text>
				</view>
			</view>
			<!-- 单选 -->
			<view v-else-if="q.type == 'radio'">
				<test-option v-for="(item,index) in q.options" :key="index" :index="index" :label="item" @click="handleDo" :checked="q.user_value == index"></test-option>
			</view>
			<!-- 多选 -->
			<view v-else-if="q.type == 'checkbox'">
				<view class="q-tip">可多选</view>
				<test-option v-for="(item,index) in q.options" :key="index" :index="index" :label="item" @click="handleDo" :checked=" index | formatChecked(q.user_value)"></test-option>
			</view>
		</view>

		<!-- 本题下方的下一题/交卷 -->
		<view class="q-next-wrap">
			<view v-if="current < total" class="q-next-btn" @click="onPage(current + 1)">下一题</view>
			<view v-else class="q-next-btn q-submit-btn" @click="beforeSubmit">交卷</view>
		</view>

		<test-actions @submit="beforeSubmit" :current="current" :total="total" @on-page="onPage"></test-actions>
	</view>
</template>

<script>
	const typeOptions = {
		answer:'问答题',
		completion:"填空题",
		trueOrfalse:"判断题",
		checkbox:"多选题",
		radio:"单选题"
	}
	export default {
		filters: {
			formatType(type) {
				return typeOptions[type];
			},
			formatChecked(v,arr){
				return arr.includes(v)
			}
		},
		data() {
			return {
				current: 0,
				total: 0,
				list: [],
				id:0,
				expire: 0,
				title:"",
				user_test_id:0,
				isback:false,
			}
		},
		computed: {
			// 当前题目
			q() {
				return this.list[this.current-1] || {}
			},
			// 判断哪些没有填的题目
			undo(){
				let arr = []
				this.list.forEach((item,index)=>{
					if( ((item.type == 'answer' || item.type == 'completion') && !item.user_value[0]) || ((item.type == 'trueOrfalse' || item.type == 'radio') && item.user_value == -1) || (item.type == 'checkbox' && item.user_value.length == 0) ){
						arr.push(index + 1)
					}
				})
				
				return arr
			}
		},
		onLoad(e) {
			if(!e.id){
				this.$toast('非法参数')
				setTimeout(()=>{
					uni.navigateBack({ delta: 1 });
				},600)
				return
			}
			this.id = e.id
			this.getData()
		},
		onBackPress() {
			// H5 下 onBackPress + showModal 拦截会导致灰罩卡死、按钮点不动，
			// 故不拦截，直接返回（答题记录已创建，重新进入会复用未交卷记录）
			uni.$emit('refreshTestList','')
			return false
		},
		methods: {
			beforeSubmit(){
				if(this.undo.length > 0){
					return uni.showModal({
						content: `还有题目没有完成：第${this.undo.join(',')}题`,
						showCancel:false
					});
				}
				uni.showModal({
					content: '是否要交卷？',
					cancelText:"继续做题",
					confirmText:"现在交卷",
					success: (res)=> {
						if (res.confirm) {
							this.submit()
						}
					}
				});
			},
			submit(){
				uni.showLoading({
					title: '交卷中...',
					mask: false
				});
				this.$api.submitTest({
					user_test_id:this.user_test_id,
					value:this.list.map(o=>{
						return o.user_value
					})
				}).then(res=>{
					this.$toast('交卷成功')
					this.isback = true
					setTimeout(()=>{
						uni.navigateBack({
							delta: 1
						});
					},500)
				}).finally(()=>{
					uni.hideLoading()
				})
			},
			getData(){
				uni.showLoading({
					title:"加载中..."
				})
				this.$api.readTestpaper({
					id:this.id
				}).then(res=>{
					this.expire = res.expire
					this.title = res.title
					this.list = res.testpaper_questions
					this.user_test_id = res.user_test_id
					this.total = this.list.length
					if(this.total > 0){
						this.current = 1
					}
				}).finally(()=>{
					uni.hideLoading()
				})
			},
			end() {
				this.isback = true
				this.$toast('考试结束')
				setTimeout(()=>{
					uni.navigateBack({
						delta: 1
					});
				},600)
			},
			onPage(current) {
				this.current = current
			},
			addCompletion(){
				this.list[this.current-1].user_value.push("")
			},
			handleTf(v){
				// 判断题：正确=1 错误=0，直接存值（与后端判分一致）
				this.list[this.current-1].user_value = v
			},
			handleDo(e){
				if(this.q.type == 'radio' || this.q.type == 'trueOrfalse'){
					this.list[this.current-1].user_value = e
					return
				}
				
				let index = this.q.user_value.findIndex(checked=>checked == e)
				if(index == -1){
					this.q.user_value.push(e)
				} else {
					this.q.user_value.splice(index,1)
				}
			}
		}
	}
</script>

<style>
	.td-page {
		min-height: 100vh;
		background-color: #f7f8fa;
		padding-bottom: 80px;
	}
	.q-card {
		background-color: #fff;
		margin: 28px 12px 12px;
		border-radius: 12px;
		padding: 16px;
		box-shadow: 0 2px 12px rgba(0,0,0,0.04);
	}
	.q-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 14px;
	}
	.q-type {
		background-color: #e6f7ec;
		color: #2fa05a;
		font-size: 12px;
		padding: 3px 10px;
		border-radius: 10px;
	}
	.q-progress {
		font-size: 12px;
		color: #999;
	}
	.q-title {
		font-size: 16px;
		color: #222;
		line-height: 1.6;
		margin-bottom: 16px;
	}
	.q-tip {
		font-size: 12px;
		color: #ff9800;
		margin-bottom: 10px;
	}
	.tf-opt {
		display: flex;
		align-items: center;
		padding: 14px 16px;
		margin-bottom: 12px;
		border: 1px solid #e6e8eb;
		border-radius: 10px;
		font-size: 16px;
		color: #333;
		background-color: #fff;
	}
	.tf-mark {
		width: 26px;
		height: 26px;
		line-height: 26px;
		text-align: center;
		border-radius: 50%;
		background-color: #f0f2f5;
		color: #888;
		font-size: 15px;
		margin-right: 12px;
	}
	.tf-on {
		border-color: #5ccc84;
		background-color: #f3fbf6;
	}
	.tf-on .tf-mark {
		background-color: #5ccc84;
		color: #fff;
	}
	.tf-on-x {
		border-color: #ff6b6b;
		background-color: #fff3f3;
	}
	.tf-on-x .tf-mark {
		background-color: #ff6b6b;
		color: #fff;
	}
	.q-textarea {
		width: 100%;
		min-height: 140px;
		border: 1px solid #e6e8eb;
		border-radius: 10px;
		padding: 12px;
		font-size: 15px;
		box-sizing: border-box;
		background-color: #fcfcfc;
	}
	.q-blank-row {
		display: flex;
		align-items: center;
		margin-bottom: 12px;
	}
	.q-blank-no {
		font-size: 13px;
		color: #999;
		width: 48px;
		flex-shrink: 0;
	}
	.q-blank-input {
		flex: 1;
		height: 44px;
		border: 1px solid #e6e8eb;
		border-radius: 10px;
		padding: 0 12px;
		font-size: 15px;
		background-color: #fcfcfc;
	}
	.q-add-blank {
		text-align: center;
		color: #5ccc84;
		font-size: 14px;
		padding: 8px;
		border: 1px dashed #b8e6c9;
		border-radius: 10px;
		margin-top: 4px;
	}
	.q-next-wrap {
		padding: 0 12px;
	}
	.q-next-btn {
		height: 48px;
		line-height: 48px;
		text-align: center;
		border-radius: 24px;
		font-size: 16px;
		color: #fff;
		background: linear-gradient(135deg, #5ccc84 0%, #43b876 100%);
		letter-spacing: 2px;
	}
	.q-submit-btn {
		background: linear-gradient(135deg, #ff8a4c 0%, #ff6b6b 100%);
	}
</style>
