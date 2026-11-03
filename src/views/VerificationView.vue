<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DocumentUpload from '../components/DocumentUpload.vue'
import { verifyExtractedFields } from '../services/api_client'

const { t, locale } = useI18n()

// Document state
const uploadedFile = ref(null)
const documentPreviewUrl = ref(null)
const inspectionMetadata = ref(null)
const isVerifying = ref(false)
const verificationResult = ref(null)
const verificationError = ref(null)
const exportNotification = ref(null)

// Canvas state
const canvasZoom = ref(1.0)
const isAdvancedMode = ref(false)
const selectedFieldKey = ref('full_name_km')
// Document type: 'standard' (សេចក្តីចម្លងសំបុត្រកំណើត - no បញ្ជាក់) vs 'certified' (សេចក្តីចម្លងសំបុត្របញ្ជាក់កំណើត)
const selectedDocType = ref('standard')

// Bounding box definitions (relative percentage coordinates for responsive scaling)
const boundingBoxes = ref([
  {
    key: 'national_id',
    labelKey: 'verification.fields.national_id',
    x: 62.0,
    y: 12.0,
    width: 28.0,
    height: 5.5,
    color: 'border-blue-500 bg-blue-500/10 text-blue-700',
  },
  {
    key: 'certificate_no',
    labelKey: 'verification.fields.certificate_no',
    x: 10.0,
    y: 12.0,
    width: 30.0,
    height: 5.5,
    color: 'border-indigo-500 bg-indigo-500/10 text-indigo-700',
  },
  {
    key: 'full_name_km',
    labelKey: 'verification.fields.full_name_km',
    x: 25.0,
    y: 28.0,
    width: 48.0,
    height: 6.5,
    color: 'border-emerald-500 bg-emerald-500/10 text-emerald-700',
  },
  {
    key: 'full_name_en',
    labelKey: 'verification.fields.full_name_en',
    x: 25.0,
    y: 36.5,
    width: 48.0,
    height: 6.0,
    color: 'border-teal-500 bg-teal-500/10 text-teal-700',
  },
  {
    key: 'birth_date',
    labelKey: 'verification.fields.birth_date',
    x: 25.0,
    y: 45.0,
    width: 35.0,
    height: 5.5,
    color: 'border-amber-500 bg-amber-500/10 text-amber-700',
  },
  {
    key: 'district_office',
    labelKey: 'verification.fields.district_office',
    x: 25.0,
    y: 53.0,
    width: 50.0,
    height: 6.0,
    color: 'border-purple-500 bg-purple-500/10 text-purple-700',
  },
])

// Editable OCR Extracted Form Model
const extractedFields = ref({
  national_id: '1204009821',
  certificate_no: 'BC-2024-009821',
  full_name_km: 'សុខ ចាន់ដារា',
  full_name_en: 'SOK CHANDARAA',
  birth_date: '2000-05-15',
  district_office: 'ដូនពេញ (Daun Penh)',
})

// Active selected bounding box for coordinate inspector
const selectedBox = computed(() => {
  return boundingBoxes.value.find((b) => b.key === selectedFieldKey.value) || boundingBoxes.value[0]
})

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
      audit_hash: verificationResult.value?.audit_hash || 'none',
      confidence_level: verificationResult.value?.confidence_level || 100.0,
      requires_manual_review: verificationResult.value?.requires_manual_review || false,
      approved_fields: {
        ...extractedFields.value,
        ...(verificationResult.value?.verified_fields || {}),
      },
      matched_municipal_record: verificationResult.value?.matched_records?.[0] || null,
      bounding_box_coordinates: boundingBoxes.value,
    }

    // Trigger local client-side file download
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `civil_verification_approved_${extractedFields.value.national_id || 'cert'}.json`
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
}

onMounted(() => {
  // Initial cross-referencing on mount
  triggerMunicipalCrossReference()
})
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
      <div v-if="!uploadedFile" class="my-8">
        <DocumentUpload
          @inspected="onDocumentInspected"
          @proceed="onProceedToVerification"
        />
      </div>

      <!-- State 2: Side-by-Side Interactive Verification Workspace -->
      <div v-else class="space-y-6">
        
        <!-- Status Notification Banner with deterministic min-height -->
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

        <!-- Main Workspace Grid: Left Canvas, Right Cross-Reference Form -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- ================================================================= -->
          <!-- LEFT PANE: Interactive Bounding Box Alignment Canvas (Col 6)     -->
          <!-- ================================================================= -->
          <div class="lg:col-span-6 bg-white rounded-2xl border border-gov-border shadow-gov-md p-5 flex flex-col space-y-4">
            
            <!-- Canvas Toolbar with deterministic height -->
            <div class="flex items-center justify-between pb-3 border-b border-slate-100 h-11">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-gov-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h2 class="text-sm font-bold text-slate-900 whitespace-nowrap">
                  {{ t('verification.canvas_header') }}
                </h2>
              </div>

              <!-- Controls: Zoom & Mode Toggle -->
              <div class="flex items-center gap-2">
                <!-- Document Type Switcher (Standard vs Certified) -->
                <div class="hidden sm:inline-flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-xs h-8">
                  <button
                    type="button"
                    @click="selectedDocType = 'standard'"
                    :class="[
                      'h-7 px-2.5 rounded-md text-[11px] font-bold transition-all whitespace-nowrap select-none',
                      selectedDocType === 'standard' ? 'bg-white text-gov-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    ]"
                  >
                    {{ locale === 'km' ? 'សេចក្តីចម្លងសំបុត្រកំណើត' : 'Birth Certificate Copy' }}
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
                  <span class="px-2 font-mono text-[11px] font-semibold text-slate-700">
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
                    class="h-7 px-2 text-[10px] text-slate-500 hover:text-slate-900 border-l border-slate-200 inline-flex items-center justify-center whitespace-nowrap select-none font-medium transition-colors"
                  >
                    {{ t('verification.reset_view') }}
                  </button>
                </div>

                <!-- Advanced Mode Toggle -->
                <button
                  type="button"
                  @click="isAdvancedMode = !isAdvancedMode"
                  :class="[
                    'h-8 px-3 rounded-lg text-xs font-semibold border transition-all inline-flex items-center justify-center whitespace-nowrap select-none',
                    isAdvancedMode
                      ? 'bg-gov-primary text-white border-gov-primary shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  ]"
                >
                  {{ isAdvancedMode ? t('verification.advanced_mode') : t('verification.standard_mode') }}
                </button>
              </div>
            </div>

            <!-- Viewport & Canvas Overlay Container -->
            <div class="relative w-full aspect-[4/5] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center select-none">
              
              <!-- Zoom Transform Layer -->
              <div
                class="relative transition-transform duration-100 ease-out origin-center"
                :style="{ transform: `scale(${canvasZoom})` }"
              >
                <!-- Rendered Image or Document Mock -->
                <img
                  v-if="documentPreviewUrl"
                  :src="documentPreviewUrl"
                  alt="Document Preview"
                  class="max-w-full max-h-[520px] object-contain rounded shadow-sm pointer-events-none"
                />

                <!-- Simulated Government Civil Registry Certificate Canvas Background if no preview -->
                <div
                  v-else
                  class="w-[380px] h-[480px] bg-white rounded-lg shadow-md border border-slate-300 p-6 flex flex-col justify-between font-serif relative"
                >
                  <!-- National Emblem Graphic Placeholder -->
                  <div class="text-center space-y-1">
                    <div class="w-10 h-10 mx-auto rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-gov-primary font-bold text-xs">
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
                          ? (locale === 'km' ? 'សេចក្តីចម្លងសំបុត្របញ្ជាក់កំណើត' : 'CERTIFIED COPY OF BIRTH CERTIFICATE')
                          : (locale === 'km' ? 'សេចក្តីចម្លងសំបុត្រកំណើត' : 'COPY OF BIRTH CERTIFICATE') }}
                    </div>
                  </div>

                  <div class="space-y-4 text-[10px] text-slate-600 border-t border-b border-slate-200 py-3 font-sans">
                    <div class="flex justify-between">
                      <span>{{ locale === 'km' ? 'លេខកូដសម្គាល់ជាតិ: 1204009821' : 'National ID Code: 1204009821' }}</span>
                      <span>{{ locale === 'km' ? 'សំបុត្រលេខ: BC-2024-009821' : 'Certificate No: BC-2024-009821' }}</span>
                    </div>
                    <div>{{ locale === 'km' ? 'ឈ្មោះខ្មែរ:' : 'Khmer Name:' }} <span class="font-bold text-slate-900 font-khmer">សុខ ចាន់ដារ៉ា</span></div>
                    <div>{{ locale === 'km' ? 'ឈ្មោះឡាតាំង:' : 'Latin Name:' }} <span class="font-bold text-slate-900 font-latin">SOK CHANDARA</span></div>
                    <div>{{ locale === 'km' ? 'ថ្ងៃខែឆ្នាំកំណើត: ១៥ ឧសភា ២០០០' : 'Date of Birth: 15 May 2000' }}</div>
                    <div>{{ locale === 'km' ? 'រដ្ឋបាលខណ្ឌ: ដូនពេញ • រាជធានីភ្នំពេញ' : 'District: Daun Penh • Phnom Penh' }}</div>
                  </div>

                  <div class="flex justify-between items-end text-[9px] text-slate-400">
                    <div>{{ locale === 'km' ? 'ច្រកចេញចូលតែមួយ' : 'One Window Service' }}</div>
                    <div class="text-center">
                      <div class="w-12 h-12 rounded-full border border-red-300 bg-red-50 text-red-700 flex items-center justify-center text-[8px] font-bold">
                        {{ locale === 'km' ? 'ត្រា' : 'SEAL' }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- OVERLAY BOUNDING BOXES -->
                <div
                  v-for="box in boundingBoxes"
                  :key="box.key"
                  @click="selectField(box.key)"
                  :style="{
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    width: `${box.width}%`,
                    height: `${box.height}%`,
                  }"
                  :class="[
                    'absolute border-2 rounded transition-all cursor-pointer group flex items-center justify-between px-1.5',
                    selectedFieldKey === box.key
                      ? 'ring-4 ring-gov-primary/30 border-gov-primary z-30 shadow-md'
                      : `${box.color} hover:ring-2 hover:ring-slate-300 z-20`
                  ]"
                >
                  <span class="text-[9px] font-bold truncate tracking-tight uppercase">
                    {{ box.key.replace('_', ' ') }}
                  </span>
                  
                  <span
                    v-if="selectedFieldKey === box.key"
                    class="w-2 h-2 rounded-full bg-gov-primary animate-ping"
                  ></span>
                </div>
              </div>
            </div>

            <!-- Advanced Coordinates Editor Panel (Drawer) -->
            <div
              v-if="isAdvancedMode"
              class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2.5"
            >
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-800">
                  Active Bounding Box: <span class="text-gov-primary">{{ selectedBox.key }}</span>
                </span>
                <span class="text-[10px] text-slate-400">Relative % bounds</span>
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
                  'h-7 px-2.5 rounded-lg text-[11px] font-semibold border transition-all inline-flex items-center justify-center whitespace-nowrap select-none',
                  selectedFieldKey === b.key
                    ? 'bg-gov-primary text-white border-gov-primary shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                ]"
              >
                {{ t(b.labelKey) }}
              </button>
            </div>
          </div>

          <!-- ================================================================= -->
          <!-- RIGHT PANE: Side-by-Side Extracted Text vs Municipal DB (Col 6)  -->
          <!-- ================================================================= -->
          <div class="lg:col-span-6 bg-white rounded-2xl border border-gov-border shadow-gov-md p-5 flex flex-col justify-between space-y-6">
            
            <div class="space-y-4">
              <!-- Pane Header with deterministic height matching Canvas Toolbar -->
              <div class="flex items-center justify-between pb-3 border-b border-slate-100 h-11">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-gov-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 class="text-sm font-bold text-slate-900 whitespace-nowrap">
                    {{ t('verification.cross_reference_header') }}
                  </h2>
                </div>

                <button
                  type="button"
                  @click="triggerMunicipalCrossReference"
                  :disabled="isVerifying"
                  class="h-7 px-2 inline-flex items-center gap-1.5 text-xs text-gov-primary hover:underline font-semibold disabled:opacity-50 whitespace-nowrap select-none"
                >
                  <svg :class="['w-3.5 h-3.5', isVerifying ? 'animate-spin' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {{ t('verification.actions.re_run_verify') }}
                </button>
              </div>

              <!-- Field Comparison Form List with strictly locked card heights -->
              <div class="space-y-3">
                <div
                  v-for="box in boundingBoxes"
                  :key="box.key"
                  @click="selectField(box.key)"
                  :class="[
                    'p-3 rounded-xl border transition-all cursor-pointer',
                    selectedFieldKey === box.key ? 'ring-2 ring-gov-primary/20 shadow-sm' : '',
                    getFieldMatchStatus(box.key).color
                  ]"
                >
                  <!-- Field Header with fixed height -->
                  <div class="flex items-center justify-between mb-1.5 h-6">
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="w-2 h-2 rounded-full bg-slate-400 shrink-0"></span>
                      <span class="text-xs font-bold text-slate-900 truncate">
                        {{ t(box.labelKey) }}
                      </span>
                    </div>

                    <!-- Match Status Badge with fixed height -->
                    <div class="flex items-center gap-2 shrink-0">
                      <span
                        v-if="verificationResult"
                        :class="[
                          'h-5 px-2 rounded-full text-[10px] font-bold border inline-flex items-center justify-center whitespace-nowrap',
                          getFieldMatchStatus(box.key).badgeColor
                        ]"
                      >
                        {{
                          getFieldMatchStatus(box.key).status === 'verified'
                            ? t('verification.status_labels.verified')
                            : getFieldMatchStatus(box.key).status === 'corrected'
                            ? t('verification.status_labels.corrected')
                            : t('verification.status_labels.review_required')
                        }}
                      </span>
                      <span class="text-[11px] font-mono font-bold">
                        {{ getFieldMatchStatus(box.key).score }}%
                      </span>
                    </div>
                  </div>

                  <!-- Side-by-Side Values Grid with fixed box height to prevent jumping -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <!-- Extracted OCR Input (Editable) -->
                    <div class="bg-white/90 p-2 rounded-lg border border-slate-200 h-14 flex flex-col justify-between">
                      <label class="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                        {{ t('verification.field_headers.extracted_ocr') }}
                      </label>
                      <input
                        v-model="extractedFields[box.key]"
                        type="text"
                        class="w-full text-xs font-bold text-slate-900 bg-transparent focus:outline-none focus:ring-1 focus:ring-gov-primary rounded px-1 h-6"
                        @blur="triggerMunicipalCrossReference"
                      />
                    </div>

                    <!-- Official Reference (Read-Only) -->
                    <div class="bg-slate-100/90 p-2 rounded-lg border border-slate-200 h-14 flex flex-col justify-between">
                      <label class="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                        {{ t('verification.field_headers.municipal_ref') }}
                      </label>
                      <div class="text-xs font-bold text-slate-800 truncate px-1 h-6 flex items-center">
                        {{ getFieldMatchStatus(box.key).refValue || '—' }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Database Connection & Audit Hash Telemetry -->
              <div v-if="verificationResult" class="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] space-y-1 h-16 flex flex-col justify-center">
                <div class="flex justify-between items-center text-slate-600">
                  <span class="font-medium truncate">Master Registry Record:</span>
                  <span class="font-bold text-slate-800 shrink-0">
                    {{ verificationResult.matched_records?.[0]?.national_id ? 'Authenticated (1 match)' : 'No exact record' }}
                  </span>
                </div>
                <div class="flex justify-between items-center text-slate-500 font-mono text-[10px]">
                  <span class="shrink-0">SHA-256 Audit:</span>
                  <span class="truncate max-w-[200px]" :title="verificationResult.audit_hash">
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

              <div class="flex items-center justify-between gap-4 h-12">
                <div class="text-xs text-slate-500 truncate">
                  Zero Data Retention: Results are rendered locally without disk retention.
                </div>

                <button
                  type="button"
                  @click="handleApproveAndExport"
                  class="h-12 min-h-[48px] px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-emerald-200 inline-flex items-center justify-center gap-2 shrink-0 whitespace-nowrap select-none w-auto"
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
