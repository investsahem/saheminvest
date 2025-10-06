import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/partners - Get all partners
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { permissions: true }
    })

    if (!user || (user.role !== 'ADMIN' && !user.permissions.some(p => p.permission === 'MANAGE_PARTNERS'))) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')
    const tier = searchParams.get('tier')
    const industry = searchParams.get('industry')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }
    
    if (tier && tier !== 'all') {
      where.tier = tier.toUpperCase()
    }

    if (industry && industry !== 'all') {
      where.industry = industry
    }

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { industry: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get partners with user details and their latest deals
    const [partners, total] = await Promise.all([
      prisma.partner.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
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
              createdAt: true
            },
            where: {
              status: {
                in: ['ACTIVE', 'COMPLETED', 'FUNDED']
              }
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 1 // Get the latest deal to extract company info
          },
          _count: {
            select: {
              projects: {
                where: {
                  status: {
                    in: ['ACTIVE', 'PENDING', 'PUBLISHED']
                  }
                }
              },
              reviews: true
            }
          }
        },
        orderBy: [
          { tier: 'desc' },
          { totalCommission: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.partner.count({ where })
    ])

    // Get all partners' projects for dynamic statistics calculation
    const partnerIds = partners.map(p => p.userId)
    const allPartnersProjects = await prisma.project.findMany({
      where: { 
        ownerId: { in: partnerIds }
      },
      include: {
        investments: {
          select: {
            amount: true,
            investorId: true
          }
        }
      }
    })

    // Group projects by partner userId for efficient lookup
    const projectsByPartner = allPartnersProjects.reduce((acc, project) => {
      if (!acc[project.ownerId]) {
        acc[project.ownerId] = []
      }
      acc[project.ownerId].push(project)
      return acc
    }, {} as Record<string, typeof allPartnersProjects>)

    // Transform partners to match frontend interface
    const transformedPartners = partners.map(partner => {
      // Prioritize PartnerProfile info, then latest deal, then static partner data
      const profile = partner.user?.partnerProfile
      const latestDeal = partner.projects?.[0]
      const dynamicCompanyName = profile?.companyName || latestDeal?.title || partner.companyName || 'No Company Name'
      const dynamicIndustry = profile?.industry || latestDeal?.category || partner.industry || 'Other'
      
      // Calculate real statistics from projects data
      const partnerProjects = projectsByPartner[partner.userId] || []
      const totalDeals = partnerProjects.length
      const activeDeals = partnerProjects.filter(p => p.status === 'ACTIVE' || p.status === 'PUBLISHED').length
      const completedDeals = partnerProjects.filter(p => p.status === 'COMPLETED').length
      const totalInvestment = partnerProjects.reduce((sum, project) => sum + (Number(project.currentFunding) || 0), 0)
      const successRate = totalDeals > 0 ? Math.round((completedDeals / totalDeals) * 100 * 100) / 100 : 0
      
      return {
        id: partner.id,
        companyName: dynamicCompanyName,
        contactName: profile?.displayName || partner.contactName || partner.user.name || '',
        email: profile?.email || partner.user.email,
        phone: profile?.phone || partner.phone,
        address: profile?.address || partner.address,
        website: profile?.website || partner.website,
        industry: dynamicIndustry,
        status: partner.status.toLowerCase(),
        tier: partner.tier.toLowerCase(),
        joinedAt: partner.joinedAt.toISOString(),
        lastActive: partner.lastActive?.toISOString() || partner.updatedAt.toISOString(),
        stats: {
          totalDeals,
          totalInvested: totalInvestment,
          successRate,
          activeDeals
        },
        documents: {
          businessLicense: partner.businessLicense,
          taxCertificate: partner.taxCertificate,
          bankDetails: partner.bankDetails,
          partnership: partner.partnershipAgreement
        },
        // Additional profile information
        logoUrl: profile?.logo || '',
        description: profile?.description || partner.description || '',
        tagline: profile?.tagline || '',
        brandColor: profile?.brandColor || '',
        coverImage: profile?.coverImage || '',
        businessType: profile?.businessType || '',
        registrationNumber: profile?.registrationNumber || '',
        foundedYear: profile?.foundedYear || null,
        employeeCount: profile?.employeeCount || '',
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

    const response = NextResponse.json({
      partners: transformedPartners,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

    // Add cache headers for better performance
    response.headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=300')
    
    return response

  } catch (error) {
    console.error('Error fetching partners:', error)
    return NextResponse.json(
      { error: 'Failed to fetch partners' },
      { status: 500 }
    )
  }
}

// POST /api/admin/partners - Create new partner
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { permissions: true }
    })

    if (!user || (user.role !== 'ADMIN' && !user.permissions.some(p => p.permission === 'MANAGE_PARTNERS'))) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { 
      companyName, 
      contactName, 
      email, 
      phone, 
      address, 
      website, 
      industry,
      description 
    } = body

    // Create user account first
    const newUser = await prisma.user.create({
      data: {
        email,
        name: contactName,
        role: 'PARTNER',
        isActive: true
      }
    })

    // Create partner profile
    const partner = await prisma.partner.create({
      data: {
        companyName,
        contactName,
        phone,
        address,
        website,
        industry,
        description,
        userId: newUser.id,
        status: 'PENDING',
        tier: 'BRONZE'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({
      id: partner.id,
      companyName: partner.companyName,
      contactName: partner.contactName,
      email: partner.user.email,
      phone: partner.phone,
      address: partner.address,
      website: partner.website,
      industry: partner.industry,
      status: partner.status.toLowerCase(),
      tier: partner.tier.toLowerCase(),
      joinedAt: partner.joinedAt.toISOString(),
      lastActive: partner.updatedAt.toISOString(),
      stats: {
        totalDeals: 0,
        totalCommission: 0,
        successRate: 0,
        activeDeals: 0
      },
      documents: {
        businessLicense: false,
        taxCertificate: false,
        bankDetails: false,
        partnership: false
      }
    })

  } catch (error) {
    console.error('Error creating partner:', error)
    return NextResponse.json(
      { error: 'Failed to create partner' },
      { status: 500 }
    )
  }
}