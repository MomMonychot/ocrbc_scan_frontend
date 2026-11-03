<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const activeTab = ref('overview')

const tabs = [
  { id: 'overview', key: 'about_page.tabs.overview', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'goal', key: 'about_page.tabs.goal', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'vision', key: 'about_page.tabs.vision', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
  { id: 'mission', key: 'about_page.tabs.mission', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { id: 'policies_rules', key: 'about_page.tabs.policies_rules', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
]

function switchTab(id) {
  activeTab.value = id
  router.replace({ query: { section: id } })
}

onMounted(() => {
  const section = route.query.section || route.hash.replace('#', '')
  if (section && tabs.some(tab => tab.id === section)) {
    activeTab.value = section
  }
})

watch(() => route.query.section, (newSection) => {
  if (newSection && tabs.some(tab => tab.id === newSection)) {
    activeTab.value = newSection
  }
})
</script>

<template>
  <main class="min-h-screen bg-gov-surface py-8 sm:py-12">
    <div class="max-w-6xl mx-auto px-4 sm:px-8">
      
      <!-- Top Header Navigation & Breadcrumb -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-gov-border gap-4">
        <div>
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-gov-primary border border-blue-200 mb-2">
            {{ t('about_page.badge') }}
          </span>
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gov-primary tracking-tight">
            {{ t('about_page.title') }}
          </h1>
          <p class="text-sm sm:text-base text-gov-text-secondary mt-1 max-w-3xl leading-relaxed">
            {{ t('about_page.subtitle') }}
          </p>
        </div>

        <router-link
          to="/"
          class="h-10 px-4 rounded-xl text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-gov-border shadow-gov-sm transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap self-start sm:self-center"
        >
          <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>{{ t('nav.home') }}</span>
        </router-link>
      </div>

      <!-- Navigation Tabs Pill Bar -->
      <div class="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 overflow-x-auto mb-10 select-none">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          @click="switchTab(tab.id)"
          :class="[
            'h-11 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-semibold transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0',
            activeTab === tab.id
              ? 'bg-white text-gov-primary shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          ]"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon" />
          </svg>
          <span>{{ t(tab.key) }}</span>
        </button>
      </div>

      <!-- Tab 1: Overview / About Us -->
      <section v-if="activeTab === 'overview'" class="space-y-8 animate-fadeIn">
        <div class="bg-white rounded-2xl border border-gov-border shadow-gov-sm p-6 sm:p-10 space-y-6">
          <div class="flex items-center gap-4 border-b border-slate-100 pb-5">
            <div class="w-12 h-12 rounded-xl bg-blue-50 text-gov-primary flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
              <svg class="w-6 h-6 text-gov-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 class="text-xl sm:text-2xl font-bold text-slate-900">
                {{ t('about_page.overview.title') }}
              </h2>
              <p class="text-xs sm:text-sm text-slate-500">Official Municipal Technology Platform</p>
            </div>
          </div>

          <div class="space-y-4 text-slate-700 leading-relaxed text-sm sm:text-base">
            <p>{{ t('about_page.overview.p1') }}</p>
            <p>{{ t('about_page.overview.p2') }}</p>
          </div>

          <!-- Highlight Key Metrics -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div class="text-xs font-semibold text-slate-500 uppercase">Khmer Dual OCR</div>
              <div class="text-lg font-bold text-gov-primary mt-1">Kantumruy Pro AI</div>
              <div class="text-xs text-slate-500 mt-0.5">Optimized for Cambodian civil certificates</div>
            </div>
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div class="text-xs font-semibold text-slate-500 uppercase">Privacy Standard</div>
              <div class="text-lg font-bold text-emerald-600 mt-1">Zero-Data-Retention</div>
              <div class="text-xs text-slate-500 mt-0.5">100% ephemeral in-memory processing</div>
            </div>
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div class="text-xs font-semibold text-slate-500 uppercase">Target Audience</div>
              <div class="text-lg font-bold text-slate-800 mt-1">District / Khan / Commune</div>
              <div class="text-xs text-slate-500 mt-0.5">Civil status administration offices</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Tab 2: Goal -->
      <section v-if="activeTab === 'goal'" class="space-y-8 animate-fadeIn">
        <div class="bg-white rounded-2xl border border-gov-border shadow-gov-sm p-6 sm:p-10 space-y-6">
          <div class="flex items-center gap-4 border-b border-slate-100 pb-5">
            <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
              <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 class="text-xl sm:text-2xl font-bold text-slate-900">
                {{ t('about_page.goal.title') }}
              </h2>
              <p class="text-xs sm:text-sm text-slate-500">Measurable Operational Milestones</p>
            </div>
          </div>

          <p class="text-base sm:text-lg font-medium text-slate-800 leading-relaxed">
            {{ t('about_page.goal.desc') }}
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div
              v-for="(item, idx) in t('about_page.goal.items')"
              :key="idx"
              class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3"
            >
              <div class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {{ idx + 1 }}
              </div>
              <p class="text-sm text-slate-700 leading-relaxed font-medium">{{ item }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Tab 3: Vision -->
      <section v-if="activeTab === 'vision'" class="space-y-8 animate-fadeIn">
        <div class="bg-white rounded-2xl border border-gov-border shadow-gov-sm p-6 sm:p-10 space-y-6">
          <div class="flex items-center gap-4 border-b border-slate-100 pb-5">
            <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
              <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <h2 class="text-xl sm:text-2xl font-bold text-slate-900">
                {{ t('about_page.vision.title') }}
              </h2>
              <p class="text-xs sm:text-sm text-slate-500">Long-term Strategic Direction</p>
            </div>
          </div>

          <p class="text-base sm:text-lg font-medium text-slate-800 leading-relaxed">
            {{ t('about_page.vision.desc') }}
          </p>

          <div class="space-y-3 pt-2">
            <div
              v-for="(item, idx) in t('about_page.vision.items')"
              :key="idx"
              class="p-5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5 hover:bg-slate-100/60 transition-colors"
            >
              <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p class="text-sm sm:text-base text-slate-800 leading-relaxed font-semibold">{{ item }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Tab 4: Mission -->
      <section v-if="activeTab === 'mission'" class="space-y-8 animate-fadeIn">
        <div class="bg-white rounded-2xl border border-gov-border shadow-gov-sm p-6 sm:p-10 space-y-6">
          <div class="flex items-center gap-4 border-b border-slate-100 pb-5">
            <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
              <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 class="text-xl sm:text-2xl font-bold text-slate-900">
                {{ t('about_page.mission.title') }}
              </h2>
              <p class="text-xs sm:text-sm text-slate-500">Core Administrative Commitment</p>
            </div>
          </div>

          <p class="text-base sm:text-lg font-medium text-slate-800 leading-relaxed">
            {{ t('about_page.mission.desc') }}
          </p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div
              v-for="(item, idx) in t('about_page.mission.items')"
              :key="idx"
              class="p-5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
            >
              <div class="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold mb-3">
                {{ idx + 1 }}
              </div>
              <p class="text-sm text-slate-700 leading-relaxed font-medium">{{ item }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Tab 5: Policies & Rules -->
      <section v-if="activeTab === 'policies_rules'" class="space-y-8 animate-fadeIn">
        <div class="bg-white rounded-2xl border border-gov-border shadow-gov-sm p-6 sm:p-10 space-y-6">
          <div class="flex items-center gap-4 border-b border-slate-100 pb-5">
            <div class="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
              <svg class="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 class="text-xl sm:text-2xl font-bold text-slate-900">
                {{ t('about_page.policies_rules.title') }}
              </h2>
              <p class="text-xs sm:text-sm text-slate-500">Statutory Directives & Security Protocol</p>
            </div>
          </div>

          <p class="text-sm sm:text-base text-slate-600 leading-relaxed">
            {{ t('about_page.policies_rules.desc') }}
          </p>

          <div class="space-y-4 pt-2">
            <div
              v-for="(rule, idx) in t('about_page.policies_rules.rules')"
              :key="idx"
              class="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2"
            >
              <div class="text-base font-bold text-slate-900 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                <span>{{ rule.name }}</span>
              </div>
              <p class="text-sm text-slate-600 leading-relaxed pl-4 border-l-2 border-slate-200">
                {{ rule.detail }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Bottom Direct CTA to Functions / Verification -->
      <div class="mt-12 p-8 rounded-2xl bg-gradient-to-r from-gov-primary to-blue-800 text-white shadow-gov-md flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 class="text-xl font-bold">តម្រូវការផ្ទៀងផ្ទាត់សំបុត្រកំណើតជាក់ស្តែង?</h3>
          <p class="text-sm text-blue-100 mt-1">ចាប់ផ្តើមដំណើរការស្កេន និងផ្ទៀងផ្ទាត់ទិន្នន័យក្នុងប្រព័ន្ធភ្លាមៗ</p>
        </div>
        <router-link
          to="/verify"
          class="h-12 px-7 rounded-xl bg-white hover:bg-slate-100 text-gov-primary font-bold text-sm shadow-sm transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
        >
          <span>{{ t('functions.birth_certificate.title') }}</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </router-link>
      </div>

    </div>
  </main>
</template>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.2s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
