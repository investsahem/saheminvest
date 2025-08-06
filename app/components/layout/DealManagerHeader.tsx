'use client'

import { useSession, signOut } from 'next-auth/react'
import { useTranslation, useI18n } from '../providers/I18nProvider'
import { LanguageSwitcher } from '../common/LanguageSwitcher'
import { Bell, Search, User, Menu, TrendingUp, Target, LogOut } from 'lucide-react'
import { Button } from '../ui/Button'

interface DealManagerHeaderProps {
  title?: string
  subtitle?: string
}

const DealManagerHeader = ({ title, subtitle }: DealManagerHeaderProps) => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()

  const formatGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return locale === 'ar' ? 'صباح الخير' : 'Good morning'
    if (hour < 17) return locale === 'ar' ? 'مساء الخير' : 'Good afternoon'
    return locale === 'ar' ? 'مساء الخير' : 'Good evening'
  }

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

  const activeDeals = 12
  const totalValue = 2450000
  const monthlyGrowth = 8.5
  const isPositive = monthlyGrowth >= 0

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <div className="flex items-center lg:hidden">
          <Button variant="outline" size="sm">
            <Menu className="w-4 h-4" />
          </Button>
        </div>

        {/* Welcome Section - Fixed width to prevent overlap */}
        <div className="flex-shrink-0 min-w-0 max-w-xs sm:max-w-sm">
          <div className="flex items-center">
            <div>
              <h1 className="text-base font-semibold text-gray-900 sm:text-lg truncate">
                {title ? `${title}` : `${formatGreeting()}, ${session?.user?.name?.split(' ')[0] || 'Deal Manager'}`}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-500 truncate">{subtitle}</p>
              )}
            </div>
          </div>
        </div>

        {/* Deal Performance - More responsive */}
        <div className={`hidden xl:flex items-center ${locale === 'ar' ? 'space-x-reverse space-x-4 ml-4' : 'space-x-4 mr-4'} flex-shrink-0`}>
          <div className="text-center">
            <div className="text-xs text-gray-500 truncate">{t('dealManager.active_deals')}</div>
            <div className="text-sm font-bold text-gray-900">
              {activeDeals}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 truncate">{t('dealManager.total_value')}</div>
            <div className="text-sm font-bold text-gray-900">
              ${Math.round(totalValue/1000)}K
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 truncate">{t('dealManager.monthly_growth')}</div>
            <div className={`text-sm font-bold flex items-center justify-center ${isPositive ? 'text-orange-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-3 h-3 ${locale === 'ar' ? 'ml-1' : 'mr-1'} ${!isPositive ? 'rotate-180' : ''}`} />
              {isPositive ? '+' : ''}{monthlyGrowth}%
            </div>
          </div>
        </div>

        {/* Right Side Actions - Compact */}
        <div className={`flex items-center ${locale === 'ar' ? 'space-x-reverse space-x-2 sm:space-x-4' : 'space-x-2 sm:space-x-4'} flex-shrink-0`}>
          {/* Search - Hidden on smaller screens */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className={`absolute inset-y-0 ${locale === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className={`block w-40 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-sm ${
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
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
          </Button>

          {/* User Avatar - Compact on mobile */}
          <button 
            onClick={handleLogout}
            className={`flex items-center hover:bg-gray-50 rounded-lg p-2 transition-colors ${locale === 'ar' ? 'space-x-reverse space-x-2 sm:space-x-3' : 'space-x-2 sm:space-x-3'}`}
            title="Click to logout"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className={`hidden md:flex md:flex-col ${locale === 'ar' ? 'md:items-end' : 'md:items-start'}`}>
              <p className="text-sm font-medium text-gray-900 truncate">
                {session?.user?.name || 'Deal Manager'}
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-wide truncate">
                {t('dealManager.role')}
              </p>
            </div>
            <LogOut className="w-4 h-4 text-gray-400 hidden md:block" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default DealManagerHeader 