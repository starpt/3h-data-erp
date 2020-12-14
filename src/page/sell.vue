<template>
	<div>
		<headMenu></headMenu>
		<div id="main">
			<el-form inline label-width="80px" size="small" :model="sell.filters" @keyup.enter.native="search" ref="search">
				<el-form-item label="游戏">
					<el-select v-model="sell.filters.gameName" clearable placeholder="所有" class="item1">
						<el-option v-for="item in gameList" :key="item.id" :label="item.name" :value="item.name"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="区服">
					<el-input v-model="sell.filters.area" class="item1"></el-input>
				</el-form-item>
				<el-form-item label="支付方式">
					<el-select v-model="sell.filters.paymodeMode" clearable placeholder="全部" class="item1">
						<el-option v-for="item in payList" :key="item.id" :label="item.mode" :value="item.mode"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="价格(起止)">
					<el-input v-model="sell.filters.priceStart" class="item2"></el-input>
					- <el-input v-model="sell.filters.priceEnd" class="item2"></el-input>
				</el-form-item>
				<el-form-item label="数量(起止)">
					<el-input v-model="sell.filters.countStart" class="item2"></el-input>
					- <el-input v-model="sell.filters.countEnd" class="item2"></el-input>
				</el-form-item>
				<el-form-item label="金额(起止)">
					<el-input v-model="sell.filters.sumStart" class="item2"></el-input>
					- <el-input v-model="sell.filters.sumEnd" class="item2"></el-input>
				</el-form-item>
				<el-form-item label="录入日期">
					<el-date-picker
						v-model="sell.filters.addDate"
						type="daterange"
						align="right"
						unlink-panels
						range-separator=" - "
						start-placeholder="开始日期"
						end-placeholder="结束日期"
						:editable="false"
						:picker-options="pickerOptions"
						class="item1">
					</el-date-picker>
				</el-form-item>
				<el-form-item label="客户名">
					<el-input v-model="sell.filters.customerName" class="item1"></el-input>
				</el-form-item>
				<el-form-item label="客户手机">
					<el-input v-model="sell.filters.customerMobile" class="item1"></el-input>
				</el-form-item>
				<el-form-item label="客户微信">
					<el-input v-model="sell.filters.customerName" class="item1"></el-input>
				</el-form-item>
				<el-form-item label="客户QQ">
					<el-input v-model="sell.filters.customerQq" class="item1"></el-input>
				</el-form-item>
				<div style="display:inline-block;margin-left:80px">
					<el-button size="small" type="primary" @click="search" class="el-icon-search"> 搜索</el-button>
					<el-button size="small" @click="reset">清空条件</el-button>
				</div>
				<div style="padding:0 10px 20px;text-align:right" v-if="object.includes('sell_add')">
					<el-button size="small" type="primary" @click="edit()" class="el-icon-plus"> 添加记录</el-button>
				</div>
			</el-form>

			<el-table border size="small" :data="sell.data" v-loading="sell.loading" style="width: 100%">
				<el-table-column prop="gameName" label="游戏名" sortable width="180"></el-table-column>
				<el-table-column prop="area" label="区服" width="80"></el-table-column>
				<el-table-column prop="materialName" label="材料" width="100"></el-table-column>
				<el-table-column prop="price" label="价格" width="80"></el-table-column>
				<el-table-column prop="count" label="数量" width="90"></el-table-column>
				<el-table-column prop="sum" sortable label="金额(元)" width="100"></el-table-column>
				<el-table-column prop="paymodeMode" label="支付方式" width="80"></el-table-column>
				<el-table-column prop="customerName" sortable label="客户名"></el-table-column>
				<el-table-column prop="contact" label="联系方式(微信/手机)" width="180"></el-table-column>
				<!-- <el-table-column prop="customerMobile" label="客户手机"></el-table-column>
				<el-table-column prop="customerWechat" label="客户微信"></el-table-column>
				<el-table-column prop="customerQq" label="客户QQ"></el-table-column> -->
				<!-- <el-table-column prop="remark" label="备注"></el-table-column> -->
				<el-table-column prop="addByUsername" sortable label="录单人员" width="100"></el-table-column>
				<el-table-column prop="addDate" label="录单日期" width="140"></el-table-column>
				<!-- <el-table-column prop="updateByUsername" label="编辑人员"></el-table-column>
				<el-table-column prop="updateDate" label="编辑日期"></el-table-column> -->
				<el-table-column fixed="right" label="操作" width="90">
					<template scope="scope">
						<i class="el-icon-edit" @click="edit(scope.row)" title="编辑"></i>
						<i class="el-icon-delete" v-if="object.includes('sell_delete')" @click="del(scope.row.id)" title="删除"></i>
					</template>
				</el-table-column>
			</el-table>
			<el-pagination
				style="padding: 30px 20px 20px"
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange"
				:current-page="sell.currentPage"
				:page-sizes="[100, 200, 500, 1000]"
				:page-size="sell.pageSize"
				layout="total, sizes, prev, pager, next, jumper"
				:total="sell.total">
			</el-pagination>

			<el-dialog :title="sell.edit.data.id ? '编辑记录' : '添加记录'" :visible.sync="sell.edit.visible" width="800px">
				<el-form :model="sell.edit.data" label-width="100px" :rules="sell.edit.rules" ref="edit" @keyup.native.enter="save" inline>
					<el-form-item label="游戏" prop="gameName">
						<el-select
							class="item1"
							v-model="sell.edit.data.gameName"
							filterable
							allow-create
							default-first-option
							@change="getMaterial"
							placeholder="请选择游戏">
							<el-option v-for="item in gameList" :key="item.id" :label="item.name" :value="item.name"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="区服" prop="area">
						<el-input v-model="sell.edit.data.area" placeholder="请输入区服" class="item1"></el-input>
					</el-form-item>
					<el-form-item label="材料" prop="materialName">
						<el-select
							class="item1"
							v-model="sell.edit.data.materialName"
							filterable
							allow-create
							default-first-option
							placeholder="请输入材料">
							<el-option v-for="item in materialList" :key="item.id" :label="item.name" :value="item.name"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="价格" prop="price">
						<el-input-number v-model="sell.edit.data.price" :min="0"  :precision="2" :step="0.1" placeholder="请输入价格" @change="changeSum" class="item1"></el-input-number>
					</el-form-item>
					<el-form-item label="数量" prop="count">
						<el-input-number v-model="sell.edit.data.count" :min="0" placeholder="请输入数量" @change="changeSum" class="item1"></el-input-number>
					</el-form-item>
					<el-form-item label="金额(元)" prop="sum">
						<el-input-number v-model="sell.edit.data.sum" placeholder="请输入价格" class="item1"></el-input-number>
					</el-form-item>
					<el-form-item label="支付方式" prop="paymodeMode">
						<el-select
							class="item1"
							v-model="sell.edit.data.paymodeMode"
							filterable
							allow-create
							default-first-option
							placeholder="请选择支付方式">
							<el-option v-for="item in payList" :key="item.id" :label="item.mode" :value="item.mode"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="客户名" prop="customerName">
						<el-input v-model="sell.edit.data.customerName" placeholder="请输入客户名" class="item1"></el-input>
					</el-form-item>
					<el-form-item label="客户手机" prop="customer">
						<el-input v-model="sell.edit.data.customerMobile" placeholder="请输入客户手机" class="item1"></el-input>
					</el-form-item>
					<el-form-item label="客户微信" prop="customer">
						<el-input v-model="sell.edit.data.customerWechat" placeholder="请输入客户微信" class="item1"></el-input>
					</el-form-item>
					<el-form-item label="客户QQ" prop="customer">
						<el-input v-model="sell.edit.data.customerQq" placeholder="请输入客户QQ" class="item1"></el-input>
					</el-form-item>
					<el-form-item label="备注" prop="remark">
						<el-input v-model="sell.edit.data.remark" placeholder="请输入备注" class="item1"></el-input>
					</el-form-item>
				</el-form>
				<div slot="footer" class="dialog-footer">
					<el-button @click="sell.edit.visible = false">取消</el-button>
					<el-button type="primary" :loading="sell.edit.loading" @click="save">确定保存</el-button>
				</div>
			</el-dialog>
		</div>
	</div>
</template>

<script>
import headMenu from '~/component/headMenu.vue'
export default {
	data() {
		return {
			sell: {
				loading: true,
				filters: {}, //搜索条件
				currentPage: 1, //当前页
				pageSize: parseInt(localStorage.getItem('pageSize')) || 100, //每页多少条
				total: 0, //总数
				data: [], //表格数据
				edit: {
					visible: false,
					data: {},
					loading: false,
					rules: {
						gameName: {
							required: true,
							message: '请选择游戏!',
							trigger: 'change'
						},
						materialName: {
							required: true,
							message: '请输入材料!',
							trigger: 'blur'
						},
						count: [{
							required: true,
							message: '请输入数量!',
							trigger: 'blur'
						}, {
							validator: (_, value, callback) => {
								if(Math.round(value * 100) === 0) {
									callback(new Error('数量不能为0!'))
								}else{
									callback()
								}
							},
							trigger: ['blur', 'change']
						}],
						price: [{
							required: true,
							message: '请输入价格!',
							trigger: 'blur'
						}, {
							validator: (_, value, callback) => {
								if(Math.round(value * 100) === 0) {
									callback(new Error('价格不能为0!'))
								}else{
									callback()
								}
							},
							trigger: ['blur', 'change']
						}],
						sum: {
							required: true,
							message: '请输入金额!',
							trigger: 'blur'
						},
						paymodeMode: {
							required: true,
							message: '请选择支付方式!',
							trigger: ['blur', 'change']
						},
						customerName: {
							required: true,
							message: '请输入客户名!',
							trigger: 'blur'
						},
						customer: {
							validator: (_, value, callback) => {
								if(this.sell.edit.data.customerMobile || this.sell.edit.data.customerWechat || this.sell.edit.data.customerQq) {
									callback()
								} else {
									callback(new Error('请输入客户手机、客户微信或客户QQ'))
								}
							},
							trigger: ['blur', 'change']
						}
					}
				}
			},
			object: (sessionStorage.getItem('object') || '').split(','),
			gameList: [],
			materialList: [],
			payList: [],
			pickerOptions: {
				shortcuts: [{
					text: '最近一周',
					onClick(picker) {
						const end = new Date();
						const start = new Date();
						start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
						picker.$emit('pick', [start, end]);
					}
				}, {
					text: '最近一个月',
					onClick(picker) {
						const end = new Date();
						const start = new Date();
						start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
						picker.$emit('pick', [start, end]);
					}
				}, {
					text: '最近三个月',
					onClick(picker) {
						const end = new Date();
						const start = new Date();
						start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
						picker.$emit('pick', [start, end]);
					}
				}]
			}
		}
	},
	components: {
		headMenu
	},
	methods: {
		search() {
			this.sell.data = []
			this.sell.loading = true
			let params = Object.assign({}, this.sell.filters)
			if (params.addDate && params.addDate.length == 2) {
				params.addDateStart = params.addDate[0].format('yyyy-MM-dd') + ' 00:00:00'
				params.addDateEnd = params.addDate[1].format('yyyy-MM-dd') + ' 23:59:59'
				delete params.addDate
			}
			params.pageIndex = this.sell.currentPage
			params.pageSize = this.sell.pageSize
			this.axios.get('/api/sell/getByCondition', {params}).then(res => {
				if (res.data && res.data.code === 200 && res.data.data.rows) {
					this.sell.data = res.data.data.rows
					this.sell.total = res.data.data.total
					this.sell.loading = false
				}
			}).catch(e => {
				this.sell.loading = false
			})
		},
		reset() {
			this.$refs['search'].resetFields()
			this.sell.filters = {}
			this.sell.currentPage = 1
			this.search()
		},
		handleSizeChange(size) {
			this.sell.pageSize = size
			localStorage.setItem('pageSize', size)
			this.sell.currentPage = 1
			this.search()
		},
		handleCurrentChange(currentPage) {
			this.sell.currentPage = currentPage
			this.search()
		},
		getMaterial(){
			this.axios.get('/api/material/getByNameAndGameName',{params:{gameName:this.sell.edit.data.gameName}}).then(res => {
				if (res.data && res.data.code === 200) {
					this.materialList = res.data.data
				}
			})
		},
		edit(row) {
			this.sell.edit.data = {}
			if(row) this.sell.edit.data = Object.assign({}, row)
			this.sell.edit.visible = true
			this.getMaterial()
			setTimeout(() => {
				this.$refs['edit'].clearValidate()
			}, 100)

		},
		changeSum() {
			this.sell.edit.data.sum = Math.round(this.sell.edit.data.price * 100 * this.sell.edit.data.count) / 100 || 0
		},
		save() {
			this.$refs['edit'].validate(valid => {
				if(!valid) return
				this.sell.edit.loading = true
				let params = this.sell.edit.data
				delete params.addBy
				delete params.addDate
				delete params.updateBy
				delete params.updateDate

				this.axios.post(params.id ? '/api/sell/updateByName' : '/api/sell/addByName', params).then(res => {
					if (res.data.code === 200) {
						this.$message.success('保存成功!')
						this.sell.edit.visible = false
						this.search()
					} else if(res.data.msg) {
						this.$message.error(res.data.msg)
					}
					this.sell.edit.loading = false
				}).catch(e => {
					this.sell.edit.loading = false
					this.$message.error(e.toString())
				})
			})
		},
		del(id) {
			if(!id) return
			this.$confirm('此操作将永久删除该记录, 是否继续?', '确认删除', {
				confirmButtonText: '确定删除',
				confirmButtonClass: 'confirmButtonClass',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				this.axios.post('/api/sell/delete', {id}).then(res => {
					log(res.data)
					if (res.data && res.data.code === 200) {
						this.$message.warning('删除成功!')
						this.search()
					}
				}).catch(e => {
					this.$message.error('删除失败,请和管理员联系!')
				})
			})
		}
	},
	mounted() {
		// (sessionStorage.getItem('object') || '').split(',').forEach(item => {
		// 	this.object[item] = true
		// })
		this.axios.get('/api/game/getAll').then(res => {
			if (res.data && res.data.code === 200) {
				this.gameList = res.data.data
			}
		})
		this.axios.get('/api/paymode/getAll').then(res => {
			if (res.data && res.data.code === 200) {
				this.payList = res.data.data
			}
		})
		this.search()
	}
}
</script>
<style scoped>
#main {
	padding: 100px 20px 40px
}
.item1 {
	width: 225px
}
.item2 {
	width: 105px
}
table .el-icon-edit, table .el-icon-delete {
	display: inline-block;
	width: 16px;
	height: 16px;
	cursor: pointer;
	padding: 4px;
	margin: 0 2px;
	border: 1px solid #409eff;
	border-radius: 4px;
	line-height: 16px;
	background: #409eff;
	color: #fff;
	text-align: center;
}
table .el-icon-edit:hover{
	background: #66b1ff;
	border-color: #66b1ff;
}
.confirmButtonClass, .confirmButtonClass:focus, table .el-icon-delete {
	background-color: #f56c6c;
	border-color: #f56c6c;
}
.confirmButtonClass:hover, table .el-icon-delete:hover {
	background-color: #f78989;
	border-color: #f78989;
}
</style>
