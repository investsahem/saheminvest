'use client'

import { useSession, signOut } from 'next-auth/react'
import { useTranslation, useI18n } from '../providers/I18nProvider'
import { LanguageSwitcher } from '../common/LanguageSwitcher'
import { Bell, Search, User, ChevronDown, Menu, TrendingUp, DollarSign, LogOut, Building2, Target } from 'lucide-react'
import { Button } from '../ui/Button'

interface PartnerHeaderProps {
  title?: string
  subtitle?: string
}

const PartnerHeader = ({ title, subtitle }: PartnerHeaderProps) => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()

  const formatGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return locale === 'ar' ? 'صباح الخير' : 'Good morning'
    if (hour < 17) return locale === 'ar' ? 'مساء الخير' : 'Good afternoon'
    return locale === 'ar' ? 'مساء الخير' : 'Good evening'
  }

  // Sample partner metrics - in real app, fetch from API
  const totalRaised = 850000
  const activeDeals = 3
  const successRate = 87
  const isGrowing = true

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
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <div className="flex items-center lg:hidden">
          <Button variant="outline" size="sm">
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
          {/* Total Raised */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t('partner.total_raised')}</p>
              <p className="text-sm font-semibold text-gray-900">
                ${(totalRaised / 1000).toFixed(0)}K
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
                {successRate}%
              </p>
            </div>
          </div>
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

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <div className="w-6 h-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <Building2 className="w-3 h-3 text-blue-600" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700 truncate max-w-20">
                {session?.user?.name}
              </span>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </Button>
          </div>

          {/* Logout */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}

export default PartnerHeader