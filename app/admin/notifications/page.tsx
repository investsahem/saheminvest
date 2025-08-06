'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import AdminLayout from '../../components/layout/AdminLayout'
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

  // Sample data - in real app, fetch from API
  useEffect(() => {
    const sampleNotifications: Notification[] = [
      {
        id: '1',
        title: 'Deposit Approved',
        message: 'Your deposit of $15,000 has been approved and added to your wallet.',
        type: 'success',
        read: true,
        userId: 'user1',
        user: {
          name: 'Ahmed Al-Rashid',
          email: 'investor@sahaminvest.com',
          role: 'INVESTOR'
        },
        createdAt: '2024-01-20T10:30:00Z'
      },
      {
        id: '2',
        title: 'Investment Successful',
        message: 'Your investment of $5,000 in Electronics Manufacturing Project has been confirmed.',
        type: 'success',
        read: false,
        userId: 'user1',
        user: {
          name: 'Ahmed Al-Rashid',
          email: 'investor@sahaminvest.com',
          role: 'INVESTOR'
        },
        createdAt: '2024-01-19T14:15:00Z'
      },
      {
        id: '3',
        title: 'New Partner Application',
        message: 'New partner application from Healthcare Innovations LLC requires review.',
        type: 'info',
        read: false,
        userId: 'admin1',
        user: {
          name: 'Admin User',
          email: 'admin@sahaminvest.com',
          role: 'ADMIN'
        },
        createdAt: '2024-01-18T09:45:00Z'
      },
      {
        id: '4',
        title: 'Withdrawal Request',
        message: 'Withdrawal request of $2,000 from Sarah Johnson requires approval.',
        type: 'warning',
        read: false,
        userId: 'admin1',
        user: {
          name: 'Admin User',
          email: 'admin@sahaminvest.com',
          role: 'ADMIN'
        },
        createdAt: '2024-01-17T16:20:00Z'
      },
      {
        id: '5',
        title: 'System Maintenance',
        message: 'Scheduled system maintenance will occur tonight from 2:00 AM to 4:00 AM.',
        type: 'info',
        read: true,
        userId: 'user2',
        user: {
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          role: 'INVESTOR'
        },
        createdAt: '2024-01-16T11:10:00Z'
      }
    ]
    
    setNotifications(sampleNotifications)
    setLoading(false)
  }, [])

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
        // fetchNotifications()
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
        title="Notification Management"
        subtitle="Manage system notifications and communications"
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title="Notification Management"
      subtitle="Manage system notifications and communications"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Notifications</p>
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
                  <p className="text-sm font-medium text-orange-700">Unread</p>
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
                  <p className="text-sm font-medium text-green-700">Success</p>
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
                  <p className="text-sm font-medium text-yellow-700">Warnings</p>
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
                  <p className="text-sm font-medium text-purple-700">Push Notifications</p>
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
                    placeholder="Search notifications..."
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
                  <option value="all">All Types</option>
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="push">Push</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Export
                </Button>
                <Button 
                  className="flex items-center gap-2"
                  onClick={() => setShowSendModal(true)}
                >
                  <Plus className="w-4 h-4" />
                  Send Notification
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
                      Notification
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
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
                              {notification.title}
                            </div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {notification.message}
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
                          {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          notification.read 
                            ? 'bg-gray-100 text-gray-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {notification.read ? 'Read' : 'Unread'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(notification.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" title="View Details">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            title="Delete"
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
                <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No notifications match your current filters.
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
                  <h3 className="text-lg font-semibold text-gray-900">Send Notification</h3>
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
                      User ID or Email
                    </label>
                    <Input
                      type="text"
                      value={sendForm.userId}
                      onChange={(e) => setSendForm(prev => ({ ...prev, userId: e.target.value }))}
                      placeholder="Enter user ID or email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <Input
                      type="text"
                      value={sendForm.title}
                      onChange={(e) => setSendForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Notification title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      value={sendForm.message}
                      onChange={(e) => setSendForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Notification message"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={sendForm.type}
                      onChange={(e) => setSendForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="info">Info</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
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
                      Send Email
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={sendForm.sendPush}
                        onChange={(e) => setSendForm(prev => ({ ...prev, sendPush: e.target.checked }))}
                        className="mr-2"
                      />
                      <Bell className="w-4 h-4 mr-1" />
                      Send Push Notification
                    </label>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <Button onClick={handleSendNotification}>
                      <Send className="w-4 h-4 mr-2" />
                      Send Notification
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowSendModal(false)}
                    >
                      Cancel
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