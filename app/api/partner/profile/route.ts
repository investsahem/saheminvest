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

    return NextResponse.json({ profile })
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
