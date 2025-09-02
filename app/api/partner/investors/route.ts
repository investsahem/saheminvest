import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/partner/investors - Get investors who invested in partner's deals
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'PARTNER') {
      return NextResponse.json(
        { error: 'Unauthorized - Partner access required' },
        { status: 401 }
      )
    }

    // Get the partner's projects
    const partnerProjects = await prisma.project.findMany({
      where: {
        ownerId: session.user.id,
        status: {
          in: ['ACTIVE', 'FUNDED', 'COMPLETED']
        }
      },
      select: {
        id: true,
        title: true,
        status: true
      }
    })

    if (partnerProjects.length === 0) {
      return NextResponse.json({
        investors: [],
        analytics: {
          totalInvestors: 0,
          totalInvested: 0,
          totalReturns: 0,
          averageInvestment: 0,
          monthlyGrowth: []
        }
      })
    }

    const projectIds = partnerProjects.map(p => p.id)

    // Get all investments in partner's projects
    const investments = await prisma.investment.findMany({
      where: {
        projectId: {
          in: projectIds
        }
      },
      include: {
        investor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            kycVerified: true,
            walletBalance: true,
            createdAt: true,
            updatedAt: true
          }
        },
        project: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      }
    })

    // Group investments by investor
    const investorMap = new Map()
    
    for (const investment of investments) {
      const investorId = investment.investor.id
      const investmentAmount = Number(investment.amount)

      if (!investorMap.has(investorId)) {
        // Get distributed profits for this investor from partner's deals
        const profitTransactions = await prisma.transaction.findMany({
          where: {
            userId: investorId,
            type: 'RETURN',
            status: 'COMPLETED',
            investmentId: {
              in: investments
                .filter(inv => inv.investorId === investorId)
                .map(inv => inv.id)
            }
          }
        })

        const totalReturns = profitTransactions.reduce(
          (sum, tx) => sum + Number(tx.amount), 0
        )

        // Get all investments by this investor in partner's deals
        const investorInvestments = investments.filter(inv => inv.investorId === investorId)
        const totalInvested = investorInvestments.reduce(
          (sum, inv) => sum + Number(inv.amount), 0
        )

        const activeInvestments = investorInvestments.filter(
          inv => inv.project.status === 'ACTIVE'
        ).length

        const completedInvestments = investorInvestments.filter(
          inv => inv.project.status === 'COMPLETED'
        ).length

        const averageReturn = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0

        // Determine risk profile based on investment patterns
        let riskProfile = 'Conservative'
        if (averageReturn > 15) riskProfile = 'Aggressive'
        else if (averageReturn > 10) riskProfile = 'Moderate'

        investorMap.set(investorId, {
          id: investment.investor.id,
          name: investment.investor.name || 'Unknown Investor',
          email: investment.investor.email,
          phone: investment.investor.phone,
          totalInvested: totalInvested,
          totalReturns: totalReturns,
          activeInvestments: activeInvestments,
          completedInvestments: completedInvestments,
          averageReturn: Math.round(averageReturn * 100) / 100,
          riskProfile: riskProfile,
          joinedAt: investment.investor.createdAt.toISOString(),
          lastActive: investment.investor.updatedAt.toISOString(),
          kycVerified: investment.investor.kycVerified,
          walletBalance: Number(investment.investor.walletBalance),
          investments: investorInvestments.map(inv => ({
            id: inv.id,
            amount: Number(inv.amount),
            projectId: inv.project.id,
            projectTitle: inv.project.title,
            projectStatus: inv.project.status,
            investmentDate: inv.investmentDate.toISOString()
          }))
        })
      }
    }

    const investors = Array.from(investorMap.values())

    // Calculate analytics
    const totalInvestors = investors.length
    const totalInvested = investors.reduce((sum, inv) => sum + inv.totalInvested, 0)
    const totalReturns = investors.reduce((sum, inv) => sum + inv.totalReturns, 0)
    const averageInvestment = totalInvestors > 0 ? totalInvested / totalInvestors : 0

    // Calculate monthly growth (last 6 months)
    const monthlyGrowth = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const newInvestorsThisMonth = investors.filter(inv => {
        const joinedDate = new Date(inv.joinedAt)
        return joinedDate >= monthDate && joinedDate <= monthEnd
      }).length

      const totalInvestorsUpToMonth = investors.filter(inv => {
        const joinedDate = new Date(inv.joinedAt)
        return joinedDate <= monthEnd
      }).length

      const totalInvestedUpToMonth = investors
        .filter(inv => new Date(inv.joinedAt) <= monthEnd)
        .reduce((sum, inv) => sum + inv.totalInvested, 0)

      monthlyGrowth.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        newInvestors: newInvestorsThisMonth,
        totalInvestors: totalInvestorsUpToMonth,
        totalInvested: totalInvestedUpToMonth
      })
    }

    // Calculate risk profile distribution
    const riskProfiles = {
      Conservative: investors.filter(inv => inv.riskProfile === 'Conservative').length,
      Moderate: investors.filter(inv => inv.riskProfile === 'Moderate').length,
      Aggressive: investors.filter(inv => inv.riskProfile === 'Aggressive').length
    }

    const riskProfileData = [
      {
        name: 'Conservative',
        value: totalInvestors > 0 ? Math.round((riskProfiles.Conservative / totalInvestors) * 100) : 0,
        count: riskProfiles.Conservative,
        color: '#10B981'
      },
      {
        name: 'Moderate',
        value: totalInvestors > 0 ? Math.round((riskProfiles.Moderate / totalInvestors) * 100) : 0,
        count: riskProfiles.Moderate,
        color: '#F59E0B'
      },
      {
        name: 'Aggressive',
        value: totalInvestors > 0 ? Math.round((riskProfiles.Aggressive / totalInvestors) * 100) : 0,
        count: riskProfiles.Aggressive,
        color: '#EF4444'
      }
    ]

    return NextResponse.json({
      investors: investors,
      analytics: {
        totalInvestors: totalInvestors,
        totalInvested: Math.round(totalInvested * 100) / 100,
        totalReturns: Math.round(totalReturns * 100) / 100,
        averageInvestment: Math.round(averageInvestment * 100) / 100,
        monthlyGrowth: monthlyGrowth,
        riskProfileData: riskProfileData
      }
    })

  } catch (error) {
    console.error('Error fetching partner investors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch investors data' },
      { status: 500 }
    )
  }
}
