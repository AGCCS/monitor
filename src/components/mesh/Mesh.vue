<template>
  <div>
    <!-- breadcrumb Navigation for several nodes-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">Center</el-breadcrumb-item>
      <el-breadcrumb-item>Mesh Status</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Card to show imformation and data from nodes-->
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <el-row>
          <el-col :span="10">Mesh Monitor</el-col>
          <el-col :span="6" :offset="8">
            <!-- <el-button type="primary" plain @click="scanMesh">Scan Mesh</el-button> -->
          </el-col>
        </el-row>
      </div>

      <!-- Table to show the details of nodes-->
      <template>
        <el-table :data="HomeData"
                  border
                  stripe
                  style="width: 100%"
                  max-height="250">
          <!-- <el-table-column type="index"
                           label="#">
          </el-table-column> -->
          <el-table-column label="nodeNum" align="center">
          <el-table-column prop="totalNum"
                           label="total">
          </el-table-column>
          <el-table-column prop="activeNum"
                           label="active">
          </el-table-column>
          </el-table-column>
          <el-table-column prop="totalCur1"
                           label="total cur1 /A">
          </el-table-column>
          <el-table-column prop="totalCur2"
                           label="total cur2 /A">
          </el-table-column>
          <el-table-column prop="totalCur3"
                           label="total cur3 /A">
          </el-table-column>
          <el-table-column prop="maxCurrentValue"
                           label="max current /A">
          </el-table-column>
        </el-table>
      </template>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      HomeData: [{
        totalNum: 0,
        activeNum: 0,
        totalCurrent: 0,
        maxCurrentValue: 0,
        safeCurrentValue: 0,
        averageMax: 0
      }]
    }
  },
  created () {
    this.getMeshInfo()
    this.keepAlive()
  },
  methods: {
    // get the setting of mesh
    async getMeshInfo () {
      const { data: res1 } = await this.$http.get('mesh/setting')
      if (res1.meta.status !== 200) {
        return this.$message.error('Failed to receive the setting of mesh')
      }
      this.HomeData[0].maxCurrentValue = res1.data.wholeMax
      this.HomeData[0].safeCurrentValue = res1.data.safeMax
      const { data: res2 } = await this.$http.get('nodes/status')
      if (res2.meta.status !== 200) {
        return this.$message.error('Failed to receive the status of nodes')
      }
      this.totalNum = res2.data.length
      this.HomeData[0].activeNum = 0
      this.HomeData[0].totalCur1 = 0
      this.HomeData[0].totalCur2 = 0
      this.HomeData[0].totalCur3 = 0
      for (var i = 0; i < res2.data.length; i++) {
        if (res2.data[i].connect && res2.data[i].workStatus >= 10 && res2.data[i].workStatus < 60) {
          this.HomeData[0].activeNum++
          this.HomeData[0].totalCur1 += res2.data[i].Cur1
          this.HomeData[0].totalCur2 += res2.data[i].Cur2
          this.HomeData[0].totalCur3 += res2.data[i].Cur3
        }
      }
      this.HomeData[0].totalCur1 = Number(this.HomeData[0].totalCur1.toString().match(/^\d+(?:\.\d{0,2})?/))
      this.HomeData[0].totalCur2 = Number(this.HomeData[0].totalCur2.toString().match(/^\d+(?:\.\d{0,2})?/))
      this.HomeData[0].totalCur3 = Number(this.HomeData[0].totalCur3.toString().match(/^\d+(?:\.\d{0,2})?/))
      this.HomeData[0].totalNum = this.totalNum
    },
    keepAlive () {
      setInterval(() => {
        this.getMeshInfo()
      }, 3000)
    }
    // async scanMesh () {
    //   const { data: res } = await this.$http.get('mesh/init')
    //   if (res.meta.status !== 200) return this.$message.error('Failed to scan mesh for new nodes!')
    //   return this.$message.success('Begin to scan mesh for new nodes')
    // }
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
    padding: 0px 15px 15px 15px;
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
  .settingDialog /deep/ .el-form-item__error {
    text-align: justify;
  }
  .NameDialog /deep/ .el-form-item__error {
    text-align: justify;
  }
</style>
