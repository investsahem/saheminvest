import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import { PrismaClient } from '@prisma/client'
import { emailService } from '../../../../lib/email'

const prisma = new PrismaClient()

// POST /api/admin/notifications/deals - Send deal notification to admins
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { dealId, type, changes } = body // type: 'created' | 'updated'

    // Get deal details
    const deal = await prisma.project.findUnique({
      where: { id: dealId },
      include: {
        owner: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      )
    }

    // Get all admin emails
    const admins = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    const adminEmails = admins.map(admin => admin.email)

    if (adminEmails.length === 0) {
      return NextResponse.json(
        { error: 'No admins found' },
        { status: 404 }
      )
    }

    // Create notification record
    const notification = await prisma.notification.create({
      data: {
        userId: admins[0].id, // We'll create one notification for the first admin, but email all
        title: type === 'created' 
          ? `New Deal: ${deal.title}` 
          : `Deal Updated: ${deal.title}`,
        message: type === 'created'
          ? `${deal.owner?.name} has created a new deal "${deal.title}" that requires approval.`
          : `${deal.owner?.name} has updated the deal "${deal.title}" and it requires re-approval.`,
        type: 'DEAL_APPROVAL',
        metadata: JSON.stringify({
          dealId: deal.id,
          dealTitle: deal.title,
          partnerName: deal.owner?.name,
          type,
          changes: changes || []
        })
      }
    })

    // Send email notifications to all admins
    try {
      if (type === 'created') {
        await emailService.sendDealPendingNotification(
          adminEmails,
          deal.title,
          deal.owner?.name || 'Unknown Partner',
          deal.id
        )
      } else {
        await emailService.sendDealUpdateNotification(
          adminEmails,
          deal.title,
          deal.owner?.name || 'Unknown Partner',
          deal.id,
          changes || ['Deal details updated']
        )
      }
    } catch (emailError) {
      console.error('Error sending email notification:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      notification: {
        id: notification.id,
        title: notification.title,
        message: notification.message
      },
      emailsSent: adminEmails.length
    })

  } catch (error) {
    console.error('Error sending deal notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}

// GET /api/admin/notifications/deals - Get pending deal notifications count
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get count of pending deals
    const pendingDealsCount = await prisma.project.count({
      where: {
        status: 'PENDING'
      }
    })

    // Get recent deal notifications
    const notifications = await prisma.notification.findMany({
      where: {
        type: 'DEAL_APPROVAL',
        read: false
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    return NextResponse.json({
      pendingDealsCount,
      notifications: notifications.map(notif => ({
        id: notif.id,
        title: notif.title,
        message: notif.message,
        createdAt: notif.createdAt,
        data: notif.metadata ? JSON.parse(notif.metadata) : null
      }))
    })

  } catch (error) {
    console.error('Error getting deal notifications:', error)
    return NextResponse.json(
      { error: 'Failed to get notifications' },
      { status: 500 }
    )
  }
}
