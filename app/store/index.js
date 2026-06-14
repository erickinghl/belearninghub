import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
export default new Vuex.Store({
	state:{
		user:null,
		token:null,
		// 全局默认头像（后台可配置），App 启动时从 /mobile/config 拉取
		defaultAvatar:'/static/avatar-default.png',
		// 站点配置（标题/介绍/footer 等，后台可配）
		siteConfig:{}
	},
	mutations:{
		setDefaultAvatar(state, url){
			if(url){
				state.defaultAvatar = url
				uni.setStorageSync('defaultAvatar', url)
			}
		},
		setSiteConfig(state, cfg){
			if(cfg){
				state.siteConfig = cfg
				uni.setStorageSync('siteConfig', JSON.stringify(cfg))
			}
		}
	},
	actions:{
		// 初始化
		init({ state }){
			let user = uni.getStorageSync('user')
			if(user){
				state.user = JSON.parse(user)
				state.token = state.user.token
			}
			let da = uni.getStorageSync('defaultAvatar')
			if(da) state.defaultAvatar = da
			let sc = uni.getStorageSync('siteConfig')
			if(sc){ try{ state.siteConfig = JSON.parse(sc) }catch(e){} }
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