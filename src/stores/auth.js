import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref({
    name: localStorage.getItem('name') || '',
    role: localStorage.getItem('role') || 'Admin' // Standardmäßig Admin für die Entwicklung
  })

  const isLoggedIn = computed(() => !!token.value)
  const isWorker = computed(() => user.value.role === 'Mitarbeiter')

  async function login(username, password) {
    // Einfache Simulation für den Start
    if (username && password) {
      token.value = 'fake-token'
      user.value = { name: username, role: 'Admin' }
      localStorage.setItem('token', token.value)
      localStorage.setItem('name', user.value.name)
      localStorage.setItem('role', user.value.role)
      return true
    }
    return false
  }

  function logout() {
    token.value = ''
    user.value = { name: '', role: '' }
    localStorage.clear()
  }

  return { token, user, isLoggedIn, isWorker, login, logout }
})