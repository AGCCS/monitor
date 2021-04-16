<template>
  <div class="login_container">
    <div class="login_box">
      <div style="padding-top:5%">Log in to the console</div>
      <!-- placeholder for logo
  <div class="logo_box"><img src="" alt=""></div>-->

      <el-form ref="loginRef" :model="loginForm" :rules="loginRules" label-width="0px" class="login_form">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" clearable maxlength="20">
            <template slot="prepend">
              <div style="color:black">username</div>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" show-password clearable maxlength="20">
            <template slot="prepend">
              <div style="color:black">password</div>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button class="log_btn" @click="login" type="primary" plain>sign in</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { defaultPwd, defaultUser } from '../conf/configuration'
export default {
  data () {
    return {
      // data for log in
      loginForm: {
        username: defaultUser,
        password: defaultPwd
      },
      // rules for log in
      loginRules: {
        password: [
          { required: true, message: 'Please enter the password for console', trigger: 'blur' }
        ],
        username: [
          { required: true, message: 'Please enter the password for console', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    login () {
      this.$refs.loginRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('users/login', this.loginForm)
        if (res.meta.status !== 200) return this.$message.error('Login failed')
        this.$message.success('login successful')
        window.sessionStorage.setItem('token', res.data.token) // get proper token for user
        const { data: res1 } = await this.$http.get('nodes/list')
        if (res1.meta.status !== 200) {
          return this.$message.error('Failed to receive the information of nodes')
        }
        this.$router.push('home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .login_container {
    background-color: #808080;
    height: 100%;
    width:100%;
  }
  .login_box {
    width: 330px;
    height: 260px;
    background-color: #409EFF;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color:white;
  }
  .log_btn {
    position:absolute;
    right:0;
  }
  .login_form{
    width: 100%;
    padding: 10% 20px;
    box-sizing:border-box;
  }
  h3{
    color:white;
    text-align:center;
  }
  /*.logo_box{
    height:;
    width:;
    border:px solid ;
    border-radius: 50%;
    padding:;
    box-shadow:;
    position: absolute;
    left:50%;
    transform: translate(-50%,-50%);
    background-color:;
    img
  { width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color}}*/
</style>
