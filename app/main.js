import Vue from 'vue'
import App from './App'
import api from '@/api/api.js';
Vue.prototype.$api = api

import store from '@/store/index.js';
Vue.prototype.$store = store

// ===== 修复 uni.showModal 在 H5 下灰罩卡死、按钮点不动 =====
// 用浏览器原生 confirm/alert 替代，保证回调一定触发
// #ifdef H5
if (typeof uni !== 'undefined' && uni.showModal) {
	uni.showModal = function(opt){
		opt = opt || {}
		try {
			var showCancel = opt.showCancel !== false
			var text = (opt.title ? opt.title + '\n' : '') + (opt.content || '')
			var confirm
			if (showCancel) {
				confirm = window.confirm(text)
			} else {
				window.alert(text)
				confirm = true
			}
			var res = { confirm: confirm, cancel: !confirm }
			if (typeof opt.success === 'function') opt.success(res)
			if (typeof opt.complete === 'function') opt.complete(res)
		} catch (e) {
			if (typeof opt.fail === 'function') opt.fail(e)
		}
	}
}
// #endif

Vue.prototype.$openWebview = function(url){
	uni.navigateTo({
		url: '/pages/webview/webview?url='+encodeURIComponent(url),
	})
}
Vue.prototype.$toast = function(msg){
	uni.showToast({
		title: msg,
		icon: 'none'
	});
}
Vue.prototype.navigateTo = function(url){
	uni.navigateTo({
		url,
	});
}
Vue.prototype.authJump = function(url){
	if(!store.state.token){
		return uni.navigateTo({
			url: '/pages/login/login'
		});
	}
	// 教育App不强制绑定手机号：原模板这里会拦去绑手机页，导致没手机号的用户点考试/下单"没反应"
	// 如需恢复强制绑手机，取消下面注释即可
	// if(!store.state.user.phone){
	// 	return uni.navigateTo({ url: '/pages/bind-phone/bind-phone' });
	// }
	uni.navigateTo({
		url,
	});
}

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
	store,
    ...App
})
app.$mount()
