'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Language = 'ar' | 'en'

interface I18nContextType {
  locale: Language
  setLocale: (locale: Language) => void
  t: (key: string) => string
  isRTL: boolean
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

interface I18nProviderProps {
  children: React.ReactNode
  initialLocale?: Language
}

export function I18nProvider({ children, initialLocale = 'en' }: I18nProviderProps) {
  const [locale, setLocale] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('preferred-locale') as Language
      return stored || initialLocale
    }
    return initialLocale
  })
  const [translations, setTranslations] = useState<Record<string, any>>({})

  const isRTL = locale === 'ar'

  useEffect(() => {
    // Load translations for current locale
    const loadTranslations = async () => {
      try {
        const response = await fetch(`/locales/${locale}/common.json`)
        const data = await response.json()
        setTranslations(data)
      } catch (error) {
        console.error('Failed to load translations:', error)
      }
    }

    loadTranslations()
  }, [locale])

  useEffect(() => {
    // Update document direction and language
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = locale
  }, [locale, isRTL])

  const handleSetLocale = (newLocale: Language) => {
    setLocale(newLocale)
    // Store locale preference in localStorage
    localStorage.setItem('preferred-locale', newLocale)
  }

  const t = (key: string): string => {
    const keys = key.split('.')
    let value = translations
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    return typeof value === 'string' ? value : key
  }

  const value = {
    locale,
    setLocale: handleSetLocale,
    t,
    isRTL
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

export function useTranslation() {
  const { t } = useI18n()
  return { t }
} 