<template>
  <div class="app-shell">
    <Sidebar 
      :isCollapsed="isCollapsed" 
      :sidebarWidth="sidebarWidth"
      @toggle="toggleSidebar"
      @start-resize="startResize"
    />

    <main class="content-view">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'

const isCollapsed = ref(localStorage.getItem('sidebar_collapsed') === 'true')
const sidebarWidth = ref(parseInt(localStorage.getItem('sidebar_width')) || 280)

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sidebar_collapsed', isCollapsed.value)
}

function startResize(e) {
  if (isCollapsed.value) return
  e.preventDefault()
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'col-resize'
}

function handleMouseMove(e) {
  if (e.clientX >= 200 && e.clientX <= 500) {
    sidebarWidth.value = e.clientX
  }
}

function stopResize() {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = 'default'
  localStorage.setItem('sidebar_width', sidebarWidth.value)
}
</script>

<style scoped>
.app-shell {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: #0b0e14;
  overflow: hidden;
}
.content-view {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
}
</style>