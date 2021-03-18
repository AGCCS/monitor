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
            <el-button type="primary" plain @click="firmwareDialogVisible = true" size="medium">Firmware<i class="el-icon-upload el-icon--right"></i></el-button>
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
          <el-table-column prop="id"
                           label="id"
                           sortable
                           width="60">
          </el-table-column>
          <el-table-column prop="nodeName"
                           label="Name"
                           width="140"
                           sortable>
          </el-table-column>
          <el-table-column prop="macADR"
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
               width="300px"
               class="firmwareDialog"
               @close="firmwareDialogClosed">
      <el-form :model="firmwareForm" ref="firmwareFormRef" label-width="100px" class="settingform">
        <el-form-item label="Board">
          <el-radio-group v-model="firmwareForm.Board" size="small">
            <el-radio :label="'m5stick'">ESP32</el-radio>
            <el-radio :label="'AVR'">AVR</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <el-upload
                 class="upload-demo"
                 ref="upload"
                 drag
                 :limit="1"
                 accept="application/octet-stream"
                 action="http://localhost:3000/api/upload/"
                 :on-success="uploadSucceed"
                 :on-error="uploadErr"
                 :on-change="beforeUpload"
                 :auto-upload="false">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text" align="center">Please drag the firmware here, or click to upload</div>
        <div class="el-upload__tip" slot="tip" align="center">example form: "demesh_m5stick_6_3.bin"</div>
      </el-upload>

      <span slot="footer" class="dialog-footer">
        <el-button @click="firmwareDialogVisible = false">cancel</el-button>
        <el-button type="primary" @click="firmwareDialogConfirm()">upload</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import printJS from 'print-js'
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
      firmwareForm: {}
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
        this.NodesInfoList[i].macADR = ''
        for (let j = 0; j < macADR.length; j++) {
          this.NodesInfoList[i].macADR += macADR[j]
          if (j % 2 === 1 && j < macADR.length - 1) {
            this.NodesInfoList[i].macADR += ':'
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

    // reset the Form when closed without confirmation
    firmwareDialogClosed () {
      this.$refs.firmwareFormRef.resetFields()
    },

    //
    firmwareDialogConfirm () {
      this.$refs.upload.submit()
      this.firmwareDialogVisible = false
    },
    async uploadSucceed (res, file, fileList) {
      const length = file.name.length
      const Version = file.name[length - 7] + '.' + file.name[length - 5]
      const { data: result } = await this.$http.post('upload/firmware',
        {
          Board: this.firmwareForm.Board,
          Version: Version
        })
      if (result.meta.status !== 202) {
        this.$message.error('ESP32 cannot download the firmware!')
      }
      fileList.pop()
      this.$message.success('ESP32 will download the firmware now.')
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
      if (file.name.search(this.firmwareForm.Board) < 0) {
        fileList.pop()
        this.$message.warning('File name should contain "' + this.firmwareForm.Board + '".')
        return false
      }
      if (file.name.search('demesh_') < 0) {
        fileList.pop()
        this.$message.warning('File name should contain "demesh".')
        return false
      }
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
    margin-left: 25px;
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
    width: 92%;
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
