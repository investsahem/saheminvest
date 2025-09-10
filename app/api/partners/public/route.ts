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

    // Build where clause for PartnerProfile
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

    // Only show profiles where the user has an active partner status
    where.user = {
      partner: {
        status: {
          in: ['ACTIVE', 'PENDING'] // Show active and pending partners
        }
      }
    }

    // Get partner profiles with deal counts and ratings
    const [partnerProfiles, total] = await Promise.all([
      prisma.partnerProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { createdAt: 'desc' }
        ],
        include: {
          user: {
            select: {
              id: true,
              partner: {
                select: {
                  id: true,
                  status: true,
                  _count: {
                    select: {
                      projects: true
                    }
                  },
                  projects: {
                    select: {
                      id: true,
                      title: true,
                      status: true,
                      expectedReturn: true,
                      currentFunding: true,
                      fundingGoal: true
                    }
                    // Include all deals (including closed ones)
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
              }
            }
          }
        }
      }),
      prisma.partnerProfile.count({ where })
    ])

    // Map to the expected format
    const partnersWithRatings = partnerProfiles.map(profile => {
      const partner = profile.user?.partner
      const ratings = partner?.reviews?.map(r => r.rating) || []
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : null
      
      return {
        id: partner?.id || profile.id,
        companyName: profile.companyName,
        contactEmail: profile.email,
        contactPhone: profile.phone,
        industry: profile.industry,
        description: profile.description,
        website: profile.website,
        foundedYear: profile.foundedYear,
        employeeCount: profile.employeeCount,
        location: profile.city && profile.country ? `${profile.city}, ${profile.country}` : null,
        logoUrl: profile.logo,
        verified: partner?.status === 'ACTIVE',
        createdAt: profile.createdAt,
        status: partner?.status || 'PENDING',
        averageRating,
        totalReviews: ratings.length,
        _count: {
          deals: partner?._count?.projects || 0
        },
        deals: partner?.projects || []
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
