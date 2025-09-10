import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '16')
    const search = searchParams.get('search')
    const industry = searchParams.get('industry')
    
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (industry && industry !== 'all') {
      where.industry = industry
    }

    // Get partners with deal counts and ratings
    const [partners, total] = await Promise.all([
      prisma.partner.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { verified: 'desc' }, // Verified partners first
          { createdAt: 'desc' }
        ],
        include: {
          _count: {
            select: {
              deals: true
            }
          },
          deals: {
            select: {
              id: true,
              title: true,
              status: true,
              expectedReturn: true,
              currentFunding: true,
              fundingGoal: true
            },
            where: {
              status: {
                in: ['ACTIVE', 'PUBLISHED', 'FUNDED', 'COMPLETED']
              }
            }
          },
          reviews: {
            select: {
              rating: true
            },
            where: {
              status: 'APPROVED'
            }
          }
        }
      }),
      prisma.partner.count({ where })
    ])

    // Calculate average ratings
    const partnersWithRatings = partners.map(partner => {
      const ratings = partner.reviews.map(r => r.rating)
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : null
      
      return {
        ...partner,
        averageRating,
        totalReviews: ratings.length,
        reviews: undefined // Remove reviews from response for privacy
      }
    })

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      partners: partnersWithRatings,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    })

  } catch (error) {
    console.error('Error fetching public partners:', error)
    return NextResponse.json(
      { error: 'Failed to fetch partners' },
      { status: 500 }
    )
  }
}
