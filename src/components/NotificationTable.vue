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
      <BaseTable 
        :columns="columns" 
        :data="filteredData" 
        @row-click="handleRowClick"
      >
        <template #col-text="{ value, item }">
          <span class="main-msg" :class="{ 'text-done': pendingDone.includes(item.id) }">
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
              :class="{ 'is-completing': pendingDone.includes(item.id) }"
              @click.stop="triggerDone(item.id)"
            >
              <i v-if="pendingDone.includes(item.id)" class="fa-solid fa-spinner fa-spin"></i>
              <i v-else class="fa-regular fa-circle-check"></i>
              <span>{{ pendingDone.includes(item.id) ? 'Wird erledigt...' : 'Erledigen' }}</span>
            </button>
          </div>
        </template>
      </BaseTable>
    </div>

    <BaseModal 
      v-if="showDetailModal" 
      v-model="showDetailModal" 
      title="Benachrichtigungs-Details" 
      width="550px"
    >
      <div class="detail-body" v-if="selectedNotification">
        <div class="info-group">
          <label>Inhalt</label>
          <p class="highlight-msg">{{ selectedNotification.text }}</p>
        </div>
        <div class="info-grid">
          <div class="info-group">
            <label>Quelle</label>
            <p>{{ selectedNotification.source }}</p>
          </div>
          <div class="info-group">
            <label>Empfänger</label>
            <p>{{ selectedNotification.recipient }}</p>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="modal-footer-split">
          <button class="btn-cyan-done" @click="showDetailModal = false">Schließen</button>
        </div>
      </template>
    </BaseModal>

    <FilterModal 
      v-model="showFilterModal" 
      v-model:filters="filters" 
      :filterConfig="filterConfig" 
      :getUniqueValues="getUniqueValues" 
      @reset="resetFilters" 
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
  { key: 'actions', label: 'Status' } // Die Spalte für den Button
]

const notifications = ref([])
const pendingDone = ref([]) // Liste für IDs, die gerade "erledigt" werden
const isSyncing = ref(false)
const showDetailModal = ref(false)
const selectedNotification = ref(null)

const { filters, filteredData, getUniqueValues, resetFilters, showFilterModal } = useDataTable(notifications)

async function fetchNotifications() {
  try {
    const res = await fetch('http://localhost:8000/api/notifications')
    if (res.ok) notifications.value = await res.json()
  } catch (e) { console.error(e) }
}

// Zeile anklicken -> Modal
function handleRowClick(item) {
  selectedNotification.value = item
  showDetailModal.value = true
}

// Button anklicken -> Delay -> Löschen
function triggerDone(id) {
  if (pendingDone.value.includes(id)) return
  
  // 1. Markieren im Frontend
  pendingDone.value.push(id)
  
  // 2. 2 Sekunden warten
  setTimeout(async () => {
    // 3. Aus Frontend löschen
    notifications.value = notifications.value.filter(n => n.id !== id)
    pendingDone.value = pendingDone.value.filter(pid => pid !== id)
    
    // 4. API Call
    try {
      await fetch(`http://localhost:8000/api/notifications/${id}`, { method: 'DELETE' })
    } catch (e) { console.error("API Fehler beim Löschen") }
  }, 2000)
}

onMounted(fetchNotifications)
</script>

<style scoped>
.table-card-wrapper { background: #13161c; border: 1px solid #1f2229; border-radius: 16px; padding: 20px; }

/* Status Button Style */
.status-action-btn {
  background: rgba(0, 188, 212, 0.05);
  border: 1px solid #1c2128;
  color: #00bcd4;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.3s ease;
}

.status-action-btn:hover {
  background: rgba(0, 188, 212, 0.15);
  border-color: #00bcd4;
}

.status-action-btn.is-completing {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border-color: #22c55e;
  cursor: default;
}

.text-done {
  text-decoration: line-through;
  opacity: 0.5;
  transition: all 0.5s ease;
}

/* Modal Typography */
.detail-body { display: flex; flex-direction: column; gap: 20px; padding: 10px 0; }
.highlight-msg { font-size: 20px; font-weight: 600; color: white; }
.info-group label { font-size: 10px; color: #5c626d; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 5px; }

.btn-cyan-done { background: #00bcd4; color: #0b0e14; border: none; padding: 12px 30px; border-radius: 10px; font-weight: 800; cursor: pointer; }
.badge-source { background: rgba(0, 188, 212, 0.1); color: #00bcd4; padding: 4px 10px; border-radius: 6px; font-size: 12px; }
</style>