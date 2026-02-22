<template>
  <BaseModal 
    v-if="modelValue"
    :modelValue="modelValue" 
    @update:modelValue="$emit('update:modelValue', $event)"
    title="Filter anwenden" 
    width="500px" 
  >
    <div class="filter-modal-container">
      <div v-for="config in filterConfig" :key="config.key" class="filter-row">
        <label class="filter-label-header">{{ config.label }}</label>
        
        <div class="full-width-select-wrap">
          <select 
            :value="filters[config.key]" 
            @change="updateFilter(config.key, $event.target.value)"
            class="premium-full-select"
          >
            <option value="all">Alle anzeigen</option>
            <option v-for="val in getUniqueValues(config.key)" :key="val" :value="val">
              {{ val }}
            </option>
          </select>
          <div class="select-arrow-right">
            <i class="fa-solid fa-chevron-down"></i>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer-flex-container">
        <button class="delete-filter-link" @click="$emit('reset')">
          Filter löschen
        </button>
        <button class="apply-filter-btn" @click="$emit('update:modelValue', false)">
          Anwenden
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import BaseModal from './BaseModal.vue';

const props = defineProps({
  modelValue: Boolean,
  filters: Object,
  filterConfig: Array,
  getUniqueValues: Function
});

const emit = defineEmits(['update:modelValue', 'update:filters', 'reset']);

function updateFilter(key, value) {
  const newFilters = { ...props.filters, [key]: value };
  emit('update:filters', newFilters);
}
</script>

<style scoped>
.filter-modal-container {
  display: flex;
  flex-direction: column;
  gap: 35px;
  padding: 15px 10px;
  width: 100%; /* Zwingt Inhalt auf volle Breite */
}

.filter-row {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.filter-label-header {
  display: block;
  font-size: 11px;
  font-weight: 800;
  color: #5c626d; /* Hochwertiges Grau */
  text-transform: uppercase;
  margin-bottom: 14px;
  letter-spacing: 1.5px;
  text-align: left;
}

/* FULL WIDTH SELECT */
.full-width-select-wrap {
  position: relative;
  width: 100%;
}

.premium-full-select {
  width: 100%; /* Nimmt die gesamte Breite des Modals ein */
  background: #06080a; /* Tiefes Schwarz für Kontrast */
  border: 1.5px solid #1c2128;
  color: #ffffff;
  padding: 18px 20px;
  border-radius: 12px;
  outline: none;
  appearance: none;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.premium-full-select:hover {
  border-color: #30363d;
  background: #0a0d11;
}

.premium-full-select:focus {
  border-color: #00bcd4;
  box-shadow: 0 0 0 4px rgba(0, 188, 212, 0.1);
}

.select-arrow-right {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #ffffff;
  pointer-events: none;
  font-size: 12px;
  opacity: 0.7;
}

/* FOOTER LOGIK: Zentriert & Breit */
.modal-footer-flex-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 10px 0;
}

.delete-filter-link {
  background: transparent;
  border: none;
  color: #ef4444; /* Markiertes Rot */
  cursor: pointer;
  text-decoration: underline;
  font-size: 14px;
  font-weight: 600;
  padding: 0;
  transition: opacity 0.2s;
}

.delete-filter-link:hover {
  opacity: 0.7;
}

.apply-filter-btn {
  background: #00bcd4; /* Markiertes Cyan */
  color: #06080a;
  border: none;
  padding: 16px 45px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 188, 212, 0.2);
}

.apply-filter-btn:hover {
  background: #26c6da;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 188, 212, 0.3);
}
</style>