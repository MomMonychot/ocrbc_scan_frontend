<!-- ==========================================================================
  Municipal Verification & OCR Audit Dashboard
  Architectural Standard: Vue 3 Composition API (<script setup>)
  Design: Subtle Border Philosophy, Pure Logical Grids & Lucide Icon Ecosystem
========================================================================== -->
<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ScanLine,
  RefreshCw,
  Download,
  Calendar,
  Search,
  ArrowUpRight,
  ChevronRight,
  Clock,
  Sparkles,
  ChevronLeft,
} from 'lucide-vue-next'

const { t } = useI18n()

// Emits for external controller integration
const emit = defineEmits([
  'inspect-record',
  'refresh-telemetry',
  'export-audit-log',
  'resolve-discrepancy',
])

// Filter and interaction state
const activeTab = ref('all')
const searchQuery = ref('')
const selectedTimeframe = ref('today')
const isRefreshing = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(5)

// KPI Telemetry Data
const kpiMetrics = computed(() => [
  {
    id: 'ingested',
    title: t('dashboard.kpi.total_ingested'),
    value: '14,289',
    change: '+12.4%',
    period: t('dashboard.kpi.vs_yesterday'),
    trend: 'up',
    icon: FileText,
    accentColor: 'text-blue-600 bg-blue-50 border-blue-200/60',
  },
  {
    id: 'confidence',
    title: t('dashboard.kpi.accuracy_rate'),
    value: '98.6%',
    change: '+0.8%',
    period: t('dashboard.kpi.model_audit'),
    trend: 'up',
    icon: Sparkles,
    accentColor: 'text-emerald-600 bg-emerald-50 border-emerald-200/60',
  },
  {
    id: 'flagged',
    title: t('dashboard.kpi.pending_review'),
    value: '23',
    change: '-5',
    period: t('dashboard.kpi.discrepancy_queue'),
    trend: 'down',
    icon: AlertCircle,
    accentColor: 'text-amber-600 bg-amber-50 border-amber-200/60',
  },
  {
    id: 'latency',
    title: t('dashboard.kpi.zdr_latency'),
    value: '38 ms',
    change: 'Zero Retention',
    period: t('dashboard.kpi.zero_retention'),
    trend: 'neutral',
    icon: ShieldCheck,
    accentColor: 'text-teal-600 bg-teal-50 border-teal-200/60',
  },
])

// Real-time batch records
const batchRecords = ref([
  {
    id: 'BC-2024-009821',
    nationalId: '1204009821',
    citizenName: 'សុខ ចាន់ដារា (SOK CHANDARA)',
    templateType: 'standard',
    confidence: 99.4,
    statusType: 'success',
    timestamp: '2 mins ago',
    hash: 'e3b0c442...b855',
  },
  {
    id: 'BC-2024-009822',
    nationalId: '1204009822',
    citizenName: 'ចាន់ ស្រីមុំ (CHAN SREYMOM)',
    templateType: 'certified',
    confidence: 98.7,
    statusType: 'success',
    timestamp: '5 mins ago',
    hash: '8f434346...7aa4',
  },
  {
    id: 'BC-2024-009823',
    nationalId: '1204009823',
    citizenName: 'កែវ វិបុល (KEO VIBOL)',
    templateType: 'certified',
    confidence: 84.2,
    statusType: 'warning',
    timestamp: '12 mins ago',
    hash: '4b227777...bf8a',
  },
  {
    id: 'BC-2024-009824',
    nationalId: '1204009824',
    citizenName: 'រ័ត្ន ធីតា (ROTH THIDA)',
    templateType: 'standard',
    confidence: 99.1,
    statusType: 'success',
    timestamp: '18 mins ago',
    hash: 'ef2d127d...e39d',
  },
  {
    id: 'BC-2024-009825',
    nationalId: '1204009825',
    citizenName: 'អ៊ុំ សុភាព (OUM SOPHEAP)',
    templateType: 'standard',
    confidence: 61.5,
    statusType: 'danger',
    timestamp: '25 mins ago',
    hash: 'ca978112...48bb',
  },
  {
    id: 'BC-2024-009826',
    nationalId: '1204009826',
    citizenName: 'ម៉ៅ វណ្ណា (MAO VANNA)',
    templateType: 'certified',
    confidence: 97.9,
    statusType: 'success',
    timestamp: '32 mins ago',
    hash: '3a18e45b...91f0',
  },
])

// Real-time discrepancy alert queue
const activeDiscrepancies = computed(() => [
  {
    id: 'DISC-4091',
    recordId: 'BC-2024-009825',
    issue: t('dashboard.discrepancy.issue_stamp'),
    field: t('dashboard.field_accuracy.stamp'),
    severity: 'high',
    time: '25m ago',
  },
  {
    id: 'DISC-4089',
    recordId: 'BC-2024-009823',
    issue: t('dashboard.discrepancy.issue_book'),
    field: t('dashboard.field_accuracy.certificate_no'),
    severity: 'medium',
    time: '45m ago',
  },
  {
    id: 'DISC-4084',
    recordId: 'BC-2024-009798',
    issue: t('dashboard.discrepancy.issue_skew'),
    field: 'Perspective Warp',
    severity: 'low',
    time: '1h 10m ago',
  },
])

// Optical field recognition accuracy benchmarks
const fieldAccuracies = computed(() => [
  { name: t('dashboard.field_accuracy.khmer_name'), rate: 99.8 },
  { name: t('dashboard.field_accuracy.latin_name'), rate: 99.2 },
  { name: t('dashboard.field_accuracy.certificate_no'), rate: 98.9 },
  { name: t('dashboard.field_accuracy.dob'), rate: 99.4 },
  { name: t('dashboard.field_accuracy.stamp'), rate: 97.1 },
])

// Computed records with filtering & search
const filteredRecords = computed(() => {
  return batchRecords.value.filter((record) => {
    const matchesTab =
      activeTab.value === 'all' ||
      (activeTab.value === 'standard' && record.templateType === 'standard') ||
      (activeTab.value === 'certified' && record.templateType === 'certified') ||
      (activeTab.value === 'review' && record.statusType !== 'success')

    const q = searchQuery.value.trim().toLowerCase()
    const matchesSearch =
      q === '' ||
      record.id.toLowerCase().includes(q) ||
      record.nationalId.includes(q) ||
      record.citizenName.toLowerCase().includes(q)

    return matchesTab && matchesSearch
  })
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredRecords.value.length / itemsPerPage.value))
})

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredRecords.value.slice(start, start + itemsPerPage.value)
})

function handleRefresh() {
  isRefreshing.value = true
  emit('refresh-telemetry')
  setTimeout(() => {
    isRefreshing.value = false
  }, 750)
}
</script>

<template>
  <div class="min-h-screen bg-slate-50/60 font-sans text-slate-900 antialiased p-4 sm:p-6 lg:p-8 space-y-6">
    
    <!-- =======================================================================
      SECTION 1: STRUCTURAL APP HEADER & TELEMETRY TOOLBAR
    ======================================================================= -->
    <header class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-200/80">
      <div class="space-y-1">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs shrink-0">
            <ScanLine class="w-5 h-5" :stroke-width="2" />
          </div>
          <div>
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {{ t('dashboard.title') }}
            </h1>
          </div>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
          {{ t('dashboard.subtitle') }}
        </p>
      </div>

      <!-- Action & Timeframe Controls -->
      <div class="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
        <div class="inline-flex items-center bg-white border border-slate-200/80 rounded-xl p-1 shadow-xs">
          <button
            type="button"
            @click="selectedTimeframe = 'today'"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:scale-[0.98]',
              selectedTimeframe === 'today'
                ? 'bg-slate-100 text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            ]"
          >
            {{ t('dashboard.timeframe.today') }}
          </button>
          <button
            type="button"
            @click="selectedTimeframe = 'week'"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:scale-[0.98]',
              selectedTimeframe === 'week'
                ? 'bg-slate-100 text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            ]"
          >
            {{ t('dashboard.timeframe.week') }}
          </button>
          <button
            type="button"
            @click="selectedTimeframe = 'month'"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:scale-[0.98]',
              selectedTimeframe === 'month'
                ? 'bg-slate-100 text-slate-900 font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            ]"
          >
            {{ t('dashboard.timeframe.month') }}
          </button>
        </div>

        <button
          type="button"
          @click="handleRefresh"
          :disabled="isRefreshing"
          class="h-11 min-h-[44px] px-4 rounded-xl bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs transition-all duration-200 ease-in-out active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 outline-none inline-flex items-center gap-2 text-xs font-medium cursor-pointer"
        >
          <RefreshCw class="w-4 h-4 text-slate-500" :class="{ 'animate-spin': isRefreshing }" :stroke-width="2" />
          <span class="hidden sm:inline">{{ t('dashboard.btn_refresh') }}</span>
        </button>

        <button
          type="button"
          @click="emit('export-audit-log')"
          class="h-11 min-h-[44px] px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all duration-200 ease-in-out hover:shadow-md active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 outline-none inline-flex items-center gap-2 text-xs font-medium cursor-pointer"
        >
          <Download class="w-4 h-4" :stroke-width="2" />
          <span>{{ t('dashboard.btn_export_log') }}</span>
        </button>
      </div>
    </header>

    <!-- =======================================================================
      SECTION 2: SYSTEMATIC 4-COLUMN KPI CARDS GRID (SUBTLE BORDER PHILOSOPHY)
    ======================================================================= -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <div
        v-for="kpi in kpiMetrics"
        :key="kpi.id"
        class="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs transition-all duration-200 ease-in-out hover:shadow-md hover:border-slate-300 flex flex-col justify-between space-y-4"
      >
        <div class="flex items-start justify-between">
          <div class="space-y-1">
            <span class="text-xs font-medium text-slate-500 tracking-wider uppercase">
              {{ kpi.title }}
            </span>
            <div class="text-2xl font-bold tracking-tight text-slate-900">
              {{ kpi.value }}
            </div>
          </div>
          <div :class="['w-10 h-10 rounded-xl border flex items-center justify-center shrink-0', kpi.accentColor]">
            <component :is="kpi.icon" class="w-5 h-5" :stroke-width="2" />
          </div>
        </div>

        <div class="flex items-center gap-2 text-xs pt-2 border-t border-slate-100">
          <span
            :class="[
              'font-semibold inline-flex items-center gap-0.5',
              kpi.trend === 'up' ? 'text-emerald-700' : kpi.trend === 'down' ? 'text-blue-700' : 'text-slate-700'
            ]"
          >
            {{ kpi.change }}
          </span>
          <span class="text-slate-400">•</span>
          <span class="text-slate-500">{{ kpi.period }}</span>
        </div>
      </div>
    </div>

    <!-- =======================================================================
      SECTION 3: MAIN DUAL-COLUMN SYSTEMATIC WORKSPACE (12-COL GRID)
    ======================================================================= -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      <!-- LEFT PRIMARY REGION: INGESTION PIPELINE & LIVE AUDIT TABLE (8 COLS) -->
      <div class="lg:col-span-8 space-y-6">
        
        <!-- Table Card Surface -->
        <div class="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          
          <!-- Table Controls Header -->
          <div class="p-4 sm:p-5 border-b border-slate-200/80 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
            
            <!-- Filter Tabs -->
            <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                @click="activeTab = 'all'"
                :class="[
                  'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap cursor-pointer',
                  activeTab === 'all'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                ]"
              >
                {{ t('dashboard.tabs.all') }}
              </button>
              <button
                type="button"
                @click="activeTab = 'standard'"
                :class="[
                  'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap cursor-pointer',
                  activeTab === 'standard'
                    ? 'bg-blue-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                ]"
              >
                {{ t('dashboard.tabs.standard') }}
              </button>
              <button
                type="button"
                @click="activeTab = 'certified'"
                :class="[
                  'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap cursor-pointer',
                  activeTab === 'certified'
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                ]"
              >
                {{ t('dashboard.tabs.certified') }}
              </button>
              <button
                type="button"
                @click="activeTab = 'review'"
                :class="[
                  'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap cursor-pointer',
                  activeTab === 'review'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                ]"
              >
                {{ t('dashboard.tabs.flagged') }}
              </button>
            </div>

            <!-- Search Input with Lucide Search Icon -->
            <div class="relative w-full sm:w-64">
              <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" :stroke-width="2" />
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="t('dashboard.search_placeholder')"
                class="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50/60 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          <!-- Structured Responsive Data Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50/60 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th scope="col" class="py-3 px-4">{{ t('dashboard.table.col_doc_ref') }}</th>
                  <th scope="col" class="py-3 px-4">{{ t('dashboard.table.col_citizen') }}</th>
                  <th scope="col" class="py-3 px-4">{{ t('dashboard.table.col_template') }}</th>
                  <th scope="col" class="py-3 px-4">{{ t('dashboard.table.col_confidence') }}</th>
                  <th scope="col" class="py-3 px-4">{{ t('dashboard.table.col_status') }}</th>
                  <th scope="col" class="py-3 px-4 text-right">{{ t('dashboard.table.col_actions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-xs text-slate-700">
                <tr
                  v-for="record in paginatedRecords"
                  :key="record.id"
                  class="hover:bg-slate-50/70 transition-colors duration-150 group"
                >
                  <!-- Document ID & Timestamp -->
                  <td class="py-3.5 px-4 whitespace-nowrap">
                    <div class="font-mono font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                      {{ record.id }}
                    </div>
                    <div class="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock class="w-3 h-3 text-slate-400 shrink-0" :stroke-width="2" />
                      {{ record.timestamp }}
                    </div>
                  </td>

                  <!-- Citizen Name -->
                  <td class="py-3.5 px-4 whitespace-nowrap">
                    <div class="font-medium text-slate-900">
                      {{ record.citizenName }}
                    </div>
                    <div class="text-[11px] font-mono text-slate-500">
                      ID: {{ record.nationalId }}
                    </div>
                  </td>

                  <!-- Format Badge -->
                  <td class="py-3.5 px-4 whitespace-nowrap">
                    <span
                      :class="[
                        'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border',
                        record.templateType === 'standard'
                          ? 'bg-blue-50 text-blue-700 border-blue-200/70'
                          : 'bg-teal-50 text-teal-700 border-teal-200/70'
                      ]"
                    >
                      {{ record.templateType === 'standard' ? t('dashboard.tabs.standard') : t('dashboard.tabs.certified') }}
                    </span>
                  </td>

                  <!-- OCR Confidence Level -->
                  <td class="py-3.5 px-4 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <div class="w-14 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          class="h-full rounded-full"
                          :class="[
                            record.confidence >= 95 ? 'bg-emerald-600' : record.confidence >= 80 ? 'bg-amber-600' : 'bg-rose-600'
                          ]"
                          :style="{ width: `${record.confidence}%` }"
                        ></div>
                      </div>
                      <span class="font-mono text-[11px] font-semibold text-slate-800">
                        {{ record.confidence }}%
                      </span>
                    </div>
                  </td>

                  <!-- Status -->
                  <td class="py-3.5 px-4 whitespace-nowrap">
                    <span
                      v-if="record.statusType === 'success'"
                      class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                    >
                      <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 shrink-0" :stroke-width="2" />
                      {{ t('audit_table.status_verified_label') }}
                    </span>
                    <span
                      v-else-if="record.statusType === 'warning'"
                      class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/70"
                    >
                      <AlertCircle class="w-3.5 h-3.5 text-amber-600 shrink-0" :stroke-width="2" />
                      {{ t('audit_table.status_review_label') }}
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200/70"
                    >
                      <AlertCircle class="w-3.5 h-3.5 text-rose-600 shrink-0" :stroke-width="2" />
                      {{ t('audit_table.status_rejected_label') }}
                    </span>
                  </td>

                  <!-- Action Button -->
                  <td class="py-3.5 px-4 whitespace-nowrap text-right">
                    <button
                      type="button"
                      @click="emit('inspect-record', record)"
                      class="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:text-blue-900 hover:bg-slate-50 text-xs font-medium shadow-2xs transition-all duration-150 active:scale-[0.98] inline-flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 outline-none"
                    >
                      <span>{{ t('dashboard.table.btn_inspect') }}</span>
                      <ChevronRight class="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" :stroke-width="2" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination Bar -->
          <div class="p-4 bg-slate-50/50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
            <div>
              {{ t('dashboard.table.showing_records', {
                from: (currentPage - 1) * itemsPerPage + 1,
                to: Math.min(currentPage * itemsPerPage, filteredRecords.length),
                total: filteredRecords.length
              }) }}
            </div>
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                :disabled="currentPage <= 1"
                @click="currentPage--"
                class="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-all"
              >
                {{ t('dashboard.table.btn_prev') }}
              </button>
              <span class="px-2 font-mono text-slate-600">{{ currentPage }} / {{ totalPages }}</span>
              <button
                type="button"
                :disabled="currentPage >= totalPages"
                @click="currentPage++"
                class="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-all"
              >
                {{ t('dashboard.table.btn_next') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Optical Field Accuracy Progress Metrics -->
        <div class="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-900 tracking-tight">
              {{ t('dashboard.field_accuracy.title') }}
            </h3>
            <span class="text-xs text-slate-500 font-medium">{{ t('dashboard.field_accuracy.baseline') }}</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="field in fieldAccuracies"
              :key="field.name"
              class="space-y-1.5"
            >
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-600 font-medium">{{ field.name }}</span>
                <span class="font-mono font-bold text-slate-900">{{ field.rate }}%</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  class="bg-blue-900 h-full rounded-full transition-all duration-500"
                  :style="{ width: `${field.rate}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- RIGHT REGION: DISCREPANCY RESOLUTION & SYSTEM INTEGRITY (4 COLS) -->
      <div class="lg:col-span-4 space-y-6">
        
        <!-- Pending Discrepancy Queue -->
        <div class="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <AlertCircle class="w-4 h-4 text-amber-600" :stroke-width="2" />
              <h3 class="text-sm font-bold text-slate-900">
                {{ t('dashboard.discrepancy.title') }}
              </h3>
            </div>
            <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
              {{ t('dashboard.discrepancy.active_badge', { count: 3 }) }}
            </span>
          </div>

          <div class="space-y-3">
            <div
              v-for="item in activeDiscrepancies"
              :key="item.id"
              class="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/50 space-y-2.5 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50"
            >
              <div class="flex items-center justify-between">
                <span class="font-mono text-xs font-bold text-slate-900">{{ item.recordId }}</span>
                <span class="text-[10px] text-slate-400 font-medium">{{ item.time }}</span>
              </div>
              <p class="text-xs text-slate-700 leading-snug">
                {{ item.issue }}
              </p>
              <div class="flex items-center justify-between pt-1">
                <span class="text-[11px] text-slate-500 font-medium">{{ item.field }}</span>
                <button
                  type="button"
                  @click="emit('resolve-discrepancy', item)"
                  class="text-xs font-semibold text-blue-900 hover:text-blue-950 inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>{{ t('dashboard.discrepancy.btn_resolve') }}</span>
                  <ArrowUpRight class="w-3.5 h-3.5" :stroke-width="2" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Ephemeral ZDR RAM Security Health -->
        <div class="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div class="flex items-center gap-2">
            <ShieldCheck class="w-4 h-4 text-teal-600" :stroke-width="2" />
            <h3 class="text-sm font-bold text-slate-900">
              {{ t('dashboard.zdr_health.title') }}
            </h3>
          </div>

          <div class="space-y-2.5 text-xs">
            <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span class="text-slate-600">{{ t('dashboard.zdr_health.buffer_status') }}</span>
              <span class="font-semibold text-emerald-700 inline-flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                {{ t('dashboard.zdr_health.buffer_clean') }}
              </span>
            </div>

            <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span class="text-slate-600">{{ t('dashboard.zdr_health.sha_trail') }}</span>
              <span class="font-semibold text-slate-900 font-mono">{{ t('dashboard.zdr_health.sha_sealed') }}</span>
            </div>

            <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span class="text-slate-600">{{ t('dashboard.zdr_health.gateway_ping') }}</span>
              <span class="font-semibold text-slate-900 font-mono">24 ms</span>
            </div>
          </div>
        </div>

      </div>

    </div>

  </div>
</template>
