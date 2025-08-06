// Translation loader utility
import enTranslations from '../../public/locales/en/common.json'
import arTranslations from '../../public/locales/ar/common.json'

export const translations = {
  en: enTranslations,
  ar: arTranslations
}

export type Language = 'ar' | 'en'

export function getTranslations(locale: Language) {
  return translations[locale] || translations.ar
}

export function translateKey(key: string, locale: Language): string {
  const t = getTranslations(locale)
  const keys = key.split('.')
  let value: any = t
  
  for (const k of keys) {
    value = value?.[k]
  }
  
  return typeof value === 'string' ? value : key
}