'use client'

import { SessionProvider } from 'next-auth/react'
import { I18nProvider } from '../providers/I18nProvider'

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <SessionProvider>
      <I18nProvider>
        {children}
      </I18nProvider>
    </SessionProvider>
  )
} 