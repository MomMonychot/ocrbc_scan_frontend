<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { setApplicationLanguage } from '../i18n'

const { locale } = useI18n()

const currentLang = computed(() => locale.value)

function selectLanguage(lang) {
  setApplicationLanguage(lang)
}
</script>

<template>
  <div class="inline-flex items-center rounded-xl bg-slate-100/90 p-1 border border-slate-200 select-none shrink-0 h-10 gap-1 shadow-2xs">
    <!-- Standard Cambodia Flag Button (Khmer) -->
    <button
      type="button"
      @click="selectLanguage('km')"
      :class="[
        'w-8 h-8 rounded-lg transition-all duration-200 flex items-center justify-center p-0 shrink-0 text-center outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:scale-95 cursor-pointer',
        currentLang === 'km'
          ? 'bg-white shadow-xs border border-slate-200/90 font-bold'
          : 'border border-transparent opacity-45 hover:opacity-100 hover:bg-slate-200/60'
      ]"
      :title="currentLang === 'km' ? 'ភាសាខ្មែរ (Khmer)' : 'Khmer'"
      aria-label="ប្តូរទៅភាសាខ្មែរ"
    >
      <span class="flag-icon text-xl select-none">🇰🇭</span>
    </button>

    <!-- Standard UK Flag Button (English) -->
    <button
      type="button"
      @click="selectLanguage('en')"
      :class="[
        'w-8 h-8 rounded-lg transition-all duration-200 flex items-center justify-center p-0 shrink-0 text-center outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:scale-95 cursor-pointer',
        currentLang === 'en'
          ? 'bg-white shadow-xs border border-slate-200/90 font-bold'
          : 'border border-transparent opacity-45 hover:opacity-100 hover:bg-slate-200/60'
      ]"
      :title="currentLang === 'km' ? 'ភាសាអង់គ្លេស (English)' : 'English'"
      aria-label="Switch to English"
    >
      <span class="flag-icon text-xl select-none">🇬🇧</span>
    </button>
  </div>
</template>
