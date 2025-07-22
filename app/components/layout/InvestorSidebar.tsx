'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useTranslation, useI18n } from '../providers/I18nProvider'
import { 
  PieChart, Wallet, TrendingUp, Target, FileText, 
  Settings, Bell, User, LogOut, DollarSign, 
  BarChart3, Calendar, Award, History, CreditCard
} from 'lucide-react'
import { Button } from '../ui/Button'

const InvestorSidebar = () => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()
  const pathname = usePathname()

  const navigationItems = [
    {
      name: t('investor.dashboard'),
      href: '/portfolio',
      icon: PieChart,
      current: pathname === '/portfolio'
    },
    {
      name: t('investor.my_investments'), 
      href: '/portfolio/investments',
      icon: TrendingUp,
      current: pathname === '/portfolio/investments'
    },
    {
      name: t('investor.available_deals'),
      href: '/deals',
      icon: Target,
      current: pathname === '/deals'
    },
    {
      name: t('investor.wallet'),
      href: '/portfolio/wallet',
      icon: Wallet,
      current: pathname === '/portfolio/wallet',
      badge: '12,500'
    },
    {
      name: t('investor.transaction_history'),
      href: '/portfolio/transactions',
      icon: History,
      current: pathname === '/portfolio/transactions'
    },
    {
      name: t('investor.returns_analytics'),
      href: '/portfolio/analytics',
      icon: BarChart3,
      current: pathname === '/portfolio/analytics'
    },
    {
      name: t('investor.documents'),
      href: '/portfolio/documents',
      icon: FileText,
      current: pathname === '/portfolio/documents'
    },
    {
      name: t('investor.profile_settings'),
      href: '/portfolio/settings',
      icon: Settings,
      current: pathname === '/portfolio/settings'
    }
  ]

  const portfolioValue = (session?.user as any)?.walletBalance || 25000
  const totalReturn = ((portfolioValue - 10000) / 10000 * 100).toFixed(1)
  const isPositive = parseFloat(totalReturn) >= 0

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
    <div className={`hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white lg:shadow-sm ${
      locale === 'ar' 
        ? 'lg:right-0 lg:border-l lg:border-gray-200' 
        : 'lg:left-0 lg:border-r lg:border-gray-200'
    }`}>
      {/* Logo Section */}
      <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200">
        <Link href="/" className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Sahem Invest
          </span>
        </Link>
      </div>

      {/* Portfolio Summary */}
      <div className="px-3 py-4 border-b border-gray-100">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              {t('investor.portfolio_value')}
            </p>
            <p className="text-2xl font-bold text-gray-900">
              ${portfolioValue.toLocaleString()}
            </p>
            <div className={`flex items-center justify-center mt-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${!isPositive ? 'rotate-180' : ''}`} />
              <span className="text-sm font-medium">
                {isPositive ? '+' : ''}{totalReturn}%
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
                    ? `bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 ${
                        locale === 'ar' ? 'border-r-4 border-green-500' : 'border-l-4 border-green-500'
                      }`
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <Icon 
                    className={`w-5 h-5 ${locale === 'ar' ? 'ml-3' : 'mr-3'} ${
                      item.current ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`} 
                  />
                  {item.name}
                </div>
                {item.badge && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ${item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Profile Section */}
        <div className="px-3 mt-6">
          <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className={`w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center ${locale === 'ar' ? 'ml-3' : 'mr-3'}`}>
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || 'Investor'}
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

export default InvestorSidebar 