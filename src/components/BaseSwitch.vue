<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

function toggle() {
  if (props.disabled) return
  const next = !props.modelValue
  emit('update:modelValue', next)
  emit('change', next)
}
</script>

<template>
  <div
    class="flex items-center justify-between gap-4 p-3 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all cursor-pointer group select-none shadow-2xs"
    @click="toggle"
  >
    <div class="flex flex-col space-y-0.5">
      <span class="text-xs font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
        {{ label }}
      </span>
      <span v-if="description" class="text-[11px] text-slate-500 font-normal leading-relaxed">
        {{ description }}
      </span>
    </div>

    <!-- Senior Standard Switch Button (Pill Track + Smooth Gliding Thumb) -->
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :disabled="disabled"
      @click.stop="toggle"
      :class="[
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
        modelValue ? 'bg-blue-600' : 'bg-slate-200 hover:bg-slate-300'
      ]"
    >
      <span class="sr-only">{{ label }}</span>
      <span
        :class="[
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
          modelValue ? 'translate-x-5' : 'translate-x-0'
        ]"
      />
    </button>
  </div>
</template>
