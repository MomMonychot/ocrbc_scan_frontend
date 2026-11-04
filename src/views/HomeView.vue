<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()

function goToVerify(type) {
  router.push({
    path: '/verify',
    query: { type },
  })
}
</script>

<template>
  <main class="min-h-[calc(100vh-4rem)] bg-gov-surface py-10 sm:py-16">
    <div class="max-w-5xl mx-auto px-4 sm:px-8 space-y-10">
      
      <!-- Top Title Header -->
      <div class="text-center max-w-2xl mx-auto space-y-2">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-gov-primary tracking-tight">
          {{ t('home.title') }}
        </h1>
        <p class="text-xs sm:text-sm text-gov-text-secondary leading-relaxed">
          {{ t('home.subtitle') }}
        </p>
      </div>

      <!-- THE TWO WORKING DOCUMENT TYPE BLOCKS -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        
        <!-- ============================================================= -->
        <!-- BLOCK 1: សេចក្តីចម្លងសំបុត្រកំណើត (Copy of Birth Certificate) -->
        <!-- ============================================================= -->
        <div
          @click="goToVerify('standard')"
          class="bg-white rounded-2xl border-2 border-slate-200 hover:border-gov-primary p-7 sm:p-8 shadow-gov-sm hover:shadow-gov-lg transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden"
        >
          <!-- Subtle Accent Corner -->
          <div class="absolute top-0 right-0 w-28 h-28 bg-blue-50 rounded-bl-full opacity-60 pointer-events-none group-hover:scale-110 transition-transform"></div>

          <div class="space-y-6 relative z-10">
            <!-- Icon & Badge Row -->
            <div class="flex items-center justify-between">
              <div class="w-14 h-14 rounded-2xl bg-gov-primary text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-gov-primary border border-blue-200">
                {{ t('home.doc_standard_badge') }}
              </span>
            </div>

            <!-- Title & Description -->
            <div class="space-y-2.5">
              <h2 class="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-gov-primary transition-colors">
                {{ t('home.doc_standard_title') }}
              </h2>
              <p class="text-xs sm:text-sm text-gov-text-secondary leading-relaxed">
                {{ t('home.doc_standard_desc') }}
              </p>
            </div>

            <!-- Feature Checklist (Like list function) -->
            <div class="space-y-2 pt-2 text-xs font-medium text-slate-600">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ t('home.feat_extract') }}</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ t('home.feat_transfer') }}</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ t('home.feat_editable') }}</span>
              </div>
            </div>
          </div>

          <!-- Action Button Row -->
          <div class="pt-6 mt-6 border-t border-slate-100 relative z-10 flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-400 group-hover:text-gov-primary transition-colors">
              {{ t('home.doc_standard_title') }}
            </span>
            <div class="h-10 px-5 rounded-xl bg-gov-primary group-hover:bg-gov-primary-hover text-white text-xs font-bold inline-flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md transition-all">
              <span>{{ t('home.btn_update_template') }}</span>
              <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
        </div>

        <!-- ========================================================================= -->
        <!-- BLOCK 2: សេចក្តីចម្លងសំបុត្របញ្ជាក់កំណើត (Certified Copy of Birth Cert)  -->
        <!-- ========================================================================= -->
        <div
          @click="goToVerify('certified')"
          class="bg-white rounded-2xl border-2 border-slate-200 hover:border-emerald-600 p-7 sm:p-8 shadow-gov-sm hover:shadow-gov-lg transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden"
        >
          <!-- Subtle Accent Corner -->
          <div class="absolute top-0 right-0 w-28 h-28 bg-emerald-50 rounded-bl-full opacity-60 pointer-events-none group-hover:scale-110 transition-transform"></div>

          <div class="space-y-6 relative z-10">
            <!-- Icon & Badge Row -->
            <div class="flex items-center justify-between">
              <div class="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>

              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {{ t('home.doc_certified_badge') }}
              </span>
            </div>

            <!-- Title & Description -->
            <div class="space-y-2.5">
              <h2 class="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                {{ t('home.doc_certified_title') }}
              </h2>
              <p class="text-xs sm:text-sm text-gov-text-secondary leading-relaxed">
                {{ t('home.doc_certified_desc') }}
              </p>
            </div>

            <!-- Feature Checklist (Like list function) -->
            <div class="space-y-2 pt-2 text-xs font-medium text-slate-600">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ t('home.feat_extract') }}</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ t('home.feat_transfer') }}</span>
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ t('home.feat_editable') }}</span>
              </div>
            </div>
          </div>

          <!-- Action Button Row -->
          <div class="pt-6 mt-6 border-t border-slate-100 relative z-10 flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-400 group-hover:text-emerald-700 transition-colors">
              {{ t('home.doc_certified_title') }}
            </span>
            <div class="h-10 px-5 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md transition-all">
              <span>{{ t('home.btn_update_template') }}</span>
              <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
        </div>

      </div>

    </div>
  </main>
</template>
