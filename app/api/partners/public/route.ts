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

    // Build where clause for Partner (not PartnerProfile)
    const where: any = {
      status: {
        in: ['ACTIVE', 'PENDING'] // Show active and pending partners
      }
    }

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { projects: { some: { title: { contains: search, mode: 'insensitive' } } } },
        { projects: { some: { category: { contains: search, mode: 'insensitive' } } } }
      ]
    }

    if (industry && industry !== 'all') {
      where.OR = [
        { industry: industry },
        { projects: { some: { category: industry } } }
      ]
    }

    // Get partners with their latest deals and ratings
    const [partners, total] = await Promise.all([
      prisma.partner.findMany({
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
              name: true,
              email: true,
              partnerProfile: {
                select: {
                  companyName: true,
                  displayName: true,
                  tagline: true,
                  description: true,
                  logo: true,
                  coverImage: true,
                  brandColor: true,
                  website: true,
                  email: true,
                  phone: true,
                  address: true,
                  city: true,
                  country: true,
                  industry: true,
                  foundedYear: true,
                  employeeCount: true,
                  businessType: true,
                  registrationNumber: true,
                  linkedin: true,
                  twitter: true,
                  facebook: true,
                  instagram: true,
                  investmentAreas: true,
                  minimumDealSize: true,
                  maximumDealSize: true,
                  preferredDuration: true,
                  yearsExperience: true,
                  isPublic: true,
                  allowInvestorContact: true,
                  showSuccessMetrics: true
                }
              }
            }
          },
          projects: {
            select: {
              id: true,
              title: true,
              category: true,
              status: true,
              expectedReturn: true,
              currentFunding: true,
              fundingGoal: true,
              createdAt: true
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 1 // Get latest deal for company name
          },
          _count: {
            select: {
              projects: true
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

    // Map to the expected format with dynamic company names from deals
    const partnersWithRatings = partners.map(partner => {
      const profile = partner.user?.partnerProfile
      const ratings = partner.reviews?.map(r => r.rating) || []
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : null
      
      // Prioritize PartnerProfile info, then latest deal, then static partner data
      const latestDeal = partner.projects?.[0]
      const dynamicCompanyName = profile?.companyName || latestDeal?.title || partner.companyName || 'No Company Name'
      const dynamicIndustry = profile?.industry || latestDeal?.category || partner.industry || 'Other'
      
      return {
        id: partner.id,
        companyName: dynamicCompanyName,
        contactEmail: profile?.email || partner.user?.email || '',
        contactPhone: profile?.phone || partner.phone || '',
        industry: dynamicIndustry,
        description: profile?.description || partner.description || '',
        website: profile?.website || partner.website || '',
        foundedYear: profile?.foundedYear || null,
        employeeCount: profile?.employeeCount || '',
        location: profile?.city && profile?.country ? `${profile.city}, ${profile.country}` : null,
        logoUrl: profile?.logo || '',
        verified: partner.status === 'ACTIVE',
        createdAt: partner.createdAt,
        status: partner.status,
        averageRating,
        totalReviews: ratings.length,
        _count: {
          deals: partner._count?.projects || 0
        },
        deals: partner.projects || [],
        // Additional profile information
        contactName: profile?.displayName || partner.contactName || partner.user?.name || '',
        tagline: profile?.tagline || '',
        brandColor: profile?.brandColor || '',
        coverImage: profile?.coverImage || '',
        businessType: profile?.businessType || '',
        registrationNumber: profile?.registrationNumber || '',
        yearsExperience: profile?.yearsExperience || 0,
        socialLinks: {
          linkedin: profile?.linkedin || '',
          twitter: profile?.twitter || '',
          facebook: profile?.facebook || '',
          instagram: profile?.instagram || ''
        },
        investmentAreas: profile?.investmentAreas || [],
        minimumDealSize: profile?.minimumDealSize || null,
        maximumDealSize: profile?.maximumDealSize || null,
        preferredDuration: profile?.preferredDuration || null,
        isPublic: profile?.isPublic !== false,
        allowInvestorContact: profile?.allowInvestorContact !== false,
        showSuccessMetrics: profile?.showSuccessMetrics !== false
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
