<template>
  <aside 
    class="sidebar" 
    :class="{ 'is-collapsed': isCollapsed }"
    :style="{ width: isCollapsed ? '80px' : sidebarWidth + 'px' }"
  >
    <div class="sidebar-top">
      <div class="brand-header">
        <button class="burger-btn" @click="$emit('toggle')">
          <i class="fa-solid fa-bars"></i>
        </button>
        <span v-if="!isCollapsed" class="brand-name">Workly</span>
      </div>

      <nav class="nav-menu">
        <router-link to="/" class="nav-item" exact-active-class="active">
          <div class="icon-box">
            <i class="fa-solid fa-house"></i>
          </div>
          <span v-if="!isCollapsed">Zentrale</span>
        </router-link>
        
        <router-link to="/rechnungen" class="nav-item" active-class="active">
          <div class="icon-box">
            <i class="fa-solid fa-file-lines"></i>
          </div>
          <span v-if="!isCollapsed">Rechnungen</span>
        </router-link>

        <router-link to="/bilanz" class="nav-item" active-class="active">
          <div class="icon-box">
            <i class="fa-solid fa-scale-balanced"></i>
          </div>
          <span v-if="!isCollapsed">Bilanz / FiBu</span>
        </router-link>
      </nav>
    </div>

    <div v-if="!isCollapsed" class="resizer" @mousedown="$emit('start-resize', $event)"></div>

    <div class="sidebar-bottom">
      <div class="sync-card" :class="[isOnline ? 'is-online' : 'is-offline', { 'compact': isCollapsed }]">
        <div v-if="!isCollapsed" class="sync-info">
          <span class="dot" :class="{ 'blink': isOnline }"></span>
          <span class="sync-text">LIVE SYNC</span>
        </div>
        <i class="fa-solid fa-arrows-rotate sync-icon" :class="{ 'spinning': isOnline }"></i>
      </div>

      <hr class="divider" />

      <div class="user-section" :class="{ 'centered': isCollapsed }">
        <div class="user-avatar">A</div>
        <div v-if="!isCollapsed" class="user-meta">
          <span class="user-name">Lukas Admin</span>
          <span class="user-role">Administrator</span>
        </div>
      </div>

      <button class="logout-btn" :class="{ 'centered': isCollapsed }" @click="handleLogout">
        <i class="fa-solid fa-right-from-bracket"></i>
        <span v-if="!isCollapsed">Jetzt Abmelden</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps(['isCollapsed', 'sidebarWidth'])
const emit = defineEmits(['toggle', 'start-resize'])
const router = useRouter()
const isOnline = ref(true)

async function checkHealth() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/health')
    isOnline.value = res.ok
  } catch { 
    isOnline.value = false 
  }
}

function handleLogout() {
  localStorage.clear()
  router.push('/login')
}

onMounted(() => {
  checkHealth()
  setInterval(checkHealth, 5000)
})
</script>

<style scoped>
.sidebar {
  background: #13161c;
  border-right: 1px solid #1f2229;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 25px 0;
  position: relative;
  transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Header Fix für Burger Position */
.brand-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 40px;
  height: 44px;
  padding: 0 18px;
}
.is-collapsed .brand-header { justify-content: center; padding: 0; }

.brand-name { color: #00bcd4; font-size: 24px; font-weight: 900; }
.burger-btn { background: transparent; border: none; color: #707070; font-size: 20px; cursor: pointer; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; }

/* Navigation & Quadratische Optik */
.nav-menu { display: flex; flex-direction: column; gap: 12px; align-items: center; }
.nav-item {
  display: flex;
  align-items: center;
  gap: 15px;
  width: 85%;
  padding: 8px;
  color: #707070;
  text-decoration: none;
  border-radius: 12px;
  transition: 0.2s;
}
.nav-item.active { background: rgba(0, 188, 212, 0.08); }

/* FIX: Quadratische Form im eingeklappten Zustand */
.is-collapsed .nav-item {
  width: 44px;
  height: 44px;
  justify-content: center;
  padding: 0;
}

/* Inneres Icon-Quadrat */
.icon-box {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: 0.2s;
  border-radius: 8px;
}
.nav-item.active .icon-box { background: rgba(0, 188, 212, 0.15); color: #00bcd4; }

/* Status Karte: GRÜN & ROT */
.sync-card {
  padding: 12px; border-radius: 12px; display: flex; justify-content: space-between; 
  align-items: center; margin-bottom: 20px; width: 85%; transition: all 0.3s ease;
}
.is-online { background: rgba(34, 197, 94, 0.05); border: 1px solid rgba(34, 197, 94, 0.15); color: #22c55e; }
.is-offline { background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.15); color: #ef4444; }
.sync-card.compact { background: transparent; border: none; justify-content: center; width: 100%; }

/* User & Logout */
.sidebar-bottom { display: flex; flex-direction: column; align-items: center; width: 100%; }
.user-section { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; width: 85%; }
.user-section.centered { justify-content: center; width: 100%; }
.user-avatar { width: 44px; height: 44px; background: #00bcd4; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #0b0e14; flex-shrink: 0; }
.user-meta { display: flex; flex-direction: column; line-height: 1.2; }
.user-name { color: white; font-size: 14px; font-weight: 700; }
.user-role { color: #505050; font-size: 11px; }

.logout-btn { width: 85%; padding: 14px; border-radius: 12px; border: none; background: rgba(239, 68, 68, 0.08); color: #ef4444; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }
.logout-btn.centered { width: 44px; height: 44px; padding: 0; }

.divider { border: none; border-top: 1px solid #1f2229; margin: 0 0 20px 0; width: 85%; }
.resizer { position: absolute; right: 0; top: 0; width: 4px; height: 100%; cursor: col-resize; }

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.spinning { animation: spin 4s linear infinite; }
</style>