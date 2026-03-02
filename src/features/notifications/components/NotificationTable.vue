<template>
  <div class="table-container-inner">
    <div class="table-header-row">
      <div class="title-area">
        <h2>Benachrichtigungen</h2>
        <span class="sync-badge" :class="{ 'syncing': isSyncing }">LIVE</span>
      </div>
      <button class="fancy-filter-btn" @click="showFilterModal = true">
        <i class="fa-solid fa-filter"></i>
        <span>Filter</span>
      </button>
    </div>

    <div class="table-card-wrapper">
      <BaseTable :columns="columns" :data="filteredData" @row-click="handleRowClick">
        <template #col-text="{ value, item }">
          <span class="main-msg" :class="{ 'text-done': pendingActions[item.id] }">
            {{ value }}
          </span>
        </template>
        <template #col-source="{ value }">
          <span class="badge-source">{{ value }}</span>
        </template>
        <template #col-actions="{ item }">
          <div class="action-cell">
            <button 
              class="status-action-btn" 
              :class="{ 'is-completing': pendingActions[item.id] }"
              @click.stop="triggerAction(item.id)"
            >
              <i v-if="pendingActions[item.id]" class="fa-solid fa-spinner fa-spin"></i>
              <i v-else class="fa-regular fa-circle-check"></i>
              <span>{{ pendingActions[item.id] ? 'Abbrechen (2s)' : 'Erledigen' }}</span>
              <div v-if="pendingActions[item.id]" class="progress-bar-mini fast"></div>
            </button>
          </div>
        </template>
      </BaseTable>
    </div>

    <BaseModal v-if="showDetailModal" v-model="showDetailModal" title="Details" width="550px">
      <div class="detail-body" v-if="selectedNotification">
        <label>Inhalt</label>
        <p class="highlight-msg">{{ selectedNotification.text }}</p>
      </div>
      <template #footer>
        <button class="btn-cyan-done" @click="showDetailModal = false">Schließen</button>
      </template>
    </BaseModal>

    <FilterModal 
      v-model="showFilterModal" v-model:filters="filters" 
      :filterConfig="filterConfig" :getUniqueValues="getUniqueValues" @reset="resetFilters" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BaseTable from './common/BaseTable.vue'
import BaseModal from './common/BaseModal.vue'
import FilterModal from './common/FilterModal.vue'
import { useDataTable } from '../composables/useDataTable'

const columns = [
  { key: 'text', label: 'Benachrichtigung' },
  { key: 'source', label: 'Quelle' },
  { key: 'time', label: 'Zeit' },
  { key: 'actions', label: 'Status' }
]

const notifications = ref([])
const pendingActions = ref({}) 
const showDetailModal = ref(false)
const selectedNotification = ref(null)

const { filters, filteredData, getUniqueValues, resetFilters, showFilterModal } = useDataTable(notifications)

async function fetchNotifications() {
  const token = localStorage.getItem('workly_token')
  const res = await fetch('http://localhost:8000/api/notifications', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (res.ok) notifications.value = await res.json()
}

function handleRowClick(item) {
  selectedNotification.value = item
  showDetailModal.value = true
}

function triggerAction(id) {
  if (pendingActions.value[id]) {
    clearTimeout(pendingActions.value[id])
    delete pendingActions.value[id]
    return
  }

  pendingActions.value[id] = setTimeout(async () => {
    const token = localStorage.getItem('workly_token')
    await fetch(`http://localhost:8000/api/notifications/${id}`, { 
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    notifications.value = notifications.value.filter(n => n.id !== id)
    delete pendingActions.value[id]
  }, 2000)
}

onMounted(fetchNotifications)
</script>

<style scoped>
/* Identisch mit InvoiceTable für Konsistenz */
.status-action-btn {
  position: relative; overflow: hidden; background: rgba(0, 188, 212, 0.05);
  border: 1px solid #1c2128; color: #00bcd4; padding: 8px 16px; border-radius: 8px;
  cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 700; transition: 0.3s;
}
.status-action-btn.is-completing { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: #ef4444; }
.progress-bar-mini { position: absolute; bottom: 0; left: 0; height: 3px; background: #ef4444; width: 100%; }
.progress-bar-mini.fast { animation: shrink 2s linear forwards; }
@keyframes shrink { from { width: 100%; } to { width: 0%; } }
.text-done { text-decoration: line-through; opacity: 0.5; }
/* ... Restliche Styles beibehalten ... */
</style>