import { createI18n } from 'vue-i18n'
import en from '../locales/en.json'
import km from '../locales/km.json'

// Retrieve persisted language or default to Khmer ('km')
const savedLanguage = localStorage.getItem('gov_ocr_language') || 'km'

// Synchronize root html lang attribute for correct font-family rendering
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('lang', savedLanguage)
}

const i18n = createI18n({
  legacy: false, // Use Vue 3 Composition API mode
  locale: savedLanguage,
  fallbackLocale: 'en',
  messages: {
    en,
    km,
  },
})

export function setApplicationLanguage(lang) {
  if (i18n.global.locale) {
    i18n.global.locale.value = lang
    localStorage.setItem('gov_ocr_language', lang)
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', lang)
    }
  }
}

export default i18n
