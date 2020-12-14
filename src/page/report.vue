<template>
	<div>
		<headMenu></headMenu>
		<div id="main">
			<el-form inline label-width="80px" size="small" :model="filters" @keyup.enter.native="search">
				<el-form-item label="游戏">
					<el-select v-model="filters.gameId" clearable placeholder="所有" @change="search">
						<el-option v-for="item in gameList" :key="item.id" :label="item.name" :value="item.id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="分组" v-if="groupShow">
					<el-select v-model="filters.groupsId" placeholder="所有" :clearable="true" @change="changeGroup">
						<el-option v-for="item in groupList" :key="item.id" :label="item.name" :value="item.id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="用户">
					<el-select v-if="filters.groupsId" v-model="filters.userId" placeholder="所有" :clearable="true" @change="search">
						<el-option v-for="user in userList" :key="user.userId" :label="user.userName" :value="user.userId"></el-option>
					</el-select>
					<el-select v-else v-model="filters.userId" placeholder="所有" :clearable="true" @change="search">
						<el-option-group
							v-for="group in userList"
							:key="group.id"
							:label="group.name">
							<el-option
								v-for="item in group.list"
								:key="item.userId"
								:label="item.userName"
								:value="item.userId">
							</el-option>
						</el-option-group>
					</el-select>
				</el-form-item>

				<el-form-item label="选择日期">
					<el-date-picker
						v-model="addDate"
						:type="dateType"
						:editable="false"
						:clearable="false"
						:format="dateFormat"
						@change="search"
						:picker-options="pickerOptions">
					</el-date-picker>
				</el-form-item>
				<el-radio-group size="small" style="display:block;margin:40px auto;width:max-content" v-model="dateType" @change="addDate=new Date();search()">
					<el-radio-button label="year">年销售报表</el-radio-button>
					<el-radio-button label="month">月销售报表</el-radio-button>
					<el-radio-button label="week">周销售报表</el-radio-button>
				</el-radio-group>
			</el-form>
			<div id="userReport"></div>
			<div v-show="dateReportShow" id="dateReport"></div>
		</div>
	</div>
</template>
<script>
import headMenu from '~/component/headMenu.vue'
export default {
	data() {
		return {
			filters: {
				groupsId: /\d+/.test(sessionStorage.getItem('groupsId')) ? sessionStorage.getItem('groupsId') : ''
			}, //搜索条件
			groupShow: !/\d+/.test(sessionStorage.getItem('groupsId')),
			pickerOptions: {
				disabledDate(time) {
					let now = new Date()
					return time.getTime() > Date.now() || time.getTime() < new Date(now.getFullYear(), 0)
				}
			},
			gameList: [],
			groupList: [],
			userList: [],
			loading: false,
			dateReportShow: false,
			addDate: new Date(),
			dateType: 'week',
			dateFormat: ''
		}
	},
	components: {
		headMenu
	},
  methods: {
		changeGroup() {
			delete this.filters.userId
			this.axios.get('/api/user/getUserListByGroupsId', {params: {groupsId: this.filters.groupsId}}).then(res => {
				if (res.data && res.data.code === 200) {
					if (this.filters.groupsId) {
						this.userList = res.data.data
					} else {
						this.userList =  []
						this.groupList.forEach(item => {
							this.userList.push({
								id: item.id,
								name: item.name +'组'
							})
						})
						this.userList.forEach(group => {
							res.data.data.forEach((user) => {
								if(group.id === user.groupsId) {
									if(group.list){
										group.list.push({
											userId: user.userId,
											userName: user.userName
										})
									}else{
										group.list = [{
											userId: user.userId,
											userName: user.userName
										}]
									}
								}
							})
						})
					}
					this.search()
				}
			})
		},
		search() {
			let date = new Date(this.addDate)
			if(this.dateType === 'week') {
				this.dateFormat = 'yyyy年第W周'
				this.filters.addDateStart = new Date(date.setDate(date.getDate() - date.getDay())).format('yyyy-MM-dd')
				this.filters.addDateEnd = new Date(date.setDate(date.getDate() - date.getDay() + 6)).format('yyyy-MM-dd')
			}else if(this.dateType === 'month') {
				this.dateFormat = 'yyyy年M月'
				this.filters.addDateStart = new Date(date.getFullYear() , date.getMonth(), 1).format('yyyy-MM-dd')
				this.filters.addDateEnd = new Date(date.getFullYear() , date.getMonth() + 1, 0).format('yyyy-MM-dd')
			}else if(this.dateType === 'year'){
				this.dateFormat = 'yyyy年'
				this.filters.addDateStart = new Date(date.getFullYear() , 0).format('yyyy-MM-dd')
				this.filters.addDateEnd = new Date(date.getFullYear() , 11).format('yyyy-MM-dd')
			}
			let params = Object.assign({}, this.filters)
			if(!params.groupsId) delete params.groupsId
			let loading = this.$loading({
				lock: true,
				text: '正在更新报表...',
				spinner: 'el-icon-loading',
				background: 'rgba(0, 0, 0, 0.5)'
			})
			this.axios.get('/api/sell/statisticsByUserOrGroups', {params}).then(res => {
				loading.close()
				if (res.data && res.data.code === 200 && res.data.data) {
					this.userReport(res.data.data)
				}
			}).catch(e => {
				loading.close()
				this.$message.error(e.toString())
			})
		},
		userReport(data) {
			this.dateReportShow = false
			let title, name = [], sum = []
			if(this.filters.userId) {
				if (this.filters.groupsId) {
					for(let user of this.userList) {
						if(this.filters.userId == user.userId) {
							name.push(user.userName)
							title = user.userName + '销售报表'
							break
						}
					}
				}else{
					for(let group of this.userList) {
						 for(let user of group.list) {
							if(this.filters.userId == user.userId) {
								name.push(user.userName)
								title = user.userName + '销售报表'
								break
								break
							}
						}
					}
				}
				for(let row of data) {
					sum.push(row.sum)
					break
				}
			}else if(this.filters.groupsId) {
				for(let group of this.groupList) {
					if(this.filters.groupsId == group.id) {
						title = group.name + '组销售报表'
						break
					}
				}
				this.userList.forEach(item =>{
					name.push(item.userName)
					let defineSum = 0
					for(let row of data) {
						if (row.userName == item.userName) {
							defineSum = row.sum
							break
						}
					}
					sum.push(defineSum)
				})
			} else {
				title = '各分组销售报表'
				this.groupList.forEach(item =>{
					name.push(item.name + '组')
					let defineSum = 0
					for(let row of data) {
						if (row.groupsName === item.name) {
							defineSum = row.sum
							break
						}
					}
					sum.push(defineSum)
				})
			}
			let s = 0
			sum.forEach(item => {
				s += item
			})
			if(s) title += '(总额: '+ Math.round(s * 100) / 100 +'元)'
			title = this.addDate.format(this.dateFormat) + title
			let userReport = this.echarts.init(document.getElementById('userReport'))
			userReport.setOption({
				tooltip: {
					trigger: 'axis',
					axisPointer: {
						type: 'shadow'
					}
				},
				title: { text: title },
				color: ['#3398db'],
				xAxis: [{ data: name}],
				yAxis: [{}],
				series: [{
					name: '金额',
					type: 'bar',
					barWidth: '50%',
					data: sum
				}]
			})
			userReport.off('click')
			userReport.on('click', params => {
				this.dateReport(params)
			})
		},
		dateReport(userData) {
			this.dateReportShow = true
			let url
			let params = Object.assign({}, this.filters)

			if(params.groupsId) {
				url = '/api/sell/statisticsByDayAndUser'
				for(let user of this.userList) {
					if (userData.name == user.userName) {
						params.userId = user.userId
						break
					}
				}
			} else {
				url = '/api/sell/statisticsByDayAndGroups'
				for(let group of this.groupList) {
					if (userData.name == group.name + '组') {
						params.groupsId = group.id
						break
					}
				}
			}

			this.axios.get(url, {params}).then(res => {
				if (res.data && res.data.code === 200 && res.data.data) {
					let data = res.data.data
					let title = userData.name + ' - ', date = [], sum = []
					if(this.dateType === 'week') {
						title += '周'
						date = ['周日', '周一','周二','周三','周四','周五','周六']
						for(let i = 0; i < date.length; i++){
							sum[i] = 0
							for(let item of data) {
								if(new Date(item.date).getDay() == i) {
									sum[i] = item.sum
									break
								}
							}
						}
					}else if(this.dateType === 'month') {
						title += '月'
						let max = new Date(this.addDate)
						max = new Date(max.getFullYear(), max.getMonth() + 1, 0).getDate()
						for(var i = 1; i <= max; i++){
							date.push(i)
							sum[i - 1] = 0
							for(let item of data) {
								if(new Date(item.date).getDate() == i) {
									sum[i - 1] = item.sum
									break
								}
							}
						}
					}else if(this.dateType === 'year'){
						title += '年'
						date = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月']
						for(let i = 0; i < date.length; i++){
							sum[i] = 0
							for(let item of data) {
								if(new Date(item.date).getMonth() == i) {
									sum[i] += item.sum
								}
							}
						}
					}
					title += '变化图' + '(总额: '+ userData.data +'元)'
					let dateReport = this.echarts.init(document.getElementById('dateReport'))
					dateReport.setOption({
						tooltip: {
							trigger: 'axis',
							axisPointer: {
								type: 'line'
							}
						},
						xAxis: {
							type: 'category',
							data: date,
						},
						yAxis: {},
						title: { text: title },
						series: [{
							data: sum,
							type: 'line',
							smooth: true,
							name: '金额',
						}]
					})

				}
			}).catch(e => {
				this.$message.error(e.toString())
			})
		}
	},
	mounted(){
		this.axios.get('/api/game/getAll').then(res => {
			if (res.data && res.data.code === 200) {
				this.gameList = res.data.data
			}
		})
		this.axios.get('/api/groups/getAll').then(res => {
			if (res.data && res.data.code === 200) {
				this.groupList = res.data.data
				this.changeGroup()
			}
		})
		this.search()
	}
}
</script>
<style scoped>
#main {
	padding: 100px 20px 40px;
}
#userReport, #dateReport {
	width: 1280px;
	margin: 40px auto 0;
	height: 500px;
}
</style>
