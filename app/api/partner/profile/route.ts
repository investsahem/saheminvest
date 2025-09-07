import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/partner/profile - Get partner profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'PARTNER') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const profile = await prisma.partnerProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    })

    // Get partner statistics
    const deals = await prisma.project.findMany({
      where: { ownerId: session.user.id },
      select: {
        id: true,
        status: true,
        fundingGoal: true,
        currentFunding: true,
        investments: {
          select: {
            amount: true
          }
        }
      }
    })

    const totalDeals = deals.length
    const activeDeals = deals.filter(deal => ['ACTIVE', 'PUBLISHED'].includes(deal.status)).length
    const completedDeals = deals.filter(deal => deal.status === 'COMPLETED').length
    const totalFunding = deals.reduce((sum, deal) => sum + Number(deal.currentFunding || 0), 0)
    const successRate = totalDeals > 0 ? (completedDeals / totalDeals) * 100 : 0
    const averageReturn = 12 // This would be calculated from actual returns

    // Format the response to match the frontend interface
    const formattedProfile = {
      id: profile?.id || '',
      companyName: profile?.companyName || '',
      companyDescription: profile?.description || '',
      industry: profile?.industry || '',
      foundedYear: profile?.foundedYear || new Date().getFullYear(),
      employeeCount: profile?.employeeCount || '1-10',
      website: profile?.website || '',
      email: profile?.email || session.user.email || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      city: profile?.city || '',
      country: profile?.country || 'Lebanon',
      logo: profile?.logo || '',
      investmentFocus: profile?.investmentAreas || [],
      minInvestment: profile?.minimumDealSize || 1000,
      maxInvestment: profile?.maximumDealSize || 100000,
      averageReturn,
      successRate: Math.round(successRate),
      totalDeals,
      totalFunding,
      socialLinks: {
        linkedin: profile?.linkedin || '',
        twitter: profile?.twitter || '',
        facebook: profile?.facebook || ''
      },
      certifications: [],
      teamMembers: []
    }

    return NextResponse.json(formattedProfile)
  } catch (error) {
    console.error('Error fetching partner profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST /api/partner/profile - Create or update partner profile
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'PARTNER') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const data = await request.json()
    
    // Validate required fields
    if (!data.companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      )
    }

    // Check if profile already exists
    const existingProfile = await prisma.partnerProfile.findUnique({
      where: { userId: session.user.id }
    })

    let profile
    if (existingProfile) {
      // Update existing profile
      profile = await prisma.partnerProfile.update({
        where: { userId: session.user.id },
        data: {
          companyName: data.companyName,
          displayName: data.displayName,
          tagline: data.tagline,
          description: data.description,
          logo: data.logo,
          coverImage: data.coverImage,
          brandColor: data.brandColor,
          website: data.website,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          country: data.country,
          industry: data.industry,
          foundedYear: data.foundedYear ? parseInt(data.foundedYear) : null,
          employeeCount: data.employeeCount,
          businessType: data.businessType,
          registrationNumber: data.registrationNumber,
          linkedin: data.linkedin,
          twitter: data.twitter,
          facebook: data.facebook,
          instagram: data.instagram,
          investmentAreas: data.investmentAreas || [],
          minimumDealSize: data.minimumDealSize ? parseFloat(data.minimumDealSize) : null,
          maximumDealSize: data.maximumDealSize ? parseFloat(data.maximumDealSize) : null,
          preferredDuration: data.preferredDuration,
          yearsExperience: data.yearsExperience ? parseInt(data.yearsExperience) : null,
          isPublic: data.isPublic !== undefined ? data.isPublic : true,
          allowInvestorContact: data.allowInvestorContact !== undefined ? data.allowInvestorContact : true,
          showSuccessMetrics: data.showSuccessMetrics !== undefined ? data.showSuccessMetrics : true
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      })
    } else {
      // Create new profile
      profile = await prisma.partnerProfile.create({
        data: {
          userId: session.user.id,
          companyName: data.companyName,
          displayName: data.displayName,
          tagline: data.tagline,
          description: data.description,
          logo: data.logo,
          coverImage: data.coverImage,
          brandColor: data.brandColor,
          website: data.website,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          country: data.country,
          industry: data.industry,
          foundedYear: data.foundedYear ? parseInt(data.foundedYear) : null,
          employeeCount: data.employeeCount,
          businessType: data.businessType,
          registrationNumber: data.registrationNumber,
          linkedin: data.linkedin,
          twitter: data.twitter,
          facebook: data.facebook,
          instagram: data.instagram,
          investmentAreas: data.investmentAreas || [],
          minimumDealSize: data.minimumDealSize ? parseFloat(data.minimumDealSize) : null,
          maximumDealSize: data.maximumDealSize ? parseFloat(data.maximumDealSize) : null,
          preferredDuration: data.preferredDuration,
          yearsExperience: data.yearsExperience ? parseInt(data.yearsExperience) : null,
          isPublic: data.isPublic !== undefined ? data.isPublic : true,
          allowInvestorContact: data.allowInvestorContact !== undefined ? data.allowInvestorContact : true,
          showSuccessMetrics: data.showSuccessMetrics !== undefined ? data.showSuccessMetrics : true
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      profile,
      message: existingProfile ? 'Profile updated successfully' : 'Profile created successfully'
    })

  } catch (error) {
    console.error('Error saving partner profile:', error)
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT /api/partner/profile - Update partner profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'PARTNER') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const data = await request.json()

    // Update existing profile
    const profile = await prisma.partnerProfile.upsert({
      where: { userId: session.user.id },
      update: {
        companyName: data.companyName,
        description: data.companyDescription,
        logo: data.logo,
        website: data.website,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country,
        industry: data.industry,
        foundedYear: data.foundedYear ? parseInt(data.foundedYear) : null,
        employeeCount: data.employeeCount,
        linkedin: data.socialLinks?.linkedin,
        twitter: data.socialLinks?.twitter,
        facebook: data.socialLinks?.facebook,
        investmentAreas: data.investmentFocus || [],
        minimumDealSize: data.minInvestment ? parseFloat(data.minInvestment) : null,
        maximumDealSize: data.maxInvestment ? parseFloat(data.maxInvestment) : null,
        // Additional business fields
        businessType: data.businessType,
        registrationNumber: data.taxId,
      },
      create: {
        userId: session.user.id,
        companyName: data.companyName || '',
        description: data.companyDescription || '',
        logo: data.logo || '',
        website: data.website || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        country: data.country || 'Lebanon',
        industry: data.industry || '',
        foundedYear: data.foundedYear ? parseInt(data.foundedYear) : null,
        employeeCount: data.employeeCount || '1-10',
        linkedin: data.socialLinks?.linkedin || '',
        twitter: data.socialLinks?.twitter || '',
        facebook: data.socialLinks?.facebook || '',
        investmentAreas: data.investmentFocus || [],
        minimumDealSize: data.minInvestment ? parseFloat(data.minInvestment) : null,
        maximumDealSize: data.maxInvestment ? parseFloat(data.maxInvestment) : null,
        // Additional business fields
        businessType: data.businessType || '',
        registrationNumber: data.taxId || '',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      profile,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Error updating partner profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE /api/partner/profile - Delete partner profile
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'PARTNER') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    await prisma.partnerProfile.delete({
      where: { userId: session.user.id }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Profile deleted successfully' 
    })

  } catch (error) {
    console.error('Error deleting partner profile:', error)
    return NextResponse.json(
      { error: 'Failed to delete profile' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
