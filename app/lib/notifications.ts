import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface PushNotification {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: Record<string, any>
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
}

export interface NotificationSubscription {
  userId: string
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

class NotificationService {
  private vapidPublicKey: string
  private vapidPrivateKey: string

  constructor() {
    this.vapidPublicKey = process.env.VAPID_PUBLIC_KEY || ''
    this.vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || ''
  }

  // Store notification in database
  async createNotification(userId: string, title: string, message: string, type: string = 'info', data?: Record<string, any>) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          read: false,
          metadata: data ? JSON.stringify(data) : null
        }
      })

      return notification
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

  // Send push notification to user
  async sendPushNotification(userId: string, notification: PushNotification) {
    try {
      // Get user's push subscriptions
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          id: true, 
          name: true, 
          email: true,
          // We'll need to add pushSubscriptions to the User model
        }
      })

      if (!user) {
        throw new Error('User not found')
      }

      // For now, we'll store the notification in the database
      // Later we can add actual push notification sending with web-push library
      await this.createNotification(
        userId,
        notification.title,
        notification.body,
        'push',
        notification.data
      )

      console.log(`Push notification sent to user ${userId}: ${notification.title}`)
      return { success: true, userId, title: notification.title }
    } catch (error) {
      console.error('Error sending push notification:', error)
      throw error
    }
  }

  // Send notification to multiple users
  async sendBulkNotifications(userIds: string[], notification: PushNotification) {
    const results = []
    
    for (const userId of userIds) {
      try {
        const result = await this.sendPushNotification(userId, notification)
        results.push(result)
      } catch (error) {
        console.error(`Failed to send notification to user ${userId}:`, error)
        results.push({ success: false, userId, error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }

    return results
  }

  // Transaction-specific notifications
  async notifyDepositReceived(userId: string, amount: number, reference: string) {
    const notification: PushNotification = {
      title: '💰 Deposit Received',
      body: `Your deposit of $${amount.toLocaleString()} has been received and is being processed.`,
      icon: '/icons/deposit.png',
      data: {
        type: 'deposit',
        amount,
        reference,
        action: 'view_transactions'
      },
      actions: [
        {
          action: 'view',
          title: 'View Details'
        }
      ]
    }

    await this.sendPushNotification(userId, notification)
  }

  async notifyDepositApproved(userId: string, amount: number, newBalance: number, reference: string) {
    const notification: PushNotification = {
      title: '✅ Deposit Approved',
      body: `$${amount.toLocaleString()} has been added to your wallet. New balance: $${newBalance.toLocaleString()}`,
      icon: '/icons/approved.png',
      data: {
        type: 'deposit_approved',
        amount,
        newBalance,
        reference,
        action: 'view_wallet'
      },
      actions: [
        {
          action: 'view_wallet',
          title: 'View Wallet'
        },
        {
          action: 'browse_deals',
          title: 'Browse Deals'
        }
      ]
    }

    await this.sendPushNotification(userId, notification)
  }

  async notifyWithdrawalRequest(userId: string, amount: number, reference: string) {
    const notification: PushNotification = {
      title: '💸 Withdrawal Request',
      body: `Your withdrawal request of $${amount.toLocaleString()} is being processed.`,
      icon: '/icons/withdrawal.png',
      data: {
        type: 'withdrawal',
        amount,
        reference,
        action: 'view_transactions'
      }
    }

    await this.sendPushNotification(userId, notification)
  }

  async notifyInvestmentSuccess(userId: string, amount: number, dealTitle: string, reference: string) {
    const notification: PushNotification = {
      title: '🎯 Investment Successful',
      body: `Your investment of $${amount.toLocaleString()} in "${dealTitle}" has been confirmed.`,
      icon: '/icons/investment.png',
      data: {
        type: 'investment',
        amount,
        dealTitle,
        reference,
        action: 'view_portfolio'
      },
      actions: [
        {
          action: 'view_portfolio',
          title: 'View Portfolio'
        }
      ]
    }

    await this.sendPushNotification(userId, notification)
  }

  async notifyReturnPayment(userId: string, amount: number, dealTitle: string, reference: string) {
    const notification: PushNotification = {
      title: '💰 Return Payment',
      body: `You received $${amount.toLocaleString()} return from "${dealTitle}".`,
      icon: '/icons/return.png',
      data: {
        type: 'return',
        amount,
        dealTitle,
        reference,
        action: 'view_portfolio'
      },
      actions: [
        {
          action: 'view_portfolio',
          title: 'View Portfolio'
        },
        {
          action: 'reinvest',
          title: 'Reinvest'
        }
      ]
    }

    await this.sendPushNotification(userId, notification)
  }

  // Admin notifications
  async notifyAdmins(title: string, message: string, data?: Record<string, any>) {
    try {
      // Get all admin users
      const admins = await prisma.user.findMany({
        where: { 
          role: 'ADMIN',
          isActive: true 
        },
        select: { id: true }
      })

      const adminIds = admins.map(admin => admin.id)
      
      const notification: PushNotification = {
        title: `🚨 ${title}`,
        body: message,
        icon: '/icons/admin.png',
        data: {
          type: 'admin',
          ...data
        }
      }

      return await this.sendBulkNotifications(adminIds, notification)
    } catch (error) {
      console.error('Error notifying admins:', error)
      throw error
    }
  }

  async notifyNewDeposit(amount: number, userEmail: string, reference: string) {
    await this.notifyAdmins(
      'New Deposit Received',
      `New deposit of $${amount.toLocaleString()} from ${userEmail} requires approval.`,
      {
        type: 'new_deposit',
        amount,
        userEmail,
        reference,
        action: 'review_transaction'
      }
    )
  }

  async notifyNewWithdrawal(amount: number, userEmail: string, reference: string) {
    await this.notifyAdmins(
      'New Withdrawal Request',
      `Withdrawal request of $${amount.toLocaleString()} from ${userEmail} requires approval.`,
      {
        type: 'new_withdrawal',
        amount,
        userEmail,
        reference,
        action: 'review_transaction'
      }
    )
  }

  async notifyNewInvestment(amount: number, userEmail: string, dealTitle: string) {
    await this.notifyAdmins(
      'New Investment',
      `${userEmail} invested $${amount.toLocaleString()} in "${dealTitle}".`,
      {
        type: 'new_investment',
        amount,
        userEmail,
        dealTitle,
        action: 'view_analytics'
      }
    )
  }

  async notifyNewPartnerApplication(companyName: string, contactEmail: string) {
    await this.notifyAdmins(
      'New Partner Application',
      `New partner application from ${companyName} (${contactEmail}) requires review.`,
      {
        type: 'new_partner',
        companyName,
        contactEmail,
        action: 'review_partners'
      }
    )
  }

  // Get user notifications
  async getUserNotifications(userId: string, limit: number = 20, offset: number = 0) {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      })

      return notifications
    } catch (error) {
      console.error('Error fetching user notifications:', error)
      throw error
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string) {
    try {
      const notification = await prisma.notification.update({
        where: { 
          id: notificationId,
          userId // Ensure user can only mark their own notifications
        },
        data: { read: true }
      })

      return notification
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }

  // Mark all notifications as read for user
  async markAllAsRead(userId: string) {
    try {
      const result = await prisma.notification.updateMany({
        where: { 
          userId,
          read: false 
        },
        data: { read: true }
      })

      return result
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      throw error
    }
  }

  // Get unread count
  async getUnreadCount(userId: string) {
    try {
      const count = await prisma.notification.count({
        where: { 
          userId,
          read: false 
        }
      })

      return count
    } catch (error) {
      console.error('Error getting unread count:', error)
      throw error
    }
  }

  // Delete old notifications (cleanup)
  async cleanupOldNotifications(daysOld: number = 30) {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      const result = await prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          },
          read: true // Only delete read notifications
        }
      })

      console.log(`Cleaned up ${result.count} old notifications`)
      return result
    } catch (error) {
      console.error('Error cleaning up notifications:', error)
      throw error
    }
  }
}

export const notificationService = new NotificationService()
export default notificationService