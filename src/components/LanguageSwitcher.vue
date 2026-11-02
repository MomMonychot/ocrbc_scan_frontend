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
  <div class="inline-flex items-center rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs font-medium">
    <button
      type="button"
      @click="selectLanguage('km')"
      :class="[
        'px-3 py-1.5 rounded-md transition-all duration-150 flex items-center gap-1.5',
        currentLang === 'km'
          ? 'bg-white text-gov-primary shadow-sm font-semibold border border-slate-200/60'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
      ]"
      aria-label="ប្តូរទៅភាសាខ្មែរ"
    >
      <span class="text-xs">🇰🇭</span>
      <span class="font-khmer">ភាសាខ្មែរ</span>
    </button>
    <button
      type="button"
      @click="selectLanguage('en')"
      :class="[
        'px-3 py-1.5 rounded-md transition-all duration-150 flex items-center gap-1.5',
        currentLang === 'en'
          ? 'bg-white text-gov-primary shadow-sm font-semibold border border-slate-200/60'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
      ]"
      aria-label="Switch to English"
    >
      <span class="text-xs">🇬🇧</span>
      <span class="font-latin">English</span>
    </button>
  </div>
</template>
