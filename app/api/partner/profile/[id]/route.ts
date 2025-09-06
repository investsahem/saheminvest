import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/partner/profile/[id] - Get public partner profile by user ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const partnerId = params.id

    // Get partner profile with related data
    const profile = await prisma.partnerProfile.findUnique({
      where: { 
        userId: partnerId,
        isPublic: true  // Only show public profiles
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true
          }
        }
      }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Partner profile not found' }, { status: 404 })
    }

    // Get partner's deal statistics
    const dealStats = await prisma.project.aggregate({
      where: { 
        ownerId: partnerId,
        status: { in: ['ACTIVE', 'COMPLETED', 'FUNDED'] }
      },
      _count: { id: true },
      _sum: { 
        fundingGoal: true,
        currentFunding: true
      }
    })

    const completedDeals = await prisma.project.count({
      where: { 
        ownerId: partnerId,
        status: 'COMPLETED'
      }
    })

    const activeDeals = await prisma.project.count({
      where: { 
        ownerId: partnerId,
        status: { in: ['ACTIVE', 'FUNDED'] }
      }
    })

    // Calculate success rate
    const totalDeals = dealStats._count.id || 0
    const successRate = totalDeals > 0 ? (completedDeals / totalDeals) * 100 : 0

    // Get recent deals (public info only)
    const recentDeals = await prisma.project.findMany({
      where: { 
        ownerId: partnerId,
        status: { in: ['ACTIVE', 'COMPLETED', 'FUNDED'] }
      },
      select: {
        id: true,
        title: true,
        description: true,
        fundingGoal: true,
        currentFunding: true,
        expectedReturn: true,
        duration: true,
        status: true,
        imageUrl: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 6
    })

    // Update the profile's calculated metrics if it's the partner viewing their own profile
    if (session.user.id === partnerId && session.user.role === 'PARTNER') {
      await prisma.partnerProfile.update({
        where: { userId: partnerId },
        data: {
          totalDealsCompleted: completedDeals,
          totalFundsRaised: dealStats._sum.currentFunding || 0,
          successRate: successRate
        }
      })
    }

    const enrichedProfile = {
      ...profile,
      stats: {
        totalDeals: totalDeals,
        completedDeals: completedDeals,
        activeDeals: activeDeals,
        totalFundsRaised: dealStats._sum.currentFunding || 0,
        successRate: successRate,
        memberSince: profile.user.createdAt
      },
      recentDeals: recentDeals
    }

    return NextResponse.json({ profile: enrichedProfile })

  } catch (error) {
    console.error('Error fetching partner profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch partner profile' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
