import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useNotificationSound } from './useNotificationSound'

interface DealNotification {
  id: string
  title: string
  message: string
  createdAt: string
  data: {
    dealId: string
    dealTitle: string
    partnerName: string
    type: 'created' | 'updated'
    changes?: string[]
  }
}

interface GeneralNotification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
  metadata: any
}

interface AdminNotifications {
  pendingDealsCount: number
  notifications: DealNotification[]
  generalNotifications: GeneralNotification[]
  unreadCount: number
}

export const useAdminNotifications = () => {
  const { data: session } = useSession()
  const { checkAndPlaySound } = useNotificationSound()
  const [notifications, setNotifications] = useState<AdminNotifications>({
    pendingDealsCount: 0,
    notifications: [],
    generalNotifications: [],
    unreadCount: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  const fetchNotifications = async () => {
    if (!session?.user || session.user.role !== 'ADMIN') {
      setIsLoading(false)
      return
    }

    try {
      // Fetch both deal notifications and general notifications
      const [dealResponse, generalResponse] = await Promise.all([
        fetch('/api/admin/notifications/deals', {
          credentials: 'include'
        }),
        fetch('/api/admin/notifications', {
          credentials: 'include'
        })
      ])

      const results: Partial<AdminNotifications> = {
        pendingDealsCount: 0,
        notifications: [],
        generalNotifications: [],
        unreadCount: 0
      }

      // Handle deal notifications
      if (dealResponse.ok) {
        const dealData = await dealResponse.json()
        results.pendingDealsCount = dealData.pendingDealsCount || 0
        results.notifications = dealData.notifications || []
      } else {
        console.error('Error fetching deal notifications:', dealResponse.statusText)
      }

      // Handle general notifications
      if (generalResponse.ok) {
        const generalData = await generalResponse.json()
        results.generalNotifications = generalData.notifications || []
        results.unreadCount = generalData.unreadCount || 0

        // Check if we should play sound (new notifications)
        checkAndPlaySound(results.unreadCount ?? 0)
      } else {
        console.error('Error fetching general notifications:', generalResponse.statusText)
      }

      setNotifications(results as AdminNotifications)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Send notification when deal is created or updated
  const sendDealNotification = async (dealId: string, type: 'created' | 'updated', changes?: string[]) => {
    try {
      const response = await fetch('/api/admin/notifications/deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          dealId,
          type,
          changes
        })
      })

      if (response.ok) {
        // Refresh notifications after sending
        await fetchNotifications()
        return true
      } else {
        console.error('Error sending notification:', response.statusText)
        return false
      }
    } catch (error) {
      console.error('Error sending notification:', error)
      return false
    }
  }

  useEffect(() => {
    fetchNotifications()

    // Poll for new notifications every 10 seconds for near-real-time updates
    const interval = setInterval(fetchNotifications, 10000)

    return () => clearInterval(interval)
  }, [session])

  // Mark notifications as read
  const markNotificationsAsRead = async (notificationIds?: string[], markAll = false) => {
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          notificationIds,
          markAll
        })
      })

      if (response.ok) {
        // Refresh notifications after marking as read
        await fetchNotifications()
        return true
      } else {
        console.error('Error marking notifications as read:', response.statusText)
        return false
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error)
      return false
    }
  }

  return {
    notifications,
    isLoading,
    sendDealNotification,
    refreshNotifications: fetchNotifications,
    markAsRead: markNotificationsAsRead
  }
}


