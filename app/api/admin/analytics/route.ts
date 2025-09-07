import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '6months'

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (timeRange) {
      case '1month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case '3months':
        startDate.setMonth(now.getMonth() - 3)
        break
      case '6months':
        startDate.setMonth(now.getMonth() - 6)
        break
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case 'all':
        startDate = new Date('2020-01-01')
        break
      default:
        startDate.setMonth(now.getMonth() - 6)
    }

    // Get total counts and aggregates
    const [
      totalUsers,
      totalInvestors,
      totalPartners,
      totalDeals,
      totalInvestments,
      totalRevenue,
      totalProfitDistributions,
      recentProjects,
      usersByRole,
      monthlyData
    ] = await Promise.all([
      // Total users
      prisma.user.count({ where: { isActive: true } }),
      
      // Total investors
      prisma.user.count({ where: { role: 'INVESTOR', isActive: true } }),
      
      // Total partners
      prisma.user.count({ where: { role: 'PARTNER', isActive: true } }),
      
      // Total deals/projects
      prisma.project.count(),
      
      // Total investments amount
      prisma.investment.aggregate({
        _sum: { amount: true },
        _count: true,
        where: { status: 'COMPLETED' }
      }),
      
      // Total revenue (sum of all completed transactions)
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          type: 'FEE',
          status: 'COMPLETED',
          createdAt: { gte: startDate }
        }
      }),
      
      // Total profit distributions
      prisma.profitDistribution.aggregate({
        _sum: { amount: true },
        _count: true,
        where: { status: 'COMPLETED' }
      }),
      
      // Recent projects by status
      prisma.project.groupBy({
        by: ['status'],
        _count: true,
        _sum: { currentFunding: true, fundingGoal: true }
      }),
      
      // Users by role
      prisma.user.groupBy({
        by: ['role'],
        _count: true,
        where: { isActive: true }
      }),
      
      // Monthly data for charts
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(*) as projects_count,
          SUM(CASE WHEN status = 'COMPLETED' THEN "currentFunding" ELSE 0 END) as completed_funding,
          SUM("fundingGoal") as total_funding_goal
        FROM "Project"
        WHERE "createdAt" >= ${startDate}
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month
      `
    ])

    // Get investment flow data
    const investmentsByStatus = await prisma.investment.groupBy({
      by: ['status'],
      _count: true,
      _sum: { amount: true }
    })

    // Get deals by category
    const dealsByCategory = await prisma.project.groupBy({
      by: ['category'],
      _count: true,
      _sum: { currentFunding: true, fundingGoal: true },
      _avg: { expectedReturn: true }
    })

    // Get partner performance
    const partnerPerformance = await prisma.user.findMany({
      where: { role: 'PARTNER', isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        projects: {
          select: {
            id: true,
            status: true,
            currentFunding: true,
            fundingGoal: true
          }
        }
      },
      take: 10
    })

    // Calculate growth rates (mock calculation for now)
    const calculateGrowthRate = (current: number, previous: number) => {
      if (previous === 0) return 0
      return ((current - previous) / previous) * 100
    }

    // Format monthly data for charts
    const formattedMonthlyData = (monthlyData as any[]).map((item: any) => ({
      month: new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      projects: Number(item.projects_count),
      funding: Number(item.completed_funding) || 0,
      goal: Number(item.total_funding_goal) || 0
    }))

    // Format investment flow
    const investmentFlowData = investmentsByStatus.map(item => ({
      name: item.status,
      value: item._count,
      amount: Number(item._sum.amount) || 0,
      color: item.status === 'COMPLETED' ? '#10B981' : 
             item.status === 'PENDING' ? '#F59E0B' : 
             item.status === 'ACTIVE' ? '#3B82F6' : '#EF4444'
    }))

    // Format category performance
    const categoryPerformance = dealsByCategory.map(item => ({
      category: item.category || 'Other',
      deals: item._count,
      totalFunding: Number(item._sum.currentFunding) || 0,
      goalFunding: Number(item._sum.fundingGoal) || 0,
      avgReturn: Number(item._avg.expectedReturn) || 0,
      successRate: item._sum.currentFunding && item._sum.fundingGoal 
        ? (Number(item._sum.currentFunding) / Number(item._sum.fundingGoal)) * 100 
        : 0
    }))

    // Format partner performance
    const formattedPartnerPerformance = partnerPerformance.map(partner => {
      const completedProjects = partner.projects.filter(p => p.status === 'COMPLETED').length
      const totalProjects = partner.projects.length
      const successRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0
      const totalFunding = partner.projects.reduce((sum, p) => sum + Number(p.currentFunding), 0)
      
      return {
        name: partner.name || 'Unknown Partner',
        email: partner.email,
        deals: totalProjects,
        completedDeals: completedProjects,
        totalFunding,
        successRate,
        tier: successRate >= 95 ? 'platinum' :
              successRate >= 85 ? 'gold' :
              successRate >= 75 ? 'silver' : 'bronze'
      }
    }).sort((a, b) => b.successRate - a.successRate)

    // Calculate user growth (mock data for chart)
    const userGrowthData = formattedMonthlyData.map(item => ({
      month: item.month,
      investors: Math.floor(totalInvestors * 0.8), // Mock distribution
      partners: Math.floor(totalPartners * 1.2),
      advisors: Math.floor(totalUsers * 0.05),
      total: totalUsers
    }))

    const analyticsData = {
      // Key metrics
      totalRevenue: Number(totalRevenue._sum.amount) || 0,
      totalInvestments: Number(totalInvestments._sum.amount) || 0,
      totalDeals: totalDeals,
      activeUsers: totalUsers,
      
      // Growth rates (calculated vs previous period - simplified)
      revenueGrowth: 6.0, // Mock for now
      investmentGrowth: 7.7,
      dealGrowth: 25.0,
      userGrowth: 7.8,
      
      // Chart data
      monthlyData: formattedMonthlyData,
      userGrowthData,
      investmentFlowData,
      categoryPerformance,
      partnerPerformance: formattedPartnerPerformance,
      
      // Summary stats
      stats: {
        totalInvestors,
        totalPartners,
        totalProjects: totalDeals,
        completedInvestments: totalInvestments._count,
        totalProfitDistributions: totalProfitDistributions._count,
        totalProfitAmount: Number(totalProfitDistributions._sum.amount) || 0
      }
    }

    return NextResponse.json(analyticsData)

  } catch (error) {
    console.error('Error fetching analytics data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}
