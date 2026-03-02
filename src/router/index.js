import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Layout from '../components/layout/Layout.vue' 
import Bilanz from '../views/Bilanz.vue'
import AccountDetail from '../views/AccountDetail.vue'
import InvoiceTable from '../features/invoices/components/InvoiceTable.vue'
import Calendar from '../views/Calendar.vue'

const routes = [
  { 
    path: '/login', 
    component: Login,
    meta: { requiresAuth: false, title: 'Workly | Login' }
  },
  {
    path: '/',
    component: Layout,
    children: [
      { 
        path: '', 
        name: 'Dashboard', 
        component: Dashboard,
        meta: { requiresAuth: true, title: 'Workly | Zentrale' }
      },
      { 
        path: 'rechnungen', 
        name: 'Rechnungen', 
        component: InvoiceTable, // JETZT AKTIVIERT
        meta: { requiresAuth: true, title: 'Workly | Rechnungen' }
      },
      { 
        path: 'bilanz', 
        name: 'Bilanz', 
        component: Bilanz,
        meta: { requiresAuth: true, title: 'Workly | Bilanz' }
      },
      { 
        path: 'bilanz/konto/:code', 
        name: 'AccountDetail', 
        component: AccountDetail,
        meta: { requiresAuth: true, title: 'Workly | Konto-Details' }
      },
      { 
        path: 'kalender', 
        name: 'Calendar', 
        component: Calendar,
        meta: { requiresAuth: true, title: 'Workly | Kalender' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Authentifizierungs-Guard & Titel-Manager
router.beforeEach((to) => {
  const token = localStorage.getItem('workly_token')
  
  if (to.meta.title) {
    document.title = to.meta.title
  }

  if (to.meta.requiresAuth && !token) {
    return '/login'
  }
  
  if (to.path === '/login' && token) {
    return '/'
  }
})

export default router