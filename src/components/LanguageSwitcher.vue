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
  <div class="inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-medium h-10 select-none">
    <button
      type="button"
      @click="selectLanguage('km')"
      :class="[
        'h-8 min-w-[94px] px-3 rounded-lg transition-all duration-150 inline-flex items-center justify-center gap-1.5 text-xs font-semibold whitespace-nowrap',
        currentLang === 'km'
          ? 'bg-white text-gov-primary shadow-sm border border-slate-200/80'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
      ]"
      aria-label="ប្តូរទៅភាសាខ្មែរ"
    >
      <span class="text-xs shrink-0">🇰🇭</span>
      <span class="font-khmer">ភាសាខ្មែរ</span>
    </button>
    <button
      type="button"
      @click="selectLanguage('en')"
      :class="[
        'h-8 min-w-[94px] px-3 rounded-lg transition-all duration-150 inline-flex items-center justify-center gap-1.5 text-xs font-semibold whitespace-nowrap',
        currentLang === 'en'
          ? 'bg-white text-gov-primary shadow-sm border border-slate-200/80'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
      ]"
      aria-label="Switch to English"
    >
      <span class="text-xs shrink-0">🇬🇧</span>
      <span class="font-latin">English</span>
    </button>
  </div>
</template>
