import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

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

    // Step 1: Get partner's deals first (simple query)
    const partnerDeals = await prisma.project.findMany({
      where: { ownerId: userId },
      select: {
        id: true,
        status: true
      }
    })

    const partnerDealIds = partnerDeals.map(deal => deal.id)
    const totalDeals = partnerDeals.length
    const completedDeals = partnerDeals.filter(d => d.status === 'COMPLETED').length
    const activeDeals = partnerDeals.filter(d => d.status === 'ACTIVE' || d.status === 'PUBLISHED').length

    // Step 2: Get investments for these deals (if any exist)
    let totalRaised = 0
    let totalInvestmentCount = 0
    let totalInvestors = 0

    if (partnerDealIds.length > 0) {
      // Get investment stats using simple projectId filter
      const investments = await prisma.investment.findMany({
        where: {
          projectId: { in: partnerDealIds },
          status: 'ACTIVE'
        },
        select: {
          amount: true,
          investorId: true
        }
      })

      totalRaised = investments.reduce((sum, inv) => sum + Number(inv.amount), 0)
      totalInvestmentCount = investments.length

      // Count unique investors
      const uniqueInvestorIds = new Set(investments.map(inv => inv.investorId))
      totalInvestors = uniqueInvestorIds.size
    }

    // Calculate statistics
    const successRate = totalDeals > 0 ? (completedDeals / totalDeals) * 100 : 0
    const avgDealSize = totalDeals > 0 ? totalRaised / totalDeals : 0

    const stats = {
      totalRaised,
      activeDeals,
      successRate: Math.round(successRate * 10) / 10,
      totalDeals,
      completedDeals,
      avgDealSize,
      totalInvestors,
      totalInvestments: totalInvestmentCount,
      isGrowing: successRate >= 70
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching partner stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch partner statistics' },
      { status: 500 }
    )
  }
}
