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
  <div class="inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 select-none shrink-0 h-10">
    <button
      type="button"
      @click="selectLanguage('km')"
      :class="[
        'h-8 w-11 rounded-lg transition-all duration-150 inline-flex items-center justify-center text-xl shrink-0',
        currentLang === 'km'
          ? 'bg-white shadow-sm border border-slate-200/80 scale-[1.02]'
          : 'opacity-50 hover:opacity-100 hover:bg-slate-200/60'
      ]"
      title="ភាសាខ្មែរ (Khmer)"
      aria-label="ប្តូរទៅភាសាខ្មែរ"
    >
      <span class="leading-none filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]">🇰🇭</span>
    </button>
    <button
      type="button"
      @click="selectLanguage('en')"
      :class="[
        'h-8 w-11 rounded-lg transition-all duration-150 inline-flex items-center justify-center text-xl shrink-0',
        currentLang === 'en'
          ? 'bg-white shadow-sm border border-slate-200/80 scale-[1.02]'
          : 'opacity-50 hover:opacity-100 hover:bg-slate-200/60'
      ]"
      title="English"
      aria-label="Switch to English"
    >
      <span class="leading-none filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]">🇬🇧</span>
    </button>
  </div>
</template>
