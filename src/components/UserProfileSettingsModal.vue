<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { authStore } from '../services/authStore'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'saved', 'logout'])
const { t } = useI18n()

const activeTab = ref('profile') // 'profile' | 'settings' | 'security'
const isSaving = ref(false)
const successNotice = ref('')
const errorNotice = ref('')

// Editable Profile Form
const profileForm = reactive({
  full_name_km: '',
  full_name_en: '',
  department_km: '',
  department_en: '',
  phone: '',
})

// Settings Form
const settingsForm = reactive({
  tableDensity: 'comfortable',
  instantNotifications: true,
  audioAlerts: true,
  autoScrollToCheck: true,
  defaultLanding: '/divisions',
})

// Password Security Form
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// Sync with authStore on open
watch(
  () => props.isOpen,
  (open) => {
    if (open && authStore.user) {
      profileForm.full_name_km = authStore.user.full_name_km || ''
      profileForm.full_name_en = authStore.user.full_name_en || ''
      profileForm.department_km = authStore.user.department_km || ''
      profileForm.department_en = authStore.user.department_en || ''
      profileForm.phone = authStore.user.phone || '023 888 999'

      const s = authStore.settings || {}
      settingsForm.tableDensity = s.tableDensity || 'comfortable'
      settingsForm.instantNotifications = s.instantNotifications ?? true
      settingsForm.audioAlerts = s.audioAlerts ?? true
      settingsForm.autoScrollToCheck = s.autoScrollToCheck ?? true
      settingsForm.defaultLanding = s.defaultLanding || '/divisions'

      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
      successNotice.value = ''
      errorNotice.value = ''
    }
  },
  { immediate: true }
)

const initials = computed(() => {
  const name = authStore.user?.full_name_en || authStore.user?.username || 'U'
  return name.slice(0, 2).toUpperCase()
})

async function handleSaveProfile() {
  errorNotice.value = ''
  successNotice.value = ''
  isSaving.value = true

  try {
    // 1. If password was provided, validate matching
    if (passwordForm.newPassword) {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error('ពាក្យសម្ងាត់ថ្មីមិនត្រូវគ្នាទេ (New passwords do not match).')
      }
      if (!passwordForm.currentPassword) {
        throw new Error('សូមបញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្នដើម្បីផ្ទៀងផ្ទាត់ (Enter current password).')
      }
    }

    // 2. Update profile on backend and store
    await authStore.updateProfile({
      full_name_km: profileForm.full_name_km,
      full_name_en: profileForm.full_name_en,
      department_km: profileForm.department_km,
      department_en: profileForm.department_en,
      current_password: passwordForm.currentPassword || null,
      new_password: passwordForm.newPassword || null,
    })

    // 3. Update settings locally
    authStore.updateSettings({ ...settingsForm })

    successNotice.value = 'ព័ត៌មានគណនី និងការកំណត់ត្រូវបានរក្សាទុកដោយជោគជ័យ!'
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''

    emit('saved')
    setTimeout(() => {
      emit('close')
    }, 1200)
  } catch (err) {
    errorNotice.value = err.message || 'បរាជ័យក្នុងការរក្សាទុកទិន្នន័យ។'
  } finally {
    isSaving.value = false
  }
}

function handleLogout() {
  emit('logout')
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 transition-all"
    @click.self="emit('close')"
  >
    <div
      class="bg-white border border-slate-200/90 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
      role="dialog"
      aria-modal="true"
    >
      <!-- Modal Top Header with Avatar -->
      <div class="px-6 py-5 bg-slate-50/80 border-b border-slate-100 flex items-start justify-between">
        <div class="flex items-center gap-4">
          <!-- Circular Profile Avatar -->
          <div
            :class="[
              'w-14 h-14 rounded-full flex items-center justify-center font-black text-white text-base shadow-sm ring-4',
              authStore.isAdmin
                ? 'bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 ring-amber-100'
                : 'bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 ring-blue-100'
            ]"
          >
            <span>{{ authStore.isAdmin ? '👑' : initials }}</span>
          </div>

          <!-- User Details -->
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <h3 class="text-base font-bold text-slate-900 leading-tight">
                {{ authStore.user?.full_name_km || authStore.user?.username }}
              </h3>
              <span
                :class="[
                  'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                  authStore.isAdmin
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                ]"
              >
                {{ authStore.isAdmin ? 'Administrator' : 'Civil Officer' }}
              </span>
            </div>
            <div class="text-xs text-slate-500 font-medium">
              {{ authStore.user?.full_name_en }} • <span class="font-mono text-slate-400">@{{ authStore.user?.username }}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          @click="emit('close')"
          class="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Tab Navigation -->
      <div class="px-6 pt-3 pb-0 border-b border-slate-200/80 bg-white flex items-center gap-6 text-xs font-semibold">
        <button
          type="button"
          @click="activeTab = 'profile'"
          :class="[
            'pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5',
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          ]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>ព័ត៌មានគណនី (Profile)</span>
        </button>

        <button
          type="button"
          @click="activeTab = 'settings'"
          :class="[
            'pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5',
            activeTab === 'settings'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          ]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>ការកំណត់ប្រព័ន្ធ (Settings)</span>
        </button>

        <button
          type="button"
          @click="activeTab = 'security'"
          :class="[
            'pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5',
            activeTab === 'security'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          ]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>សុវត្ថិភាព (Security)</span>
        </button>
      </div>

      <!-- Feedback Alerts -->
      <div v-if="successNotice" class="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
        <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>{{ successNotice }}</span>
      </div>

      <div v-if="errorNotice" class="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
        <svg class="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>{{ errorNotice }}</span>
      </div>

      <!-- Modal Body Content -->
      <form @submit.prevent="handleSaveProfile" class="p-6 space-y-4 text-xs overflow-y-auto max-h-[60vh]">
        
        <!-- ============================================================ -->
        <!-- TAB 1: PROFILE INFORMATION EDITING                          -->
        <!-- ============================================================ -->
        <template v-if="activeTab === 'profile'">
          <!-- Full Name Khmer -->
          <div class="space-y-1.5">
            <label class="block font-semibold text-slate-700">
              ឈ្មោះពេញជាភាសាខ្មែរ (Full Name in Khmer) <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="profileForm.full_name_km"
              type="text"
              required
              placeholder="បញ្ចូលឈ្មោះជាភាសាខ្មែរ"
              class="w-full h-11 min-h-[44px] px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          <!-- Full Name Latin -->
          <div class="space-y-1.5">
            <label class="block font-semibold text-slate-700">
              ឈ្មោះជាអក្សរឡាតាំង (Full Name in Latin) <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="profileForm.full_name_en"
              type="text"
              required
              placeholder="e.g. Sok Piseth"
              class="w-full h-11 min-h-[44px] px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          <!-- Bureau / Department Khmer -->
          <div class="space-y-1.5">
            <label class="block font-semibold text-slate-700">
              ការិយាល័យ ឬអង្គភាព (Department in Khmer)
            </label>
            <input
              v-model="profileForm.department_km"
              type="text"
              placeholder="e.g. ការិយាល័យអត្រានុកូលដ្ឋាន និងអត្តសញ្ញាណប័ណ្ណ"
              class="w-full h-11 min-h-[44px] px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          <!-- Bureau / Department Latin -->
          <div class="space-y-1.5">
            <label class="block font-semibold text-slate-700">
              អង្គភាពជាអក្សរឡាតាំង (Department in Latin)
            </label>
            <input
              v-model="profileForm.department_en"
              type="text"
              placeholder="e.g. Civil Registration Bureau"
              class="w-full h-11 min-h-[44px] px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>
        </template>

        <!-- ============================================================ -->
        <!-- TAB 2: SYSTEM PREFERENCES & SETTINGS                         -->
        <!-- ============================================================ -->
        <template v-if="activeTab === 'settings'">
          <!-- Table Density -->
          <div class="space-y-2 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
            <label class="block font-bold text-slate-800">
              គម្លាតទិន្នន័យតារាង (Table Display Density)
            </label>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                @click="settingsForm.tableDensity = 'comfortable'"
                :class="[
                  'h-10 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all',
                  settingsForm.tableDensity === 'comfortable'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                ]"
              >
                <span>ផាសុកភាព (Comfortable)</span>
              </button>
              <button
                type="button"
                @click="settingsForm.tableDensity = 'compact'"
                :class="[
                  'h-10 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all',
                  settingsForm.tableDensity === 'compact'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                ]"
              >
                <span>បង្រួមតូច (Compact)</span>
              </button>
            </div>
          </div>

          <!-- Feature Toggles -->
          <div class="space-y-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
            <label class="block font-bold text-slate-800">
              ការជូនដំណឹង និងប្រតិបត្តិការ (Notifications & Automation)
            </label>

            <!-- Toggle 1: Instant Notifications -->
            <label class="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 cursor-pointer">
              <span class="text-slate-700 font-medium">ទទួលដំណឹងភ្លាមៗលើរបាយការណ៍កំហុសថ្មី</span>
              <input
                type="checkbox"
                v-model="settingsForm.instantNotifications"
                class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </label>

            <!-- Toggle 2: Auto Scroll to target -->
            <label class="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 cursor-pointer">
              <span class="text-slate-700 font-medium">រំកិលស្វ័យប្រវត្តិទៅកាន់ទីតាំងដែលរាយការណ៍ (Auto-Scroll)</span>
              <input
                type="checkbox"
                v-model="settingsForm.autoScrollToCheck"
                class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </label>

            <!-- Toggle 3: Audio Alerts -->
            <label class="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 cursor-pointer">
              <span class="text-slate-700 font-medium">សំឡេងបញ្ជាក់នៅពេលបញ្ចប់ប្រតិបត្តិការ (Audio Cues)</span>
              <input
                type="checkbox"
                v-model="settingsForm.audioAlerts"
                class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </label>
          </div>
        </template>

        <!-- ============================================================ -->
        <!-- TAB 3: SECURITY & PASSWORD CHANGE                            -->
        <!-- ============================================================ -->
        <template v-if="activeTab === 'security'">
          <div class="space-y-3">
            <div class="space-y-1.5">
              <label class="block font-semibold text-slate-700">ពាក្យសម្ងាត់បច្ចុប្បន្ន (Current Password)</label>
              <input
                v-model="passwordForm.currentPassword"
                type="password"
                placeholder="បញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្ន"
                class="w-full h-11 min-h-[44px] px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block font-semibold text-slate-700">ពាក្យសម្ងាត់ថ្មី (New Password)</label>
              <input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មី"
                class="w-full h-11 min-h-[44px] px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block font-semibold text-slate-700">បញ្ជាក់ពាក្យសម្ងាត់ថ្មី (Confirm Password)</label>
              <input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មីម្តងទៀត"
                class="w-full h-11 min-h-[44px] px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>
        </template>

        <!-- Modal Footer Actions -->
        <div class="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <!-- Logout Button -->
          <button
            type="button"
            @click="handleLogout"
            class="h-10 px-3.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium text-xs flex items-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>ចាកចេញ (Sign Out)</span>
          </button>

          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="emit('close')"
              class="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              បោះបង់
            </button>

            <button
              type="submit"
              :disabled="isSaving"
              class="h-10 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-sm flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60"
            >
              <svg v-if="isSaving" class="animate-spin w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ isSaving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកការកែប្រែ' }}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
