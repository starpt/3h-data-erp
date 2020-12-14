<template>
	<div class="main">
		<el-button type="primary" style="display: block;margin:0 0 40px auto" @click="addGroup.visible = true">添加组别</el-button>
		<el-table border size="small" :data="group.list" v-loading="group.loading" style="width:481px;margin:0 auto">
			<el-table-column prop="name" label="组名">
				<template scope="scope">
					<input type="text" class="txt1" v-model="scope.row.name" :placeholder="scope.row.namePlaceholder ? scope.row.namePlaceholder : scope.row.name" @blur="blurInput(scope.row, 'nameShow')" @focus="focusInput(scope.row, 'nameShow', scope.row.name, 'namePlaceholder')" @keyup.enter="changeName(scope.row)" maxlength="16" />
					<button v-show="scope.row.nameShow" class="btn1" @click="changeName(scope.row)">修改</button>
				</template>
			</el-table-column>
			<el-table-column label="启用状态" width="100">
				<template scope="scope">
					<el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0" @change="changeStatus(scope.row)"></el-switch>
				</template>
			</el-table-column>
		</el-table>

		<el-dialog title="添加组别" :visible.sync="addGroup.visible">
			<el-form size="small" :model="addGroup.data" label-width="100px" :rules="addGroup.rules" ref="addGroup" @keyup.native.enter="add" inline>
				<el-form-item label="组名" prop="name">
					<el-input v-model="addGroup.data.name" style="width:280px" maxlength="16"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="addGroup.visible = false">取 消</el-button>
				<el-button type="primary" @click="add" :loading="addGroup.loading">确 定</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import headMenu from '~/component/headMenu.vue'
export default {
	data() {
		return {
			group: {
				loading: false,
				list: []
			},
			addGroup: {
				visible: false,
				loading: false,
				rules: {
					name: {
						pattern: /^[\u4E00-\u9FA5\uf900-\ufa2d\w]{2,}$/,
						message: '只能是中英文、数字或下划线并且长度至少2位!',
						trigger: 'blur'
					}
				},
				data: {
					name: ''
				}
			}
		}
	},
	methods: {
		add() {
			this.$refs['addGroup'].validate(valid => {
				if (!valid) return
				this.addGroup.loading = true
				this.axios
					.post('/api/groups/add', {
						name: this.addGroup.data.name
					})
					.then(res => {
						if (res.data.code === 200) {
							this.$message.success('添加组别成功!')
							this.addGroup.visible = false
							this.addGroup.data.name = ''
							this.res()
						} else if (res.data.msg) {
							this.$message.error(res.data.msg)
						}
						this.addGroup.loading = false
					})
					.catch(e => {
						this.addGroup.loading = false
						this.$message.error(e.toString())
					})
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
			if (!row.name) {
				this.$message.error('组别:' + row.name + ' 修改组名不能为空!')
				return
			} else if (row.name === row.namePlaceholder) {
				this.$message.error('组别:' + row.name + ' 修改组名,不能和旧组名相同!')
				return
			} else if (!/^[\u4E00-\u9FA5\uf900-\ufa2d\w]{2,}$/.test(row.name)) {
				this.$message.error('组别:' + row.name + ' 修改组名,只能是中英文、数字或下划线并且长度至少2位!')
				return
			}
			this.axios
				.post('/api/groups/updateName', {
					id: row.id,
					name: row.name
				})
				.then(res => {
					if (res.data.code === 200) {
						this.$message.success('组别:' + row.name + ' 修改组名成功!')
						row.namePlaceholder = row.name
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
				.post('/api/groups/updateStatus', {
					id: row.id,
					status: row.status
				})
				.then(res => {
					if (res.data.code === 200) {
						if (row.status === 1) {
							this.$message.success('组别:' + row.name + ' 已启用!')
						} else {
							this.$message.error('组别:' + row.name + ' 已禁用!')
						}
					} else if (res.data.msg) {
						this.$message.error(res.data.msg)
					}
				})
				.catch(e => {
					this.$message.error(e.toString())
				})
		},
		res() {
			this.axios.get('/api/groups/getAll').then(res => {
				if (res.data && res.data.code === 200) {
					this.group.list = res.data.data
				}
			})
		}
	},
	mounted() {
		this.res()
	}
}
</script>
<style scoped>
.main {
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
