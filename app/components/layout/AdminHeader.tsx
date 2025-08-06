'use client'

import { useSession, signOut } from 'next-auth/react'
import { useTranslation, useI18n } from '../providers/I18nProvider'
import { LanguageSwitcher } from '../common/LanguageSwitcher'
import { Bell, Search, User, ChevronDown, Menu, LogOut } from 'lucide-react'
import { Button } from '../ui/Button'

interface AdminHeaderProps {
  title?: string
  subtitle?: string
}

const AdminHeader = ({ title, subtitle }: AdminHeaderProps) => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()

  const handleLogout = async () => {
    try {
      await signOut({ 
        callbackUrl: '/auth/signin',
        redirect: true 
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const formatGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return locale === 'ar' ? 'صباح الخير' : 'Good morning'
    if (hour < 17) return locale === 'ar' ? 'مساء الخير' : 'Good afternoon'
    return locale === 'ar' ? 'مساء الخير' : 'Good evening'
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <div className="flex items-center lg:hidden">
          <Button variant="outline" size="sm">
            <Menu className="w-4 h-4" />
          </Button>
        </div>

        {/* Welcome Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                {title || `${formatGreeting()}, ${session?.user?.name?.split(' ')[0] || 'Admin'}`}
              </h1>
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className={`flex items-center ${locale === 'ar' ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
          {/* Search */}
          <div className="hidden md:block">
            <div className="relative">
              <div className={`absolute inset-y-0 ${locale === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className={`block w-full py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                  locale === 'ar' ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3 text-left'
                }`}
                placeholder={locale === 'ar' ? 'بحث...' : 'Search...'}
              />
            </div>
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Notifications */}
          <Button variant="outline" size="sm" className="relative">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* User Avatar */}
          <button 
            onClick={handleLogout}
            className={`flex items-center hover:bg-gray-50 rounded-lg p-2 transition-colors ${locale === 'ar' ? 'space-x-reverse space-x-3' : 'space-x-3'}`}
            title="Click to logout"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className={`hidden sm:flex sm:flex-col ${locale === 'ar' ? 'sm:items-end' : 'sm:items-start'}`}>
              <p className="text-sm font-medium text-gray-900">
                {session?.user?.name || 'Admin User'}
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {session?.user?.role || 'Administrator'}
              </p>
            </div>
            <LogOut className="w-4 h-4 text-gray-400 hidden sm:block" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader 