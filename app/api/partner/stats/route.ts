import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'PARTNER') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const userId = session.user.id

    // Get partner's deals and investment statistics
    const [
      partnerDeals,
      totalInvestments,
      completedDeals,
      activeDeals
    ] = await Promise.all([
      // Get all partner's deals
      prisma.project.findMany({
        where: { ownerId: userId },
        include: {
          investments: {
            select: {
              amount: true,
              status: true
            }
          }
        }
      }),
      
      // Get total investments in partner's deals
      prisma.investment.aggregate({
        where: {
          project: {
            ownerId: userId
          },
          status: 'ACTIVE'
        },
        _sum: {
          amount: true
        },
        _count: {
          id: true
        }
      }),
      
      // Get completed deals count
      prisma.project.count({
        where: {
          ownerId: userId,
          status: 'COMPLETED'
        }
      }),
      
      // Get active deals count
      prisma.project.count({
        where: {
          ownerId: userId,
          status: { in: ['ACTIVE', 'PUBLISHED'] }
        }
      })
    ])

    // Calculate statistics
    const totalRaised = Number(totalInvestments._sum.amount) || 0
    const totalDeals = partnerDeals.length
    const successRate = totalDeals > 0 ? (completedDeals / totalDeals) * 100 : 0

    // Calculate additional metrics
    const avgDealSize = totalDeals > 0 ? totalRaised / totalDeals : 0
    const totalInvestors = new Set(
      partnerDeals.flatMap(deal => 
        deal.investments.map(inv => inv)
      )
    ).size

    const stats = {
      totalRaised,
      activeDeals,
      successRate: Math.round(successRate * 10) / 10, // Round to 1 decimal
      totalDeals,
      completedDeals,
      avgDealSize,
      totalInvestors,
      totalInvestments: totalInvestments._count.id || 0,
      isGrowing: successRate >= 70 // Consider 70%+ as good performance
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching partner stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch partner statistics' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
