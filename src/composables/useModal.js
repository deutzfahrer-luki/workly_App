import { ref } from 'vue'

export function useModal() {
  const isOpen = ref(false)

  const open = () => {
    isOpen.value = true
    document.body.style.overflow = 'hidden' // Verhindert Scrollen im Hintergrund
  }

  const close = () => {
    isOpen.value = false
    document.body.style.overflow = 'auto'
  }

  const toggle = () => {
    isOpen.value ? close() : open()
  }

  return {
    isOpen,
    open,
    close,
    toggle
  }
}