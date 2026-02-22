<template>
  <aside class="sidebar" :class="{ 'sidebar-collapsed': isCollapsed }">
    <div class="sidebar-top">
      <div class="logo-area">
        <i class="fa-solid fa-bolt-lightning logo-icon"></i>
        <span v-if="!isCollapsed" class="logo-text">Workly</span>
      </div>
      
      <nav class="nav-list">
        <router-link to="/zentrale" class="nav-item">
          <i class="fa-solid fa-house"></i>
          <span v-if="!isCollapsed">Zentrale</span>
        </router-link>
        <router-link to="/rechnungen" class="nav-item">
          <i class="fa-solid fa-file-invoice-dollar"></i>
          <span v-if="!isCollapsed">Rechnungen</span>
        </router-link>
      </nav>
    </div>

    <div class="sidebar-bottom">
      <div class="sync-status-box" :class="{ 'is-offline': !isOnline }">
        <div class="status-indicator">
          <div class="dot" :class="{ 'blink': isOnline }"></div>
          <span v-if="!isCollapsed">LIVE SYNC</span>
        </div>
        <i v-if="!isCollapsed" class="fa-solid fa-rotate sync-icon" :class="{ 'fa-spin': isOnline }"></i>
      </div>

      <div class="user-card" v-if="!isCollapsed">
        <div class="avatar">L</div>
        <div class="user-meta">
          <span class="username">Lukas Admin</span>
          <span class="role">Administrator</span>
        </div>
      </div>

      <button class="logout-btn" @click="handleLogout">
        <i class="fa-solid fa-right-from-bracket"></i>
        <span v-if="!isCollapsed">Jetzt Abmelden</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps(['isCollapsed'])
const isOnline = ref(false)
const router = useRouter()
let healthInterval = null

// Prüft die API ohne Token-Zwang
async function checkApiHealth() {
  try {
    const res = await fetch('http://localhost:8000/api/health')
    if (res.ok) {
      const data = await res.json()
      isOnline.value = data.status === 'online'
    } else {
      isOnline.value = false
    }
  } catch (err) {
    isOnline.value = false
  }
}

function handleLogout() {
  localStorage.removeItem('workly_token')
  router.push('/login')
}

onMounted(() => {
  checkApiHealth()
  // Alle 10 Sekunden prüfen
  healthInterval = setInterval(checkApiHealth, 10000)
})

onUnmounted(() => {
  if (healthInterval) clearInterval(healthInterval)
})
</script>

<style scoped>
.sidebar {
  width: 260px;
  background: #0b0e14;
  border-right: 1px solid #1f2229;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 30px 15px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-collapsed { width: 85px; padding: 30px 10px; }

/* SYNC BOX */
.sync-status-box {
  background: rgba(255, 171, 0, 0.05);
  border: 1px solid rgba(255, 171, 0, 0.2);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.is-offline {
  background: rgba(239, 68, 68, 0.05);
  border-color: rgba(239, 68, 68, 0.2);
}

.status-indicator { display: flex; align-items: center; gap: 10px; color: #ffab00; font-size: 11px; font-weight: 800; }
.is-offline .status-indicator { color: #ef4444; }

.dot { width: 8px; height: 8px; background: #ffab00; border-radius: 50%; }
.is-offline .dot { background: #ef4444; }
.blink { animation: pulse 2s infinite; }

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 171, 0, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(255, 171, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 171, 0, 0); }
}

/* LOGOUT */
.logout-btn {
  width: 100%;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444;
  padding: 14px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  transition: 0.2s;
}

.logout-btn:hover { background: rgba(239, 68, 68, 0.2); }
</style>