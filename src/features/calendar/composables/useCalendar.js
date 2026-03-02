import { ref, computed } from 'vue'

export function useCalendar() {
  const currentDate = ref(new Date())
  const activeView = ref('Monat')
  const events = ref([])
  const participants = ref([])
  const isLoading = ref(false)
  const token = localStorage.getItem('workly_token')

  async function fetchEvents() {
    isLoading.value = true
    try {
      const res = await fetch('http://localhost:8000/api/calendar/events', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) events.value = await res.json()
    } catch (e) { console.error("Load Error:", e) } finally { isLoading.value = false }
  }

  async function fetchParticipants() {
    try {
      const res = await fetch('http://localhost:8000/api/calendar/participants', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) participants.value = await res.json()
    } catch (e) { console.error("Participants Error:", e) }
  }

  // TERMIN AN API SENDEN (FIX)
  async function saveEvent(eventData) {
    try {
      const res = await fetch('http://localhost:8000/api/calendar/events', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(eventData)
      })
      if (res.ok) {
        await fetchEvents() // Liste nach Erfolg neu laden
        return true
      }
    } catch (e) { 
      console.error("Save Error:", e)
      return false
    }
  }

  return { 
    currentDate, activeView, events, participants, isLoading, 
    fetchEvents, fetchParticipants, saveEvent 
  }
}