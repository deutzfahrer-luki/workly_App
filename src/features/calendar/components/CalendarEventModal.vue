<template>
  <BaseModal 
    :modelValue="modelValue" 
    @update:modelValue="$emit('update:modelValue', $event)"
    :title="isMultiDay ? 'Zeitraum planen' : 'Neuer Termin'" 
    width="1000px"
  >
    <div class="ultra-luxe-body">
      <div class="header-focus-area">
        <div class="title-container">
          <label class="micro-label">Terminbezeichnung</label>
          <input 
            v-model="localEvent.title" 
            type="text" 
            placeholder="Was steht an?" 
            class="mega-title-input" 
          />
          <div class="title-glow-bar"></div>
        </div>
      </div>

      <div class="main-content-layout">
        <div class="content-column">
          <div class="luxe-card timing-module">
            <div class="card-header-simple">
              <span class="card-label-luxe"><i class="fa-solid fa-clock"></i> Zeitplanung</span>
              <div class="tab-pills">
                <button type="button" @click="isMultiDay = false" :class="{ 'active': !isMultiDay }">Einzel</button>
                <button type="button" @click="isMultiDay = true" :class="{ 'active': isMultiDay }">Zeitraum</button>
              </div>
            </div>

            <div class="timing-controls">
              <div class="date-field-stack">
                <div class="luxe-field-wrap">
                  <span class="field-hint">{{ isMultiDay ? 'Beginn' : 'Datum' }}</span>
                  <input type="date" v-model="localEvent.startDate" class="raw-date-input" />
                </div>
                
                <transition name="fade">
                  <div v-if="isMultiDay" class="luxe-field-wrap mt-15">
                    <span class="field-hint">Ende</span>
                    <input type="date" v-model="localEvent.endDate" class="raw-date-input" />
                  </div>
                </transition>
              </div>

              <div class="time-settings-block">
                <label class="luxe-checkbox-label">
                  <input type="checkbox" v-model="localEvent.allDay" class="luxe-checkbox">
                  <span class="checkbox-text">Ganztägiges Ereignis</span>
                </label>

                <transition name="expand">
                  <div v-if="!localEvent.allDay" class="time-row-fix">
                    <div class="time-input-box">
                      <span class="tiny-hint">Start</span>
                      <input type="time" v-model="localEvent.startTime" class="luxe-time-raw" />
                    </div>
                    <div class="time-sep">bis</div>
                    <div class="time-input-box">
                      <span class="tiny-hint">Ende</span>
                      <input type="time" v-model="localEvent.endTime" class="luxe-time-raw" />
                    </div>
                  </div>
                </transition>
              </div>
            </div>
          </div>

          <div class="luxe-card description-module">
            <div class="card-header-simple">
              <span class="card-label-luxe"><i class="fa-solid fa-align-left"></i> Beschreibung</span>
            </div>
            <textarea 
              v-model="localEvent.description" 
              placeholder="Notizen oder Agenda hinzufügen..." 
              class="luxe-textarea custom-scroll"
            ></textarea>
          </div>
        </div>

        <div class="content-column">
          <div class="luxe-card meta-module">
            <div class="meta-section">
              <label class="micro-label">Kategorie</label>
              <BaseSelect v-model="localEvent.type" :options="categoryOptions" icon="fa-solid fa-layer-group" />
            </div>
            <div class="meta-spacer"></div>
            <div class="meta-section">
              <label class="micro-label">Erinnerung</label>
              <BaseSelect v-model="localEvent.reminder" :options="reminderOptions" icon="fa-solid fa-bell" />
            </div>
          </div>

          <div class="luxe-card participants-module">
            <div class="card-header-simple">
              <span class="card-label-luxe"><i class="fa-solid fa-users"></i> Teilnehmer</span>
              <button type="button" class="btn-add-luxe" @click="showUserPicker = true">
                <i class="fa-solid fa-plus"></i>
                <span>Markieren</span>
              </button>
            </div>

            <div class="user-list-single-col custom-scroll">
              <div v-for="uid in localEvent.invitees" :key="uid" class="user-entry">
                <div class="u-avatar">{{ getUserName(uid).charAt(0) }}</div>
                <div class="u-info">
                  <span class="u-name">{{ getUserName(uid) }}</span>
                  <span class="u-rank">{{ getUserPosition(uid) }}</span>
                </div>
                <button type="button" class="u-remove" @click="removeInvitee(uid)">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div v-if="localEvent.invitees.length === 0" class="empty-hint">Niemand markiert</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="ultra-footer-luxe">
        <button type="button" class="btn-cancel-ghost" @click="$emit('update:modelValue', false)">Verwerfen</button>
        <button type="button" class="btn-save-glow" :disabled="!localEvent.title" @click="confirmSave">
          <span>Termin speichern</span>
          <div class="btn-icon-sq"><i class="fa-solid fa-calendar-check"></i></div>
        </button>
      </div>
    </template>

    <UserSelectionModal v-model="showUserPicker" :participants="participants" v-model:selectedIds="localEvent.invitees" />
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseModal from '../../../components/common/BaseModal.vue'
import BaseSelect from '../../../components/common/BaseSelect.vue'
import UserSelectionModal from '../../../components/common/UserSelectionModal.vue'

interface Participant { id: string; name: string; position?: string; }
const props = defineProps<{ modelValue: boolean; selectedDate: Date; participants: Participant[]; colorMap: Record<string, string>; }>();
const emit = defineEmits(['update:modelValue', 'save']);

const showUserPicker = ref(false);
const isMultiDay = ref(false);

const categoryOptions = [
  { value: 'work', label: 'W | Arbeit' },
  { value: 'private', label: 'P | Privat' },
  { value: 'success', label: 'S | Erfolg' }
];

const reminderOptions = [
  { value: 'none', label: 'Keine' },
  { value: '15', label: '15 Min. vorher' },
  { value: '60', label: '1 Std. vorher' }
];

// Reinitialisierung bei jedem Öffnen
const localEvent = ref({
  title: '', description: '', type: 'work', invitees: [] as string[], allDay: false,
  startDate: '', startTime: '09:00', endDate: '', endTime: '10:00', reminder: '15'
});

const getUserName = (id: string) => props.participants.find(p => p.id === id)?.name || id;
const getUserPosition = (id: string) => props.participants.find(p => p.id === id)?.position || 'Mitarbeiter';
const removeInvitee = (id: string) => { localEvent.value.invitees = localEvent.value.invitees.filter(uid => uid !== id); };
const confirmSave = () => { emit('save', { ...localEvent.value }); };

// DER RESET-FIX
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    // Reset aller Felder auf Standardwerte
    localEvent.value = {
      title: '',
      description: '',
      type: 'work',
      invitees: [],
      allDay: false,
      startDate: '',
      startTime: '09:00',
      endDate: '',
      endTime: '10:00',
      reminder: '15'
    };
    isMultiDay.value = false;

    // Aktuell gewähltes Datum aus dem Kalender setzen
    if (props.selectedDate) {
      const d = props.selectedDate.toISOString().split('T')[0];
      localEvent.value.startDate = d;
      localEvent.value.endDate = d;
    }
  }
});
</script>

<style scoped>
/* Beibehalten deiner Luxe-Styles */
.ultra-luxe-body { padding: 40px 50px; background: #0b0e14; display: flex; flex-direction: column; gap: 40px; }
.main-content-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; align-items: stretch; }
.content-column { display: flex; flex-direction: column; gap: 30px; }
.luxe-card { background: #13161c; border: 1.5px solid #1f2229; border-radius: 28px; padding: 25px; display: flex; flex-direction: column; }
.date-field-stack { margin-top: 25px; display: flex; flex-direction: column; gap: 15px; }
.btn-add-luxe { background: rgba(0, 188, 212, 0.1); border: 1px solid rgba(0, 188, 212, 0.2); color: #00bcd4; padding: 6px 12px; border-radius: 10px; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: 0.3s; font-size: 11px; font-weight: 800; text-transform: uppercase; }
.btn-add-luxe:hover { background: #00bcd4; color: #0b0e14; box-shadow: 0 0 15px rgba(0, 188, 212, 0.3); }
.user-list-single-col { display: flex; flex-direction: column; gap: 10px; max-height: 400px; overflow-y: auto; flex: 1; }
.user-entry { background: #0b0e14; border: 1.5px solid #1f2229; border-radius: 16px; padding: 12px 15px; display: flex; align-items: center; gap: 15px; position: relative; }
.u-avatar { width: 36px; height: 36px; background: #1a1e26; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #00bcd4; }
.u-info { flex: 1; display: flex; flex-direction: column; }
.u-name { color: white; font-size: 14px; font-weight: 700; }
.u-rank { color: #5c626d; font-size: 10px; font-weight: 800; text-transform: uppercase; }
.u-remove { background: transparent; border: none; color: #3a3f47; cursor: pointer; font-size: 16px; transition: 0.2s; }
.u-remove:hover { color: #ef4444; }
.luxe-field-wrap { background: #0b0e14; border: 1.5px solid #1f2229; border-radius: 16px; padding: 12px 18px; display: flex; flex-direction: column; flex: 1; }
.raw-date-input { background: transparent; border: none; color: white; font-size: 15px; font-weight: 600; outline: none; color-scheme: dark; width: 100%; }
.time-settings-block { margin-top: 25px; padding-top: 20px; border-top: 1px solid #1f2229; }
.luxe-checkbox-label { display: flex; align-items: center; gap: 12px; cursor: pointer; margin-bottom: 15px; }
.luxe-checkbox { width: 18px; height: 18px; accent-color: #00bcd4; cursor: pointer; }
.checkbox-text { font-size: 13px; color: #a0a4ab; font-weight: 600; }
.time-row-fix { display: flex; align-items: center; background: #0b0e14; border-radius: 18px; border: 1.5px solid #1f2229; padding: 12px; margin-top: 10px; }
.time-input-box { flex: 1; display: flex; flex-direction: column; align-items: center; }
.tiny-hint { font-size: 8px; text-transform: uppercase; color: #3a3f47; font-weight: 900; margin-bottom: 2px; }
.luxe-time-raw { background: transparent; border: none; color: white; font-size: 18px; font-weight: 800; text-align: center; outline: none; width: 100%; color-scheme: dark; }
.time-sep { font-size: 10px; color: #1f2229; font-weight: 900; text-transform: uppercase; padding: 0 10px; }
.luxe-textarea { background: #0b0e14; border: 1.5px solid #1f2229; border-radius: 18px; padding: 15px; color: white; font-size: 14px; line-height: 1.6; resize: none; flex: 1; min-height: 150px; outline: none; }
.meta-spacer { height: 20px; }
.ultra-footer-luxe { padding: 30px 50px; display: flex; justify-content: space-between; align-items: center; background: #0b0e14; border-top: 1.5px solid #1f2229; border-radius: 0 0 28px 28px; }
.btn-cancel-ghost { background: transparent; border: none; color: #5c626d; font-weight: 800; cursor: pointer; transition: 0.2s; font-size: 14px; }
.btn-cancel-ghost:hover { color: #fff; }
.btn-save-glow { background: #00bcd4; color: #0b0e14; border: none; padding: 6px 6px 6px 25px; border-radius: 20px; display: flex; align-items: center; gap: 20px; font-weight: 900; cursor: pointer; box-shadow: 0 10px 30px rgba(0, 188, 212, 0.2); }
.btn-icon-sq { background: rgba(0,0,0,0.1); padding: 12px; border-radius: 14px; }
.mega-title-input { background: transparent; border: none; font-size: 34px; font-weight: 900; color: white; width: 100%; outline: none; }
.title-glow-bar { height: 3px; width: 80px; background: #00bcd4; box-shadow: 0 0 20px #00bcd4; margin-top: 10px; }
.micro-label { font-size: 10px; font-weight: 900; color: #3a3f47; text-transform: uppercase; margin-bottom: 10px; display: block; }
.card-label-luxe { font-size: 11px; text-transform: uppercase; font-weight: 900; color: #5c626d; display: flex; align-items: center; gap: 10px; }
.card-label-luxe i { color: #00bcd4; }
.tab-pills { background: #0b0e14; padding: 4px; border-radius: 10px; display: flex; border: 1px solid #1f2229; }
.tab-pills button { border: none; background: transparent; color: #5c626d; padding: 6px 12px; font-size: 10px; font-weight: 800; border-radius: 7px; cursor: pointer; }
.tab-pills button.active { background: #1f2229; color: #00bcd4; }
.custom-scroll::-webkit-scrollbar { width: 5px; }
.custom-scroll::-webkit-scrollbar-thumb { background: #1f2229; border-radius: 10px; }
.mt-15 { margin-top: 15px; }
</style>