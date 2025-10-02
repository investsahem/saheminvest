import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/deals/stats - Get deal statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin or deal manager
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (user?.role !== 'ADMIN' && user?.role !== 'DEAL_MANAGER') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get total deals count
    const totalCount = await prisma.project.count()

    // Get deals by status
    const statusCounts = await prisma.project.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    // Convert to object for easier access
    const statusCountsObj = statusCounts.reduce((acc, item) => {
      acc[item.status] = item._count.status
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      totalCount,
      statusCounts: statusCountsObj,
      pendingCount: statusCountsObj.PENDING || 0,
      activeCount: statusCountsObj.ACTIVE || 0,
      completedCount: statusCountsObj.COMPLETED || 0,
      draftCount: statusCountsObj.DRAFT || 0
    })
  } catch (error) {
    console.error('Error fetching deal stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deal stats' },
      { status: 500 }
    )
  }
}

