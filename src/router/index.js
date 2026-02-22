import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Layout from '../components/Layout.vue'
import Dashboard from '../views/Dashboard.vue'
import InvoiceTable from '../components/InvoiceTable.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: Login },
    {
      path: '/',
      component: Layout,
      children: [
        { path: '', component: Dashboard },
        { path: 'rechnungen', component: InvoiceTable }
      ],
      beforeEnter: (to, from, next) => {
        if (!localStorage.getItem('workly_token')) next('/login')
        else next()
      }
    }
  ]
})

export default router