<template>
  <BaseModal v-model="isOpen" width="900px" title="Gesamt-Bilanz Übersicht">
    <div class="modal-body-luxe">
      <div class="balance-summary-bar">
        <div class="summary-item">
          <span class="summary-label">BILANZSUMME</span>
          <span class="summary-value">{{ formatCurrency(totalSum) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">DIFFERENZ</span>
          <span class="summary-value" :class="{ 'text-red': difference !== 0 }">
            {{ formatCurrency(difference) }}
          </span>
        </div>
      </div>

      <div class="bilanz-split-grid">
        <div class="bilanz-column aktiva">
          <div class="column-header">
            <i class="fa-solid fa-building-columns"></i>
            <h3>AKTIVA (SOLL)</h3>
          </div>
          <div class="accounts-list">
            <div v-for="acc in aktivaAccounts" :key="acc.id" class="account-entry">
              <span class="acc-info">
                <span class="acc-code">{{ acc.code }}</span>
                <span class="acc-name">{{ acc.name }}</span>
              </span>
              <span class="acc-balance">{{ formatCurrency(acc.balance) }}</span>
            </div>
          </div>
          <div class="column-footer">
            <span>Summe Aktiva</span>
            <span class="footer-value">{{ formatCurrency(totalAktiva) }}</span>
          </div>
        </div>

        <div class="bilanz-column passiva">
          <div class="column-header">
            <i class="fa-solid fa-hand-holding-dollar"></i>
            <h3>PASSIVA (HABEN)</h3>
          </div>
          <div class="accounts-list">
            <div v-for="acc in passivaAccounts" :key="acc.id" class="account-entry">
              <span class="acc-info">
                <span class="acc-code">{{ acc.code }}</span>
                <span class="acc-name">{{ acc.name }}</span>
              </span>
              <span class="acc-balance">{{ formatCurrency(acc.balance) }}</span>
            </div>
          </div>
          <div class="column-footer">
            <span>Summe Passiva</span>
            <span class="footer-value">{{ formatCurrency(totalPassiva) }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer-luxe">
        <button class="btn-luxe-ghost" @click="isOpen = false">Schließen</button>
        <button class="btn-luxe-primary" @click="exportPDF">
          <i class="fa-solid fa-file-pdf"></i>
          <span>Als PDF exportieren</span>
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import BaseModal from '../../../components/common/BaseModal.vue'
const props = defineProps({
  modelValue: Boolean,
  accounts: Array
})
const emit = defineEmits(['update:modelValue'])

const isOpen = ref(props.modelValue)

// Filterung der Konten
const aktivaAccounts = computed(() => props.accounts.filter(a => a.type === 'Aktiva'))
const passivaAccounts = computed(() => props.accounts.filter(a => a.type === 'Passiva'))

// Berechnungen
const totalAktiva = computed(() => aktivaAccounts.value.reduce((sum, a) => sum + a.balance, 0))
const totalPassiva = computed(() => passivaAccounts.value.reduce((sum, a) => sum + Math.abs(a.balance), 0))
const totalSum = computed(() => Math.max(totalAktiva.value, totalPassiva.value))
const difference = computed(() => totalAktiva.value - totalPassiva.value)

const formatCurrency = (val) => {
  return new Intl.NumberFormat('de-DE', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 2 
  }).format(val)
}

const exportPDF = () => {
  alert('PDF Export wird gestartet...')
}

watch(() => props.modelValue, (v) => isOpen.value = v)
watch(isOpen, (v) => emit('update:modelValue', v))
</script>

<style scoped>
.modal-body-luxe { padding: 30px 50px 50px 50px; display: flex; flex-direction: column; gap: 30px; }

/* Summary Bar oben */
.balance-summary-bar {
  display: flex; gap: 20px; background: #0b0e14; border: 1.5px solid #1f2229;
  border-radius: 20px; padding: 20px 35px; justify-content: space-between;
}
.summary-item { display: flex; flex-direction: column; gap: 5px; }
.summary-label { font-size: 10px; font-weight: 900; color: #5c626d; letter-spacing: 2px; }
.summary-value { font-size: 20px; font-weight: 900; color: #00bcd4; }

/* Bilanz Grid */
.bilanz-split-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
.bilanz-column { 
  display: flex; flex-direction: column; background: #0b0e14; 
  border: 1.5px solid #1f2229; border-radius: 24px; overflow: hidden;
}

.column-header { 
  padding: 25px; background: rgba(255, 255, 255, 0.02); 
  border-bottom: 1px solid #1f2229; display: flex; align-items: center; gap: 15px;
}
.column-header i { font-size: 20px; color: #00bcd4; }
.column-header h3 { font-size: 14px; font-weight: 900; letter-spacing: 1.5px; margin: 0; }
.aktiva .column-header h3 { color: #00bcd4; }
.passiva .column-header h3 { color: #fbbf24; }

.accounts-list { flex: 1; padding: 10px 0; min-height: 250px; }
.account-entry { 
  display: flex; justify-content: space-between; padding: 12px 25px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.02); transition: 0.2s;
}
.account-entry:hover { background: rgba(0, 188, 212, 0.05); }

.acc-info { display: flex; gap: 15px; align-items: center; }
.acc-code { font-family: monospace; color: #5c626d; font-weight: 700; font-size: 13px; }
.acc-name { color: #e2e8f0; font-weight: 600; font-size: 14px; }
.acc-balance { font-weight: 700; color: #fff; font-size: 14px; }

.column-footer { 
  padding: 20px 25px; background: rgba(255, 255, 255, 0.03); 
  border-top: 1.5px solid #1f2229; display: flex; justify-content: space-between;
  align-items: center; font-weight: 900; text-transform: uppercase; font-size: 12px;
}
.footer-value { font-size: 16px; color: #fff; }

/* Buttons */
.modal-footer-luxe { display: flex; gap: 20px; padding: 0 50px 50px 50px; }
.btn-luxe-primary {
  flex: 2; background: #00bcd4; color: #0b0e14; border: none; padding: 18px;
  border-radius: 14px; font-weight: 900; cursor: pointer; display: flex;
  justify-content: center; align-items: center; gap: 12px; transition: 0.3s;
}
.btn-luxe-primary:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0, 188, 212, 0.3); }
.btn-luxe-ghost { flex: 1; background: transparent; border: 2px solid #1f2229; color: #5c626d; border-radius: 14px; font-weight: 800; cursor: pointer; }

.text-red { color: #ef4444 !important; }
</style>