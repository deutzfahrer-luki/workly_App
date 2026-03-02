import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'

// FIX: Ordnername 'layout' ist jetzt kleingeschrieben
import Layout from '../components/layout/Layout.vue' 

// FIX: Wir laden erst mal nur die Basis-Seiten ohne komplexe Features
import Bilanz from '../views/Bilanz.vue'
import AccountDetail from '../views/AccountDetail.vue'

const routes = [
  { path: '/login', component: Login },
  {
    path: '/',
    component: Layout,
    children: [
      { path: '', component: Dashboard },
      { path: 'bilanz', component: Bilanz },
      { path: 'bilanz/konto/:code', component: AccountDetail }
      // Rechnungen erst mal weglassen, um Fehler zu isolieren
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router