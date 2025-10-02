'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useTranslation, useI18n } from '../providers/I18nProvider'
import { useAdminStats } from '../../hooks/useAdminStats'
import { useAdminNotifications } from '../../hooks/useAdminNotifications'
import { useProfitDistributions } from '../../hooks/useProfitDistributions'
import { useAdminDealUpdates } from '../../hooks/useAdminDealUpdates'
import { 
  LayoutDashboard, Users, DollarSign, Target, BarChart3, 
  Settings, FileText, Clock, UserCheck, Building2,
  LogOut, User, ChevronDown, Bell, Wallet, X, TrendingUp, Mail, Edit
} from 'lucide-react'
import { Button } from '../ui/Button'

interface AdminSidebarProps {
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

const AdminSidebar = ({ isMobileOpen = false, onMobileClose }: AdminSidebarProps) => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()
  const pathname = usePathname()
  const { pendingApplications, pendingPartnerApplications, isLoading } = useAdminStats()
  const { notifications } = useAdminNotifications()
  const { pendingCount: pendingProfitDistributions } = useProfitDistributions()
  const { pendingCount: pendingDealUpdates, totalDealsCount, isLoading: dealUpdatesLoading } = useAdminDealUpdates()

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
      name: t('admin.title'),
      href: '/admin',
      icon: LayoutDashboard,
      current: pathname === '/admin'
    },
    {
      name: t('admin.manage_applications'),
      href: '/admin/applications', 
      icon: Clock,
      current: pathname === '/admin/applications',
      badge: isLoading ? '...' : pendingApplications
    },
    {
      name: 'Advisor Applications',
      href: '/admin/advisor-applications',
      icon: UserCheck,
      current: pathname === '/admin/advisor-applications'
    },
    {
      name: 'Partner Applications',
      href: '/admin/partner-applications',
      icon: Building2,
      current: pathname === '/admin/partner-applications',
      badge: isLoading ? '...' : pendingPartnerApplications
    },
    {
      name: t('admin.manage_users'),
      href: '/admin/users',
      icon: Users,
      current: pathname === '/admin/users'
    },
    {
      name: t('admin.manage_deals'),
      href: '/admin/deals',
      icon: Target,
      current: pathname === '/admin/deals',
      badge: dealUpdatesLoading ? '...' : totalDealsCount
    },
    {
      name: locale === 'ar' ? 'طلبات تحديث الصفقات' : 'Deal Update Requests',
      href: '/admin/deal-updates',
      icon: Edit,
      current: pathname === '/admin/deal-updates',
      badge: dealUpdatesLoading ? '...' : (pendingDealUpdates > 0 ? pendingDealUpdates : undefined)
    },
    {
      name: t('admin.financial_transactions'),
      href: '/admin/finances',
      icon: DollarSign,
      current: pathname === '/admin/finances'
    },
    {
      name: 'Manage Deposits',
      href: '/admin/deposits',
      icon: Wallet,
      current: pathname === '/admin/deposits'
    },
    {
      name: t('admin.profit_distributions'),
      href: '/admin/profit-distributions',
      icon: TrendingUp,
      current: pathname === '/admin/profit-distributions',
      badge: pendingProfitDistributions > 0 ? pendingProfitDistributions : undefined
    },
    {
      name: t('admin.partner_management'),
      href: '/admin/partners',
      icon: Building2,
      current: pathname === '/admin/partners'
    },
    {
      name: t('admin.view_analytics'),
      href: '/admin/analytics',
      icon: BarChart3,
      current: pathname === '/admin/analytics'
    },
    {
      name: 'Email Management',
      href: '/admin/emails',
      icon: Mail,
      current: pathname === '/admin/emails'
    },
    {
      name: t('admin.system_settings'),
      href: '/admin/settings',
      icon: Settings,
      current: pathname === '/admin/settings'
    }
  ]

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden z-40"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        mobile-sidebar ${isMobileOpen ? 'open' : ''} 
        ${isMobileOpen ? 'translate-x-0' : locale === 'ar' ? 'translate-x-full' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:inset-0
        fixed inset-y-0 ${locale === 'ar' ? 'right-0 lg:right-0' : 'left-0 lg:left-0'} 
        flex flex-col w-64 bg-white shadow-lg 
        ${locale === 'ar' ? 'lg:border-l lg:border-gray-200' : 'lg:border-r lg:border-gray-200'}
        transition-transform duration-300 ease-in-out lg:transition-none z-50 lg:z-auto
      `}>
        {/* Mobile close button */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 lg:justify-center">
          <Link href="/" className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Sahem Invest
            </span>
          </Link>
          
          <button
            onClick={onMobileClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
        <nav className="flex-1 px-3 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onMobileClose} // Close mobile sidebar when item is clicked
                className={`group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  item.current
                    ? `bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 ${
                        locale === 'ar' ? 'border-r-4 border-blue-500' : 'border-l-4 border-blue-500'
                      }`
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <Icon 
                    className={`w-5 h-5 ${locale === 'ar' ? 'ml-3' : 'mr-3'} ${
                      item.current ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`} 
                  />
                  {item.name}
                </div>
                {item.badge && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Profile Section */}
        <div className="px-3 mt-6">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className={`w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center ${locale === 'ar' ? 'ml-3' : 'mr-3'}`}>
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || 'Admin User'}
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
    </>
  )
}

export default AdminSidebar 