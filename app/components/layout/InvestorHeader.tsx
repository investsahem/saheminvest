'use client'

import { useSession, signOut } from 'next-auth/react'
import { useTranslation, useI18n } from '../providers/I18nProvider'
import { LanguageSwitcher } from '../common/LanguageSwitcher'
import { Bell, Search, User, ChevronDown, Menu, TrendingUp, DollarSign, LogOut } from 'lucide-react'
import { Button } from '../ui/Button'

interface InvestorHeaderProps {
  title?: string
  subtitle?: string
}

const InvestorHeader = ({ title, subtitle }: InvestorHeaderProps) => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()

  const formatGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return locale === 'ar' ? 'صباح الخير' : 'Good morning'
    if (hour < 17) return locale === 'ar' ? 'مساء الخير' : 'Good afternoon'
    return locale === 'ar' ? 'مساء الخير' : 'Good evening'
  }

  const portfolioValue = (session?.user as any)?.walletBalance || 25000
  const todayChange = 1850
  const changePercent = ((todayChange / portfolioValue) * 100).toFixed(2)
  const isPositive = todayChange >= 0

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

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          {/* Left Section - Mobile menu + Title */}
          <div className="flex items-center min-w-0 flex-1">
            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden mr-3">
              <Button variant="outline" size="sm">
                <Menu className="w-4 h-4" />
              </Button>
            </div>

            {/* Title Section */}
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold text-gray-900 sm:text-xl truncate">
                {title || t('investor.dashboard')}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-500 truncate">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Center Section - Portfolio Performance (Hidden on small screens) */}
          <div className={`hidden xl:flex items-center ${locale === 'ar' ? 'space-x-reverse space-x-8' : 'space-x-8'} mx-8`}>
            <div className="text-center min-w-0">
              <div className="text-xs text-gray-500 whitespace-nowrap">{t('investor.portfolio_value')}</div>
              <div className="text-lg font-bold text-gray-900">
                ${portfolioValue.toLocaleString()}
              </div>
            </div>
            <div className="text-center min-w-0">
              <div className="text-xs text-gray-500 whitespace-nowrap">{t('investor.todays_change')}</div>
              <div className={`text-sm font-bold flex items-center justify-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className={`w-3 h-3 ${locale === 'ar' ? 'ml-1' : 'mr-1'} ${!isPositive ? 'rotate-180' : ''}`} />
                <span className="whitespace-nowrap">
                  {isPositive ? '+' : ''}${Math.abs(todayChange).toLocaleString()} ({isPositive ? '+' : ''}{changePercent}%)
                </span>
              </div>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className={`flex items-center ${locale === 'ar' ? 'space-x-reverse space-x-2 sm:space-x-3' : 'space-x-2 sm:space-x-3'}`}>
            {/* Search - Hidden on mobile */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className={`absolute inset-y-0 ${locale === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className={`block w-48 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm ${
                    locale === 'ar' ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3 text-left'
                  }`}
                  placeholder={locale === 'ar' ? 'بحث الاستثمارات...' : 'Search investments...'}
                />
              </div>
            </div>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Notifications */}
            <Button variant="outline" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
            </Button>

            {/* User Avatar */}
            <button 
              onClick={handleLogout}
              className={`flex items-center hover:bg-gray-50 rounded-lg p-2 transition-colors ${locale === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}
              title={t('auth.signout')}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className={`hidden md:flex md:flex-col ${locale === 'ar' ? 'md:items-end' : 'md:items-start'} min-w-0`}>
                <p className="text-sm font-medium text-gray-900 truncate max-w-24">
                  {session?.user?.name || t('roles.INVESTOR')}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-wide truncate">
                  {t('investor.verified_investor')}
                </p>
              </div>
              <LogOut className="w-4 h-4 text-gray-400 hidden md:block" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Portfolio Performance Bar - Shows below header on mobile/tablet */}
      <div className="xl:hidden bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className={`flex items-center justify-center ${locale === 'ar' ? 'space-x-reverse space-x-8' : 'space-x-8'}`}>
          <div className="text-center">
            <div className="text-xs text-gray-500">{t('investor.portfolio_value')}</div>
            <div className="text-base font-bold text-gray-900">
              ${portfolioValue.toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">{t('investor.todays_change')}</div>
            <div className={`text-sm font-bold flex items-center justify-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-3 h-3 ${locale === 'ar' ? 'ml-1' : 'mr-1'} ${!isPositive ? 'rotate-180' : ''}`} />
              <span>
                {isPositive ? '+' : ''}${Math.abs(todayChange).toLocaleString()} ({isPositive ? '+' : ''}{changePercent}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default InvestorHeader 