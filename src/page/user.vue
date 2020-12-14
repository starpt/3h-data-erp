<template>
	<div>
		<headMenu></headMenu>
		<div id="main" v-show="$route.path === '/user'">
			<el-table border size="small" :data="user.data" v-loading="user.loading" style="width:1361px;margin:0 auto">
				<el-table-column prop="userId" label="用户账号" width="160" class="tab1"></el-table-column>
				<el-table-column label="姓名" width="200">
					<template scope="scope">
						<input type="text" class="txt1" v-model="scope.row.userName" :placeholder="scope.row.namePlaceholder ? scope.row.namePlaceholder : scope.row.userName" @blur="blurInput(scope.row, 'nameShow')" @focus="focusInput(scope.row, 'nameShow', scope.row.userName, 'namePlaceholder')" @keyup.enter="changeName(scope.row)" />
						<button v-show="scope.row.nameShow" class="btn1" @click="changeName(scope.row)" maxlength="8">修改</button>
					</template>
				</el-table-column>
				<el-table-column label="所属角色" width="200">
					<template scope="scope">
						<el-select size="small" v-model="scope.row.roleId" placeholder="请选择所属角色" @change="changeRole(scope.row)">
							<el-option v-for="item in roleList" :key="item.roleId" :label="item.roleName" :value="item.roleId"></el-option>
						</el-select>
					</template>
				</el-table-column>
				<el-table-column label="所属分组" width="200">
					<template scope="scope">
						<el-select size="small" v-model="scope.row.groupsId" placeholder="请选择所属分组" :clearable="true" @change="changeGroup(scope.row)">
							<el-option v-for="item in groupList" :key="item.id" :label="item.name" :value="item.id"></el-option>
						</el-select>
					</template>
				</el-table-column>
				<el-table-column label="修改密码" width="200">
					<template scope="scope">
						<input type="text" class="txt1" v-model="scope.row.passwordNew" placeholder="请输入新密码" @blur="blurInput(scope.row, 'passwordShow')" @focus="focusInput(scope.row, 'passwordShow')" @keyup.enter="changePassword(scope.row)" />
						<button v-show="scope.row.passwordShow" class="btn1" @click="changePassword(scope.row)">修改</button>
					</template>
				</el-table-column>
				<el-table-column label="启用状态" width="100">
					<template scope="scope">
						<el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0" @change="changeStatus(scope.row)"></el-switch>
					</template>
				</el-table-column>
				<el-table-column label="备注" width="300">
					<template scope="scope">
						<input type="text" class="txt1" v-model="scope.row.userRemarks" @blur="blurInput(scope.row, 'remarksShow')" @focus="focusInput(scope.row, 'remarksShow')" @keyup.enter="changeRemarks(scope.row)" />
						<button v-show="scope.row.remarksShow" class="btn1" @click="changeRemarks(scope.row)">修改</button>
					</template>
				</el-table-column>
			</el-table>
			<el-pagination style="padding: 30px 20px 20px" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="user.currentPage" :page-sizes="[100, 200, 500, 1000]" :page-size="user.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="user.total"> </el-pagination>
		</div>
		<router-view />
	</div>
</template>

<script>
import headMenu from '~/component/headMenu.vue'
export default {
	data() {
		return {
			roleList: [],
			groupList: [],
			user: {
				loading: true,
				filters: {}, //搜索条件
				currentPage: 1, //当前页
				pageSize: parseInt(localStorage.getItem('pageSize')) || 100, //每页多少条
				total: 0, //总数
				data: []
			}
		}
	},
	components: {
		headMenu
	},
	methods: {
		handleSizeChange(size) {
			this.user.pageSize = size
			localStorage.setItem('pageSize', size)
			this.user.currentPage = 1
			this.search()
		},
		handleCurrentChange(currentPage) {
			this.user.currentPage = currentPage
			this.search()
		},
		search() {
			this.user.data = []
			this.user.loading = true
			let params = Object.assign({}, this.user.filters)
			params.pageIndex = this.user.currentPage
			params.pageSize = this.user.pageSize
			this.axios
				.get('/api/user/getUserList', {params})
				.then(res => {
					if (res.data && res.data.code === 200 && res.data.data.rows) {
						this.user.data = res.data.data.rows
						this.user.total = res.data.data.total
						this.user.loading = false
					}
				})
				.catch(e => {
					this.user.loading = false
				})
		},
		blurInput(row, show) {
			setTimeout(() => {
				this.$set(row, show, false)
			}, 200)
		},
		focusInput(row, show, value, placeholder) {
			if (!row[placeholder] && value) this.$set(row, placeholder, value)
			this.$set(row, show, true)
		},
		changeName(row) {
			if (!row.userName) {
				this.$message.error('账号:' + row.userId + ' 修改姓名不能为空!')
				return
			} else if (row.userName === row.namePlaceholder) {
				this.$message.error('账号:' + row.userId + ' 修改姓名,不能和旧姓名相同!')
				return
			} else if (!/^[\u4E00-\u9FA5\uf900-\ufa2d]{2,8}$/.test(row.userName)) {
				this.$message.error('账号:' + row.userId + ' 修改姓名,只能是汉字并且长度至少2位!')
				return
			}
			this.axios
				.post('/api/user/updateUserName', {
					userId: row.userId,
					userName: row.userName
				})
				.then(res => {
					if (res.data.code === 200) {
						this.$message.success('账号:' + row.userId + ' 修改姓名成功!')
						row.namePlaceholder = row.userName
					} else if (res.data.msg) {
						this.$message.error(res.data.msg)
					}
				})
				.catch(e => {
					this.$message.error(e.toString())
				})
		},
		changePassword(row) {
			if (!row.passwordNew) {
				this.$message.error('账号:' + row.userId + ' 修改密码不能为空!')
				return
			} else if (row.passwordNew.length < 6) {
				this.$message.error('账号:' + row.userId + ' 修改密码,长度至少6位!')
				return
			} else if (row.passwordNew.length > 50) {
				this.$message.error('账号:' + row.userId + ' 修改密码,长度不能大于50位!')
				return
			}
			this.axios
				.post('/api/user/updatePasswordForce', {
					userId: row.userId,
					password: row.passwordNew
				})
				.then(res => {
					if (res.data.code === 200) {
						row.passwordNew = ''
						this.$message.success('账号:' + row.userId + ' 修改密码成功!')
					} else if (res.data.msg) {
						this.$message.error(res.data.msg)
					}
				})
				.catch(e => {
					this.$message.error(e.toString())
				})
		},
		changeRole(row) {
			this.axios
				.post('/api/user/updateUserRole', {
					userId: row.userId,
					roleId: row.roleId
				})
				.then(res => {
					if (res.data.code === 200) {
						this.$message.success('账号:' + row.userId + ' 修改角色成功!')
					} else if (res.data.msg) {
						this.$message.error(res.data.msg)
					}
				})
				.catch(e => {
					this.$message.error(e.toString())
				})
		},
		changeStatus(row) {
			this.axios
				.post('/api/user/updateStatus', {
					userId: row.userId,
					status: row.status
				})
				.then(res => {
					if (res.data.code === 200) {
						if (row.status === 1) {
							this.$message.success('账号:' + row.userId + ' 已启用!')
						} else {
							this.$message.error('账号:' + row.userId + ' 已禁用!')
						}
					} else if (res.data.msg) {
						this.$message.error(res.data.msg)
					}
				})
				.catch(e => {
					this.$message.error(e.toString())
				})
		},
		changeRemarks(row) {
			this.axios
				.post('/api/user/updateUserRemarks', {
					userId: row.userId,
					remarks: row.userRemarks
				})
				.then(res => {
					if (res.data.code === 200) {
						this.$message.success('账号:' + row.userId + ' 修改备注成功!')
					} else if (res.data.msg) {
						this.$message.error(res.data.msg)
					}
				})
				.catch(e => {
					this.$message.error(e.toString())
				})
		},
		changeGroup(row) {
			this.axios
				.post('/api/user/updateUserGroups', {
					userId: row.userId,
					groupsId: row.groupsId
				})
				.then(res => {
					if (res.data.code === 200) {
						this.$message.success('账号:' + row.userId + ' 修改分组成功!')
					} else if (res.data.msg) {
						this.$message.error(res.data.msg)
					}
				})
				.catch(e => {
					this.$message.error(e.toString())
				})
		}
	},
	mounted() {
		this.axios.get('/api/role/getAll').then(res => {
			if (res.data && res.data.code === 200) {
				this.roleList = res.data.data
			}
		})
		this.axios.get('/api/groups/getAll').then(res => {
			if (res.data && res.data.code === 200) {
				this.groupList = res.data.data
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
.txt1 {
	height: 32px;
	line-height: 32px;
	border-radius: 4px 0 0 4px;
	border: 1px solid transparent;
	box-sizing: border-box;
	color: #606266;
	float: left;
	font-size: inherit;
	outline: 0;
	padding: 0 10px;
	transition: border-color 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
	width: calc(100% - 50px);
}
.txt1:focus,
.txt1:hover {
	border-color: #ddd;
}
.txt1::-webkit-input-placeholder {
	color: #ccc;
}
.btn1 {
	height: 32px;
	line-height: 32px;
	border-radius: 0 4px 4px 0;
	border: 1px solid #ddd;
	border-left: 0;
	box-sizing: border-box;
	color: #888;
	float: left;
	font-size: inherit;
	outline: 0;
	padding: 0 10px;
	background: #fff;
	cursor: pointer;
}
.btn1:hover {
	color: #409eff;
	border-color: #c6e2ff;
	background-color: #ecf5ff;
}
</style>
