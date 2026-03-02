<template>
  <div class="accounting-container">
    <div class="page-header">
      <div class="title-group">
        <h1>Bilanz & Buchhaltung</h1>
        <p class="subtitle">Finanzübersicht & Doppelte Buchführung 2026</p>
      </div>

      <div class="header-action-buttons">
        <button class="action-btn cyan-btn" @click="showEntryModal = true">
          <i class="fa-solid fa-right-left"></i> Umbuchung / Eintrag
        </button>
        <button class="action-btn dark-btn" @click="showAccountModal = true">
          <i class="fa-solid fa-folder-plus"></i> Konto erstellen
        </button>
        <button class="action-btn dark-btn" @click="showBalanceTotalModal = true">
          <i class="fa-solid fa-scale-balanced"></i> Gesamt-Bilanz
        </button>
        
        <div class="export-dropdown-container">
          <button class="action-btn dark-btn" @click="toggleExportDropdown">
            <i class="fa-solid fa-file-export"></i> Export <i class="fa-solid fa-caret-down"></i>
          </button>
          <div v-if="exportMenuOpen" class="export-menu">
            <button @click="handleExport('pdf')"><i class="fa-solid fa-file-pdf"></i> Als PDF (.pdf)</button>
            <button @click="handleExport('excel')"><i class="fa-solid fa-file-excel"></i> Als Excel (.xlsx)</button>
            <button @click="handleExport('datev')"><i class="fa-solid fa-table"></i> DATEV-Format</button>
          </div>
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card cyan-card">
        <div class="stat-label">Aktiva (Soll)</div>
        <div class="stat-value">{{ formatCurrency(totalAssets) }}</div>
      </div>
      <div class="stat-card orange-card">
        <div class="stat-label">Passiva (Haben)</div>
        <div class="stat-value">{{ formatCurrency(totalLiabilities) }}</div>
      </div>
      <div class="stat-card" :class="isBalanced ? 'green-card' : 'red-card'">
        <div class="stat-label">Bilanz-Differenz</div>
        <div class="stat-value">{{ formatCurrency(diffAmount) }}</div>
      </div>
    </div>

    <div class="table-section-card">
      <BaseTable :columns="columns" :data="accounts" @row-click="goToAccountDetail">
        <template #col-code="{ value }"><div class="code-badge">{{ value }}</div></template>
        <template #col-type="{ value }"><span class="type-pill" :class="value.toLowerCase()">{{ value }}</span></template>
        <template #col-balance="{ value }">
          <span class="currency-text" :class="{ 'negative': value < 0 }">
            {{ formatCurrency(value) }}
          </span>
        </template>
      </BaseTable>
    </div>

    <TransactionModal 
      v-model="showEntryModal" 
      :accounts="accounts" 
      @save="handleSaveTransaction" 
    />

    <AccountCreateModal 
      v-model="showAccountModal" 
      @save="handleSaveAccount" 
    />

    <BalanceTotalModal 
      v-model="showBalanceTotalModal" 
      :accounts="accounts" 
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseTable from '../components/common/BaseTable.vue'
import TransactionModal from '../features/bilanz/components/TransactionModal.vue'
import AccountCreateModal from '../features/bilanz/components/AccountCreateModal.vue'
import BalanceTotalModal from '../features/bilanz/components/BalanceTotalModal.vue'

const router = useRouter()
const accounts = ref([])
const exportMenuOpen = ref(false)

// Sichtbarkeits-States für Modale
const showEntryModal = ref(false)
const showAccountModal = ref(false)
const showBalanceTotalModal = ref(false)

const columns = [
  { key: 'code', label: 'Konto' },
  { key: 'name', label: 'Bezeichnung' },
  { key: 'type', label: 'Art' },
  { key: 'balance', label: 'Saldo' }
]

// Zentrale Währungsformatierung
const formatCurrency = (val) => {
  return new Intl.NumberFormat('de-DE', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 2 
  }).format(val)
}

// Berechnete Werte für die Dashboard-Karten
const totalAssets = computed(() => accounts.value.filter(a => a.type === 'Aktiva').reduce((s, a) => s + (a.balance || 0), 0))
const totalLiabilities = computed(() => accounts.value.filter(a => a.type === 'Passiva').reduce((s, a) => s + Math.abs(a.balance || 0), 0))
const diffAmount = computed(() => totalAssets.value - totalLiabilities.value)
const isBalanced = computed(() => Math.abs(diffAmount.value) < 0.01)

function toggleExportDropdown() { exportMenuOpen.value = !exportMenuOpen.value; }
function goToAccountDetail(account) { router.push(`/bilanz/konto/${account.code}`); }

// Daten vom Server laden
async function loadData() {
  const token = localStorage.getItem('workly_token')
  try {
    const res = await fetch('http://127.0.0.1:8000/api/accounts', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (res.ok) accounts.value = await res.json()
  } catch (e) {
    console.error("Fehler beim Laden der Kontodaten")
  }
}

// Speichern einer Transaktion mit sofortigem UI-Update
async function handleSaveTransaction(data) {
  const token = localStorage.getItem('workly_token')
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/transactions`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (res.ok) {
      await loadData() // Erzwingt Aktualisierung der Liste und Karten
      showEntryModal.value = false
    }
  } catch (e) { console.error("Fehler beim Buchen") }
}

// Erstellen eines neuen Kontos mit sofortigem UI-Update
async function handleSaveAccount(data) {
  const token = localStorage.getItem('workly_token')
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/accounts`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, balance: 0 })
    })
    if (res.ok) {
      await loadData() // Zeigt das neue Konto sofort in der Tabelle an
      showAccountModal.value = false
    }
  } catch (e) { console.error("Fehler beim Erstellen") }
}

function handleExport(format) { exportMenuOpen.value = false; }

onMounted(loadData)
</script>

<style scoped>
/* Beibehaltung deines Designs */
.accounting-container { display: flex; flex-direction: column; gap: 30px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-end; }
.header-action-buttons { display: flex; gap: 12px; }
.action-btn { 
  display: flex; align-items: center; gap: 10px; padding: 14px 22px; 
  border-radius: 14px; border: 1px solid #1f2229; font-weight: 700; cursor: pointer; transition: 0.3s;
}
.cyan-btn { background: #00bcd4; color: #0b0e14; border: none; box-shadow: 0 4px 15px rgba(0, 188, 212, 0.2); }
.dark-btn { background: #13161c; color: white; }
.dark-btn:hover { border-color: #5c626d; background: #1a1e26; }

.export-dropdown-container { position: relative; }
.export-menu {
  position: absolute; top: calc(100% + 10px); right: 0; background: #13161c; 
  border: 1px solid #1f2229; border-radius: 14px; min-width: 200px; z-index: 100;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5); overflow: hidden;
}
.export-menu button {
  width: 100%; padding: 14px 20px; background: transparent; border: none; 
  color: #707070; text-align: left; cursor: pointer; display: flex; align-items: center; gap: 12px; font-weight: 600;
}
.export-menu button:hover { background: rgba(0, 188, 212, 0.1); color: #00bcd4; }

.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.stat-card { padding: 30px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.03); backdrop-filter: blur(10px); }
.stat-label { font-size: 11px; text-transform: uppercase; color: #5c626d; font-weight: 800; letter-spacing: 1px; }
.stat-value { font-size: 28px; font-weight: 900; margin-top: 10px; }
.cyan-card { background: linear-gradient(135deg, rgba(0, 188, 212, 0.1), rgba(0, 188, 212, 0.02)); color: #00bcd4; }
.orange-card { background: linear-gradient(135deg, rgba(251, 146, 60, 0.1), rgba(251, 146, 60, 0.02)); color: #fb923c; }
.green-card { background: rgba(34, 197, 94, 0.05); color: #22c55e; }
.red-card { background: rgba(239, 68, 68, 0.05); color: #ef4444; }

.table-section-card { background: #13161c; border-radius: 24px; border: 1px solid #1f2229; padding: 30px; }
.code-badge { 
  width: 48px; height: 32px; background: rgba(0, 188, 212, 0.1); 
  border-radius: 10px; display: flex; align-items: center; justify-content: center;
  color: #00bcd4; font-weight: 900; font-size: 13px;
}
.type-pill { padding: 4px 12px; border-radius: 8px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
.type-pill.aktiva { background: rgba(0, 188, 212, 0.1); color: #00bcd4; }
.type-pill.passiva { background: rgba(251, 146, 60, 0.1); color: #fb923c; }
.currency-text { font-weight: 800; }
.negative { color: #ef4444; }
</style>