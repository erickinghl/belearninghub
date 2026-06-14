import store from '../store/index.js';
export default {
	config:{
		baseURL:"http://172.16.0.2:7001",
		appid:"bd9d01ecc75dbbaaefce",
		// 请求拦截器
		beforeRequest(options = {}){
			return new Promise((resolve,reject)=>{
				// 公共参数处理
				options.url = this.baseURL + options.url 
				options.method = options.method || 'GET'
				options.header = {
					appid:this.appid,
					token:store.state.token
				}
				// 权限相关验证
				
				resolve(options)
			})
		},
		// 响应拦截器
		handleResponse([error,res],silent){
			return new Promise((resolve,reject)=>{
				// 错误提示处理
				if(res.statusCode != 200 || res.data.msg == 'fail'){
					let msg = res.data.data || '请求失败'
					let isAuthErr = typeof msg === 'string' && (msg.indexOf('令牌') > -1 || msg.indexOf('Token') > -1 || msg.indexOf('权限') > -1 || msg.indexOf('登录') > -1)
					// silent 模式（如启动时静默校验）：只清登录态，不弹提示、不强制跳转
					if(silent){
						if(isAuthErr){ store.dispatch('logout') }
						return reject(msg)
					}
					uni.showToast({
						title: msg,
						icon: 'none'
					});
					// 任何 token / 权限类错误都清登录态并跳登录页
					if(isAuthErr){
						store.dispatch('logout')
						setTimeout(()=>{
							uni.navigateTo({
								url: '/pages/login/login',
							});
						},800)
					}
					return reject(msg)
				}
				resolve(res.data.data)
			})
		}
	},
	request(options = {}){
		let silent = options.silent === true
		return this.config.beforeRequest(options).then(opt=>uni.request(opt)).then(res=>this.config.handleResponse(res,silent))
	},
	// GET请求
	get(url,params = null,options = {}){
		options.url = url
		
		options.url += params ? ('?'+Object.keys(params).map(key=>key+'='+params[key]).join('&')) : ''
		
		options.method = 'GET'
		return this.request(options)
	},
	// POST请求
	post(url,data = {},options = {}){
		options.url = url
		options.method = 'POST'
		options.data = data
		return this.request(options)
	},
	// 上传文件
	upload(url,data = {},options = {}){
		options.url = url
		return this.config.beforeRequest(options).then(opt=>{
			return new Promise((resolve,reject)=>{
				let uploadTask = uni.uploadFile({
					url:opt.url, 
					filePath: data.filePath,
					name: data.name || 'files',
					header:opt.header,
					success: (res) => {
						if(res.statusCode != 200){
							reject('上传失败')
							return uni.showToast({
								title: '上传失败',
								icon: 'none'
							});
						}
						let message = JSON.parse(res.data)
						resolve(message.data)
					},
					fail: (err) => {
						console.log(err);
						reject(err.message)
					}
				});
				
				uploadTask.onProgressUpdate((res) => {
					if(options.onProgress && typeof options.onProgress == 'function'){
						options.onProgress(res.progress)
					}
				});
				
			})
		})
	}
}