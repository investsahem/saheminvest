'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslation, useI18n } from '../providers/I18nProvider'
import { Bell, Clock, Target, DollarSign, TrendingUp, X, Check, CheckCheck, Trash2 } from 'lucide-react'
import { Button } from '../ui/Button'

interface NotificationItem {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
  metadata?: {
    dealId?: string
    dealTitle?: string
    amount?: number
    partnerName?: string
    investorName?: string
    action?: string
    transactionId?: string
  }
}

interface NotificationStats {
  total: number
  unread: number
  [key: string]: number
}

interface NotificationDropdownProps {
  notifications: NotificationItem[]
  stats: NotificationStats
  isLoading: boolean
  error?: string | null
  onMarkAsRead: (id: string) => Promise<boolean>
  onMarkAllAsRead: () => Promise<boolean>
  onDelete?: (id: string) => Promise<boolean>
  onRefresh: () => void
  userRole: 'ADMIN' | 'PARTNER' | 'INVESTOR'
}

const NotificationDropdown = ({
  notifications,
  stats,
  isLoading,
  error,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onRefresh,
  userRole
}: NotificationDropdownProps) => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const [showDropdown, setShowDropdown] = useState(false)
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deal_funded':
      case 'investment_confirmed':
      case 'return_payment':
        return <DollarSign className="w-4 h-4 text-green-600" />
      case 'deal_update':
      case 'deal_completed':
        return <Target className="w-4 h-4 text-blue-600" />
      case 'investor_joined':
      case 'new_investment':
        return <TrendingUp className="w-4 h-4 text-purple-600" />
      case 'deposit_approved':
      case 'withdrawal_approved':
        return <Check className="w-4 h-4 text-green-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  // Translate notification content - handles both raw text and i18n keys
  const translateNotificationText = (text: string, metadata?: NotificationItem['metadata']) => {
    // If text looks like a translation key (e.g., "notifications.something")
    if (text && text.startsWith('notifications.')) {
      // Build variables from metadata for interpolation
      const variables: Record<string, any> = {}
      if (metadata) {
        if (metadata.amount) variables.amount = metadata.amount.toLocaleString()
        if (metadata.dealTitle) variables.dealTitle = metadata.dealTitle
        if (metadata.partnerName) variables.partnerName = metadata.partnerName
        if (metadata.investorName) variables.investorName = metadata.investorName
      }
      // Try to translate using t() function
      const translated = t(text, variables)
      // If translation returns the key itself, it wasn't found - return original
      return translated !== text ? translated : text
    }
    // Return as-is if not a translation key
    return text
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return locale === 'ar' ? 'الآن' : 'Just now'
    if (diffInMinutes < 60) return locale === 'ar' ? `منذ ${diffInMinutes} دقيقة` : `${diffInMinutes}m ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return locale === 'ar' ? `منذ ${diffInHours} ساعة` : `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return locale === 'ar' ? `منذ ${diffInDays} يوم` : `${diffInDays}d ago`

    return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')
  }

  const handleMarkAsRead = async (id: string) => {
    if (processingIds.has(id)) return

    setProcessingIds(prev => new Set(prev).add(id))
    try {
      await onMarkAsRead(id)
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    if (markingAllAsRead || stats.unread === 0) return

    setMarkingAllAsRead(true)
    try {
      await onMarkAllAsRead()
    } finally {
      setMarkingAllAsRead(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!onDelete || processingIds.has(id)) return

    setProcessingIds(prev => new Set(prev).add(id))
    try {
      await onDelete(id)
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const getRoleSpecificLink = () => {
    switch (userRole) {
      case 'ADMIN':
        return '/admin/notifications'
      case 'PARTNER':
        return '/partner/notifications'
      case 'INVESTOR':
        return '/portfolio/notifications'
      default:
        return '#'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        className={`relative p-2 ${stats.unread > 0 ? 'animate-pulse' : ''}`}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Bell className={`w-5 h-5 ${stats.unread > 0 ? 'text-blue-600' : ''}`} />
        {stats.unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
            <span className="text-xs text-white font-bold">
              {stats.unread > 99 ? '99+' : stats.unread}
            </span>
          </span>
        )}
      </Button>

      {/* Notifications Dropdown */}
      {showDropdown && (
        <div className={`absolute ${locale === 'ar' ? 'left-0' : 'right-0'} mt-2 w-96 bg-white rounded-lg shadow-lg border z-50 max-h-[80vh] overflow-hidden`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <div className={`flex items-center justify-between ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
              <h3 className={`text-lg font-semibold text-gray-900 ${locale === 'ar' ? 'text-right font-arabic' : ''}`}>
                {locale === 'ar' ? 'الإشعارات' : 'Notifications'}
              </h3>
              <div className={`flex items-center ${locale === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                {stats.unread > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    disabled={markingAllAsRead}
                    className="text-xs"
                  >
                    <CheckCheck className="w-3 h-3 mr-1" />
                    {locale === 'ar' ? 'تم قراءة الكل' : 'Mark all read'}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="text-xs"
                >
                  {locale === 'ar' ? 'تحديث' : 'Refresh'}
                </Button>
              </div>
            </div>
            {stats.unread > 0 && (
              <p className={`text-sm text-gray-500 mt-1 ${locale === 'ar' ? 'text-right font-arabic' : ''}`}>
                {locale === 'ar'
                  ? `${stats.unread} إشعار غير مقروء`
                  : `${stats.unread} unread notification${stats.unread > 1 ? 's' : ''}`
                }
              </p>
            )}
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className={`text-sm text-gray-500 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                  {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                </p>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <p className={`text-sm text-red-500 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                  {error}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  className="mt-2"
                >
                  {locale === 'ar' ? 'إعادة المحاولة' : 'Try again'}
                </Button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className={`text-sm text-gray-500 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                  {locale === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''
                    }`}
                >
                  <div className={`flex items-start ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                    <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className={`flex-1 min-w-0 ${locale === 'ar' ? 'mr-3 text-right' : 'ml-3'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium text-gray-900 line-clamp-2 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                            {translateNotificationText(notification.title, notification.metadata)}
                          </p>
                          <p className={`text-xs text-gray-600 mt-1 line-clamp-2 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                            {translateNotificationText(notification.message, notification.metadata)}
                          </p>
                          <div className={`flex items-center mt-2 ${locale === 'ar' ? 'flex-row-reverse justify-end' : 'justify-between'}`}>
                            <p className="text-xs text-gray-400">
                              {formatTimeAgo(notification.createdAt)}
                            </p>
                            {notification.metadata?.amount && (
                              <p className="text-xs font-medium text-green-600">
                                ${notification.metadata.amount.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className={`flex items-center ${locale === 'ar' ? 'space-x-reverse space-x-1 mr-2' : 'space-x-1 ml-2'}`}>
                          {!notification.read && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              disabled={processingIds.has(notification.id)}
                              className="p-1"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(notification.id)}
                              disabled={processingIds.has(notification.id)}
                              className="p-1 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100">
            <a
              href={getRoleSpecificLink()}
              className={`block text-sm text-blue-600 hover:text-blue-800 font-medium ${locale === 'ar' ? 'text-right font-arabic' : ''}`}
              onClick={() => setShowDropdown(false)}
            >
              {locale === 'ar' ? 'عرض جميع الإشعارات' : 'View all notifications'}
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown
