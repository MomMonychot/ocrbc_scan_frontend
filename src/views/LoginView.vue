<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { authStore } from '../services/authStore'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const username = ref('admin')
const password = ref('admin123')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  errorMessage.value = ''
  if (!username.value || !password.value) {
    errorMessage.value = t('auth.invalid_credentials')
    return
  }

  isLoading.value = true
  try {
    await authStore.login(username.value, password.value)
    const redirectPath = route.query.redirect || '/divisions'
    router.push(redirectPath)
  } catch (err) {
    errorMessage.value = err.message || t('auth.invalid_credentials')
  } finally {
    isLoading.value = false
  }
}

function fillCredentials(user, pass) {
  username.value = user
  password.value = pass
  errorMessage.value = ''
  handleLogin()
}
</script>

<template>
  <div class="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center p-4 sm:p-6">
    <div class="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      <!-- Portal Emblem & Title -->
      <div class="text-center space-y-2">
        <div class="w-14 h-14 rounded-2xl bg-blue-900 text-white flex items-center justify-center shadow-sm mx-auto ring-4 ring-blue-50">
          <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 class="text-xl font-black text-slate-900 tracking-tight">
          {{ t('auth.login_title') }}
        </h2>
        <p class="text-xs text-slate-500 font-normal leading-relaxed">
          {{ t('auth.login_subtitle') }}
        </p>
      </div>

      <!-- Error Alert -->
      <div
        v-if="errorMessage"
        class="rounded-xl p-3 bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2.5 transition-all"
        role="alert"
      >
        <svg class="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <!-- Username Field -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
            {{ t('auth.username_label') }}
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              v-model="username"
              type="text"
              required
              :placeholder="t('auth.username_placeholder')"
              class="w-full h-11 min-h-[44px] pl-10 pr-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>
        </div>

        <!-- Password Field -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
            {{ t('auth.password_label') }}
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              :placeholder="t('auth.password_placeholder')"
              class="w-full h-11 min-h-[44px] pl-10 pr-10 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
              <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full h-11 min-h-[44px] px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium tracking-wide shadow-sm hover:shadow-md active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 outline-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-2"
        >
          <svg v-if="isLoading" class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ isLoading ? t('auth.logging_in') : t('auth.login_btn') }}</span>
          <svg v-if="!isLoading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </form>

      <!-- Quick One-Click Demo Credentials (Fast Evaluation) -->
      <div class="pt-4 border-t border-slate-100 space-y-3">
        <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
          {{ t('auth.quick_demo') }}
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <!-- Admin Button -->
          <button
            type="button"
            @click="fillCredentials('admin', 'admin123')"
            class="h-11 min-h-[44px] px-3 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-slate-800 text-xs font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <span class="text-sm">👑</span>
            <div class="text-left leading-tight">
              <div class="font-bold text-blue-900">Admin</div>
              <div class="text-[10px] text-blue-700">admin / admin123</div>
            </div>
          </button>

          <!-- User Button -->
          <button
            type="button"
            @click="fillCredentials('user', 'user123')"
            class="h-11 min-h-[44px] px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <span class="text-sm">👤</span>
            <div class="text-left leading-tight">
              <div class="font-bold text-slate-900">User / Officer</div>
              <div class="text-[10px] text-slate-600">user / user123</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
