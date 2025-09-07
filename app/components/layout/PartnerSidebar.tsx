'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useTranslation, useI18n } from '../providers/I18nProvider'
import { usePartnerStats } from '../../hooks/usePartnerStats'
import { 
  Building2, Briefcase, TrendingUp, Target, FileText, 
  Settings, Bell, User, LogOut, DollarSign, 
  BarChart3, Calendar, Award, History, Users,
  PieChart, Activity, MessageSquare, Upload, X
} from 'lucide-react'
import { Button } from '../ui/Button'

interface PartnerSidebarProps {
  isMobileMenuOpen?: boolean
  setIsMobileMenuOpen?: (open: boolean) => void
}

const PartnerSidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }: PartnerSidebarProps) => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()
  const pathname = usePathname()
  
  // Fetch real partner statistics
  const { stats, loading, error } = usePartnerStats()

  const navigationItems = [
    {
      name: t('partner.dashboard'),
      href: '/partner/dashboard',
      icon: PieChart,
      current: pathname === '/partner/dashboard'
    },
    {
      name: t('partner.profile'),
      href: '/partner/profile',
      icon: User,
      current: pathname === '/partner/profile'
    },
    {
      name: t('partner.my_deals'), 
      href: '/partner/deals',
      icon: Briefcase,
      current: pathname === '/partner/deals'
    },
    {
      name: t('partner.create_deal'),
      href: '/partner/deals/create',
      icon: Target,
      current: pathname === '/partner/deals/create'
    },
    {
      name: t('partner.analytics'),
      href: '/partner/analytics',
      icon: BarChart3,
      current: pathname === '/partner/analytics'
    },
    {
      name: t('partner.performance'),
      href: '/partner/performance',
      icon: TrendingUp,
      current: pathname === '/partner/performance'
    },
    {
      name: t('partner.transactions'),
      href: '/partner/transactions',
      icon: History,
      current: pathname === '/partner/transactions'
    },
    {
      name: t('partner.documents'),
      href: '/partner/documents',
      icon: FileText,
      current: pathname === '/partner/documents'
    },
    {
      name: t('partner.communications'),
      href: '/partner/communications',
      icon: MessageSquare,
      current: pathname === '/partner/communications'
    },
    {
      name: t('partner.profile_settings'),
      href: '/partner/settings',
      icon: Settings,
      current: pathname === '/partner/settings'
    }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleLinkClick = () => {
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false)
    }
  }

  return (
    <div className={`fixed inset-y-0 flex flex-col w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out z-50 ${
      locale === 'ar' ? 'right-0' : 'left-0'
    } ${
      // Mobile: slide in/out based on menu state
      isMobileMenuOpen 
        ? 'translate-x-0' 
        : locale === 'ar' 
          ? 'translate-x-full lg:translate-x-0' 
          : '-translate-x-full lg:translate-x-0'
    }`}>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="ml-2 text-xl font-bold text-gray-900">
            {t('common.brand_name')}
          </span>
        </div>
        
        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Partner Info */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
            <Building2 className="w-6 h-6 text-green-600" />
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {session?.user?.name || t('partner.company_name')}
            </p>
            <p className="text-xs text-gray-500">
              {t('common.partner')}
            </p>
          </div>
          <div className="ml-2 flex-shrink-0">
            <div className="flex items-center">
              <Activity className="w-3 h-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600 font-medium">
                {t('common.active')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 bg-white overflow-y-auto">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  item.current
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } ${locale === 'ar' ? 'text-right' : 'text-left'}`}
              >
                <Icon className={`flex-shrink-0 w-5 h-5 ${
                  item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                } ${locale === 'ar' ? 'ml-3' : 'mr-3'}`} />
                <span className="flex-1">{item.name}</span>
                {(item as any).badge && (
                  <span className={`inline-block py-0.5 px-2 text-xs rounded-full ${
                    item.current 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  } ${locale === 'ar' ? 'mr-2' : 'ml-2'}`}>
                    {(item as any).badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Quick Stats */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {t('partner.quick_stats')}
          </h4>
          
          {loading ? (
            /* Loading state */
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse mr-2"></div>
                    <div className="w-20 h-3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            /* Error state */
            <div className="text-xs text-red-500 text-center py-2">
              {t('common.error_loading_data')}
            </div>
          ) : (
            /* Real data */
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Briefcase className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{t('partner.active_deals')}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {stats?.activeDeals || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{t('partner.total_raised')}</span>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  {formatCurrency(stats?.totalRaised || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Award className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{t('partner.success_rate')}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {stats?.successRate ? `${stats.successRate.toFixed(1)}%` : '0%'}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* User Profile & Logout */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {session?.user?.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {session?.user?.email}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut()}
            className="ml-2 p-1 w-8 h-8"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PartnerSidebar