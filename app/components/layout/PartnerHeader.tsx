'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useTranslation, useI18n } from '../providers/I18nProvider'
import { LanguageSwitcher } from '../common/LanguageSwitcher'
import { usePartnerStats } from '../../hooks/usePartnerStats'
import { Bell, Search, User, ChevronDown, Menu, TrendingUp, DollarSign, LogOut, Building2, Target, Settings } from 'lucide-react'
import { Button } from '../ui/Button'

interface PartnerHeaderProps {
  title?: string
  subtitle?: string
  onMobileMenuClick?: () => void
}

const PartnerHeader = ({ title, subtitle, onMobileMenuClick }: PartnerHeaderProps) => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  
  // Fetch real partner statistics
  const { stats, loading, error } = usePartnerStats()

  const formatGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return locale === 'ar' ? 'صباح الخير' : 'Good morning'
    if (hour < 17) return locale === 'ar' ? 'مساء الخير' : 'Good afternoon'
    return locale === 'ar' ? 'مساء الخير' : 'Good evening'
  }

  // Use real data from API or fallback to defaults
  const totalRaised = stats?.totalRaised || 0
  const activeDeals = stats?.activeDeals || 0
  const successRate = stats?.successRate || 0
  const isGrowing = stats?.isGrowing ?? false

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
    <header className="bg-white border-b border-gray-200 shadow-sm z-30">
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

        {/* Title and breadcrumb */}
        <div className="flex-1 min-w-0">
          {title ? (
            <div>
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-600 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center">
                <h1 className="text-lg font-semibold text-gray-900">
                  {formatGreeting()}, {session?.user?.name?.split(' ')[0] || t('partner.partner')}!
                </h1>
                <div className="ml-3 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">
                    {t('common.active')}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {t('partner.welcome_message')}
              </p>
            </div>
          )}
        </div>

        {/* Performance indicators */}
        <div className="hidden md:flex items-center space-x-6 mr-6">
          {loading ? (
            /* Loading state */
            <div className="flex items-center space-x-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse"></div>
                  <div>
                    <div className="w-16 h-3 bg-gray-100 rounded animate-pulse mb-1"></div>
                    <div className="w-12 h-4 bg-gray-100 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            /* Error state */
            <div className="text-xs text-red-500">
              {t('common.error_loading_data')}
            </div>
          ) : (
            /* Actual data */
            <>
              {/* Total Raised */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('partner.total_raised')}</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {totalRaised >= 1000000 
                      ? `$${(totalRaised / 1000000).toFixed(1)}M`
                      : `$${(totalRaised / 1000).toFixed(0)}K`
                    }
                  </p>
                </div>
              </div>

              {/* Active Deals */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('partner.active_deals')}</p>
                  <p className="text-sm font-semibold text-gray-900">{activeDeals}</p>
                </div>
              </div>

              {/* Success Rate */}
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isGrowing ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <TrendingUp className={`w-4 h-4 ${
                    isGrowing ? 'text-green-600' : 'text-red-600'
                  }`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t('partner.success_rate')}</p>
                  <p className={`text-sm font-semibold ${
                    isGrowing ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {successRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Search className="w-4 h-4" />
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
            {/* Notification badge */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">3</span>
            </div>
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* User Avatar Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className={`flex items-center hover:bg-gray-50 rounded-lg p-2 transition-colors ${locale === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div className={`hidden sm:flex sm:flex-col ${locale === 'ar' ? 'sm:items-end' : 'sm:items-start'} min-w-0`}>
                <p className="text-sm font-medium text-gray-900 truncate max-w-24">
                  {session?.user?.name || t('partner.partner')}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-wide truncate">
                  {t('partner.verified_partner')}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
            </button>

            {/* User Dropdown Menu */}
            {showUserDropdown && (
              <div className={`absolute ${locale === 'ar' ? 'left-0' : 'right-0'} mt-2 w-48 bg-white rounded-lg shadow-lg border z-50`}>
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {session?.user?.name || t('partner.partner')}
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

export default PartnerHeader