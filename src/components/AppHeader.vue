<script setup>
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from './LanguageSwitcher.vue'

const { t } = useI18n()
</script>

<template>
  <header class="bg-white border-b border-gov-border sticky top-0 z-40 shadow-gov-sm">
    <!-- Main Navigation Bar with Fixed Height to Prevent Vertical Shifts -->
    <div class="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center gap-6 min-w-0">
        <router-link to="/" class="flex items-center gap-3.5 group min-w-0">
          <!-- Official District Portal Seal / Icon -->
          <div class="w-10 h-10 rounded-lg bg-gov-primary flex items-center justify-center text-white shadow-sm ring-2 ring-blue-100 group-hover:scale-105 transition-transform shrink-0">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div class="truncate">
            <h1 class="text-sm sm:text-base lg:text-lg font-bold text-gov-primary leading-tight truncate">
              {{ t('header.district_office') }}
            </h1>
          </div>
        </router-link>

        <!-- Navigation Links with Fixed Heights -->
        <nav class="hidden lg:flex items-center gap-1 pl-4 border-l border-slate-200 text-xs font-semibold shrink-0">
          <router-link
            to="/"
            active-class="bg-blue-50 text-gov-primary"
            class="h-9 px-3.5 rounded-lg text-slate-600 hover:text-gov-primary hover:bg-slate-50 transition-colors inline-flex items-center justify-center whitespace-nowrap"
          >
            {{ t('nav.home') }}
          </router-link>
          <router-link
            to="/verify"
            active-class="bg-blue-50 text-gov-primary"
            class="h-9 px-3.5 rounded-lg text-slate-600 hover:text-gov-primary hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <span>{{ t('nav.verify') }}</span>
            <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
          </router-link>
        </nav>
      </div>

      <div class="flex items-center gap-4 shrink-0">
        <!-- Language Switcher Component -->
        <LanguageSwitcher />
      </div>
    </div>
  </header>
</template>
