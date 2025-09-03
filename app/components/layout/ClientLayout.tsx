'use client'

import { AuthProvider } from '../providers/AuthProvider'
import { I18nProvider } from '../providers/I18nProvider'

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <AuthProvider>
      <I18nProvider initialLocale="ar">
        {children}
      </I18nProvider>
    </AuthProvider>
  )
} 