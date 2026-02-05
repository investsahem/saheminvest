'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import AdminLayout from '../../components/layout/AdminLayout'
import { useTranslation } from '../../components/providers/I18nProvider'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import {
  Bell, Mail, Send, Users, Eye, Trash2, CheckCircle,
  Clock, AlertCircle, MessageSquare, Plus, Search, Filter
} from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'push'
  read: boolean
  userId: string
  user: {
    name: string
    email: string
    role: string
  }
  createdAt: string
  metadata?: string
}

const NotificationsPage = () => {
  const { data: session } = useSession()
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showSendModal, setShowSendModal] = useState(false)
  const [sendForm, setSendForm] = useState({
    userId: '',
    title: '',
    message: '',
    type: 'info',
    sendEmail: true,
    sendPush: true
  })

  // Helper function to translate stored notification keys
  const translateText = (text: string): string => {
    if (!text) return text
    // Check if text looks like a translation key (e.g. "notifications.deposit_approved_title")
    if (text.includes('.') && !text.includes(' ')) {
      const translated = t(text)
      // If translation returns the same key, return original text
      return translated !== text ? translated : text
    }
    return text
  }

  // Helper to translate notification type from DB
  const translateType = (type: string): string => {
    if (!type) return type
    // Normalize type: replace spaces with underscores for translation lookup
    const normalizedType = type.replace(/\s+/g, '_')
    const translationKey = `notifications.types.${normalizedType}`
    const translated = t(translationKey)
    // If translation found, return it; otherwise format the original type nicely
    if (translated !== translationKey) {
      return translated
    }
    // Fallback: capitalize first letter and replace underscores with spaces
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')
  }

  // Helper to clean up notification message (remove untranslated placeholders)
  const cleanMessage = (message: string): string => {
    if (!message) return message
    // First try to translate if it's a translation key
    let text = translateText(message)
    // Remove common placeholder patterns that weren't interpolated
    text = text.replace(/\$\{amount\}/g, '')
    text = text.replace(/\{amount\}/g, '')
    text = text.replace(/\{userEmail\}/g, '')
    text = text.replace(/\$\{[^}]+\}/g, '')
    text = text.replace(/\{[^}]+\}/g, '')
    // Clean up extra spaces
    text = text.replace(/\s+/g, ' ').trim()
    return text
  }

  // Fetch notifications from API
  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notifications/all')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      } else {
        console.error('Failed to fetch notifications')
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      })
      if (response.ok) {
        fetchNotifications()
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT'
      })
      if (response.ok) {
        fetchNotifications()
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      try {
        const response = await fetch(`/api/notifications/${notificationId}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          fetchNotifications()
        }
      } catch (error) {
        console.error('Error deleting notification:', error)
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'push':
        return <Bell className="w-5 h-5 text-purple-600" />
      default:
        return <MessageSquare className="w-5 h-5 text-blue-600" />
    }
  }

  const getTypeBadge = (type: string) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'warning':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'error':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'push':
        return `${baseClasses} bg-purple-100 text-purple-800`
      default:
        return `${baseClasses} bg-blue-100 text-blue-800`
    }
  }

  const handleSendNotification = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(sendForm)
      })

      if (response.ok) {
        alert('Notification sent successfully!')
        setShowSendModal(false)
        setSendForm({
          userId: '',
          title: '',
          message: '',
          type: 'info',
          sendEmail: true,
          sendPush: true
        })
        // Refresh notifications list
        fetchNotifications()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error sending notification:', error)
      alert('Error sending notification')
    }
  }

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = searchTerm === '' ||
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === 'all' || notification.type === typeFilter

    return matchesSearch && matchesType
  })

  // Calculate stats
  const totalNotifications = notifications.length
  const unreadNotifications = notifications.filter(n => !n.read).length
  const notificationsByType = {
    info: notifications.filter(n => n.type === 'info').length,
    success: notifications.filter(n => n.type === 'success').length,
    warning: notifications.filter(n => n.type === 'warning').length,
    error: notifications.filter(n => n.type === 'error').length,
    push: notifications.filter(n => n.type === 'push').length
  }

  if (loading) {
    return (
      <AdminLayout
        title={t('notifications.title')}
        subtitle={t('notifications.subtitle')}
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title={t('notifications.title')}
      subtitle={t('notifications.subtitle')}
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">{t('notifications.total_notifications')}</p>
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
                  <p className="text-sm font-medium text-orange-700">{t('notifications.unread')}</p>
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
                  <p className="text-sm font-medium text-green-700">{t('notifications.success')}</p>
                  <p className="text-2xl font-bold text-green-900">{notificationsByType.success}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">{t('notifications.warnings')}</p>
                  <p className="text-2xl font-bold text-yellow-900">{notificationsByType.warning}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">{t('notifications.push_notifications')}</p>
                  <p className="text-2xl font-bold text-purple-900">{notificationsByType.push}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-purple-600" />
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
                  <option value="info">{t('notifications.info')}</option>
                  <option value="success">{t('notifications.success')}</option>
                  <option value="warning">{t('notifications.warning')}</option>
                  <option value="error">{t('notifications.error')}</option>
                  <option value="push">{t('notifications.push')}</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={handleMarkAllAsRead}
                  disabled={unreadNotifications === 0}
                >
                  <CheckCircle className="w-4 h-4" />
                  {t('notifications.mark_all_as_read')}
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  {t('notifications.export')}
                </Button>
                <Button
                  className="flex items-center gap-2"
                  onClick={() => setShowSendModal(true)}
                >
                  <Plus className="w-4 h-4" />
                  {t('notifications.send_notification')}
                </Button>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('notifications.notification')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('notifications.user')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('notifications.type')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('notifications.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('notifications.date')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                              {translateText(notification.title)}
                            </div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {cleanMessage(notification.message)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {notification.user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {notification.user.email}
                          </div>
                          <div className="text-xs text-gray-400">
                            {notification.user.role}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getTypeBadge(notification.type)}>
                          {translateType(notification.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${notification.read
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
                              title="Mark as Read"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            title="Delete"
                            onClick={() => handleDeleteNotification(notification.id)}
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
                <h3 className="mt-2 text-sm font-medium text-gray-900">{t('notifications.no_notifications')}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t('notifications.no_notifications_message')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Send Notification Modal */}
        {showSendModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">{t('notifications.send_notification')}</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSendModal(false)}
                  >
                    ×
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('notifications.user_id_or_email')}
                    </label>
                    <Input
                      type="text"
                      value={sendForm.userId}
                      onChange={(e) => setSendForm(prev => ({ ...prev, userId: e.target.value }))}
                      placeholder={t('notifications.enter_user_id')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('notifications.title_label')}
                    </label>
                    <Input
                      type="text"
                      value={sendForm.title}
                      onChange={(e) => setSendForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={t('notifications.notification_title_placeholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('notifications.message')}
                    </label>
                    <textarea
                      value={sendForm.message}
                      onChange={(e) => setSendForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('notifications.notification_message')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('notifications.type')}
                    </label>
                    <select
                      value={sendForm.type}
                      onChange={(e) => setSendForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="info">{t('notifications.info')}</option>
                      <option value="success">{t('notifications.success')}</option>
                      <option value="warning">{t('notifications.warning')}</option>
                      <option value="error">{t('notifications.error')}</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={sendForm.sendEmail}
                        onChange={(e) => setSendForm(prev => ({ ...prev, sendEmail: e.target.checked }))}
                        className="mr-2"
                      />
                      <Mail className="w-4 h-4 mr-1" />
                      {t('notifications.send_email')}
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={sendForm.sendPush}
                        onChange={(e) => setSendForm(prev => ({ ...prev, sendPush: e.target.checked }))}
                        className="mr-2"
                      />
                      <Bell className="w-4 h-4 mr-1" />
                      {t('notifications.send_push')}
                    </label>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <Button onClick={handleSendNotification}>
                      <Send className="w-4 h-4 mr-2" />
                      {t('notifications.send_notification')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowSendModal(false)}
                    >
                      {t('notifications.cancel')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default NotificationsPage