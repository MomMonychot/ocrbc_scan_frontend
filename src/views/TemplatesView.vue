<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t, locale } = useI18n()
const router = useRouter()

// Storage key for persistence
const STORAGE_KEY = 'district_ocr_templates_v1'

// Available Field Options for Birth Certificate Bounding Boxes
const FIELD_DEFINITIONS = [
  { key: 'national_id', labelKm: 'លេខកូដសម្គាល់ជាតិ', labelEn: 'National ID', color: 'border-blue-500 bg-blue-500/15 text-blue-700' },
  { key: 'certificate_no', labelKm: 'សៀវភៅលេខ ឬសំបុត្រលេខ', labelEn: 'Certificate No.', color: 'border-indigo-500 bg-indigo-500/15 text-indigo-700' },
  { key: 'full_name_km', labelKm: 'ឈ្មោះជាអក្សរខ្មែរ', labelEn: 'Khmer Full Name', color: 'border-emerald-500 bg-emerald-500/15 text-emerald-700' },
  { key: 'full_name_en', labelKm: 'ឈ្មោះជាអក្សរឡាតាំង', labelEn: 'Latin Full Name', color: 'border-teal-500 bg-teal-500/15 text-teal-700' },
  { key: 'gender', labelKm: 'ភេទ', labelEn: 'Gender', color: 'border-cyan-500 bg-cyan-500/15 text-cyan-700' },
  { key: 'birth_date', labelKm: 'ថ្ងៃខែឆ្នាំកំណើត', labelEn: 'Date of Birth', color: 'border-amber-500 bg-amber-500/15 text-amber-700' },
  { key: 'birth_place', labelKm: 'ទីកន្លែងកំណើត', labelEn: 'Place of Birth', color: 'border-orange-500 bg-orange-500/15 text-orange-700' },
  { key: 'father_name', labelKm: 'ឈ្មោះឪពុក', labelEn: "Father's Name", color: 'border-violet-500 bg-violet-500/15 text-violet-700' },
  { key: 'mother_name', labelKm: 'ឈ្មោះម្តាយ', labelEn: "Mother's Name", color: 'border-pink-500 bg-pink-500/15 text-pink-700' },
  { key: 'district_office', labelKm: 'សាលាក្រុង ស្រុក ខណ្ឌ', labelEn: 'District Office', color: 'border-purple-500 bg-purple-500/15 text-purple-700' },
  { key: 'official_stamp', labelKm: 'ត្រា និងហត្ថលេខា', labelEn: 'Official Seal & Signature', color: 'border-rose-500 bg-rose-500/15 text-rose-700' },
  { key: 'qr_code', labelKm: 'កូដ QR ឬបាកូដ', labelEn: 'QR Code or Barcode', color: 'border-slate-800 bg-slate-800/15 text-slate-900' },
  { key: 'custom', labelKm: 'វាលកំណត់ផ្សេងៗ', labelEn: 'Custom Field', color: 'border-gray-500 bg-gray-500/15 text-gray-700' },
]

// Default seed templates
const DEFAULT_TEMPLATES = [
  {
    id: 'tpl-new-std-2024',
    format: 'new', // 'new' | 'old'
    nameKm: 'សំបុត្រកំណើតឌីជីថលស្ដង់ដារ ២០២៤',
    nameEn: 'Standard Digital Birth Certificate 2024',
    descriptionKm: 'ទម្រង់សំបុត្រកំណើតស្ដង់ដារថ្មី មានកូដ QR លេខកូដសម្គាល់ជាតិ និងអក្សរឡាតាំងសម្រាប់រដ្ឋបាលក្រុង-ស្រុក-ខណ្ឌ។',
    descriptionEn: 'Modern civil registry certificate with QR verification code, national ID, and bilingual Latin fields.',
    updatedAt: '2024-11-01',
    aspectRatio: '4/5',
    boxes: [
      { id: 'b1', key: 'certificate_no', x: 10.0, y: 13.0, width: 32.0, height: 5.5 },
      { id: 'b2', key: 'national_id', x: 60.0, y: 13.0, width: 30.0, height: 5.5 },
      { id: 'b3', key: 'full_name_km', x: 25.0, y: 28.0, width: 50.0, height: 6.5 },
      { id: 'b4', key: 'full_name_en', x: 25.0, y: 36.5, width: 50.0, height: 6.0 },
      { id: 'b5', key: 'gender', x: 78.0, y: 36.5, width: 14.0, height: 6.0 },
      { id: 'b6', key: 'birth_date', x: 25.0, y: 45.0, width: 35.0, height: 5.5 },
      { id: 'b7', key: 'district_office', x: 25.0, y: 53.0, width: 50.0, height: 6.0 },
      { id: 'b8', key: 'qr_code', x: 10.0, y: 73.0, width: 18.0, height: 18.0 },
      { id: 'b9', key: 'official_stamp', x: 68.0, y: 73.0, width: 22.0, height: 18.0 },
    ]
  },
  {
    id: 'tpl-new-bilingual-2023',
    format: 'new',
    nameKm: 'សំបុត្រកំណើតទ្វេភាសា ក្រសួងមហាផ្ទៃ',
    nameEn: 'Ministry Bilingual Civil Certificate',
    descriptionKm: 'ទម្រង់កំណែទ្វេភាសាខ្មែរ-អង់គ្លេស ប្រើប្រាស់សម្រាប់នាយកដ្ឋានអត្រានុកូលដ្ឋាន និងការផ្ទៀងផ្ទាត់អន្តរជាតិ។',
    descriptionEn: 'Bilingual civil status form with expanded metadata fields for district civil status registries.',
    updatedAt: '2024-08-15',
    aspectRatio: '4/5',
    boxes: [
      { id: 'b10', key: 'certificate_no', x: 12.0, y: 11.5, width: 30.0, height: 5.0 },
      { id: 'b11', key: 'national_id', x: 62.0, y: 11.5, width: 28.0, height: 5.0 },
      { id: 'b12', key: 'full_name_km', x: 22.0, y: 26.0, width: 56.0, height: 6.0 },
      { id: 'b13', key: 'full_name_en', x: 22.0, y: 34.0, width: 56.0, height: 6.0 },
      { id: 'b14', key: 'birth_date', x: 22.0, y: 43.0, width: 40.0, height: 5.5 },
      { id: 'b15', key: 'birth_place', x: 22.0, y: 51.0, width: 68.0, height: 6.0 },
      { id: 'b16', key: 'district_office', x: 22.0, y: 60.0, width: 55.0, height: 5.5 },
      { id: 'b17', key: 'qr_code', x: 10.0, y: 75.0, width: 16.0, height: 16.0 },
      { id: 'b18', key: 'official_stamp', x: 66.0, y: 72.0, width: 24.0, height: 20.0 },
    ]
  },
  {
    id: 'tpl-old-classic-1993',
    format: 'old', // 'new' | 'old'
    nameKm: 'សំបុត្រកំណើតទម្រង់ចាស់ (១៩៩៣ - ២០០៥)',
    nameEn: 'Historical Civil Registry Form (1993 - 2005)',
    descriptionKm: 'ទម្រង់សំបុត្រកំណើតបែបប្រពៃណី វាយអត្ថបទដោយអង្គុលីលេខ ឬសរសេរដៃ គ្មានកូដ QR ប្រើប្រាស់សៀវភៅបញ្ជីកាលពីមុន។',
    descriptionEn: 'Traditional typewriter or hand-written legacy certificate without QR codes, referencing archival ledger volumes.',
    updatedAt: '2024-05-10',
    aspectRatio: '4/5',
    boxes: [
      { id: 'b20', key: 'certificate_no', x: 10.0, y: 14.0, width: 35.0, height: 6.0 },
      { id: 'b21', key: 'full_name_km', x: 20.0, y: 28.0, width: 60.0, height: 7.0 },
      { id: 'b22', key: 'gender', x: 20.0, y: 38.0, width: 25.0, height: 6.0 },
      { id: 'b23', key: 'birth_date', x: 48.0, y: 38.0, width: 42.0, height: 6.0 },
      { id: 'b24', key: 'birth_place', x: 20.0, y: 47.0, width: 70.0, height: 7.0 },
      { id: 'b25', key: 'father_name', x: 20.0, y: 57.0, width: 45.0, height: 6.0 },
      { id: 'b26', key: 'mother_name', x: 20.0, y: 65.0, width: 45.0, height: 6.0 },
      { id: 'b27', key: 'official_stamp', x: 55.0, y: 74.0, width: 35.0, height: 20.0 },
    ]
  },
  {
    id: 'tpl-old-vintage-1980',
    format: 'old',
    nameKm: 'សំបុត្របញ្ជាក់កំណើតបុរាណ (ក្រដាសលឿង)',
    nameEn: 'Vintage Archival Civil Record (Pre-1993)',
    descriptionKm: 'ទម្រង់បុរាណប្រើប្រាស់ក្នុងបណ្ណសារដ្ឋានខេត្តក្រុង មានតែត្រាមូលពណ៌ក្រហម និងហត្ថលេខាមេឃុំ-ចៅសង្កាត់។',
    descriptionEn: 'Historical district record with vintage paper tint, red wax/ink seals, and manual clerk signatures.',
    updatedAt: '2024-03-22',
    aspectRatio: '4/5',
    boxes: [
      { id: 'b30', key: 'certificate_no', x: 12.0, y: 15.0, width: 38.0, height: 6.5 },
      { id: 'b31', key: 'full_name_km', x: 18.0, y: 29.0, width: 64.0, height: 7.5 },
      { id: 'b32', key: 'birth_date', x: 18.0, y: 40.0, width: 55.0, height: 6.5 },
      { id: 'b33', key: 'birth_place', x: 18.0, y: 50.0, width: 72.0, height: 7.0 },
      { id: 'b34', key: 'father_name', x: 18.0, y: 60.0, width: 48.0, height: 6.0 },
      { id: 'b35', key: 'mother_name', x: 18.0, y: 68.0, width: 48.0, height: 6.0 },
      { id: 'b36', key: 'official_stamp', x: 50.0, y: 76.0, width: 40.0, height: 18.0 },
    ]
  }
]

// State
const activeTab = ref('new') // 'new' | 'old'
const templates = ref([])
const showStudio = ref(false)
const editingTemplate = ref(null)
const selectedBoxId = ref(null)
const studioMode = ref('draw') // 'draw' | 'select'
const studioZoom = ref(1.0)
const notification = ref(null)

// Dragging / Drawing state on canvas
const canvasContainerRef = ref(null)
const isDrawing = ref(false)
const drawStart = ref({ x: 0, y: 0 })
const drawCurrent = ref({ x: 0, y: 0 })

// Dragging existing box
const isMovingBox = ref(false)
const moveStart = ref({ x: 0, y: 0 })
const initialBoxPos = ref({ x: 0, y: 0 })

// Upload custom template image
const customImagePreview = ref(null)

// Load from LocalStorage or seed defaults
onMounted(() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      templates.value = JSON.parse(raw)
    } else {
      templates.value = JSON.parse(JSON.stringify(DEFAULT_TEMPLATES))
      saveTemplates()
    }
  } catch (e) {
    templates.value = JSON.parse(JSON.stringify(DEFAULT_TEMPLATES))
  }
})

function saveTemplates() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates.value))
  } catch (e) {
    console.error('Failed to save templates to localStorage:', e)
  }
}

function showToast(msg) {
  notification.value = msg
  setTimeout(() => {
    notification.value = null
  }, 3500)
}

// Filtered templates by active tab
const filteredTemplates = computed(() => {
  return templates.value.filter(t => t.format === activeTab.value)
})

// Counts for tabs
const newCount = computed(() => templates.value.filter(t => t.format === 'new').length)
const oldCount = computed(() => templates.value.filter(t => t.format === 'old').length)

// Active selected box object
const activeBox = computed(() => {
  if (!editingTemplate.value || !selectedBoxId.value) return null
  return editingTemplate.value.boxes.find(b => b.id === selectedBoxId.value) || null
})

// Field definition lookup helper
function getFieldDef(key) {
  return FIELD_DEFINITIONS.find(f => f.key === key) || {
    key,
    labelKm: key,
    labelEn: key,
    color: 'border-slate-500 bg-slate-500/15 text-slate-700'
  }
}

function getFieldLabel(key) {
  const def = getFieldDef(key)
  return locale.value === 'km' ? def.labelKm : def.labelEn
}

function getTemplateName(tpl) {
  if (!tpl) return ''
  return locale.value === 'km' ? (tpl.nameKm || tpl.nameEn) : (tpl.nameEn || tpl.nameKm)
}

function getTemplateDesc(tpl) {
  if (!tpl) return ''
  return locale.value === 'km' ? (tpl.descriptionKm || tpl.descriptionEn) : (tpl.descriptionEn || tpl.descriptionKm)
}

// Temporary preview rectangle while user drags mouse to draw
const previewRect = computed(() => {
  if (!isDrawing.value) return null
  const x = Math.min(drawStart.value.x, drawCurrent.value.x)
  const y = Math.min(drawStart.value.y, drawCurrent.value.y)
  const width = Math.abs(drawCurrent.value.x - drawStart.value.x)
  const height = Math.abs(drawCurrent.value.y - drawStart.value.y)
  return { x, y, width, height }
})

// -------------------------------------------------------------
// Studio & Template Actions
// -------------------------------------------------------------

function openStudioForEdit(template) {
  editingTemplate.value = JSON.parse(JSON.stringify(template))
  selectedBoxId.value = editingTemplate.value.boxes[0]?.id || null
  customImagePreview.value = editingTemplate.value.customImage || null
  studioMode.value = 'draw'
  studioZoom.value = 1.0
  showStudio.value = true
}

function handleAddNewTemplate() {
  const newTpl = {
    id: 'tpl-custom-' + Date.now(),
    format: activeTab.value, // creates in current tab
    nameKm: activeTab.value === 'new' ? 'គំរូទម្រង់ថ្មីផ្ទាល់ខ្លួន' : 'គំរូទម្រង់ចាស់ផ្ទាល់ខ្លួន',
    nameEn: activeTab.value === 'new' ? 'Custom Modern Template' : 'Custom Historical Template',
    descriptionKm: 'គំរូទម្រង់ដែលបានបង្កើតដោយមន្ត្រីអត្រានុកូលដ្ឋាន ដោយមានការកំណត់ Bounding Box ផ្ទាល់ខ្លួន។',
    descriptionEn: 'Custom template configured with officer-defined OCR extraction coordinates.',
    updatedAt: new Date().toISOString().slice(0, 10),
    aspectRatio: '4/5',
    boxes: [
      { id: 'b_' + Date.now() + '_1', key: 'full_name_km', x: 25.0, y: 30.0, width: 50.0, height: 7.0 },
      { id: 'b_' + Date.now() + '_2', key: 'certificate_no', x: 12.0, y: 14.0, width: 35.0, height: 6.0 }
    ]
  }

  editingTemplate.value = newTpl
  selectedBoxId.value = newTpl.boxes[0].id
  customImagePreview.value = null
  studioMode.value = 'draw'
  studioZoom.value = 1.0
  showStudio.value = true
}

function handleDuplicateTemplate(template) {
  const cloned = JSON.parse(JSON.stringify(template))
  cloned.id = 'tpl-copy-' + Date.now()
  cloned.nameKm = cloned.nameKm + ' (ច្បាប់ចម្លង)'
  cloned.nameEn = cloned.nameEn + ' (Copy)'
  cloned.updatedAt = new Date().toISOString().slice(0, 10)
  templates.value.unshift(cloned)
  saveTemplates()
  showToast(t('templates.toast_duplicated', 'បានចម្លងគំរូទម្រង់ដោយជោគជ័យ'))
}

function handleDeleteTemplate(id) {
  if (templates.value.length <= 1) {
    alert(t('templates.cannot_delete_last', 'មិនអាចលុបគំរូចុងក្រោយបានទេ'))
    return
  }
  if (confirm(t('templates.confirm_delete', 'តើអ្នកប្រាកដថាចង់លុបគំរូទម្រង់នេះទេ?'))) {
    templates.value = templates.value.filter(t => t.id !== id)
    saveTemplates()
    showToast(t('templates.toast_deleted', 'បានលុបគំរូទម្រង់'))
  }
}

function saveCurrentStudioTemplate() {
  if (!editingTemplate.value) return

  editingTemplate.value.updatedAt = new Date().toISOString().slice(0, 10)
  if (customImagePreview.value) {
    editingTemplate.value.customImage = customImagePreview.value
  }

  const existingIdx = templates.value.findIndex(t => t.id === editingTemplate.value.id)
  if (existingIdx >= 0) {
    templates.value[existingIdx] = JSON.parse(JSON.stringify(editingTemplate.value))
  } else {
    templates.value.unshift(JSON.parse(JSON.stringify(editingTemplate.value)))
  }

  saveTemplates()
  showToast(t('templates.toast_saved', 'បានរក្សាទុកគំរូទម្រង់ និងប្រអប់ Bounding Box ដោយជោគជ័យ!'))
  showStudio.value = false
  editingTemplate.value = null
}

function closeStudio() {
  showStudio.value = false
  editingTemplate.value = null
  customImagePreview.value = null
}

// -------------------------------------------------------------
// Interactive Bounding Box Canvas Events (Drawing & Moving)
// -------------------------------------------------------------

function getRelativePercentCoords(e) {
  if (!canvasContainerRef.value) return { x: 0, y: 0 }
  const rect = canvasContainerRef.value.getBoundingClientRect()
  const rawX = ((e.clientX - rect.left) / rect.width) * 100
  const rawY = ((e.clientY - rect.top) / rect.height) * 100
  const x = Math.max(0, Math.min(100, Math.round(rawX * 10) / 10))
  const y = Math.max(0, Math.min(100, Math.round(rawY * 10) / 10))
  return { x, y }
}

function handleCanvasMouseDown(e) {
  if (studioMode.value !== 'draw') return
  // Don't start drawing if clicking on an existing box's control
  if (e.target.closest('.bounding-box-item')) return

  const coords = getRelativePercentCoords(e)
  isDrawing.value = true
  drawStart.value = coords
  drawCurrent.value = coords
}

function handleCanvasMouseMove(e) {
  if (isDrawing.value) {
    drawCurrent.value = getRelativePercentCoords(e)
  } else if (isMovingBox.value && activeBox.value) {
    const coords = getRelativePercentCoords(e)
    const dx = coords.x - moveStart.value.x
    const dy = coords.y - moveStart.value.y
    activeBox.value.x = Math.max(0, Math.min(100 - activeBox.value.width, Math.round((initialBoxPos.value.x + dx) * 10) / 10))
    activeBox.value.y = Math.max(0, Math.min(100 - activeBox.value.height, Math.round((initialBoxPos.value.y + dy) * 10) / 10))
  }
}

function handleCanvasMouseUp() {
  if (isDrawing.value) {
    const p = previewRect.value
    if (p && p.width > 2 && p.height > 2) {
      // Pick next unassigned field if possible
      const existingKeys = new Set(editingTemplate.value.boxes.map(b => b.key))
      const nextField = FIELD_DEFINITIONS.find(f => !existingKeys.has(f.key)) || FIELD_DEFINITIONS[0]

      const newBox = {
        id: 'box_' + Date.now(),
        key: nextField.key,
        x: Math.round(p.x * 10) / 10,
        y: Math.round(p.y * 10) / 10,
        width: Math.round(p.width * 10) / 10,
        height: Math.round(p.height * 10) / 10,
      }
      editingTemplate.value.boxes.push(newBox)
      selectedBoxId.value = newBox.id
      studioMode.value = 'select'
      showToast(`${t('templates.box_created')}: ${getFieldLabel(newBox.key)}`)
    }
    isDrawing.value = false
  }

  if (isMovingBox.value) {
    isMovingBox.value = false
  }
}

function handleBoxMouseDown(e, box) {
  selectedBoxId.value = box.id
  if (studioMode.value === 'select') {
    e.stopPropagation()
    isMovingBox.value = true
    const coords = getRelativePercentCoords(e)
    moveStart.value = coords
    initialBoxPos.value = { x: box.x, y: box.y }
  }
}

function deleteBox(boxId) {
  if (!editingTemplate.value) return
  editingTemplate.value.boxes = editingTemplate.value.boxes.filter(b => b.id !== boxId)
  if (selectedBoxId.value === boxId) {
    selectedBoxId.value = editingTemplate.value.boxes[0]?.id || null
  }
}

function handleCustomImageUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file (PNG, JPEG, WebP).')
    return
  }
  const reader = new FileReader()
  reader.onload = (evt) => {
    customImagePreview.value = evt.target?.result
  }
  reader.readAsDataURL(file)
}

function removeCustomImage() {
  customImagePreview.value = null
  if (editingTemplate.value) {
    delete editingTemplate.value.customImage
  }
}
</script>

<template>
  <main class="min-h-screen bg-gov-surface py-8 sm:py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-8">
      
      <!-- Top Navigation & Header -->
      <div class="pb-6 mb-8 border-b border-gov-border">
        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gov-primary tracking-tight">
          {{ t('templates.title') }}
        </h1>
        <p class="text-sm sm:text-base text-gov-text-secondary mt-1 max-w-3xl leading-relaxed">
          {{ t('templates.subtitle') }}
        </p>
      </div>

      <!-- Toast Notification -->
      <transition
        enter-active-class="transform ease-out duration-300 transition"
        enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="notification"
          class="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 text-sm font-medium"
        >
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span>{{ notification }}</span>
        </div>
      </transition>

      <!-- TABS BAR: NEW & OLD WITH "+ Add New Template" BUTTON AT THE END OF THE LINE -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-gov-border pb-4 mb-8">
        
        <!-- Left: Tabs (New vs Old Format) -->
        <div class="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 select-none">
          <!-- Tab 1: New Format -->
          <button
            type="button"
            @click="activeTab = 'new'"
            :class="[
              'h-10 px-5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 inline-flex items-center gap-2 whitespace-nowrap',
              activeTab === 'new'
                ? 'bg-gov-primary text-white shadow-sm'
                : 'text-slate-600 hover:text-gov-primary hover:bg-white/60'
            ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{{ t('templates.tabs.new') }}</span>
            <span
              :class="[
                'text-[11px] px-2 py-0.5 rounded-full font-mono font-bold',
                activeTab === 'new' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              ]"
            >
              {{ newCount }}
            </span>
          </button>

          <!-- Tab 2: Old Format -->
          <button
            type="button"
            @click="activeTab = 'old'"
            :class="[
              'h-10 px-5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 inline-flex items-center gap-2 whitespace-nowrap',
              activeTab === 'old'
                ? 'bg-gov-primary text-white shadow-sm'
                : 'text-slate-600 hover:text-gov-primary hover:bg-white/60'
            ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ t('templates.tabs.old') }}</span>
            <span
              :class="[
                'text-[11px] px-2 py-0.5 rounded-full font-mono font-bold',
                activeTab === 'old' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              ]"
            >
              {{ oldCount }}
            </span>
          </button>
        </div>

        <!-- Right: Button "Add New Template" at the end of line of New and Old -->
        <button
          type="button"
          @click="handleAddNewTemplate"
          class="h-11 px-5 rounded-xl bg-gov-primary hover:bg-gov-primary-hover text-white font-bold text-xs sm:text-sm shadow-gov-sm hover:shadow-gov-md transition-all duration-150 inline-flex items-center justify-center gap-2 whitespace-nowrap select-none self-end sm:self-center"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>{{ t('templates.btn_add') }}</span>
        </button>
      </div>

      <!-- TEMPLATE LIST GRID -->
      <div v-if="filteredTemplates.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <div
          v-for="tpl in filteredTemplates"
          :key="tpl.id"
          class="bg-white rounded-2xl border border-gov-border shadow-gov-sm hover:shadow-gov-md transition-all p-6 sm:p-7 flex flex-col justify-between group"
        >
          <div>
            <!-- Template Header & Badges -->
            <div class="flex items-start justify-between gap-3 mb-4">
              <div>
                <div class="flex items-center gap-2 mb-1.5">
                  <span
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider',
                      tpl.format === 'new'
                        ? 'bg-blue-100 text-gov-primary border border-blue-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    ]"
                  >
                    {{ tpl.format === 'new' ? t('templates.tabs.new') : t('templates.tabs.old') }}
                  </span>
                  <span class="text-xs text-slate-400 font-mono">
                    {{ tpl.boxes.length }} {{ t('templates.fields_count') }}
                  </span>
                </div>
                <h3 class="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-gov-primary transition-colors">
                  {{ getTemplateName(tpl) }}
                </h3>
              </div>

              <!-- Template Mini Actions -->
              <div class="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  @click="handleDuplicateTemplate(tpl)"
                  class="p-2 text-slate-400 hover:text-gov-primary hover:bg-slate-100 rounded-lg transition-colors"
                  :title="t('templates.duplicate', 'ចម្លង')"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  type="button"
                  @click="handleDeleteTemplate(tpl.id)"
                  class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  :title="t('templates.delete', 'លុប')"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Description -->
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
              {{ getTemplateDesc(tpl) }}
            </p>

            <!-- Mini Preview of Certificate Sheet with Real Bounding Box Overlays -->
            <div class="relative w-full aspect-[4/3] bg-slate-50 rounded-xl border border-slate-200 overflow-hidden mb-5 flex items-center justify-center p-3 select-none">
              <!-- Background Document Graphic Mock -->
              <div
                :class="[
                  'w-full h-full rounded shadow-inner border p-3 flex flex-col justify-between text-[8px] font-serif relative overflow-hidden',
                  tpl.format === 'new'
                    ? 'bg-white border-blue-100 text-slate-700'
                    : 'bg-[#FAF6EC] border-amber-200 text-amber-900'
                ]"
              >
                <!-- Watermark Header -->
                <div class="text-center opacity-70">
                  <div class="font-bold">{{ locale === 'km' ? 'ព្រះរាជាណាចក្រកម្ពុជា' : 'KINGDOM OF CAMBODIA' }}</div>
                  <div class="text-[7px]">{{ locale === 'km' ? 'ជាតិ សាសនា ព្រះមហាក្សត្រ' : 'NATION RELIGION KING' }}</div>
                  <div class="font-sans font-bold text-gov-primary pt-0.5">
                    {{ tpl.format === 'new' ? (locale === 'km' ? 'សំបុត្រកំណើត' : 'BIRTH CERTIFICATE') : (locale === 'km' ? 'សំបុត្របញ្ជាក់កំណើត' : 'CIVIL BIRTH EXTRACT') }}
                  </div>
                </div>

                <!-- Bounding Boxes Miniature Overlay -->
                <div
                  v-for="b in tpl.boxes"
                  :key="b.id"
                  :style="{
                    left: `${b.x}%`,
                    top: `${b.y}%`,
                    width: `${b.width}%`,
                    height: `${b.height}%`
                  }"
                  :class="[
                    'absolute border border-dashed rounded-[2px] pointer-events-none flex items-center justify-center text-[7px] font-sans font-bold px-0.5 truncate',
                    getFieldDef(b.key).color
                  ]"
                >
                  <span class="truncate">{{ getFieldLabel(b.key) }}</span>
                </div>

                <!-- Bottom Document Footer -->
                <div class="flex justify-between items-end opacity-60 text-[7px]">
                  <span>{{ locale === 'km' ? 'រដ្ឋបាលក្រុង-ស្រុក-ខណ្ឌ' : 'District Administration' }}</span>
                  <span>{{ tpl.format === 'new' ? (locale === 'km' ? 'កូដសម្ងាត់' : 'ENCRYPTED CODE') : (locale === 'km' ? 'ត្រារដ្ឋបាល' : 'OFFICIAL SEAL') }}</span>
                </div>
              </div>
            </div>

            <!-- Configured Fields Badges -->
            <div class="space-y-2 mb-6">
              <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {{ t('templates.configured_fields') }}
              </div>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="box in tpl.boxes"
                  :key="box.id"
                  :class="[
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border',
                    getFieldDef(box.key).color
                  ]"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                  <span>{{ getFieldLabel(box.key) }}</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Card Primary Action Button: Edit & Draw Bounding Boxes -->
          <div class="pt-4 border-t border-slate-100 flex items-center gap-3">
            <button
              type="button"
              @click="openStudioForEdit(tpl)"
              class="flex-1 h-11 px-4 rounded-xl bg-gov-primary hover:bg-gov-primary-hover text-white font-bold text-xs sm:text-sm shadow-gov-sm hover:shadow-gov-md transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>{{ t('templates.btn_edit_boxes') }}</span>
            </button>

            <router-link
              to="/verify"
              class="h-11 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
              :title="t('templates.test_verify')"
            >
              <span>{{ t('templates.test_verify') }}</span>
              <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Empty State if no templates in tab -->
      <div v-else class="text-center py-16 bg-white rounded-2xl border border-gov-border p-8">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-slate-800 mb-1">
          {{ t('templates.empty_title') }}
        </h3>
        <p class="text-xs sm:text-sm text-slate-500 mb-6 max-w-md mx-auto">
          {{ t('templates.empty_desc') }}
        </p>
        <button
          type="button"
          @click="handleAddNewTemplate"
          class="h-11 px-6 rounded-xl bg-gov-primary hover:bg-gov-primary-hover text-white font-bold text-xs sm:text-sm shadow-gov-sm transition-all inline-flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>{{ t('templates.btn_add') }}</span>
        </button>
      </div>

    </div>

    <!-- =================================================================== -->
    <!-- INTERACTIVE BOUNDING BOX STUDIO & DRAWING CANVAS MODAL/FULL DRAWER -->
    <!-- =================================================================== -->
    <div
      v-if="showStudio && editingTemplate"
      class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fadeIn"
    >
      <div class="bg-white rounded-2xl border border-gov-border shadow-2xl w-full max-w-7xl max-h-[96vh] flex flex-col overflow-hidden">
        
        <!-- Studio Header -->
        <div class="px-6 py-4 border-b border-gov-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gov-primary text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-gov-primary font-mono">
                  {{ t('templates.studio_badge') }}
                </span>
                <span class="text-xs text-slate-500">
                  {{ editingTemplate.format === 'new' ? t('templates.tabs.new') : t('templates.tabs.old') }}
                </span>
              </div>
              <h2 class="text-base sm:text-lg font-bold text-slate-900">
                {{ getTemplateName(editingTemplate) }}
              </h2>
            </div>
          </div>

          <!-- Studio Actions: Mode Switching & Save -->
          <div class="flex items-center gap-2.5">
            <!-- Tool: Draw Mode -->
            <button
              type="button"
              @click="studioMode = 'draw'"
              :class="[
                'h-9 px-3.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 select-none',
                studioMode === 'draw'
                  ? 'bg-gov-primary text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              ]"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>{{ t('templates.tool_draw') }}</span>
            </button>

            <!-- Tool: Select/Move Mode -->
            <button
              type="button"
              @click="studioMode = 'select'"
              :class="[
                'h-9 px-3.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 select-none',
                studioMode === 'select'
                  ? 'bg-gov-primary text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              ]"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <span>{{ t('templates.tool_select') }}</span>
            </button>

            <!-- Save Button -->
            <button
              type="button"
              @click="saveCurrentStudioTemplate"
              class="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all inline-flex items-center gap-1.5"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ t('templates.save') }}</span>
            </button>

            <!-- Close Button -->
            <button
              type="button"
              @click="closeStudio"
              class="w-9 h-9 rounded-lg bg-white text-slate-500 hover:text-slate-800 border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Studio Body: Split View (Canvas on Left, Inspector & Fields on Right) -->
        <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-[580px]">
          
          <!-- LEFT: DRAWING CANVAS AREA (Col 8) -->
          <div class="lg:col-span-8 bg-slate-100 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto">
            
            <!-- Canvas Controls Bar -->
            <div class="flex items-center justify-between pb-3 text-xs">
              <div class="flex items-center gap-2 text-slate-600 font-medium">
                <span class="w-2 h-2 rounded-full" :class="studioMode === 'draw' ? 'bg-gov-primary animate-ping' : 'bg-slate-400'"></span>
                <span v-if="studioMode === 'draw'" class="text-gov-primary font-bold">
                  {{ t('templates.canvas_draw_hint') }}
                </span>
                <span v-else class="text-slate-600">
                  {{ t('templates.canvas_select_hint') }}
                </span>
              </div>

              <!-- Zoom Controls -->
              <div class="inline-flex items-center rounded-lg bg-white border border-slate-200 p-0.5 text-xs shadow-sm">
                <button
                  type="button"
                  @click="studioZoom = Math.max(0.7, studioZoom - 0.1)"
                  class="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded"
                  title="Zoom Out"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                  </svg>
                </button>
                <span class="px-2 font-mono text-[11px] font-semibold text-slate-700">
                  {{ Math.round(studioZoom * 100) }}%
                </span>
                <button
                  type="button"
                  @click="studioZoom = Math.min(1.5, studioZoom + 0.1)"
                  class="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded"
                  title="Zoom In"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button
                  type="button"
                  @click="studioZoom = 1.0"
                  class="h-7 px-2 text-[10px] text-slate-500 hover:text-slate-900 border-l border-slate-200"
                >
                  100%
                </button>
              </div>
            </div>

            <!-- Canvas Viewport -->
            <div class="flex-1 flex items-center justify-center overflow-auto p-2">
              <div
                class="relative transition-transform duration-100 ease-out origin-center"
                :style="{ transform: `scale(${studioZoom})` }"
              >
                <!-- INTERACTIVE DRAWING LAYER CONTAINER -->
                <div
                  ref="canvasContainerRef"
                  @mousedown="handleCanvasMouseDown"
                  @mousemove="handleCanvasMouseMove"
                  @mouseup="handleCanvasMouseUp"
                  :class="[
                    'relative w-[440px] sm:w-[480px] h-[580px] rounded-lg shadow-xl border overflow-hidden select-none',
                    studioMode === 'draw' ? 'cursor-crosshair' : 'cursor-default',
                    editingTemplate.format === 'new'
                      ? 'bg-white border-slate-300'
                      : 'bg-[#FAF6EC] border-amber-300'
                  ]"
                >
                  <!-- Background: Custom Uploaded Image if available -->
                  <img
                    v-if="customImagePreview"
                    :src="customImagePreview"
                    alt="Template Canvas Background"
                    class="w-full h-full object-contain pointer-events-none"
                  />

                  <!-- Default High-Fidelity Vector Certificate Layout Mock -->
                  <div
                    v-else
                    class="w-full h-full p-6 flex flex-col justify-between font-serif pointer-events-none"
                  >
                    <!-- Emblem & Title -->
                    <div class="text-center space-y-1">
                      <div class="w-10 h-10 mx-auto rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-sm">
                        🇰🇭
                      </div>
                      <div class="text-xs font-bold text-slate-800 tracking-wider">
                        {{ locale === 'km' ? 'ព្រះរាជាណាចក្រកម្ពុជា' : 'KINGDOM OF CAMBODIA' }}
                      </div>
                      <div class="text-[9px] text-slate-500">
                        {{ locale === 'km' ? 'ជាតិ សាសនា ព្រះមហាក្សត្រ' : 'NATION RELIGION KING' }}
                      </div>
                      <div class="text-xs font-extrabold text-gov-primary font-sans pt-1">
                        {{ editingTemplate.format === 'new' ? (locale === 'km' ? 'សំបុត្រកំណើត' : 'BIRTH CERTIFICATE') : (locale === 'km' ? 'សំបុត្រកំណើតទម្រង់ចាស់' : 'ARCHIVAL CIVIL RECORD') }}
                      </div>
                    </div>

                    <!-- Mock Form Lines -->
                    <div class="space-y-4 text-[10px] text-slate-600 border-t border-b border-slate-200/80 py-4 font-sans">
                      <div class="flex justify-between font-mono">
                        <span>{{ locale === 'km' ? 'លេខកូដសម្គាល់ជាតិ: 1204009821' : 'National ID Code: 1204009821' }}</span>
                        <span>{{ locale === 'km' ? 'សៀវភៅលេខ: BC-2024-009821' : 'Book No: BC-2024-009821' }}</span>
                      </div>
                      <div v-if="locale === 'km'">ឈ្មោះខ្មែរ: <span class="font-bold text-slate-900 font-khmer">សុខ ចាន់ដារ៉ា</span></div>
                      <div v-else>Khmer Name: <span class="font-bold text-slate-900 font-khmer">សុខ ចាន់ដារ៉ា</span></div>
                      <div v-if="locale === 'km'">ឈ្មោះឡាតាំង: <span class="font-bold text-slate-900 font-latin">SOK CHANDARA</span></div>
                      <div v-else>Latin Name: <span class="font-bold text-slate-900 font-latin">SOK CHANDARA</span></div>
                      <div class="flex justify-between">
                        <span>{{ locale === 'km' ? 'ថ្ងៃខែឆ្នាំកំណើត: ១៥ ឧសភា ២០០០' : 'Date of Birth: 15 May 2000' }}</span>
                        <span>{{ locale === 'km' ? 'ភេទ: ប្រុស' : 'Gender: Male' }}</span>
                      </div>
                      <div>{{ locale === 'km' ? 'ទីកន្លែងកំណើត: រាជធានីភ្នំពេញ' : 'Place of Birth: Phnom Penh' }}</div>
                      <div>{{ locale === 'km' ? 'ឈ្មោះឪពុក: សុខ សុផល • ឈ្មោះម្តាយ: ចាន់ គន្ធា' : 'Father: SOK SOPHAL • Mother: CHAN KUNTHEA' }}</div>
                      <div>{{ locale === 'km' ? 'រដ្ឋបាលខណ្ឌ: ដូនពេញ' : 'District: Daun Penh' }}</div>
                    </div>

                    <!-- Seal & Signatures -->
                    <div class="flex justify-between items-end text-[9px] text-slate-500 font-sans">
                      <div class="w-14 h-14 border border-dashed border-slate-300 rounded flex items-center justify-center text-[8px] text-slate-400">
                        {{ editingTemplate.format === 'new' ? 'QR' : (locale === 'km' ? 'បណ្ណសារ' : 'ARCHIVE') }}
                      </div>
                      <div class="text-center space-y-1">
                        <div>{{ locale === 'km' ? 'ច្រកចេញចូលតែមួយ' : 'One Window Service' }}</div>
                        <div class="w-12 h-12 rounded-full border border-red-300 bg-red-50 text-red-600 flex items-center justify-center text-[8px] font-bold">
                          {{ locale === 'km' ? 'ត្រា' : 'SEAL' }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- EXISTING BOUNDING BOXES OVERLAY -->
                  <div
                    v-for="b in editingTemplate.boxes"
                    :key="b.id"
                    @mousedown="handleBoxMouseDown($event, b)"
                    :style="{
                      left: `${b.x}%`,
                      top: `${b.y}%`,
                      width: `${b.width}%`,
                      height: `${b.height}%`
                    }"
                    :class="[
                      'bounding-box-item absolute border-2 rounded transition-all cursor-move flex items-center justify-between px-1.5 z-20 group',
                      selectedBoxId === b.id
                        ? 'ring-4 ring-gov-primary/40 border-gov-primary z-30 shadow-lg'
                        : `${getFieldDef(b.key).color} hover:ring-2 hover:ring-slate-400`
                    ]"
                  >
                    <span class="text-[9px] font-bold truncate tracking-tight uppercase select-none">
                      {{ getFieldLabel(b.key) }}
                    </span>

                    <button
                      type="button"
                      @click.stop="deleteBox(b.id)"
                      class="w-3.5 h-3.5 rounded bg-white/80 hover:bg-red-500 hover:text-white text-slate-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>

                  <!-- DYNAMIC RUBBERBAND RECTANGLE WHILE DRAGGING TO DRAW -->
                  <div
                    v-if="previewRect"
                    :style="{
                      left: `${previewRect.x}%`,
                      top: `${previewRect.y}%`,
                      width: `${previewRect.width}%`,
                      height: `${previewRect.height}%`
                    }"
                    class="absolute border-2 border-dashed border-gov-primary bg-gov-primary/20 rounded pointer-events-none z-40 flex items-center justify-center text-xs font-bold text-gov-primary"
                  >
                    <span>+ {{ locale === 'km' ? 'ប្រអប់ថ្មី' : 'New Box' }}</span>
                  </div>

                </div>
              </div>
            </div>

            <!-- Canvas Bottom Helper Info -->
            <div class="pt-3 flex flex-wrap items-center justify-between text-xs text-slate-500 border-t border-slate-200 mt-2 gap-2">
              <div class="flex items-center gap-3">
                <span>{{ t('templates.boxes_total') }} <strong class="text-gov-primary">{{ editingTemplate.boxes.length }}</strong></span>
                <span>•</span>
                <span>{{ locale === 'km' ? 'កូអរដោនេ:' : 'Coordinates:' }} <strong class="font-mono text-slate-700">Responsive %</strong></span>
              </div>
              <div class="flex items-center gap-2">
                <label class="text-[11px] text-gov-primary hover:underline cursor-pointer">
                  <span>{{ customImagePreview ? t('templates.change_image', 'ប្តូររូបភាពគំរូ') : t('templates.upload_sample', 'បង្ហោះរូបភាពគំរូជាក់ស្តែង') }}</span>
                  <input type="file" accept="image/*" class="hidden" @change="handleCustomImageUpload" />
                </label>
                <button
                  v-if="customImagePreview"
                  type="button"
                  @click="removeCustomImage"
                  class="text-[11px] text-red-500 hover:underline"
                >
                  {{ t('templates.reset_image', 'ប្រើគំរូលំនាំដើម') }}
                </button>
              </div>
            </div>

          </div>

          <!-- RIGHT: INSPECTOR & FIELDS SIDEBAR (Col 4) -->
          <div class="lg:col-span-4 bg-white border-l border-gov-border p-5 flex flex-col justify-between overflow-y-auto space-y-6">
            
            <div class="space-y-5">
              <!-- Template Metadata Config -->
              <div class="space-y-3 pb-4 border-b border-slate-100">
                <div class="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {{ t('templates.template_info') }}
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">
                    {{ t('templates.tpl_name') }}
                  </label>
                  <input
                    v-model="editingTemplate.nameKm"
                    type="text"
                    class="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-gov-primary focus:outline-none"
                  />
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block text-[11px] font-semibold text-slate-600 mb-1">
                      {{ t('templates.format_category') }}
                    </label>
                    <select
                      v-model="editingTemplate.format"
                      class="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none"
                    >
                      <option value="new">{{ t('templates.tabs.new') }}</option>
                      <option value="old">{{ t('templates.tabs.old') }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-[11px] font-semibold text-slate-600 mb-1">
                      {{ t('templates.aspect_ratio') }}
                    </label>
                    <input
                      v-model="editingTemplate.aspectRatio"
                      type="text"
                      disabled
                      class="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 text-slate-500"
                    />
                  </div>
                </div>
              </div>

              <!-- Active Selected Box Properties Inspector -->
              <div v-if="activeBox" class="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3">
                <div class="flex items-center justify-between">
                  <div class="text-xs font-bold text-gov-primary flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-gov-primary"></span>
                    <span>{{ t('templates.active_box') }}</span>
                  </div>
                  <button
                    type="button"
                    @click="deleteBox(activeBox.id)"
                    class="text-[11px] text-red-600 hover:underline font-bold"
                  >
                    {{ t('templates.btn_delete_box') }}
                  </button>
                </div>

                <!-- Field Mapping Selector -->
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">
                    {{ t('templates.assigned_field') }}
                  </label>
                  <select
                    v-model="activeBox.key"
                    class="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-gov-primary focus:outline-none"
                  >
                    <option
                      v-for="f in FIELD_DEFINITIONS"
                      :key="f.key"
                      :value="f.key"
                    >
                      {{ locale === 'km' ? f.labelKm : f.labelEn }}
                    </option>
                  </select>
                </div>

                <!-- Numeric Coordinate Sliders / Inputs -->
                <div class="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span class="text-[10px] text-slate-500 font-mono">X (%)</span>
                    <input
                      v-model.number="activeBox.x"
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      class="w-full px-2 py-1 rounded border border-slate-300 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <span class="text-[10px] text-slate-500 font-mono">Y (%)</span>
                    <input
                      v-model.number="activeBox.y"
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      class="w-full px-2 py-1 rounded border border-slate-300 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <span class="text-[10px] text-slate-500 font-mono">Width (%)</span>
                    <input
                      v-model.number="activeBox.width"
                      type="number"
                      step="0.5"
                      min="2"
                      max="100"
                      class="w-full px-2 py-1 rounded border border-slate-300 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <span class="text-[10px] text-slate-500 font-mono">Height (%)</span>
                    <input
                      v-model.number="activeBox.height"
                      type="number"
                      step="0.5"
                      min="2"
                      max="100"
                      class="w-full px-2 py-1 rounded border border-slate-300 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <!-- List of All Configured Bounding Boxes -->
              <div class="space-y-2">
                <div class="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>{{ t('templates.all_boxes') }} ({{ editingTemplate.boxes.length }})</span>
                  <button
                    type="button"
                    @click="studioMode = 'draw'"
                    class="text-[11px] text-gov-primary hover:underline font-bold"
                  >
                    + {{ t('templates.tool_draw') }}
                  </button>
                </div>

                <div class="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  <div
                    v-for="b in editingTemplate.boxes"
                    :key="b.id"
                    @click="selectedBoxId = b.id; studioMode = 'select'"
                    :class="[
                      'p-2 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-colors',
                      selectedBoxId === b.id
                        ? 'bg-blue-50 border-gov-primary font-bold text-gov-primary shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    ]"
                  >
                    <div class="flex items-center gap-2 truncate">
                      <span class="w-2 h-2 rounded-full shrink-0" :class="getFieldDef(b.key).color.split(' ')[0].replace('border-', 'bg-')"></span>
                      <span class="truncate">{{ getFieldLabel(b.key) }}</span>
                    </div>

                    <div class="flex items-center gap-2 shrink-0 font-mono text-[10px] text-slate-400">
                      <span>{{ b.width }}% × {{ b.height }}%</span>
                      <button
                        type="button"
                        @click.stop="deleteBox(b.id)"
                        class="text-slate-400 hover:text-red-500 text-sm font-bold px-1"
                        title="Delete box"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <!-- Sidebar Bottom Action Buttons -->
            <div class="pt-4 border-t border-slate-100 space-y-2">
              <button
                type="button"
                @click="saveCurrentStudioTemplate"
                class="w-full h-11 rounded-xl bg-gov-primary hover:bg-gov-primary-hover text-white font-bold text-xs sm:text-sm shadow-gov-sm transition-all flex items-center justify-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ t('templates.save_changes') }}</span>
              </button>
              <button
                type="button"
                @click="closeStudio"
                class="w-full h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition-colors"
              >
                {{ t('common.cancel') }}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>

  </main>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
