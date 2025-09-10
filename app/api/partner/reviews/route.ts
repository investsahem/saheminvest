import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - List reviews for the authenticated partner
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the partner
    const partner = await prisma.partner.findFirst({
      where: { userId: session.user.id }
    })

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || 'all'
    
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      partnerId: partner.id
    }

    if (status !== 'all') {
      where.status = status
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
          }
        }
      }),
      prisma.partnerReview.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      reviews,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    })

  } catch (error) {
    console.error('Error fetching partner reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST - Create a new review (for investors)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only investors can create reviews
    if (session.user.role !== 'INVESTOR') {
      return NextResponse.json({ error: 'Only investors can create reviews' }, { status: 403 })
    }

    const { partnerId, projectId, rating, comment } = await request.json()

    // Validate required fields
    if (!partnerId || !projectId || !rating) {
      return NextResponse.json(
        { error: 'Partner ID, project ID, and rating are required' },
        { status: 400 }
      )
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if the investor has invested in this deal
    const investment = await prisma.investment.findFirst({
      where: {
        investorId: session.user.id,
        projectId: projectId,
        status: {
          in: ['ACTIVE', 'COMPLETED']
        }
      }
    })

    if (!investment) {
      return NextResponse.json(
        { error: 'You can only review partners for deals you have invested in' },
        { status: 403 }
      )
    }

    // Check if review already exists
    const existingReview = await prisma.partnerReview.findUnique({
      where: {
        partnerId_investorId_projectId: {
          partnerId,
          investorId: session.user.id,
          projectId
        }
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this partner for this deal' },
        { status: 409 }
      )
    }

    // Create the review
    const review = await prisma.partnerReview.create({
      data: {
        partnerId,
        investorId: session.user.id,
        projectId,
        rating,
        comment,
        status: 'PENDING'
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
            companyName: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Review submitted successfully and is pending approval',
      review
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
