<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DocumentUpload from '../components/DocumentUpload.vue'
import { verifyExtractedFields } from '../services/api_client'
import { sharedDocument, clearSharedDocument } from '../services/documentStore'

const { t, locale } = useI18n()
const route = useRoute()

// Document state
const uploadedFile = ref(null)
const documentPreviewUrl = ref(null)
const inspectionMetadata = ref(null)
const isVerifying = ref(false)
const verificationResult = ref(null)
const verificationError = ref(null)
const exportNotification = ref(null)

// AI Processing & Feedback State
const isProcessingAi = ref(false)
const aiExtractionCompleted = ref(false)
const aiExtractionToast = ref(null)
const editedFields = ref(new Set())

// Canvas & Zoom state
const canvasZoom = ref(1.0)
const isAdvancedMode = ref(false)
const selectedFieldKey = ref('full_name_km')
const canvasContainerRef = ref(null)

// Document type: 'standard' (សេចក្តីចម្លងសំបុត្រកំណើត - no បញ្ជាក់) vs 'certified' (សេចក្តីចម្លងសំបុត្របញ្ជាក់កំណើត)
const selectedDocType = ref('standard')

// Bounding box definitions (relative percentage coordinates for responsive scaling)
const boundingBoxes = ref([
  {
    key: 'certificate_no',
    labelKey: 'verification.fields.certificate_no',
    x: 10.0,
    y: 11.0,
    width: 32.0,
    height: 5.5,
    color: 'border-indigo-500 bg-indigo-500/15 text-indigo-700',
  },
  {
    key: 'national_id',
    labelKey: 'verification.fields.national_id',
    x: 60.0,
    y: 11.0,
    width: 30.0,
    height: 5.5,
    color: 'border-blue-500 bg-blue-500/15 text-blue-700',
  },
  {
    key: 'full_name_km',
    labelKey: 'verification.fields.full_name_km',
    x: 24.0,
    y: 25.0,
    width: 52.0,
    height: 6.5,
    color: 'border-emerald-500 bg-emerald-500/15 text-emerald-700',
  },
  {
    key: 'full_name_en',
    labelKey: 'verification.fields.full_name_en',
    x: 24.0,
    y: 33.5,
    width: 52.0,
    height: 6.0,
    color: 'border-teal-500 bg-teal-500/15 text-teal-700',
  },
  {
    key: 'gender',
    labelKey: 'verification.fields.gender',
    x: 78.0,
    y: 33.5,
    width: 14.0,
    height: 6.0,
    color: 'border-cyan-500 bg-cyan-500/15 text-cyan-700',
  },
  {
    key: 'birth_date',
    labelKey: 'verification.fields.birth_date',
    x: 24.0,
    y: 41.5,
    width: 38.0,
    height: 5.5,
    color: 'border-amber-500 bg-amber-500/15 text-amber-700',
  },
  {
    key: 'birth_place',
    labelKey: 'verification.fields.birth_place',
    x: 24.0,
    y: 49.0,
    width: 66.0,
    height: 6.0,
    color: 'border-orange-500 bg-orange-500/15 text-orange-700',
  },
  {
    key: 'father_name',
    labelKey: 'verification.fields.father_name',
    x: 24.0,
    y: 57.0,
    width: 46.0,
    height: 6.0,
    color: 'border-violet-500 bg-violet-500/15 text-violet-700',
  },
  {
    key: 'mother_name',
    labelKey: 'verification.fields.mother_name',
    x: 24.0,
    y: 65.0,
    width: 46.0,
    height: 6.0,
    color: 'border-pink-500 bg-pink-500/15 text-pink-700',
  },
  {
    key: 'district_office',
    labelKey: 'verification.fields.district_office',
    x: 24.0,
    y: 73.0,
    width: 54.0,
    height: 6.0,
    color: 'border-purple-500 bg-purple-500/15 text-purple-700',
  },
])

// Editable Form Model for New Template
const extractedFields = ref({
  national_id: '1204009821',
  certificate_no: 'BC-2024-009821',
  full_name_km: 'សុខ ចាន់ដារា',
  full_name_en: 'SOK CHANDARAA',
  gender: 'ប្រុស',
  birth_date: '2000-05-15',
  birth_place: 'សង្កាត់ផ្សារថ្មីទី១ ខណ្ឌដូនពេញ រាជធានីភ្នំពេញ',
  father_name: 'សុខ សុវណ្ណ',
  mother_name: 'ចាន់ ធីតា',
  district_office: 'ដូនពេញ (Daun Penh)',
})

// Active selected bounding box for inspector
const selectedBox = computed(() => {
  return boundingBoxes.value.find((b) => b.key === selectedFieldKey.value) || boundingBoxes.value[0]
})

// -------------------------------------------------------------
// Interactive Bounding Box Drag-to-Move Logic
// -------------------------------------------------------------
const isMovingBox = ref(false)
const movingBoxKey = ref(null)
const moveStart = ref({ x: 0, y: 0 })
const initialBoxPos = ref({ x: 0, y: 0 })

function getRelativePercentCoords(e) {
  if (!canvasContainerRef.value) return { x: 0, y: 0 }
  const rect = canvasContainerRef.value.getBoundingClientRect()
  const rawX = ((e.clientX - rect.left) / rect.width) * 100
  const rawY = ((e.clientY - rect.top) / rect.height) * 100
  const x = Math.max(0, Math.min(100, Math.round(rawX * 10) / 10))
  const y = Math.max(0, Math.min(100, Math.round(rawY * 10) / 10))
  return { x, y }
}

function handleBoxMouseDown(e, box) {
  e.stopPropagation()
  selectedFieldKey.value = box.key
  isMovingBox.value = true
  movingBoxKey.value = box.key
  const coords = getRelativePercentCoords(e)
  moveStart.value = coords
  initialBoxPos.value = { x: box.x, y: box.y }
}

function handleCanvasMouseMove(e) {
  if (!isMovingBox.value || !movingBoxKey.value) return
  const box = boundingBoxes.value.find((b) => b.key === movingBoxKey.value)
  if (!box) return
  const coords = getRelativePercentCoords(e)
  const dx = coords.x - moveStart.value.x
  const dy = coords.y - moveStart.value.y
  box.x = Math.max(0, Math.min(100 - box.width, Math.round((initialBoxPos.value.x + dx) * 10) / 10))
  box.y = Math.max(0, Math.min(100 - box.height, Math.round((initialBoxPos.value.y + dy) * 10) / 10))
}

function handleCanvasMouseUp() {
  if (isMovingBox.value) {
    isMovingBox.value = false
    movingBoxKey.value = null
  }
}

// -------------------------------------------------------------
// AI Extraction Process & Municipal Verification
// -------------------------------------------------------------
async function handleProcessAiExtraction() {
  isProcessingAi.value = true
  aiExtractionToast.value = null

  try {
    // Simulate AI model reading textual pixels in bounding box regions
    await new Promise((resolve) => setTimeout(resolve, 700))

    // Call municipal verification cross-reference API
    await triggerMunicipalCrossReference()

    aiExtractionCompleted.value = true
    aiExtractionToast.value = t('verification.process_success')
    setTimeout(() => {
      aiExtractionToast.value = null
    }, 5500)
  } catch (err) {
    console.error('Error executing AI extraction:', err)
  } finally {
    isProcessingAi.value = false
  }
}

function onFieldInput(key) {
  editedFields.value.add(key)
}

function isFieldEdited(key) {
  return editedFields.value.has(key)
}

// Match status classifier for field color-coding
function getFieldMatchStatus(key) {
  if (!verificationResult.value) {
    return { status: 'pending', color: 'border-slate-300 bg-slate-50', score: 100 }
  }

  const discrepancy = verificationResult.value.discrepancy_fields?.find((d) => d.field === key)
  if (discrepancy) {
    return {
      status: 'review_required',
      color: 'border-red-400 bg-red-50/70 text-red-900',
      badgeColor: 'bg-red-100 text-red-800 border-red-200',
      score: discrepancy.similarity_score,
      refValue: discrepancy.reference_value,
    }
  }

  // Check if auto-corrected
  const verifiedVal = verificationResult.value.verified_fields?.[key]
  const originalVal = extractedFields.value[key]
  const matchedRecord = verificationResult.value.matched_records?.[0]
  const refVal = matchedRecord?.[key] || verifiedVal

  if (verifiedVal && originalVal && verifiedVal !== originalVal) {
    return {
      status: 'corrected',
      color: 'border-amber-400 bg-amber-50/70 text-amber-900',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      score: 96,
      refValue: verifiedVal,
    }
  }

  return {
    status: 'verified',
    color: 'border-emerald-400 bg-emerald-50/60 text-emerald-900',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    score: 100,
    refValue: refVal || originalVal,
  }
}

// Zoom Canvas controls
function zoomIn() {
  if (canvasZoom.value < 2.0) canvasZoom.value = Math.round((canvasZoom.value + 0.15) * 100) / 100
}
function zoomOut() {
  if (canvasZoom.value > 0.6) canvasZoom.value = Math.round((canvasZoom.value - 0.15) * 100) / 100
}
function resetZoom() {
  canvasZoom.value = 1.0
}

function selectField(key) {
  selectedFieldKey.value = key
}

// Document Upload Event Handlers
function onDocumentInspected(data) {
  inspectionMetadata.value = data
}

function onProceedToVerification({ file, inspectResult, previewUrl }) {
  uploadedFile.value = file
  documentPreviewUrl.value = previewUrl
  inspectionMetadata.value = inspectResult
  triggerMunicipalCrossReference()
}

// Fast sample loader for instant testing
function loadSampleScan() {
  uploadedFile.value = {
    name: 'archival_sample_birth_cert.png',
    size: 1024 * 720,
    type: 'image/png',
  }
  documentPreviewUrl.value = null // renders simulated vintage scan canvas
  triggerMunicipalCrossReference()
}

// Call backend API /api/v1/documents/verify
async function triggerMunicipalCrossReference() {
  isVerifying.value = true
  verificationError.value = null

  try {
    const data = await verifyExtractedFields(extractedFields.value)
    verificationResult.value = data
  } catch (err) {
    verificationError.value = err.message || 'Error executing municipal cross-reference.'
  } finally {
    isVerifying.value = false
  }
}

// Approve & Export: triggers local JSON/document receipt download adhering to ZDR
function handleApproveAndExport() {
  exportNotification.value = t('verification.actions.export_downloading')

  setTimeout(() => {
    const reportData = {
      service: 'District Administration Civil Registration Verification Platform',
      security_protocol: 'Zero-Data-Retention (ZDR-RAM-v1)',
      export_timestamp_utc: new Date().toISOString(),
      officer_approval_status: 'APPROVED',
      certificate_type: selectedDocType.value === 'certified' ? 'សេចក្តីចម្លងសំបុត្របញ្ជាក់កំណើត' : 'សេចក្តីចម្លងសំបុត្រកំណើត',
      audit_hash: verificationResult.value?.audit_hash || 'none',
      confidence_level: verificationResult.value?.confidence_level || 100.0,
      approved_new_template_fields: {
        ...extractedFields.value,
      },
      officer_manually_edited_fields: Array.from(editedFields.value),
      matched_municipal_record: verificationResult.value?.matched_records?.[0] || null,
      aligned_bounding_boxes: boundingBoxes.value,
    }

    // Trigger local client-side file download
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `civil_birth_certificate_new_template_${extractedFields.value.national_id || 'approved'}.json`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)

    exportNotification.value = t('verification.actions.export_success')
    setTimeout(() => {
      exportNotification.value = null
    }, 6000)
  }, 400)
}

function handleUploadNewDocument() {
  uploadedFile.value = null
  if (documentPreviewUrl.value) {
    URL.revokeObjectURL(documentPreviewUrl.value)
    documentPreviewUrl.value = null
  }
  verificationResult.value = null
  inspectionMetadata.value = null
  aiExtractionCompleted.value = false
  editedFields.value.clear()
}

onMounted(() => {
  if (route.query.type === 'certified') {
    selectedDocType.value = 'certified'
  } else if (route.query.type === 'standard') {
    selectedDocType.value = 'standard'
  }

  // Preload shared document if passed from HomeView upload
  if (sharedDocument.value.file) {
    uploadedFile.value = sharedDocument.value.file
    documentPreviewUrl.value = sharedDocument.value.previewUrl
    inspectionMetadata.value = sharedDocument.value.metadata
    if (sharedDocument.value.docType) {
      selectedDocType.value = sharedDocument.value.docType
    }
  }

  // If an initial document is available, cross-reference
  if (uploadedFile.value) {
    triggerMunicipalCrossReference()
  }
})

watch(
  () => route.query.type,
  (newType) => {
    if (newType === 'certified') selectedDocType.value = 'certified'
    else if (newType === 'standard') selectedDocType.value = 'standard'
  }
)
</script>

<template>
  <div class="min-h-screen bg-gov-surface py-6 sm:py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-8">
      
      <!-- Top Title & Navigation Ribbon -->
      <div class="flex items-center justify-between pb-6 mb-6 border-b border-gov-border gap-4 min-h-[52px]">
        <div class="min-w-0">
          <h1 class="text-2xl sm:text-3xl font-extrabold text-gov-primary tracking-tight truncate">
            {{ t('verification.title') }}
          </h1>
          <p class="text-xs sm:text-sm text-gov-text-secondary mt-1 truncate">
            {{ t('verification.subtitle') }}
          </p>
        </div>

        <div v-if="uploadedFile" class="flex items-center gap-3 shrink-0">
          <button
            @click="handleUploadNewDocument"
            class="h-9 px-4 rounded-xl text-xs font-semibold text-gov-primary bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all inline-flex items-center justify-center whitespace-nowrap select-none w-auto"
          >
            {{ t('verification.actions.back_to_upload') }}
          </button>
        </div>
      </div>

      <!-- State 1: Upload Dropzone if no file uploaded yet -->
      <div v-if="!uploadedFile" class="my-8 space-y-6">
        <DocumentUpload
          @inspected="onDocumentInspected"
          @proceed="onProceedToVerification"
        />

        <!-- Instant Sample Scan Option -->
        <div class="p-6 bg-white rounded-2xl border border-gov-border text-center shadow-gov-sm max-w-xl mx-auto">
          <div class="w-12 h-12 mx-auto rounded-2xl bg-blue-50 text-gov-primary flex items-center justify-center mb-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-sm font-bold text-slate-800 mb-1">
            {{ t('verification.sample_doc_btn') }}
          </h3>
          <p class="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
            {{ t('verification.sample_doc_desc') }}
          </p>
          <button
            type="button"
            @click="loadSampleScan"
            class="h-10 px-6 rounded-xl bg-gov-primary hover:bg-gov-primary-hover text-white text-xs font-bold shadow-gov-sm transition-all inline-flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ t('verification.sample_doc_btn') }}</span>
          </button>
        </div>
      </div>

      <!-- State 2: Side-by-Side Interactive Verification Workspace -->
      <div v-else class="space-y-6">
        
        <!-- Status Notification Banner -->
        <div
          v-if="verificationResult"
          :class="[
            'p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 min-h-[72px]',
            verificationResult.requires_manual_review
              ? 'bg-amber-50/90 border-amber-300 text-amber-950'
              : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
          ]"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div
              :class="[
                'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm',
                verificationResult.requires_manual_review
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-600 text-white'
              ]"
            >
              <svg v-if="verificationResult.requires_manual_review" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div class="min-w-0">
              <h3 class="text-sm font-bold truncate">
                {{
                  verificationResult.requires_manual_review
                    ? t('verification.officer_review_banner')
                    : t('verification.verified_banner')
                }}
              </h3>
              <p class="text-xs opacity-90 truncate">
                {{
                  verificationResult.requires_manual_review
                    ? t('verification.manual_review_warning')
                    : t('verification.verified_success')
                }}
              </p>
            </div>
          </div>

          <div class="hidden sm:flex items-center gap-2 shrink-0">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Confidence:</span>
            <span
              :class="[
                'px-2.5 py-1 rounded-full text-xs font-black shadow-sm',
                verificationResult.requires_manual_review ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
              ]"
            >
              {{ verificationResult.confidence_level }}%
            </span>
          </div>
        </div>

        <!-- AI Extraction Success Toast Banner -->
        <transition
          enter-active-class="transform ease-out duration-300 transition"
          enter-from-class="-translate-y-2 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition ease-in duration-200"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="aiExtractionToast"
            class="p-4 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold border border-emerald-500"
          >
            <div class="flex items-center gap-2.5">
              <span class="w-3 h-3 rounded-full bg-white animate-ping"></span>
              <span>{{ aiExtractionToast }}</span>
            </div>
            <button @click="aiExtractionToast = null" class="text-emerald-100 hover:text-white font-bold px-2">
              ✕
            </button>
          </div>
        </transition>

        <!-- Main Workspace Grid: Left Old Scan (Movable Boxes) + Process AI Button, Right New Target Template (Editable) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- ================================================================= -->
          <!-- LEFT PANE: Old Uploaded Scan with Movable Bounding Boxes (Col 6)  -->
          <!-- ================================================================= -->
          <div class="lg:col-span-6 bg-white rounded-2xl border border-gov-border shadow-gov-md p-5 flex flex-col space-y-4">
            
            <!-- Pane Header & Toolbar -->
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <div class="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></div>
                  <h2 class="text-sm font-bold text-slate-900 truncate">
                    {{ t('verification.left_pane_title') }}
                  </h2>
                </div>
                <p class="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  {{ t('verification.left_pane_hint') }}
                </p>
              </div>

              <!-- Controls: Zoom & Mode Toggle -->
              <div class="flex items-center gap-1.5 shrink-0">
                <div class="inline-flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-xs h-8">
                  <button
                    @click="zoomOut"
                    class="w-7 h-7 flex items-center justify-center hover:bg-white rounded text-slate-600 hover:text-slate-900 transition-colors"
                    title="Zoom Out"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                    </svg>
                  </button>
                  <span class="px-1.5 font-mono text-[11px] font-semibold text-slate-700">
                    {{ Math.round(canvasZoom * 100) }}%
                  </span>
                  <button
                    @click="zoomIn"
                    class="w-7 h-7 flex items-center justify-center hover:bg-white rounded text-slate-600 hover:text-slate-900 transition-colors"
                    title="Zoom In"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <button
                    @click="resetZoom"
                    class="h-7 px-2 text-[10px] text-slate-500 hover:text-slate-900 border-l border-slate-200 inline-flex items-center justify-center font-medium transition-colors"
                  >
                    {{ t('verification.reset_view') }}
                  </button>
                </div>

                <!-- Advanced Mode Toggle -->
                <button
                  type="button"
                  @click="isAdvancedMode = !isAdvancedMode"
                  :class="[
                    'h-8 px-2.5 rounded-lg text-xs font-semibold border transition-all inline-flex items-center justify-center whitespace-nowrap select-none',
                    isAdvancedMode
                      ? 'bg-gov-primary text-white border-gov-primary shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  ]"
                >
                  {{ isAdvancedMode ? 'XY' : 'XY' }}
                </button>
              </div>
            </div>

            <!-- Viewport & Canvas Overlay Container -->
            <div
              ref="canvasContainerRef"
              @mousemove="handleCanvasMouseMove"
              @mouseup="handleCanvasMouseUp"
              @mouseleave="handleCanvasMouseUp"
              class="relative w-full aspect-[4/5] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center select-none"
            >
              <!-- Zoom Transform Layer -->
              <div
                class="relative transition-transform duration-100 ease-out origin-center"
                :style="{ transform: `scale(${canvasZoom})` }"
              >
                <!-- Rendered Image if available -->
                <img
                  v-if="documentPreviewUrl"
                  :src="documentPreviewUrl"
                  alt="Uploaded Document"
                  class="max-w-full max-h-[520px] object-contain rounded shadow-sm pointer-events-none"
                />

                <!-- Simulated Government Archival Scan Document Canvas if no raw image -->
                <div
                  v-else
                  class="w-[380px] h-[490px] bg-[#fffdfa] rounded-lg shadow-md border border-amber-200/80 p-6 flex flex-col justify-between font-serif relative overflow-hidden"
                >
                  <!-- Background Watermark / Seal -->
                  <div class="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                    <div class="w-64 h-64 rounded-full border-[16px] border-slate-900"></div>
                  </div>

                  <!-- Header Area -->
                  <div class="text-center space-y-1 relative z-10">
                    <div class="w-10 h-10 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-gov-primary font-bold text-xs shadow-sm">
                      🇰🇭
                    </div>
                    <div class="text-[11px] font-bold text-slate-800 tracking-wider">
                      {{ locale === 'km' ? 'ព្រះរាជាណាចក្រកម្ពុជា' : 'KINGDOM OF CAMBODIA' }}
                    </div>
                    <div class="text-[9px] text-slate-500">
                      {{ locale === 'km' ? 'ជាតិ សាសនា ព្រះមហាក្សត្រ' : 'NATION RELIGION KING' }}
                    </div>
                    <div class="text-xs font-extrabold text-gov-primary font-sans pt-1">
                      {{ selectedDocType === 'certified'
                          ? (locale === 'km' ? 'សេចក្តីចម្លងសំបុត្របញ្ជាក់កំណើត (ឯកសារដើម)' : 'CERTIFIED COPY OF BIRTH CERTIFICATE (ORIGINAL)')
                          : (locale === 'km' ? 'សេចក្តីចម្លងសំបុត្រកំណើត (ឯកសារដើម)' : 'COPY OF BIRTH CERTIFICATE (ORIGINAL)') }}
                    </div>
                  </div>

                  <!-- Body Lines simulating old typewriter/stamped scan -->
                  <div class="space-y-3.5 text-[10px] text-slate-700 border-t border-b border-amber-200/60 py-3 font-sans relative z-10">
                    <div class="flex justify-between font-mono text-[9px] text-slate-500">
                      <span>{{ locale === 'km' ? 'លេខសម្គាល់: ' : 'ID: ' }} <span class="font-bold text-slate-900">1204009821</span></span>
                      <span>{{ locale === 'km' ? 'សំបុត្រលេខ: ' : 'No: ' }} <span class="font-bold text-slate-900">BC-2024-009821</span></span>
                    </div>
                    <div>{{ locale === 'km' ? 'ឈ្មោះខ្មែរ:' : 'Khmer Name:' }} <span class="font-bold text-slate-900 font-khmer text-[11px]">សុខ ចាន់ដារា</span></div>
                    <div>{{ locale === 'km' ? 'ឈ្មោះឡាតាំង:' : 'Latin Name:' }} <span class="font-bold text-slate-900 font-latin text-[11px]">SOK CHANDARAA</span></div>
                    <div>{{ locale === 'km' ? 'ភេទ:' : 'Gender:' }} <span class="font-semibold text-slate-900">ប្រុស</span></div>
                    <div>{{ locale === 'km' ? 'ថ្ងៃខែឆ្នាំកំណើត:' : 'Date of Birth:' }} <span class="font-semibold text-slate-900">១៥ ឧសភា ២០០០ (2000-05-15)</span></div>
                    <div>{{ locale === 'km' ? 'ទីកន្លែងកំណើត:' : 'Birth Place:' }} <span class="font-semibold text-slate-900">សង្កាត់ផ្សារថ្មីទី១ ខណ្ឌដូនពេញ រាជធានីភ្នំពេញ</span></div>
                    <div>{{ locale === 'km' ? 'ឪពុក:' : 'Father:' }} <span class="font-semibold text-slate-900">សុខ សុវណ្ណ</span></div>
                    <div>{{ locale === 'km' ? 'ម្តាយ:' : 'Mother:' }} <span class="font-semibold text-slate-900">ចាន់ ធីតា</span></div>
                    <div>{{ locale === 'km' ? 'រដ្ឋបាលខណ្ឌ:' : 'District:' }} <span class="font-semibold text-slate-900">ដូនពេញ • រាជធានីភ្នំពេញ</span></div>
                  </div>

                  <!-- Footer Stamp Section -->
                  <div class="flex justify-between items-end text-[9px] text-slate-500 relative z-10">
                    <div>{{ locale === 'km' ? 'ការិយាល័យច្រកចេញចូលតែមួយ' : 'One Window Service' }}</div>
                    <div class="text-center">
                      <div class="w-12 h-12 rounded-full border-2 border-red-400 bg-red-50 text-red-700 flex items-center justify-center text-[8px] font-bold shadow-sm">
                        {{ locale === 'km' ? 'ត្រាផ្លូវការ' : 'SEAL' }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ============================================================= -->
                <!-- INTERACTIVE MOVABLE BOUNDING BOXES OVERLAY                     -->
                <!-- ============================================================= -->
                <div
                  v-for="box in boundingBoxes"
                  :key="box.key"
                  @mousedown="handleBoxMouseDown($event, box)"
                  :style="{
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    width: `${box.width}%`,
                    height: `${box.height}%`,
                  }"
                  :class="[
                    'absolute border-2 rounded transition-shadow cursor-move flex items-center justify-between px-1.5 select-none',
                    selectedFieldKey === box.key
                      ? 'ring-4 ring-gov-primary/40 border-gov-primary bg-gov-primary/20 z-30 shadow-lg'
                      : `${box.color} hover:ring-2 hover:ring-slate-400 z-20`
                  ]"
                  :title="`Drag to reposition ${box.key}`"
                >
                  <span class="text-[9px] font-bold truncate tracking-tight uppercase pointer-events-none drop-shadow-sm">
                    {{ t(box.labelKey) }}
                  </span>
                  
                  <span
                    v-if="selectedFieldKey === box.key"
                    class="w-2 h-2 rounded-full bg-gov-primary animate-ping shrink-0"
                  ></span>
                </div>
              </div>
            </div>

            <!-- Advanced Coordinates Panel (Optional Drawer) -->
            <div
              v-if="isAdvancedMode"
              class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2"
            >
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-800">
                  {{ t(selectedBox.labelKey) }} (<span class="text-gov-primary font-mono">{{ selectedBox.key }}</span>)
                </span>
                <span class="text-[10px] text-slate-400 font-mono">X: {{ selectedBox.x }}% | Y: {{ selectedBox.y }}%</span>
              </div>

              <div class="grid grid-cols-4 gap-2">
                <div>
                  <label class="text-[10px] text-slate-500 font-semibold">X Pos (%)</label>
                  <input
                    v-model.number="selectedBox.x"
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    class="w-full mt-0.5 px-2 py-1 rounded bg-white border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label class="text-[10px] text-slate-500 font-semibold">Y Pos (%)</label>
                  <input
                    v-model.number="selectedBox.y"
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    class="w-full mt-0.5 px-2 py-1 rounded bg-white border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label class="text-[10px] text-slate-500 font-semibold">Width (%)</label>
                  <input
                    v-model.number="selectedBox.width"
                    type="number"
                    step="0.5"
                    min="1"
                    max="100"
                    class="w-full mt-0.5 px-2 py-1 rounded bg-white border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label class="text-[10px] text-slate-500 font-semibold">Height (%)</label>
                  <input
                    v-model.number="selectedBox.height"
                    type="number"
                    step="0.5"
                    min="1"
                    max="100"
                    class="w-full mt-0.5 px-2 py-1 rounded bg-white border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <!-- Field Selection Quick Badges -->
            <div class="flex flex-wrap gap-1.5 pt-1">
              <button
                v-for="b in boundingBoxes"
                :key="b.key"
                @click="selectField(b.key)"
                :class="[
                  'h-6 px-2 rounded-lg text-[10px] font-semibold border transition-all inline-flex items-center justify-center whitespace-nowrap select-none',
                  selectedFieldKey === b.key
                    ? 'bg-gov-primary text-white border-gov-primary shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                ]"
              >
                {{ t(b.labelKey) }}
              </button>
            </div>

            <!-- ============================================================= -->
            <!-- PROMINENT ACTION: PROCESS / EXTRACT WITH AI BUTTON             -->
            <!-- ============================================================= -->
            <div class="pt-2 border-t border-slate-100">
              <button
                type="button"
                @click="handleProcessAiExtraction"
                :disabled="isProcessingAi"
                class="w-full h-12 rounded-xl bg-gov-primary hover:bg-gov-primary-hover active:scale-[0.99] text-white font-bold text-sm shadow-gov-md hover:shadow-gov-lg transition-all flex items-center justify-center gap-2.5 select-none disabled:opacity-60"
              >
                <svg v-if="!isProcessingAi" class="w-5 h-5 text-amber-300 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
                </svg>
                <svg v-else class="w-5 h-5 animate-spin text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span class="tracking-wide">
                  {{ isProcessingAi ? t('verification.btn_processing') : t('verification.btn_process_ai') }}
                </span>
              </button>
            </div>

          </div>

          <!-- ================================================================= -->
          <!-- RIGHT PANE: NEW TEMPLATE (AUTO-POPULATED & DIRECTLY EDITABLE) (Col 6)-->
          <!-- ================================================================= -->
          <div class="lg:col-span-6 bg-white rounded-2xl border border-gov-border shadow-gov-md p-5 flex flex-col justify-between space-y-5">
            
            <div class="space-y-4">
              <!-- Pane Header & Controls -->
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></div>
                    <h2 class="text-sm font-bold text-slate-900 truncate">
                      {{ t('verification.right_pane_title') }}
                    </h2>
                  </div>
                  <p class="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {{ t('verification.right_pane_hint') }}
                  </p>
                </div>

                <!-- Document Type Switcher (Standard vs Certified) -->
                <div class="inline-flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-xs h-8 shrink-0">
                  <button
                    type="button"
                    @click="selectedDocType = 'standard'"
                    :class="[
                      'h-7 px-2.5 rounded-md text-[11px] font-bold transition-all whitespace-nowrap select-none',
                      selectedDocType === 'standard' ? 'bg-white text-gov-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    ]"
                  >
                    {{ locale === 'km' ? 'សេចក្តីចម្លងសំបុត្រកំណើត' : 'Birth Certificate' }}
                  </button>
                  <button
                    type="button"
                    @click="selectedDocType = 'certified'"
                    :class="[
                      'h-7 px-2.5 rounded-md text-[11px] font-bold transition-all whitespace-nowrap select-none',
                      selectedDocType === 'certified' ? 'bg-white text-gov-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    ]"
                  >
                    {{ locale === 'km' ? 'សេចក្តីចម្លងសំបុត្របញ្ជាក់កំណើត' : 'Certified Copy' }}
                  </button>
                </div>
              </div>

              <!-- ============================================================= -->
              <!-- THE NEW TEMPLATE CERTIFICATE SHEET (INLINE EDITABLE)          -->
              <!-- ============================================================= -->
              <div class="bg-white rounded-2xl border-2 border-slate-200 p-6 sm:p-7 shadow-sm space-y-5 font-serif relative">
                
                <!-- Certificate Top Header with Emblem -->
                <div class="text-center space-y-1.5 pb-3 border-b border-slate-200">
                  <div class="w-12 h-12 mx-auto rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-gov-primary text-base shadow-sm">
                    🇰🇭
                  </div>
                  <div class="text-xs sm:text-sm font-bold text-slate-900 tracking-wider">
                    {{ t('verification.official_emblem_title') }}
                  </div>
                  <div class="text-[10px] text-slate-500 font-sans tracking-wide">
                    {{ t('verification.official_emblem_sub') }}
                  </div>
                  <div class="text-xs sm:text-sm font-black text-gov-primary font-sans pt-1">
                    {{ selectedDocType === 'certified'
                        ? (locale === 'km' ? 'សេចក្តីចម្លងសំបុត្របញ្ជាក់កំណើត' : 'CERTIFIED COPY OF BIRTH CERTIFICATE')
                        : (locale === 'km' ? 'សេចក្តីចម្លងសំបុត្រកំណើត' : 'COPY OF BIRTH CERTIFICATE') }}
                  </div>
                </div>

                <!-- Editable Instruction Indicator -->
                <div class="flex items-center justify-between text-[11px] font-sans px-2.5 py-1.5 rounded-lg bg-blue-50/70 border border-blue-200/60 text-blue-900">
                  <div class="flex items-center gap-1.5 font-medium">
                    <svg class="w-3.5 h-3.5 text-gov-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span>{{ t('verification.editable_hint') }}</span>
                  </div>
                  <span class="text-[10px] font-bold text-gov-primary bg-white px-2 py-0.5 rounded shadow-xs shrink-0">
                    {{ t('verification.editable_badge') }}
                  </span>
                </div>

                <!-- Form Fields Grid: Standardized Cambodian Civil Certificate Format -->
                <div class="space-y-3 font-sans text-xs">
                  
                  <!-- Top Row: Certificate No & National ID -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="p-2.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-gov-primary/30 transition-all">
                      <div class="flex justify-between items-center mb-1">
                        <label class="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {{ t('verification.fields.certificate_no') }}
                        </label>
                        <span v-if="isFieldEdited('certificate_no')" class="text-[9px] font-bold px-1.5 rounded bg-blue-100 text-blue-800">
                          {{ t('verification.edited_badge') }}
                        </span>
                      </div>
                      <input
                        v-model="extractedFields.certificate_no"
                        @input="onFieldInput('certificate_no')"
                        type="text"
                        class="w-full text-xs font-bold text-slate-900 bg-transparent focus:outline-none"
                      />
                    </div>

                    <div class="p-2.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-gov-primary/30 transition-all">
                      <div class="flex justify-between items-center mb-1">
                        <label class="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {{ t('verification.fields.national_id') }}
                        </label>
                        <span v-if="isFieldEdited('national_id')" class="text-[9px] font-bold px-1.5 rounded bg-blue-100 text-blue-800">
                          {{ t('verification.edited_badge') }}
                        </span>
                      </div>
                      <input
                        v-model="extractedFields.national_id"
                        @input="onFieldInput('national_id')"
                        type="text"
                        class="w-full text-xs font-bold font-mono text-gov-primary bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>

                  <!-- Name in Khmer -->
                  <div class="p-2.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-gov-primary/30 transition-all">
                    <div class="flex justify-between items-center mb-1">
                      <label class="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {{ t('verification.fields.full_name_km') }}
                      </label>
                      <span v-if="isFieldEdited('full_name_km')" class="text-[9px] font-bold px-1.5 rounded bg-blue-100 text-blue-800">
                        {{ t('verification.edited_badge') }}
                      </span>
                    </div>
                    <input
                      v-model="extractedFields.full_name_km"
                      @input="onFieldInput('full_name_km')"
                      type="text"
                      class="w-full text-xs font-bold font-khmer text-slate-900 bg-transparent focus:outline-none"
                    />
                  </div>

                  <!-- Name in Latin & Gender -->
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div class="sm:col-span-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-gov-primary/30 transition-all">
                      <div class="flex justify-between items-center mb-1">
                        <label class="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {{ t('verification.fields.full_name_en') }}
                        </label>
                        <span v-if="isFieldEdited('full_name_en')" class="text-[9px] font-bold px-1.5 rounded bg-blue-100 text-blue-800">
                          {{ t('verification.edited_badge') }}
                        </span>
                      </div>
                      <input
                        v-model="extractedFields.full_name_en"
                        @input="onFieldInput('full_name_en')"
                        type="text"
                        class="w-full text-xs font-bold font-latin uppercase text-slate-900 bg-transparent focus:outline-none"
                      />
                    </div>

                    <div class="p-2.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-gov-primary/30 transition-all">
                      <div class="flex justify-between items-center mb-1">
                        <label class="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {{ t('verification.fields.gender') }}
                        </label>
                        <span v-if="isFieldEdited('gender')" class="text-[9px] font-bold px-1.5 rounded bg-blue-100 text-blue-800">
                          {{ t('verification.edited_badge') }}
                        </span>
                      </div>
                      <input
                        v-model="extractedFields.gender"
                        @input="onFieldInput('gender')"
                        type="text"
                        class="w-full text-xs font-bold text-slate-900 bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>

                  <!-- Date of Birth -->
                  <div class="p-2.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-gov-primary/30 transition-all">
                    <div class="flex justify-between items-center mb-1">
                      <label class="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {{ t('verification.fields.birth_date') }}
                      </label>
                      <span v-if="isFieldEdited('birth_date')" class="text-[9px] font-bold px-1.5 rounded bg-blue-100 text-blue-800">
                        {{ t('verification.edited_badge') }}
                      </span>
                    </div>
                    <input
                      v-model="extractedFields.birth_date"
                      @input="onFieldInput('birth_date')"
                      type="text"
                      class="w-full text-xs font-bold font-mono text-slate-900 bg-transparent focus:outline-none"
                    />
                  </div>

                  <!-- Place of Birth -->
                  <div class="p-2.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-gov-primary/30 transition-all">
                    <div class="flex justify-between items-center mb-1">
                      <label class="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {{ t('verification.fields.birth_place') }}
                      </label>
                      <span v-if="isFieldEdited('birth_place')" class="text-[9px] font-bold px-1.5 rounded bg-blue-100 text-blue-800">
                        {{ t('verification.edited_badge') }}
                      </span>
                    </div>
                    <input
                      v-model="extractedFields.birth_place"
                      @input="onFieldInput('birth_place')"
                      type="text"
                      class="w-full text-xs font-semibold text-slate-900 bg-transparent focus:outline-none"
                    />
                  </div>

                  <!-- Father & Mother Names -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="p-2.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-gov-primary/30 transition-all">
                      <div class="flex justify-between items-center mb-1">
                        <label class="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {{ t('verification.fields.father_name') }}
                        </label>
                        <span v-if="isFieldEdited('father_name')" class="text-[9px] font-bold px-1.5 rounded bg-blue-100 text-blue-800">
                          {{ t('verification.edited_badge') }}
                        </span>
                      </div>
                      <input
                        v-model="extractedFields.father_name"
                        @input="onFieldInput('father_name')"
                        type="text"
                        class="w-full text-xs font-bold text-slate-900 bg-transparent focus:outline-none"
                      />
                    </div>

                    <div class="p-2.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-gov-primary/30 transition-all">
                      <div class="flex justify-between items-center mb-1">
                        <label class="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {{ t('verification.fields.mother_name') }}
                        </label>
                        <span v-if="isFieldEdited('mother_name')" class="text-[9px] font-bold px-1.5 rounded bg-blue-100 text-blue-800">
                          {{ t('verification.edited_badge') }}
                        </span>
                      </div>
                      <input
                        v-model="extractedFields.mother_name"
                        @input="onFieldInput('mother_name')"
                        type="text"
                        class="w-full text-xs font-bold text-slate-900 bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>

                  <!-- District Office -->
                  <div class="p-2.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-gov-primary/30 transition-all">
                    <div class="flex justify-between items-center mb-1">
                      <label class="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {{ t('verification.fields.district_office') }}
                      </label>
                      <span v-if="isFieldEdited('district_office')" class="text-[9px] font-bold px-1.5 rounded bg-blue-100 text-blue-800">
                        {{ t('verification.edited_badge') }}
                      </span>
                    </div>
                    <input
                      v-model="extractedFields.district_office"
                      @input="onFieldInput('district_office')"
                      type="text"
                      class="w-full text-xs font-semibold text-slate-900 bg-transparent focus:outline-none"
                    />
                  </div>

                </div>

                <!-- Certificate Bottom Elements: QR Code & Official Registrar Seal -->
                <div class="pt-4 border-t border-slate-200 flex items-center justify-between font-sans">
                  <!-- Digital QR Code -->
                  <div class="flex items-center gap-3">
                    <div class="w-14 h-14 bg-white border border-slate-300 rounded-lg p-1 shadow-xs flex items-center justify-center">
                      <!-- SVG representation of QR Authenticity code -->
                      <svg class="w-12 h-12 text-slate-800" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14-2h4v2h-4v-2zm-4 0h2v4h-2v-4zm2 4h2v4h-2v-4zm2 2h4v2h-4v-2zm0-4h2v2h-2v-2zm-4 4h2v2h-2v-2z" />
                      </svg>
                    </div>
                    <div>
                      <div class="text-[10px] font-bold text-slate-800">
                        {{ t('verification.digital_qr_mark') }}
                      </div>
                      <div class="text-[9px] text-slate-500 font-mono">
                        HASH: {{ verificationResult?.audit_hash ? verificationResult.audit_hash.slice(0, 14) + '...' : 'AUTHENTIC' }}
                      </div>
                      <div class="text-[9px] text-slate-400">
                        {{ t('verification.one_window_office') }}
                      </div>
                    </div>
                  </div>

                  <!-- Civil Status Registrar Seal -->
                  <div class="text-center">
                    <div class="w-14 h-14 rounded-full border-2 border-red-500 bg-red-50/80 text-red-700 flex flex-col items-center justify-center text-[7px] font-bold shadow-xs">
                      <span>{{ locale === 'km' ? 'ក្រសួងមហាផ្ទៃ' : 'MOI' }}</span>
                      <span class="text-[9px]">🇰🇭</span>
                      <span>{{ locale === 'km' ? 'ត្រាផ្លូវការ' : 'SEAL' }}</span>
                    </div>
                    <div class="text-[9px] font-semibold text-slate-600 mt-1">
                      {{ t('verification.registrar_seal') }}
                    </div>
                  </div>
                </div>

              </div>

              <!-- Database Connection & Audit Telemetry -->
              <div v-if="verificationResult" class="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] space-y-1">
                <div class="flex justify-between items-center text-slate-600">
                  <span class="font-medium truncate">Master Registry Match:</span>
                  <span class="font-bold text-slate-800 shrink-0">
                    {{ verificationResult.matched_records?.[0]?.national_id ? 'Authenticated (1 exact record)' : 'Simulated Record Reference' }}
                  </span>
                </div>
                <div class="flex justify-between items-center text-slate-500 font-mono text-[10px]">
                  <span class="shrink-0">Audit Hash:</span>
                  <span class="truncate max-w-[240px]" :title="verificationResult.audit_hash">
                    {{ verificationResult.audit_hash }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Bottom Action: Approve & Export Button -->
            <div class="pt-4 border-t border-slate-100 space-y-3">
              <div v-if="exportNotification" class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ exportNotification }}</span>
              </div>

              <div class="flex items-center justify-between gap-4">
                <div class="text-[11px] text-slate-500">
                  Zero Data Retention: Processed locally in memory.
                </div>

                <button
                  type="button"
                  @click="handleApproveAndExport"
                  class="h-12 min-h-[48px] px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-emerald-200 inline-flex items-center justify-center gap-2 shrink-0 whitespace-nowrap select-none"
                >
                  <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  <span>{{ t('verification.actions.approve_export') }}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  </div>
</template>
