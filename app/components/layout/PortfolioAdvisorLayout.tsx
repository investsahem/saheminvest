'use client'

import { ReactNode } from 'react'
import PortfolioAdvisorSidebar from './PortfolioAdvisorSidebar'
import PortfolioAdvisorHeader from './PortfolioAdvisorHeader'
import { useI18n } from '../providers/I18nProvider'

interface PortfolioAdvisorLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
}

const PortfolioAdvisorLayout = ({ children, title, subtitle }: PortfolioAdvisorLayoutProps) => {
  const { locale } = useI18n()
  
  return (
    <div className={`h-screen flex overflow-hidden bg-gray-50 ${locale === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Sidebar */}
      <PortfolioAdvisorSidebar />
      
      {/* Main content */}
      <div className={`flex flex-col flex-1 overflow-hidden ${locale === 'ar' ? 'lg:pr-64' : 'lg:pl-64'}`}>
        {/* Header */}
        <PortfolioAdvisorHeader title={title} subtitle={subtitle} />
        
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

export default PortfolioAdvisorLayout 