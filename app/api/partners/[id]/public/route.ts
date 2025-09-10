import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: partnerId } = await params

    if (!partnerId) {
      return NextResponse.json(
        { error: 'Partner ID is required' },
        { status: 400 }
      )
    }

    // Get partner with deals and reviews
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
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
            description: true,
            thumbnailImage: true,
            status: true,
            expectedReturn: true,
            currentFunding: true,
            fundingGoal: true,
            duration: true,
            endDate: true,
            minInvestment: true,
            _count: {
              select: {
                investments: true
              }
            }
          },
          where: {
            status: {
              in: ['ACTIVE', 'PUBLISHED', 'FUNDED', 'COMPLETED']
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            investor: {
              select: {
                name: true
              }
            },
            project: {
              select: {
                title: true
              }
            }
          },
          where: {
            status: 'APPROVED'
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    // Calculate average rating
    const ratings = partner.reviews.map(r => r.rating)
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      : null

    const partnerWithRating = {
      ...partner,
      averageRating,
      totalReviews: ratings.length
    }

    return NextResponse.json(partnerWithRating)

  } catch (error) {
    console.error('Error fetching partner details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch partner details' },
      { status: 500 }
    )
  }
}
