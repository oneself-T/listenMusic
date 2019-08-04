// 存放所有的路由
import Vue from 'vue'
import Router from 'vue-router'
import index from './pages/components/index'
import search from './pages/components/search'
import songSheet from './pages/components/songSheet'
import ranking from './pages/components/ranking'

import musicLibrary from './pages/components/index/musicLibrary'
import me from './pages/components/index/me'







Vue.use(Router)

export default new Router({
  routes: [
    {
      path:'/',
      component: index,
      children:[
        {
          path:'/',
          name:'musicLibrary',
          component:musicLibrary
        },
        {
          path:'/index/me',
          name:'me',
          component:me
        }
      ]
    },
    {
      path: '/songSheet',
      name: 'songSheet',
      component: songSheet
    },
    {
      path: '/search',
      name: 'search',
      component: search
    },
    {
      path: '/ranking',
      name: 'ranking',
      component: ranking
    }
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (about.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
    // }
  ]
})
