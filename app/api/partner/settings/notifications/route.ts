import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/partner/settings/notifications - Get notification settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'PARTNER') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get or create notification settings
    let settings = await prisma.partnerNotificationSettings.findUnique({
      where: { userId: session.user.id }
    })

    if (!settings) {
      // Create default settings
      settings = await prisma.partnerNotificationSettings.create({
        data: {
          userId: session.user.id,
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          dealUpdates: true,
          investorMessages: true,
          systemAlerts: true,
          marketingEmails: false,
          weeklyReports: true,
          monthlyStatements: true
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching notification settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification settings' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT /api/partner/settings/notifications - Update notification settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'PARTNER') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const data = await request.json()

    // Update notification settings
    const settings = await prisma.partnerNotificationSettings.upsert({
      where: { userId: session.user.id },
      update: {
        emailNotifications: data.emailNotifications,
        smsNotifications: data.smsNotifications,
        pushNotifications: data.pushNotifications,
        dealUpdates: data.dealUpdates,
        investorMessages: data.investorMessages,
        systemAlerts: data.systemAlerts,
        marketingEmails: data.marketingEmails,
        weeklyReports: data.weeklyReports,
        monthlyStatements: data.monthlyStatements
      },
      create: {
        userId: session.user.id,
        emailNotifications: data.emailNotifications || true,
        smsNotifications: data.smsNotifications || false,
        pushNotifications: data.pushNotifications || true,
        dealUpdates: data.dealUpdates || true,
        investorMessages: data.investorMessages || true,
        systemAlerts: data.systemAlerts || true,
        marketingEmails: data.marketingEmails || false,
        weeklyReports: data.weeklyReports || true,
        monthlyStatements: data.monthlyStatements || true
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Notification settings updated successfully',
      settings 
    })

  } catch (error) {
    console.error('Error updating notification settings:', error)
    return NextResponse.json(
      { error: 'Failed to update notification settings' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
