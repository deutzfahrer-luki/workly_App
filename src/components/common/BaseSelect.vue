<template>
  <div class="base-select-container" v-click-outside="close">
    <div 
      class="select-trigger" 
      :class="{ 'is-active': isOpen, 'is-loading': loading }" 
      @click="toggle"
    >
      <div v-if="icon" class="icon-wrap" :class="iconClass">
        <i :class="icon"></i>
      </div>
      
      <div class="selected-value">
        {{ selectedLabel || placeholder || 'Wählen...' }}
      </div>

      <div class="arrow">
        <i class="fa-solid fa-chevron-down" :class="{ 'rotate': isOpen }"></i>
      </div>
    </div>

    <transition name="fade-slide">
      <ul v-if="isOpen" class="options-menu">
        <li 
          v-for="opt in options" 
          :key="opt.value" 
          @click="selectOption(opt)"
          :class="{ 'selected': opt.value === modelValue }"
        >
          <span class="opt-code">{{ opt.value }}</span>
          <span class="opt-label">{{ opt.label.split('|')[1] || opt.label }}</span>
        </li>
        <li v-if="options.length === 0" class="no-options">Keine Konten gefunden</li>
      </ul>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps(['modelValue', 'options', 'placeholder', 'icon', 'iconClass', 'loading'])
const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)

const selectedLabel = computed(() => {
  const found = props.options.find(o => o.value === props.modelValue)
  return found ? found.label : null
})

const toggle = () => { if (!props.loading) isOpen.value = !isOpen.value }
const close = () => { isOpen.value = false }

const selectOption = (opt) => {
  emit('update:modelValue', opt.value)
  isOpen.value = false
}

// Directive zum Schließen bei Klick außerhalb
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}
</script>

<style scoped>
.base-select-container { position: relative; width: 100%; }

.select-trigger {
  display: flex; align-items: center; background: #0b0e14; border: 2px solid #1f2229;
  border-radius: 14px; height: 56px; padding: 0 20px; cursor: pointer; transition: 0.3s;
}
.select-trigger:hover { border-color: #3d424a; }
.select-trigger.is-active { border-color: #00bcd4; background: #13161c; }

.icon-wrap { width: 30px; font-size: 18px; margin-right: 12px; }
.text-green { color: #22c55e; }
.text-red { color: #ef4444; }

.selected-value { flex: 1; color: white; font-size: 15px; font-weight: 600; }
.arrow { color: #5c626d; transition: 0.3s; }
.arrow.rotate { transform: rotate(180deg); color: #00bcd4; }

/* Das "schöne" Menü */
.options-menu {
  position: absolute; top: calc(100% + 10px); left: 0; width: 100%;
  background: #13161c; border: 2px solid #1f2229; border-radius: 16px;
  padding: 8px; z-index: 5000; box-shadow: 0 20px 50px rgba(0,0,0,0.6);
  max-height: 250px; overflow-y: auto; list-style: none;
}

li {
  padding: 12px 16px; border-radius: 10px; cursor: pointer; display: flex; gap: 12px;
  transition: 0.2s; color: #a0a0a0; font-weight: 600; font-size: 14px;
}
li:hover { background: rgba(0, 188, 212, 0.1); color: #00bcd4; }
li.selected { background: #00bcd4; color: #0b0e14; }

.opt-code { opacity: 0.6; font-family: monospace; }

/* Animation */
.fade-slide-enter-active, .fade-slide-leave-active { transition: 0.2s; }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translateY(-10px); }
</style>