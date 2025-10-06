'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslation, useI18n } from '../providers/I18nProvider'
import { useUserData } from '../../hooks/useUserData'
import { useInvestorNotifications } from '../../hooks/useInvestorNotifications'
import { useNotificationTranslation } from '../../hooks/useNotificationTranslation'
import { LanguageSwitcher } from '../common/LanguageSwitcher'
import NotificationDropdown from '../common/NotificationDropdown'
import { Search, User, ChevronDown, Menu, TrendingUp, DollarSign, LogOut, Settings } from 'lucide-react'
import { Button } from '../ui/Button'

interface InvestorHeaderProps {
  title?: string
  subtitle?: string
  onMobileMenuClick?: () => void
}

const InvestorHeader = ({ title, subtitle, onMobileMenuClick }: InvestorHeaderProps) => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const { portfolioValue, dailyChange, isLoading } = useUserData()
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { translateNotification } = useNotificationTranslation()
  
  // Fetch investor notifications
  const {
    notifications,
    stats: notificationStats,
    isLoading: notificationsLoading,
    error: notificationsError,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications
  } = useInvestorNotifications()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return locale === 'ar' ? 'صباح الخير' : 'Good morning'
    if (hour < 17) return locale === 'ar' ? 'مساء الخير' : 'Good afternoon'
    return locale === 'ar' ? 'مساء الخير' : 'Good evening'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
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

  const navigateToProfile = () => {
    setShowUserDropdown(false)
    router.push('/portfolio/dashboard') // Portfolio doesn't have a separate profile page, redirect to dashboard
  }

  const navigateToSettings = () => {
    setShowUserDropdown(false)
    router.push('/portfolio/settings')
  }

  const isSettingsActive = pathname === '/portfolio/settings'
  const isDashboardActive = pathname === '/portfolio/dashboard'

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm z-30">
      <div className="h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          {/* Left Section - Mobile menu + Title */}
          <div className="flex items-center min-w-0 flex-1">
            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden mr-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={onMobileMenuClick}
                className={`p-2 ${locale === 'ar' ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'}`}
              >
                <Menu className="w-5 h-5" />
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
                {isLoading ? '...' : formatCurrency(portfolioValue)}
              </div>
            </div>
            <div className="text-center min-w-0">
              <div className="text-xs text-gray-500 whitespace-nowrap">{t('investor.todays_change')}</div>
              <div className={`text-sm font-bold flex items-center justify-center ${
                dailyChange.amount === 0 ? 'text-gray-600' : dailyChange.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className={`w-4 h-4 ${locale === 'ar' ? 'ml-1' : 'mr-1'} ${
                  dailyChange.amount === 0 ? '' : !dailyChange.isPositive ? 'rotate-180' : ''
                }`} />
                <span className="whitespace-nowrap">
                  {isLoading ? '...' : dailyChange.amount === 0 ? 
                    `$0 (0.00%)` : 
                    `${dailyChange.isPositive ? '+' : ''}${formatCurrency(Math.abs(dailyChange.amount))} (${dailyChange.isPositive ? '+' : ''}${dailyChange.percentage.toFixed(2)}%)`
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className={`flex items-center ${locale === 'ar' ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
            {/* Search - Hidden on mobile */}
            <div className="hidden lg:block">
              <Button variant="outline" size="sm" className="p-2">
                <Search className="w-5 h-5" />
              </Button>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center">
              <LanguageSwitcher />
            </div>

            {/* Notifications */}
            <NotificationDropdown
              notifications={notifications.map(n => ({
                id: n.id,
                title: translateNotification(n.title, n.metadata),
                message: translateNotification(n.message, n.metadata),
                type: n.type || 'info',
                read: n.read,
                createdAt: n.createdAt,
                metadata: n.metadata
              }))}
              stats={notificationStats}
              isLoading={notificationsLoading}
              error={notificationsError}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onDelete={deleteNotification}
              onRefresh={refreshNotifications}
              userRole="INVESTOR"
            />

            {/* User Avatar Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className={`flex items-center hover:bg-gray-50 rounded-lg p-2 transition-colors ${locale === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}
              >
                <div className="w-9 h-9 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className={`hidden md:flex md:flex-col ${locale === 'ar' ? 'md:items-end' : 'md:items-start'} min-w-0`}>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-24">
                    {session?.user?.name || t('roles.INVESTOR')}
                  </p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide truncate">
                    {t('investor.verified_investor')}
                  </p>
                </div>
                <ChevronDown className="w-5 h-5 text-gray-400 hidden md:block" />
              </button>

              {/* User Dropdown Menu */}
              {showUserDropdown && (
                <div className={`absolute ${locale === 'ar' ? 'left-0' : 'right-0'} mt-2 w-48 bg-white rounded-lg shadow-lg border z-50`}>
                  <div className="p-4 border-b border-gray-100">
                    <div className={`flex items-center ${locale === 'ar' ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                      <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {session?.user?.name || t('roles.INVESTOR')}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {session?.user?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <button
                      onClick={navigateToProfile}
                      className={`flex items-center w-full px-4 py-2 text-sm transition-colors ${locale === 'ar' ? 'text-right' : 'text-left'} ${
                        isDashboardActive 
                          ? 'text-green-600 bg-green-50' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <User className={`w-5 h-5 ${locale === 'ar' ? 'ml-3' : 'mr-3'} ${isDashboardActive ? 'text-green-600' : ''}`} />
                      {locale === 'ar' ? 'الملف الشخصي' : 'Dashboard'}
                    </button>
                    
                    <button
                      onClick={navigateToSettings}
                      className={`flex items-center w-full px-4 py-2 text-sm transition-colors ${locale === 'ar' ? 'text-right' : 'text-left'} ${
                        isSettingsActive 
                          ? 'text-green-600 bg-green-50' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Settings className={`w-5 h-5 ${locale === 'ar' ? 'ml-3' : 'mr-3'} ${isSettingsActive ? 'text-green-600' : ''}`} />
                      {locale === 'ar' ? 'الإعدادات' : 'Settings'}
                    </button>
                    
                    <div className="border-t border-gray-100 my-2"></div>
                    
                    <button
                      onClick={() => {
                        setShowUserDropdown(false)
                        handleLogout()
                      }}
                      className={`flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors ${locale === 'ar' ? 'text-right' : 'text-left'}`}
                    >
                      <LogOut className={`w-5 h-5 ${locale === 'ar' ? 'ml-3' : 'mr-3'}`} />
                      {locale === 'ar' ? 'تسجيل الخروج' : 'Sign out'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Portfolio Performance Bar - Shows below header on mobile/tablet */}
      <div className="xl:hidden bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className={`flex items-center justify-center ${locale === 'ar' ? 'space-x-reverse space-x-8' : 'space-x-8'}`}>
          <div className="text-center">
            <div className="text-xs text-gray-500">{t('investor.portfolio_value')}</div>
            <div className="text-base font-bold text-gray-900">
              {isLoading ? '...' : formatCurrency(portfolioValue)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">{t('investor.todays_change')}</div>
            <div className={`text-sm font-bold flex items-center justify-center ${
              dailyChange.amount === 0 ? 'text-gray-600' : dailyChange.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`w-4 h-4 ${locale === 'ar' ? 'ml-1' : 'mr-1'} ${
                dailyChange.amount === 0 ? '' : !dailyChange.isPositive ? 'rotate-180' : ''
              }`} />
              <span>
                {isLoading ? '...' : dailyChange.amount === 0 ? 
                  `$0 (0.00%)` : 
                  `${dailyChange.isPositive ? '+' : ''}${formatCurrency(Math.abs(dailyChange.amount))} (${dailyChange.isPositive ? '+' : ''}${dailyChange.percentage.toFixed(2)}%)`
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default InvestorHeader 