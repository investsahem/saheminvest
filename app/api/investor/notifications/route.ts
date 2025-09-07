import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'INVESTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Fetch notifications for the investor
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    const unreadCount = await prisma.notification.count({
      where: { 
        userId,
        read: false 
      }
    })

    // Get investor-specific stats
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Count new returns/profits in the last 7 days
    const newReturns = await prisma.transaction.count({
      where: {
        userId,
        type: 'RETURN',
        status: 'COMPLETED',
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    })

    // Count deal updates (timeline updates, status changes) in last 30 days
    const dealUpdates = await prisma.notification.count({
      where: {
        userId,
        type: 'deal_update',
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    })

    // Count transaction updates (deposits, withdrawals approved) in last 30 days
    const transactionUpdates = await prisma.notification.count({
      where: {
        userId,
        type: {
          in: ['deposit_approved', 'withdrawal_approved', 'investment_confirmed']
        },
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    })

    const notificationStats = {
      total: notifications.length,
      unread: unreadCount,
      newReturns,
      dealUpdates,
      transactionUpdates
    }

    // Format notifications for frontend
    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      read: notification.read,
      createdAt: notification.createdAt.toISOString(),
      metadata: notification.metadata ? JSON.parse(notification.metadata as string) : null
    }))

    return NextResponse.json({
      notifications: formattedNotifications,
      stats: notificationStats
    })

  } catch (error) {
    console.error('Error fetching investor notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
