<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click.self="close">
      <div class="modal-container" :style="{ maxWidth: width }">
        <div class="modal-header">
          <div class="header-info">
            <slot name="header">
              <span class="pre-title">Details</span>
              <h3>{{ title }}</h3>
            </slot>
          </div>
          <button class="round-close-btn" @click="close">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="modal-body">
          <slot></slot>
        </div>

        <div v-if="$slots.footer" class="modal-footer-container">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  title: String,
  width: { type: String, default: '500px' }
})

const emit = defineEmits(['update:modelValue'])

const close = () => {
  emit('update:modelValue', false)
}

// Esc-Taste Event-Handler
const handleEsc = (e) => {
  if (e.key === 'Escape' && props.modelValue) {
    close()
  }
}

// Event-Listener hinzufügen und entfernen
onMounted(() => {
  window.addEventListener('keydown', handleEsc)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEsc)
})

// Body-Scroll sperren, wenn Modal offen ist
watch(() => props.modelValue, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
})
</script>

<style scoped>
.modal-overlay {
  position: fixed; 
  top: 0; 
  left: 0; 
  width: 100vw; 
  height: 100vh;
  background: rgba(11, 14, 20, 0.94); 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  z-index: 3000;
  backdrop-filter: blur(8px); 
}

.modal-container {
  background: #13161c; 
  width: 95%; 
  max-height: 90vh; 
  border-radius: 28px; 
  border: 1.5px solid #1f2229; 
  display: flex; 
  flex-direction: column; 
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0,0,0,0.5);
}

.modal-header { 
  padding: 30px 40px; 
  border-bottom: 1px solid #1f2229; 
  display: flex; 
  justify-content: space-between; 
  align-items: flex-start; 
}

.pre-title { 
  font-size: 10px; 
  text-transform: uppercase; 
  color: #5c626d; 
  letter-spacing: 3px; 
  font-weight: 900;
}

.header-info h3 { 
  margin: 8px 0 0; 
  color: #00bcd4; 
  font-size: 24px; 
  font-weight: 900; 
  letter-spacing: -0.5px;
}

.round-close-btn {
  width: 40px; 
  height: 40px; 
  border-radius: 50%; 
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08); 
  color: #5c626d; 
  cursor: pointer; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  transition: 0.3s;
}

.round-close-btn:hover { 
  background: rgba(239, 68, 68, 0.15); 
  color: #ef4444; 
  border-color: rgba(239, 68, 68, 0.3); 
  transform: rotate(90deg); 
}

.modal-body { 
  flex: 1; 
  display: flex; 
  flex-direction: column;
  overflow-y: auto; 
}

.modal-footer-container { 
  padding: 25px 40px; 
  border-top: 1px solid #1f2229; 
  background: rgba(255, 255, 255, 0.01);
}
</style>