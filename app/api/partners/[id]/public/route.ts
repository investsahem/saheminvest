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

    // First try to find by Partner ID, then by PartnerProfile ID
    let partnerProfile = null
    let partner = null

    // Try to find partner first and get their profile
    partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      include: {
        user: {
          select: {
            partnerProfile: true
          }
        }
      }
    })

    if (partner?.user?.partnerProfile) {
      partnerProfile = partner.user.partnerProfile
    } else {
      // If not found by partner ID, try by profile ID directly
      partnerProfile = await prisma.partnerProfile.findUnique({
        where: { id: partnerId },
        include: {
          user: {
            select: {
              partner: true
            }
          }
        }
      })
      partner = partnerProfile?.user?.partner
    }

    if (!partnerProfile) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    // Get partner deals and reviews using the partner ID
    const partnerWithDetails = partner ? await prisma.partner.findUnique({
      where: { id: partner.id },
      include: {
        _count: {
          select: {
            projects: true
          }
        },
        projects: {
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
          // Include all deals (including closed ones)
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
    }) : null

    // Calculate average rating
    const ratings = partnerWithDetails?.reviews?.map(r => r.rating) || []
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      : null

    // Use PartnerProfile data as the primary source
    const result = {
      id: partner?.id || partnerProfile.id,
      companyName: partnerProfile.companyName,
      contactEmail: partnerProfile.email,
      contactPhone: partnerProfile.phone,
      industry: partnerProfile.industry,
      description: partnerProfile.description,
      website: partnerProfile.website,
      foundedYear: partnerProfile.foundedYear,
      employeeCount: partnerProfile.employeeCount,
      location: partnerProfile.city && partnerProfile.country ? `${partnerProfile.city}, ${partnerProfile.country}` : null,
      logoUrl: partnerProfile.logo,
      verified: partner?.status === 'ACTIVE',
      createdAt: partnerProfile.createdAt,
      status: partner?.status || 'PENDING',
      averageRating,
      totalReviews: ratings.length,
      _count: {
        deals: partnerWithDetails?._count?.projects || 0
      },
      deals: partnerWithDetails?.projects || [],
      reviews: partnerWithDetails?.reviews?.map(review => ({
        ...review,
        deal: review.project // Map project to deal for backward compatibility
      })) || []
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error fetching partner details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch partner details' },
      { status: 500 }
    )
  }
}