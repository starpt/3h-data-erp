import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

import index from '~/page/index.vue'
import login from '~/page/login.vue'
import notFound from '~/page/404.vue'
import report from '~/page/report.vue'
import sell from '~/page/sell.vue'
import user from '~/page/user.vue'
import group from '~/page/group.vue'

let routes = [
	{
		path: '/',
		component: index
	},
	{
		path: '/login',
		component: login
	},
	{
		path: '/report',
		component: report,
		menu: '报表分析'
	},
	{
		path: '/sell',
		component: sell,
		menu: '单据管理'
	},
	{
		path: '/user',
		component: user,
		menu: '用户管理',
		children: [
			{
				path: '/user/group',
				component: group,
				menu: '组别管理'
			}
		]
	},
	{
		path: '*',
		component: notFound
	}
]

export default new VueRouter({routes})
