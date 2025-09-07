import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/partner/settings/security - Get security settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'PARTNER') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get or create security settings
    let settings = await prisma.partnerSecuritySettings.findUnique({
      where: { userId: session.user.id }
    })

    if (!settings) {
      // Create default settings
      settings = await prisma.partnerSecuritySettings.create({
        data: {
          userId: session.user.id,
          twoFactorEnabled: false,
          sessionTimeout: 30,
          loginAlerts: true,
          ipWhitelist: [],
          deviceManagement: true
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching security settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch security settings' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT /api/partner/settings/security - Update security settings
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

    // Update security settings
    const settings = await prisma.partnerSecuritySettings.upsert({
      where: { userId: session.user.id },
      update: {
        twoFactorEnabled: data.twoFactorEnabled,
        sessionTimeout: data.sessionTimeout,
        loginAlerts: data.loginAlerts,
        ipWhitelist: data.ipWhitelist || [],
        deviceManagement: data.deviceManagement
      },
      create: {
        userId: session.user.id,
        twoFactorEnabled: data.twoFactorEnabled || false,
        sessionTimeout: data.sessionTimeout || 30,
        loginAlerts: data.loginAlerts || true,
        ipWhitelist: data.ipWhitelist || [],
        deviceManagement: data.deviceManagement || true
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Security settings updated successfully',
      settings 
    })

  } catch (error) {
    console.error('Error updating security settings:', error)
    return NextResponse.json(
      { error: 'Failed to update security settings' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
