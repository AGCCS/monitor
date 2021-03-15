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
          <el-col :span="10">Nodes Information</el-col>
          <el-col :span="6" :offset="8">
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
  </div>
</template>

<script>
import printJS from 'print-js'
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
      NodesInfoList: [],
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
      isAuto: true // true: default workmode automatic. false: manual -> change setting allowed
    }
  },
  created () {
    this.getNodesInfoList()
    // this.keepAlive()
  },
  methods: {
    // get the informationslist of mesh
    async getNodesInfoList () {
      const { data: res } = await this.$http.get('nodes/status')
      if (res.meta.status !== 200) {
        return this.$message.error('Failed to receive the data of nodes')
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
    print (id) {
      const html = document.querySelector('#' + id).innerHTML
      // create a new DOM
      const div = document.createElement('div')
      const printDOMID = 'printDOMElement'
      window.console.log(html)
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
