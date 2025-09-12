import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get total successful/completed deals
    const successfulDealsCount = await prisma.project.count({
      where: {
        status: 'COMPLETED'
      }
    })

    // Get total investors (users with investments)
    const totalInvestors = await prisma.user.count({
      where: {
        investments: {
          some: {}
        }
      }
    })

    // Get total funding amount across all deals
    const totalFundingResult = await prisma.project.aggregate({
      _sum: {
        currentFunding: true
      },
      where: {
        status: {
          in: ['ACTIVE', 'FUNDED', 'COMPLETED']
        }
      }
    })

    // Get average return across active deals
    const avgReturnResult = await prisma.project.aggregate({
      _avg: {
        expectedReturn: true
      },
      where: {
        status: {
          in: ['ACTIVE', 'FUNDED']
        }
      }
    })

    // Get today's investment activity (simulated for now)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayInvestments = await prisma.transaction.aggregate({
      _sum: {
        amount: true
      },
      where: {
        type: 'INVESTMENT',
        status: 'COMPLETED',
        createdAt: {
          gte: today
        }
      }
    })

    const stats = {
      activeInvestors: totalInvestors,
      successfulDeals: successfulDealsCount,
      totalInvested: Number(totalFundingResult._sum.currentFunding || 0),
      averageReturn: Number(avgReturnResult._avg.expectedReturn || 12.5),
      todayInvestments: Number(todayInvestments._sum.amount || 0)
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching homepage stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch homepage statistics' },
      { status: 500 }
    )
  }
}

