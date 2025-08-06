'use client'

import { ReactNode } from 'react'
import PartnerSidebar from './PartnerSidebar'
import PartnerHeader from './PartnerHeader'
import { useI18n } from '../providers/I18nProvider'

interface PartnerLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
}

const PartnerLayout = ({ children, title, subtitle }: PartnerLayoutProps) => {
  const { locale } = useI18n()
  
  return (
    <div className={`h-screen flex overflow-hidden bg-gray-50 ${locale === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Sidebar */}
      <PartnerSidebar />
      
      {/* Main content */}
      <div className={`flex flex-col flex-1 overflow-hidden ${locale === 'ar' ? 'lg:pr-64' : 'lg:pl-64'}`}>
        {/* Header */}
        <PartnerHeader title={title} subtitle={subtitle} />
        
        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default PartnerLayout