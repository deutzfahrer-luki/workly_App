<template>
  <div class="app-shell" :class="{ 'sidebar-collapsed': isCollapsed }">
    <aside 
      class="sidebar" 
      :style="{ width: isCollapsed ? '72px' : sidebarWidth + 'px' }"
    >
      <div class="sidebar-top">
        <div class="brand-row" :class="{ 'centered': isCollapsed }">
          <button class="collapse-btn" @click="toggleSidebar">
            <i class="fa-solid fa-bars"></i>
          </button>
          <span v-if="!isCollapsed" class="brand">Workly</span>
        </div>
        
        <nav class="main-nav">
          <router-link to="/" class="nav-item" exact-active-class="active" title="Zentrale">
            <div class="icon-wrap"><i class="fa-solid fa-house"></i></div>
            <span v-if="!isCollapsed">Zentrale</span>
          </router-link>
          <router-link to="/rechnungen" class="nav-item" active-class="active" title="Rechnungen">
            <div class="icon-wrap"><i class="fa-solid fa-file-invoice"></i></div>
            <span v-if="!isCollapsed">Rechnungen</span>
          </router-link>
        </nav>
      </div>

      <div v-if="!isCollapsed" class="resize-handle" @mousedown="startResize"></div>

      <div class="sidebar-bottom">
        <div class="live-status-card" :class="[connectionStatus, { 'compact': isCollapsed }]">
          <div v-if="!isCollapsed" class="status-indicator">
            <span class="pulse-dot"></span>
            <span class="status-label">LIVE SYNC</span>
          </div>
          <button class="reload-trigger" @click="manualRefresh" :class="{ 'spin-anim': isRefreshing }">
            <i class="fa-solid fa-arrows-rotate"></i>
          </button>
        </div>

        <div class="user-footer" :class="{ 'centered': isCollapsed }">
          <div class="user-row">
            <div class="avatar">A</div>
            <div v-if="!isCollapsed" class="user-info">
              <span class="user-name">{{ userName }}</span>
              <span class="user-role">Administrator</span>
            </div>
          </div>
          <button class="btn-logout-fancy" @click="handleLogout" :title="isCollapsed ? 'Abmelden' : ''">
            <i class="fa-solid fa-right-from-bracket"></i> 
            <span v-if="!isCollapsed">Jetzt Abmelden</span>
          </button>
        </div>
      </div>
    </aside>

    <main class="content-view">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userName = ref(localStorage.getItem('workly_user_name') || 'Lukas Admin')
const connectionStatus = ref('online')
const isRefreshing = ref(false)

const isCollapsed = ref(localStorage.getItem('sidebar_collapsed') === 'true')
const sidebarWidth = ref(parseInt(localStorage.getItem('sidebar_width')) || 280)

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sidebar_collapsed', isCollapsed.value)
}

function startResize(e) {
  e.preventDefault()
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', stopResize)
  document.body.classList.add('resizing-active')
}

function handleMouseMove(e) {
  if (e.clientX >= 200 && e.clientX <= 500) {
    sidebarWidth.value = e.clientX
  }
}

function stopResize() {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', stopResize)
  document.body.classList.remove('resizing-active')
  localStorage.setItem('sidebar_width', sidebarWidth.value)
}

function manualRefresh() {
  isRefreshing.value = true
  setTimeout(() => { 
    isRefreshing.value = false
    window.location.reload()
  }, 500)
}

function handleLogout() {
  localStorage.clear()
  router.push('/login')
}
</script>

<style scoped>
.app-shell { display: flex; height: 100vh; width: 100vw; background: #0b0e14; overflow: hidden; }

.sidebar {
  background: #13161c;
  border-right: 1px solid #1f2229;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 25px 15px;
  position: relative;
  transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
}

/* BRAND & BURGER */
.brand-row { display: flex; align-items: center; gap: 15px; margin-bottom: 35px; height: 40px; }
.brand-row.centered { justify-content: center; }
.collapse-btn { background: transparent; border: none; color: #707070; font-size: 20px; cursor: pointer; transition: 0.2s; }
.collapse-btn:hover { color: #00bcd4; }
.brand { font-size: 22px; font-weight: 900; color: #00bcd4; }

/* NAV */
.main-nav { display: flex; flex-direction: column; gap: 10px; }
.nav-item {
  display: flex; align-items: center; gap: 15px; color: #707070;
  text-decoration: none; padding: 12px; border-radius: 12px; font-weight: 500;
  white-space: nowrap; overflow: hidden; transition: 0.2s;
}
.icon-wrap { min-width: 24px; display: flex; justify-content: center; font-size: 18px; }
.nav-item.active { background: rgba(0, 188, 212, 0.1); color: #00bcd4; }
.nav-item:hover:not(.active) { background: rgba(255, 255, 255, 0.03); color: white; }

.sidebar-collapsed .nav-item { justify-content: center; padding: 12px 0; }

/* RESIZE */
.resize-handle { position: absolute; right: 0; top: 0; width: 4px; height: 100%; cursor: col-resize; z-index: 10; }
.resize-handle:hover { background: rgba(0, 188, 212, 0.4); }

/* SIDEBAR BOTTOM */
.sidebar-bottom { display: flex; flex-direction: column; gap: 20px; }

/* LIVE SYNC CARD */
.live-status-card {
  padding: 12px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;
  border: 1px solid transparent; transition: all 0.2s;
}
.live-status-card.online { background: rgba(255, 193, 7, 0.05); border-color: rgba(255, 193, 7, 0.2); color: #ffc107; }
.live-status-card.offline { background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.4); color: #ef4444; }

.live-status-card.compact { 
  justify-content: center; 
  background: transparent; 
  border: none; 
  padding: 10px 0; 
}

.status-indicator { display: flex; align-items: center; gap: 10px; }
.pulse-dot { width: 8px; height: 8px; background: currentColor; border-radius: 50%; animation: pulse 2s infinite; }
@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
.status-label { font-size: 10px; font-weight: 800; letter-spacing: 1px; }

.reload-trigger { background: transparent; border: none; color: inherit; cursor: pointer; font-size: 16px; opacity: 0.6; transition: 0.2s; }
.spin-anim { animation: spin 0.8s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* LOGOUT */
.user-footer { padding-top: 20px; border-top: 1px solid #1f2229; display: flex; flex-direction: column; gap: 15px; }
.user-footer.centered { align-items: center; }
.user-row { display: flex; align-items: center; gap: 12px; }
.avatar { width: 40px; height: 40px; min-width: 40px; background: #00bcd4; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #0b0e14; }
.user-name { color: white; font-size: 14px; font-weight: 600; }
.user-role { color: #505050; font-size: 11px; display: block; }

.btn-logout-fancy {
  width: 100%; background: rgba(239, 68, 68, 0.08); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.15); 
  padding: 14px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; 
  align-items: center; justify-content: center; gap: 12px; transition: 0.2s;
}
.btn-logout-fancy:hover { background: #ef4444; color: white; border-color: #ef4444; transform: translateY(-2px); }

.sidebar-collapsed .btn-logout-fancy { width: 44px; height: 44px; padding: 0; border-radius: 10px; }

.content-view { flex: 1; padding: 40px; overflow-y: auto; background: #0b0e14; }
</style>