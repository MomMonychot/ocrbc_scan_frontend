<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from './LanguageSwitcher.vue'
import AdminNotificationDropdown from './AdminNotificationDropdown.vue'
import { authStore } from '../services/authStore'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

// Hidden on first open
const isAboutMenuOpen = ref(false)
const isMobileMenuOpen = ref(false)
const dropdownRef = ref(null)

function toggleAboutMenu() {
  isAboutMenuOpen.value = !isAboutMenuOpen.value
}

function closeMenus() {
  isAboutMenuOpen.value = false
  isMobileMenuOpen.value = false
}

function handleLogout() {
  authStore.logout()
  closeMenus()
  router.push('/login')
}

function handleDocumentClick(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isAboutMenuOpen.value = false
  }
}

function handleKeyDown(event) {
  if (event.key === 'Escape') {
    closeMenus()
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <header class="bg-white border-b border-gov-border sticky top-0 z-40 shadow-gov-sm">
    <!-- Main Navigation Bar with Fixed Height to Prevent Vertical Shifts -->
    <div class="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center gap-6 min-w-0">
        <router-link to="/" class="flex items-center gap-3 group shrink-0" @click="closeMenus">
          <!-- Official District Portal Seal / Icon -->
          <div class="w-10 h-10 rounded-xl bg-gov-primary flex items-center justify-center text-white shadow-sm ring-2 ring-blue-100 group-hover:scale-105 transition-transform shrink-0">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 class="text-base sm:text-lg lg:text-xl font-black text-gov-primary tracking-tight leading-tight whitespace-nowrap">
              {{ t('header.project_name') }}
            </h1>
          </div>
        </router-link>

        <!-- Navigation Links with Fixed Heights (Desktop) -->
        <nav class="hidden lg:flex items-center gap-1.5 pl-4 border-l border-slate-200 text-xs font-semibold shrink-0">
          <router-link
            to="/"
            active-class="bg-blue-50 text-gov-primary font-bold shadow-2xs"
            class="h-10 px-3.5 rounded-xl text-slate-600 hover:text-gov-primary hover:bg-slate-50 transition-colors inline-flex items-center justify-center whitespace-nowrap active:scale-[0.98]"
            @click="closeMenus"
          >
            {{ t('nav.home') }}
          </router-link>

          <router-link
            to="/dashboard"
            active-class="bg-blue-50 text-gov-primary font-bold shadow-2xs"
            class="h-10 px-3.5 rounded-xl text-slate-600 hover:text-gov-primary hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-[0.98]"
            @click="closeMenus"
          >
            <span>{{ t('nav.dashboard') }}</span>
          </router-link>

          <router-link
            to="/verify"
            active-class="bg-blue-50 text-gov-primary font-bold shadow-2xs"
            class="h-10 px-3.5 rounded-xl text-slate-600 hover:text-gov-primary hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-[0.98]"
            @click="closeMenus"
          >
            <span>{{ t('nav.verify') }}</span>
            <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
          </router-link>

          <router-link
            to="/templates"
            active-class="bg-blue-50 text-gov-primary font-bold shadow-2xs"
            class="h-10 px-3.5 rounded-xl text-slate-600 hover:text-gov-primary hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-[0.98]"
            @click="closeMenus"
          >
            <span>{{ t('nav.templates') }}</span>
          </router-link>

          <router-link
            to="/divisions"
            active-class="bg-blue-50 text-gov-primary font-bold shadow-2xs"
            class="h-10 px-3.5 rounded-xl text-slate-600 hover:text-gov-primary hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-[0.98]"
            @click="closeMenus"
          >
            <span>{{ t('nav.divisions') }}</span>
          </router-link>

          <!-- About Us Dropdown Menu (Hidden on first open) -->
          <div class="relative" ref="dropdownRef">
            <button
              type="button"
              @click.stop="toggleAboutMenu"
              :class="[
                'h-10 px-3.5 rounded-xl transition-all duration-150 inline-flex items-center justify-center gap-1.5 whitespace-nowrap select-none outline-none cursor-pointer',
                'active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600',
                route.path === '/about' || isAboutMenuOpen
                  ? 'bg-blue-50 text-gov-primary font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-gov-primary hover:bg-slate-50'
              ]"
              aria-haspopup="true"
              :aria-expanded="isAboutMenuOpen"
            >
              <span>{{ t('nav.about') }}</span>
              <svg
                :class="['w-4 h-4 transition-transform duration-200 text-slate-400 shrink-0', isAboutMenuOpen ? 'rotate-180 text-gov-primary' : '']"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Dropdown Menu List -->
            <transition
              enter-active-class="transition duration-150 ease-out"
              enter-from-class="transform scale-95 opacity-0 -translate-y-1"
              enter-to-class="transform scale-100 opacity-100 translate-y-0"
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="transform scale-100 opacity-100 translate-y-0"
              leave-to-class="transform scale-95 opacity-0 -translate-y-1"
            >
              <div
                v-if="isAboutMenuOpen"
                class="absolute left-0 mt-2 w-72 rounded-2xl bg-white shadow-xl border border-slate-200/90 p-2 z-50 text-xs space-y-1"
              >
                <!-- 1. About Us (Overview) -->
                <router-link
                  to="/about?section=overview"
                  @click="closeMenus"
                  class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50/70 border border-transparent hover:border-blue-100/50 text-slate-700 hover:text-gov-primary transition-colors group"
                >
                  <div class="w-8 h-8 rounded-lg bg-blue-50 text-gov-primary group-hover:bg-gov-primary group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div class="font-bold text-slate-900 group-hover:text-gov-primary">{{ t('nav.about') }}</div>
                    <div class="text-[10px] text-slate-500 font-normal mt-0.5">{{ t('nav.subtitles.about') }}</div>
                  </div>
                </router-link>

                <div class="my-1 border-t border-slate-100"></div>

                <!-- 2. Goal -->
                <router-link
                  to="/about?section=goal"
                  @click="closeMenus"
                  class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-emerald-50/70 border border-transparent hover:border-emerald-100/50 text-slate-700 hover:text-emerald-800 transition-colors group"
                >
                  <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div class="font-bold text-slate-900 group-hover:text-emerald-800">{{ t('nav.goal') }}</div>
                    <div class="text-[10px] text-slate-500 font-normal mt-0.5">{{ t('nav.subtitles.goal') }}</div>
                  </div>
                </router-link>

                <!-- 3. Vision -->
                <router-link
                  to="/about?section=vision"
                  @click="closeMenus"
                  class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-indigo-50/70 border border-transparent hover:border-indigo-100/50 text-slate-700 hover:text-indigo-800 transition-colors group"
                >
                  <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <div class="font-bold text-slate-900 group-hover:text-indigo-800">{{ t('nav.vision') }}</div>
                    <div class="text-[10px] text-slate-500 font-normal mt-0.5">{{ t('nav.subtitles.vision') }}</div>
                  </div>
                </router-link>

                <!-- 4. Mission -->
                <router-link
                  to="/about?section=mission"
                  @click="closeMenus"
                  class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-amber-50/70 border border-transparent hover:border-amber-100/50 text-slate-700 hover:text-amber-800 transition-colors group"
                >
                  <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <div class="font-bold text-slate-900 group-hover:text-amber-800">{{ t('nav.mission') }}</div>
                    <div class="text-[10px] text-slate-500 font-normal mt-0.5">{{ t('nav.subtitles.mission') }}</div>
                  </div>
                </router-link>

                <!-- 5. Policies -->
                <router-link
                  to="/about?section=policies"
                  @click="closeMenus"
                  class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50/70 border border-transparent hover:border-blue-100/50 text-slate-700 hover:text-gov-primary transition-colors group"
                >
                  <div class="w-8 h-8 rounded-lg bg-blue-50 text-gov-primary group-hover:bg-gov-primary group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <div class="font-bold text-slate-900 group-hover:text-gov-primary">{{ t('nav.policies') }}</div>
                    <div class="text-[10px] text-slate-500 font-normal mt-0.5">{{ t('nav.subtitles.policies') }}</div>
                  </div>
                </router-link>

                <!-- 6. Rules -->
                <router-link
                  to="/about?section=rules"
                  @click="closeMenus"
                  class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-rose-50/70 border border-transparent hover:border-rose-100/50 text-slate-700 hover:text-rose-700 transition-colors group"
                >
                  <div class="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <div class="font-bold text-slate-900 group-hover:text-rose-700">{{ t('nav.rules') }}</div>
                    <div class="text-[10px] text-slate-500 font-normal mt-0.5">{{ t('nav.subtitles.rules') }}</div>
                  </div>
                </router-link>
              </div>
            </transition>
          </div>
        </nav>
      </div>

      <!-- Right Header Tools: Language Switcher, Notifications, User Profile & Mobile Menu Button -->
      <div class="flex items-center gap-2 sm:gap-3 shrink-0">
        <!-- Admin Notification Bell (Shown when admin is logged in) -->
        <AdminNotificationDropdown v-if="authStore.isAdmin" />

        <!-- Language Switcher Component -->
        <LanguageSwitcher />

        <!-- User Authentication & Profile Pill (Desktop) -->
        <div class="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
          <!-- Logged In State -->
          <div v-if="authStore.isAuthenticated" class="flex items-center gap-2">
            <div
              :class="[
                'h-10 px-3 rounded-xl border flex items-center gap-2 text-xs font-semibold select-none',
                authStore.isAdmin
                  ? 'bg-amber-50/70 border-amber-200/80 text-amber-900'
                  : 'bg-blue-50/70 border-blue-200/80 text-blue-900'
              ]"
            >
              <span class="text-sm">{{ authStore.isAdmin ? '👑' : '👤' }}</span>
              <div class="text-left leading-tight hidden md:block">
                <div class="font-bold text-[11px] truncate max-w-[120px]">{{ authStore.user?.full_name_km || authStore.user?.username }}</div>
                <div class="text-[9px] text-slate-500 uppercase tracking-wider">{{ authStore.isAdmin ? t('auth.role_admin') : t('auth.role_user') }}</div>
              </div>
            </div>

            <!-- Logout Button -->
            <button
              type="button"
              @click="handleLogout"
              class="h-10 px-3 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-600 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
              :title="t('auth.logout')"
            >
              <svg class="w-4 h-4 text-slate-400 group-hover:text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span class="hidden lg:inline">{{ t('auth.logout') }}</span>
            </button>
          </div>

          <!-- Unauthenticated Sign In Button -->
          <router-link
            v-else
            to="/login"
            class="h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1.5 shadow-2xs active:scale-[0.98] transition-all"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span>{{ t('auth.login_btn') }}</span>
          </router-link>
        </div>

        <!-- Mobile Menu Toggle Button (Visible only on mobile/tablet) -->
        <button
          type="button"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="lg:hidden w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors"
          aria-label="Toggle navigation menu"
        >
          <svg v-if="!isMobileMenuOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Drawer Menu (Hidden by default, shows on hamburger toggle) -->
    <div
      v-if="isMobileMenuOpen"
      class="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg"
    >
      <router-link
        to="/"
        @click="closeMenus"
        class="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50"
      >
        {{ t('nav.home') }}
      </router-link>

      <router-link
        to="/dashboard"
        @click="closeMenus"
        class="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50"
      >
        {{ t('nav.dashboard') }}
      </router-link>

      <router-link
        to="/verify"
        @click="closeMenus"
        class="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50 flex items-center justify-between"
      >
        <span>{{ t('nav.verify') }}</span>
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
      </router-link>

      <router-link
        to="/templates"
        @click="closeMenus"
        class="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50"
      >
        {{ t('nav.templates') }}
      </router-link>

      <router-link
        to="/divisions"
        @click="closeMenus"
        class="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50"
      >
        {{ t('nav.divisions') }}
      </router-link>

      <div class="pt-2 border-t border-slate-100">
        <div class="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          {{ t('nav.about') }}
        </div>
        <router-link
          to="/about?section=overview"
          @click="closeMenus"
          class="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {{ t('nav.about') }}
        </router-link>
        <router-link
          to="/about?section=goal"
          @click="closeMenus"
          class="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {{ t('nav.goal') }}
        </router-link>
        <router-link
          to="/about?section=vision"
          @click="closeMenus"
          class="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {{ t('nav.vision') }}
        </router-link>
        <router-link
          to="/about?section=mission"
          @click="closeMenus"
          class="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {{ t('nav.mission') }}
        </router-link>
        <router-link
          to="/about?section=policies"
          @click="closeMenus"
          class="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {{ t('nav.policies') }}
        </router-link>
        <router-link
          to="/about?section=rules"
          @click="closeMenus"
          class="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {{ t('nav.rules') }}
        </router-link>
      </div>

      <!-- Mobile User Session -->
      <div class="pt-3 border-t border-slate-100 flex items-center justify-between px-3">
        <div v-if="authStore.isAuthenticated" class="flex items-center gap-2">
          <span class="text-sm">{{ authStore.isAdmin ? '👑' : '👤' }}</span>
          <span class="font-bold text-xs text-slate-800">{{ authStore.user?.full_name_km || authStore.user?.username }}</span>
        </div>
        <button
          v-if="authStore.isAuthenticated"
          type="button"
          @click="handleLogout"
          class="text-xs font-semibold text-rose-600 hover:text-rose-700"
        >
          {{ t('auth.logout') }}
        </button>
        <router-link
          v-else
          to="/login"
          @click="closeMenus"
          class="w-full text-center py-2.5 rounded-xl bg-slate-900 text-white text-xs font-medium"
        >
          {{ t('auth.login_btn') }}
        </router-link>
      </div>
    </div>
  </header>
</template>
