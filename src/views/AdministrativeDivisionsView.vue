<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseDropdownSelect from '../components/BaseDropdownSelect.vue'
import {
  getGeoHierarchy,
  getGeoProvinces,
  getGeoDistricts,
  getGeoCommunes,
  getGeoEntities,
  createGeoEntity,
  updateGeoEntity,
  deleteGeoEntity,
} from '../services/api_client'

const { t, locale } = useI18n()

// Summary statistics
const hierarchyStats = ref({
  total_provinces: 25,
  total_districts: 132,
  total_communes: 527,
  total_villages: 432,
})

// Cascading Filter Selection State
const selectedProvince = ref('') // e.g. '14' (Prey Veng)
const selectedDistrict = ref('') // e.g. '1401' (Ba Phnum)
const selectedCommune = ref('')  // e.g. '140101' (Boeng Preah)

// Options Lists for Cascader
const provinceList = ref([])
const districtList = ref([])
const communeList = ref([])

// Dropdown options formatted for BaseDropdownSelect
const provinceDropdownOptions = computed(() => [
  { value: '', label: t('divisions.filter_all_provinces'), sublabel: '25 Provinces / Capitals' },
  ...provinceList.value.map(p => ({
    value: p.code,
    label: p.name_km,
    sublabel: p.name_en,
    badge: p.code
  }))
])

const districtDropdownOptions = computed(() => [
  { value: '', label: selectedProvince.value ? t('divisions.filter_all_districts') : '(Select Province First)', sublabel: '' },
  ...districtList.value.map(d => ({
    value: d.code,
    label: d.name_km,
    sublabel: d.name_en,
    badge: d.code
  }))
])

const communeDropdownOptions = computed(() => [
  { value: '', label: selectedDistrict.value ? t('divisions.filter_all_communes') : '(Select District First)', sublabel: '' },
  ...communeList.value.map(c => ({
    value: c.code,
    label: c.name_km,
    sublabel: c.name_en,
    badge: c.code
  }))
])

const levelOptions = computed(() => [
  { value: 'province', label: t('divisions.tabs.province'), sublabel: 'Level 1' },
  { value: 'district', label: t('divisions.tabs.district'), sublabel: 'Level 2' },
  { value: 'commune', label: t('divisions.tabs.commune'), sublabel: 'Level 3' },
  { value: 'village', label: t('divisions.tabs.village'), sublabel: 'Level 4' }
])

// Active Tier Tab ('all' | 'province' | 'district' | 'commune' | 'village')
const activeLevel = ref('all')

// Search & Sorting
const searchQuery = ref('')
const sortBy = ref('code')
const sortOrder = ref('asc')

// Pagination
const currentPage = ref(1)
const pageSize = ref(15)
const totalItems = ref(0)
const totalPages = ref(1)
const entities = ref([])
const isLoading = ref(false)

// Modals
const isEditModalOpen = ref(false)
const isCreateModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isSubmitting = ref(false)

const currentEditingEntity = ref(null)
const currentDeletingEntity = ref(null)

const editForm = ref({
  level: '',
  code: '',
  name_km: '',
  name_en: '',
  type: '',
})

const createForm = ref({
  level: 'village',
  code: '',
  name_km: '',
  name_en: '',
  type: 'Village',
  parent_code: '',
})

// Feedback notifications
const notification = ref(null)

function showNotification(text, type = 'success') {
  notification.value = { text, type }
  setTimeout(() => {
    notification.value = null
  }, 4000)
}

// Breadcrumb entity names computed
const activeProvinceObj = computed(() => {
  if (!selectedProvince.value) return null
  return provinceList.value.find((p) => p.code === selectedProvince.value) || null
})

const activeDistrictObj = computed(() => {
  if (!selectedDistrict.value) return null
  return districtList.value.find((d) => d.code === selectedDistrict.value) || null
})

const activeCommuneObj = computed(() => {
  if (!selectedCommune.value) return null
  return communeList.value.find((c) => c.code === selectedCommune.value) || null
})

// Fetch initial metadata
async function loadHierarchyStats() {
  try {
    const data = await getGeoHierarchy()
    if (data) {
      hierarchyStats.value = data
    }
  } catch (err) {
    console.error('Failed to load hierarchy stats:', err)
  }
}

async function loadProvinces() {
  try {
    const data = await getGeoProvinces()
    provinceList.value = data || []
  } catch (err) {
    console.error('Failed to load provinces:', err)
  }
}

// Fetch districts when province changes
async function onProvinceSelect(provCode, autoSwitchTab = true) {
  selectedProvince.value = provCode || ''
  selectedDistrict.value = ''
  selectedCommune.value = ''
  districtList.value = []
  communeList.value = []

  if (selectedProvince.value) {
    try {
      const districts = await getGeoDistricts(selectedProvince.value)
      districtList.value = districts || []
      if (autoSwitchTab) {
        activeLevel.value = 'district'
      }
    } catch (err) {
      console.error('Failed to load districts for province:', err)
    }
  } else {
    if (activeLevel.value === 'district' || activeLevel.value === 'commune' || activeLevel.value === 'village') {
      activeLevel.value = 'province'
    }
  }

  currentPage.value = 1
  loadEntities()
}

// Fetch communes when district changes
async function onDistrictSelect(distCode, autoSwitchTab = true) {
  selectedDistrict.value = distCode || ''
  selectedCommune.value = ''
  communeList.value = []

  if (selectedDistrict.value) {
    try {
      const communes = await getGeoCommunes(selectedDistrict.value)
      communeList.value = communes || []
      if (autoSwitchTab) {
        activeLevel.value = 'commune'
      }
    } catch (err) {
      console.error('Failed to load communes for district:', err)
    }
  } else {
    if (autoSwitchTab && selectedProvince.value) {
      activeLevel.value = 'district'
    }
  }

  currentPage.value = 1
  loadEntities()
}

// Select commune
function onCommuneSelect(commCode, autoSwitchTab = true) {
  selectedCommune.value = commCode || ''
  if (selectedCommune.value) {
    if (autoSwitchTab) {
      activeLevel.value = 'village'
    }
  } else {
    if (autoSwitchTab && selectedDistrict.value) {
      activeLevel.value = 'commune'
    }
  }
  currentPage.value = 1
  loadEntities()
}

// Reset all cascading filters
function resetCascadingFilters() {
  selectedProvince.value = ''
  selectedDistrict.value = ''
  selectedCommune.value = ''
  districtList.value = []
  communeList.value = []
  searchQuery.value = ''
  activeLevel.value = 'all'
  currentPage.value = 1
  loadEntities()
}

// Load paginated entities with hierarchical parameters
async function loadEntities() {
  isLoading.value = true
  try {
    const params = {
      level: activeLevel.value,
      page: currentPage.value,
      page_size: pageSize.value,
      sort_by: sortBy.value,
      sort_order: sortOrder.value,
    }

    if (searchQuery.value.trim()) {
      params.search = searchQuery.value.trim()
    }

    // Apply cascading hierarchy codes
    if (selectedCommune.value) {
      params.commune_code = selectedCommune.value
    } else if (selectedDistrict.value) {
      params.district_code = selectedDistrict.value
    } else if (selectedProvince.value) {
      params.province_code = selectedProvince.value
    }

    const res = await getGeoEntities(params)
    entities.value = res.items || []
    totalItems.value = res.total || 0
    currentPage.value = res.page || 1
    totalPages.value = res.total_pages || 1
  } catch (err) {
    console.error('Failed to load entities:', err)
    showNotification(t('divisions.messages.error_generic'), 'error')
  } finally {
    isLoading.value = false
  }
}

// Drill-Down into children from row click
function handleDrillDown(item) {
  if (item.level === 'province') {
    onProvinceSelect(item.code, true)
  } else if (item.level === 'district') {
    if (item.province_code && (!selectedProvince.value || selectedProvince.value !== item.province_code)) {
      selectedProvince.value = item.province_code
      getGeoDistricts(item.province_code).then((d) => {
        districtList.value = d || []
      })
    }
    onDistrictSelect(item.code, true)
  } else if (item.level === 'commune') {
    if (item.province_code && (!selectedProvince.value || selectedProvince.value !== item.province_code)) {
      selectedProvince.value = item.province_code
      getGeoDistricts(item.province_code).then((d) => {
        districtList.value = d || []
      })
    }
    if (item.district_code && (!selectedDistrict.value || selectedDistrict.value !== item.district_code)) {
      selectedDistrict.value = item.district_code
      getGeoCommunes(item.district_code).then((c) => {
        communeList.value = c || []
      })
    }
    onCommuneSelect(item.code, true)
  }
}

// Tab selection
function selectLevelTab(lvl) {
  activeLevel.value = lvl
  currentPage.value = 1
  loadEntities()
}

// Sort handler
function handleSort(column) {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'asc'
  }
  currentPage.value = 1
  loadEntities()
}

// Search debounce
let searchDebounceTimeout = null
function onSearchInput() {
  clearTimeout(searchDebounceTimeout)
  searchDebounceTimeout = setTimeout(() => {
    currentPage.value = 1
    loadEntities()
  }, 300)
}

function clearSearch() {
  searchQuery.value = ''
  currentPage.value = 1
  loadEntities()
}

function onPageSizeChange() {
  currentPage.value = 1
  loadEntities()
}

function goToPage(p) {
  if (p >= 1 && p <= totalPages.value) {
    currentPage.value = p
    loadEntities()
  }
}

// Edit Modal
function openEditModal(item) {
  currentEditingEntity.value = item
  editForm.value = {
    level: item.level || 'province',
    code: item.code,
    name_km: item.name_km,
    name_en: item.name_en,
    type: item.type || '',
  }
  isEditModalOpen.value = true
}

function closeEditModal() {
  isEditModalOpen.value = false
  currentEditingEntity.value = null
}

async function handleUpdateSubmit() {
  if (!editForm.value.name_km.trim() || !editForm.value.name_en.trim()) return

  isSubmitting.value = true
  try {
    await updateGeoEntity(editForm.value.level, editForm.value.code, {
      name_km: editForm.value.name_km.trim(),
      name_en: editForm.value.name_en.trim(),
      type: editForm.value.type ? editForm.value.type.trim() : null,
    })
    showNotification(t('divisions.messages.updated_success'), 'success')
    closeEditModal()
    loadEntities()
    loadHierarchyStats()
  } catch (err) {
    console.error('Update entity error:', err)
    showNotification(err.message || t('divisions.messages.error_generic'), 'error')
  } finally {
    isSubmitting.value = false
  }
}

// Create Modal
function openCreateModal() {
  let defaultParent = ''
  if (selectedCommune.value) {
    defaultParent = selectedCommune.value
  } else if (selectedDistrict.value) {
    defaultParent = selectedDistrict.value
  } else if (selectedProvince.value) {
    defaultParent = selectedProvince.value
  }

  createForm.value = {
    level: activeLevel.value === 'all' ? 'village' : activeLevel.value,
    code: '',
    name_km: '',
    name_en: '',
    type: '',
    parent_code: defaultParent,
  }
  isCreateModalOpen.value = true
}

function closeCreateModal() {
  isCreateModalOpen.value = false
}

async function handleCreateSubmit() {
  if (!createForm.value.code.trim() || !createForm.value.name_km.trim() || !createForm.value.name_en.trim()) return

  isSubmitting.value = true
  try {
    await createGeoEntity({
      level: createForm.value.level,
      code: createForm.value.code.trim(),
      name_km: createForm.value.name_km.trim(),
      name_en: createForm.value.name_en.trim(),
      type: createForm.value.type ? createForm.value.type.trim() : null,
      parent_code: createForm.value.parent_code ? createForm.value.parent_code.trim() : null,
    })
    showNotification(t('divisions.messages.created_success'), 'success')
    closeCreateModal()
    loadEntities()
    loadHierarchyStats()
  } catch (err) {
    console.error('Create entity error:', err)
    showNotification(err.message || t('divisions.messages.error_generic'), 'error')
  } finally {
    isSubmitting.value = false
  }
}

// Delete Modal
function openDeleteModal(item) {
  currentDeletingEntity.value = item
  isDeleteModalOpen.value = true
}

function closeDeleteModal() {
  isDeleteModalOpen.value = false
  currentDeletingEntity.value = null
}

async function handleDeleteSubmit() {
  if (!currentDeletingEntity.value) return

  isSubmitting.value = true
  try {
    await deleteGeoEntity(currentDeletingEntity.value.level, currentDeletingEntity.value.code)
    showNotification(t('divisions.messages.deleted_success'), 'success')
    closeDeleteModal()
    loadEntities()
    loadHierarchyStats()
  } catch (err) {
    console.error('Delete entity error:', err)
    showNotification(err.message || t('divisions.messages.error_generic'), 'error')
  } finally {
    isSubmitting.value = false
  }
}

// Helper: Badge formatting
function getLevelBadgeClass(level) {
  switch (level) {
    case 'province':
      return 'bg-blue-50 text-blue-900 border-blue-200'
    case 'district':
      return 'bg-indigo-50 text-indigo-900 border-indigo-200'
    case 'commune':
      return 'bg-teal-50 text-teal-800 border-teal-200'
    case 'village':
      return 'bg-slate-100 text-slate-800 border-slate-300'
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200'
  }
}

function getLevelDisplayName(level) {
  switch (level) {
    case 'province':
      return locale.value === 'km' ? 'រាជធានី-ខេត្ត' : 'Province'
    case 'district':
      return locale.value === 'km' ? 'ក្រុង-ស្រុក-ខណ្ឌ' : 'District'
    case 'commune':
      return locale.value === 'km' ? 'ឃុំ-សង្កាត់' : 'Commune'
    case 'village':
      return locale.value === 'km' ? 'ភូមិ' : 'Village'
    default:
      return level
  }
}

onMounted(() => {
  loadHierarchyStats()
  loadProvinces()
  loadEntities()
})
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

      <!-- Page Header with Top Title -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#1E3A8A] border border-blue-200">
              NIS Official Gazetteer 2026
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            {{ t('divisions.title') }}
          </h1>
          <p class="text-xs sm:text-sm text-[#475569] mt-1">
            {{ t('divisions.subtitle') }}
          </p>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          <button
            type="button"
            @click="loadEntities"
            class="h-10 px-4 rounded-xl bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 transition-all font-medium text-xs sm:text-sm flex items-center gap-2 shadow-xs cursor-pointer select-none"
          >
            <svg :class="['w-4 h-4', isLoading ? 'animate-spin text-[#1E3A8A]' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{{ t('divisions.btn_refresh') }}</span>
          </button>

          <button
            type="button"
            @click="openCreateModal"
            class="h-10 px-5 rounded-xl bg-[#1E3A8A] hover:bg-blue-950 text-white transition-all font-medium text-xs sm:text-sm flex items-center gap-2 shadow-sm cursor-pointer select-none active:scale-[0.99]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>{{ t('divisions.btn_add') }}</span>
          </button>
        </div>
      </div>

      <!-- Quick-Stat Metric Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 1. Provinces Card -->
        <div
          @click="selectLevelTab('province')"
          class="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-[#1E3A8A] hover:shadow-sm transition-all cursor-pointer"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">{{ t('divisions.stat_provinces') }}</span>
            <div class="w-8 h-8 rounded-lg bg-blue-50 text-[#1E3A8A] flex items-center justify-center font-bold text-xs">
              25
            </div>
          </div>
          <div class="mt-2 text-2xl font-black text-slate-900 tracking-tight">
            {{ hierarchyStats.total_provinces }}
          </div>
        </div>

        <!-- 2. Districts Card -->
        <div
          @click="selectLevelTab('district')"
          class="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-indigo-600 hover:shadow-sm transition-all cursor-pointer"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">{{ t('divisions.stat_districts') }}</span>
            <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <div class="mt-2 text-2xl font-black text-slate-900 tracking-tight">
            {{ hierarchyStats.total_districts }}
          </div>
        </div>

        <!-- 3. Communes Card -->
        <div
          @click="selectLevelTab('commune')"
          class="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-teal-600 hover:shadow-sm transition-all cursor-pointer"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">{{ t('divisions.stat_communes') }}</span>
            <div class="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div class="mt-2 text-2xl font-black text-slate-900 tracking-tight">
            {{ hierarchyStats.total_communes }}
          </div>
        </div>

        <!-- 4. Villages Card -->
        <div
          @click="selectLevelTab('village')"
          class="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-emerald-600 hover:shadow-sm transition-all cursor-pointer"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">{{ t('divisions.stat_villages') }}</span>
            <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
          </div>
          <div class="mt-2 text-2xl font-black text-slate-900 tracking-tight">
            {{ hierarchyStats.total_villages }}
          </div>
        </div>
      </div>

      <!-- ============================================================= -->
      <!-- HIERARCHICAL DRILL-DOWN CASCADING FILTER CONTROLS              -->
      <!-- ============================================================= -->
      <div class="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        
        <!-- Interactive Hierarchical Breadcrumb Trail -->
        <div class="flex items-center justify-between flex-wrap gap-2 text-xs font-medium pb-3 border-b border-slate-100">
          <div class="flex items-center gap-1.5 flex-wrap">
            <!-- Root Level: Cambodia -->
            <button
              type="button"
              @click="resetCascadingFilters"
              :class="[
                'px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer',
                !selectedProvince ? 'bg-blue-50 text-[#1E3A8A] font-bold' : 'text-slate-600 hover:bg-slate-100'
              ]"
            >
              <span>🇰🇭</span>
              <span>{{ t('divisions.breadcrumb_all') }}</span>
            </button>

            <!-- Province Level -->
            <template v-if="activeProvinceObj">
              <span class="text-slate-400">/</span>
              <button
                type="button"
                @click="onDistrictSelect('')"
                :class="[
                  'px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer',
                  selectedProvince && !selectedDistrict ? 'bg-blue-50 text-[#1E3A8A] font-bold' : 'text-slate-600 hover:bg-slate-100'
                ]"
              >
                <span>📍</span>
                <span>{{ activeProvinceObj.name_km }}</span>
                <span class="text-[10px] text-slate-400">({{ districtList.length }} ស្រុក)</span>
              </button>
            </template>

            <!-- District Level -->
            <template v-if="activeDistrictObj">
              <span class="text-slate-400">/</span>
              <button
                type="button"
                @click="onCommuneSelect('')"
                :class="[
                  'px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer',
                  selectedDistrict && !selectedCommune ? 'bg-indigo-50 text-indigo-900 font-bold' : 'text-slate-600 hover:bg-slate-100'
                ]"
              >
                <span>🏢</span>
                <span>{{ activeDistrictObj.name_km }}</span>
                <span class="text-[10px] text-slate-400">({{ communeList.length }} ឃុំ)</span>
              </button>
            </template>

            <!-- Commune Level -->
            <template v-if="activeCommuneObj">
              <span class="text-slate-400">/</span>
              <div class="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-900 font-bold flex items-center gap-1.5">
                <span>🌾</span>
                <span>{{ activeCommuneObj.name_km }}</span>
              </div>
            </template>
          </div>

          <!-- Reset Filter Button -->
          <button
            v-if="selectedProvince || selectedDistrict || selectedCommune || searchQuery"
            type="button"
            @click="resetCascadingFilters"
            class="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{{ t('divisions.btn_reset_filters') }}</span>
          </button>
        </div>

        <!-- 3-Step Cascading Dropdown Selectors -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <!-- 1. Province Selector -->
          <div>
            <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {{ t('divisions.filter_province') }} (25)
            </label>
            <BaseDropdownSelect
              :modelValue="selectedProvince"
              @update:modelValue="onProvinceSelect($event)"
              :options="provinceDropdownOptions"
              :placeholder="t('divisions.filter_all_provinces')"
              prefixIcon="map-pin"
              :searchable="true"
              size="compact"
              :clearable="true"
              searchPlaceholder="ស្វែងរកខេត្ត/រាជធានី (Search province)..."
            />
          </div>

          <!-- 2. District Selector (Enabled when Province Selected) -->
          <div>
            <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {{ t('divisions.filter_district') }}
            </label>
            <BaseDropdownSelect
              :modelValue="selectedDistrict"
              @update:modelValue="onDistrictSelect($event)"
              :options="districtDropdownOptions"
              :disabled="!selectedProvince"
              :placeholder="selectedProvince ? t('divisions.filter_all_districts') : '(Select Province First)'"
              prefixIcon="building"
              :searchable="true"
              size="compact"
              :clearable="true"
              searchPlaceholder="ស្វែងរកស្រុក/ខណ្ឌ (Search district)..."
            />
          </div>

          <!-- 3. Commune Selector (Enabled when District Selected) -->
          <div>
            <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {{ t('divisions.filter_commune') }}
            </label>
            <BaseDropdownSelect
              :modelValue="selectedCommune"
              @update:modelValue="onCommuneSelect($event)"
              :options="communeDropdownOptions"
              :disabled="!selectedDistrict"
              :placeholder="selectedDistrict ? t('divisions.filter_all_communes') : '(Select District First)'"
              prefixIcon="home"
              :searchable="true"
              size="compact"
              :clearable="true"
              searchPlaceholder="ស្វែងរកឃុំ/សង្កាត់ (Search commune)..."
            />
          </div>
        </div>
      </div>

      <!-- Main Data Table Container -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        <!-- Tier Navigation Tabs (Retained as requested) -->
        <div class="px-6 pt-5 pb-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl overflow-x-auto">
            <button
              type="button"
              @click="selectLevelTab('all')"
              :class="[
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none whitespace-nowrap',
                activeLevel === 'all'
                  ? 'bg-white text-[#1E3A8A] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              ]"
            >
              {{ t('divisions.tabs.all') }}
            </button>
            <button
              type="button"
              @click="selectLevelTab('province')"
              :class="[
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none whitespace-nowrap',
                activeLevel === 'province'
                  ? 'bg-white text-[#1E3A8A] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              ]"
            >
              {{ t('divisions.tabs.province') }}
            </button>
            <button
              type="button"
              @click="selectLevelTab('district')"
              :class="[
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none whitespace-nowrap',
                activeLevel === 'district'
                  ? 'bg-white text-[#1E3A8A] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              ]"
            >
              {{ t('divisions.tabs.district') }}
            </button>
            <button
              type="button"
              @click="selectLevelTab('commune')"
              :class="[
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none whitespace-nowrap',
                activeLevel === 'commune'
                  ? 'bg-white text-[#1E3A8A] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              ]"
            >
              {{ t('divisions.tabs.commune') }}
            </button>
            <button
              type="button"
              @click="selectLevelTab('village')"
              :class="[
                'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none whitespace-nowrap',
                activeLevel === 'village'
                  ? 'bg-white text-[#1E3A8A] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              ]"
            >
              {{ t('divisions.tabs.village') }}
            </button>
          </div>

          <!-- Total Count Indicator -->
          <div class="text-xs font-medium text-slate-500">
            <span>{{ t('divisions.pagination.showing', { start: totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1, end: Math.min(currentPage * pageSize, totalItems), total: totalItems }) }}</span>
          </div>
        </div>

        <!-- Search Bar & Rows Selector -->
        <div class="p-6 bg-slate-50/50 border-b border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
          <!-- Search Input with Clear Button -->
          <div class="relative w-full md:w-96">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              v-model="searchQuery"
              @input="onSearchInput"
              :placeholder="t('divisions.search_placeholder')"
              class="w-full h-10 pl-10 pr-9 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all shadow-xs"
            />
            <button
              v-if="searchQuery"
              type="button"
              @click="clearSearch"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Rows per page -->
          <div class="flex items-center gap-2.5">
            <span class="text-xs text-slate-500 font-medium">{{ t('divisions.pagination.rows_per_page') }}:</span>
            <div class="w-24">
              <BaseDropdownSelect
                v-model="pageSize"
                @change="onPageSizeChange"
                :options="[
                  { value: 10, label: '10' },
                  { value: 15, label: '15' },
                  { value: 25, label: '25' },
                  { value: 50, label: '50' }
                ]"
                size="compact"
              />
            </div>
          </div>
        </div>

        <!-- Table View -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm text-slate-700">
            <thead class="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th
                  @click="handleSort('code')"
                  class="py-3.5 px-6 cursor-pointer hover:text-slate-900 select-none"
                >
                  <div class="flex items-center gap-1.5">
                    <span>{{ t('divisions.table.col_code') }}</span>
                    <svg
                      :class="['w-3.5 h-3.5 transition-transform', sortBy === 'code' && sortOrder === 'desc' ? 'rotate-180 text-[#1E3A8A]' : sortBy === 'code' ? 'text-[#1E3A8A]' : 'text-slate-300']"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  </div>
                </th>

                <th
                  @click="handleSort('name_km')"
                  class="py-3.5 px-6 cursor-pointer hover:text-slate-900 select-none"
                >
                  <div class="flex items-center gap-1.5">
                    <span>{{ t('divisions.table.col_name_km') }}</span>
                    <svg
                      :class="['w-3.5 h-3.5 transition-transform', sortBy === 'name_km' && sortOrder === 'desc' ? 'rotate-180 text-[#1E3A8A]' : sortBy === 'name_km' ? 'text-[#1E3A8A]' : 'text-slate-300']"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  </div>
                </th>

                <th
                  @click="handleSort('name_en')"
                  class="py-3.5 px-6 cursor-pointer hover:text-slate-900 select-none"
                >
                  <div class="flex items-center gap-1.5">
                    <span>{{ t('divisions.table.col_name_en') }}</span>
                    <svg
                      :class="['w-3.5 h-3.5 transition-transform', sortBy === 'name_en' && sortOrder === 'desc' ? 'rotate-180 text-[#1E3A8A]' : sortBy === 'name_en' ? 'text-[#1E3A8A]' : 'text-slate-300']"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  </div>
                </th>

                <th class="py-3.5 px-6">{{ t('divisions.table.col_level') }}</th>
                <th class="py-3.5 px-6">{{ t('divisions.table.col_type') }}</th>
                <th class="py-3.5 px-6">{{ t('divisions.table.col_parent') }}</th>
                <th class="py-3.5 px-6 text-right">{{ t('divisions.table.col_actions') }}</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-100 font-normal">
              <template v-if="isLoading">
                <tr v-for="n in 6" :key="n" class="animate-pulse">
                  <td class="py-4 px-6"><div class="h-4 bg-slate-200 rounded w-16"></div></td>
                  <td class="py-4 px-6"><div class="h-4 bg-slate-200 rounded w-28"></div></td>
                  <td class="py-4 px-6"><div class="h-4 bg-slate-200 rounded w-32"></div></td>
                  <td class="py-4 px-6"><div class="h-4 bg-slate-200 rounded w-20"></div></td>
                  <td class="py-4 px-6"><div class="h-4 bg-slate-200 rounded w-16"></div></td>
                  <td class="py-4 px-6"><div class="h-4 bg-slate-200 rounded w-36"></div></td>
                  <td class="py-4 px-6 text-right"><div class="h-4 bg-slate-200 rounded w-12 ml-auto"></div></td>
                </tr>
              </template>

              <template v-else-if="entities.length === 0">
                <tr>
                  <td colspan="7" class="py-12 text-center text-slate-500">
                    <div class="flex flex-col items-center justify-center space-y-2">
                      <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p class="text-sm font-semibold text-slate-800">{{ t('divisions.table.empty_title') }}</p>
                      <p class="text-xs text-slate-500">{{ t('divisions.table.empty_desc') }}</p>
                    </div>
                  </td>
                </tr>
              </template>

              <tr
                v-else
                v-for="item in entities"
                :key="item.code"
                class="hover:bg-slate-50/80 transition-colors group"
              >
                <!-- NIS Code -->
                <td class="py-4 px-6 font-mono font-semibold text-slate-900">
                  {{ item.code }}
                </td>

                <!-- Khmer Name with Drill-Down Action Link -->
                <td class="py-4 px-6">
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-slate-900 text-sm">{{ item.name_km }}</span>
                    <!-- Drill Down Link if Province/District/Commune -->
                    <button
                      v-if="item.level !== 'village'"
                      type="button"
                      @click.stop="handleDrillDown(item)"
                      class="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1E3A8A] hover:underline bg-blue-50/70 hover:bg-blue-100/70 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                      :title="item.level === 'province' ? t('divisions.view_children_districts') : item.level === 'district' ? t('divisions.view_children_communes') : t('divisions.view_children_villages')"
                    >
                      <span>{{ item.level === 'province' ? t('divisions.view_children_districts') : item.level === 'district' ? t('divisions.view_children_communes') : t('divisions.view_children_villages') }}</span>
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </td>

                <!-- Latin Name -->
                <td class="py-4 px-6 text-slate-700">
                  {{ item.name_en }}
                </td>

                <!-- Level Badge -->
                <td class="py-4 px-6">
                  <span
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border',
                      getLevelBadgeClass(item.level)
                    ]"
                  >
                    {{ getLevelDisplayName(item.level) }}
                  </span>
                </td>

                <!-- Classification Type -->
                <td class="py-4 px-6 text-slate-600 text-xs">
                  {{ item.type || '-' }}
                </td>

                <!-- Parent Jurisdiction -->
                <td class="py-4 px-6 text-slate-500 text-xs max-w-xs truncate" :title="item.parent_name_km">
                  {{ item.parent_name_km || '-' }}
                </td>

                <!-- Actions -->
                <td class="py-4 px-6 text-right whitespace-nowrap">
                  <div class="inline-flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
                    <button
                      type="button"
                      @click="openEditModal(item)"
                      class="p-1.5 rounded-lg text-slate-500 hover:text-[#1E3A8A] hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Edit Division"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      @click="openDeleteModal(item)"
                      class="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Division"
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

        <!-- Pagination Controls -->
        <div class="p-4 sm:px-6 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            {{ t('divisions.pagination.page', { page: currentPage, pages: totalPages }) }}
          </div>

          <div class="flex items-center gap-1.5">
            <button
              type="button"
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage <= 1"
              class="h-8 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer font-medium"
            >
              {{ t('divisions.pagination.prev') }}
            </button>

            <!-- Page Buttons (Windowed) -->
            <button
              v-for="p in Math.min(5, totalPages)"
              :key="p"
              type="button"
              @click="goToPage(p)"
              :class="[
                'w-8 h-8 rounded-lg font-medium transition-all cursor-pointer text-xs',
                currentPage === p
                  ? 'bg-[#1E3A8A] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              ]"
            >
              {{ p }}
            </button>

            <button
              type="button"
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage >= totalPages"
              class="h-8 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer font-medium"
            >
              {{ t('divisions.pagination.next') }}
            </button>
          </div>
        </div>

      </div>

      <!-- ============================================================= -->
      <!-- MODAL 1: EDIT ADMINISTRATIVE DIVISION                         -->
      <!-- ============================================================= -->
      <div
        v-if="isEditModalOpen"
        class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
      >
        <div class="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-lg font-bold text-slate-900 tracking-tight">
              {{ t('divisions.modal_edit_title') }}
            </h3>
            <button
              type="button"
              @click="closeEditModal"
              class="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="handleUpdateSubmit" class="space-y-4">
            <!-- Code (Read-Only) -->
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">
                {{ t('divisions.form.code') }}
              </label>
              <input
                type="text"
                v-model="editForm.code"
                disabled
                class="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-mono text-sm cursor-not-allowed"
              />
            </div>

            <!-- Khmer Name -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                {{ t('divisions.form.name_km') }} *
              </label>
              <input
                type="text"
                v-model="editForm.name_km"
                required
                class="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>

            <!-- Latin Name -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                {{ t('divisions.form.name_en') }} *
              </label>
              <input
                type="text"
                v-model="editForm.name_en"
                required
                class="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>

            <!-- Classification Type -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                {{ t('divisions.form.type') }}
              </label>
              <input
                type="text"
                v-model="editForm.type"
                class="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                placeholder="Province, Khan, Sangkat, etc."
              />
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                @click="closeEditModal"
                class="h-10 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs sm:text-sm cursor-pointer"
              >
                {{ t('divisions.form.btn_cancel') }}
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="h-10 px-5 rounded-xl bg-[#1E3A8A] hover:bg-blue-950 text-white font-medium text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                <span v-if="isSubmitting">Saving...</span>
                <span v-else>{{ t('divisions.form.btn_save') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ============================================================= -->
      <!-- MODAL 2: CREATE NEW ADMINISTRATIVE DIVISION                   -->
      <!-- ============================================================= -->
      <div
        v-if="isCreateModalOpen"
        class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
      >
        <div class="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-lg font-bold text-slate-900 tracking-tight">
              {{ t('divisions.modal_add_title') }}
            </h3>
            <button
              type="button"
              @click="closeCreateModal"
              class="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="handleCreateSubmit" class="space-y-4">
            <!-- Level Selector -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                {{ t('divisions.form.level') }} *
              </label>
              <BaseDropdownSelect
                v-model="createForm.level"
                :options="levelOptions"
                prefixIcon="layers"
                placeholder="ជ្រើសរើសថ្នាក់រដ្ឋបាល..."
              />
            </div>

            <!-- Parent Code (if not province) -->
            <div v-if="createForm.level !== 'province'">
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                {{ t('divisions.form.parent') }} *
              </label>
              <input
                type="text"
                v-model="createForm.parent_code"
                required
                class="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                :placeholder="t('divisions.form.parent_hint')"
              />
            </div>

            <!-- Code -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                {{ t('divisions.form.code') }} *
              </label>
              <input
                type="text"
                v-model="createForm.code"
                required
                class="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                placeholder="e.g. 14010103"
              />
            </div>

            <!-- Khmer Name -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                {{ t('divisions.form.name_km') }} *
              </label>
              <input
                type="text"
                v-model="createForm.name_km"
                required
                class="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                placeholder="ឈ្មោះជាភាសាខ្មែរ"
              />
            </div>

            <!-- Latin Name -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                {{ t('divisions.form.name_en') }} *
              </label>
              <input
                type="text"
                v-model="createForm.name_en"
                required
                class="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                placeholder="Official Latin transliteration"
              />
            </div>

            <!-- Type -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">
                {{ t('divisions.form.type') }}
              </label>
              <input
                type="text"
                v-model="createForm.type"
                class="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                placeholder="Province, Capital, Krong, Khan, Sangkat, etc."
              />
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                @click="closeCreateModal"
                class="h-10 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs sm:text-sm cursor-pointer"
              >
                {{ t('divisions.form.btn_cancel') }}
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="h-10 px-5 rounded-xl bg-[#1E3A8A] hover:bg-blue-950 text-white font-medium text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                <span v-if="isSubmitting">Creating...</span>
                <span v-else>{{ t('divisions.form.btn_create') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ============================================================= -->
      <!-- MODAL 3: DELETE CONFIRMATION MODAL                            -->
      <!-- ============================================================= -->
      <div
        v-if="isDeleteModalOpen"
        class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
      >
        <div class="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
          <div class="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <div class="space-y-1">
            <h3 class="text-lg font-bold text-slate-900 tracking-tight">
              {{ t('divisions.modal_delete_title') }}
            </h3>
            <p class="text-xs text-slate-600 leading-relaxed">
              {{ t('divisions.modal_delete_desc') }}
            </p>
          </div>

          <div v-if="currentDeletingEntity" class="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1">
            <div class="font-bold text-slate-800">{{ currentDeletingEntity.name_km }} ({{ currentDeletingEntity.name_en }})</div>
            <div class="font-mono text-slate-500">Code: {{ currentDeletingEntity.code }} | Level: {{ currentDeletingEntity.level }}</div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              @click="closeDeleteModal"
              class="h-10 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs sm:text-sm cursor-pointer"
            >
              {{ t('divisions.form.btn_cancel') }}
            </button>
            <button
              type="button"
              @click="handleDeleteSubmit"
              :disabled="isSubmitting"
              class="h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <span v-if="isSubmitting">Deleting...</span>
              <span v-else>{{ t('divisions.form.btn_delete') }}</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  </main>
</template>
