<template>
  <div class="login-page">
    <div class="login-box">
      <div class="login-header">
        <i class="fa-solid fa-bolt-lightning"></i>
        <h2>Workly Access</h2>
        <p>Bitte melden Sie sich an.</p>
      </div>
      
      <form @submit.prevent="onLogin">
        <div class="field">
          <label>Benutzer</label>
          <input v-model="username" type="text" placeholder="admin" required />
        </div>
        <div class="field">
          <label>Passwort</label>
          <input v-model="password" type="password" placeholder="***" required />
        </div>
        <button type="submit" :disabled="loading" class="login-btn">
          {{ loading ? 'Sichere Verbindung...' : 'Anmelden' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')
const loading = ref(false)

async function onLogin() {
  loading.value = true
  try {
    const res = await fetch('http://localhost:8000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    })
    if (res.ok) {
      const data = await res.json()
      localStorage.setItem('workly_token', data.token)
      localStorage.setItem('workly_user_name', data.user.name)
      router.push('/')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page { height: 100vh; display: flex; align-items: center; justify-content: center; background: #0b0e14; }
.login-box { background: #13161c; width: 380px; padding: 40px; border-radius: 24px; border: 1px solid #1f2229; }
.login-header { text-align: center; margin-bottom: 35px; }
.login-header i { color: #00bcd4; font-size: 32px; margin-bottom: 15px; }
.login-header h2 { color: white; margin-bottom: 5px; }
.login-header p { color: #707070; font-size: 13px; }

.field { margin-bottom: 20px; }
label { display: block; color: #707070; font-size: 11px; text-transform: uppercase; margin-bottom: 8px; }
input { width: 100%; padding: 14px; background: #0b0e14; border: 1px solid #1f2229; border-radius: 12px; color: white; }
.login-btn { width: 100%; padding: 16px; background: #00bcd4; color: #0b0e14; border: none; border-radius: 12px; font-weight: 800; cursor: pointer; }
</style>