<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, null],
    default: ''
  },
  options: {
    type: Array,
    default: () => []
    // Each option can be { value, label, sublabel?, badge?, icon? } or raw string/number
  },
  placeholder: {
    type: String,
    default: 'Select option...'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  searchable: {
    type: Boolean,
    default: false
  },
  searchPlaceholder: {
    type: String,
    default: 'Search...'
  },
  size: {
    type: String,
    default: 'default', // 'default' (h-11, 44px) | 'compact' (h-10, 40px)
    validator: (v) => ['default', 'compact'].includes(v)
  },
  prefixIcon: {
    type: String,
    default: '' // 'map-pin', 'folder', 'type', 'hash', 'building', 'layers'
  },
  clearable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const searchQuery = ref('')
const dropdownRef = ref(null)
const searchInputRef = ref(null)

// Normalize options to { value, label, sublabel?, badge? }
const normalizedOptions = computed(() => {
  return props.options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value !== undefined ? opt.value : opt.code || opt.id || opt.key,
        label: opt.label || opt.name_km || opt.name || opt.nameEn || String(opt.value),
        sublabel: opt.sublabel || opt.name_en || opt.descKm || '',
        badge: opt.badge || '',
        icon: opt.icon || ''
      }
    }
    return {
      value: opt,
      label: String(opt),
      sublabel: '',
      badge: '',
      icon: ''
    }
  })
})

// Filtered options based on search query
const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value.trim()) {
    return normalizedOptions.value
  }
  const q = searchQuery.value.toLowerCase().trim()
  return normalizedOptions.value.filter((opt) => {
    return (
      opt.label.toLowerCase().includes(q) ||
      (opt.sublabel && opt.sublabel.toLowerCase().includes(q)) ||
      String(opt.value).toLowerCase().includes(q)
    )
  })
})

// Current selected option object
const selectedOption = computed(() => {
  return normalizedOptions.value.find((opt) => opt.value === props.modelValue) || null
})

// Toggle dropdown
function toggleDropdown() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
    if (props.searchable) {
      nextTick(() => {
        searchInputRef.value?.focus()
      })
    }
  }
}

// Select an option
function selectOption(opt) {
  emit('update:modelValue', opt.value)
  emit('change', opt.value)
  isOpen.value = false
  searchQuery.value = ''
}

// Clear selected option
function clearSelection(e) {
  e.stopPropagation()
  emit('update:modelValue', '')
  emit('change', '')
}

// Handle click outside
function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

// Handle keyboard escape
function handleKeyDown(event) {
  if (event.key === 'Escape' && isOpen.value) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeyDown)
})

// Auto-close on disabled change
watch(
  () => props.disabled,
  (val) => {
    if (val) isOpen.value = false
  }
)
</script>

<template>
  <div class="relative w-full text-left" ref="dropdownRef">
    <!-- Trigger Button -->
    <button
      type="button"
      @click="toggleDropdown"
      :disabled="disabled"
      :class="[
        'w-full flex items-center justify-between gap-2.5 transition-all duration-200 select-none outline-none',
        'border font-medium text-left',
        size === 'compact'
          ? 'h-10 min-h-[40px] px-3.5 rounded-xl text-xs sm:text-sm'
          : 'h-11 min-h-[44px] px-4 rounded-xl text-sm',
        disabled
          ? 'bg-slate-100/80 border-slate-200 text-slate-400 cursor-not-allowed'
          : isOpen
            ? 'bg-white border-[#1E3A8A] ring-2 ring-[#1E3A8A]/20 shadow-sm text-slate-900 cursor-pointer'
            : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50 text-slate-800 shadow-xs cursor-pointer active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#1E3A8A]'
      ]"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
    >
      <!-- Prefix Icon & Selected Label -->
      <div class="flex items-center gap-2.5 min-w-0 flex-1 truncate">
        <!-- Optional Prefix Icon Slot or Prop -->
        <span v-if="$slots.prefix" class="shrink-0 text-slate-400">
          <slot name="prefix"></slot>
        </span>
        <span v-else-if="prefixIcon === 'map-pin'" class="w-4 h-4 text-[#1E3A8A] shrink-0">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </span>
        <span v-else-if="prefixIcon === 'building'" class="w-4 h-4 text-[#1E3A8A] shrink-0">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </span>
        <span v-else-if="prefixIcon === 'home'" class="w-4 h-4 text-[#1E3A8A] shrink-0">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </span>
        <span v-else-if="prefixIcon === 'type'" class="w-4 h-4 text-[#1E3A8A] shrink-0">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </span>
        <span v-else-if="prefixIcon === 'layers'" class="w-4 h-4 text-[#1E3A8A] shrink-0">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </span>

        <!-- Display Text -->
        <span v-if="selectedOption" class="truncate font-semibold text-slate-900">
          {{ selectedOption.label }}
          <span v-if="selectedOption.sublabel" class="font-normal text-slate-500 ml-1.5 text-xs">
            ({{ selectedOption.sublabel }})
          </span>
        </span>
        <span v-else class="text-slate-400 font-normal truncate">
          {{ placeholder }}
        </span>
      </div>

      <!-- Right Action Icons (Clear / Chevron) -->
      <div class="flex items-center gap-1 shrink-0 ml-1">
        <!-- Clear button if clearable and has value -->
        <button
          v-if="clearable && selectedOption && !disabled"
          type="button"
          @click="clearSelection"
          class="p-0.5 rounded-md hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition-colors"
          title="Clear"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Standard Chevron Icon with 180deg flip -->
        <svg
          :class="[
            'w-4 h-4 transition-transform duration-200 shrink-0',
            disabled ? 'text-slate-300' : isOpen ? 'rotate-180 text-[#1E3A8A]' : 'text-slate-400'
          ]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>

    <!-- Floating Options Popover Panel -->
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
        class="absolute left-0 mt-2 w-full min-w-[220px] rounded-2xl bg-white border border-slate-200/90 shadow-xl p-1.5 z-50 overflow-hidden"
      >
        <!-- Search Input Bar (if searchable) -->
        <div v-if="searchable" class="p-1.5 border-b border-slate-100 mb-1">
          <div class="relative flex items-center">
            <svg class="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              :placeholder="searchPlaceholder"
              class="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
            />
          </div>
        </div>

        <!-- Options List -->
        <ul class="max-h-64 overflow-y-auto space-y-0.5 divide-y divide-transparent text-xs sm:text-sm select-none" role="listbox">
          <li
            v-for="opt in filteredOptions"
            :key="opt.value"
            @click="selectOption(opt)"
            :class="[
              'px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-colors duration-150',
              opt.value === modelValue
                ? 'bg-blue-50/80 text-[#1E3A8A] font-bold'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
            ]"
            role="option"
            :aria-selected="opt.value === modelValue"
          >
            <div class="min-w-0 flex-1 truncate">
              <div class="truncate flex items-center gap-1.5">
                <span>{{ opt.label }}</span>
                <span v-if="opt.badge" class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-[#1E3A8A]">
                  {{ opt.badge }}
                </span>
              </div>
              <div v-if="opt.sublabel" class="text-[11px] text-slate-500 font-normal truncate mt-0.5">
                {{ opt.sublabel }}
              </div>
            </div>

            <!-- Active Checkmark Indicator -->
            <svg
              v-if="opt.value === modelValue"
              class="w-4 h-4 text-[#1E3A8A] shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </li>

          <!-- Empty State -->
          <li v-if="filteredOptions.length === 0" class="px-4 py-6 text-center text-xs text-slate-400">
            No matching options found
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>
