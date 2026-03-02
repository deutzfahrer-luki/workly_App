<template>
  <div class="account-detail-container luxe-layout">
    <div class="page-header">
      <div class="header-left">
        <button class="back-btn" @click="$router.push('/bilanz')">
          <i class="fa-solid fa-arrow-left"></i> Zurück zur Bilanz
        </button>
        <h1 class="account-title" v-if="!isLoading">{{ route.params.code }} - {{ accountName }}</h1>
        <h1 class="account-title" v-else>{{ route.params.code }} - Lädt...</h1>
      </div>
      
      <div class="balance-card">
        <span class="balance-label">Aktueller Saldo</span>
        <div class="balance-value" :class="{ 'negative': currentBalance < 0 }">
          {{ formatCurrency(currentBalance) }}
        </div>
      </div>
    </div>

    <div class="table-section-card">
      <BaseTable :columns="columns" :data="transactions">
        <template #col-date="{ value }"><span class="date-text">{{ value }}</span></template>
        
        <template #col-type="{ value }">
          <span class="type-badge" :class="value.toLowerCase()">{{ value }}</span>
        </template>
        
        <template #col-amount="{ value }">
          <span class="amount-text">{{ formatCurrency(value) }}</span>
        </template>
        
        <template #col-balance_after="{ value }">
          <span class="balance-running">{{ formatCurrency(value) }}</span>
        </template>
      </BaseTable>
      
      <div v-if="transactions.length === 0 && !isLoading" class="empty-state">
        Keine Buchungen für dieses Konto vorhanden.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import BaseTable from '../components/common/BaseTable.vue'
const route = useRoute()
const accountName = ref('')
const currentBalance = ref(0)
const transactions = ref([])
const isLoading = ref(true)

const columns = [
  { key: 'date', label: 'DATUM' },
  { key: 'text', label: 'BUCHUNGSTEXT' },
  { key: 'type', label: 'SOLL/HABEN' },
  { key: 'amount', label: 'BETRAG' },
  { key: 'balance_after', label: 'SALDO LFD.' }
]

const formatCurrency = (val) => {
  return new Intl.NumberFormat('de-DE', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 2 
  }).format(val)
}

// Lädt die echten Transaktionsdaten vom Backend
async function loadAccountData() {
  isLoading.value = true
  const token = localStorage.getItem('workly_token')
  const code = route.params.code
  
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/accounts/${code}/transactions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (res.ok) {
      const data = await res.json()
      accountName.value = data.name
      currentBalance.value = data.current_balance
      // Backend sendet 'transactions' Liste
      transactions.value = data.transactions || []
    }
  } catch (err) {
    console.error("Fehler beim Laden des Kontenverlaufs:", err)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadAccountData)

// Falls sich der URL-Parameter ändert, Daten neu laden
watch(() => route.params.code, loadAccountData)
</script>

<style scoped>
.luxe-layout { padding: 40px 60px; display: flex; flex-direction: column; gap: 40px; }

.page-header { display: flex; justify-content: space-between; align-items: center; }

.back-btn { 
  background: rgba(255,255,255,0.05); border: 1px solid #1f2229; color: #5c626d;
  padding: 10px 20px; border-radius: 12px; cursor: pointer; margin-bottom: 15px;
  display: flex; align-items: center; gap: 10px; font-weight: 700; transition: 0.2s;
}
.back-btn:hover { color: #00bcd4; border-color: #00bcd4; background: rgba(0, 188, 212, 0.05); }

.account-title { font-size: 32px; font-weight: 900; color: white; letter-spacing: -1px; }

.balance-card { 
  background: #13161c; padding: 25px 40px; border-radius: 20px; 
  border: 1.5px solid #1f2229; text-align: right;
}
.balance-label { font-size: 11px; color: #5c626d; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
.balance-value { font-size: 28px; font-weight: 900; color: #00bcd4; margin-top: 5px; }
.balance-value.negative { color: #ef4444; }

.table-section-card { 
  background: #13161c; border-radius: 24px; border: 1.5px solid #1f2229; 
  padding: 40px; min-height: 400px;
}

/* Badges für Soll und Haben */
.type-badge { padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
.type-badge.soll { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
.type-badge.haben { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

.date-text { color: #5c626d; font-weight: 600; }
.amount-text { font-weight: 800; color: #fff; }
.balance-running { font-weight: 800; color: #00bcd4; opacity: 0.8; }

.empty-state { text-align: center; color: #454b54; padding: 100px 0; font-weight: 600; font-style: italic; }
</style>