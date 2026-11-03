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
  <div class="inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 select-none shrink-0 h-10 gap-1">
    <!-- Standard Cambodia Flag Button (Khmer) -->
    <button
      type="button"
      @click="selectLanguage('km')"
      :class="[
        'w-8 h-8 rounded-lg transition-all duration-150 flex items-center justify-center p-0 shrink-0 text-center',
        currentLang === 'km'
          ? 'bg-white shadow-sm border border-slate-200/80'
          : 'border border-transparent opacity-40 hover:opacity-100 hover:bg-slate-200/50'
      ]"
      title="ភាសាខ្មែរ (Khmer)"
      aria-label="ប្តូរទៅភាសាខ្មែរ"
    >
      <span class="flag-icon text-2xl select-none">🇰🇭</span>
    </button>

    <!-- Standard UK Flag Button (English) -->
    <button
      type="button"
      @click="selectLanguage('en')"
      :class="[
        'w-8 h-8 rounded-lg transition-all duration-150 flex items-center justify-center p-0 shrink-0 text-center',
        currentLang === 'en'
          ? 'bg-white shadow-sm border border-slate-200/80'
          : 'border border-transparent opacity-40 hover:opacity-100 hover:bg-slate-200/50'
      ]"
      title="English"
      aria-label="Switch to English"
    >
      <span class="flag-icon text-2xl select-none">🇬🇧</span>
    </button>
  </div>
</template>
