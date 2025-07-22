'use client'

import { ReactNode } from 'react'
import DealManagerSidebar from './DealManagerSidebar'
import DealManagerHeader from './DealManagerHeader'
import { useI18n } from '../providers/I18nProvider'

interface DealManagerLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
}

const DealManagerLayout = ({ children, title, subtitle }: DealManagerLayoutProps) => {
  const { locale } = useI18n()
  
  return (
    <div className={`h-screen flex overflow-hidden bg-gray-50 ${locale === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Sidebar */}
      <DealManagerSidebar />
      
      {/* Main content */}
      <div className={`flex flex-col flex-1 overflow-hidden ${locale === 'ar' ? 'lg:pr-64' : 'lg:pl-64'}`}>
        {/* Header */}
        <DealManagerHeader title={title} subtitle={subtitle} />
        
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

export default DealManagerLayout 