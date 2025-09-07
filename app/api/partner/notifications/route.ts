import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'PARTNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Fetch notifications for the partner
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    // Calculate stats
    const stats = await prisma.notification.groupBy({
      by: ['read', 'type'],
      where: { userId },
      _count: true
    })

    const unreadCount = await prisma.notification.count({
      where: { 
        userId,
        read: false 
      }
    })

    // Get partner-specific stats
    const partnerProfile = await prisma.partnerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            projects: {
              include: {
                investments: true,
                _count: {
                  select: { investments: true }
                }
              }
            }
          }
        }
      }
    })

    // Count new investors in the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const newInvestors = await prisma.investment.count({
      where: {
        project: {
          ownerId: userId
        },
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    })

    // Count completed deals in the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const completedDeals = await prisma.project.count({
      where: {
        ownerId: userId,
        status: 'COMPLETED',
        updatedAt: {
          gte: thirtyDaysAgo
        }
      }
    })

    // Count pending profit distribution requests
    const pendingDistributions = await prisma.profitDistributionRequest.count({
      where: {
        project: {
          ownerId: userId
        },
        status: 'PENDING'
      }
    })

    const notificationStats = {
      total: notifications.length,
      unread: unreadCount,
      newInvestors,
      completedDeals,
      pendingDistributions
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
    console.error('Error fetching partner notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
