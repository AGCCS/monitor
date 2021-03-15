import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import nodeStatus from '../components/nodes/nodeStatus.vue'
import nodesInfo from '../components/nodes/nodesInfo.vue'
import Mesh from '../components/mesh/Mesh.vue'
// import Dashboard from '../components/dashboard/dashboard.vue'
import Setting from '../components/settings/Setting.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/default',
      children: [
        { path: '/default', component: Mesh },
        { path: '/nodesStatus', component: nodeStatus },
        { path: '/nodesInfo', component: nodesInfo },
        { path: '/setting', component: Setting }
      ]
    }
  ]
})

// function to avoid visit without token(no password)
// to: the page to visit, from: page comed from, next: passed
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  // get token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
