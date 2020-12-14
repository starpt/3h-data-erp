window.log = console.log
Date.prototype.format = function (format) {
	if (!this) return
	let obj = {
		'y+': this.getFullYear(), //年
		'M+': this.getMonth() + 1, //月份
		'W+': Math.ceil((this - new Date(this.getFullYear(), 0, this.getDay()))/(24*60*60*1000)/7) + 1, //第几周
		'd+': this.getDate(), //日
		'h+': this.getHours(), //小时
		'm+': this.getMinutes(), //分
		's+': this.getSeconds(), //秒
		'q+': Math.floor((this.getMonth() + 3) / 3), //季度
		'w+': this.getDay(), //星期
		'S+': this.getMilliseconds() //毫秒
	}
	format = format || 'yyyy-MM-dd hh:mm:ss' //默认年年年年-月月-日日 时时:分分:秒秒
	for (let i in obj) {
		if (new RegExp('(' + i + ')').test(format)) {
			let s = '' + obj[i], n = RegExp.$1.length - s.length
			format = format.replace(RegExp.$1, n > 0 ? new Array(n + 1).join('0') + s : s)
		}
	}
	return format
}

import Vue from 'vue'
import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'
Vue.use(ElementUI)

import router from '~/router'

import axios from 'axios'

axios.defaults.baseURL = process && process.env && process.env.NODE_ENV === 'production' ? 'http://'+ location.hostname +':8081' : ''
axios.interceptors.request.use(config => {
	let token = sessionStorage.getItem('token')
	if (token) config.headers.token = token
	return config
}, error => {
	return Promise.reject(error)
})
Vue.prototype.axios = axios

import echarts from 'echarts'
Vue.prototype.echarts = echarts

import App from '~/App.vue'
new Vue({
	el: '#app',
	router,
  render: h => h(App)
})
