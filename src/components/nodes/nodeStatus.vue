<template>
  <div>
    <!-- breadcrumb Navigation for several nodes-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">Center</el-breadcrumb-item>
      <el-breadcrumb-item>Nodes Status</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Card to show imformation and data from nodes-->
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <el-row>
          <el-col :span="10">Status of nodes</el-col>
          <el-col :span="6" :offset="8">
          </el-col>
        </el-row>
      </div>

      <!-- Table to show the details of nodes-->
      <template>
        <el-table :data="NodeStatusList.slice((this.queryInfo.pagenum-1)*this.queryInfo.pagesize,
                      this.queryInfo.pagenum*this.queryInfo.pagesize)"
                  border
                  stripe
                  style="width: 100%">
          <el-table-column type="index"
                           label="#">
          </el-table-column>
          <el-table-column label="name"
                           sortable
                           width="150">
            <template slot-scope="scope">
              <div>
                <el-link><i class="el-icon-edit" @click="showNameDialog(scope.row.id)"></i></el-link>
                {{ scope.row.nodeName }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="connect"
                           label="connection"
                           :filters="[{text: 'connected', value: 1 }, {text: 'disconnected', value: 0 }]"
                           :filter-method="filterHandler"
                           sortable
                           width="150">
            <template slot-scope="scope">
              <div align="center">
                <el-button size="mini"
                           circle
                           :type="scope.row.connect? 'success': 'info'">
                </el-button>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="workStatus"
                           label="status"
                           sortable
                           width="100">
          </el-table-column>
          <el-table-column prop="Cur1"
                           sortable
                           label="cur1 /A"
                           width="100">
          </el-table-column>
          <el-table-column prop="Cur2"
                           sortable
                           label="cur2 /A"
                           width="100">
          </el-table-column>
          <el-table-column prop="Cur3"
                           sortable
                           label="cur3 /A"
                           width="100">
          </el-table-column>
          <el-table-column prop="maxCur"
                           sortable
                           label="max current /A"
                           width="160">
          </el-table-column>
          <!-- <el-table-column prop="workmode"
                           sortable
                           label="workmode">
          </el-table-column> -->
          <el-table-column label="setting">
            <template slot-scope="scope">

              <!-- settings of node-->
              <el-tooltip effect="dark" content="setting" placement="top">
                <el-button type="warning"
                           icon="el-icon-setting"
                           size="mini"
                           circle
                           @click="showSettingDialog(scope.row.id)">
                </el-button>
              </el-tooltip>

              <!-- press button B, only for test -->
              <el-tooltip effect="dark" content="button B" placement="top">
                <el-button type="primary"
                           icon="el-icon-video-play"
                           size="mini"
                           circle
                           @click="pressButtonB(scope.row.macADR, scope.row.nodeName)">
                </el-button>
              </el-tooltip>

              <!-- Node Blinks to find the node -->
              <el-tooltip effect="dark" content="Blink" placement="top">
                <el-button type="primary"
                           icon="el-icon-s-opportunity"
                           size="mini"
                           circle
                           @click="Blink(scope.row.macADR, scope.row.nodeName)">
                </el-button>
              </el-tooltip>
              <!-- Node stops blinking to find the node -->
              <el-tooltip effect="dark" content="No Blink" placement="top">
                <el-button type="info"
                           icon="el-icon-s-opportunity"
                           size="mini"
                           circle
                           @click="noBlink(scope.row.macADR, scope.row.nodeName)">
                </el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>

        <!-- Pagination of table-->
        <el-pagination @size-change="handleSizeChange"
                       @current-change="handleCurrentChange"
                       :current-page="queryInfo.pagenum"
                       :page-sizes="[5,10,15,20,40]"
                       :page-size="queryInfo.pagesize"
                       layout="total, sizes, prev, pager, next"
                       :total="total">
        </el-pagination>
      </template>
    </el-card>

    <!-- Messagebox for changing the name of nodes-->
    <el-dialog title="edit node name"
               :visible.sync="NameDialogVisible"
               width="300px"
               class="NameDialog"
               @close="nameDialogClosed">
      <el-form :model="nameForm" ref="nameFormRef" label-width="100px">
        <el-form-item label="Mac address" prop="macADR">
          <el-input v-model="nameForm.macADR" disabled></el-input>
        </el-form-item>
        <el-form-item label="Node name" prop="nodeName">
          <el-input v-model="nameForm.nodeName" clearable maxlength="15"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="NameDialogVisible = false">cancel</el-button>
        <el-button type="primary" @click="NameDialogConfirm">save</el-button>
      </span>
    </el-dialog>

    <!-- Messagebox for changing the settings of nodes-->
    <el-dialog :title="settingForm.nodeName? 'settings of '+settingForm.nodeName: 'settings of '+settingForm.macADR"
               :visible.sync="settingDialogVisible"
               width="300px"
               class="settingDialog"
               @close="settingDialogClosed">
      <el-form :model="settingForm" :rules="settingFormRules" ref="settingFormRef" label-width="100px" class="settingform">
        <el-form-item label="Workmode">
          <el-radio-group v-model="settingForm.workmode" size="small" @change="checkMode(settingForm.workmode)">
            <el-radio :label="'auto'">auto</el-radio>
            <el-radio :label="'manual'">manual</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Max current" prop="maxCur">
          <el-input v-model="settingForm.maxCur" clearable maxlength="5" :disabled="isAuto">
            <template slot="append"><div style="width:0px">A</div></template>
          </el-input>
        </el-form-item>
        <el-form-item label="Phases">
            <el-checkbox v-model="selAllPhases" @change="handleSelAllPhases" :disabled="isAuto">All</el-checkbox>
            <el-checkbox-group v-model="selPhases" @change="handleSelPhases" :disabled="isAuto">
              <el-checkbox v-for="phase in Phases" :label="phase" :key="phase">{{phase}}</el-checkbox>
            </el-checkbox-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="settingDialogVisible = false">cancel</el-button>
        <el-button type="primary" @click="settingDialogConfirm">save</el-button>
      </span>
    </el-dialog>
    <!-- <el-backtop target=".page-component__scroll .el-scrollbar__wrap"></el-backtop> -->
  </div>
</template>

<script>
const phasesOptions = [1, 2, 3]
export default {
  data () {
    var checkCurrentValue = (rule, value, callback) => {
      var isNum = /^\d+(\.\d+)?$/
      if (value) {
        if (!isNum.test(value)) {
          callback(new Error('please enter only numbers'))
        } else {
          if (value > this.settingForm.cmaxCur) {
            callback(new Error('max current should be less than the safe current ' + this.settingForm.cmaxCur + ' A'))
          }
        }
      }
      callback()
    }
    return {
      queryInfo: {
        query: '',
        // current page
        pagenum: 1,
        // number of nodes in the table
        pagesize: 10
      },
      NodeStatusList: [],
      total: 0,
      nodeInfo: {},
      NameDialogVisible: false, // if the messagebox of changing name is visible
      nameForm: {},
      settingDialogVisible: false, // if the messagebox of edit setting of node is visible
      settingForm: {},
      settingFormRules: {
        maxCur: [
          { validator: checkCurrentValue, trigger: 'blur' }]
      },
      isAuto: true, // true: default workmode automatic. false: manual -> change setting allowed
      selAllPhases: true,
      selPhases: [1, 2, 3],
      Phases: phasesOptions
    }
  },
  created () {
    this.getNodeStatusList()
    // this.keepAlive()
  },
  methods: {
    // get the informationslist of mesh
    async getNodeStatusList () {
      const { data: res } = await this.$http.get('nodes/status')
      if (res.meta.status !== 200) {
        return this.$message.error('Failed to receive the data of nodes')
      }
      this.NodeStatusList = res.data
      for (let i = 0; i < this.NodeStatusList.length; i++) {
        if (!this.NodeStatusList[i].nodeName) {
          this.NodeStatusList[i].nodeName = this.NodeStatusList[i].macADR
        }
        // if (!this.NodeStatusList[i].connect) {
        //   this.NodeStatusList.splice(i, 1)
        // }
      }
      this.total = this.NodeStatusList.length
    },

    // change the size of pages
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getNodeStatusList()
    },
    // change the current page
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getNodeStatusList()
    },

    // to change the work status of node, whether work or stop
    async changeNodeStatus (nodeInfo) {
      const { data: res } = await this.$http.put('nodes/status',
        {
          id: nodeInfo.id,
          maxCur: nodeInfo.maxCur,
          workmode: nodeInfo.workmode,
          workStatus: nodeInfo.workStatus
        })
      if (res.meta.status === 403) {
        return this.$message.warning('Please log in as admin to operate.')
      }
      if (res.meta.status !== 202) {
        nodeInfo.workStatus = !nodeInfo.workStatus
        return this.$message.error('Failed in changing the status of node')
      }
      this.$message.success('Success in changing the status of node')
    },

    // show the dialog for changing the name of node
    async showNameDialog (id) {
      const { data: res } = await this.$http.get('nodes/list?id=' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('Failed to read the information of node')
      }
      this.nameForm = res.data
      this.NameDialogVisible = true
    },

    // reset the Form when closed without confirmation
    nameDialogClosed () {
      this.$refs.nameFormRef.resetFields()
    },

    // edit the name of node then upload
    async NameDialogConfirm () {
      const { data: res } = await this.$http.put('nodes/list',
        { id: this.nameForm.id, nodeName: this.nameForm.nodeName })
      this.NameDialogVisible = false
      if (res.meta.status === 403) {
        return this.$message.warning('Please log in as admin to operate.')
      }
      if (res.meta.status !== 202) {
        return this.$message.error('Failed to change the name of node！')
      }
      this.getNodeStatusList()
      return this.$message.success('The name of the node has been successfully modified！')
    },

    // show the dialog for editing the settings of node
    async showSettingDialog (id) {
      const { data: res } = await this.$http.get('nodes/status?id=' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('Failed to read the information of node')
      }
      if (!res.data.connect) {
        return this.$message.error('No connection to the node')
      }
      this.settingForm = res.data
      this.selPhases = []
      while (res.data.Phases > 0) {
        this.selPhases.push(res.data.Phases % 10)
        res.data.Phases -= res.data.Phases % 10
        res.data.Phases /= 10
      }
      this.selAllPhases = this.selPhases.length === 3
      this.checkMode(this.settingForm.workmode)
      this.settingDialogVisible = true
    },

    // reset the Form when closed without confirmation
    settingDialogClosed () {
      this.$refs.settingFormRef.resetFields()
    },
    async settingDialogConfirm () { // edit the setting of node and upload
      this.$refs.settingFormRef.validate(async valid => {
        if (!valid) return
        this.settingForm.Phases = 0
        for (let i = 0; i < this.selPhases.length; i++) {
          this.settingForm.Phases = this.settingForm.Phases * 10 + this.selPhases[i]
        }
        const { data: res } = await this.$http.put('nodes/status',
          {
            id: this.settingForm.id,
            macADR: this.settingForm.macADR,
            Phases: this.settingForm.Phases,
            maxCur: this.settingForm.maxCur,
            workmode: this.settingForm.workmode,
            workStatus: this.settingForm.workStatus
          })
        this.settingDialogVisible = false
        window.console.log(res)
        if (res.meta.status === 403) {
          return this.$message.warning('Please log in as admin to operate.')
        }
        if (res.meta.status !== 202) {
          return this.$message.error('Failed to change the setting of node！')
        }
        this.getNodeStatusList()
        return this.$message.success('The setting of the node has been successfully modified！')
      })
    },
    keepAlive () {
      setInterval(() => {
        this.getNodeStatusList()
      }, 3000)
    },
    async pressButtonB (macADR, nodeName) {
      const { data: res } = await this.$http.put('nodes/buttonB', { macADR: macADR })
      if (res.meta.status === 403) {
        return this.$message.warning('Please log in as admin to operate.')
      }
      if (res.meta.status === 200) {
        return this.$message.success('Button of node ' + nodeName + ' is remotely pressed.')
      }
      return this.$message.error('Failed to control The node ' + nodeName + '.')
    },
    checkMode (workmode) {
      if (workmode === 'manual') {
        this.isAuto = false
      } else {
        this.isAuto = true
      }
    },
    handleSelAllPhases (val) {
      this.selPhases = val ? phasesOptions : []
    },
    handleSelPhases (val) {
      const selRes = val.length
      this.selAllPhases = selRes === this.Phases.length
    },
    filterHandler (value, row, column) {
      const property = column.property
      return row[property] === value
    },
    async Blink (macADR, nodeName) {
      const { data: res } = await this.$http.put('nodes/Blink', { macADR: macADR })
      if (res.meta.status === 403) {
        return this.$message.warning('Please log in as admin to operate.')
      }
      if (res.meta.status === 200) {
        return this.$message.success('The node ' + nodeName + ' blinks now.')
      }
      return this.$message.error('Failed to control The node ' + nodeName + '.')
    },
    async noBlink (macADR, nodeName) {
      const { data: res } = await this.$http.put('nodes/noBlink', { macADR: macADR })
      if (res.meta.status === 403) {
        return this.$message.warning('Please log in as admin to operate.')
      }
      if (res.meta.status === 200) {
        return this.$message.success('The node ' + nodeName + ' stops blinking now.')
      }
      return this.$message.error('Failed to control The node ' + nodeName + '.')
    }
  }
}
</script>

<style lang="less" scoped>
  .text {
    font-size: 14px;
  }
  .item {
    margin-bottom: 18px;
  }
  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both
  }
  .box-card {
    width: 95%;
  }
  .clearfix /deep/ .el-button{
    float:right;
  }
  .el-row {
    display: flex;
    align-items: center;
  }
  .el-pagination{
    margin-top:12px;
  }
</style>
<style>
  .box-card /deep/ .el-card__header {
    padding: 10px 12px;
  }
  .box-card /deep/ .el-card__body {
    padding: 0px 10px;
  }
  .NameDialog /deep/ .el-dialog__footer{
    padding:15px;
  }
  .NameDialog /deep/ .el-dialog__body {
    padding: 25px 20px;
  }
  .NameDialog /deep/ .el-dialog__header {
    padding: 15px 20px;
  }
  .settingDialog /deep/ .el-dialog__body {
    padding: 20px 15px;
    padding-bottom: 0px;
  }
  .NameDialog /deep/ .el-form-item__error {
    text-align: justify;
  }
</style>
