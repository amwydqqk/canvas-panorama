import Vue from 'vue'
import Router from 'vue-router'
import PanoramaPage from '@/components/panorama'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'PanoramaPage',
      component: PanoramaPage
    }
  ]
})
