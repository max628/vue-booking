import Vue from 'vue'
import Router from 'vue-router'
import BookingForm from '@/components/BookingForm'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'BookingForm',
      component: BookingForm
    }
  ]
})
