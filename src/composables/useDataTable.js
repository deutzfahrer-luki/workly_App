import { ref, computed } from 'vue'

export function useDataTable(initialData) {
  const searchQuery = ref('')
  const filters = ref({})
  const showFilterModal = ref(false)

  // Die Hauptlogik für das Filtern
  const filteredData = computed(() => {
    return initialData.value.filter(item => {
      // 1. Globale Suche (über alle Felder)
      const matchesSearch = Object.values(item).some(val => 
        String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
      )

      // 2. Spezifische Filter (Status, Quelle, etc.)
      const matchesFilters = Object.keys(filters.value).every(key => {
        if (!filters.value[key] || filters.value[key] === 'all') return true
        return item[key] === filters.value[key]
      })

      return matchesSearch && matchesFilters
    })
  })

  const activeFilterCount = computed(() => {
    return Object.values(filters.value).filter(v => v && v !== 'all').length
  })

  function resetFilters() {
    searchQuery.value = ''
    filters.value = {}
  }

  // Hilfsfunktion um einzigartige Werte für Dropdowns zu bekommen (z.B. alle Status-Typen)
  function getUniqueValues(key) {
    return [...new Set(initialData.value.map(item => item[key]))]
  }

  return {
    searchQuery,
    filters,
    showFilterModal,
    filteredData,
    activeFilterCount,
    resetFilters,
    getUniqueValues
  }
}