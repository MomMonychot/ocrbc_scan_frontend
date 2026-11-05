<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  buttonText: {
    type: String,
    default: 'Actions'
  },
  buttonClass: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'primary', // 'primary' | 'secondary' | 'ghost'
    validator: (v) => ['primary', 'secondary', 'ghost'].includes(v)
  },
  align: {
    type: String,
    default: 'right', // 'left' | 'right'
    validator: (v) => ['left', 'right'].includes(v)
  },
  menuWidth: {
    type: String,
    default: 'w-72'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const isOpen = ref(false)
const menuRef = ref(null)

function toggle() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

function handleClickOutside(event) {
  if (menuRef.value && !menuRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

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

defineExpose({
  close,
  isOpen
})
</script>

<template>
  <div class="relative inline-block text-left" ref="menuRef">
    <!-- Trigger Button -->
    <slot name="trigger" :isOpen="isOpen" :toggle="toggle">
      <button
        type="button"
        @click="toggle"
        :disabled="disabled"
        :class="[
          'h-11 min-h-[44px] px-5 flex items-center justify-center gap-2 text-sm font-medium tracking-wide transition-all duration-200 rounded-xl outline-none select-none',
          'cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600',
          variant === 'primary'
            ? 'bg-[#1E3A8A] hover:bg-blue-950 text-white shadow-sm hover:shadow-md'
            : variant === 'secondary'
              ? 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
          buttonClass
        ]"
        aria-haspopup="true"
        :aria-expanded="isOpen"
      >
        <slot name="icon"></slot>
        <span>{{ buttonText }}</span>
        <svg
          :class="['w-4 h-4 transition-transform duration-200 opacity-80 shrink-0', isOpen ? 'rotate-180' : '']"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </slot>

    <!-- Floating Dropdown Menu Panel -->
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
        :class="[
          'absolute mt-2 rounded-2xl bg-white border border-slate-200/90 shadow-xl p-2 z-50 space-y-1',
          align === 'right' ? 'right-0' : 'left-0',
          menuWidth
        ]"
      >
        <slot :close="close"></slot>
      </div>
    </transition>
  </div>
</template>
