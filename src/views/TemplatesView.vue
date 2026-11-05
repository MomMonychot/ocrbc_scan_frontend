<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import BaseDropdownSelect from '../components/BaseDropdownSelect.vue'
import BaseDropdownMenu from '../components/BaseDropdownMenu.vue'

const { t, locale } = useI18n()
const router = useRouter()

// Local storage key for persistence
const STORAGE_KEY = 'district_ocr_templates_v3'

// -------------------------------------------------------------
// Typography Options (Khmer Fonts requested by user)
// -------------------------------------------------------------
const FONT_OPTIONS = [
  {
    id: 'moul',
    nameKm: 'Khmer OS Moul Light (អក្សរមូលស្រាល)',
    nameEn: 'Khmer OS Moul Light',
    cssClass: 'font-khmer-moul',
    descKm: 'សម្រាប់ចំណងជើងរដ្ឋបាលផ្លូវការ និងឈ្មោះស្ថាប័នជាតិ',
    descEn: 'For official ministry titles, headers, and national insignias'
  },
  {
    id: 'siemreap',
    nameKm: 'Khmer OS Siemreap (អក្សរសៀមរាប)',
    nameEn: 'Khmer OS Siemreap',
    cssClass: 'font-khmer-siemreap',
    descKm: 'សម្រាប់ខ្លឹមសារព័ត៌មានលម្អិត និងកថាខណ្ឌរដ្ឋបាល',
    descEn: 'For administrative body copy and field descriptions'
  },
  {
    id: 'battambang',
    nameKm: 'Khmer OS Battambang (អក្សរបាត់ដំបង)',
    nameEn: 'Khmer OS Battambang',
    cssClass: 'font-khmer-battambang',
    descKm: 'សម្រាប់ទិន្នន័យស្ដង់ដារ តួលេខ និងឈ្មោះសាមីខ្លួន',
    descEn: 'For standard document values, numbers, and citizen names'
  },
  {
    id: 'bokor',
    nameKm: 'Khmer OS Bokor (អក្សរបូកគោ)',
    nameEn: 'Khmer OS Bokor',
    cssClass: 'font-khmer-bokor',
    descKm: 'សម្រាប់ចំណងជើងរង និងអនុក្រឹត្យ',
    descEn: 'For decorative subheadings and decree numbers'
  },
  {
    id: 'kantumruy',
    nameKm: 'Kantumruy Pro (កាន់ទុំរុយ ប្រូ)',
    nameEn: 'Kantumruy Pro',
    cssClass: 'font-khmer-sans',
    descKm: 'សម្រាប់ទម្រង់ឌីជីថលទំនើប មានភាពច្បាស់ខ្ពស់',
    descEn: 'For modern high-legibility digital registry interfaces'
  },
  {
    id: 'serif',
    nameKm: 'Noto Serif Khmer (អក្សរខ្នាតមានជើង)',
    nameEn: 'Noto Serif Khmer',
    cssClass: 'font-khmer-serif',
    descKm: 'សម្រាប់ប័ណ្ណសារគតិយុត្តបុរាណ និងច្បាប់ចម្លងប្រវត្តិសាស្ត្រ',
    descEn: 'For historical legal archives and certified copies'
  }
]

// Available Field Definitions for Birth Certificates
const FIELD_DEFINITIONS = [
  { key: 'national_header', labelKm: 'ចំណងជើងជាតិ និងបាវចនា', labelEn: 'National Header & Motto', defaultFont: 'moul', defaultSize: 15, defaultWeight: 'bold', defaultColor: '#1E3A8A' },
  { key: 'certificate_title', labelKm: 'ចំណងជើងសំបុត្រកំណើត', labelEn: 'Certificate Title', defaultFont: 'moul', defaultSize: 18, defaultWeight: 'bold', defaultColor: '#1E3A8A' },
  { key: 'certificate_no', labelKm: 'សៀវភៅលេខ ឬសំបុត្រលេខ', labelEn: 'Certificate / Book No.', defaultFont: 'battambang', defaultSize: 12, defaultWeight: 'semibold', defaultColor: '#0F172A' },
  { key: 'national_id', labelKm: 'លេខកូដសម្គាល់ជាតិ (NID)', labelEn: 'National ID (NID)', defaultFont: 'battambang', defaultSize: 13, defaultWeight: 'bold', defaultColor: '#1E3A8A' },
  { key: 'full_name_km', labelKm: 'ឈ្មោះសាមីខ្លួន (អក្សរខ្មែរ)', labelEn: 'Citizen Full Name (Khmer)', defaultFont: 'moul', defaultSize: 14, defaultWeight: 'bold', defaultColor: '#0F172A' },
  { key: 'full_name_en', labelKm: 'ឈ្មោះជាអក្សរឡាតាំង', labelEn: 'Full Name (Latin)', defaultFont: 'battambang', defaultSize: 13, defaultWeight: 'bold', defaultColor: '#0F172A' },
  { key: 'gender', labelKm: 'ភេទ', labelEn: 'Gender', defaultFont: 'siemreap', defaultSize: 12, defaultWeight: 'semibold', defaultColor: '#0F172A' },
  { key: 'birth_date', labelKm: 'ថ្ងៃខែឆ្នាំកំណើត', labelEn: 'Date of Birth', defaultFont: 'siemreap', defaultSize: 12, defaultWeight: 'medium', defaultColor: '#0F172A' },
  { key: 'birth_place', labelKm: 'ទីកន្លែងកំណើត (ភូមិ-ឃុំ-ស្រុក-ខេត្ត)', labelEn: 'Place of Birth', defaultFont: 'siemreap', defaultSize: 12, defaultWeight: 'medium', defaultColor: '#0F172A' },
  { key: 'father_details', labelKm: 'ព័ត៌មានឪពុក (ឈ្មោះ និងសញ្ជាតិ)', labelEn: "Father's Details", defaultFont: 'siemreap', defaultSize: 12, defaultWeight: 'medium', defaultColor: '#0F172A' },
  { key: 'mother_details', labelKm: 'ព័ត៌មានម្តាយ (ឈ្មោះ និងសញ្ជាតិ)', labelEn: "Mother's Details", defaultFont: 'siemreap', defaultSize: 12, defaultWeight: 'medium', defaultColor: '#0F172A' },
  { key: 'district_office', labelKm: 'សាលាក្រុង-ស្រុក-ខណ្ឌ ចុះបញ្ជី', labelEn: 'Issuing Municipal Office', defaultFont: 'battambang', defaultSize: 12, defaultWeight: 'semibold', defaultColor: '#1E3A8A' },
  { key: 'official_stamp', labelKm: 'ត្រា និងហត្ថលេខាមន្ត្រី', labelEn: 'Official Seal & Signature', defaultFont: 'siemreap', defaultSize: 11, defaultWeight: 'semibold', defaultColor: '#BE123C' },
  { key: 'qr_code', labelKm: 'កូដ QR សុពលភាពជាតិ', labelEn: 'Official Validation QR Code', defaultFont: 'battambang', defaultSize: 11, defaultWeight: 'medium', defaultColor: '#0F172A' }
]

// Authentic sample values extracted from birth certificates
const SAMPLE_DOCUMENT_VALUES = {
  national_header: 'ព្រះរាជាណាចក្រកម្ពុជា\nជាតិ សាសនា ព្រះមហាក្សត្រ',
  certificate_title: 'សេចក្តីចម្លងសំបុត្រកំណើត\nCOPY OF BIRTH CERTIFICATE',
  certificate_no: 'សៀវភៅលេខ: ១២ / លេខ: ០៨៤ / ឆ្នាំ: ២០២៤',
  national_id: 'ID: ០១០២០៣០៤០៥',
  full_name_km: 'សុខ ចាន់ដារ៉ា',
  full_name_en: 'SOK CHANDARA',
  gender: 'ភេទ: ប្រុស / Male',
  birth_date: 'ថ្ងៃទី ១៥ ខែ ឧសភា ឆ្នាំ ២០០៦ (15 May 2006)',
  birth_place: 'ភូមិអង្រ្កង ឃុំបឹងព្រះ ស្រុកបាភ្នំ ខេត្តព្រៃវែង',
  father_details: 'ឪពុក: សុខ សំអាត, ជនជាតិ: ខ្មែរ, សញ្ជាតិ: កម្ពុជា',
  mother_details: 'ម្តាយ: ម៉ែន ចិន្តា, ជនជាតិ: ខ្មែរ, សញ្ជាតិ: កម្ពុជា',
  district_office: 'សាលាស្រុកបាភ្នំ ខេត្តព្រៃវែង (Ba Phnum District Office)',
  official_stamp: 'បានបញ្ជាក់ត្រឹមត្រូវតាមច្បាប់ដើម\nមន្ត្រីអត្រានុកូលដ្ឋាន [ត្រាផ្លូវការ]',
  qr_code: 'VERIFIED // NID:0102030405 // OWSU-BC-2024'
}

// Default Seed Templates
const DEFAULT_TEMPLATES = [
  {
    id: 'tpl-std-digital-2026',
    format: 'new', // សេចក្តីចម្លងសំបុត្រកំណើត (គ្មានពាក្យបញ្ជាក់)
    nameKm: 'សេចក្តីចម្លងសំបុត្រកំណើត (ឌីជីថលស្ដង់ដារជាតិ)',
    nameEn: 'Copy of Birth Certificate (National Digital Standard)',
    descriptionKm: 'ទម្រង់សេចក្តីចម្លងសំបុត្រកំណើតផ្លូវការ (គ្មានពាក្យបញ្ជាក់) មានកូដ QR លេខកូដជាតិ និងអក្សរឡាតាំង។',
    descriptionEn: 'Official national digital standard without certification clause, with QR and bilingual fields.',
    updatedAt: '2026-11-05',
    typographyPreset: 'royal',
    boxes: [
      { id: 'b1', key: 'national_header', x: 20.0, y: 3.5, width: 60.0, height: 6.5, font: 'moul', size: 14, weight: 'bold', color: '#1E3A8A', align: 'center', bg: 'transparent', opacity: 100, borderStyle: 'none', borderWidth: 0, borderColor: '#CBD5E1', radius: 'none', padding: 'tight' },
      { id: 'b2', key: 'certificate_title', x: 15.0, y: 12.0, width: 70.0, height: 7.0, font: 'moul', size: 16, weight: 'bold', color: '#1E3A8A', align: 'center', bg: 'transparent', opacity: 100, borderStyle: 'none', borderWidth: 0, borderColor: '#CBD5E1', radius: 'none', padding: 'tight' },
      { id: 'b3', key: 'certificate_no', x: 8.0, y: 20.5, width: 42.0, height: 5.5, font: 'battambang', size: 12, weight: 'semibold', color: '#0F172A', align: 'left', bg: '#F8FAFC', opacity: 80, borderStyle: 'solid', borderWidth: 1, borderColor: '#E2E8F0', radius: 'lg', padding: 'normal' },
      { id: 'b4', key: 'national_id', x: 55.0, y: 20.5, width: 37.0, height: 5.5, font: 'battambang', size: 12, weight: 'bold', color: '#1E3A8A', align: 'right', bg: '#F8FAFC', opacity: 80, borderStyle: 'solid', borderWidth: 1, borderColor: '#E2E8F0', radius: 'lg', padding: 'normal' },
      { id: 'b5', key: 'full_name_km', x: 8.0, y: 28.0, width: 84.0, height: 6.5, font: 'moul', size: 15, weight: 'bold', color: '#0F172A', align: 'left', bg: '#FFFFFF', opacity: 100, borderStyle: 'solid', borderWidth: 1, borderColor: '#CBD5E1', radius: 'xl', padding: 'normal' },
      { id: 'b6', key: 'full_name_en', x: 8.0, y: 36.0, width: 55.0, height: 5.5, font: 'battambang', size: 13, weight: 'bold', color: '#0F172A', align: 'left', bg: '#FFFFFF', opacity: 100, borderStyle: 'solid', borderWidth: 1, borderColor: '#E2E8F0', radius: 'lg', padding: 'normal' },
      { id: 'b7', key: 'gender', x: 65.0, y: 36.0, width: 27.0, height: 5.5, font: 'siemreap', size: 12, weight: 'semibold', color: '#0F172A', align: 'center', bg: '#FFFFFF', opacity: 100, borderStyle: 'solid', borderWidth: 1, borderColor: '#E2E8F0', radius: 'lg', padding: 'normal' },
      { id: 'b8', key: 'birth_date', x: 8.0, y: 43.5, width: 84.0, height: 5.5, font: 'siemreap', size: 12, weight: 'medium', color: '#0F172A', align: 'left', bg: '#FFFFFF', opacity: 100, borderStyle: 'solid', borderWidth: 1, borderColor: '#E2E8F0', radius: 'lg', padding: 'normal' },
      { id: 'b9', key: 'birth_place', x: 8.0, y: 51.0, width: 84.0, height: 7.0, font: 'siemreap', size: 12, weight: 'medium', color: '#0F172A', align: 'left', bg: '#FFFFFF', opacity: 100, borderStyle: 'solid', borderWidth: 1, borderColor: '#E2E8F0', radius: 'lg', padding: 'normal' },
      { id: 'b10', key: 'father_details', x: 8.0, y: 60.0, width: 84.0, height: 5.5, font: 'siemreap', size: 12, weight: 'medium', color: '#0F172A', align: 'left', bg: '#FFFFFF', opacity: 100, borderStyle: 'none', borderWidth: 0, borderColor: '#E2E8F0', radius: 'none', padding: 'tight' },
      { id: 'b11', key: 'mother_details', x: 8.0, y: 67.0, width: 84.0, height: 5.5, font: 'siemreap', size: 12, weight: 'medium', color: '#0F172A', align: 'left', bg: '#FFFFFF', opacity: 100, borderStyle: 'none', borderWidth: 0, borderColor: '#E2E8F0', radius: 'none', padding: 'tight' },
      { id: 'b12', key: 'qr_code', x: 8.0, y: 76.5, width: 22.0, height: 18.0, font: 'battambang', size: 10, weight: 'medium', color: '#0F172A', align: 'center', bg: '#F8FAFC', opacity: 90, borderStyle: 'solid', borderWidth: 1, borderColor: '#CBD5E1', radius: 'xl', padding: 'tight' },
      { id: 'b13', key: 'official_stamp', x: 50.0, y: 76.5, width: 42.0, height: 18.0, font: 'siemreap', size: 11, weight: 'semibold', color: '#BE123C', align: 'center', bg: '#FFF1F2', opacity: 70, borderStyle: 'dashed', borderWidth: 1, borderColor: '#FDA4AF', radius: 'xl', padding: 'normal' }
    ]
  },
  {
    id: 'tpl-std-certified-copy',
    format: 'old', // សេចក្តីចម្លងសំបុត្របញ្ជាក់កំណើត (ទម្រង់ចាស់)
    nameKm: 'សេចក្តីចម្លងសំបុត្របញ្ជាក់កំណើត (ទម្រង់ច្បាប់ដើមអត្រានុកូលដ្ឋាន)',
    nameEn: 'Certified Copy of Birth Certificate (Official Archive)',
    descriptionKm: 'ទម្រង់សេចក្តីចម្លងសំបុត្របញ្ជាក់កំណើត (ទម្រង់ចាស់មានពាក្យបញ្ជាក់) សម្រាប់ស្កេន ស្រង់ទិន្នន័យ និងផ្ទៀងផ្ទាត់។',
    descriptionEn: 'Certified copy of birth certificate format for legacy archives and OCR text extraction.',
    updatedAt: '2026-11-04',
    typographyPreset: 'archive',
    boxes: [
      { id: 'ob1', key: 'national_header', x: 20.0, y: 4.0, width: 60.0, height: 6.5, font: 'moul', size: 14, weight: 'bold', color: '#1E3A8A', align: 'center', bg: 'transparent', opacity: 100, borderStyle: 'none', borderWidth: 0, borderColor: '#CBD5E1', radius: 'none', padding: 'tight' },
      { id: 'ob2', key: 'certificate_title', x: 10.0, y: 13.0, width: 80.0, height: 7.0, font: 'moul', size: 16, weight: 'bold', color: '#1E3A8A', align: 'center', bg: 'transparent', opacity: 100, borderStyle: 'none', borderWidth: 0, borderColor: '#CBD5E1', radius: 'none', padding: 'tight' },
      { id: 'ob3', key: 'certificate_no', x: 8.0, y: 22.0, width: 40.0, height: 6.0, font: 'battambang', size: 12, weight: 'semibold', color: '#0F172A', align: 'left', bg: '#F8FAFC', opacity: 100, borderStyle: 'solid', borderWidth: 1, borderColor: '#CBD5E1', radius: 'lg', padding: 'normal' },
      { id: 'ob4', key: 'full_name_km', x: 8.0, y: 30.0, width: 84.0, height: 6.5, font: 'moul', size: 14, weight: 'bold', color: '#0F172A', align: 'left', bg: '#FFFFFF', opacity: 100, borderStyle: 'solid', borderWidth: 1, borderColor: '#CBD5E1', radius: 'lg', padding: 'normal' },
      { id: 'ob5', key: 'birth_date', x: 8.0, y: 39.0, width: 84.0, height: 6.0, font: 'siemreap', size: 12, weight: 'medium', color: '#0F172A', align: 'left', bg: '#FFFFFF', opacity: 100, borderStyle: 'solid', borderWidth: 1, borderColor: '#E2E8F0', radius: 'lg', padding: 'normal' },
      { id: 'ob6', key: 'birth_place', x: 8.0, y: 47.0, width: 84.0, height: 7.0, font: 'siemreap', size: 12, weight: 'medium', color: '#0F172A', align: 'left', bg: '#FFFFFF', opacity: 100, borderStyle: 'solid', borderWidth: 1, borderColor: '#E2E8F0', radius: 'lg', padding: 'normal' },
      { id: 'ob7', key: 'father_details', x: 8.0, y: 56.0, width: 84.0, height: 6.0, font: 'siemreap', size: 12, weight: 'medium', color: '#0F172A', align: 'left', bg: '#FFFFFF', opacity: 100, borderStyle: 'none', borderWidth: 0, borderColor: '#E2E8F0', radius: 'none', padding: 'tight' },
      { id: 'ob8', key: 'mother_details', x: 8.0, y: 64.0, width: 84.0, height: 6.0, font: 'siemreap', size: 12, weight: 'medium', color: '#0F172A', align: 'left', bg: '#FFFFFF', opacity: 100, borderStyle: 'none', borderWidth: 0, borderColor: '#E2E8F0', radius: 'none', padding: 'tight' },
      { id: 'ob9', key: 'official_stamp', x: 50.0, y: 74.0, width: 42.0, height: 20.0, font: 'siemreap', size: 11, weight: 'bold', color: '#BE123C', align: 'center', bg: '#FFF1F2', opacity: 80, borderStyle: 'solid', borderWidth: 1, borderColor: '#F43F5E', radius: 'xl', padding: 'normal' }
    ]
  }
]

// -------------------------------------------------------------
// Component State
// -------------------------------------------------------------
const templates = ref([])
const activeFormatTab = ref('all') // 'all' | 'new' | 'old'
const showStudio = ref(false)
const editingTemplate = ref(null)
const selectedBoxId = ref(null)
const studioActiveTab = ref('typography') // 'typography' | 'appearance' | 'geometry' | 'presets'
const previewMode = ref('sample') // 'sample' (real data) | 'wireframe' (field keys)
const zoomLevel = ref(100) // 75 | 100 | 125
const isAddDropdownOpen = ref(false)
const notification = ref(null)

// Format choice modal
const showFormatModal = ref(false)
const creationSource = ref('blank') // 'blank' | 'computer'

// Document canvas container ref for mouse positioning
const canvasRef = ref(null)

// Toast notification trigger
function showNotification(text, type = 'success') {
  notification.value = { text, type }
  setTimeout(() => {
    notification.value = null
  }, 3500)
}

// -------------------------------------------------------------
// Lifecycle & Persistence
// -------------------------------------------------------------
onMounted(() => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      templates.value = JSON.parse(stored)
    } else {
      templates.value = JSON.parse(JSON.stringify(DEFAULT_TEMPLATES))
      saveTemplates()
    }
  } catch (err) {
    console.error('Error loading templates:', err)
    templates.value = JSON.parse(JSON.stringify(DEFAULT_TEMPLATES))
  }
})

function saveTemplates() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates.value))
  } catch (err) {
    console.error('Failed to save templates to localStorage:', err)
  }
}

// Counts for top metric cards
const totalTemplatesCount = computed(() => templates.value.length)
const newTemplatesCount = computed(() => templates.value.filter(t => t.format === 'new').length)
const oldTemplatesCount = computed(() => templates.value.filter(t => t.format === 'old').length)

// Filtered templates list for the enterprise table
const filteredTemplates = computed(() => {
  if (activeFormatTab.value === 'new') {
    return templates.value.filter(t => t.format === 'new')
  }
  if (activeFormatTab.value === 'old') {
    return templates.value.filter(t => t.format === 'old')
  }
  return templates.value
})

// Active box computed helper
const activeBox = computed(() => {
  if (!editingTemplate.value || !selectedBoxId.value) return null
  return editingTemplate.value.boxes.find(b => b.id === selectedBoxId.value) || null
})

// Helper to get field definition
function getFieldDef(key) {
  return FIELD_DEFINITIONS.find(f => f.key === key) || { key, labelKm: key, labelEn: key, defaultFont: 'siemreap', defaultSize: 12, defaultWeight: 'medium', defaultColor: '#0F172A' }
}

function getFieldLabel(key) {
  const def = getFieldDef(key)
  return locale.value === 'km' ? def.labelKm : def.labelEn
}

function getFontDef(fontId) {
  return FONT_OPTIONS.find(f => f.id === fontId) || FONT_OPTIONS[1]
}

function getFontCssClass(fontId) {
  return getFontDef(fontId).cssClass
}

// Studio Box Dropdown Options
const studioBoxOptions = computed(() => {
  if (!editingTemplate.value?.boxes) return []
  return editingTemplate.value.boxes.map(b => ({
    value: b.key,
    label: getFieldLabel(b.key),
    sublabel: `${getFontDef(b.font).nameKm} • ${b.size}px`,
    badge: b.weight
  }))
})

// -------------------------------------------------------------
// Studio Actions & Box Typography Controls
// -------------------------------------------------------------

function openStudio(template) {
  editingTemplate.value = JSON.parse(JSON.stringify(template))
  // Default to selecting the child name or first box
  const targetBox = editingTemplate.value.boxes.find(b => b.key === 'full_name_km') || editingTemplate.value.boxes[0]
  selectedBoxId.value = targetBox ? targetBox.id : null
  studioActiveTab.value = 'typography'
  zoomLevel.value = 100
  showStudio.value = true
}

function closeStudio() {
  showStudio.value = false
  editingTemplate.value = null
  selectedBoxId.value = null
}

function saveStudioChanges() {
  if (!editingTemplate.value) return
  editingTemplate.value.updatedAt = new Date().toISOString().slice(0, 10)
  
  const idx = templates.value.findIndex(t => t.id === editingTemplate.value.id)
  if (idx >= 0) {
    templates.value[idx] = JSON.parse(JSON.stringify(editingTemplate.value))
  } else {
    templates.value.unshift(JSON.parse(JSON.stringify(editingTemplate.value)))
  }
  saveTemplates()
  showNotification(t('templates.toast_saved'))
}

// Select a box by ID
function selectBox(boxId) {
  selectedBoxId.value = boxId
}

// Select a box by Field Key
function selectBoxByKey(key) {
  if (!editingTemplate.value) return
  const box = editingTemplate.value.boxes.find(b => b.key === key)
  if (box) {
    selectedBoxId.value = box.id
  }
}

// Apply font to active box
function setBoxFont(fontId) {
  if (!activeBox.value) return
  activeBox.value.font = fontId
}

// Apply font weight
function setBoxWeight(weight) {
  if (!activeBox.value) return
  activeBox.value.weight = weight
}

// Apply text alignment
function setBoxAlign(align) {
  if (!activeBox.value) return
  activeBox.value.align = align
}

// Apply text color
function setBoxColor(color) {
  if (!activeBox.value) return
  activeBox.value.color = color
}

// Apply border style
function setBoxBorderStyle(style) {
  if (!activeBox.value) return
  activeBox.value.borderStyle = style
  if (style !== 'none' && (!activeBox.value.borderWidth || activeBox.value.borderWidth === 0)) {
    activeBox.value.borderWidth = 1
  }
}

// Apply background fill
function setBoxBackground(bg) {
  if (!activeBox.value) return
  activeBox.value.bg = bg
}

// Batch action: Apply current font to all boxes in template
function applyFontToAllBoxes(fontId) {
  if (!editingTemplate.value) return
  const chosenFont = fontId || (activeBox.value ? activeBox.value.font : 'siemreap')
  editingTemplate.value.boxes.forEach(b => {
    b.font = chosenFont
  })
  const fontName = getFontDef(chosenFont).nameKm
  showNotification(`បានកំណត់ពុម្ពអក្សរ "${fontName}" ទៅគ្រប់ប្រអប់ទាំងអស់!`)
}

// Preset Theme Application
function applyPresetTheme(presetKey) {
  if (!editingTemplate.value) return
  
  if (presetKey === 'royal') {
    editingTemplate.value.boxes.forEach(b => {
      if (b.key === 'national_header' || b.key === 'certificate_title' || b.key === 'full_name_km') {
        b.font = 'moul'
        b.weight = 'bold'
        b.color = '#1E3A8A'
      } else {
        b.font = 'siemreap'
        b.weight = 'medium'
        b.color = '#0F172A'
      }
    })
    showNotification('បានអនុវត្តកម្រងរចនាប័ទ្ម "ស្ដង់ដាររាជរដ្ឋាភិបាល (Moul Light + Siemreap)"')
  } else if (presetKey === 'modern') {
    editingTemplate.value.boxes.forEach(b => {
      if (b.key === 'national_header' || b.key === 'certificate_title') {
        b.font = 'moul'
        b.weight = 'bold'
        b.color = '#0F172A'
      } else {
        b.font = 'battambang'
        b.weight = 'semibold'
        b.color = '#0F172A'
      }
    })
    showNotification('បានអនុវត្តកម្រងរចនាប័ទ្ម "រដ្ឋបាលទំនើបឌីជីថល (Battambang + Kantumruy)"')
  } else if (presetKey === 'archive') {
    editingTemplate.value.boxes.forEach(b => {
      b.font = 'serif'
      b.color = '#0F172A'
    })
    showNotification('បានអនុវត្តកម្រងរចនាប័ទ្ម "ប័ណ្ណសារអត្រានុកូលដ្ឋាន (Serif + Siemreap)"')
  }
}

// Reset active box to default
function resetActiveBox() {
  if (!activeBox.value) return
  const def = getFieldDef(activeBox.value.key)
  activeBox.value.font = def.defaultFont || 'siemreap'
  activeBox.value.size = def.defaultSize || 12
  activeBox.value.weight = def.defaultWeight || 'medium'
  activeBox.value.color = def.defaultColor || '#0F172A'
  activeBox.value.bg = 'transparent'
  activeBox.value.opacity = 100
  activeBox.value.borderStyle = 'solid'
  activeBox.value.borderWidth = 1
  activeBox.value.borderColor = '#CBD5E1'
  activeBox.value.radius = 'lg'
  activeBox.value.padding = 'normal'
  showNotification('បានកំណត់រចនាប័ទ្មប្រអប់នេះឡើងវិញ')
}

// Duplicate Template
function duplicateTemplate(template) {
  const cloned = JSON.parse(JSON.stringify(template))
  cloned.id = 'tpl-copy-' + Date.now()
  cloned.nameKm = cloned.nameKm + ' (ច្បាប់ចម្លង)'
  cloned.nameEn = cloned.nameEn + ' (Copy)'
  cloned.updatedAt = new Date().toISOString().slice(0, 10)
  templates.value.unshift(cloned)
  saveTemplates()
  showNotification(t('templates.toast_duplicated'))
}

// Delete Template
function deleteTemplate(id) {
  if (templates.value.length <= 1) {
    alert(t('templates.cannot_delete_last'))
    return
  }
  if (confirm(t('templates.confirm_delete'))) {
    templates.value = templates.value.filter(t => t.id !== id)
    saveTemplates()
    showNotification(t('templates.toast_deleted'))
  }
}

// Add new template flow
function openFormatSelection(source = 'blank') {
  isAddDropdownOpen.value = false
  creationSource.value = source
  showFormatModal.value = true
}

function createTemplateConfirmed(formatType) {
  showFormatModal.value = false
  const isCertified = formatType === 'old'
  const newTpl = {
    id: 'tpl-custom-' + Date.now(),
    format: formatType,
    nameKm: isCertified ? 'សេចក្តីចម្លងសំបុត្របញ្ជាក់កំណើតថ្មី' : 'សេចក្តីចម្លងសំបុត្រកំណើតឌីជីថលថ្មី',
    nameEn: isCertified ? 'New Certified Copy of Birth Certificate' : 'New Digital Copy of Birth Certificate',
    descriptionKm: isCertified ? 'ទម្រង់សេចក្តីចម្លងបញ្ជាក់កំណើតសម្រាប់កំណត់ប្រអប់ពុម្ពអក្សរ' : 'ទម្រង់សេចក្តីចម្លងសំបុត្រកំណើតថ្មីទទួលទិន្នន័យស្រង់ចេញពី OCR',
    descriptionEn: 'Custom configured birth certificate template with box styling controls.',
    updatedAt: new Date().toISOString().slice(0, 10),
    boxes: JSON.parse(JSON.stringify(DEFAULT_TEMPLATES[0].boxes))
  }
  templates.value.unshift(newTpl)
  saveTemplates()
  openStudio(newTpl)
}

// Format badge styles
function getFormatBadgeClasses(format) {
  if (format === 'new') {
    return 'bg-blue-50 text-[#1E3A8A] border-blue-200'
  }
  return 'bg-amber-50 text-amber-800 border-amber-200'
}

// Typography summary label for table
function getTypographySummary(tpl) {
  if (!tpl.boxes || tpl.boxes.length === 0) return 'Standard'
  const fonts = new Set(tpl.boxes.map(b => b.font))
  if (fonts.has('moul') && fonts.has('siemreap')) {
    return 'Moul Light (Headers) + Siemreap (Body)'
  }
  if (fonts.has('battambang')) {
    return 'Khmer OS Battambang (Standard Data)'
  }
  return 'Khmer OS Siemreap + Moul'
}
</script>

<template>
  <main class="min-h-[calc(100vh-4rem)] bg-[#F8FAFC] py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-8 space-y-6">

      <!-- Toast Feedback Notification -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform -translate-y-2 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform -translate-y-2 opacity-0"
      >
        <div
          v-if="notification"
          :class="[
            'fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-3',
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          ]"
        >
          <svg v-if="notification.type === 'success'" class="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else class="w-5 h-5 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>{{ notification.text }}</span>
        </div>
      </transition>

      <!-- ============================================================= -->
      <!-- VIEW 1: TEMPLATE CATALOGUE & HIGH-END ENTERPRISE TABLE        -->
      <!-- ============================================================= -->
      <template v-if="!showStudio">
        
        <!-- Page Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#1E3A8A] border border-blue-200">
                Civil Status Standard 2026
              </span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              {{ t('templates.title') }}
            </h1>
            <p class="text-xs sm:text-sm text-[#475569] mt-1 max-w-3xl leading-relaxed">
              {{ t('templates.subtitle') }}
            </p>
          </div>

          <!-- Standard Add Template Dropdown Button -->
          <BaseDropdownMenu
            :buttonText="t('templates.btn_add')"
            variant="primary"
            align="right"
            menuWidth="w-80"
          >
            <template #icon>
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </template>
            <template #default="{ close }">
              <button
                type="button"
                @click="openFormatSelection('blank'); close()"
                class="w-full text-left p-3 rounded-xl hover:bg-blue-50/70 border border-transparent hover:border-blue-100 transition-colors flex items-start gap-3 cursor-pointer group"
              >
                <div class="w-9 h-9 rounded-xl bg-blue-100 text-[#1E3A8A] group-hover:bg-[#1E3A8A] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div class="text-xs font-bold text-slate-900 group-hover:text-[#1E3A8A]">{{ t('templates.choice_existing') }}</div>
                  <div class="text-[11px] text-slate-500 mt-0.5 leading-snug">{{ t('templates.choice_existing_desc') }}</div>
                </div>
              </button>

              <button
                type="button"
                @click="openFormatSelection('computer'); close()"
                class="w-full text-left p-3 rounded-xl hover:bg-emerald-50/70 border border-transparent hover:border-emerald-100 transition-colors flex items-start gap-3 cursor-pointer group"
              >
                <div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 group-hover:bg-emerald-700 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <div>
                  <div class="text-xs font-bold text-slate-900 group-hover:text-emerald-800">{{ t('templates.choice_computer') }}</div>
                  <div class="text-[11px] text-slate-500 mt-0.5 leading-snug">{{ t('templates.choice_computer_desc') }}</div>
                </div>
              </button>
            </template>
          </BaseDropdownMenu>
        </div>

        <!-- 4 Top Standard Metric Panels -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Card 1: Total Templates -->
          <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">{{ t('templates.stat_total') }}</span>
              <div class="w-8 h-8 rounded-lg bg-blue-50 text-[#1E3A8A] flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <div class="mt-2 text-2xl font-black text-slate-900 tracking-tight">{{ totalTemplatesCount }}</div>
            <div class="mt-1 text-xs text-slate-500">Official Civil Registry Formats</div>
          </div>

          <!-- Card 2: Digital New Format -->
          <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">{{ t('templates.stat_new') }}</span>
              <div class="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="mt-2 text-2xl font-black text-slate-900 tracking-tight">{{ newTemplatesCount }}</div>
            <div class="mt-1 text-xs text-slate-500">Standard with QR & Latin</div>
          </div>

          <!-- Card 3: Certified Old Format -->
          <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">{{ t('templates.stat_old') }}</span>
              <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="mt-2 text-2xl font-black text-slate-900 tracking-tight">{{ oldTemplatesCount }}</div>
            <div class="mt-1 text-xs text-slate-500">Archival Certified Records</div>
          </div>

          <!-- Card 4: Typography Stack -->
          <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">{{ t('templates.stat_fonts') }}</span>
              <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
            </div>
            <div class="mt-2 text-base font-bold text-slate-900 tracking-tight">Khmer OS Moul & Siemreap</div>
            <div class="mt-1 text-xs text-slate-500">6 Native Khmer Typefaces</div>
          </div>
        </div>

        <!-- High-End Senior Enterprise Table Card -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          
          <!-- Table Controls & Tabs Bar -->
          <div class="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <!-- Tabs -->
            <div class="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl">
              <button
                type="button"
                @click="activeFormatTab = 'all'"
                :class="[
                  'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none',
                  activeFormatTab === 'all'
                    ? 'bg-white text-[#1E3A8A] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                ]"
              >
                All Formats ({{ totalTemplatesCount }})
              </button>
              <button
                type="button"
                @click="activeFormatTab = 'new'"
                :class="[
                  'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none',
                  activeFormatTab === 'new'
                    ? 'bg-white text-[#1E3A8A] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                ]"
              >
                {{ t('templates.tabs.new') }} ({{ newTemplatesCount }})
              </button>
              <button
                type="button"
                @click="activeFormatTab = 'old'"
                :class="[
                  'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none',
                  activeFormatTab === 'old'
                    ? 'bg-white text-[#1E3A8A] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                ]"
              >
                {{ t('templates.tabs.old') }} ({{ oldTemplatesCount }})
              </button>
            </div>

            <div class="text-xs text-slate-500 font-medium">
              Showing {{ filteredTemplates.length }} templates
            </div>
          </div>

          <!-- The Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse table-fixed">
              <thead class="bg-slate-50/75 border-b border-slate-200">
                <tr>
                  <th scope="col" class="w-[30%] px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {{ t('templates.table.col_template') }}
                  </th>
                  <th scope="col" class="w-[17%] px-3 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {{ t('templates.table.col_format') }}
                  </th>
                  <th scope="col" class="w-[21%] px-3 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                    {{ t('templates.table.col_typography') }}
                  </th>
                  <th scope="col" class="w-[10%] px-2 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap text-center">
                    {{ t('templates.table.col_boxes') }}
                  </th>
                  <th scope="col" class="w-[10%] px-2 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap text-center">
                    {{ t('templates.table.col_updated') }}
                  </th>
                  <th scope="col" class="w-[12%] px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">
                    {{ t('templates.table.col_actions') }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="tpl in filteredTemplates"
                  :key="tpl.id"
                  class="border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-150 group"
                >
                  <!-- Col 1: Template Title & Description -->
                  <td class="w-[30%] px-5 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-xl bg-blue-50 text-[#1E3A8A] border border-blue-100 flex items-center justify-center shrink-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div class="min-w-0">
                        <div class="text-sm font-bold text-slate-900 group-hover:text-[#1E3A8A] transition-colors truncate">
                          {{ locale === 'km' ? (tpl.nameKm || tpl.nameEn) : (tpl.nameEn || tpl.nameKm) }}
                        </div>
                        <div class="text-xs text-slate-500 mt-0.5 truncate">
                          {{ locale === 'km' ? tpl.descriptionKm : tpl.descriptionEn }}
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- Col 2: Registry Format Badge -->
                  <td class="w-[17%] px-3 py-4 whitespace-nowrap">
                    <span :class="['px-2.5 py-1 rounded-full text-xs font-semibold border inline-flex items-center gap-1.5', getFormatBadgeClasses(tpl.format)]">
                      <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                      <span class="truncate">{{ tpl.format === 'new' ? t('templates.tabs.new') : t('templates.tabs.old') }}</span>
                    </span>
                  </td>

                  <!-- Col 3: Typography Signature -->
                  <td class="w-[21%] px-3 py-4 whitespace-nowrap text-sm text-slate-700">
                    <span class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100/70 px-2.5 py-1 rounded-lg truncate max-w-full">
                      <span>🔤</span>
                      <span class="truncate">{{ getTypographySummary(tpl) }}</span>
                    </span>
                  </td>

                  <!-- Col 4: Configured Boxes Count -->
                  <td class="w-[10%] px-2 py-4 whitespace-nowrap text-center">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-[#1E3A8A] border border-blue-200">
                      {{ tpl.boxes.length }} {{ t('templates.fields_count') }}
                    </span>
                  </td>

                  <!-- Col 5: Last Updated Date -->
                  <td class="w-[10%] px-2 py-4 whitespace-nowrap text-center text-xs text-slate-500 font-mono">
                    {{ tpl.updatedAt }}
                  </td>

                  <!-- Col 6: Action Buttons -->
                  <td class="w-[12%] px-4 py-4 whitespace-nowrap text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <!-- Open Studio Button -->
                      <button
                        type="button"
                        @click="openStudio(tpl)"
                        class="h-9 px-3 rounded-xl bg-[#1E3A8A] hover:bg-blue-950 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-xs hover:shadow-md active:scale-[0.98] cursor-pointer"
                        :title="t('templates.table.btn_open_studio')"
                      >
                        <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>{{ t('templates.table.btn_edit') }}</span>
                      </button>

                      <!-- Duplicate -->
                      <button
                        type="button"
                        @click="duplicateTemplate(tpl)"
                        class="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        :title="t('templates.duplicate')"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>

                      <!-- Delete -->
                      <button
                        type="button"
                        @click="deleteTemplate(tpl.id)"
                        class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        :title="t('templates.delete')"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

      <!-- ============================================================= -->
      <!-- VIEW 2: TEMPLATE BOX STYLING STUDIO (SPLIT 12-COL WORKSPACE)   -->
      <!-- ============================================================= -->
      <template v-else>
        
        <!-- Studio Top Bar -->
        <div class="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <button
              type="button"
              @click="closeStudio"
              class="h-10 px-3.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>ត្រឡប់ក្រោយ</span>
            </button>

            <div>
              <div class="flex items-center gap-2">
                <span :class="['px-2 py-0.5 rounded text-[11px] font-bold uppercase', getFormatBadgeClasses(editingTemplate.format)]">
                  {{ editingTemplate.format === 'new' ? t('templates.tabs.new') : t('templates.tabs.old') }}
                </span>
                <span class="text-xs text-slate-400 font-mono">{{ editingTemplate.boxes.length }} Boxes</span>
              </div>
              <h2 class="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {{ locale === 'km' ? (editingTemplate.nameKm || editingTemplate.nameEn) : (editingTemplate.nameEn || editingTemplate.nameKm) }}
              </h2>
            </div>
          </div>

          <!-- Studio Actions & Controls -->
          <div class="flex items-center flex-wrap gap-2.5">
            
            <!-- Preview Mode Toggle -->
            <div class="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                @click="previewMode = 'sample'"
                :class="[
                  'px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer',
                  previewMode === 'sample' ? 'bg-white text-[#1E3A8A] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                ]"
              >
                {{ t('templates.studio.preview_mode_real') }}
              </button>
              <button
                type="button"
                @click="previewMode = 'wireframe'"
                :class="[
                  'px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer',
                  previewMode === 'wireframe' ? 'bg-white text-[#1E3A8A] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                ]"
              >
                {{ t('templates.studio.preview_mode_wireframe') }}
              </button>
            </div>

            <!-- Zoom Controls -->
            <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                @click="zoomLevel = 75"
                :class="['px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer', zoomLevel === 75 ? 'bg-white text-[#1E3A8A] shadow-xs' : 'text-slate-600']"
              >
                75%
              </button>
              <button
                type="button"
                @click="zoomLevel = 100"
                :class="['px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer', zoomLevel === 100 ? 'bg-white text-[#1E3A8A] shadow-xs' : 'text-slate-600']"
              >
                100%
              </button>
              <button
                type="button"
                @click="zoomLevel = 125"
                :class="['px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer', zoomLevel === 125 ? 'bg-white text-[#1E3A8A] shadow-xs' : 'text-slate-600']"
              >
                125%
              </button>
            </div>

            <!-- Save Button -->
            <button
              type="button"
              @click="saveStudioChanges"
              class="h-11 min-h-[44px] px-5 flex items-center justify-center gap-2 text-sm font-medium tracking-wide transition-all duration-200 rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-sm hover:shadow-md active:scale-[0.98] cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ t('templates.save_changes') }}</span>
            </button>
          </div>
        </div>

        <!-- 12-Column Split Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- LEFT COLUMN (5 COLS): BOX STYLING INSPECTOR CONTROLS -->
          <div class="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-5">
            
            <!-- Box Selector Header -->
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                {{ t('templates.studio.field_select') }}
              </label>
              <BaseDropdownSelect
                :modelValue="activeBox ? activeBox.key : ''"
                @update:modelValue="selectBoxByKey($event)"
                :options="studioBoxOptions"
                prefixIcon="type"
                :searchable="true"
                searchPlaceholder="ស្វែងរកឈ្មោះប្រអប់វាល (Search field)..."
              />
            </div>

            <!-- Control Tabs -->
            <div class="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                @click="studioActiveTab = 'typography'"
                :class="[
                  'flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer text-center',
                  studioActiveTab === 'typography' ? 'bg-white text-[#1E3A8A] shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                ]"
              >
                {{ t('templates.studio.tab_typography') }}
              </button>
              <button
                type="button"
                @click="studioActiveTab = 'appearance'"
                :class="[
                  'flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer text-center',
                  studioActiveTab === 'appearance' ? 'bg-white text-[#1E3A8A] shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                ]"
              >
                {{ t('templates.studio.tab_appearance') }}
              </button>
              <button
                type="button"
                @click="studioActiveTab = 'presets'"
                :class="[
                  'flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer text-center',
                  studioActiveTab === 'presets' ? 'bg-white text-[#1E3A8A] shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                ]"
              >
                {{ t('templates.studio.tab_presets') }}
              </button>
            </div>

            <!-- TAB 1: TYPOGRAPHY CONTROLS -->
            <div v-if="studioActiveTab === 'typography' && activeBox" class="space-y-4">
              
              <!-- 1. Khmer Font Family Selection -->
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-2">
                  {{ t('templates.studio.font_family') }}
                </label>
                <div class="grid grid-cols-1 gap-2">
                  <button
                    v-for="font in FONT_OPTIONS"
                    :key="font.id"
                    type="button"
                    @click="setBoxFont(font.id)"
                    :class="[
                      'w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between cursor-pointer',
                      activeBox.font === font.id
                        ? 'border-[#1E3A8A] bg-blue-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                    ]"
                  >
                    <div>
                      <div :class="['text-sm font-bold', font.cssClass, activeBox.font === font.id ? 'text-[#1E3A8A]' : 'text-slate-800']">
                        {{ font.nameKm }}
                      </div>
                      <div class="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {{ locale === 'km' ? font.descKm : font.descEn }}
                      </div>
                    </div>
                    <span v-if="activeBox.font === font.id" class="w-2 h-2 rounded-full bg-[#1E3A8A] mt-1 shrink-0"></span>
                  </button>
                </div>
              </div>

              <!-- 2. Font Size Slider & Number -->
              <div class="pt-2 border-t border-slate-100">
                <div class="flex items-center justify-between mb-1.5">
                  <label class="text-xs font-semibold text-slate-600">
                    {{ t('templates.studio.font_size') }}
                  </label>
                  <span class="text-xs font-mono font-bold text-[#1E3A8A]">{{ activeBox.size || 12 }}px</span>
                </div>
                <div class="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="28"
                    step="1"
                    v-model.number="activeBox.size"
                    class="w-full accent-[#1E3A8A] cursor-pointer"
                  />
                  <input
                    type="number"
                    min="10"
                    max="32"
                    v-model.number="activeBox.size"
                    class="w-16 h-9 px-2 rounded-lg border border-slate-200 text-xs text-center font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              <!-- 3. Font Weight Buttons -->
              <div class="pt-2 border-t border-slate-100">
                <label class="block text-xs font-semibold text-slate-600 mb-2">
                  {{ t('templates.studio.font_weight') }}
                </label>
                <div class="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    @click="setBoxWeight('normal')"
                    :class="[
                      'py-2 px-1 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer',
                      activeBox.weight === 'normal' || !activeBox.weight ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    ]"
                  >
                    400 ធម្មតា
                  </button>
                  <button
                    type="button"
                    @click="setBoxWeight('medium')"
                    :class="[
                      'py-2 px-1 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer',
                      activeBox.weight === 'medium' ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    ]"
                  >
                    500 មធ្យម
                  </button>
                  <button
                    type="button"
                    @click="setBoxWeight('semibold')"
                    :class="[
                      'py-2 px-1 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer',
                      activeBox.weight === 'semibold' ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    ]"
                  >
                    600 ដិតល្មម
                  </button>
                  <button
                    type="button"
                    @click="setBoxWeight('bold')"
                    :class="[
                      'py-2 px-1 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer',
                      activeBox.weight === 'bold' ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    ]"
                  >
                    700 ដិតខ្លាំង
                  </button>
                </div>
              </div>

              <!-- 4. Text Alignment & Color -->
              <div class="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1.5">
                    {{ t('templates.studio.text_align') }}
                  </label>
                  <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      @click="setBoxAlign('left')"
                      :class="['flex-1 py-1 rounded text-xs font-medium cursor-pointer', activeBox.align === 'left' ? 'bg-white shadow-xs text-[#1E3A8A]' : 'text-slate-600']"
                      title="Left"
                    >
                      ឆ្វេង
                    </button>
                    <button
                      type="button"
                      @click="setBoxAlign('center')"
                      :class="['flex-1 py-1 rounded text-xs font-medium cursor-pointer', activeBox.align === 'center' ? 'bg-white shadow-xs text-[#1E3A8A]' : 'text-slate-600']"
                      title="Center"
                    >
                      កណ្តាល
                    </button>
                    <button
                      type="button"
                      @click="setBoxAlign('right')"
                      :class="['flex-1 py-1 rounded text-xs font-medium cursor-pointer', activeBox.align === 'right' ? 'bg-white shadow-xs text-[#1E3A8A]' : 'text-slate-600']"
                      title="Right"
                    >
                      ស្តាំ
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1.5">
                    {{ t('templates.studio.text_color') }}
                  </label>
                  <div class="flex items-center gap-1.5">
                    <button
                      v-for="c in ['#0F172A', '#1E3A8A', '#B45309', '#BE123C', '#475569']"
                      :key="c"
                      type="button"
                      @click="setBoxColor(c)"
                      :style="{ backgroundColor: c }"
                      :class="[
                        'w-7 h-7 rounded-full border-2 transition-transform cursor-pointer',
                        activeBox.color === c ? 'border-white ring-2 ring-blue-600 scale-110' : 'border-transparent hover:scale-105'
                      ]"
                    />
                  </div>
                </div>
              </div>

              <!-- Batch Action: Apply this Font to All Boxes -->
              <div class="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  @click="applyFontToAllBoxes(activeBox.font)"
                  class="w-full h-10 px-4 rounded-xl border border-blue-200 bg-blue-50/70 text-[#1E3A8A] hover:bg-blue-100 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{{ t('templates.studio.btn_apply_all') }}</span>
                </button>
              </div>
            </div>

            <!-- TAB 2: APPEARANCE (BORDER & BACKGROUND) -->
            <div v-else-if="studioActiveTab === 'appearance' && activeBox" class="space-y-4">
              
              <!-- Border Style -->
              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1.5">
                  {{ t('templates.studio.border_style') }}
                </label>
                <div class="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    @click="setBoxBorderStyle('none')"
                    :class="['py-2 px-1 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer', activeBox.borderStyle === 'none' ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]' : 'border-slate-200 text-slate-700']"
                  >
                    {{ t('templates.studio.border_none') }}
                  </button>
                  <button
                    type="button"
                    @click="setBoxBorderStyle('solid')"
                    :class="['py-2 px-1 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer', activeBox.borderStyle === 'solid' ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]' : 'border-slate-200 text-slate-700']"
                  >
                    {{ t('templates.studio.border_solid') }}
                  </button>
                  <button
                    type="button"
                    @click="setBoxBorderStyle('dashed')"
                    :class="['py-2 px-1 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer', activeBox.borderStyle === 'dashed' ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]' : 'border-slate-200 text-slate-700']"
                  >
                    {{ t('templates.studio.border_dashed') }}
                  </button>
                  <button
                    type="button"
                    @click="setBoxBorderStyle('dotted')"
                    :class="['py-2 px-1 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer', activeBox.borderStyle === 'dotted' ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]' : 'border-slate-200 text-slate-700']"
                  >
                    {{ t('templates.studio.border_dotted') }}
                  </button>
                </div>
              </div>

              <!-- Corner Radius -->
              <div class="pt-2 border-t border-slate-100">
                <label class="block text-xs font-semibold text-slate-600 mb-1.5">
                  {{ t('templates.studio.corner_radius') }}
                </label>
                <div class="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    @click="activeBox.radius = 'none'"
                    :class="['py-1.5 px-2 rounded-lg text-xs font-medium border text-center cursor-pointer', activeBox.radius === 'none' ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]' : 'border-slate-200 text-slate-700']"
                  >
                    0px
                  </button>
                  <button
                    type="button"
                    @click="activeBox.radius = 'lg'"
                    :class="['py-1.5 px-2 rounded-lg text-xs font-medium border text-center cursor-pointer', activeBox.radius === 'lg' ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]' : 'border-slate-200 text-slate-700']"
                  >
                    8px
                  </button>
                  <button
                    type="button"
                    @click="activeBox.radius = 'xl'"
                    :class="['py-1.5 px-2 rounded-lg text-xs font-medium border text-center cursor-pointer', activeBox.radius === 'xl' ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]' : 'border-slate-200 text-slate-700']"
                  >
                    12px
                  </button>
                  <button
                    type="button"
                    @click="activeBox.radius = '2xl'"
                    :class="['py-1.5 px-2 rounded-lg text-xs font-medium border text-center cursor-pointer', activeBox.radius === '2xl' ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]' : 'border-slate-200 text-slate-700']"
                  >
                    16px
                  </button>
                </div>
              </div>

              <!-- Box Background Fill -->
              <div class="pt-2 border-t border-slate-100">
                <label class="block text-xs font-semibold text-slate-600 mb-1.5">
                  {{ t('templates.studio.box_bg') }}
                </label>
                <div class="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    @click="setBoxBackground('transparent')"
                    :class="['p-2 rounded-lg text-xs font-medium border text-center cursor-pointer', activeBox.bg === 'transparent' ? 'border-[#1E3A8A] bg-blue-50 text-[#1E3A8A] font-bold' : 'border-slate-200 text-slate-700']"
                  >
                    Transparent
                  </button>
                  <button
                    type="button"
                    @click="setBoxBackground('#FFFFFF')"
                    :class="['p-2 rounded-lg text-xs font-medium border text-center cursor-pointer bg-white', activeBox.bg === '#FFFFFF' ? 'border-[#1E3A8A] ring-1 ring-[#1E3A8A] font-bold' : 'border-slate-200 text-slate-700']"
                  >
                    White
                  </button>
                  <button
                    type="button"
                    @click="setBoxBackground('#F8FAFC')"
                    :class="['p-2 rounded-lg text-xs font-medium border text-center cursor-pointer bg-slate-50', activeBox.bg === '#F8FAFC' ? 'border-[#1E3A8A] ring-1 ring-[#1E3A8A] font-bold' : 'border-slate-200 text-slate-700']"
                  >
                    Soft Slate
                  </button>
                  <button
                    type="button"
                    @click="setBoxBackground('#FFFBEB')"
                    :class="['p-2 rounded-lg text-xs font-medium border text-center cursor-pointer bg-amber-50', activeBox.bg === '#FFFBEB' ? 'border-[#1E3A8A] ring-1 ring-[#1E3A8A] font-bold' : 'border-slate-200 text-slate-700']"
                  >
                    Parchment
                  </button>
                </div>
              </div>

              <!-- Inner Padding -->
              <div class="pt-2 border-t border-slate-100">
                <label class="block text-xs font-semibold text-slate-600 mb-1.5">
                  {{ t('templates.studio.padding') }}
                </label>
                <div class="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    @click="activeBox.padding = 'none'"
                    :class="['py-1.5 px-2 rounded-lg text-xs font-medium border text-center cursor-pointer', activeBox.padding === 'none' ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]' : 'border-slate-200 text-slate-700']"
                  >
                    None
                  </button>
                  <button
                    type="button"
                    @click="activeBox.padding = 'tight'"
                    :class="['py-1.5 px-2 rounded-lg text-xs font-medium border text-center cursor-pointer', activeBox.padding === 'tight' ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]' : 'border-slate-200 text-slate-700']"
                  >
                    Compact
                  </button>
                  <button
                    type="button"
                    @click="activeBox.padding = 'normal'"
                    :class="['py-1.5 px-2 rounded-lg text-xs font-medium border text-center cursor-pointer', activeBox.padding === 'normal' ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]' : 'border-slate-200 text-slate-700']"
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    @click="activeBox.padding = 'loose'"
                    :class="['py-1.5 px-2 rounded-lg text-xs font-medium border text-center cursor-pointer', activeBox.padding === 'loose' ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]' : 'border-slate-200 text-slate-700']"
                  >
                    Roomy
                  </button>
                </div>
              </div>

              <div class="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  @click="resetActiveBox"
                  class="w-full h-10 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{{ t('templates.studio.btn_reset_box') }}</span>
                </button>
              </div>
            </div>

            <!-- TAB 3: THEME PRESETS -->
            <div v-else-if="studioActiveTab === 'presets'" class="space-y-3">
              <div class="text-xs text-slate-500 mb-2">
                ជ្រើសរើសកម្រងរចនាប័ទ្មពុម្ពអក្សរ និងកម្រាស់ស្ដង់ដារ ដើម្បីអនុវត្តដោយស្វ័យប្រវត្តិចំពោះប្រអប់ទាំងអស់នៃទម្រង់៖
              </div>

              <!-- Preset 1: Royal Official -->
              <button
                type="button"
                @click="applyPresetTheme('royal')"
                class="w-full p-4 rounded-xl border border-slate-200 hover:border-[#1E3A8A] hover:bg-blue-50/50 transition-all text-left group cursor-pointer"
              >
                <div class="text-xs font-bold text-slate-900 group-hover:text-[#1E3A8A]">
                  {{ t('templates.studio.preset_royal') }}
                </div>
                <div class="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  ចំណងជើងរដ្ឋបាលប្រើ <span class="font-bold text-slate-800">Khmer OS Moul Light</span>, ខ្លឹមសារ និងព័ត៌មានលម្អិតប្រើ <span class="font-bold text-slate-800">Khmer OS Siemreap</span>។
                </div>
              </button>

              <!-- Preset 2: Modern Digital -->
              <button
                type="button"
                @click="applyPresetTheme('modern')"
                class="w-full p-4 rounded-xl border border-slate-200 hover:border-[#1E3A8A] hover:bg-blue-50/50 transition-all text-left group cursor-pointer"
              >
                <div class="text-xs font-bold text-slate-900 group-hover:text-[#1E3A8A]">
                  {{ t('templates.studio.preset_modern') }}
                </div>
                <div class="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  ចំណងជើងរដ្ឋបាលប្រើ <span class="font-bold text-slate-800">Khmer OS Moul Light</span>, ទិន្នន័យស្ដង់ដារប្រើ <span class="font-bold text-slate-800">Khmer OS Battambang</span>។
                </div>
              </button>

              <!-- Preset 3: Archive -->
              <button
                type="button"
                @click="applyPresetTheme('archive')"
                class="w-full p-4 rounded-xl border border-slate-200 hover:border-[#1E3A8A] hover:bg-blue-50/50 transition-all text-left group cursor-pointer"
              >
                <div class="text-xs font-bold text-slate-900 group-hover:text-[#1E3A8A]">
                  {{ t('templates.studio.preset_archive') }}
                </div>
                <div class="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  ទម្រង់សេចក្តីចម្លងបញ្ជាក់បែបបុរាណ ប្រើប្រាស់ពុម្ពអក្សរមានជើង <span class="font-bold text-slate-800">Noto Serif Khmer</span>។
                </div>
              </button>
            </div>
          </div>

          <!-- RIGHT COLUMN (7 COLS): INTERACTIVE LIVE A4 DOCUMENT CANVAS -->
          <div class="lg:col-span-7 flex flex-col items-center justify-center">
            
            <div class="w-full flex items-center justify-between text-xs font-medium text-slate-500 mb-2 px-2">
              <span>{{ t('templates.studio.sample_banner') }}</span>
              <span>Click on any box below to inspect and style it</span>
            </div>

            <!-- A4 Document Page Canvas -->
            <div
              ref="canvasRef"
              :style="{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }"
              class="w-full max-w-[620px] aspect-[1/1.414] bg-white border border-slate-200/90 shadow-xl rounded-2xl relative select-none p-6 sm:p-8 transition-transform duration-150 overflow-hidden"
            >
              
              <!-- Subtle Background Security Watermark Guilloche -->
              <div class="absolute inset-4 rounded-xl border border-slate-100 pointer-events-none flex items-center justify-center opacity-40">
                <div class="w-48 h-48 rounded-full border border-slate-200 flex items-center justify-center">
                  <div class="w-36 h-36 rounded-full border border-slate-100"></div>
                </div>
              </div>

              <!-- Top Emblem Graphic Container -->
              <div class="text-center mb-2 pointer-events-none">
                <div class="w-10 h-10 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold text-lg mb-1 shadow-xs">
                  🇰🇭
                </div>
              </div>

              <!-- Live Rendered Template Boxes Overlay -->
              <div
                v-for="box in editingTemplate.boxes"
                :key="box.id"
                @click="selectBox(box.id)"
                :style="{
                  left: `${box.x}%`,
                  top: `${box.y}%`,
                  width: `${box.width}%`,
                  height: `${box.height}%`,
                  fontSize: `${box.size || 12}px`,
                  fontWeight: box.weight === 'bold' ? 700 : (box.weight === 'semibold' ? 600 : (box.weight === 'medium' ? 500 : 400)),
                  color: box.color || '#0F172A',
                  textAlign: box.align || 'left',
                  backgroundColor: box.bg === 'transparent' ? 'transparent' : box.bg,
                  opacity: (box.opacity || 100) / 100,
                  borderStyle: box.borderStyle || 'none',
                  borderWidth: `${box.borderWidth || 0}px`,
                  borderColor: box.borderColor || '#CBD5E1',
                }"
                :class="[
                  'absolute transition-all cursor-pointer flex flex-col justify-center leading-tight',
                  getFontCssClass(box.font),
                  box.radius === '2xl' ? 'rounded-2xl' : (box.radius === 'xl' ? 'rounded-xl' : (box.radius === 'lg' ? 'rounded-lg' : 'rounded-none')),
                  box.padding === 'loose' ? 'p-3' : (box.padding === 'normal' ? 'p-2' : (box.padding === 'tight' ? 'px-1.5 py-0.5' : 'p-0')),
                  selectedBoxId === box.id
                    ? 'ring-2 ring-[#1E3A8A] ring-offset-1 z-20 shadow-md'
                    : 'hover:ring-1 hover:ring-blue-400 z-10'
                ]"
              >
                <!-- Wireframe Mode Label -->
                <template v-if="previewMode === 'wireframe'">
                  <div class="text-[10px] font-mono tracking-tight text-blue-900 bg-blue-100/80 px-1 py-0.5 rounded truncate">
                    {{ box.key }}
                  </div>
                </template>

                <!-- Real Extracted Data Mode -->
                <template v-else>
                  <div class="whitespace-pre-line truncate max-w-full">
                    {{ SAMPLE_DOCUMENT_VALUES[box.key] || getFieldLabel(box.key) }}
                  </div>
                </template>

                <!-- Active Indicator Corner Handle -->
                <div v-if="selectedBoxId === box.id" class="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-[#1E3A8A] border-2 border-white rounded-full shadow-xs"></div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- FORMAT CHOICE MODAL (OLD VS NEW) -->
      <transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="showFormatModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-md w-full p-6 space-y-5">
            <div>
              <h3 class="text-lg font-bold text-slate-900">{{ t('templates.format_modal.title') }}</h3>
              <p class="text-xs text-slate-500 mt-1">{{ t('templates.format_modal.subtitle') }}</p>
            </div>

            <div class="space-y-3">
              <!-- Choice 1: New Format -->
              <button
                type="button"
                @click="createTemplateConfirmed('new')"
                class="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-[#1E3A8A] hover:bg-blue-50/50 transition-all cursor-pointer group"
              >
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-900">New Standard</span>
                  <div class="text-sm font-bold text-slate-900 group-hover:text-[#1E3A8A]">{{ t('templates.tabs.new') }}</div>
                </div>
                <div class="text-xs text-slate-500 leading-snug">{{ t('templates.format_modal.new_desc') }}</div>
              </button>

              <!-- Choice 2: Old Certified Format -->
              <button
                type="button"
                @click="createTemplateConfirmed('old')"
                class="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-amber-600 hover:bg-amber-50/50 transition-all cursor-pointer group"
              >
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-900">Certified Copy</span>
                  <div class="text-sm font-bold text-slate-900 group-hover:text-amber-800">{{ t('templates.tabs.old') }}</div>
                </div>
                <div class="text-xs text-slate-500 leading-snug">{{ t('templates.format_modal.old_desc') }}</div>
              </button>
            </div>

            <div class="flex justify-end pt-2">
              <button
                type="button"
                @click="showFormatModal = false"
                class="h-10 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                {{ t('common.cancel') }}
              </button>
            </div>
          </div>
        </div>
      </transition>

    </div>
  </main>
</template>
