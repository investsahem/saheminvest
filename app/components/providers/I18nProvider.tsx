'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getPortalTranslations, detectPortalFromPath, type Language, type Portal } from '../../lib/translations'

interface I18nContextType {
  locale: Language
  setLocale: (locale: Language) => void
  t: (key: string, variables?: Record<string, string | number>) => string
  isRTL: boolean
  portal: Portal
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

interface I18nProviderProps {
  children: React.ReactNode
  initialLocale?: Language
}

export function I18nProvider({ children, initialLocale = 'ar' }: I18nProviderProps) {
  const pathname = usePathname()
  const portal = detectPortalFromPath(pathname)
  
  const [locale, setLocale] = useState<Language>(() => {
    // Check localStorage on client side, otherwise use initialLocale
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('preferred-locale') as Language
      return stored || initialLocale
    }
    return initialLocale
  })

  const isRTL = locale === 'ar'
  const translations = getPortalTranslations(locale, portal)

  useEffect(() => {
    // Update document direction and language
    if (typeof document !== 'undefined') {
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
      document.documentElement.lang = locale
    }
  }, [locale, isRTL])

  const handleSetLocale = (newLocale: Language) => {
    setLocale(newLocale)
    // Store locale preference in localStorage
    localStorage.setItem('preferred-locale', newLocale)
  }

  const t = (key: string, variables?: Record<string, string | number>): string => {
    const keys = key.split('.')
    let value: any = translations
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    let result = typeof value === 'string' ? value : key
    
    // Replace variables in the format {{variableName}}
    if (variables && typeof result === 'string') {
      Object.entries(variables).forEach(([key, val]) => {
        result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(val))
      })
    }
    
    return result
  }

  const value = {
    locale,
    setLocale: handleSetLocale,
    t,
    isRTL,
    portal
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