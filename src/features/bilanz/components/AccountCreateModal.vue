<template>
  <BaseModal v-model="isOpen" width="850px" class="luxe-modal-wrapper">
    <div class="luxe-header-centered">
      <span class="eyebrow-label">SYSTEM / SETUP</span>
      <h2 class="hero-modal-title">Neues Konto registrieren</h2>
      <p class="hero-modal-desc">Erweitern Sie Ihren Kontenrahmen für die doppelte Buchführung 2026.</p>
    </div>

    <div class="luxe-form-container">
      <div class="luxe-input-section">
        <label class="luxe-field-label">Wie soll das Konto heißen?</label>
        <div class="luxe-input-box">
          <i class="fa-solid fa-signature"></i>
          <input 
            v-model="form.name" 
            type="text" 
            placeholder="z.B. Erlöse 19% MwSt oder Fuhrpark" 
          />
        </div>
      </div>

      <div class="luxe-grid-row">
        <div class="luxe-input-section">
          <label class="luxe-field-label">SKR04 Kontonummer</label>
          <div class="luxe-input-box small-box">
            <i class="fa-solid fa-hashtag"></i>
            <input v-model="form.code" type="text" placeholder="0000" />
          </div>
        </div>

        <div class="luxe-input-section">
          <label class="luxe-field-label">Bilanz-Zuordnung</label>
          <div class="luxe-toggle-group">
            <button :class="{ 'active': form.type === 'Aktiva' }" @click="form.type = 'Aktiva'">
              <i class="fa-solid fa-plus-circle"></i> Aktiva
            </button>
            <button :class="{ 'active': form.type === 'Passiva' }" @click="form.type = 'Passiva'">
              <i class="fa-solid fa-minus-circle"></i> Passiva
            </button>
          </div>
        </div>
      </div>

      <div class="luxe-status-card">
        <div class="visualizer-ring">
          <div class="inner-value">0,00<span>€</span></div>
        </div>
        <div class="visualizer-info">
          <span class="status-badge">BEREIT ZUR ANLAGE</span>
          <p>Das Konto wird als SKR04-konformes Sachkonto in Ihrer Bilanz angelegt.</p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="luxe-footer-actions">
        <button class="luxe-btn-ghost" @click="isOpen = false">Abbrechen</button>
        <button class="luxe-btn-primary" @click="submit">
          <span>Konto jetzt erstellen</span>
          <i class="fa-solid fa-arrow-right-long"></i>
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import BaseModal from '../../../components/common/BaseModal.vue'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue', 'save'])

const isOpen = ref(props.modelValue)
const form = ref({ name: '', code: '', type: 'Aktiva' })

watch(() => props.modelValue, (v) => isOpen.value = v)
watch(isOpen, (v) => emit('update:modelValue', v))

const submit = () => {
  if (form.value.name && form.value.code) {
    emit('save', { ...form.value })
    form.value = { name: '', code: '', type: 'Aktiva' }
    isOpen.value = false
  }
}
</script>

<style scoped>
/* Radikales Umdenken beim Layout */
.luxe-form-container {
  display: flex;
  flex-direction: column;
  gap: 50px;
  padding: 20px 80px 80px 80px; /* Massiver Freiraum zum Rand */
}

.luxe-header-centered {
  text-align: center;
  padding: 60px 80px 20px 80px;
}

.eyebrow-label { font-size: 11px; font-weight: 900; color: #5c626d; letter-spacing: 4px; }
.hero-modal-title { font-size: 38px; font-weight: 900; color: #00bcd4; margin: 15px 0; }
.hero-modal-desc { color: #454b54; font-size: 14px; }

.luxe-field-label { 
  display: block; font-size: 12px; font-weight: 800; color: #5c626d; 
  text-transform: uppercase; margin-bottom: 18px; letter-spacing: 1px;
}

/* Schwebende Inputs */
.luxe-input-box {
  display: flex; align-items: center; background: #13161c; border: 2px solid #1f2229;
  border-radius: 20px; height: 70px; padding: 0 30px; transition: 0.4s;
}
.luxe-input-box:focus-within { border-color: #00bcd4; box-shadow: 0 15px 40px rgba(0, 188, 212, 0.1); transform: scale(1.02); }
.luxe-input-box i { color: #3d424a; font-size: 22px; margin-right: 20px; }
.luxe-input-box input { background: transparent; border: none; color: white; width: 100%; outline: none; font-size: 18px; font-weight: 600; }

.luxe-grid-row { display: grid; grid-template-columns: 1fr 1.5fr; gap: 40px; }

/* Moderner Toggle Switch */
.luxe-toggle-group { display: flex; background: #13161c; padding: 8px; border-radius: 20px; border: 2px solid #1f2229; height: 70px; }
.luxe-toggle-group button { flex: 1; border: none; background: transparent; color: #5c626d; font-weight: 900; border-radius: 16px; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 10px; }
.luxe-toggle-group button.active { background: #00bcd4; color: #0b0e14; box-shadow: 0 10px 20px rgba(0, 188, 212, 0.3); }

/* Status Visualizer */
.luxe-status-card {
  display: flex; align-items: center; gap: 40px; padding: 40px;
  background: linear-gradient(135deg, rgba(0, 188, 212, 0.05) 0%, rgba(19, 22, 28, 0) 100%);
  border: 2px solid rgba(0, 188, 212, 0.1); border-radius: 30px;
}
.inner-value { font-size: 48px; font-weight: 900; color: #3d424a; }
.inner-value span { font-size: 24px; margin-left: 5px; opacity: 0.5; }

/* Actions */
.luxe-footer-actions { display: flex; gap: 30px; width: 100%; padding: 0 80px 60px 80px; }
.luxe-btn-primary { flex: 2; background: #00bcd4; color: #0b0e14; border: none; padding: 24px; border-radius: 22px; font-weight: 900; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 15px; font-size: 16px; transition: 0.4s; }
.luxe-btn-primary:hover { transform: translateY(-5px); box-shadow: 0 20px 50px rgba(0, 188, 212, 0.4); }
.luxe-btn-ghost { flex: 1; background: transparent; border: 2px solid #1f2229; color: #5c626d; border-radius: 22px; font-weight: 700; cursor: pointer; }
</style>