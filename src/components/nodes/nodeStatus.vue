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
                           label="#"
                           width="30">
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
          <el-table-column prop="ccss"
                           label="status"
                           :filters="workStatusFilter"
                           :filter-method="filterHandler"
                           sortable
                           width="130">
              <template slot-scope="scope">
                <div>
                  {{ scope.row.workStatus }}
                </div>
            </template>
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
                           label="maxCur /A"
                           width="130">
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

              <!-- press the operation Button, only for test -->
              <el-tooltip effect="dark" content="button B" placement="top">
                <el-button type="primary"
                           icon="el-icon-video-play"
                           size="mini"
                           circle
                           @click="operaButton(scope.row.macADR, scope.row.nodeName, scope.row.connect)">
                </el-button>
              </el-tooltip>

              <!-- Node Blinks to find the node -->
              <el-tooltip effect="dark" content="Blink" placement="top">
                <el-button type="primary"
                           icon="el-icon-s-opportunity"
                           size="mini"
                           circle
                           @click="Blink(scope.row.macADR, scope.row.nodeName, scope.row.connect)">
                </el-button>
              </el-tooltip>
              <!-- Node stops blinking to find the node -->
              <el-tooltip effect="dark" content="No Blink" placement="top">
                <el-button type="info"
                           icon="el-icon-s-opportunity"
                           size="mini"
                           circle
                           @click="noBlink(scope.row.macADR, scope.row.nodeName, scope.row.connect)">
                </el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>

        <!-- Pagination of table-->
        <el-pagination @size-change="handleSizeChange"
                       @current-change="handlePageChange"
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
          <el-radio-group v-model="settingForm.workmode" size="small" @change="checkNode(settingForm.workmode, settingForm.workStatus)">
            <el-radio :label="'auto'" :disabled="!isReady">auto</el-radio>
            <el-radio :label="'manual'" :disabled="!isReady">manual</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Max current" prop="smaxCur">
          <el-input v-model="settingForm.smaxCur" clearable maxlength="5" :disabled="isAuto">
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
          if (this.settingForm.cmaxCur >= 5 && value > this.settingForm.cmaxCur) {
            callback(new Error('max current should be less than the safe current ' + this.settingForm.cmaxCur + ' A'))
          }
          if (value <= 5) {
            callback(new Error('max current should be more than the 5 A'))
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
        smaxCur: [
          { validator: checkCurrentValue, trigger: 'blur' }],
        maxCur: [
          { validator: checkCurrentValue, trigger: 'blur' }]
      },
      isAuto: true, // true: default workmode automatic. false: manual -> change setting allowed
      isReady: false, // false: Node standby of error. true: node is working or ready to work.
      selAllPhases: true,
      selPhases: [1, 2, 3],
      Phases: phasesOptions,
      workStatusFilter: [
        { text: 'Off', value: 0 },
        { text: 'Wait EV', value: 1 },
        { text: 'Negotiation', value: 2 },
        { text: 'Charging', value: 3 },
        { text: 'Pause', value: 4 },
        { text: 'Wait Power', value: 5 },
        { text: 'Err', value: 9 }]
    }
  },
  created () {
    this.getNodeStatusList()
    this.keepAlive()
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
        // ccss: 0x: off, waiting for EV: 1x, negotiating power: 2x,
        // charging: 3x, pausing 4x, waiting for power: 5x, 9x: Error, others: Fatal Err
        var x = this.NodeStatusList[i].workStatus % 10
        var workStatus = ''
        this.NodeStatusList[i].ccss = Math.floor(this.NodeStatusList[i].workStatus / 10)
        switch (this.NodeStatusList[i].ccss) {
          case 0: workStatus = 'Off[' + x + ']'; break
          case 1: workStatus = 'Wait EV[' + x + ']'; break
          case 2: workStatus = 'Negotiation[' + x + ']'; break
          case 3: workStatus = 'Charging[' + x + ']'; break
          case 4: workStatus = 'Pause[' + x + ']'; break
          case 5: workStatus = 'Wait power[' + x + ']'; break
          case 9: workStatus = 'Err[' + x + ']'; break
          default: workStatus = 'Fatal Err'; break
        }
        this.NodeStatusList[i].workStatus = workStatus
        // // remove node that is disconnected.
        // if (!this.NodeStatusList[i].connect) {
        //   this.NodeStatusList.splice(i, this.NodeStatusList.length-i)
        //   break
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
    handlePageChange (newPage) {
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
      if (res.meta.status === 401) {
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
      if (res.meta.status === 401) {
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
      this.selPhases = []
      while (res.data.sPhases > 0) {
        this.selPhases.push(res.data.sPhases % 10)
        res.data.sPhases -= res.data.sPhases % 10
        res.data.sPhases /= 10
      }
      this.selAllPhases = this.selPhases.length === 3
      this.settingForm = res.data
      this.checkNode(this.settingForm.workmode, this.settingForm.workStatus)
      this.settingDialogVisible = true
    },

    // reset the Form when closed without confirmation
    settingDialogClosed () {
      this.$refs.settingFormRef.resetFields()
    },
    async settingDialogConfirm () { // edit the setting of node and upload
      this.$refs.settingFormRef.validate(async valid => {
        if (!valid) return
        this.settingForm.Phases = ''
        for (let i = 0; i < this.selPhases.length; i++) {
          // this.settingForm.Phases += this.selPhases[i]
          this.settingForm.Phases = this.settingForm.Phases * 10 + this.selPhases[i]
        }
        const { data: res } = await this.$http.put('nodes/status',
          {
            id: this.settingForm.id,
            macADR: this.settingForm.macADR,
            sPhases: this.settingForm.Phases,
            smaxCur: this.settingForm.smaxCur,
            workmode: this.settingForm.workmode,
            workStatus: this.settingForm.workStatus
          })
        this.settingDialogVisible = false
        if (res.meta.status === 401) {
          return this.$message.warning('Please log in as admin to operate.')
        }
        if (res.meta.status === 404) {
          return this.$message.warning('Operation of unconnected nodes forbidden.')
        }
        if (res.meta.status === 406) {
          return this.$message.error('No available current remain in all phases.')
        }
        if (res.meta.status === 402) {
          return this.$message.warning('Please choose other phases and maxcur, cause no available current remain in given parameters.')
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
    async operaButton (macADR, nodeName, connection) {
      if (!connection) {
        return this.$message.error('No connection to the node')
      }
      const { data: res } = await this.$http.put('nodes/buttonB', { macADR: macADR })
      if (res.meta.status === 401) {
        return this.$message.warning('Please log in as admin to operate.')
      }
      if (res.meta.status === 200) {
        return this.$message.success('Button of node ' + nodeName + ' is remotely pressed.')
      }
      return this.$message.error('Failed to control The node ' + nodeName + '.')
    },

    // Check the workStatus and workmode of node.
    checkNode (workmode, workStatus) {
      this.isAuto = workmode === 'auto'
      this.isReady = workStatus < 60
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
    async Blink (macADR, nodeName, connection) {
      if (!connection) {
        return this.$message.error('No connection to the node')
      }
      const { data: res } = await this.$http.put('nodes/Blink', { macADR: macADR })
      if (res.meta.status === 401) {
        return this.$message.warning('Please log in as admin to operate.')
      }
      if (res.meta.status === 200) {
        return this.$message.success('The node ' + nodeName + ' blinks now.')
      }
      return this.$message.error('Failed to control The node ' + nodeName + '.')
    },
    async noBlink (macADR, nodeName, connection) {
      if (!connection) {
        return this.$message.error('No connection to the node')
      }
      const { data: res } = await this.$http.put('nodes/noBlink', { macADR: macADR })
      if (res.meta.status === 401) {
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
