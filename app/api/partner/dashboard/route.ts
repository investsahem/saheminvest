import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { PrismaClient } from '@prisma/client'
import { calculateUniqueInvestors, calculateTotalUniqueInvestors, addUniqueInvestorCounts } from '../../../lib/investor-utils'

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

    // Get partner profile
    const partner = await prisma.partner.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            walletBalance: true
          }
        }
      }
    })

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner profile not found' },
        { status: 404 }
      )
    }

    // Get date ranges for calculations
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Parallel database queries
    const [
      totalDeals,
      activeDeals,
      completedDeals,
      pendingDeals,
      totalInvestments,
      thisMonthInvestments,
      lastMonthInvestments,
      totalInvestors,
      deals,
      monthlyPerformance,
      recentActivities
    ] = await Promise.all([
      // Deal statistics
      prisma.project.count({
        where: { ownerId: userId }
      }),
      prisma.project.count({
        where: { ownerId: userId, status: 'ACTIVE' }
      }),
      prisma.project.count({
        where: { ownerId: userId, status: 'COMPLETED' }
      }),
      prisma.project.count({
        where: { ownerId: userId, status: 'PENDING' }
      }),
      
      // Investment statistics
      prisma.investment.aggregate({
        where: {
          project: { ownerId: userId }
        },
        _sum: { amount: true },
        _count: { id: true }
      }),
      prisma.investment.aggregate({
        where: {
          project: { ownerId: userId },
          createdAt: { gte: startOfMonth }
        },
        _sum: { amount: true }
      }),
      prisma.investment.aggregate({
        where: {
          project: { ownerId: userId },
          createdAt: { 
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        },
        _sum: { amount: true }
      }),
      
      // Unique investors count
      prisma.investment.findMany({
        where: {
          project: { ownerId: userId }
        },
        select: { investorId: true },
        distinct: ['investorId']
      }),
      
      // Recent deals with details
      prisma.project.findMany({
        where: { ownerId: userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          investments: {
            select: {
              investorId: true,
              amount: true,
              investor: {
                select: { name: true }
              }
            }
          },
          _count: {
            select: { investments: true }
          }
        }
      }),
      
      // Monthly performance data (last 6 months)
      Promise.all(
        Array.from({ length: 6 }, (_, i) => {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
          
          return Promise.all([
            prisma.investment.aggregate({
              where: {
                project: { ownerId: userId },
                createdAt: {
                  gte: monthStart,
                  lte: monthEnd
                }
              },
              _sum: { amount: true },
              _count: { id: true }
            }),
            prisma.project.count({
              where: {
                ownerId: userId,
                createdAt: {
                  gte: monthStart,
                  lte: monthEnd
                }
              }
            }),
            prisma.investment.findMany({
              where: {
                project: { ownerId: userId },
                createdAt: {
                  gte: monthStart,
                  lte: monthEnd
                }
              },
              select: { investorId: true },
              distinct: ['investorId']
            })
          ]).then(([investments, dealCount, investors]) => ({
            month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
            revenue: Number(investments._sum.amount) || 0,
            deals: dealCount,
            investors: investors.length
          }))
        })
      ),
      
      // Recent activities
      prisma.investment.findMany({
        where: {
          project: { ownerId: userId }
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          investor: {
            select: { name: true }
          },
          project: {
            select: { title: true }
          }
        }
      })
    ])

    // Calculate metrics - Fix NaN issues
    const totalRevenue = Number(totalInvestments._sum.amount) || 0
    const thisMonthRevenue = Number(thisMonthInvestments._sum.amount) || 0
    const lastMonthRevenue = Number(lastMonthInvestments._sum.amount) || 0
    
    const monthlyGrowth = lastMonthRevenue > 0 
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 * 100) / 100  // Round to 2 decimal places
      : thisMonthRevenue > 0 ? 100 : 0 // If no last month revenue but this month has revenue, show 100% growth
    
    const successRate = totalDeals > 0 
      ? Math.round((completedDeals / totalDeals) * 100 * 100) / 100  // Round to 2 decimal places
      : 0
    
    // Calculate average return from actual deals, not partner profile
    const dealsWithReturns = deals.filter(deal => deal.expectedReturn && Number(deal.expectedReturn) > 0)
    const averageReturn = dealsWithReturns.length > 0 
      ? Math.round((dealsWithReturns.reduce((sum, deal) => sum + Number(deal.expectedReturn), 0) / dealsWithReturns.length) * 100) / 100
      : 0
    
    const uniqueInvestors = totalInvestors.length

    // Calculate total funding from deals (not just investments received)
    const totalFundingGoal = deals.reduce((sum, deal) => sum + Number(deal.fundingGoal || 0), 0)
    const totalCurrentFunding = deals.reduce((sum, deal) => sum + Number(deal.currentFunding || 0), 0)

    // Transform deals data with unique investor counts
    const currentDeals = deals.map(deal => ({
      id: deal.id,
      title: deal.title,
      fundingGoal: Number(deal.fundingGoal),
      currentFunding: Number(deal.currentFunding),
      expectedReturn: Number(deal.expectedReturn) || 5,
      duration: deal.duration || 6,
      status: deal.status,
      investorsCount: calculateUniqueInvestors(deal.investments || []), // Use unique investor count
      stage: getProjectStage(deal.status, Number(deal.currentFunding), Number(deal.fundingGoal))
    }))

    // Transform recent activities
    const activities = recentActivities.map(investment => ({
      id: investment.id,
      type: 'investment',
      message: `New investment of $${Number(investment.amount).toLocaleString()} in ${investment.project.title}`,
      time: getTimeAgo(investment.createdAt),
      icon: 'DollarSign',
      color: 'text-green-600'
    }))

    // Prepare response data
    const dashboardData = {
      partnerData: {
        companyName: partner.companyName || session.user.name,
        rating: Number(partner.rating) || 4.8,
        totalDeals,
        completedDeals,
        activeDeals,
        totalFunding: totalCurrentFunding, // Use actual current funding from deals
        averageReturn,
        successRate,
        totalInvestors: uniqueInvestors,
        monthlyGrowth,
        totalRevenue,
        pendingApprovals: pendingDeals,
        // Add additional metrics for better display
        totalFundingGoal,
        totalCurrentFunding,
        fundingProgress: totalFundingGoal > 0 ? Math.round((totalCurrentFunding / totalFundingGoal) * 100) : 0
      },
      performanceData: monthlyPerformance.reverse(),
      currentDeals,
      recentActivities: activities.slice(0, 4)
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('Partner dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Helper functions
function getProjectStage(status: string, currentFunding: number, fundingGoal: number): string {
  if (status === 'COMPLETED') return 'Completed'
  if (status === 'ACTIVE' && currentFunding >= fundingGoal) return 'Execution'
  if (status === 'ACTIVE') return 'Funding'
  if (status === 'PENDING') return 'Pending Approval'
  return 'Planning'
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} ${days === 1 ? 'day' : 'days'} ago`
  }
}
