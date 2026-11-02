<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { inspectDocument as apiInspectDocument } from '../services/api_client'

const emit = defineEmits(['inspected', 'proceed', 'fileSelected'])

const { t } = useI18n()

const isDragging = ref(false)
const selectedFile = ref(null)
const previewUrl = ref(null)
const isInspecting = ref(false)
const inspectResult = ref(null)
const uploadError = ref(null)
const fileInputRef = ref(null)

function onDragOver(e) {
  e.preventDefault()
  isDragging.value = true
}

function onDragLeave(e) {
  e.preventDefault()
  isDragging.value = false
}

function onDrop(e) {
  e.preventDefault()
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    handleFile(files[0])
  }
}

function onFileChange(e) {
  const files = e.target.files
  if (files && files.length > 0) {
    handleFile(files[0])
  }
}

function triggerFileSelect() {
  fileInputRef.value?.click()
}

async function handleFile(file) {
  // Validate file types
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  if (!validTypes.includes(file.type) && !file.name.match(/\.(jpe?g|png|webp|pdf)$/i)) {
    uploadError.value = 'Please select a valid PNG, JPEG, WebP, or PDF document.'
    return
  }

  // Validate size boundary (15 MB)
  if (file.size > 15 * 1024 * 1024) {
    uploadError.value = 'File exceeds the maximum 15 MB limit.'
    return
  }

  selectedFile.value = file
  uploadError.value = null
  inspectResult.value = null

  // Generate ephemeral in-memory preview URL
  if (file.type.startsWith('image/')) {
    previewUrl.value = URL.createObjectURL(file)
  } else {
    previewUrl.value = null
  }

  emit('fileSelected', { file, previewUrl: previewUrl.value })
  await inspectDocument(file)
}

async function inspectDocument(file) {
  isInspecting.value = true
  uploadError.value = null

  try {
    const data = await apiInspectDocument(file)
    inspectResult.value = data
    emit('inspected', data)
  } catch (err) {
    uploadError.value = err.message || 'An unexpected error occurred while communicating with the quality gate.'
  } finally {
    isInspecting.value = false
  }
}

function handleProceed() {
  if (inspectResult.value?.is_accepted) {
    emit('proceed', {
      file: selectedFile.value,
      inspectResult: inspectResult.value,
      previewUrl: previewUrl.value,
    })
  }
}

function resetUpload() {
  selectedFile.value = null
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
  inspectResult.value = null
  uploadError.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-gov-border shadow-gov-md p-6 sm:p-8 max-w-3xl mx-auto">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center gap-2 mb-2">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-gov-primary border border-blue-200">
          <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          {{ t('upload.title') }}
        </span>
      </div>
      <h2 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
        {{ t('upload.subtitle') }}
      </h2>
    </div>

    <!-- Hidden native file input -->
    <input
      ref="fileInputRef"
      type="file"
      class="hidden"
      accept="image/png,image/jpeg,image/webp,application/pdf"
      @change="onFileChange"
    />

    <!-- Drag & Drop Zone (when no file selected or resetting) -->
    <div
      v-if="!selectedFile"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
      @click="triggerFileSelect"
      :class="[
        'border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200',
        isDragging
          ? 'border-gov-primary bg-blue-50/70 scale-[1.01]'
          : 'border-slate-300 hover:border-gov-primary hover:bg-slate-50/80 bg-slate-50/40'
      ]"
    >
      <div class="mx-auto w-16 h-16 rounded-2xl bg-blue-50 text-gov-primary flex items-center justify-center mb-4 shadow-sm">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>

      <p class="text-base font-semibold text-slate-800 mb-1">
        {{ t('upload.dropzone_title') }}
      </p>
      <p class="text-xs text-slate-500 max-w-sm mx-auto mb-4">
        {{ t('upload.dropzone_hint') }}
      </p>

      <button
        type="button"
        class="h-9 px-4 rounded-xl bg-gov-primary text-white text-xs font-semibold hover:bg-gov-primary-hover shadow-sm transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap select-none"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {{ t('upload.browse_file') }}
      </button>
    </div>

    <!-- Active File State & Quality Gate Telemetry -->
    <div v-else class="space-y-6">
      <!-- File Metadata Strip -->
      <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
        <div class="flex items-center gap-3 truncate">
          <div class="w-10 h-10 rounded-lg bg-blue-100 text-gov-primary flex items-center justify-center shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div class="truncate">
            <div class="text-sm font-bold text-slate-800 truncate">{{ selectedFile.name }}</div>
            <div class="text-xs text-slate-500">
              {{ (selectedFile.size / 1024).toFixed(1) }} KB • Ephemeral Memory Buffer (RAM)
            </div>
          </div>
        </div>

        <button
          @click="resetUpload"
          class="h-8 px-3 rounded-lg text-xs text-slate-500 hover:text-red-600 hover:bg-white border border-transparent hover:border-slate-200 transition-colors inline-flex items-center justify-center whitespace-nowrap"
        >
          {{ t('upload.reupload_cta') }}
        </button>
      </div>

      <!-- Loading Spinner during inspection -->
      <div v-if="isInspecting" class="p-8 text-center bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
        <div class="inline-block w-8 h-8 border-3 border-gov-primary border-t-transparent rounded-full animate-spin"></div>
        <p class="text-sm font-medium text-gov-primary">
          {{ t('upload.processing') }}
        </p>
      </div>

      <!-- Quality Gate Rejection Alert (< 40%) -->
      <div
        v-else-if="inspectResult && !inspectResult.is_accepted"
        class="p-5 rounded-2xl bg-red-50 border border-red-200 space-y-3"
      >
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0 mt-0.5">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div class="space-y-1 flex-1">
            <h3 class="text-sm font-bold text-red-900">
              {{ t('upload.quality_error_title') }}
            </h3>
            <p class="text-sm text-red-800 font-medium leading-relaxed">
              {{ t('upload.quality_error_message') }}
            </p>
          </div>
        </div>

        <!-- Metric Breakdown -->
        <div class="grid grid-cols-3 gap-2 pt-2 border-t border-red-100 text-xs">
          <div class="bg-white p-2 rounded-lg border border-red-100">
            <div class="text-slate-400 text-[10px]">{{ t('upload.quality_metrics.confidence') }}</div>
            <div class="font-bold text-red-700">{{ inspectResult.confidence_score }}%</div>
          </div>
          <div class="bg-white p-2 rounded-lg border border-red-100">
            <div class="text-slate-400 text-[10px]">{{ t('upload.quality_metrics.sharpness') }}</div>
            <div class="font-semibold text-slate-800">{{ inspectResult.sharpness_score }}%</div>
          </div>
          <div class="bg-white p-2 rounded-lg border border-red-100">
            <div class="text-slate-400 text-[10px]">{{ t('upload.quality_metrics.brightness') }}</div>
            <div class="font-semibold text-slate-800">{{ inspectResult.brightness_score }}%</div>
          </div>
        </div>

        <div class="pt-2 flex justify-end">
          <button
            @click="resetUpload"
            class="h-9 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors inline-flex items-center justify-center whitespace-nowrap select-none"
          >
            {{ t('upload.reupload_cta') }}
          </button>
        </div>
      </div>

      <!-- Quality Gate Passed Telemetry (>= 40%) -->
      <div
        v-else-if="inspectResult && inspectResult.is_accepted"
        class="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-4"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <div>
              <h3 class="text-sm font-bold text-emerald-900">
                {{ t('upload.inspect_success') }}
              </h3>
              <p class="text-xs text-emerald-700">
                Quality score: <span class="font-bold">{{ inspectResult.confidence_score }}%</span> • Ready for bounding box alignment
              </p>
            </div>
          </div>

          <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            PASSED
          </span>
        </div>

        <!-- Metrics Grid -->
        <div class="grid grid-cols-3 gap-2 text-xs">
          <div class="bg-white p-2.5 rounded-xl border border-emerald-100">
            <div class="text-slate-400 text-[10px]">{{ t('upload.quality_metrics.sharpness') }}</div>
            <div class="font-bold text-emerald-700">{{ inspectResult.sharpness_score }}% (var: {{ inspectResult.laplacian_variance }})</div>
          </div>
          <div class="bg-white p-2.5 rounded-xl border border-emerald-100">
            <div class="text-slate-400 text-[10px]">{{ t('upload.quality_metrics.brightness') }}</div>
            <div class="font-bold text-emerald-700">{{ inspectResult.brightness_score }}% (mean: {{ inspectResult.mean_brightness }})</div>
          </div>
          <div class="bg-white p-2.5 rounded-xl border border-emerald-100">
            <div class="text-slate-400 text-[10px]">CELERY ASYNC TASK</div>
            <div class="font-mono text-slate-800 truncate" :title="inspectResult.task_id || 'dispatched'">
              {{ inspectResult.task_id ? inspectResult.task_id.substring(0, 10) + '...' : 'active' }}
            </div>
          </div>
        </div>

        <!-- Action Button to proceed to verification canvas -->
        <div class="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            @click="resetUpload"
            class="h-10 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors inline-flex items-center justify-center whitespace-nowrap select-none"
          >
            {{ t('upload.reupload_cta') }}
          </button>
          <button
            type="button"
            @click="handleProceed"
            class="h-10 px-6 rounded-xl bg-gov-primary hover:bg-gov-primary-hover text-white text-xs font-bold shadow-md hover:shadow-lg transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap select-none"
          >
            <span>{{ t('upload.proceed_cta') }}</span>
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Network / Server Error -->
      <div v-if="uploadError" class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
        <svg class="w-4 h-4 text-amber-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <span>{{ uploadError }}</span>
      </div>
    </div>
  </div>
</template>
