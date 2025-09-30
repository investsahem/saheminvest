import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/deal-update-requests - Get all pending update requests
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'PENDING'

    const updateRequests = await prisma.dealUpdateRequest.findMany({
      where: {
        status: status as any
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
            thumbnailImage: true
          }
        },
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            partnerProfile: {
              select: {
                companyName: true,
                logo: true
              }
            }
          }
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ updateRequests })
  } catch (error) {
    console.error('Error fetching update requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch update requests' },
      { status: 500 }
    )
  }
}
