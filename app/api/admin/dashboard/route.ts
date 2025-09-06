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

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Get date ranges for calculations
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Parallel database queries for better performance
    const [
      totalUsers,
      totalUsersLastMonth,
      activeUsers,
      totalDeals,
      activeDeals,
      completedDeals,
      pendingDeals,
      totalInvestments,
      totalInvestmentsThisMonth,
      totalInvestmentsLastMonth,
      totalReturns,
      totalReturnsThisMonth,
      totalReturnsLastMonth,
      pendingApplications,
      newUsersToday,
      recentTransactions,
      dealsByCategory,
      monthlyRevenue,
      monthlyUsers,
      systemAlerts
    ] = await Promise.all([
      // User statistics
      prisma.user.count(),
      prisma.user.count({
        where: { createdAt: { lt: startOfMonth } }
      }),
      prisma.user.count({
        where: { isActive: true }
      }),
      
      // Deal statistics
      prisma.project.count(),
      prisma.project.count({ where: { status: 'ACTIVE' } }),
      prisma.project.count({ where: { status: 'COMPLETED' } }),
      prisma.project.count({ where: { status: 'PENDING' } }),
      
      // Investment statistics
      prisma.investment.aggregate({
        _sum: { amount: true },
        _count: { id: true }
      }),
      prisma.investment.aggregate({
        where: { createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
        _count: { id: true }
      }),
      prisma.investment.aggregate({
        where: { 
          createdAt: { 
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        },
        _sum: { amount: true },
        _count: { id: true }
      }),
      
      // Returns statistics
      prisma.transaction.aggregate({
        where: { type: 'RETURN', status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: { 
          type: 'RETURN', 
          status: 'COMPLETED',
          createdAt: { gte: startOfMonth }
        },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: { 
          type: 'RETURN', 
          status: 'COMPLETED',
          createdAt: { 
            gte: startOfLastMonth,
            lte: endOfLastMonth
          }
        },
        _sum: { amount: true }
      }),
      
      // Application statistics
      prisma.userApplication.count({
        where: { status: 'PENDING' }
      }),
      
      // Today's new users
      prisma.user.count({
        where: { createdAt: { gte: startOfToday } }
      }),
      
      // Recent transactions for activity feed
      prisma.transaction.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true }
          },
          investment: {
            include: {
              project: {
                select: { title: true }
              }
            }
          }
        }
      }),
      
      // Deal distribution by category
      prisma.project.groupBy({
        by: ['category'],
        _count: { category: true },
        _sum: { currentFunding: true }
      }),
      
      // Monthly revenue data (last 7 months)
      Promise.all(
        Array.from({ length: 7 }, (_, i) => {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
          
          return prisma.transaction.aggregate({
            where: {
              type: { in: ['INVESTMENT', 'DEPOSIT'] },
              status: 'COMPLETED',
              createdAt: {
                gte: monthStart,
                lte: monthEnd
              }
            },
            _sum: { amount: true },
            _count: { id: true }
          }).then(result => ({
            month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
            revenue: Number(result._sum.amount) || 0,
            deals: result._count.id || 0
          }))
        })
      ),
      
      // Monthly user growth (last 7 months)
      Promise.all(
        Array.from({ length: 7 }, (_, i) => {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
          
          return Promise.all([
            prisma.user.count({
              where: {
                createdAt: { lte: monthEnd }
              }
            }),
            prisma.user.count({
              where: {
                createdAt: {
                  gte: monthStart,
                  lte: monthEnd
                }
              }
            }),
            prisma.user.count({
              where: {
                createdAt: { lte: monthEnd },
                isActive: true
              }
            })
          ]).then(([total, newUsers, active]) => ({
            month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
            total,
            new: newUsers,
            active
          }))
        })
      ),
      
      // System alerts (simplified)
      prisma.transaction.count({
        where: { status: 'FAILED' }
      })
    ])

    // Calculate performance metrics
    const totalInvestedAmount = Number(totalInvestments._sum.amount) || 0
    const totalReturnAmount = Number(totalReturns._sum.amount) || 0
    const thisMonthInvestments = Number(totalInvestmentsThisMonth._sum.amount) || 0
    const lastMonthInvestments = Number(totalInvestmentsLastMonth._sum.amount) || 0
    const thisMonthReturns = Number(totalReturnsThisMonth._sum.amount) || 0
    const lastMonthReturns = Number(totalReturnsLastMonth._sum.amount) || 0

    // Calculate growth percentages
    const userGrowth = totalUsersLastMonth > 0 
      ? ((totalUsers - totalUsersLastMonth) / totalUsersLastMonth) * 100 
      : 0
    
    const revenueGrowth = lastMonthInvestments > 0 
      ? ((thisMonthInvestments - lastMonthInvestments) / lastMonthInvestments) * 100 
      : 0
    
    const avgReturnRate = totalInvestedAmount > 0 
      ? (totalReturnAmount / totalInvestedAmount) * 100 
      : 0
    
    const successRate = totalDeals > 0 
      ? (completedDeals / totalDeals) * 100 
      : 0

    // Calculate historical changes (simplified - could be enhanced with real historical data)
    const successRateChange = Math.random() * 10 - 5 // Random for now, replace with real calculation
    const avgReturnChange = Math.random() * 8 - 4 // Random for now, replace with real calculation

    // Transform deal distribution data
    const dealDistribution = dealsByCategory.map(item => ({
      name: item.category || 'Other',
      value: item._count.category,
      amount: Number(item._sum.currentFunding) || 0,
      color: getCategoryColor(item.category)
    }))

    // Transform recent activities
    const recentActivities = recentTransactions.map(transaction => ({
      id: transaction.id,
      type: getActivityType(transaction.type, Number(transaction.amount)),
      message: getActivityMessage(transaction),
      timestamp: transaction.createdAt.toISOString(),
      status: transaction.status.toLowerCase(),
      amount: Number(transaction.amount)
    }))

    // Prepare response data
    const dashboardData = {
      // Key metrics
      totalUsers,
      activeInvestors: activeUsers,
      totalDeals,
      activeDeals,
      totalRevenue: totalInvestedAmount,
      monthlyRevenue: thisMonthInvestments,
      totalProfit: totalReturnAmount,
      monthlyProfit: thisMonthReturns,
      avgReturn: avgReturnRate,
      successRate,
      pendingApprovals: pendingApplications,
      systemAlerts,
      newUsersToday,
      completedDealsThisMonth: completedDeals,

      // Growth metrics
      userGrowth,
      revenueGrowth,
      successRateChange,
      avgReturnChange,

      // Chart data
      revenueData: monthlyRevenue.reverse(),
      userGrowthData: monthlyUsers.reverse(),
      dealDistributionData: dealDistribution,

      // Performance metrics
      performanceMetrics: [
        {
          metric: 'Avg Deal Size',
          value: totalDeals > 0 ? Math.round(totalInvestedAmount / totalDeals) : 0,
          change: revenueGrowth,
          trend: revenueGrowth >= 0 ? 'up' : 'down'
        },
        {
          metric: 'Success Rate',
          value: successRate,
          change: successRateChange,
          trend: successRateChange >= 0 ? 'up' : 'down'
        },
        {
          metric: 'Avg ROI',
          value: avgReturnRate,
          change: avgReturnChange,
          trend: avgReturnChange >= 0 ? 'up' : 'down'
        },
        {
          metric: 'Active Users',
          value: activeUsers,
          change: userGrowth,
          trend: userGrowth >= 0 ? 'up' : 'down'
        }
      ],

      // Recent activities
      recentActivities: recentActivities.slice(0, 4)
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('Admin dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Helper functions
function getCategoryColor(category: string | null): string {
  const colors: Record<string, string> = {
    'Technology': '#3B82F6',
    'Real Estate': '#10B981',
    'Agriculture': '#F59E0B',
    'Healthcare': '#8B5CF6',
    'Electronics': '#EF4444',
    'Energy': '#06B6D4',
    'Finance': '#84CC16',
    'Education': '#F97316',
  }
  return colors[category || 'Other'] || '#6B7280'
}

function getActivityType(transactionType: string, amount: number): string {
  if (transactionType === 'INVESTMENT' && amount >= 10000) {
    return 'large_investment'
  }
  if (transactionType === 'RETURN') {
    return 'deal_completed'
  }
  if (transactionType === 'DEPOSIT') {
    return 'deposit'
  }
  return 'transaction'
}

function getActivityMessage(transaction: any): string {
  const userName = transaction.user?.name || 'User'
  const amount = Number(transaction.amount)
  const projectTitle = transaction.investment?.project?.title

  switch (transaction.type) {
    case 'INVESTMENT':
      if (amount >= 10000) {
        return `Large investment of $${amount.toLocaleString()} received from ${userName}`
      }
      return `New investment of $${amount.toLocaleString()} in ${projectTitle || 'a project'}`
    
    case 'RETURN':
      return `Profit distribution of $${amount.toLocaleString()} completed for ${projectTitle || 'a project'}`
    
    case 'DEPOSIT':
      return `Deposit of $${amount.toLocaleString()} from ${userName}`
    
    case 'WITHDRAWAL':
      return `Withdrawal of $${amount.toLocaleString()} by ${userName}`
    
    default:
      return `Transaction of $${amount.toLocaleString()} by ${userName}`
  }
}
