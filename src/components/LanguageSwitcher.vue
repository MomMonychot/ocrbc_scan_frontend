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
    <!-- Standard Cambodia Flag Button (Khmer) -->
    <button
      type="button"
      @click="selectLanguage('km')"
      :class="[
        'h-8 w-10 rounded-lg transition-all duration-150 inline-flex items-center justify-center shrink-0',
        currentLang === 'km'
          ? 'bg-white shadow-sm border border-slate-200/80 scale-[1.02]'
          : 'opacity-40 hover:opacity-100 hover:bg-slate-200/50'
      ]"
      title="ភាសាខ្មែរ (Khmer)"
      aria-label="ប្តូរទៅភាសាខ្មែរ"
    >
      <span class="text-2xl leading-none select-none">🇰🇭</span>
    </button>

    <!-- Standard UK Flag Button (English) -->
    <button
      type="button"
      @click="selectLanguage('en')"
      :class="[
        'h-8 w-10 rounded-lg transition-all duration-150 inline-flex items-center justify-center shrink-0',
        currentLang === 'en'
          ? 'bg-white shadow-sm border border-slate-200/80 scale-[1.02]'
          : 'opacity-40 hover:opacity-100 hover:bg-slate-200/50'
      ]"
      title="English"
      aria-label="Switch to English"
    >
      <span class="text-2xl leading-none select-none">🇬🇧</span>
    </button>
  </div>
</template>
