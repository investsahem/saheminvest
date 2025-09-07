import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface InvestorNotification {
  id: string
  title: string
  message: string
  type: 'investment_confirmed' | 'return_payment' | 'deal_update' | 'deposit_approved' | 'withdrawal_approved' | 'system' | 'info'
  read: boolean
  createdAt: string
  metadata?: {
    dealId?: string
    dealTitle?: string
    amount?: number
    partnerName?: string
    action?: string
    transactionId?: string
  }
}

interface InvestorNotificationStats {
  total: number
  unread: number
  newReturns: number
  dealUpdates: number
  transactionUpdates: number
  [key: string]: number
}

export const useInvestorNotifications = () => {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<InvestorNotification[]>([])
  const [stats, setStats] = useState<InvestorNotificationStats>({
    total: 0,
    unread: 0,
    newReturns: 0,
    dealUpdates: 0,
    transactionUpdates: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = async () => {
    if (!session?.user || session.user.role !== 'INVESTOR') {
      setIsLoading(false)
      return
    }

    try {
      setError(null)
      const response = await fetch('/api/investor/notifications', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setStats(data.stats || {
          total: 0,
          unread: 0,
          newReturns: 0,
          dealUpdates: 0,
          transactionUpdates: 0
        })
      } else {
        throw new Error(`Failed to fetch notifications: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error fetching investor notifications:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch notifications')
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ read: true })
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: true }
              : notification
          )
        )
        setStats(prev => ({
          ...prev,
          unread: Math.max(0, prev.unread - 1)
        }))
        return true
      } else {
        throw new Error('Failed to mark notification as read')
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return false
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        )
        setStats(prev => ({ ...prev, unread: 0 }))
        return true
      } else {
        throw new Error('Failed to mark all notifications as read')
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      return false
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        setStats(prev => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
          unread: prev.unread > 0 ? prev.unread - 1 : 0
        }))
        return true
      } else {
        throw new Error('Failed to delete notification')
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      return false
    }
  }

  useEffect(() => {
    fetchNotifications()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    
    return () => clearInterval(interval)
  }, [session])

  return {
    notifications,
    stats,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: fetchNotifications
  }
}
