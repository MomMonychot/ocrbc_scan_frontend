import { ref } from 'vue'

export const sharedDocument = ref({
  file: null,
  previewUrl: null,
  metadata: null,
  docType: 'standard',
})

export function setSharedDocument(file, previewUrl, metadata, docType = 'standard') {
  sharedDocument.value = {
    file,
    previewUrl,
    metadata,
    docType,
  }
}

export function clearSharedDocument() {
  sharedDocument.value = {
    file: null,
    previewUrl: null,
    metadata: null,
    docType: 'standard',
  }
}
