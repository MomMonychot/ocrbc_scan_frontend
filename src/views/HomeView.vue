<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { fetchSystemHealth } from '../services/api_client'

const { t, locale } = useI18n()
const router = useRouter()

// Backend health state tracking
const backendHealth = ref(null)
const isCheckingHealth = ref(true)
const healthError = ref(null)

// Document upload modal / action placeholder
const isModalOpen = ref(false)

async function fetchBackendHealth() {
  isCheckingHealth.value = true
  healthError.value = null
  try {
    const data = await fetchSystemHealth()
    backendHealth.value = data
  } catch (err) {
    // If backend is not started yet or proxy is in transition, capture graceful fallback
    healthError.value = err.message
  } finally {
    isCheckingHealth.value = false
  }
}

function handleStartProcessing() {
  router.push('/verify')
}

function closeModal() {
  isModalOpen.value = false
}

onMounted(() => {
  fetchBackendHealth()
})
</script>

<template>
  <main class="min-h-screen bg-gov-surface flex flex-col justify-between">
    <!-- Hero & Dashboard Container -->
    <div class="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14 w-full">
      
      <!-- Top Action & Info Bar for Mobile/Tablet -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-8 mb-8 border-b border-gov-border gap-4">
        <div class="inline-flex items-center gap-2">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-gov-primary border border-blue-200">
            <svg class="w-3.5 h-3.5 mr-1 text-gov-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v4a1 1 0 102 0V7z" clip-rule="evenodd" />
            </svg>
            {{ t('home.badge') }}
          </span>
          
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
            Zero-Data-Retention Enforced
          </span>
        </div>
      </div>

      <!-- Main Portal Hero Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        <!-- Left: Portal Title, Value Proposition & Primary CTA -->
        <div class="lg:col-span-7 space-y-6">
          <div class="space-y-4 min-h-[170px] sm:min-h-[190px] lg:min-h-[200px] flex flex-col justify-start">
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gov-primary tracking-tight leading-[1.25]">
              {{ t('home.title') }}
            </h1>
            <p class="text-base sm:text-lg text-gov-text-secondary leading-relaxed max-w-2xl">
              {{ t('home.subtitle') }}
            </p>
          </div>

          <!-- Primary Actions with Fixed Deterministic Heights for EN/KH Harmonization -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <!-- Primary CTA Button -->
            <button
              type="button"
              @click="handleStartProcessing"
              class="h-12 min-h-[48px] px-7 rounded-xl bg-gov-primary hover:bg-gov-primary-hover text-white font-semibold text-sm sm:text-base shadow-gov-md hover:shadow-gov-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200 active:scale-[0.99] inline-flex items-center justify-center gap-3 whitespace-nowrap select-none w-auto"
            >
              <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>{{ t('home.start_cta') }}</span>
            </button>

            <!-- Secondary Documentation Action -->
            <a
              href="#security-architecture"
              class="h-12 min-h-[48px] px-6 rounded-xl bg-white hover:bg-slate-50 text-gov-text-primary font-semibold text-sm sm:text-base border border-gov-border shadow-gov-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-slate-300 inline-flex items-center justify-center gap-2 whitespace-nowrap select-none w-auto"
            >
              <svg class="w-5 h-5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{{ t('home.secondary_cta') }}</span>
            </a>
          </div>

          <!-- Real-Time Service Health Telemetry Box -->
          <div class="mt-8 p-4 rounded-xl bg-white border border-gov-border shadow-gov-sm">
            <div class="flex items-center justify-between text-xs font-semibold text-gov-text-muted uppercase tracking-wider mb-2">
              <span class="flex items-center gap-1.5">
                <svg class="w-4 h-4 text-gov-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                FastAPI Gateway Status
              </span>
              <button
                @click="fetchBackendHealth"
                class="text-gov-primary hover:underline lowercase font-normal"
                title="Refresh Health"
              >
                refresh
              </button>
            </div>

            <div v-if="isCheckingHealth" class="text-xs text-slate-500 flex items-center gap-2">
              <svg class="w-3.5 h-3.5 animate-spin text-gov-primary" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              Connecting to health endpoint (/api/v1/health_check)...
            </div>

            <div v-else-if="backendHealth" class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div class="bg-slate-50 p-2 rounded border border-slate-100">
                <div class="text-slate-400 text-[10px]">SERVICE STATUS</div>
                <div class="font-bold text-emerald-600 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {{ backendHealth.status }}
                </div>
              </div>
              <div class="bg-slate-50 p-2 rounded border border-slate-100">
                <div class="text-slate-400 text-[10px]">VERSION</div>
                <div class="font-semibold text-slate-800">v{{ backendHealth.app_version }}</div>
              </div>
              <div class="bg-slate-50 p-2 rounded border border-slate-100">
                <div class="text-slate-400 text-[10px]">ENVIRONMENT</div>
                <div class="font-semibold text-slate-800 capitalize">{{ backendHealth.environment }}</div>
              </div>
              <div class="bg-slate-50 p-2 rounded border border-slate-100">
                <div class="text-slate-400 text-[10px]">ZDR ENFORCED</div>
                <div class="font-semibold text-blue-600">
                  {{ backendHealth.zero_data_retention_enforced ? 'Yes (RAM Only)' : 'Disabled' }}
                </div>
              </div>
            </div>

            <div v-else class="text-xs text-amber-700 bg-amber-50 p-2.5 rounded border border-amber-200">
              Backend service pending boot or connecting. Start FastAPI server at <code class="font-mono text-amber-900 font-bold">http://127.0.0.1:8003</code>.
            </div>
          </div>
        </div>

        <!-- Right: Administrative Verification Card Graphic -->
        <div class="lg:col-span-5">
          <div class="relative bg-white rounded-2xl border border-gov-border shadow-gov-lg p-6 sm:p-8 overflow-hidden">
            <!-- Decorative Seal Background -->
            <div class="absolute -top-12 -right-12 w-48 h-48 bg-blue-50 rounded-full opacity-60 pointer-events-none"></div>

            <div class="relative z-10 space-y-6">
              <div class="flex items-center justify-between pb-4 border-b border-slate-100">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    BC
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-slate-900">Birth Certificate (BC)</h3>
                    <p class="text-xs text-slate-500">Official Civil Registry Form</p>
                  </div>
                </div>
                <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  Template Verified
                </span>
              </div>

              <!-- Simulation of OCR Field Extraction -->
              <div class="space-y-3 font-mono text-xs">
                <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 flex justify-between items-center">
                  <span class="text-slate-500 font-sans font-medium text-xs">ID Number / លេខកូដ:</span>
                  <span class="text-slate-900 font-bold">1204-009821</span>
                </div>
                <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 flex justify-between items-center">
                  <span class="text-slate-500 font-sans font-medium text-xs">Full Name / ឈ្មោះពេញ:</span>
                  <span class="text-gov-primary font-bold font-khmer">សុខ ចាន់ដារ៉ា</span>
                </div>
                <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 flex justify-between items-center">
                  <span class="text-slate-500 font-sans font-medium text-xs">District Office / ខណ្ឌ:</span>
                  <span class="text-slate-800 font-bold font-khmer">ដូនពេញ (Daun Penh)</span>
                </div>
                <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 flex justify-between items-center">
                  <span class="text-slate-500 font-sans font-medium text-xs">Confidence Score:</span>
                  <span class="text-emerald-700 font-bold">99.4% (Verified)</span>
                </div>
              </div>

              <!-- Zero Storage Ephemeral Status -->
              <div class="p-3 rounded-lg bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900 flex items-start gap-2.5">
                <svg class="w-4 h-4 text-blue-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
                <span>
                  <strong>Zero-Data-Retention Safeguard:</strong> This document preview exists in transient memory only and will be purged following verification completion.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Government Architecture Pillars & Security Baseline -->
      <section id="security-architecture" class="mt-20 pt-10 border-t border-gov-border">
        <div class="mb-10 text-center max-w-3xl mx-auto space-y-2">
          <h2 class="text-2xl sm:text-3xl font-bold text-gov-primary">
            Official System Security & Architecture Standards
          </h2>
          <p class="text-sm sm:text-base text-gov-text-secondary">
            Engineered exclusively for district administration to protect citizen identity privacy and adhere to statutory compliance.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          <!-- Pillar 1: Zero Data Retention -->
          <div class="bg-white p-6 rounded-2xl border border-gov-border shadow-gov-sm hover:shadow-gov-md transition-shadow flex flex-col justify-between h-full">
            <div>
              <div class="w-12 h-12 rounded-xl bg-blue-50 text-gov-primary flex items-center justify-center mb-5 shrink-0">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-slate-900 mb-2 min-h-[3.25rem] flex items-center">
                {{ t('home.features.zdr_title') }}
              </h3>
            </div>
            <p class="text-sm text-gov-text-secondary leading-relaxed min-h-[4.5rem] flex-1">
              {{ t('home.features.zdr_desc') }}
            </p>
          </div>

          <!-- Pillar 2: Bilingual Typography & Model Accuracy -->
          <div class="bg-white p-6 rounded-2xl border border-gov-border shadow-gov-sm hover:shadow-gov-md transition-shadow flex flex-col justify-between h-full">
            <div>
              <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5 shrink-0">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-slate-900 mb-2 min-h-[3.25rem] flex items-center">
                {{ t('home.features.accuracy_title') }}
              </h3>
            </div>
            <p class="text-sm text-gov-text-secondary leading-relaxed min-h-[4.5rem] flex-1">
              {{ t('home.features.accuracy_desc') }}
            </p>
          </div>

          <!-- Pillar 3: Cryptographic Integrity -->
          <div class="bg-white p-6 rounded-2xl border border-gov-border shadow-gov-sm hover:shadow-gov-md transition-shadow flex flex-col justify-between h-full">
            <div>
              <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-5 shrink-0">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-slate-900 mb-2 min-h-[3.25rem] flex items-center">
                {{ t('home.features.tamper_title') }}
              </h3>
            </div>
            <p class="text-sm text-gov-text-secondary leading-relaxed min-h-[4.5rem] flex-1">
              {{ t('home.features.tamper_desc') }}
            </p>
          </div>
        </div>

        <!-- Metric KPI Banner -->
        <div class="mt-8 bg-white border border-gov-border rounded-xl p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div class="border-b sm:border-b-0 sm:border-r border-slate-100 pb-4 sm:pb-0">
            <div class="text-2xl font-black text-gov-primary">{{ t('home.metrics.retention_val') }}</div>
            <div class="text-xs font-semibold text-slate-500 uppercase mt-1">{{ t('home.metrics.retention_title') }}</div>
          </div>
          <div class="border-b sm:border-b-0 sm:border-r border-slate-100 pb-4 sm:pb-0">
            <div class="text-2xl font-black text-emerald-600">{{ t('home.metrics.latency_val') }}</div>
            <div class="text-xs font-semibold text-slate-500 uppercase mt-1">{{ t('home.metrics.latency_title') }}</div>
          </div>
          <div>
            <div class="text-2xl font-black text-slate-800">{{ t('home.metrics.encryption_val') }}</div>
            <div class="text-xs font-semibold text-slate-500 uppercase mt-1">{{ t('home.metrics.encryption_title') }}</div>
          </div>
        </div>
      </section>

    </div>

    <!-- Official Administrative Confidentiality Notice Footer -->
    <footer class="bg-white border-t border-gov-border mt-16 py-6 px-4 sm:px-8">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-gov-text-muted gap-4">
        <p class="text-center md:text-left">
          {{ t('common.confidentiality_notice') }}
        </p>
        <div class="flex items-center gap-4 text-slate-400 font-medium">
          <span>Security Protocol: ZDR-RAM-v1</span>
          <span>•</span>
          <span>Strict Light Mode UI</span>
          <span>•</span>
          <span>© 2026 District Administration</span>
        </div>
      </div>
    </footer>

    <!-- Modal Dialog for Processing Flow (Phase 1 Ready Placeholder) -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gov-border space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-blue-50 text-gov-primary flex items-center justify-center font-bold">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h4 class="font-bold text-slate-900 text-sm">
              {{ t('home.start_cta') }} (Phase 1 Active)
            </h4>
          </div>
          <button
            @click="closeModal"
            class="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p class="text-sm text-slate-600 leading-relaxed">
          Phase 1 Initialization is active and verified. The file upload and multi-model OCR extraction pipeline will be mounted in Phase 2 using the Zero-Data-Retention ephemeral memory buffer.
        </p>

        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-700 space-y-1">
          <div class="font-semibold text-gov-primary">Verified Backend Endpoints:</div>
          <div>• GET <code class="font-mono text-slate-900">/api/v1/health_check</code> (Operational)</div>
          <div>• Zero-Data-Retention Ephemeral Scrubber (Ready)</div>
        </div>

        <div class="flex justify-end pt-2">
          <button
            @click="closeModal"
            class="px-5 py-2.5 rounded-xl bg-gov-primary text-white text-xs font-semibold hover:bg-gov-primary-hover shadow-sm"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
