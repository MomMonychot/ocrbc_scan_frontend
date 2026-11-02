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
  <div class="inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 select-none shrink-0 h-11">
    <!-- Cambodia Flag Button (Khmer) -->
    <button
      type="button"
      @click="selectLanguage('km')"
      :class="[
        'h-9 w-13 px-2 rounded-lg transition-all duration-150 inline-flex items-center justify-center shrink-0',
        currentLang === 'km'
          ? 'bg-white shadow-md border border-slate-200/90 ring-2 ring-gov-primary/20 scale-[1.03]'
          : 'opacity-40 hover:opacity-100 hover:bg-slate-200/60'
      ]"
      title="ភាសាខ្មែរ (Khmer)"
      aria-label="ប្តូរទៅភាសាខ្មែរ"
    >
      <svg
        viewBox="0 0 900 600"
        class="w-8 h-5.5 rounded-[3px] shadow-sm overflow-hidden border border-black/10 shrink-0"
      >
        <!-- Blue Top and Bottom Stripes -->
        <rect width="900" height="600" fill="#032EA1" />
        <!-- Red Center Stripe -->
        <rect y="150" width="900" height="300" fill="#E00025" />
        <!-- White Angkor Wat Silhouette -->
        <g fill="#FFFFFF" transform="translate(290, 160)">
          <!-- Base Platforms -->
          <path d="M 40,244 h 240 v 20 H 40 z M 55,224 h 210 v 20 H 55 z M 70,200 h 180 v 24 H 70 z M 85,180 h 150 v 20 H 85 z" />
          <!-- Outer Left & Right Towers -->
          <path d="M 80,120 h 25 v 60 h -25 z M 215,120 h 25 v 60 h -25 z" />
          <path d="M 87,90 h 11 v 30 h -11 z M 222,90 h 11 v 30 h -11 z" />
          <path d="M 90,70 h 5 v 20 h -5 z M 225,70 h 5 v 20 h -5 z" />
          <polygon points="92.5,50 85,70 100,70" />
          <polygon points="227.5,50 220,70 235,70" />
          <!-- Inner Mid Towers -->
          <path d="M 115,100 h 25 v 80 h -25 z M 180,100 h 25 v 80 h -25 z" />
          <path d="M 122,75 h 11 v 25 h -11 z M 187,75 h 11 v 25 h -11 z" />
          <path d="M 125,55 h 5 v 20 h -5 z M 190,55 h 5 v 20 h -5 z" />
          <polygon points="127.5,35 120,55 135,55" />
          <polygon points="192.5,35 185,55 200,55" />
          <!-- Main Central Tower -->
          <path d="M 145,80 h 30 v 100 h -30 z" />
          <path d="M 152,50 h 16 v 30 h -16 z" />
          <path d="M 156,30 h 8 v 20 h -8 z" />
          <polygon points="160,10 151,30 169,30" />
        </g>
      </svg>
    </button>

    <!-- UK Flag Button (English) -->
    <button
      type="button"
      @click="selectLanguage('en')"
      :class="[
        'h-9 w-13 px-2 rounded-lg transition-all duration-150 inline-flex items-center justify-center shrink-0',
        currentLang === 'en'
          ? 'bg-white shadow-md border border-slate-200/90 ring-2 ring-gov-primary/20 scale-[1.03]'
          : 'opacity-40 hover:opacity-100 hover:bg-slate-200/60'
      ]"
      title="English"
      aria-label="Switch to English"
    >
      <svg
        viewBox="0 0 600 300"
        class="w-8 h-5.5 rounded-[3px] shadow-sm overflow-hidden border border-black/10 shrink-0"
      >
        <clipPath id="uk-flag-s">
          <path d="M0,0 v300 h600 v-300 z"/>
        </clipPath>
        <clipPath id="uk-flag-t">
          <path d="M300,150 h300 v150 z v-300 h-300 z h-300 v300 z v-300 h300 z"/>
        </clipPath>
        <g clip-path="url(#uk-flag-s)">
          <path d="M0,0 v300 h600 v-300 z" fill="#012169"/>
          <path d="M0,0 l600,300 m0,-300 l-600,300" stroke="#FFFFFF" stroke-width="60"/>
          <path d="M0,0 l600,300 m0,-300 l-600,300" clip-path="url(#uk-flag-t)" stroke="#C8102E" stroke-width="40"/>
          <path d="M300,0 v300 m-300,-150 h600" stroke="#FFFFFF" stroke-width="100"/>
          <path d="M300,0 v300 m-300,-150 h600" stroke="#C8102E" stroke-width="60"/>
        </g>
      </svg>
    </button>
  </div>
</template>
