import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
export default new Vuex.Store({
	state:{
		user:null,
		token:null
	},
	actions:{
		// 初始化
		init({ state }){
			let user = uni.getStorageSync('user')
			if(user){
				state.user = JSON.parse(user)
				state.token = state.user.token
			}
		},
		
		login({ state },user){
			state.user = user
			state.token = user.token
			
			uni.setStorageSync('user',JSON.stringify(user))
			uni.$emit('userLogin',user)
		},
		
		logout({ state }){
			state.user = null
			state.token = null
			uni.removeStorageSync('user')
			uni.$emit('userLogout')
		},
		updateInfo({ state },data){
			Object.keys(data).forEach(k=>state.user[k] = data[k])
			uni.setStorageSync('user',JSON.stringify(state.user))
		}
	}
})