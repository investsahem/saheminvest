'use client'

import { useI18n } from '../providers/I18nProvider'
import { Button } from '../ui/Button'

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()

  const handleLanguageChange = () => {
    setLocale(locale === 'ar' ? 'en' : 'ar')
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLanguageChange}
      className="min-w-[60px]"
    >
      {locale === 'ar' ? 'EN' : 'عربي'}
    </Button>
  )
} 