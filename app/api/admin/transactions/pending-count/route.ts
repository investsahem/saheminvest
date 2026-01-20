import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/db'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Count pending deposits
        const pendingDeposits = await prisma.transaction.count({
            where: {
                type: 'DEPOSIT',
                status: 'PENDING'
            }
        })

        // Count pending withdrawals
        const pendingWithdrawals = await prisma.transaction.count({
            where: {
                type: 'WITHDRAWAL',
                status: 'PENDING'
            }
        })

        return NextResponse.json({
            pendingDeposits,
            pendingWithdrawals,
            total: pendingDeposits + pendingWithdrawals
        })

    } catch (error) {
        console.error('Error fetching pending transactions count:', error)
        return NextResponse.json(
            { error: 'Failed to fetch pending transactions count' },
            { status: 500 }
        )
    }
}
