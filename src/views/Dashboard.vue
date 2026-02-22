<script setup>
import { ref, onMounted } from 'vue'
import BaseTable from '../components/common/BaseTable.vue'
import BaseModal from '../components/common/BaseModal.vue'
import { useModal } from '../composables/useModal'

const columns = [
  { key: 'text', label: 'Benachrichtigung' },
  { key: 'source', label: 'Quelle' },
  { key: 'time', label: 'Zeitpunkt' },
  { key: 'actions', label: 'Status' }
]

const notifications = ref([])
const history = ref([])
const activeTab = ref('active')
const selectedNotification = ref(null)
const detailModal = useModal()
const pendingActions = ref({}) // Verwaltet Timer pro ID

async function loadData() {
  const token = localStorage.getItem('workly_token')
  const headers = { 'Authorization': `Bearer ${token}` }
  
  const [resNotif, resHist] = await Promise.all([
    fetch('http://localhost:8000/api/notifications', { headers }),
    fetch('http://localhost:8000/api/history', { headers })
  ])
  
  if (resNotif.ok) notifications.value = await resNotif.json()
  if (resHist.ok) history.value = await resHist.json()
}

function handleRowClick(item) {
  selectedNotification.value = item
  detailModal.open()
}

function triggerAction(item, event) {
  event.stopPropagation()
  const id = item.id

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
    
    // UI Update
    const movedItem = notifications.value.find(n => n.id === id)
    history.value.unshift({ ...movedItem, completedAt: new Date().toLocaleString() })
    notifications.value = notifications.value.filter(n => n.id !== id)
    delete pendingActions.value[id]
  }, 5000)
}

onMounted(loadData)
</script>

<template>
  <div class="zentrale-container">
    <div class="stats-header">
      <div class="stat-box green">Termine heute: 3</div>
      <div class="stat-box cyan">Umsatz Monat: 4.200 €</div>
      <div class="stat-box orange">Offene Rechnungen: 12</div>
    </div>

    <div class="tab-row">
      <button class="tab-btn" :class="{active: activeTab==='active'}" @click="activeTab='active'">
        Aktiv ({{ notifications.length }})
      </button>
      <button class="tab-btn" :class="{active: activeTab==='history'}" @click="activeTab='history'">
        Verlauf ({{ history.length }})
      </button>
    </div>

    <div class="content-card">
      <BaseTable 
        v-if="activeTab === 'active'" 
        :columns="columns" :data="notifications" @row-click="handleRowClick"
      >
        <template #col-text="{ value, item }">
          <span :class="{ 'is-pending': pendingActions[item.id] }">{{ value }}</span>
        </template>

        <template #col-actions="{ item }">
          <button 
            class="countdown-btn" 
            :class="{ 'wait-mode': pendingActions[item.id] }"
            @click.stop="triggerAction(item, $event)"
          >
            <span v-if="pendingActions[item.id]">Abbrechen</span>
            <span v-else>Erledigen</span>
            <div v-if="pendingActions[item.id]" class="progress-bar"></div>
          </button>
        </template>
      </BaseTable>

      <BaseTable 
        v-else 
        :columns="[{key:'text', label:'Erledigt'}, {key:'completedAt', label:'Zeitpunkt'}]" 
        :data="history" 
      />
    </div>

    <BaseModal v-if="detailModal.isOpen.value" v-model="detailModal.isOpen.value" title="Details">
      <div class="modal-detail-view" v-if="selectedNotification">
        <label>NACHRICHT</label>
        <p>{{ selectedNotification.text }}</p>
      </div>
      <template #footer>
        <button class="btn-cyan-close" @click="detailModal.close()">Schließen</button>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.zentrale-container { display: flex; flex-direction: column; gap: 25px; }
.stats-header { display: flex; gap: 20px; }
.stat-box { flex: 1; padding: 25px; border-radius: 16px; font-weight: 800; border: 1px solid rgba(255,255,255,0.05); }
.green { background: rgba(34, 197, 94, 0.08); color: #22c55e; }
.cyan { background: rgba(0, 188, 212, 0.08); color: #00bcd4; }
.orange { background: rgba(251, 146, 60, 0.08); color: #fb923c; }

.tab-row { display: flex; gap: 10px; border-bottom: 1px solid #1f2229; }
.tab-btn { background: transparent; border: none; color: #5c626d; padding: 12px 20px; cursor: pointer; font-weight: 700; border-bottom: 2px solid transparent; }
.tab-btn.active { color: #00bcd4; border-bottom-color: #00bcd4; }

.content-card { background: #13161c; border-radius: 20px; border: 1px solid #1f2229; padding: 25px; }

/* Countdown Button & Balken */
.countdown-btn {
  position: relative; background: rgba(0, 188, 212, 0.1); color: #00bcd4; border: 1px solid #00bcd4;
  padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 700; overflow: hidden; min-width: 140px;
}
.countdown-btn.wait-mode { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: #ef4444; }

.progress-bar {
  position: absolute; bottom: 0; left: 0; height: 3px; background: #ef4444;
  width: 100%; animation: shrink 5s linear forwards;
}

@keyframes shrink { from { width: 100%; } to { width: 0%; } }
.is-pending { opacity: 0.5; text-decoration: line-through; }
.btn-cyan-close { background: #00bcd4; color: #06080a; border: none; padding: 12px; border-radius: 10px; width: 100%; font-weight: 800; cursor: pointer; }
</style>