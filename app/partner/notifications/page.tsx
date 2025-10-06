'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import PartnerLayout from '../../components/layout/PartnerLayout'
import { useTranslation, useI18n } from '../../components/providers/I18nProvider'
import { usePartnerNotifications } from '../../hooks/usePartnerNotifications'
import { useNotificationTranslation } from '../../hooks/useNotificationTranslation'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { 
  Bell, Search, Filter, CheckCircle, Clock, AlertCircle, 
  MessageSquare, Plus, Eye, Trash2, RefreshCw, Check, CheckCheck,
  TrendingUp, DollarSign, Target
} from 'lucide-react'

const PartnerNotificationsPage = () => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()
  const { translateNotification } = useNotificationTranslation()
  
  const {
    notifications,
    stats,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications
  } = usePartnerNotifications()

  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deal_funded':
      case 'new_investment':
        return <DollarSign className="w-5 h-5 text-green-600" />
      case 'deal_approved':
      case 'deal_rejected':
        return <Target className="w-5 h-5 text-blue-600" />
      case 'investor_joined':
        return <TrendingUp className="w-5 h-5 text-purple-600" />
      case 'deal_completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'system':
        return <MessageSquare className="w-5 h-5 text-gray-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getTypeBadge = (type: string) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
    switch (type) {
      case 'deal_funded':
      case 'new_investment':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'deal_approved':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'deal_rejected':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'investor_joined':
        return `${baseClasses} bg-purple-100 text-purple-800`
      case 'deal_completed':
        return `${baseClasses} bg-emerald-100 text-emerald-800`
      case 'system':
        return `${baseClasses} bg-gray-100 text-gray-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const translatedTitle = translateNotification(notification.title, notification.metadata)
    const translatedMessage = translateNotification(notification.message, notification.metadata)
    
    const matchesSearch = searchTerm === '' || 
      translatedTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      translatedMessage.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === 'all' || notification.type === typeFilter

    return matchesSearch && matchesType
  })

  // Calculate stats
  const totalNotifications = notifications.length
  const unreadNotifications = notifications.filter(n => !n.read).length
  const notificationsByType = {
    deal_funded: notifications.filter(n => n.type === 'deal_funded').length,
    new_investment: notifications.filter(n => n.type === 'new_investment').length,
    deal_approved: notifications.filter(n => n.type === 'deal_approved').length,
    deal_rejected: notifications.filter(n => n.type === 'deal_rejected').length,
    investor_joined: notifications.filter(n => n.type === 'investor_joined').length,
    system: notifications.filter(n => n.type === 'system').length
  }

  const handleMarkAllAsRead = async () => {
    if (unreadNotifications === 0) return
    await markAllAsRead()
    await refreshNotifications()
  }

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id)
    await refreshNotifications()
  }

  const handleDelete = async (id: string) => {
    if (confirm(t('notifications.confirm_delete'))) {
      await deleteNotification(id)
      await refreshNotifications()
    }
  }

  if (isLoading) {
    return (
      <PartnerLayout
        title={t('partner.notifications')}
        subtitle={t('partner.manage_notifications')}
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PartnerLayout>
    )
  }

  return (
    <PartnerLayout
      title={t('partner.notifications')}
      subtitle={t('partner.manage_notifications')}
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">
                    {t('notifications.total_notifications')}
                  </p>
                  <p className="text-2xl font-bold text-blue-900">{totalNotifications}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">
                    {t('notifications.unread')}
                  </p>
                  <p className="text-2xl font-bold text-orange-900">{unreadNotifications}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">
                    {t('notifications.investments')}
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {notificationsByType.deal_funded + notificationsByType.new_investment}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">
                    {t('notifications.deal_updates')}
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {notificationsByType.deal_approved + notificationsByType.deal_rejected}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder={t('notifications.search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{t('notifications.all_types')}</option>
                  <option value="deal_funded">{t('notifications.deal_funded')}</option>
                  <option value="new_investment">{t('notifications.new_investments')}</option>
                  <option value="deal_approved">{t('notifications.deal_approved')}</option>
                  <option value="deal_rejected">{t('notifications.deal_rejected')}</option>
                  <option value="investor_joined">{t('notifications.investor_joined')}</option>
                  <option value="system">{t('notifications.system')}</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={refreshNotifications}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  {t('common.refresh')}
                </Button>
                {unreadNotifications > 0 && (
                  <Button 
                    onClick={handleMarkAllAsRead}
                    className="flex items-center gap-2"
                  >
                    <CheckCheck className="w-4 h-4" />
                    {t('notifications.mark_all_read')}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                      {t('notifications.notification')}
                    </th>
                    <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                      {t('notifications.type')}
                    </th>
                    <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                      {t('notifications.status')}
                    </th>
                    <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                      {t('notifications.date')}
                    </th>
                    <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                      {t('notifications.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredNotifications.map((notification) => (
                    <tr key={notification.id} className={`hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-3">
                            {getTypeIcon(notification.type)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {translateNotification(notification.title, notification.metadata)}
                            </div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {translateNotification(notification.message, notification.metadata)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getTypeBadge(notification.type)}>
                          {notification.type.replace('_', ' ').charAt(0).toUpperCase() + notification.type.replace('_', ' ').slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          notification.read 
                            ? 'bg-gray-100 text-gray-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {notification.read ? t('notifications.read') : t('notifications.unread')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(notification.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleMarkAsRead(notification.id)}
                              title={t('notifications.mark_as_read')}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => handleDelete(notification.id)}
                            title={t('notifications.delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredNotifications.length === 0 && (
              <div className="text-center py-12">
                <Bell className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {t('notifications.no_notifications')}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || typeFilter !== 'all' 
                    ? t('notifications.no_matching_notifications')
                    : t('notifications.no_notifications_yet')
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PartnerLayout>
  )
}

export default PartnerNotificationsPage
