<template>
  <div class="invoice-container">
    <div class="page-header">
      <div class="title-group">
        <h1>Rechnungsübersicht</h1>
        <p class="subtitle">Verwalten und archivieren Sie Ihre Belege 2026</p>
      </div>

      <div class="header-actions">
        <div class="search-box">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Kunde, Betrag oder Nr. suchen..." 
          />
        </div>
        
        <button 
          class="luxe-filter-btn" 
          :class="{ 'has-active-filters': activeFilterCount > 0 }"
          @click="showFilterModal = true"
        >
          <div class="btn-content">
            <i class="fa-solid fa-filter"></i>
            <span>Filter</span>
            <span v-if="activeFilterCount > 0" class="filter-count-badge">{{ activeFilterCount }}</span>
          </div>
        </button>

        <button class="add-invoice-btn" @click="showAddModal = true">
          <i class="fa-solid fa-plus"></i>
          <span>Rechnung hinzufügen</span>
        </button>
      </div>
    </div>

    <div class="tab-row">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'offen' }" 
        @click="activeTab = 'offen'"
      >
        Offen ({{ invoices.filter(i => i.status === 'Offen').length }})
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'bezahlt' }" 
        @click="activeTab = 'bezahlt'"
      >
        Bezahlt ({{ invoices.filter(i => i.status === 'Bezahlt').length }})
      </button>
    </div>

    <div class="table-card">
      <BaseTable 
        :columns="columns" 
        :data="filteredInvoices" 
        @row-click="handleRowClick"
      >
        <template #col-text="{ value, item }">
          <span :class="{ 'text-done': pendingPay[item.id] }">
            <i class="fa-solid fa-file-pdf pdf-red-icon"></i> {{ value }}
          </span>
        </template>
        
        <template #col-status="{ value }">
          <span class="status-badge" :class="value.toLowerCase()">{{ value }}</span>
        </template>
        
        <template #col-actions="{ item }">
          <div class="action-cell">
            <button 
              v-if="item.status === 'Offen'"
              class="status-action-btn" 
              :class="{ 'is-waiting': pendingPay[item.id] }"
              @click.stop="triggerPay(item, $event)"
            >
              <i v-if="pendingPay[item.id]" class="fa-solid fa-spinner fa-spin"></i>
              <i v-else class="fa-solid fa-receipt"></i>
              <span>{{ pendingPay[item.id] ? 'Abbrechen (5s)' : 'Bezahlen' }}</span>
              <div v-if="pendingPay[item.id]" class="progress-bar-mini slow"></div>
            </button>
            <span v-else class="paid-info">
              <i class="fa-solid fa-check-double"></i> Bezahlt am {{ item.paidAt || item.time }}
            </span>
          </div>
        </template>
      </BaseTable>
    </div>

    <FilterModal 
      v-model="showFilterModal"
      v-model:filters="filters"
      :filterConfig="filterConfig"
      :getUniqueValues="getUniqueValues"
      @reset="resetFilters"
    />

    <BaseModal v-model="showAddModal" title="Neue Rechnung erfassen" width="700px">
      <div class="empty-modal-content">
        <i class="fa-solid fa-file-circle-plus"></i>
        <p>Hier können Sie bald Rechnungen hochladen.</p>
      </div>
    </BaseModal>

    <BaseModal 
      v-if="detailModal.isOpen.value"
      v-model="detailModal.isOpen.value" 
      :title="selectedItem?.text?.split(':')[0] || 'Rechnungsdetails'" 
      width="1400px"
    >
      <div class="split-view">
        <div class="pdf-viewer-pane">
          <div v-if="isPdfLoading" class="loader-box">
            <i class="fa-solid fa-circle-notch fa-spin"></i>
            <p>PDF wird geladen...</p>
          </div>
          <iframe 
            v-else-if="pdfUrl" 
            id="pdf-frame" 
            :src="`${pdfUrl}#toolbar=0`" 
            class="pdf-frame"
          ></iframe>
        </div>

        <div class="details-pane">
          <div class="data-group">
            <label>Empfänger</label>
            <p>{{ selectedItem?.recipient }}</p>
          </div>
          <div class="data-group">
            <label>Betrag</label>
            <p class="huge-price">{{ selectedItem?.amount }}</p>
          </div>

          <div class="spacer"></div>

          <div class="action-stack">
            <button class="btn-cyan-main" @click="printPdf">
              <i class="fa-solid fa-print"></i> Jetzt Drucken
            </button>
            
            <div class="btn-grid-half">
              <button class="btn-dark-sub" @click="downloadPdf">
                <i class="fa-solid fa-download"></i> Download
              </button>
              <button class="btn-dark-sub" @click="window.open(pdfUrl, '_blank')">
                <i class="fa-solid fa-external-link"></i> Neuer Tab
              </button>
            </div>

            <button class="btn-delete-blue" @click="handleDelete">
              <i class="fa-solid fa-trash-can"></i> Rechnung löschen
            </button>
            
            <p class="print-hint">Tipp: <b>Strg + P</b> druckt direkt.</p>
          </div>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
// Korrigiere die Pfade in InvoiceTable.vue:
import BaseTable from '../../../components/common/BaseTable.vue'   // Drei Ebenen hoch
import BaseModal from '../../../components/common/BaseModal.vue'   // Drei Ebenen hoch
import FilterModal from '../../../components/common/FilterModal.vue' // Drei Ebenen hoch
import { useModal } from '../../../composables/useModal'
import { usePdfViewer } from '../../../composables/usePdfViewer'
import { useDataTable } from '../../../composables/useDataTable'



const showAddModal = ref(false) // State für den neuen Button

const columns = [
  { key: 'text', label: 'Beleg' },
  { key: 'recipient', label: 'Kunde' },
  { key: 'amount', label: 'Betrag' },
  { key: 'actions', label: 'Status-Aktion' }
]

const filterConfig = [
  { key: 'source', label: 'Quelle' }
]

const invoices = ref([])
const activeTab = ref('offen')
const pendingPay = ref({})
const selectedItem = ref(null)

const { 
  searchQuery, 
  filters, 
  showFilterModal, 
  getUniqueValues, 
  activeFilterCount, 
  resetFilters,
  filteredData 
} = useDataTable(invoices)

const filteredInvoices = computed(() => {
  return filteredData.value.filter(inv => inv.status.toLowerCase() === activeTab.value)
})

const detailModal = useModal()
const { loadPdf, pdfUrl, isPdfLoading } = usePdfViewer()

async function loadInvoices() {
  const token = localStorage.getItem('workly_token')
  const res = await fetch('http://localhost:8000/api/invoices', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (res.ok) invoices.value = await res.json()
}

function triggerPay(inv, event) {
  event.stopPropagation()
  if (pendingPay.value[inv.id]) {
    clearTimeout(pendingPay.value[inv.id])
    delete pendingPay.value[inv.id]
    return
  }

  pendingPay.value[inv.id] = setTimeout(async () => {
    try {
      const token = localStorage.getItem('workly_token')
      await fetch(`http://localhost:8000/api/invoices/${inv.id}/pay`, { 
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      inv.status = 'Bezahlt'
      inv.paidAt = new Date().toLocaleDateString()
    } catch (e) { console.error("Fehler beim Bezahlen") }
    delete pendingPay.value[inv.id]
  }, 5000)
}

async function handleRowClick(inv) {
  selectedItem.value = inv
  detailModal.open()
  await loadPdf(inv.id)
}

function printPdf() {
  const frame = document.getElementById('pdf-frame')?.contentWindow
  if (frame) { frame.focus(); frame.print(); }
}

function downloadPdf() {
  const link = document.createElement('a')
  link.href = pdfUrl.value
  link.download = `Rechnung_${selectedItem.value.id}.pdf`
  link.click()
}

function handleDelete() {
  if (confirm('Rechnung wirklich löschen?')) {
    detailModal.close()
  }
}

const handleKeyDown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'p' && detailModal.isOpen.value) {
    e.preventDefault(); printPdf();
  }
}

onMounted(() => {
  loadInvoices()
  window.addEventListener('keydown', handleKeyDown)
})
onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))
</script>

<style scoped>
.invoice-container { display: flex; flex-direction: column; gap: 25px; }
.page-header { display: flex; justify-content: space-between; align-items: center; }
.page-header h1 { color: white; font-size: 24px; font-weight: 700; }
.subtitle { font-size: 13px; color: #5c626d; margin-top: 5px; }

.header-actions { display: flex; gap: 15px; align-items: center; }
.search-box { position: relative; display: flex; align-items: center; }
.search-box i { position: absolute; left: 15px; color: #505050; }
.search-box input { 
  background: #13161c; border: 1px solid #1f2229; color: white; padding: 12px 15px 12px 40px; 
  border-radius: 12px; width: 280px; outline: none; transition: 0.2s;
}
.search-box input:focus { border-color: #00bcd4; }

/* VERBESSERTER FILTER BUTTON */
.luxe-filter-btn {
  background: #13161c; border: 1.5px solid #1f2229; color: white;
  padding: 12px 20px; border-radius: 12px; cursor: pointer; transition: 0.3s;
}
.luxe-filter-btn:hover { border-color: #5c626d; background: #1a1e26; }
.luxe-filter-btn.has-active-filters { border-color: #fb923c; color: #fb923c; }
.btn-content { display: flex; align-items: center; gap: 10px; font-weight: 700; position: relative; }
.filter-count-badge {
  background: #fb923c; color: #0b0e14; font-size: 10px; width: 18px; height: 18px;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
}

/* NEUER HINZUFÜGEN BUTTON */
.add-invoice-btn {
  background: #00bcd4; color: #0b0e14; border: none; padding: 12px 22px;
  border-radius: 12px; font-weight: 800; display: flex; align-items: center; gap: 10px;
  cursor: pointer; transition: 0.3s; box-shadow: 0 4px 15px rgba(0, 188, 212, 0.2);
}
.add-invoice-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 188, 212, 0.3); }

.tab-row { display: flex; gap: 15px; border-bottom: 1px solid #1f2229; margin-top: 10px; }
.tab-btn { 
  background: transparent; border: none; color: #5c626d; padding: 15px 5px; 
  cursor: pointer; font-weight: 700; border-bottom: 2px solid transparent; transition: 0.2s;
}
.tab-btn.active { color: #00bcd4; border-bottom-color: #00bcd4; }

.table-card { background: #13161c; border-radius: 20px; border: 1px solid #1f2229; padding: 30px; }

.status-action-btn {
  position: relative; overflow: hidden; background: rgba(0, 188, 212, 0.05); border: 1px solid #1c2128; color: #00bcd4;
  padding: 8px 16px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 8px;
  font-weight: 700; font-size: 13px; transition: 0.3s;
}
.status-action-btn:hover { background: rgba(0, 188, 212, 0.15); border-color: #00bcd4; }
.status-action-btn.is-waiting { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: #ef4444; }

.progress-bar-mini { position: absolute; bottom: 0; left: 0; height: 3px; background: #ef4444; width: 100%; }
.progress-bar-mini.slow { animation: shrink 5s linear forwards; }
@keyframes shrink { from { width: 100%; } to { width: 0%; } }

.text-done { text-decoration: line-through; opacity: 0.5; transition: 0.5s; }
.paid-info { color: #22c55e; font-weight: 700; font-size: 13px; display: flex; align-items: center; gap: 6px; }
.pdf-red-icon { color: #ef4444; margin-right: 10px; }

.empty-modal-content { 
  padding: 60px; text-align: center; color: #454b54; display: flex; 
  flex-direction: column; align-items: center; gap: 20px; 
}
.empty-modal-content i { font-size: 48px; color: #1f2229; }

.split-view { display: flex; width: 100%; height: 100%; min-height: 75vh; }
.pdf-viewer-pane { flex: 1.5; background: #0b0e14; margin: 25px; border-radius: 12px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.pdf-frame { width: 100%; height: 100%; border: none; }
.details-pane { width: 420px; background: #13161c; border-left: 1px solid #1f2229; padding: 40px; display: flex; flex-direction: column; }

.data-group { margin-bottom: 25px; }
.data-group label { font-size: 11px; text-transform: uppercase; color: #707070; display: block; margin-bottom: 8px; }
.huge-price { font-size: 36px; font-weight: 800; color: white; }
.spacer { flex: 1; }

.action-stack { display: flex; flex-direction: column; gap: 12px; }
.btn-cyan-main { background: #00bcd4; color: #0b0e14; border: none; padding: 18px; border-radius: 14px; font-weight: 800; cursor: pointer; }
.btn-grid-half { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.btn-dark-sub { background: #1f2229; border: 1px solid #2d3139; color: white; padding: 12px; border-radius: 10px; cursor: pointer; }
.btn-delete-blue { background: rgba(0, 188, 212, 0.1); color: #00bcd4; border: 1px solid rgba(0, 188, 212, 0.3); padding: 15px; border-radius: 10px; cursor: pointer; font-weight: 600; display: flex; justify-content: center; gap: 10px; }
.print-hint { font-size: 11px; color: #505050; text-align: center; margin-top: 5px; }
</style>