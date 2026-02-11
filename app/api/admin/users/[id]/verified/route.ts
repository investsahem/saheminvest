import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'

// PATCH /api/admin/users/[id]/verified - Toggle partner verified status
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: userId } = await params
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { verified } = await request.json()

        if (typeof verified !== 'boolean') {
            return NextResponse.json(
                { error: 'verified must be a boolean' },
                { status: 400 }
            )
        }

        // Check if user exists and is a partner
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, name: true }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        if (user.role !== 'PARTNER') {
            return NextResponse.json(
                { error: 'User is not a partner' },
                { status: 400 }
            )
        }

        // Update the partner profile verified status
        const partnerProfile = await prisma.partnerProfile.upsert({
            where: { userId },
            update: {
                isVerified: verified,
                verificationDate: verified ? new Date() : null
            },
            create: {
                userId,
                companyName: user.name || 'Partner',
                isVerified: verified,
                verificationDate: verified ? new Date() : null
            }
        })

        return NextResponse.json({
            message: verified ? 'Partner verified successfully' : 'Partner verification removed',
            verified: partnerProfile.isVerified
        })

    } catch (error) {
        console.error('Error updating partner verified status:', error)
        return NextResponse.json(
            { error: 'Failed to update partner verified status' },
            { status: 500 }
        )
    }
}
