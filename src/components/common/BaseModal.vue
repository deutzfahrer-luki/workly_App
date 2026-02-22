<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click.self="$emit('update:modelValue', false)">
      <div class="modal-container" :style="{ maxWidth: width }">
        <div class="modal-header">
          <div class="header-info">
            <slot name="header">
              <span class="pre-title">Details</span>
              <h3>{{ title }}</h3>
            </slot>
          </div>
          <button class="round-close-btn" @click="$emit('update:modelValue', false)">
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
defineProps({
  modelValue: Boolean,
  title: String,
  width: { type: String, default: '500px' }
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(11, 14, 20, 0.92); display: flex; align-items: center; justify-content: center; z-index: 3000;
}
.modal-container {
  background: #13161c; width: 95%; height: 90vh; border-radius: 24px;
  border: 1px solid #1f2229; display: flex; flex-direction: column; overflow: hidden;
}
.modal-header { padding: 25px 35px; border-bottom: 1px solid #1f2229; display: flex; justify-content: space-between; align-items: flex-start; }
.pre-title { font-size: 10px; text-transform: uppercase; color: #707070; letter-spacing: 2px; }
.header-info h3 { margin: 5px 0 0; color: #00bcd4; font-size: 22px; }
.round-close-btn {
  width: 36px; height: 36px; border-radius: 50%; background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s;
}
.round-close-btn:hover { background: rgba(239, 68, 68, 0.2); color: #ef4444; border-color: #ef4444; }
.modal-body { flex: 1; display: flex; overflow: hidden; }
.modal-footer-container { padding: 20px 35px; border-top: 1px solid #1f2229; }
</style>