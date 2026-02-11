import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import emailService from '../../../lib/email'

const prisma = new PrismaClient()

// POST /api/partner/change-password
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (session.user.role !== 'PARTNER') {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
        }

        const { currentPassword, newPassword } = await request.json()

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Current and new passwords are required' }, { status: 400 })
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ error: 'New password must be at least 8 characters long' }, { status: 400 })
        }

        // Get the user from database
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, password: true, email: true, name: true }
        })

        if (!user || !user.password) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // Update password in database
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        })

        // Send confirmation email
        try {
            await emailService.sendPasswordChangedEmail(user.email, user.name || 'Partner')
        } catch (emailError) {
            console.error('Failed to send password changed email:', emailError)
            // Don't fail the whole request if email fails
        }

        return NextResponse.json({ message: 'Password changed successfully' })
    } catch (error) {
        console.error('Error changing password:', error)
        return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
    }
}
