import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface PartnerNotification {
  id: string
  title: string
  message: string
  type: 'deal_funded' | 'investor_joined' | 'distribution_request' | 'deal_completed' | 'system' | 'info'
  read: boolean
  createdAt: string
  metadata?: {
    dealId?: string
    dealTitle?: string
    amount?: number
    investorName?: string
    action?: string
  }
}

interface PartnerNotificationStats {
  total: number
  unread: number
  newInvestors: number
  completedDeals: number
  pendingDistributions: number
}

export const usePartnerNotifications = () => {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<PartnerNotification[]>([])
  const [stats, setStats] = useState<PartnerNotificationStats>({
    total: 0,
    unread: 0,
    newInvestors: 0,
    completedDeals: 0,
    pendingDistributions: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = async () => {
    if (!session?.user || session.user.role !== 'PARTNER') {
      setIsLoading(false)
      return
    }

    try {
      setError(null)
      const response = await fetch('/api/partner/notifications', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setStats(data.stats || {
          total: 0,
          unread: 0,
          newInvestors: 0,
          completedDeals: 0,
          pendingDistributions: 0
        })
      } else {
        throw new Error(`Failed to fetch notifications: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error fetching partner notifications:', error)
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
