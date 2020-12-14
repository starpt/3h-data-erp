<template>
	<div>
		<header>
			<router-link class="logo" to="/"><img src="../assets/logo.png" alt="三猴大数据"/></router-link>
			<span v-for="(item, index) in menus" :key="index">
				<el-dropdown v-if="item.children">
					<router-link :to="item.path" :key="index" :class="item.act ? 'demonstration link act' : 'demonstration link'">{{ item.menu }}<i class="el-icon-arrow-down el-icon--right"></i></router-link>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item v-for="(item1, index1) in item.children" :key="index1">
							<router-link class="link1" :to="item1.path">{{ item1.menu }}</router-link>
						</el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown>
				<router-link v-else :to="item.path" :key="index" :class="item.act ? 'link act' : 'link'">{{ item.menu }}</router-link>
			</span>
			<!-- <router-link v-for="(item, index) in menus" :to="item.path" :key="index" :class="item.act ? 'link act' : 'link'">{{ item.menu }}</router-link> -->

			<el-dropdown class="user" @command="user">
				<span class="demonstration">{{ name }}<i class="el-icon-arrow-down el-icon--right"></i></span>
				<el-dropdown-menu slot="dropdown">
					<!-- <el-dropdown-item>修改用户名</el-dropdown-item> -->
					<el-dropdown-item command="password">修改密码</el-dropdown-item>
					<el-dropdown-item command="logout">退出登录</el-dropdown-item>
				</el-dropdown-menu>
			</el-dropdown>
		</header>

		<el-dialog title="修改密码" :visible.sync="edit.visible" width="500px">
			<el-form :model="edit.data" label-width="120px" :rules="edit.rules" ref="edit" @keyup.native.enter="save" inline>
				<el-form-item label="原始密码" prop="passwordOld">
					<el-input type="password" v-model="edit.data.passwordOld" placeholder="请输入原始密码" class="item1"></el-input>
				</el-form-item>
				<el-form-item label="新密码" prop="passwordNew">
					<el-input type="password" v-model="edit.data.passwordNew" placeholder="请输入新密码" class="item1"></el-input>
				</el-form-item>
				<el-form-item label="重复密码" prop="repasswordNew">
					<el-input type="password" v-model="edit.data.repasswordNew" placeholder="请输入重复密码" class="item1"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="edit.visible = false">取消</el-button>
				<el-button type="primary" :loading="edit.loading" @click="save">确定修改</el-button>
			</div>
		</el-dialog>
	</div>
</template>
<script>
export default {
	data() {
		return {
			menus: [],
			name: sessionStorage.getItem('userName') + (sessionStorage.getItem('groupsId') && sessionStorage.getItem('groupsName') ? '[' + sessionStorage.getItem('groupsName') + ']' : ''),
			edit: {
				visible: false,
				loading: false,
				data: {},
				rules: {
					passwordOld: [
						{
							required: true,
							message: '请输入原创密码!'
						},
						{
							validator: (_, value, callback) => {
								if (value.length < 6) {
									callback(new Error('密码长度不能少于6!'))
								} else {
									callback()
								}
							}
						},
						{
							validator: (_, value, callback) => {
								if (value.length > 50) {
									callback(new Error('密码长度不能大于50!'))
								} else {
									callback()
								}
							},
							trigger: 'change'
						}
					],
					passwordNew: [
						{
							required: true,
							message: '请输入新密码!'
						},
						{
							validator: (_, value, callback) => {
								if (value.length < 6) {
									callback(new Error('密码长度不能少于6!'))
								} else {
									callback()
								}
							}
						},
						{
							validator: (_, value, callback) => {
								if (value.length > 50) {
									callback(new Error('密码长度不能大于50!'))
								} else {
									callback()
								}
							},
							trigger: 'change'
						}
					],
					repasswordNew: [
						{
							required: true,
							message: '请输入重复密码!'
						},
						{
							validator: (_, value, callback) => {
								if (value !== this.edit.data.passwordNew) {
									callback(new Error('重复密码不正确!'))
								} else {
									callback()
								}
							}
						},
						{
							validator: (_, value, callback) => {
								if (value !== this.edit.data.passwordNew && value.length >= this.edit.data.passwordNew.length) {
									callback(new Error('重复密码不正确!'))
								} else {
									callback()
								}
							},
							trigger: 'change'
						}
					]
				}
			}
		}
	},
	methods: {
		user(act) {
			if (act === 'logout') {
				sessionStorage.removeItem('views')
				sessionStorage.removeItem('object') - sessionStorage.removeItem('token')
				sessionStorage.removeItem('userName')
				sessionStorage.removeItem('groupsId')
				sessionStorage.removeItem('groupsName')
				this.$router.push({path: '/login'})
			} else if (act === 'password') {
				this.edit.visible = true
				this.edit.loading = false
				this.edit.data = {}
				setTimeout(() => {
					this.$refs['edit'].clearValidate()
				}, 100)
			}
		},
		save() {
			this.$refs['edit'].validate(valid => {
				if (!valid) return
				this.edit.loading = true
				this.axios
					.post('/api/user/updatePassword', {
						userId: sessionStorage.getItem('userId'),
						passwordNew: this.edit.data.passwordNew,
						passwordOld: this.edit.data.passwordOld
					})
					.then(res => {
						if (res.data.code === 200) {
							this.$message.success('密码修改成功!')
							this.edit.visible = false
						} else if (res.data.msg) {
							this.$message.error(res.data.msg)
						}
						this.edit.loading = false
					})
					.catch(e => {
						this.edit.loading = false
						this.$message.error(e.toString())
					})
			})
		}
	},
	mounted() {
		let views = sessionStorage.getItem('views')
		if (sessionStorage.getItem('userName') && sessionStorage.getItem('token') && views) {
			views = views.split(',')
			let routes = this.$router.options.routes
			for (let v of views) {
				for (let i of routes) {
					if (i.menu && i.path === '/' + v) {
						if (this.$route.path === i.path) {
							i.act = true
						} else {
							delete i.act
						}
						this.menus.push(i)
						if (i.children) {
						}
						break
					}
				}
			}
		} else {
			this.$router.push({path: '/login'})
		}
	}
}
</script>
<style scoped>
header {
	position: fixed;
	top: 0;
	left: 0;
	height: 56px;
	width: 100%;
	min-width: 980px;
	background: #333;
	font-size: 16px;
	box-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
	overflow: hidden;
	z-index: 90;
}
.logo {
	float: left;
	margin: 10px 15px 0 20px;
}
.logo > img {
	width: 172px;
	height: 36px;
}
.link {
	float: left;
	height: 36px;
	line-height: 36px;
	margin: 10px 5px;
	padding: 0 15px;
	border-radius: 4px;
	color: #ddd;
	text-decoration: none;
	transition: background-color 0.15s;
}
.link.act,
.link:hover {
	color: #fff;
	background: rgba(99, 99, 99, 0.5);
}
.link1 {
	color: #333;
	text-decoration: none;
}
.user {
	float: right;
	margin: 17px 20px;
}
.demonstration {
	color: #ddd;
	font-size: 16px;
	cursor: pointer;
}
.demonstration:hover {
	color: #fff;
}
.item1 {
	width: 270px;
}
</style>
