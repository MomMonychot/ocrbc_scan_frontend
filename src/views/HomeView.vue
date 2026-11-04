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
  <main class="min-h-[calc(100vh-4rem)] bg-gov-surface py-12 sm:py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-8 w-full space-y-8 sm:space-y-10">
      
      <!-- Top Title Header with Deterministic Locked Heights -->
      <div class="text-center max-w-xl mx-auto space-y-2">
        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gov-primary tracking-tight h-10 flex items-center justify-center">
          {{ t('home.title') }}
        </h1>
        <p class="text-xs sm:text-sm text-gov-text-secondary leading-relaxed h-6 flex items-center justify-center">
          {{ t('home.subtitle') }}
        </p>
      </div>

      <!-- THE TWO WORKING DOCUMENT TYPE FUNCTION BLOCKS WITH FIXED SIZES -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
        
        <!-- ============================================================= -->
        <!-- BLOCK 1: សេចក្តីចម្លងសំបុត្រកំណើត (Copy of Birth Certificate) -->
        <!-- ============================================================= -->
        <div
          @click="goToVerify('standard')"
          class="group bg-white rounded-2xl border border-slate-200/90 hover:border-gov-primary p-7 sm:p-8 shadow-gov-sm hover:shadow-xl transition-all duration-200 cursor-pointer hover:-translate-y-1.5 relative overflow-hidden ring-4 ring-transparent hover:ring-blue-50"
        >
          <!-- Subtle Decorative Accent Corner -->
          <div class="absolute top-0 right-0 w-28 h-28 bg-blue-50 rounded-bl-full opacity-60 pointer-events-none group-hover:scale-110 transition-transform"></div>

          <div class="space-y-4 relative z-10">
            <!-- Icon & Status Badge (Locked 56px height) -->
            <div class="h-14 flex items-center justify-between">
              <div class="w-13 h-13 rounded-2xl bg-blue-50 border border-blue-200 text-gov-primary flex items-center justify-center shadow-xs group-hover:bg-gov-primary group-hover:text-white transition-all duration-200 shrink-0">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-gov-primary border border-blue-200">
                {{ t('home.doc_standard_badge') }}
              </span>
            </div>

            <!-- Title (Locked 56px height, consistent font sizing) -->
            <div class="h-14 flex items-center">
              <h2 class="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-gov-primary transition-colors tracking-tight leading-snug">
                {{ t('home.doc_standard_title') }}
              </h2>
            </div>

            <!-- Description (Locked 48px height, 2 lines like in Khmer) -->
            <div class="h-12 flex items-start">
              <p class="text-xs sm:text-[13px] text-slate-600 leading-relaxed overflow-hidden">
                {{ t('home.doc_standard_desc') }}
              </p>
            </div>
          </div>
        </div>

        <!-- ========================================================================= -->
        <!-- BLOCK 2: សេចក្តីចម្លងសំបុត្របញ្ជាក់កំណើត (Certified Copy of Birth Cert)  -->
        <!-- ========================================================================= -->
        <div
          @click="goToVerify('certified')"
          class="group bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-600 p-7 sm:p-8 shadow-gov-sm hover:shadow-xl transition-all duration-200 cursor-pointer hover:-translate-y-1.5 relative overflow-hidden ring-4 ring-transparent hover:ring-emerald-50"
        >
          <!-- Subtle Decorative Accent Corner -->
          <div class="absolute top-0 right-0 w-28 h-28 bg-emerald-50 rounded-bl-full opacity-60 pointer-events-none group-hover:scale-110 transition-transform"></div>

          <div class="space-y-4 relative z-10">
            <!-- Icon & Status Badge (Locked 56px height) -->
            <div class="h-14 flex items-center justify-between">
              <div class="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-xs group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200 shrink-0">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>

              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {{ t('home.doc_certified_badge') }}
              </span>
            </div>

            <!-- Title (Locked 56px height, consistent font sizing) -->
            <div class="h-14 flex items-center">
              <h2 class="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors tracking-tight leading-snug">
                {{ t('home.doc_certified_title') }}
              </h2>
            </div>

            <!-- Description (Locked 48px height, 2 lines like in Khmer) -->
            <div class="h-12 flex items-start">
              <p class="text-xs sm:text-[13px] text-slate-600 leading-relaxed overflow-hidden">
                {{ t('home.doc_certified_desc') }}
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  </main>
</template>
