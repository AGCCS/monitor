<template>
  <el-container class="home-container">
    <el-header>
    AGCCS-CTRL22 Console
    <el-button type="info" @click="logout">log out</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '48px' : '150px'">
        <div class="toggle-button" @click="togleCollapse" id="togle">
          &gt;&gt;&gt;
        </div>
        <el-menu class="verticalMenu"
                 background-color="#545c64"
                 text-color="#fff"
                 active-text-color="#409FFF"
                 unique-opened
                 :collapse="isCollapse"
                 :collapse-transition="false"
                 router
                 default-active="1">
          <!-- menu 1st level-->
          <el-menu-item @click="saveNavState('/default')"
                        index="default">
            <i class="el-icon-s-home"></i>
            <span slot="title">Mesh</span>
          </el-menu-item>
          <el-submenu class="nodesMenu">
            <template slot="title">
              <i class="el-icon-menu"></i>
              <span>Nodes</span>
            </template>

            <!-- menu 2nd level-->
            <el-menu-item @click="saveNavState('/nodesStatus')" index="nodesStatus">
                <i class="el-icon-monitor"></i>
                <span slot="title">Nodes Status</span>
            </el-menu-item>
            <el-menu-item @click="saveNavState('/nodesInfo')" index="nodesInfo">
              <i class="el-icon-document"></i>
              <span slot="title">Nodes Info</span>
            </el-menu-item>
          </el-submenu>
          <el-submenu class="settingMenu" :index="activePath">
            <template slot="title">
              <i class="el-icon-s-tools"></i>
              <span>Setting</span>
            </template>

            <!-- menu 2nd level-->
            <el-menu-item @click="pwdDialogVisible = true" :index="activePath">
                <i class="el-icon-user-solid"></i>
                <span slot="title">user setting</span>
            </el-menu-item>

            <el-menu-item @click="showMeshDialog" :index="activePath">
              <i class="el-icon-setting"></i>
              <span slot="title">mesh setting</span>
            </el-menu-item>

          <el-menu-item @click="initDialogVisible = true" :index="activePath">
          <i class="el-icon-s-release"></i>
              <span slot="title">mesh init</span>
          </el-menu-item>
          </el-submenu>
        </el-menu>

        <!-- Messagebox for changing the password-->
        <el-dialog title="Password Modification"
                   :visible.sync="pwdDialogVisible"
                   width="400px"
                   class="pwdDialog"
                   @close="pwdDialogClosed">
          <el-form :model="pwdForm" :rules="pwdFormRules" ref="pwdFormRef" label-width="150px" class="pwdForm" status-icon:true>
            <el-form-item label="username" prop="username">
              <el-input v-model="pwdForm.username"></el-input>
            </el-form-item>
            <el-form-item label="origin password" prop="password">
              <el-input v-model="pwdForm.password" show-password clearable></el-input>
            </el-form-item>
            <el-form-item label="new password" prop="newPWD">
              <el-input v-model="pwdForm.newPWD" show-password clearable></el-input>
            </el-form-item>
            <el-form-item label="confirm password" prop="checkNewPWD">
              <el-input v-model="pwdForm.checkNewPWD" type="password" clearable></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="pwdDialogVisible = false">cancel</el-button>
            <el-button type="primary" @click="pwdDialogConfirm">save</el-button>
          </span>
        </el-dialog>

        <!-- Messagebox for changing the setting of mesh -->
        <el-dialog title="Mesh Setting"
                   :visible.sync="meshDialogVisible"
                   width="300px"
                   class="meshDialog"
                   @close="meshDialogClosed">
          <el-form :model="meshForm" :rules="meshFormRules" ref="meshFormRef" label-width="120px" class="meshDialogForm">
            <el-form-item label="max Current" prop="wholeMax">
              <el-input v-model="meshForm.wholeMax">
                <template slot="append"><div style="width:0px">A</div></template>
              </el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="meshDialogVisible = false">cancel</el-button>
            <el-button type="primary" @click="meshDialogConfirm">save</el-button>
          </span>
        </el-dialog>

        <!-- Messagebox for initialize the mesh -->
        <el-dialog title="Mesh Initialization"
                   :visible.sync="initDialogVisible"
                   width="235px"
                   class="initDialog"
                   @close="initDialogClosed">
              <el-dialog width="330px"
                         title="Warning"
                         :visible.sync="initConfirmVisible"
                         append-to-body>
                <div style="color: #E6A23C; margin-bottom:5%">Please enter your username and password to continue the initialization.</div>
                <el-form :model="pwdForm" :rules="pwdFormRules" ref="initFormRef" label-width="100px" class="pwdForm" status-icon:true>
                  <el-form-item label="username" prop="username">
                    <el-input v-model="pwdForm.username"></el-input>
                  </el-form-item>
                  <el-form-item label="password" prop="password">
                    <el-input v-model="pwdForm.password" show-password clearable></el-input>
                  </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                  <el-button @click="initConfirmVisible = false">cancel</el-button>
                  <el-button type="primary" @click="initDialogConfirm">confirm</el-button>
                </span>
              </el-dialog>
          <div style="color: #E6A23C;">Are you sure to continue the initialization</div>
          <span slot="footer" class="dialog-footer">
            <el-button @click="initDialogVisible = false">cancel</el-button>
            <el-button type="primary" @click="initConfirmVisible = true; initDialogVisible = false">confirm</el-button>
          </span>
        </el-dialog>

      </el-aside>
      <el-container>
        <el-main>
          <!-- placeholder for router view-->
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    var checkCurrentValue = (rule, value, callback) => {
      var isNum = /^\d+(\.\d+)?$/
      if (!value) {
        return callback(new Error('Max Current cannot be empty'))
      }
      setTimeout(() => {
        if (!isNum.test(value)) {
          callback(new Error('Please enter only numbers'))
        } else {
          callback()
        }
      }, 150)
    }

    var validatePass = (rule, value, callback) => {
      if (value !== this.pwdForm.newPWD) {
        callback(new Error('Password confirmation doesnot match the password'))
      } else {
        callback()
      }
    }
    return {
      // menuList: [],
      isCollapse: true,
      activePath: '/default',
      pwdDialogVisible: false,
      pwdForm: {
        username: '',
        password: '',
        newPWD: '',
        checkNewPWD: ''
      },
      pwdFormRules: {
        username: [
          { required: true, message: 'please enter the username', trigger: 'blur' },
          {
            max: 20,
            message: 'Length of the password should be less than 20 letters',
            trigger: 'blur'
          }],
        password: [
          { required: true, message: 'please enter the origin password', trigger: 'blur' },
          {
            max: 20,
            message: 'Length of the password should be less than 20 letters',
            trigger: 'blur'
          }],
        newPWD: [
          { required: true, message: 'please enter the new password', trigger: 'blur' },
          {
            max: 20,
            message: 'Length of password should be less than 20 letters',
            trigger: 'blur'
          }],
        checkNewPWD: [
          { validator: validatePass, trigger: 'blur' },
          { required: true, message: 'please confirm the new password', trigger: 'blur' },
          {
            max: 20,
            message: 'Length of password should be less than 20 letters',
            trigger: 'blur'
          }]
      },
      meshDialogVisible: false,
      meshForm: {},
      meshFormRules: {
        wholeMax: [{ validator: checkCurrentValue, trigger: 'blur' }]
      },
      initDialogVisible: false,
      initConfirmVisible: false
    }
  },
  created () {
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    togleCollapse () {
      this.isCollapse = !this.isCollapse
      window.sessionStorage.setItem('activePath', this.activePath)
      if (this.isCollapse) {
        document.getElementById('togle').innerHTML = '>>>'
      } else { document.getElementById('togle').innerHTML = '<<<' }
    },
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
      this.isCollapse = true
      document.getElementById('togle').innerHTML = '>>>' // to suit the handy user
    },

    // function for the dialog of changing password
    pwdDialogClosed () {
      this.$refs.pwdFormRef.resetFields()
    },
    pwdDialogConfirm () {
      this.$refs.pwdFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('users/password',
          {
            username: this.pwdForm.username,
            password: this.pwdForm.password,
            newpassword: this.pwdForm.newPWD
          })
        this.pwdDialogVisible = false
        if (res.meta.status === 422) {
          return this.$message.error('wrong user information')
        }
        if (res.meta.status === 500) {
          return this.$message.error('failed to change the password')
        }
        this.$message.success('The name of the node has been successfully modified！')
      })
    },

    // function for the dialog of changing setting of mesh
    async showMeshDialog () {
      const { data: res } = await this.$http.get('mesh/setting')
      if (res.meta.status !== 200) {
        return this.$message.error('Failed to read the setting of mesh')
      }
      this.meshForm = res.data
      this.meshDialogVisible = true
    },
    meshDialogClosed () {
      this.$refs.meshFormRef.resetFields()
    },
    meshDialogConfirm () {
      this.$refs.meshFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('mesh/setting',
          {
            wholeMax: this.meshForm.wholeMax,
            safeMax: this.meshForm.safeMax
          })
        this.meshDialogVisible = false
        if (res.meta.status === 500) {
          return this.$message.error('Failed to change the setting')
        }
        this.$message.success('The setting of mesh has been successfully modified！')
      })
    },

    // functions for the dialog of mesh initialization
    initDialogClosed () {
      this.$refs.initFormRef.resetFields()
    },
    initDialogConfirm () {
      this.$refs.initFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('users/login',
          {
            username: this.pwdForm.username,
            password: this.pwdForm.password
          })
        this.initDialogVisible = false
        if (res.meta.status === 400) {
          return this.$message.error('wrong user information')
        }
        const { data: res1 } = await this.$http.post('mesh/init')
        if (res1.meta.status !== 202) return
        this.$message.success('The name of the node has been successfully modified！')
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .home-container {
    height:100%;
  }
  .el-header {
    background-color: #409EFF;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color:white;
    font-size: 20px;
  }
  .el-aside {
    background-color: #DCDFE6;
    .el-menu {
      border-right: none;
      .el-menu-item {
      padding-left: 10px !important;
      max-width: 150px !important;
      padding-right: 0px !important;
      }
    }
  }
  /deep/ .el-submenu__title {
  padding-left: 10px !important;
  max-width: 150px !important;
  padding-right: 0px !important;
  }
  /deep/ .el-tooltip {
  padding-left: 10px !important;
  }
  .el-main {
    background-color: #EAEDF1;
  }
  .toggle-button {
    background-color: #4A5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
</style>
