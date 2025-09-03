'use client'

import { ReactNode, useState } from 'react'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import { useI18n } from '../providers/I18nProvider'

interface AdminLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
}

const AdminLayout = ({ children, title, subtitle }: AdminLayoutProps) => {
  const { locale } = useI18n()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  
  return (
    <div className={`h-screen flex overflow-hidden bg-gray-50 ${locale === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Sidebar */}
      <AdminSidebar 
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />
      
      {/* Main content */}
      <div className={`flex flex-col flex-1 overflow-hidden ${locale === 'ar' ? 'lg:pr-64' : 'lg:pl-64'}`}>
        {/* Header */}
        <AdminHeader 
          title={title} 
          subtitle={subtitle}
          onMobileMenuClick={() => setIsMobileSidebarOpen(true)}
        />
        
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

export default AdminLayout 