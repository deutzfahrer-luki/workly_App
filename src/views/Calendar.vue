<template>
  <div class="calendar-container">
    <div class="page-header">
      <div class="title-group">
        <h1 class="main-title">Terminkalender</h1>
        <div class="calendar-nav">
          <div class="nav-controls">
            <button class="nav-btn-round" @click="changeDate(-1)"><i class="fa-solid fa-chevron-left"></i></button>
            <button class="nav-btn-round" @click="changeDate(1)"><i class="fa-solid fa-chevron-right"></i></button>
          </div>
          <button class="luxe-today-btn" @click="goToToday">Heute</button>
          <span class="month-label">{{ formattedDateLabel }}</span>
        </div>
      </div>

      <div class="header-right-actions">
        <div class="view-switcher-glass">
          <button v-for="v in ['Tag', 'Woche', 'Monat']" :key="v" 
                  @click="activeView = v" :class="{ active: activeView === v }" class="view-btn">
            {{ v }}
          </button>
        </div>
        <button class="add-event-luxe" @click="openModalWithDate(new Date())">
          <i class="fa-solid fa-plus"></i>
          <span>Termin</span>
        </button>
      </div>
    </div>

    <div class="calendar-main-card">
      <div v-if="activeView === 'Monat'" class="grid-month">
        <div v-for="day in ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']" :key="day" class="day-name-header">
          {{ day }}
        </div>
        
        <div v-for="day in daysInMonthArray" :key="day.dateString" 
             class="grid-cell" :class="{ 'dimmed': !day.isCurrentMonth, 'is-today': day.isToday }"
             @click="openModalWithDate(day.fullDate)">
          <div class="cell-header">
            <span class="cell-num">{{ day.dayNumber }}</span>
          </div>
          
          <div class="cell-events">
            <div v-for="event in getEventsForDay(day.fullDate)" :key="event.id" 
                 class="event-tag" :class="event.type">
              {{ event.title }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="glass-loader">
        <i class="fa-solid fa-circle-notch fa-spin"></i>
      </div>
    </div>

    <CalendarEventModal 
      v-model="showModal" 
      :selectedDate="selectedDateForModal" 
      :colorMap="colorMap"
      :participants="participants"
      @save="onSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCalendar } from '../features/calendar/composables/useCalendar'
import CalendarEventModal from '../features/calendar/components/CalendarEventModal.vue'

const { 
  currentDate, 
  activeView, 
  events, 
  participants,
  isLoading, 
  formattedDateLabel, 
  fetchEvents, 
  fetchParticipants,
  saveEvent, 
  changeDate, 
  goToToday 
} = useCalendar()

const showModal = ref(false)
const selectedDateForModal = ref(new Date())
const colorMap = { work: '#00bcd4', private: '#fb923c', success: '#22c55e', warning: '#ef4444' }

const daysInMonthArray = computed(() => {
  const y = currentDate.value.getFullYear(), m = currentDate.value.getMonth()
  const first = new Date(y, m, 1), last = new Date(y, m + 1, 0)
  let offset = first.getDay() - 1; if (offset === -1) offset = 6
  const days = [], todayStr = new Date().toDateString()
  for (let i = offset; i > 0; i--) {
    const d = new Date(y, m, 1 - i)
    days.push({ dayNumber: d.getDate(), isCurrentMonth: false, dateString: d.toDateString(), fullDate: d })
  }
  for (let i = 1; i <= last.getDate(); i++) {
    const d = new Date(y, m, i)
    days.push({ dayNumber: i, isCurrentMonth: true, isToday: d.toDateString() === todayStr, dateString: d.toDateString(), fullDate: d })
  }
  return days
})

/**
 * Robustere Event-Filterung
 * Akzeptiert sowohl e.startDate (ISO) als auch e.dateString Formate
 */
const getEventsForDay = (cellDate) => {
  // Erstelle einen Vergleichs-String im Format YYYY-MM-DD für ISO-Vergleich
  const isoDateStr = cellDate.toISOString().split('T')[0];
  // Erstelle einen Vergleichs-String für das alte dateString-Format (z.B. "Mon Mar 02 2026")
  const legacyDateStr = cellDate.toDateString();

  return events.value.filter(e => {
    // 1. Check ISO Format (startDate)
    if (e.startDate && e.startDate === isoDateStr) return true;
    
    // 2. Check Legacy Format (dateString)
    if (e.dateString && e.dateString === legacyDateStr) return true;

    // 3. Check Multi-Day Zeiträume
    if (e.startDate && e.endDate) {
      const d = new Date(isoDateStr).getTime();
      const start = new Date(e.startDate).getTime();
      const end = new Date(e.endDate).getTime();
      return d >= start && d <= end;
    }

    return false;
  });
}

const openModalWithDate = (date) => { 
  selectedDateForModal.value = date
  showModal.value = true 
}

const onSave = async (eventData) => {
  const success = await saveEvent(eventData)
  if (success) {
    showModal.value = false
    await fetchEvents() // Sofortiges Refresh nach Speichern
  }
}

onMounted(async () => {
  await fetchParticipants()
  await fetchEvents()
})
</script>

<style scoped>
/* Beibehalten deiner bestehenden Luxe-Styles */
.calendar-container { display: flex; flex-direction: column; gap: 24px; padding: 10px; height: 100%; color: white; }
.page-header { display: flex; justify-content: space-between; align-items: flex-end; }
.calendar-nav { display: flex; align-items: center; gap: 16px; margin-top: 10px; }
.nav-controls { display: flex; gap: 6px; }
.nav-btn-round { background: #1a1e26; border: 1px solid #2d3139; color: white; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; transition: 0.3s; }
.nav-btn-round:hover { border-color: #00bcd4; color: #00bcd4; }
.luxe-today-btn { background: #13161c; border: 1px solid #2d3139; color: white; padding: 6px 16px; border-radius: 10px; font-weight: 700; cursor: pointer; }
.month-label { font-size: 20px; font-weight: 800; margin-left: 10px; }
.header-right-actions { display: flex; align-items: center; gap: 16px; }
.view-switcher-glass { display: flex; background: #0b0e14; padding: 4px; border-radius: 12px; border: 1px solid #1f2229; }
.view-btn { background: transparent; border: none; color: #5c626d; padding: 7px 16px; border-radius: 9px; cursor: pointer; font-weight: 800; font-size: 13px; transition: 0.2s; }
.view-btn.active { background: #1f2229; color: #00bcd4; }
.add-event-luxe { background: #00bcd4; color: #0b0e14; border: none; padding: 10px 22px; border-radius: 12px; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 20px rgba(0, 188, 212, 0.2); }
.calendar-main-card { background: #13161c; border-radius: 24px; border: 1px solid #1f2229; overflow: hidden; flex: 1; position: relative; box-shadow: 0 20px 50px rgba(0,0,0,0.3); }
.grid-month { display: grid; grid-template-columns: repeat(7, 1fr); height: 100%; background: #1f2229; gap: 1px; }
.day-name-header { background: #13161c; padding: 14px; text-align: center; color: #5c626d; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; }
.grid-cell { background: #13161c; padding: 12px; min-height: 110px; cursor: pointer; transition: 0.2s; }
.grid-cell:hover { background: #181c25; }
.grid-cell.dimmed { opacity: 0.2; }
.grid-cell.is-today .cell-num { background: #00bcd4; color: #0b0e14; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-weight: 900; }
.cell-num { color: #5c626d; font-size: 14px; font-weight: 700; }
.event-tag { font-size: 10px; padding: 4px 10px; border-radius: 8px; margin-top: 5px; font-weight: 800; border-left: 4px solid transparent; background: rgba(255,255,255,0.03); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.event-tag.work { border-left-color: #00bcd4; color: #00bcd4; }
.event-tag.private { border-left-color: #fb923c; color: #fb923c; }
.event-tag.success { border-left-color: #22c55e; color: #22c55e; }
.event-tag.warning { border-left-color: #ef4444; color: #ef4444; }
.glass-loader { position: absolute; inset: 0; background: rgba(11, 14, 20, 0.8); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; font-size: 40px; color: #00bcd4; z-index: 100; }
</style>