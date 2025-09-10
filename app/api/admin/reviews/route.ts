import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - List all reviews for admin management
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can manage reviews
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || 'all'
    const partnerId = searchParams.get('partnerId')
    
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (status !== 'all') {
      where.status = status
    }

    if (partnerId) {
      where.partnerId = partnerId
    }

    const [reviews, total] = await Promise.all([
      prisma.partnerReview.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          investor: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          project: {
            select: {
              id: true,
              title: true
            }
          },
          partner: {
            select: {
              id: true,
              companyName: true,
              industry: true
            }
          }
        }
      }),
      prisma.partnerReview.count({ where })
    ])

    // Get review statistics
    const stats = await prisma.partnerReview.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    })

    const reviewStats = {
      total,
      pending: stats.find(s => s.status === 'PENDING')?._count.id || 0,
      approved: stats.find(s => s.status === 'APPROVED')?._count.id || 0,
      rejected: stats.find(s => s.status === 'REJECTED')?._count.id || 0
    }

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      reviews,
      stats: reviewStats,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    })

  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}
