'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useTranslation, useI18n } from '../providers/I18nProvider'
import { 
  Target, BarChart3, Building2, Users, TrendingUp, 
  Settings, Bell, User, LogOut, DollarSign, 
  FileText, Calendar, Award, History, Briefcase
} from 'lucide-react'
import { Button } from '../ui/Button'

const DealManagerSidebar = () => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()
  const pathname = usePathname()

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

  const navigationItems = [
    {
      name: t('dealManager.dashboard'),
      href: '/deal-manager',
      icon: Target,
      current: pathname === '/deal-manager'
    },
    {
      name: t('dealManager.manage_deals'),
      href: '/deal-manager/deals',
      icon: Briefcase,
      current: pathname === '/deal-manager/deals',
      badge: '12'
    },
    {
      name: t('dealManager.deal_analytics'), 
      href: '/deal-manager/analytics',
      icon: BarChart3,
      current: pathname === '/deal-manager/analytics'
    },
    {
      name: t('dealManager.partner_management'),
      href: '/deal-manager/partners',
      icon: Building2,
      current: pathname === '/deal-manager/partners'
    },
    {
      name: t('dealManager.investor_relations'),
      href: '/deal-manager/investors',
      icon: Users,
      current: pathname === '/deal-manager/investors'
    },
    {
      name: t('dealManager.performance_tracking'),
      href: '/deal-manager/performance',
      icon: TrendingUp,
      current: pathname === '/deal-manager/performance'
    },
    {
      name: t('dealManager.documents'),
      href: '/deal-manager/documents',
      icon: FileText,
      current: pathname === '/deal-manager/documents'
    },
    {
      name: t('dealManager.settings'),
      href: '/deal-manager/settings',
      icon: Settings,
      current: pathname === '/deal-manager/settings'
    }
  ]

  const totalDeals = 45
  const activeDeals = 12
  const successRate = 87.5

  return (
    <div className={`hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white lg:shadow-sm ${
      locale === 'ar' 
        ? 'lg:right-0 lg:border-l lg:border-gray-200' 
        : 'lg:left-0 lg:border-r lg:border-gray-200'
    }`}>
      {/* Logo Section */}
      <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200">
        <Link href="/" className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Sahem Invest
          </span>
        </Link>
      </div>

      {/* Deal Summary */}
      <div className="px-3 py-4 border-b border-gray-100">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4">
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              {t('dealManager.active_deals')}
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {activeDeals}
            </p>
            <div className="flex items-center justify-center mt-2 text-orange-600">
              <Target className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">
                {successRate}% Success Rate
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col pt-2 pb-4 overflow-y-auto">
        <nav className="flex-1 px-3 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  item.current
                    ? `bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 ${
                        locale === 'ar' ? 'border-r-4 border-orange-500' : 'border-l-4 border-orange-500'
                      }`
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <Icon 
                    className={`w-5 h-5 ${locale === 'ar' ? 'ml-3' : 'mr-3'} ${
                      item.current ? 'text-orange-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`} 
                  />
                  {item.name}
                </div>
                {item.badge && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Profile Section */}
        <div className="px-3 mt-6">
          <div className="bg-gradient-to-r from-gray-50 to-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className={`w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center ${locale === 'ar' ? 'ml-3' : 'mr-3'}`}>
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || 'Deal Manager'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>
            <div className={`mt-3 flex ${locale === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-xs border-gray-300 hover:bg-white"
              >
                <User className={`w-3 h-3 ${locale === 'ar' ? 'ml-1' : 'mr-1'}`} />
                Profile
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-xs border-gray-300 hover:bg-white"
                onClick={handleLogout}
              >
                <LogOut className={`w-3 h-3 ${locale === 'ar' ? 'ml-1' : 'mr-1'}`} />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DealManagerSidebar 