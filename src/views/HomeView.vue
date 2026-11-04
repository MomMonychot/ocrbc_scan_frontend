<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const router = useRouter()

function goToVerify(type) {
  router.push({
    path: '/verify',
    query: { type },
  })
}
</script>

<template>
  <main class="min-h-[calc(100vh-4rem)] bg-gov-surface py-8 sm:py-12">
    <div class="max-w-6xl mx-auto px-4 sm:px-8 space-y-8">
      
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
          class="bg-white rounded-2xl border-2 border-slate-200 hover:border-gov-primary shadow-gov-md hover:shadow-gov-lg transition-all duration-200 p-6 sm:p-7 flex flex-col justify-between space-y-6 group"
        >
          <div class="space-y-4">
            <!-- Header & Badge -->
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-1">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-gov-primary border border-blue-200">
                  {{ t('home.doc_standard_badge') }}
                </span>
                <h2 class="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-gov-primary transition-colors">
                  {{ t('home.doc_standard_title') }}
                </h2>
              </div>

              <div class="w-10 h-10 rounded-xl bg-blue-100 text-gov-primary flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                BC
              </div>
            </div>

            <p class="text-xs text-slate-500 leading-relaxed">
              {{ t('home.doc_standard_desc') }}
            </p>

            <!-- Authentic Document Block Box (Standard Certificate Layout Preview) -->
            <div class="bg-slate-50 rounded-xl border border-slate-200/80 p-5 space-y-4 font-serif text-slate-800 shadow-xs relative overflow-hidden select-none">
              <!-- Header with Coat of Arms -->
              <div class="text-center space-y-1 pb-3 border-b border-slate-200">
                <div class="w-9 h-9 mx-auto rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-xs">
                  🇰🇭
                </div>
                <div class="text-[11px] font-bold text-slate-800 tracking-wider">
                  {{ locale === 'km' ? 'ព្រះរាជាណាចក្រកម្ពុជា' : 'KINGDOM OF CAMBODIA' }}
                </div>
                <div class="text-[9px] text-slate-500 font-sans">
                  {{ locale === 'km' ? 'ជាតិ សាសនា ព្រះមហាក្សត្រ' : 'NATION RELIGION KING' }}
                </div>
                <div class="text-xs font-black text-gov-primary font-sans pt-1">
                  {{ locale === 'km' ? 'សេចក្តីចម្លងសំបុត្រកំណើត' : 'COPY OF BIRTH CERTIFICATE' }}
                </div>
              </div>

              <!-- Certificate Preview Lines -->
              <div class="space-y-2.5 text-[11px] font-sans">
                <div class="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                  <span>{{ locale === 'km' ? 'លេខសម្គាល់ជាតិ: ' : 'National ID: ' }}<strong class="text-slate-800">1204009821</strong></span>
                  <span>{{ locale === 'km' ? 'សំបុត្រលេខ: ' : 'Cert No: ' }}<strong class="text-slate-800">BC-2024-009821</strong></span>
                </div>
                <div class="p-2 rounded-lg bg-white border border-slate-200/70">
                  <div class="text-[9px] text-slate-400 font-bold uppercase">{{ locale === 'km' ? 'ឈ្មោះជាអក្សរខ្មែរ' : 'Khmer Name' }}</div>
                  <div class="font-bold text-slate-900 font-khmer text-xs">សុខ ចាន់ដារា</div>
                </div>
                <div class="p-2 rounded-lg bg-white border border-slate-200/70">
                  <div class="text-[9px] text-slate-400 font-bold uppercase">{{ locale === 'km' ? 'ឈ្មោះជាអក្សរឡាតាំង' : 'Latin Name' }}</div>
                  <div class="font-bold text-slate-900 font-latin text-xs">SOK CHANDARAA</div>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div class="p-2 rounded-lg bg-white border border-slate-200/70">
                    <div class="text-[9px] text-slate-400 font-bold uppercase">{{ locale === 'km' ? 'ភេទ' : 'Gender' }}</div>
                    <div class="font-semibold text-slate-800 text-xs">{{ locale === 'km' ? 'ប្រុស' : 'Male' }}</div>
                  </div>
                  <div class="p-2 rounded-lg bg-white border border-slate-200/70">
                    <div class="text-[9px] text-slate-400 font-bold uppercase">{{ locale === 'km' ? 'ថ្ងៃខែឆ្នាំកំណើត' : 'Date of Birth' }}</div>
                    <div class="font-semibold text-slate-800 text-xs font-mono">2000-05-15</div>
                  </div>
                </div>
              </div>

              <!-- Seal Area -->
              <div class="pt-2 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400 font-sans">
                <span>{{ locale === 'km' ? 'ច្រកចេញចូលតែមួយ' : 'One Window Service' }}</span>
                <span class="px-2 py-0.5 rounded border border-blue-200 bg-blue-50 text-gov-primary font-bold">
                  {{ locale === 'km' ? 'ត្រាផ្លូវការ' : 'SEAL' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Action Button -->
          <button
            type="button"
            @click="goToVerify('standard')"
            class="w-full h-12 rounded-xl bg-gov-primary hover:bg-gov-primary-hover active:scale-[0.99] text-white font-bold text-sm shadow-gov-sm hover:shadow-gov-md transition-all flex items-center justify-center gap-2 select-none"
          >
            <span>{{ t('home.btn_start_work') }}</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

        <!-- ========================================================================= -->
        <!-- BLOCK 2: សេចក្តីចម្លងសំបុត្របញ្ជាក់កំណើត (Certified Copy of Birth Cert)  -->
        <!-- ========================================================================= -->
        <div
          class="bg-white rounded-2xl border-2 border-slate-200 hover:border-emerald-600 shadow-gov-md hover:shadow-gov-lg transition-all duration-200 p-6 sm:p-7 flex flex-col justify-between space-y-6 group"
        >
          <div class="space-y-4">
            <!-- Header & Badge -->
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-1">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {{ t('home.doc_certified_badge') }}
                </span>
                <h2 class="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {{ t('home.doc_certified_title') }}
                </h2>
              </div>

              <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                CBC
              </div>
            </div>

            <p class="text-xs text-slate-500 leading-relaxed">
              {{ t('home.doc_certified_desc') }}
            </p>

            <!-- Authentic Document Block Box (Certified Certificate Layout Preview) -->
            <div class="bg-amber-50/30 rounded-xl border border-amber-200/80 p-5 space-y-4 font-serif text-slate-800 shadow-xs relative overflow-hidden select-none">
              <!-- Header with Coat of Arms -->
              <div class="text-center space-y-1 pb-3 border-b border-amber-200/80">
                <div class="w-9 h-9 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-xs">
                  🇰🇭
                </div>
                <div class="text-[11px] font-bold text-slate-800 tracking-wider">
                  {{ locale === 'km' ? 'ព្រះរាជាណាចក្រកម្ពុជា' : 'KINGDOM OF CAMBODIA' }}
                </div>
                <div class="text-[9px] text-slate-500 font-sans">
                  {{ locale === 'km' ? 'ជាតិ សាសនា ព្រះមហាក្សត្រ' : 'NATION RELIGION KING' }}
                </div>
                <div class="text-xs font-black text-gov-primary font-sans pt-1">
                  {{ locale === 'km' ? 'សេចក្តីចម្លងសំបុត្របញ្ជាក់កំណើត' : 'CERTIFIED COPY OF BIRTH CERTIFICATE' }}
                </div>
              </div>

              <!-- Certificate Preview Lines -->
              <div class="space-y-2.5 text-[11px] font-sans">
                <div class="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                  <span>{{ locale === 'km' ? 'សៀវភៅលេខ: ' : 'Book No: ' }}<strong class="text-slate-800">12/04</strong></span>
                  <span>{{ locale === 'km' ? 'សំបុត្រលេខ: ' : 'Cert No: ' }}<strong class="text-slate-800">BC-2024-009821</strong></span>
                </div>
                <div class="p-2 rounded-lg bg-white border border-amber-200/70">
                  <div class="text-[9px] text-slate-400 font-bold uppercase">{{ locale === 'km' ? 'ឈ្មោះជាអក្សរខ្មែរ' : 'Khmer Name' }}</div>
                  <div class="font-bold text-slate-900 font-khmer text-xs">សុខ ចាន់ដារា</div>
                </div>
                <div class="p-2 rounded-lg bg-white border border-amber-200/70">
                  <div class="text-[9px] text-slate-400 font-bold uppercase">{{ locale === 'km' ? 'ឈ្មោះជាអក្សរឡាតាំង' : 'Latin Name' }}</div>
                  <div class="font-bold text-slate-900 font-latin text-xs">SOK CHANDARAA</div>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div class="p-2 rounded-lg bg-white border border-amber-200/70">
                    <div class="text-[9px] text-slate-400 font-bold uppercase">{{ locale === 'km' ? 'ឪពុក' : 'Father' }}</div>
                    <div class="font-semibold text-slate-800 text-xs">សុខ សុវណ្ណ</div>
                  </div>
                  <div class="p-2 rounded-lg bg-white border border-amber-200/70">
                    <div class="text-[9px] text-slate-400 font-bold uppercase">{{ locale === 'km' ? 'ម្តាយ' : 'Mother' }}</div>
                    <div class="font-semibold text-slate-800 text-xs">ចាន់ ធីតា</div>
                  </div>
                </div>
              </div>

              <!-- Official Red Seal Area -->
              <div class="pt-2 border-t border-amber-200/80 flex justify-between items-center text-[9px] text-slate-400 font-sans">
                <span>{{ locale === 'km' ? 'មន្ត្រីអត្រានុកូលដ្ឋាន' : 'Civil Registrar' }}</span>
                <span class="px-2 py-0.5 rounded-full border border-red-300 bg-red-50 text-red-700 font-bold flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                  {{ locale === 'km' ? 'ត្រាក្រហមផ្លូវការ' : 'RED SEAL' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Action Button -->
          <button
            type="button"
            @click="goToVerify('certified')"
            class="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm shadow-gov-sm hover:shadow-gov-md transition-all flex items-center justify-center gap-2 select-none"
          >
            <span>{{ t('home.btn_start_work') }}</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

      </div>

    </div>
  </main>
</template>
