<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { authStore } from '../services/authStore'

const { t } = useI18n()
const router = useRouter()

const isOpen = ref(false)
const dropdownRef = ref(null)
const isUpdating = ref({})

function toggleDropdown() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    authStore.refreshReports()
  }
}

function closeDropdown() {
  isOpen.value = false
}

function handleDocumentClick(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

function handleKeyDown(event) {
  if (event.key === 'Escape') {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleKeyDown)
  // Fetch initial reports if admin
  if (authStore.isAdmin) {
    authStore.refreshReports()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleKeyDown)
})

async function markAsRead(report) {
  isUpdating.value[report.id] = true
  try {
    await authStore.markReportRead(report.id)
  } catch (err) {
    console.error('Failed to mark report as read:', err)
  } finally {
    isUpdating.value[report.id] = false
  }
}

function goToCheck(report) {
  closeDropdown()
  // Mark as read when navigating to check it
  if (report.status === 'pending') {
    authStore.markReportRead(report.id).catch(() => {})
  }
  // Navigate to Administrative Divisions with deep-link query
  router.push({
    path: '/divisions',
    query: {
      code: report.division_code,
      highlight: 'true',
      repId: report.id,
    },
  })
}
</script>

<template>
  <div class="relative" ref="dropdownRef">
    <!-- Notification Bell Trigger Button -->
    <button
      type="button"
      @click="toggleDropdown"
      class="relative h-10 w-10 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center transition-all active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
      :aria-expanded="isOpen"
      title="ការជូនដំណឹងពីរបាយការណ៍រដ្ឋបាល"
    >
      <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>

      <!-- Unread Count Badge -->
      <span
        v-if="authStore.unreadReportsCount > 0"
        class="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow-xs animate-pulse"
      >
        {{ authStore.unreadReportsCount > 9 ? '9+' : authStore.unreadReportsCount }}
      </span>
    </button>

    <!-- Dropdown Panel -->
    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="transform scale-95 opacity-0 -translate-y-1"
      enter-to-class="transform scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform scale-100 opacity-100 translate-y-0"
      leave-to-class="transform scale-95 opacity-0 -translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-[380px] sm:w-[440px] rounded-2xl bg-white shadow-2xl border border-slate-200/90 overflow-hidden z-50 text-xs flex flex-col"
      >
        <!-- Panel Header -->
        <div class="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-900 text-sm">{{ t('notifications.reports_title') }}</span>
            <span
              v-if="authStore.unreadReportsCount > 0"
              class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 border border-rose-200 text-rose-700"
            >
              {{ authStore.unreadReportsCount }} {{ t('notifications.unread_badge') }}
            </span>
          </div>

          <button
            type="button"
            @click="authStore.refreshReports()"
            class="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="ធ្វើបច្ចុប្បន្នភាព"
          >
            <svg
              :class="['w-4 h-4', authStore.isLoadingReports ? 'animate-spin' : '']"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        <!-- Notification List -->
        <div class="max-h-[380px] overflow-y-auto divide-y divide-slate-100 p-2 space-y-2">
          <!-- Empty State -->
          <div v-if="!authStore.reports.length" class="py-10 text-center space-y-2 text-slate-400">
            <svg class="w-10 h-10 mx-auto text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="font-medium text-slate-500">{{ t('notifications.no_reports') }}</p>
          </div>

          <!-- Report Cards -->
          <div
            v-for="rep in authStore.reports"
            :key="rep.id"
            :class="[
              'rounded-xl p-3 transition-all border',
              rep.status === 'pending'
                ? 'bg-blue-50/30 border-blue-200/80 shadow-2xs'
                : 'bg-white border-slate-100 opacity-80 hover:opacity-100'
            ]"
          >
            <!-- Card Top: Hierarchy, Badge & Code -->
            <div class="flex items-center justify-between gap-2 mb-1.5">
              <div class="flex items-center gap-1.5 min-w-0">
                <span
                  class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase shrink-0"
                  :class="rep.status === 'pending' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'"
                >
                  {{ rep.status === 'pending' ? t('notifications.status_pending') : t('notifications.status_read') }}
                </span>
                <span class="text-[10px] font-mono text-slate-400 shrink-0">#{{ rep.division_code }}</span>
              </div>
              <span class="text-[10px] text-slate-400 shrink-0">{{ rep.division_level }}</span>
            </div>

            <!-- Target Division Name & Hierarchy -->
            <div class="space-y-0.5 mb-2">
              <div class="flex items-baseline gap-2">
                <span class="font-bold text-slate-900 text-sm">{{ rep.current_name_km }}</span>
                <span class="text-[11px] text-slate-500">({{ rep.current_name_en }})</span>
              </div>
              <div v-if="rep.parent_hierarchy_km" class="text-[11px] text-slate-500 truncate flex items-center gap-1">
                <svg class="w-3 h-3 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span class="truncate">{{ rep.parent_hierarchy_km }}</span>
              </div>
            </div>

            <!-- Suggested Fix -->
            <div v-if="rep.suggested_name_km" class="rounded-lg bg-emerald-50/70 border border-emerald-100 p-2 mb-2">
              <div class="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                {{ t('notifications.suggested_fix') }}:
              </div>
              <div class="text-xs font-bold text-emerald-900 mt-0.5">
                "{{ rep.suggested_name_km }}"
                <span v-if="rep.suggested_name_en" class="text-emerald-700 font-normal">({{ rep.suggested_name_en }})</span>
              </div>
            </div>

            <!-- Notes -->
            <p v-if="rep.notes" class="text-[11px] text-slate-600 italic bg-white/60 p-2 rounded-lg border border-slate-100 mb-2 leading-relaxed">
              "{{ rep.notes }}"
            </p>

            <!-- Two Action Choices (Mark Read & Go To Check) -->
            <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <!-- Choice 1: Mark as Read (សញ្ញាសម្គាល់ថាបានអាន) -->
              <button
                type="button"
                v-if="rep.status === 'pending'"
                @click="markAsRead(rep)"
                :disabled="isUpdating[rep.id]"
                class="h-8 px-3 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-medium flex items-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
                title="សម្គាល់ថាបានអាន"
              >
                <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ t('notifications.action_mark_read') }}</span>
              </button>

              <!-- Choice 2: Go to Check (ទៅពិនិត្យមើល) -->
              <button
                type="button"
                @click="goToCheck(rep)"
                class="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium flex items-center gap-1.5 transition-all active:scale-[0.98] shadow-2xs cursor-pointer"
                title="ទៅកាន់ទីតាំងដែលរាយការណ៍ក្នុងតារាងភូមិសាស្ត្រ"
              >
                <span>{{ t('notifications.action_go_to_check') }}</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
