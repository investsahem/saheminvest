'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useTranslation, useI18n } from '../providers/I18nProvider'
import { LanguageSwitcher } from '../common/LanguageSwitcher'
import { Bell, Search, User, Menu, TrendingUp, Calculator, LogOut, ChevronDown, Settings } from 'lucide-react'
import { Button } from '../ui/Button'

interface FinancialOfficerHeaderProps {
  title?: string
  subtitle?: string
  onMobileMenuClick?: () => void
}

const FinancialOfficerHeader = ({ title, subtitle, onMobileMenuClick }: FinancialOfficerHeaderProps) => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()
  const [showUserDropdown, setShowUserDropdown] = useState(false)

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

  const monthlyRevenue = 200000
  const profitMargin = 23.5
  const cashFlow = 150000
  const isPositive = profitMargin >= 0

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <div className="flex items-center lg:hidden">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onMobileMenuClick}
            className={`${locale === 'ar' ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'}`}
          >
            <Menu className="w-4 h-4" />
          </Button>
        </div>

        {/* Welcome Section - Fixed width to prevent overlap */}
        <div className="flex-shrink-0 min-w-0 max-w-xs sm:max-w-sm">
          <div className="flex items-center">
            <div>
              <h1 className="text-base font-semibold text-gray-900 sm:text-lg truncate">
                {title ? `${title}` : `${formatGreeting()}, ${session?.user?.name?.split(' ')[0] || 'Financial Officer'}`}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-500 truncate">{subtitle}</p>
              )}
            </div>
          </div>
        </div>

        {/* Financial Performance - More responsive */}
        <div className={`hidden xl:flex items-center ${locale === 'ar' ? 'space-x-reverse space-x-4 ml-4' : 'space-x-4 mr-4'} flex-shrink-0`}>
          <div className="text-center">
            <div className="text-xs text-gray-500 truncate">{t('financialOfficer.monthly_revenue')}</div>
            <div className="text-sm font-bold text-gray-900">
              ${Math.round(monthlyRevenue/1000)}K
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 truncate">{t('financialOfficer.profit_margin')}</div>
            <div className={`text-sm font-bold flex items-center justify-center ${isPositive ? 'text-purple-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-3 h-3 ${locale === 'ar' ? 'ml-1' : 'mr-1'} ${!isPositive ? 'rotate-180' : ''}`} />
              {isPositive ? '+' : ''}{profitMargin}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 truncate">{t('financialOfficer.cash_flow')}</div>
            <div className="text-sm font-bold text-gray-900">
              ${Math.round(cashFlow/1000)}K
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
                className={`block w-40 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm ${
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
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full"></span>
          </Button>

          {/* User Avatar Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className={`flex items-center hover:bg-gray-50 rounded-lg p-2 transition-colors ${locale === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className={`hidden md:flex md:flex-col ${locale === 'ar' ? 'md:items-end' : 'md:items-start'} min-w-0`}>
                <p className="text-sm font-medium text-gray-900 truncate max-w-24">
                  {session?.user?.name || 'Financial Officer'}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-wide truncate">
                  {t('financialOfficer.role')}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
            </button>

            {/* User Dropdown Menu */}
            {showUserDropdown && (
              <div className={`absolute ${locale === 'ar' ? 'left-0' : 'right-0'} mt-2 w-48 bg-white rounded-lg shadow-lg border z-50`}>
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {session?.user?.name || 'Financial Officer'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {session?.user?.email}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="py-2">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false)
                      // Navigate to profile
                    }}
                    className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 ${locale === 'ar' ? 'text-right' : 'text-left'}`}
                  >
                    <User className={`w-4 h-4 ${locale === 'ar' ? 'ml-3' : 'mr-3'}`} />
                    {locale === 'ar' ? 'الملف الشخصي' : 'Profile'}
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowUserDropdown(false)
                      // Navigate to settings
                    }}
                    className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 ${locale === 'ar' ? 'text-right' : 'text-left'}`}
                  >
                    <Settings className={`w-4 h-4 ${locale === 'ar' ? 'ml-3' : 'mr-3'}`} />
                    {locale === 'ar' ? 'الإعدادات' : 'Settings'}
                  </button>
                  
                  <div className="border-t border-gray-100 my-2"></div>
                  
                  <button
                    onClick={() => {
                      setShowUserDropdown(false)
                      handleLogout()
                    }}
                    className={`flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 ${locale === 'ar' ? 'text-right' : 'text-left'}`}
                  >
                    <LogOut className={`w-4 h-4 ${locale === 'ar' ? 'ml-3' : 'mr-3'}`} />
                    {locale === 'ar' ? 'تسجيل الخروج' : 'Sign out'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default FinancialOfficerHeader 