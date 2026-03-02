<template>
  <BaseModal v-model="isOpen" width="850px" title="Transaktion erfassen">
    <div class="modal-body-luxe">
      <div class="input-section-full">
        <label class="luxe-label">Verwendungszweck / Buchungstext</label>
        <div class="glass-input-wrapper">
          <i class="fa-solid fa-pen-nib field-icon"></i>
          <input v-model="form.text" type="text" placeholder="z.B. Tankbeleg..." class="premium-field" />
        </div>
      </div>

      <div class="selection-grid-luxe">
        <BaseSelect v-model="form.debitAccount" :options="accountOptions" placeholder="Soll (Zulauf)" icon="fa-solid fa-circle-plus" iconClass="text-green" />
        <BaseSelect v-model="form.creditAccount" :options="accountOptions" placeholder="Haben (Abgang)" icon="fa-solid fa-circle-minus" iconClass="text-red" />
      </div>

      <div 
        class="attachments-area" 
        :class="{ 'is-dragover': isDragOver }"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="handleDrop"
      >
        <div class="attachment-header">
          <label class="luxe-label">Anhänge / Drag & Drop</label>
          <div class="attachment-tools">
            <button class="tool-btn" @click="triggerUpload"><i class="fa-solid fa-cloud-arrow-up"></i></button>
            <button class="tool-btn" :class="{ 'active-cam': isCameraOpen }" @click="toggleCamera">
              <i class="fa-solid fa-camera"></i>
            </button>
          </div>
        </div>

        <div v-if="isCameraOpen" class="camera-container">
          <video v-show="!capturedImage" ref="video" autoplay playsinline class="camera-stream"></video>
          <img v-if="capturedImage" :src="capturedImage" class="camera-stream" />
          <div class="camera-overlay">
            <button v-if="!capturedImage" class="capture-btn" @click="takeSnapshot"><div class="capture-inner"></div></button>
            <div v-else class="confirm-actions">
              <button class="confirm-btn yes" @click="confirmPhoto">Ja</button>
              <button class="confirm-btn no" @click="capturedImage = null">Neu</button>
            </div>
          </div>
        </div>

        <input type="file" ref="fileInput" hidden multiple @change="handleFileChange" />
        <input type="file" ref="mobileCameraInput" hidden accept="image/*" capture="environment" @change="handleFileChange" />

        <div class="file-list" v-if="!isCameraOpen">
          <div v-if="files.length === 0" class="empty-files">Datei hierher ziehen oder Kamera nutzen</div>
          <div v-for="(file, index) in files" :key="index" class="file-item-premium">
            <div class="file-main">
              <div class="file-icon-box">
                <img v-if="file.preview" :src="file.preview" class="file-thumb" />
                <i v-else class="fa-solid fa-file-invoice"></i>
              </div>
              <span class="file-name">{{ file.name }}</span>
            </div>
            <button @click="removeFile(index)" class="file-delete-btn"><i class="fa-solid fa-trash-can"></i></button>
          </div>
        </div>
      </div>

      <div class="amount-visualizer-card">
        <div class="amount-top-row">
          <span class="visualizer-label">BUCHUNGSBETRAG</span>
          <div class="currency-tag">EURO (€)</div>
        </div>
        <div class="massive-input-row">
          <input 
            type="text" v-model="displayAmount" @input="handleAmountInput" @blur="formatFinalAmount" 
            placeholder="0,00" class="massive-amount-field" 
          />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer-luxe">
        <button class="btn-luxe-ghost" @click="closeModal">Abbrechen</button>
        <button class="btn-luxe-primary" @click="submit" :disabled="!isFormValid">
          <i class="fa-solid fa-bolt"></i><span>Buchung ausführen</span>
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, watch, computed, onUnmounted } from 'vue'
import BaseModal from './common/BaseModal.vue'
import BaseSelect from './common/BaseSelect.vue'

const props = defineProps(['modelValue', 'accounts'])
const emit = defineEmits(['update:modelValue', 'save'])

const isOpen = ref(props.modelValue)
const isDragOver = ref(false)
const isCameraOpen = ref(false)
const capturedImage = ref(null)
const video = ref(null)
const stream = ref(null)
const fileInput = ref(null)
const mobileCameraInput = ref(null)
const files = ref([])
const displayAmount = ref('')
const form = ref({ text: '', debitAccount: '', creditAccount: '', amount: 0 })

// Kamera Toggle-Mechanismus
const toggleCamera = () => {
  if (isCameraOpen.value) {
    stopStream()
  } else {
    handleCameraStart()
  }
}

const handleCameraStart = () => {
  if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    mobileCameraInput.value.click()
  } else {
    startWebcam()
  }
}

async function startWebcam() {
  isCameraOpen.value = true
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({ video: true })
    if (video.value) video.value.srcObject = stream.value
  } catch (err) { alert("Kamera-Fehler"); isCameraOpen.value = false; }
}

const takeSnapshot = () => {
  const canvas = document.createElement('canvas')
  canvas.width = video.value.videoWidth; canvas.height = video.value.videoHeight
  canvas.getContext('2d').drawImage(video.value, 0, 0)
  capturedImage.value = canvas.toDataURL('image/jpeg')
}

const confirmPhoto = () => {
  files.value.push({ name: `Scan_${Date.now()}.jpg`, preview: capturedImage.value })
  stopStream()
}

const stopStream = () => {
  if (stream.value) stream.value.getTracks().forEach(t => t.stop())
  isCameraOpen.value = false; capturedImage.value = null; stream.value = null
}

const handleFileChange = (e) => {
  const newFiles = Array.from(e.target.files).map(f => ({ name: f.name, preview: URL.createObjectURL(f) }))
  files.value.push(...newFiles)
}

const handleDrop = (e) => {
  isDragOver.value = false
  const droppedFiles = Array.from(e.dataTransfer.files).map(f => ({
    name: f.name,
    preview: URL.createObjectURL(f)
  }))
  files.value.push(...droppedFiles)
}

const handleAmountInput = (e) => {
  let val = e.target.value.replace(/[^\d,]/g, '')
  displayAmount.value = val
  form.value.amount = parseFloat(val.replace(',', '.')) || 0
}

const formatFinalAmount = () => {
  if (form.value.amount) displayAmount.value = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2 }).format(form.value.amount)
}

const closeModal = () => { stopStream(); isOpen.value = false }
const removeFile = (i) => files.value.splice(i, 1)
const triggerUpload = () => fileInput.value.click()

watch(() => props.modelValue, (v) => isOpen.value = v)
watch(isOpen, (v) => { if(!v) stopStream(); emit('update:modelValue', v) })
onUnmounted(stopStream)

const accountOptions = computed(() => (props.accounts || []).map(a => ({ value: a.code, label: `${a.code} | ${a.name}` })))
const isFormValid = computed(() => form.value.text && form.value.debitAccount && form.value.creditAccount && form.value.amount > 0)
const submit = () => { emit('save', { ...form.value, files: files.value }); closeModal(); }
</script>

<style scoped>
.modal-body-luxe { display: flex; flex-direction: column; gap: 20px; padding: 25px 60px; }
.luxe-label { font-size: 10px; font-weight: 900; color: #454b54; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; display: block; }

.selection-grid-luxe { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.glass-input-wrapper { display: flex; align-items: center; background: #0b0e14; border: 2px solid #1f2229; border-radius: 14px; height: 50px; padding: 0 20px; gap: 15px; }
.premium-field { background: transparent; border: none; color: white; width: 100%; outline: none; font-size: 16px; font-weight: 600; }

/* Anhänge & Drag Area */
.attachments-area { background: rgba(0,0,0,0.1); border-radius: 18px; padding: 15px; border: 1px dashed #1f2229; transition: 0.3s; }
.attachments-area.is-dragover { border-color: #00bcd4; background: rgba(0, 188, 212, 0.05); }

.attachment-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.tool-btn { background: #13161c; border: 1px solid #1f2229; color: #00bcd4; width: 40px; height: 40px; border-radius: 10px; cursor: pointer; transition: 0.2s; }
.tool-btn:hover { border-color: #00bcd4; background: rgba(0, 188, 212, 0.1); }
.active-cam { background: #00bcd4 !important; color: #0b0e14 !important; }

/* Verschönerte Dateiliste */
.file-list { display: flex; flex-direction: column; gap: 8px; max-height: 110px; overflow-y: auto; padding-right: 5px; }
.file-item-premium { 
  background: #0b0e14; border-radius: 12px; padding: 10px 15px; 
  display: flex; justify-content: space-between; align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.03); transition: 0.2s;
}
.file-item-premium:hover { border-color: rgba(0, 188, 212, 0.3); background: #13161c; }

.file-main { display: flex; align-items: center; gap: 15px; flex: 1; }
.file-icon-box { 
  width: 36px; height: 36px; background: rgba(0, 188, 212, 0.1); 
  border-radius: 8px; display: flex; align-items: center; justify-content: center;
  color: #00bcd4; font-size: 14px; flex-shrink: 0; overflow: hidden;
}
.file-thumb { width: 100%; height: 100%; object-fit: cover; }
.file-name { color: #e2e8f0; font-size: 13px; font-weight: 600; }

.file-delete-btn { background: transparent; border: none; color: #454b54; cursor: pointer; padding: 5px; transition: 0.2s; }
.file-delete-btn:hover { color: #ef4444; transform: scale(1.1); }

/* Kamera Stream */
.camera-container { position: relative; border-radius: 14px; overflow: hidden; height: 260px; background: #000; border: 2px solid #00bcd4; }
.camera-stream { width: 100%; height: 100%; object-fit: cover; }
.camera-overlay { position: absolute; bottom: 15px; width: 100%; display: flex; justify-content: center; }

/* Massive Amount */
.amount-visualizer-card { background: linear-gradient(145deg, rgba(0, 188, 212, 0.04) 0%, rgba(0, 0, 0, 0) 100%); border: 1px solid rgba(0, 188, 212, 0.1); border-radius: 24px; padding: 25px; text-align: center; }
.massive-amount-field { background: transparent; border: none; color: #00bcd4; font-size: 48px; font-weight: 900; width: 100%; text-align: center; outline: none; }

.modal-footer-luxe { display: flex; gap: 15px; padding: 0 60px 40px 60px; }
.btn-luxe-primary { flex: 2; background: #00bcd4; color: #0b0e14; border: none; padding: 16px; border-radius: 14px; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }
.btn-luxe-ghost { flex: 1; background: transparent; border: 2px solid #1f2229; color: #5c626d; border-radius: 14px; font-weight: 800; cursor: pointer; }
</style>