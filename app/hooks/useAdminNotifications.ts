import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

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

interface AdminNotifications {
  pendingDealsCount: number
  notifications: DealNotification[]
}

export const useAdminNotifications = () => {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<AdminNotifications>({
    pendingDealsCount: 0,
    notifications: []
  })
  const [isLoading, setIsLoading] = useState(true)

  const fetchNotifications = async () => {
    if (!session?.user || session.user.role !== 'ADMIN') {
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/notifications/deals', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      } else {
        console.error('Error fetching notifications:', response.statusText)
      }
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
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    
    return () => clearInterval(interval)
  }, [session])

  return {
    notifications,
    isLoading,
    sendDealNotification,
    refreshNotifications: fetchNotifications
  }
}


