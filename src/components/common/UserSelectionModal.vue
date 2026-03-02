<template>
  <BaseModal 
    :modelValue="modelValue" 
    @update:modelValue="$emit('update:modelValue', $event)"
    title="Personen suchen & markieren" 
    width="520px"
  >
    <div class="picker-modal-body">
      <div class="search-filter-area">
        <div class="glass-search-wrap">
          <i class="fa-solid fa-magnifying-glass search-ico"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Name oder Position suchen..." 
            class="search-input" 
          />
        </div>
        <div class="filter-chips custom-scroll-h">
          <button 
            v-for="dept in departments" 
            :key="dept"
            class="filter-chip" 
            :class="{ 'active': activeFilter === dept }"
            @click="activeFilter = dept"
          >
            {{ dept }}
          </button>
        </div>
      </div>

      <div class="selection-list custom-scroll">
        <div 
          v-for="user in filteredParticipants" 
          :key="user.id" 
          class="selection-item-luxe"
          @click="toggleSelection(user.id)"
          :class="{ 'is-selected': selectedIds.includes(user.id) }"
        >
          <div class="u-avatar">{{ user.name.charAt(0) }}</div>
          <div class="user-meta">
            <span class="u-name">{{ user.name }}</span>
            <span class="u-pos">{{ user.position }}</span>
          </div>
          <div class="check-circle-luxe">
            <i class="fa-solid fa-check"></i>
          </div>
        </div>
        <div v-if="filteredParticipants.length === 0" class="no-results">
          Keine Personen gefunden
        </div>
      </div>
    </div>

    <template #footer>
      <div class="picker-footer">
        <span class="selection-count">{{ selectedIds.length }} ausgewählt</span>
        <button class="btn-confirm-luxe" @click="$emit('update:modelValue', false)">
          Fertigstellen
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseModal from './BaseModal.vue'

const props = defineProps({
  modelValue: Boolean,
  participants: { type: Array, default: () => [] },
  selectedIds: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue', 'update:selectedIds'])

const searchQuery = ref('')
const activeFilter = ref('Alle')
const departments = ['Alle', 'Geschäftsführung', 'Projektleitung', 'Bauleiter', 'Buchhaltung']

const filteredParticipants = computed(() => {
  return props.participants.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          p.position.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesDept = activeFilter.value === 'Alle' || p.position === activeFilter.value
    return matchesSearch && matchesDept
  })
})

function toggleSelection(id) {
  const newSelection = [...props.selectedIds]
  const idx = newSelection.indexOf(id)
  if (idx > -1) newSelection.splice(idx, 1)
  else newSelection.push(id)
  emit('update:selectedIds', newSelection)
}
</script>

<style scoped>
.picker-modal-body { padding: 20px; display: flex; flex-direction: column; gap: 20px; }
.glass-search-wrap { position: relative; display: flex; align-items: center; }
.search-ico { position: absolute; left: 15px; color: #5c626d; }
.search-input { width: 100%; background: #0b0e14; border: 1.5px solid #1f2229; padding: 12px 12px 12px 45px; border-radius: 12px; color: white; outline: none; transition: 0.3s; }
.search-input:focus { border-color: #00bcd4; box-shadow: 0 0 15px rgba(0, 188, 212, 0.1); }

.filter-chips { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 8px; }
.filter-chip { background: #1a1e26; border: 1px solid #2d3139; color: #5c626d; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 800; cursor: pointer; white-space: nowrap; transition: 0.2s; }
.filter-chip.active { background: #00bcd4; color: #0b0e14; border-color: #00bcd4; }

.selection-list { max-height: 400px; overflow-y: auto; padding-right: 5px; }
.selection-item-luxe { display: flex; align-items: center; gap: 15px; padding: 12px; background: #0b0e14; border: 1.5px solid #1f2229; border-radius: 14px; cursor: pointer; transition: 0.2s; margin-bottom: 10px; }
.selection-item-luxe:hover { border-color: #3a3f47; background: #13161c; }
.selection-item-luxe.is-selected { border-color: #00bcd4; background: rgba(0, 188, 212, 0.05); }

.u-avatar { width: 40px; height: 40px; background: #1f2229; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #00bcd4; border: 1px solid rgba(0, 188, 212, 0.2); }
.user-meta { flex: 1; display: flex; flex-direction: column; }
.u-name { color: white; font-weight: 700; font-size: 14px; }
.u-pos { color: #5c626d; font-size: 11px; font-weight: 600; }

.check-circle-luxe { width: 22px; height: 22px; border: 2px solid #1f2229; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: transparent; transition: 0.2s; }
.is-selected .check-circle-luxe { background: #00bcd4; border-color: #00bcd4; color: #0b0e14; }

.picker-footer { display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 10px 0; }
.selection-count { color: #5c626d; font-size: 12px; font-weight: 800; text-transform: uppercase; }
.btn-confirm-luxe { background: #00bcd4; color: #0b0e14; padding: 12px 25px; border-radius: 12px; font-weight: 900; border: none; cursor: pointer; box-shadow: 0 5px 15px rgba(0, 188, 212, 0.2); transition: 0.3s; }
.btn-confirm-luxe:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0, 188, 212, 0.4); }
</style>