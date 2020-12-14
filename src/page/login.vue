<template>
	<div id="main">
		<el-form :model="form.login" ref="login" :rules="form.rules" autocomplete="off" class="form"  @keyup.native.enter="login" v-show="form.login.show">
			<h2>系统登录</h2>
			<el-form-item prop="phone">
				<el-input type="tel" v-model="form.login.phone" placeholder="请输入手机号码" maxlength="11" prefix-icon="el-icon-mobile-phone"></el-input>
			</el-form-item>
			<el-form-item prop="password">
				<el-input type="password"  v-model="form.login.password" placeholder="请输入密码"  prefix-icon="el-icon-lock" ></el-input>
			</el-form-item>
			<el-form-item >
				<el-button @click="form.login.show=false;form.register.show=true">注册</el-button>
				<el-button type="primary" :loading="form.login.loading" @click="login">登录</el-button>
			</el-form-item>
		</el-form>

		<el-form :model="form.register" :rules="form.rules" ref="register" autocomplete="off" class="form"  @keyup.native.enter="register" v-show="form.register.show">
			<h2>系统注册</h2>
			<el-form-item prop="phone">
				<el-input type="tel" v-model="form.register.phone" placeholder="请输入手机号码" maxlength="11" prefix-icon="el-icon-mobile-phone"></el-input>
			</el-form-item>
			<el-form-item prop="username">
				<el-input v-model="form.register.username" placeholder="请输入真实姓名" maxlength="8" prefix-icon="el-icon-user"></el-input>
			</el-form-item>
			<el-form-item prop="password">
				<el-input type="password"  v-model="form.register.password" placeholder="请输入密码"  prefix-icon="el-icon-lock" ></el-input>
			</el-form-item>
			<el-form-item prop="repassword">
				<el-input type="password"  v-model="form.register.repassword" placeholder="重复密码"  prefix-icon="el-icon-lock" ></el-input>
			</el-form-item>
			<el-form-item>
				<el-button @click="form.register.show=false;form.login.show=true">返回登录</el-button>
				<el-button type="primary" :loading="form.register.loading" @click="register">注册</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script>
export default {
	data() {
		return {
			form: {
				login: {
					phone: sessionStorage.getItem('userId'),
					password: '',
					loading: false,
					show: true
				},
				register: {
					phone: '',
					username: '',
					password: '',
					loading: false,
					show: false
				},
				rules: {
					phone: [{
						required: true,
						message: '请输入手机号码!'
					},{
						pattern: /^1(3|5|6|7|8|9)\d{9}$/,
						message: '请输入正确的手机号码'
					}, {
						pattern: /^1$|13|15|16|17|18|19\d{0,10}$/,
						message: '请输入正确的手机号码',
						trigger: 'change'
					}],
					password: [{
						validator: (_, value, callback) => {
							if(!value) {
								callback(new Error('请输入密码!'))
							}else if(value.length < 6) {
								callback(new Error('密码长度不能少于6!'))
							}else{
								callback()
							}
						}
					}, {
						validator: (_, value, callback) => {
							if(value.length > 50) {
								callback(new Error('密码长度不能大于50!'))
							}else{
								callback()
							}
						},
						trigger: 'change'
					}],
					repassword: [{
						required: true,
						message: '请输入重复密码!'
					}, {
						validator: (_, value, callback) => {
							if(value !== this.form.register.password) {
								callback(new Error('重复密码不正确!'))
							}else{
								callback()
							}
						}
					}, {
						validator: (_, value, callback) => {
							if(value !== this.form.register.password && value.length >= this.form.register.password.length) {
								callback(new Error('重复密码不正确!'))
							}else{
								callback()
							}
						},
						trigger: 'change'
					}],
					username: [{
						required: true,
						message: '请输入真实姓名!'
					}, {
						pattern: /^[\u4E00-\u9FA5\uf900-\ufa2d]{1,8}$/,
						message: '请输入真实姓名',
						trigger: 'change'
					}, {
						pattern: /^[\u4E00-\u9FA5\uf900-\ufa2d]{2,8}$/,
						message: '请输入真实姓名'
					}]
				}
			}
		}
	},
	methods: {
		login() {
			this.$refs['login'].validate(valid => {
				if(!valid) return
				this.form.login.loading = true
				this.axios.post('/api/user/passwordLogin', {
					username: this.form.login.phone,
					password: this.form.login.password
				}).then(res => {
					if (res.data.code === 200) {
						this.$message.success('登录成功!')
						sessionStorage.setItem('userId', this.form.login.phone)
						// sessionStorage.setItem('password', this.form.login.password)
						sessionStorage.setItem('userName', res.data.data.username)
						sessionStorage.setItem('token', res.data.data.token)
						sessionStorage.setItem('views', res.data.data.permissions)
						sessionStorage.setItem('object', res.data.data.permissions2)
						if (res.data.data.groupsId && res.data.data.groupsName) {
							sessionStorage.setItem('groupsId', res.data.data.groupsId)
							sessionStorage.setItem('groupsName', res.data.data.groupsName)
						}
						this.$router.push({ path: '/'})
					} else if(res.data.code == 1){
						this.$message.error('用户账号不存在!')
					} else if(res.data.code == 2){
					 	this.$message.error('密码错误!')
					} else if(res.data.msg) {
						this.$message.error(res.data.msg)
					}
					this.form.login.loading = false
				}).catch((e) => {
					this.$message.error(e.toString())
					this.form.login.loading = false
				})
			})
		},
		register() {
			this.$refs['register'].validate(valid => {
				if(!valid) return
				this.form.register.loading = true
				this.axios.post('/api/user/register', {
					userId: this.form.register.phone,
					userName: this.form.register.username,
					password: this.form.register.password
				}).then(res => {
					if (res.data.code === 200) {
						this.$message.success('注册成功,返回登录!')
						this.form.login.phone = this.form.register.phone
						this.form.register.show = false
						this.form.login.show = true
					} else if(res.data.msg) {
						this.$message.error(res.data.msg)
					}
					this.form.register.loading = false
				}).catch(e => {
					this.form.register.loading = false
					this.$message.error(e.toString())
				})
			})
		},
	},
	mounted() {
	}
}
</script>

<style scoped>
#main {
	background: #2d3a4b;
	height: 100%;
	width: 100%;
	position: fixed;
}
.form {
	color: #fff;
	width: 400px;
	margin: 240px auto 0;
	text-align: center
}
.form .el-button--primary{
	width: 240px;
	float: right
}
.form .el-button--default {
	width: 150px;
	float: left
}
</style>
