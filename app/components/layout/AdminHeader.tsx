'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useTranslation, useI18n } from '../providers/I18nProvider'
import { useAdminNotifications } from '../../hooks/useAdminNotifications'
import { LanguageSwitcher } from '../common/LanguageSwitcher'
import { Bell, Search, User, ChevronDown, Menu, LogOut, Clock, Target } from 'lucide-react'
import { Button } from '../ui/Button'

interface AdminHeaderProps {
  title?: string
  subtitle?: string
}

const AdminHeader = ({ title, subtitle }: AdminHeaderProps) => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()
  const { notifications } = useAdminNotifications()
  const [showNotifications, setShowNotifications] = useState(false)

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

  const formatGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return locale === 'ar' ? 'صباح الخير' : 'Good morning'
    if (hour < 17) return locale === 'ar' ? 'مساء الخير' : 'Good afternoon'
    return locale === 'ar' ? 'مساء الخير' : 'Good evening'
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

        {/* Welcome Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                {title || `${formatGreeting()}, ${session?.user?.name?.split(' ')[0] || 'Admin'}`}
              </h1>
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className={`flex items-center ${locale === 'ar' ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
          {/* Search */}
          <div className="hidden md:block">
            <div className="relative">
              <div className={`absolute inset-y-0 ${locale === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className={`block w-full py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                  locale === 'ar' ? 'pr-10 pl-3 text-right' : 'pl-10 pr-3 text-left'
                }`}
                placeholder={locale === 'ar' ? 'بحث...' : 'Search...'}
              />
            </div>
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Notifications */}
          <div className="relative">
            <Button 
              variant="outline" 
              size="sm" 
              className="relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-4 h-4" />
              {notifications.pendingDealsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </Button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className={`absolute ${locale === 'ar' ? 'left-0' : 'right-0'} mt-2 w-80 bg-white rounded-lg shadow-lg border z-50`}>
                <div className="p-4 border-b border-gray-100">
                  <h3 className={`text-sm font-medium text-gray-900 ${locale === 'ar' ? 'text-right' : ''}`}>
                    {locale === 'ar' ? 'الإشعارات' : 'Notifications'}
                  </h3>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {notifications.pendingDealsCount > 0 && (
                    <div className="p-4 border-b border-gray-100 hover:bg-gray-50">
                      <div className={`flex items-center ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <Target className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div className={`${locale === 'ar' ? 'mr-3 text-right' : 'ml-3'}`}>
                          <p className={`text-sm font-medium text-gray-900 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                            {locale === 'ar' ? 'صفقات تحتاج موافقة' : 'Deals Pending Approval'}
                          </p>
                          <p className={`text-xs text-gray-500 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                            {locale === 'ar' 
                              ? `${notifications.pendingDealsCount} صفقة تحتاج مراجعة`
                              : `${notifications.pendingDealsCount} deals need review`
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {notifications.notifications.slice(0, 3).map((notification) => (
                    <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                      <div className={`flex items-start ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className={`${locale === 'ar' ? 'mr-3 text-right' : 'ml-3'} flex-1`}>
                          <p className={`text-sm font-medium text-gray-900 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                            {notification.title}
                          </p>
                          <p className={`text-xs text-gray-500 mt-1 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {notifications.notifications.length === 0 && notifications.pendingDealsCount === 0 && (
                    <div className="p-6 text-center">
                      <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className={`text-sm text-gray-500 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                        {locale === 'ar' ? 'لا توجد إشعارات جديدة' : 'No new notifications'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-gray-100">
                  <a
                    href="/admin/deals"
                    className={`block text-sm text-blue-600 hover:text-blue-800 font-medium ${locale === 'ar' ? 'text-right font-arabic' : ''}`}
                    onClick={() => setShowNotifications(false)}
                  >
                    {locale === 'ar' ? 'عرض جميع الصفقات' : 'View All Deals'}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <button 
            onClick={handleLogout}
            className={`flex items-center hover:bg-gray-50 rounded-lg p-2 transition-colors ${locale === 'ar' ? 'space-x-reverse space-x-3' : 'space-x-3'}`}
            title="Click to logout"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className={`hidden sm:flex sm:flex-col ${locale === 'ar' ? 'sm:items-end' : 'sm:items-start'}`}>
              <p className="text-sm font-medium text-gray-900">
                {session?.user?.name || 'Admin User'}
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {session?.user?.role || 'Administrator'}
              </p>
            </div>
            <LogOut className="w-4 h-4 text-gray-400 hidden sm:block" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader 