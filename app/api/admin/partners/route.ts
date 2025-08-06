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

    // Get partners with user details
    const [partners, total] = await Promise.all([
      prisma.partner.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          _count: {
            select: {
              projects: true,
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

    // Transform partners to match frontend interface
    const transformedPartners = partners.map(partner => ({
      id: partner.id,
      companyName: partner.companyName,
      contactName: partner.contactName || partner.user.name || '',
      email: partner.user.email,
      phone: partner.phone,
      address: partner.address,
      website: partner.website,
      industry: partner.industry || 'Other',
      status: partner.status.toLowerCase(),
      tier: partner.tier.toLowerCase(),
      joinedAt: partner.joinedAt.toISOString(),
      lastActive: partner.lastActive?.toISOString() || partner.updatedAt.toISOString(),
      stats: {
        totalDeals: partner.totalDeals,
        totalCommission: Number(partner.totalCommission),
        successRate: Number(partner.successRate),
        activeDeals: partner._count.projects
      },
      documents: {
        businessLicense: partner.businessLicense,
        taxCertificate: partner.taxCertificate,
        bankDetails: partner.bankDetails,
        partnership: partner.partnershipAgreement
      }
    }))

    return NextResponse.json({
      partners: transformedPartners,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

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