<template>
  <div>
    <!-- breadcrumb Navigation for several nodes-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">Center</el-breadcrumb-item>
      <el-breadcrumb-item>Nodes Info</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Card to show imformation and data from nodes-->
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <el-row>
          <el-col :span="5">Nodes Information</el-col>
          <el-col :span="3">
            <el-button type="primary" plain @click="getNodesInfoList" size="medium">Refresh</el-button>
          </el-col>
          <el-col :span="3" :offset="13">
            <el-button type="primary" plain @click="showFirmwareDialog" size="medium">Firmware<i class="el-icon-upload el-icon--right"></i></el-button>
          </el-col>
          <el-col :span="3">
            <el-button type="primary" plain @click="print('infoTable')" size="medium">Print</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- Table to show the details of nodes-->
      <template>
        <el-table :data="NodesInfoList.slice((this.queryInfo.pagenum-1)*this.queryInfo.pagesize,
                      this.queryInfo.pagenum*this.queryInfo.pagesize)"
                  border
                  stripe
                  style="width: 100%"
                  id = 'infoTable'>
          <!-- <el-table-column prop="id"
                           label="id"
                           sortable
                           width="60">
          </el-table-column> -->
          <el-table-column type="index"
                           label="#"
                           sortable
                           width="30">
          </el-table-column>
          <!-- <el-table-column prop="nodeName"
                           label="Name"
                           width="140"
                           sortable>
          </el-table-column> -->
          <el-table-column label="Name"
                           sortable
                           width="150">
            <template slot-scope="scope">
              <div>
                <el-link><i class="el-icon-edit" @click="showNameDialog(scope.row.id)"></i></el-link>
                {{ scope.row.nodeName }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="macAddress"
                           label="Mac Address"
                           width="140">
          </el-table-column>
          <el-table-column prop="Parent"
                           label="Parent"
                           width="140"
                           sortable>
          </el-table-column>
          <el-table-column prop="Rssi"
                           label="Rssi"
                           sortable>
          </el-table-column>
          <el-table-column prop="Layer"
                           label="Layer"
                           sortable>
          </el-table-column>
          <el-table-column prop="Plat"
                           sortable
                           label="Plat">
          </el-table-column>
          <el-table-column prop="Version"
                           label="Ver"
                           sortable>
          </el-table-column>
          <el-table-column prop="Board"
                           label="Board"
                           sortable>
          </el-table-column>
          <el-table-column prop="avrVer"
                           label="Avr ver"
                           width="120"
                           sortable>
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

    <!-- Messagebox for changing the settings of nodes-->
    <el-dialog title="Firmware Upload"
               :visible.sync="firmwareDialogVisible"
               width="320px"
               class="firmwareDialog"
               @close="firmwareDialogClosed">
      <el-dialog width="340px"
                 title="Choose Node"
                 :visible.sync="chooseNodeVisible"
                 @close="chooseNodeClosed"
                 append-to-body>
        <el-form :model="chooseNodeForm" ref="chooseNodeFormRef" class="chooseNodeForm">
          <el-form-item>
            <el-radio-group v-model="chooseNodeForm.index" size="medium">
              <el-radio :label="i" :key="item.macADR" v-for="(item, i) in chooseNodeForm.nodeList" style="width:120px">{{item.nodeName? item.nodeName: item.macADR}}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
        <el-button @click="chooseNodeVisible = false">cancel</el-button>
        <el-button type="primary" @click="chooseNodeConfirm()">confirm</el-button>
        </span>
      </el-dialog>
      <el-form :model="firmwareForm" ref="firmwareFormRef" label-width="100px" class="firmwareForm">
        <el-form-item label="Board">
          <el-radio-group v-model="firmwareForm.Board" size="small">
            <el-radio :label="'ESP32'">ESP32</el-radio>
            <el-radio :label="'AVR'">AVR</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <el-upload
                 class="upload-demo"
                 ref="upload"
                 drag
                 :limit="1"
                 accept="application/octet-stream, *.bin"
                 :action="uploadURL"
                 :headers="uploadHeaders"
                 :on-success="uploadSucceed"
                 :on-error="uploadErr"
                 :on-change="beforeUpload"
                 :auto-upload="false">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text" align="center">Please drag the firmware here, or click to upload</div>
        <div class="el-upload__tip" slot="tip" align="center">example for ESP32: "demesh_m5stick_6_3.bin"</div>
      </el-upload>

      <span slot="footer" class="dialog-footer">
        <el-button @click="firmwareDialogVisible = false">cancel</el-button>
        <el-button type="primary" @click="firmwareDialogConfirm()">confirm</el-button>
      </span>
    </el-dialog>

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
  </div>
</template>

<script>
import printJS from 'print-js'
import mqtt from 'mqtt'
const { uploadURL, MQTT_CONF } = require('../../conf/configuration.js')
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        // current page
        pagenum: 1,
        // number of nodes in the table
        pagesize: 10
      },
      NodesInfoList: [],
      total: 0,
      nodeInfo: {},
      firmwareDialogVisible: false,
      firmwareForm: {},
      chooseNodeVisible: false,
      chooseNodeForm: {
        nodeList: [],
        index: -1
      },
      NameDialogVisible: false, // if the messagebox of changing name is visible
      nameForm: {},
      uploadURL: uploadURL,
      uploadHeaders: { authorization: sessionStorage.getItem('token') }
    }
  },
  created () {
    this.getNodesInfoList()
  },
  methods: {
    // get the informationslist of mesh
    async getNodesInfoList () {
      const { data: res } = await this.$http.get('nodes/list')
      if (res.meta.status !== 200) {
        return this.$message.error('Failed to receive the information of nodes')
      }
      this.NodesInfoList = res.data
      this.total = res.data.length
      for (let i = 0; i < this.NodesInfoList.length; i++) {
        var macADR = this.NodesInfoList[i].macADR
        this.NodesInfoList[i].macAddress = ''
        for (let j = 0; j < macADR.length; j++) {
          this.NodesInfoList[i].macAddress += macADR[j]
          if (j % 2 === 1 && j < macADR.length - 1) {
            this.NodesInfoList[i].macAddress += ':'
          }
        }
      }
    },

    // change the size of pages
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getNodesInfoList()
    },
    // change the current page
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getNodesInfoList()
    },

    // print the data of table
    print (id) {
      const html = document.querySelector('#' + id).innerHTML
      // create a new DOM
      const div = document.createElement('div')
      const printDOMID = 'printDOMElement'
      div.id = printDOMID
      div.innerHTML = html

      // Extract the content of the first table, which is the header
      const ths = div.querySelectorAll('.el-table__header-wrapper th')
      const ThsTextArry = []
      for (let i = 0, len = ths.length; i < len; i++) {
        if (ths[i].innerText !== '') ThsTextArry.push(ths[i].innerText)
      }

      // delete the extra header
      div.querySelector('.hidden-columns').remove()
      // delete the first table
      div.querySelector('.el-table__header-wrapper').remove()

      // Insert the content of first table to the second table
      let newHTML = '<tr>'
      for (let i = 0, len = ThsTextArry.length; i < len; i++) {
        newHTML += '<td style="font-weight: bold">' + ThsTextArry[i] + '</td>'
      }

      newHTML += '</tr>'
      div.querySelector('.el-table__body-wrapper table').insertAdjacentHTML('afterbegin', newHTML)
      // Add the new DIV to the page and delete it after printing
      document.querySelector('body').appendChild(div)

      printJS({
        printable: printDOMID,
        type: 'html',
        scanStyles: false,
        style: ' table tr td,th { border-collapse: collapse;padding: 5px;border:1px #000 solid; }' // 表格样式
      })
      div.remove()
    },

    // Show the form of firmware upload
    showFirmwareDialog () {
      var length = 0
      for (let i = 0; i < this.NodesInfoList.length; i++) {
        if (this.NodesInfoList[i].connect) {
          this.chooseNodeForm.nodeList[length] = this.NodesInfoList[i]
          length++
        }
      }
      if (!length) {
        this.firmwareDialogVisible = false
        return this.$message.error('Please check the mesh. No node is connected!')
      }
      this.firmwareDialogVisible = true
    },

    // reset the Form when closed without confirmation
    firmwareDialogClosed () {
      this.$refs.firmwareFormRef.resetFields()
    },

    firmwareDialogConfirm () {
      if (this.firmwareForm.Board === 'ESP32') {
        this.$refs.upload.submit()
        this.firmwareDialogVisible = false
      } else if (this.firmwareForm.Board === 'AVR') {
        this.chooseNodeVisible = true
      }
    },
    async uploadSucceed (res, file, fileList) {
      if (this.firmwareForm.Board === 'ESP32') {
        const length = file.name.length
        const Version = file.name[length - 7] + '.' + file.name[length - 5]
        const Board = file.name.slice(7, -8)
        const { data: result } = await this.$http.post('upload/ESP32',
          {
            Board: Board,
            Version: Version
          })
        if (result.meta.status !== 202) {
          this.$message.error('ESP32 cannot download the firmware!')
        }
        fileList.pop()
        this.$message.success('ESP32 will download the firmware now.')
      } else if (this.firmwareForm.Board === 'AVR') {
        const index = this.chooseNodeForm.index
        var nodeName = this.chooseNodeForm.nodeList[index].nodeName ? this.chooseNodeForm.nodeList[index].nodeName : this.chooseNodeForm.nodeList[index].macADR
        const { data: result } = await this.$http.post('upload/AVR',
          {
            fileName: file.name,
            macADR: this.chooseNodeForm.nodeList[index].macADR,
            macAddress: this.chooseNodeForm.nodeList[index].macAddress
          })
        if (result.meta.status !== 202) {
          this.$message.error('Node ' + nodeName + ' cannot download the firmware for AVR!')
        }
        fileList.pop()
        this.chooseNodeForm.index = -1
        this.$message.success('Node ' + nodeName + ' will download the firmware for AVR now.')
        const getList = this.getNodesInfoList
        const succeed = this.$message.success
        var client = mqtt.connect(MQTT_CONF)
        client.subscribe('/DEMESH/' + this.chooseNodeForm.nodeList[index].macADR + '/acknowledge', { qos: 1 })
        client.on('message', function (topic, msg) {
          var mesJson = JSON.parse(msg)
          if (mesJson.mtype === 'avrota' && mesJson.state === 'running') {
            succeed('Node ' + nodeName + ' has successfully downloaded the firmware for AVR.')
            getList()
            client.end()
          }
        })
      }
    },
    uploadErr () {
      this.$message.error('Failed to upload the firmware!')
    },
    beforeUpload (file, fileList) {
      if (this.firmwareForm.Board === undefined) {
        this.$message.warning('Please choose type of board before upload.')
        fileList.pop()
        return false
      }
      if (this.firmwareForm.Board === 'ESP32') {
        // if (file.name.search('m5stick') < 0) {
        //   fileList.pop()
        //   this.$message.warning('File name should contain "' + 'm5stick' + '".')
        //   return false
        // }
        if (file.name.search('demesh_') < 0) {
          fileList.pop()
          this.$message.warning('File name should contain "demesh".')
          return false
        }
      }
    },

    chooseNodeConfirm () {
      if (this.chooseNodeForm.index < 0) {
        this.$message.warning('Please select the node where AVR firmware needs to be uploaded.')
        return
      }
      this.$refs.upload.submit()
      this.chooseNodeVisible = false
      this.firmwareDialogVisible = false
    },
    chooseNodeClosed () {
      this.$refs.chooseNodeFormRef.resetFields()
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
      this.getNodesInfoList()
      return this.$message.success('The name of the node has been successfully modified！')
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
  /deep/ .el-card__header {
    padding: 10px 20px;
  }
  /deep/ .el-upload-dragger {
    width: 210px;
    margin-left: 35px;
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
</style>
