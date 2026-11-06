<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { submitGeoReport } from '../services/api_client'
import { authStore } from '../services/authStore'
import BaseDropdownSelect from './BaseDropdownSelect.vue'

const props = defineProps({
  division: {
    type: Object,
    required: true,
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'submitted'])
const { t } = useI18n()

const issueType = ref('spelling')
const suggestedNameKm = ref('')
const suggestedNameEn = ref('')
const notes = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')
const isSuccess = ref(false)

const issueTypeOptions = computed(() => [
  { value: 'spelling', label: t('reports.types.spelling') },
  { value: 'incorrect_name', label: t('reports.types.incorrect_name') },
  { value: 'wrong_hierarchy', label: t('reports.types.wrong_hierarchy') },
  { value: 'other', label: t('reports.types.other') },
])

async function handleSubmit() {
  if (!suggestedNameKm.value.trim() && !notes.value.trim()) {
    errorMessage.value = 'សូមបញ្ចូលឈ្មោះដែលត្រឹមត្រូវ ឬបញ្ជាក់កំណត់សម្គាល់បន្ថែម។'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const payload = {
      division_code: props.division.code,
      division_level: props.division.level || 'village',
      current_name_km: props.division.name_km,
      current_name_en: props.division.name_en,
      issue_type: issueType.value,
      suggested_name_km: suggestedNameKm.value.trim() || null,
      suggested_name_en: suggestedNameEn.value.trim() || null,
      notes: notes.value.trim() || null,
      reported_by: authStore.user?.username || 'user',
    }

    await submitGeoReport(payload)
    isSuccess.value = true

    // Refresh reports if admin is watching
    if (authStore.isAdmin) {
      await authStore.refreshReports()
    }

    setTimeout(() => {
      emit('submitted', payload)
      emit('close')
      resetForm()
    }, 1500)
  } catch (err) {
    errorMessage.value = err.message || 'បរាជ័យក្នុងការបញ្ជូនរបាយការណ៍។'
  } finally {
    isSubmitting.value = false
  }
}

function resetForm() {
  issueType.value = 'spelling'
  suggestedNameKm.value = ''
  suggestedNameEn.value = ''
  notes.value = ''
  errorMessage.value = ''
  isSuccess.value = false
}

function handleClose() {
  resetForm()
  emit('close')
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 transition-all"
    @click.self="handleClose"
  >
    <div
      class="bg-white border border-slate-200/90 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
      role="dialog"
      aria-modal="true"
    >
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900 leading-tight">
              {{ t('reports.modal_title') }}
            </h3>
            <p class="text-xs text-slate-500 font-normal">
              {{ t('reports.modal_subtitle') }}
            </p>
          </div>
        </div>
        <button
          type="button"
          @click="handleClose"
          class="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-all active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Success State Banner -->
      <div v-if="isSuccess" class="p-8 text-center space-y-3">
        <div class="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h4 class="text-base font-bold text-slate-900">
          {{ t('reports.success_msg') }}
        </h4>
        <p class="text-xs text-slate-500">
          អរគុណសម្រាប់ការចូលរួមកែលម្អទិន្នន័យរដ្ឋបាលជាតិ!
        </p>
      </div>

      <!-- Main Form Body -->
      <form v-else @submit.prevent="handleSubmit" class="p-6 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
        <!-- Target Division Context Card -->
        <div class="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {{ t('reports.target_division') }}
            </span>
            <span class="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white border border-slate-200 text-slate-600">
              NIS: {{ division.code }}
            </span>
          </div>

          <div class="flex items-baseline gap-2">
            <span class="text-base font-black text-slate-900">{{ division.name_km }}</span>
            <span class="text-xs text-slate-500 font-medium">({{ division.name_en }})</span>
          </div>

          <div v-if="division.parent_hierarchy_km || division.parent_name_km" class="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1 border-t border-slate-200/60">
            <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="truncate">{{ division.parent_hierarchy_km || division.parent_name_km }}</span>
          </div>
        </div>

        <!-- Error Alert if failed -->
        <div v-if="errorMessage" class="rounded-xl p-3 bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
          <svg class="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Issue Type Dropdown -->
        <div class="space-y-1.5">
          <label class="block font-semibold text-slate-700">
            {{ t('reports.issue_type') }} <span class="text-rose-500">*</span>
          </label>
          <BaseDropdownSelect
            v-model="issueType"
            :options="issueTypeOptions"
            placeholder="ជ្រើសរើសប្រភេទបញ្ហា"
            width="w-full"
          />
        </div>

        <!-- Suggested Correct Khmer Name -->
        <div class="space-y-1.5">
          <label class="block font-semibold text-slate-700">
            {{ t('reports.suggested_km') }} <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="suggestedNameKm"
            type="text"
            required
            :placeholder="t('reports.suggested_km_placeholder')"
            class="w-full h-11 min-h-[44px] px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
        </div>

        <!-- Suggested Latin Name (Optional) -->
        <div class="space-y-1.5">
          <label class="block font-semibold text-slate-700">
            {{ t('reports.suggested_en') }}
          </label>
          <input
            v-model="suggestedNameEn"
            type="text"
            :placeholder="t('reports.suggested_en_placeholder')"
            class="w-full h-11 min-h-[44px] px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
        </div>

        <!-- Reason / Reference Notes -->
        <div class="space-y-1.5">
          <label class="block font-semibold text-slate-700">
            {{ t('reports.notes') }}
          </label>
          <textarea
            v-model="notes"
            rows="3"
            :placeholder="t('reports.notes_placeholder')"
            class="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
          ></textarea>
        </div>

        <!-- Action Buttons -->
        <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="handleClose"
            class="h-11 min-h-[44px] px-5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-medium tracking-wide active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400 transition-all cursor-pointer"
          >
            {{ t('reports.cancel_btn') }}
          </button>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="h-11 min-h-[44px] px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium tracking-wide shadow-sm hover:shadow-md active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <svg v-if="isSubmitting" class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ isSubmitting ? t('reports.submitting') : t('reports.submit_btn') }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
