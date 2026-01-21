import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/db'

// Admin notification settings key
const ADMIN_NOTIFICATION_KEY = 'admin_notifications'

// Default settings
const DEFAULT_SETTINGS = {
    adminNotificationEmail: '',
    notifyOnInvestment: true,
    notifyOnDeposit: true,
    notifyOnWithdrawal: true,
    notifyOnProfitDistribution: true
}

// GET /api/admin/settings - Get admin notification settings
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Fetch the settings from the database
        const settingsRecord = await prisma.systemSettings.findUnique({
            where: { key: ADMIN_NOTIFICATION_KEY }
        })

        if (!settingsRecord) {
            return NextResponse.json({
                settings: DEFAULT_SETTINGS
            })
        }

        return NextResponse.json({
            settings: settingsRecord.value
        })

    } catch (error) {
        console.error('Error fetching admin settings:', error)
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        )
    }
}

// PUT /api/admin/settings - Update admin notification settings
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const {
            adminNotificationEmail,
            notifyOnInvestment,
            notifyOnDeposit,
            notifyOnWithdrawal,
            notifyOnProfitDistribution
        } = body

        // Validate email format if provided
        if (adminNotificationEmail && adminNotificationEmail.trim() !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(adminNotificationEmail)) {
                return NextResponse.json(
                    { error: 'Invalid email format' },
                    { status: 400 }
                )
            }
        }

        const settingsValue = {
            adminNotificationEmail: adminNotificationEmail?.trim() || '',
            notifyOnInvestment: notifyOnInvestment ?? true,
            notifyOnDeposit: notifyOnDeposit ?? true,
            notifyOnWithdrawal: notifyOnWithdrawal ?? true,
            notifyOnProfitDistribution: notifyOnProfitDistribution ?? true
        }

        // Upsert the settings
        const updatedSettings = await prisma.systemSettings.upsert({
            where: { key: ADMIN_NOTIFICATION_KEY },
            update: {
                value: settingsValue,
                updatedAt: new Date()
            },
            create: {
                key: ADMIN_NOTIFICATION_KEY,
                value: settingsValue,
                description: 'Admin email notification settings'
            }
        })

        return NextResponse.json({
            message: 'Settings updated successfully',
            settings: updatedSettings.value
        })

    } catch (error) {
        console.error('Error updating admin settings:', error)
        return NextResponse.json(
            { error: 'Failed to update settings' },
            { status: 500 }
        )
    }
}
