import { ref } from 'vue'

export function usePdfViewer() {
  const isPdfLoading = ref(false)
  const pdfUrl = ref(null)
  const pdfError = ref(null)

  const loadPdf = async (invoiceId) => {
    isPdfLoading.value = true
    pdfError.value = null
    
    try {
      const response = await fetch(`http://localhost:8000/api/invoice/${invoiceId}`, {
        method: 'GET',
        headers: { 'x-api-key': 'Workly_Safe_Token_123' }
      })

      if (!response.ok) throw new Error('PDF konnte nicht geladen werden.')

      const blob = await response.blob()
      
      if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value)
      pdfUrl.value = URL.createObjectURL(blob)
      
      return pdfUrl.value
    } catch (err) {
      pdfError.value = err.message
      return null
    } finally {
      isPdfLoading.value = false
    }
  }

  return { isPdfLoading, pdfUrl, pdfError, loadPdf }
}