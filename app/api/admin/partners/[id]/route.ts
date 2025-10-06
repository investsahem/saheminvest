import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/partners/[id] - Get single partner
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const partner = await prisma.partner.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            walletBalance: true,
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
            status: true,
            fundingGoal: true,
            currentFunding: true,
            category: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        reviews: {
          include: {
            investor: {
              select: {
                name: true,
                email: true
              }
            },
            project: {
              select: {
                title: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        _count: {
          select: {
            projects: true,
            reviews: true
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

    // Prioritize PartnerProfile info, then latest deal, then static partner data
    const profile = partner.user?.partnerProfile
    const latestDeal = partner.projects?.[0]
    const dynamicCompanyName = profile?.companyName || latestDeal?.title || partner.companyName || 'No Company Name'
    const dynamicIndustry = profile?.industry || latestDeal?.category || partner.industry || 'Other'

    // Get all projects for statistics calculation
    const allProjects = await prisma.project.findMany({
      where: { ownerId: partner.userId },
      include: {
        investments: {
          select: {
            amount: true,
            investorId: true
          }
        }
      }
    })

    // Calculate real statistics from projects data
    const totalDeals = allProjects.length
    const activeDeals = allProjects.filter(p => p.status === 'ACTIVE' || p.status === 'PUBLISHED').length
    const completedDeals = allProjects.filter(p => p.status === 'COMPLETED').length
    const totalInvestment = allProjects.reduce((sum, project) => sum + (Number(project.currentFunding) || 0), 0)
    const successRate = totalDeals > 0 ? Math.round((completedDeals / totalDeals) * 100 * 100) / 100 : 0

    // Calculate average rating from reviews
    const ratings = partner.reviews?.map(r => r.rating) || []
    const averageRating = ratings.length > 0 
      ? Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 100) / 100
      : 0

    return NextResponse.json({
      id: partner.id,
      companyName: dynamicCompanyName,
      contactName: partner.contactName,
      email: partner.user.email,
      phone: partner.phone,
      address: partner.address,
      website: partner.website,
      industry: dynamicIndustry,
      description: partner.description,
      status: partner.status.toLowerCase(),
      tier: partner.tier.toLowerCase(),
      joinedAt: partner.joinedAt.toISOString(),
      lastActive: partner.lastActive?.toISOString() || partner.updatedAt.toISOString(),
      user: {
        id: partner.user.id,
        name: partner.user.name,
        email: partner.user.email,
        role: partner.user.role,
        isActive: partner.user.isActive,
        walletBalance: Number(partner.user.walletBalance)
      },
      stats: {
        totalDeals,
        totalInvested: totalInvestment,
        successRate,
        activeDeals,
        rating: averageRating,
        totalRatings: ratings.length,
        completedDeals,
        // Additional calculated stats
        totalFundingGoal: allProjects.reduce((sum, project) => sum + (Number(project.fundingGoal) || 0), 0),
        uniqueInvestors: new Set(allProjects.flatMap(p => p.investments.map(inv => inv.investorId))).size
      },
      documents: {
        businessLicense: partner.businessLicense,
        taxCertificate: partner.taxCertificate,
        bankDetails: partner.bankDetails,
        partnership: partner.partnershipAgreement
      },
      projects: partner.projects.map(project => ({
        id: project.id,
        title: project.title,
        status: project.status,
        category: project.category,
        fundingGoal: Number(project.fundingGoal),
        currentFunding: Number(project.currentFunding),
        createdAt: project.createdAt.toISOString()
      })),
      reviews: partner.reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        investor: review.investor,
        project: review.project,
        createdAt: review.createdAt.toISOString()
      }))
    })

  } catch (error) {
    console.error('Error fetching partner:', error)
    return NextResponse.json(
      { error: 'Failed to fetch partner' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/partners/[id] - Update partner
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      phone, 
      address, 
      website, 
      industry,
      description,
      status,
      tier,
      documents
    } = body

    const existingPartner = await prisma.partner.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!existingPartner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    // Update partner and user in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user name if contactName changed
      if (contactName && contactName !== existingPartner.contactName) {
        await tx.user.update({
          where: { id: existingPartner.userId },
          data: { name: contactName }
        })
      }

      // Update partner
      const updatedPartner = await tx.partner.update({
        where: { id },
        data: {
          companyName: companyName || existingPartner.companyName,
          contactName: contactName || existingPartner.contactName,
          phone: phone || existingPartner.phone,
          address: address || existingPartner.address,
          website: website || existingPartner.website,
          industry: industry || existingPartner.industry,
          description: description || existingPartner.description,
          status: status ? status.toUpperCase() : existingPartner.status,
          tier: tier ? tier.toUpperCase() : existingPartner.tier,
          businessLicense: documents?.businessLicense ?? existingPartner.businessLicense,
          taxCertificate: documents?.taxCertificate ?? existingPartner.taxCertificate,
          bankDetails: documents?.bankDetails ?? existingPartner.bankDetails,
          partnershipAgreement: documents?.partnership ?? existingPartner.partnershipAgreement,
          lastActive: new Date()
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

      return updatedPartner
    })

    // Calculate real statistics for the updated partner
    const allProjects = await prisma.project.findMany({
      where: { ownerId: result.userId },
      include: {
        investments: {
          select: {
            amount: true,
            investorId: true
          }
        }
      }
    })

    const totalDeals = allProjects.length
    const activeDeals = allProjects.filter(p => p.status === 'ACTIVE' || p.status === 'PUBLISHED').length
    const completedDeals = allProjects.filter(p => p.status === 'COMPLETED').length
    const totalInvestment = allProjects.reduce((sum, project) => sum + (Number(project.currentFunding) || 0), 0)
    const successRate = totalDeals > 0 ? Math.round((completedDeals / totalDeals) * 100 * 100) / 100 : 0

    return NextResponse.json({
      id: result.id,
      companyName: result.companyName,
      contactName: result.contactName,
      email: result.user.email,
      phone: result.phone,
      address: result.address,
      website: result.website,
      industry: result.industry,
      description: result.description,
      status: result.status.toLowerCase(),
      tier: result.tier.toLowerCase(),
      joinedAt: result.joinedAt.toISOString(),
      lastActive: result.lastActive?.toISOString() || result.updatedAt.toISOString(),
      stats: {
        totalDeals,
        totalInvested: totalInvestment,
        successRate,
        activeDeals,
        completedDeals,
        totalFundingGoal: allProjects.reduce((sum, project) => sum + (Number(project.fundingGoal) || 0), 0),
        uniqueInvestors: new Set(allProjects.flatMap(p => p.investments.map(inv => inv.investorId))).size
      },
      documents: {
        businessLicense: result.businessLicense,
        taxCertificate: result.taxCertificate,
        bankDetails: result.bankDetails,
        partnership: result.partnershipAgreement
      }
    })

  } catch (error) {
    console.error('Error updating partner:', error)
    return NextResponse.json(
      { error: 'Failed to update partner' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/partners/[id] - Delete partner (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin only' },
        { status: 403 }
      )
    }

    const partner = await prisma.partner.findUnique({
      where: { id },
      include: {
        projects: true,
        _count: {
          select: {
            projects: true
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

    // Check if partner has active projects
    const activeProjects = partner.projects.filter(p => 
      ['ACTIVE', 'PUBLISHED', 'FUNDED'].includes(p.status)
    )

    if (activeProjects.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete partner with active projects' },
        { status: 400 }
      )
    }

    // Delete partner and associated user
    await prisma.$transaction(async (tx) => {
      await tx.partner.delete({
        where: { id }
      })
      
      await tx.user.delete({
        where: { id: partner.userId }
      })
    })

    return NextResponse.json({ message: 'Partner deleted successfully' })

  } catch (error) {
    console.error('Error deleting partner:', error)
    return NextResponse.json(
      { error: 'Failed to delete partner' },
      { status: 500 }
    )
  }
}
 