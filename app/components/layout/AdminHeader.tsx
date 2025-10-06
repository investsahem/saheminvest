'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useTranslation, useI18n } from '../providers/I18nProvider'
import { useAdminNotifications } from '../../hooks/useAdminNotifications'
import { useNotificationTranslation } from '../../hooks/useNotificationTranslation'
import { LanguageSwitcher } from '../common/LanguageSwitcher'
import NotificationDropdown from '../common/NotificationDropdown'
import { Search, User, ChevronDown, Menu, LogOut, Settings } from 'lucide-react'
import { Button } from '../ui/Button'

interface AdminHeaderProps {
  title?: string
  subtitle?: string
  onMobileMenuClick?: () => void
}

const AdminHeader = ({ title, subtitle, onMobileMenuClick }: AdminHeaderProps) => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()
  const { translateNotification } = useNotificationTranslation()
  const { 
    notifications: adminNotifications, 
    isLoading: notificationsLoading,
    refreshNotifications,
    markAsRead
  } = useAdminNotifications()
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const userDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
          <Button 
            variant="outline" 
            size="sm"
            onClick={onMobileMenuClick}
            className={`${locale === 'ar' ? 'ml-2 sm:ml-3' : 'mr-2 sm:mr-3'}`}
          >
            <Menu className="w-4 h-4" />
          </Button>
        </div>

        {/* Welcome Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <div>
              <h1 className="mobile-header-title text-base font-semibold text-gray-900 sm:text-lg lg:text-xl truncate">
                {title || `${formatGreeting()}, ${session?.user?.name?.split(' ')[0] || 'Admin'}`}
              </h1>
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500 truncate">{subtitle}</p>
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
          <NotificationDropdown
            notifications={[
              // Combine deal notifications and general notifications
              ...adminNotifications.notifications.map(n => ({
                id: n.id,
                title: translateNotification(n.title, n.data),
                message: translateNotification(n.message, n.data),
                type: n.data.type || 'info',
                read: false, // Deal notifications are always unread in the current implementation
                createdAt: n.createdAt,
                metadata: n.data
              })),
              ...adminNotifications.generalNotifications.map(n => ({
                id: n.id,
                title: translateNotification(n.title, n.metadata),
                message: translateNotification(n.message, n.metadata),
                type: n.type || 'info',
                read: n.read,
                createdAt: n.createdAt,
                metadata: n.metadata
              }))
            ]}
            stats={{
              total: adminNotifications.notifications.length + adminNotifications.generalNotifications.length,
              unread: adminNotifications.unreadCount + adminNotifications.notifications.length,
              pendingDeals: adminNotifications.pendingDealsCount
            }}
            isLoading={notificationsLoading}
            onMarkAsRead={async (id) => await markAsRead([id])}
            onMarkAllAsRead={async () => await markAsRead([], true)}
            onRefresh={refreshNotifications}
            userRole="ADMIN"
          />

          {/* User Avatar Dropdown */}
          <div className="relative" ref={userDropdownRef}>
            <button 
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className={`flex items-center hover:bg-gray-50 rounded-lg p-2 transition-colors ${locale === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className={`hidden sm:flex sm:flex-col ${locale === 'ar' ? 'sm:items-end' : 'sm:items-start'} min-w-0`}>
                <p className="text-sm font-medium text-gray-900 truncate max-w-24">
                  {session?.user?.name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-wide truncate">
                  {session?.user?.role || 'Administrator'}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
            </button>

            {/* User Dropdown Menu */}
            {showUserDropdown && (
              <div className={`dropdown-menu absolute ${locale === 'ar' ? 'left-0' : 'right-0'} mt-2 w-48 bg-white rounded-lg shadow-lg border z-50`}>
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
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

export default AdminHeader 