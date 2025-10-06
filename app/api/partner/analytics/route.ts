import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '6months'

    // Calculate date range based on timeRange
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
      default:
        startDate.setMonth(now.getMonth() - 6)
    }

    // Get partner's deals
    const deals = await prisma.project.findMany({
      where: {
        ownerId: session.user.id,
        createdAt: {
          gte: startDate
        }
      },
      include: {
        investments: {
          include: {
            investor: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        dealPerformances: {
          orderBy: { date: 'desc' },
          take: 30
        }
      }
    })

    // Calculate key metrics - Fix NaN issues
    const totalDeals = deals.length
    const activeDeals = deals.filter(d => d.status === 'ACTIVE' || d.status === 'PUBLISHED').length
    const completedDeals = deals.filter(d => d.status === 'COMPLETED').length
    const pendingDeals = deals.filter(d => d.status === 'PENDING').length
    const draftDeals = deals.filter(d => d.status === 'DRAFT').length

    const totalValue = deals.reduce((sum, deal) => sum + (Number(deal.fundingGoal) || 0), 0)
    const totalRaised = deals.reduce((sum, deal) => sum + (Number(deal.currentFunding) || 0), 0)
    
    // Fix average return calculation
    const dealsWithReturns = deals.filter(deal => deal.expectedReturn && Number(deal.expectedReturn) > 0)
    const averageReturn = dealsWithReturns.length > 0 
      ? Math.round((dealsWithReturns.reduce((sum, deal) => sum + Number(deal.expectedReturn), 0) / dealsWithReturns.length) * 100) / 100
      : 0

    const successRate = totalDeals > 0 
      ? Math.round((completedDeals / totalDeals) * 100 * 100) / 100
      : 0

    // Get all investments for investor metrics
    const allInvestments = deals.flatMap(deal => deal.investments)
    const uniqueInvestors = new Set(allInvestments.map(inv => inv.investorId))
    const totalInvestors = uniqueInvestors.size

    // Calculate repeat investors
    const investorCounts = new Map()
    allInvestments.forEach(inv => {
      investorCounts.set(inv.investorId, (investorCounts.get(inv.investorId) || 0) + 1)
    })
    const repeatInvestors = Array.from(investorCounts.values()).filter(count => count > 1).length

    // Get monthly performance data
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date()
      monthDate.setMonth(now.getMonth() - i)
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)

      const monthDeals = deals.filter(d => 
        d.createdAt >= monthStart && d.createdAt <= monthEnd
      )

      const monthValue = monthDeals.reduce((sum, deal) => sum + (Number(deal.currentFunding) || 0), 0)
      const monthInvestors = new Set(
        monthDeals.flatMap(deal => deal.investments.map(inv => inv.investorId))
      ).size

      const monthReturn = monthDeals.length > 0
        ? Math.round((monthDeals.reduce((sum, deal) => sum + (Number(deal.expectedReturn) || 0), 0) / monthDeals.length) * 100) / 100
        : 0

      monthlyData.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        deals: monthDeals.length,
        value: monthValue,
        investors: monthInvestors,
        returns: Math.round(monthReturn * 100) / 100
      })
    }

    // Category performance
    const categoryStats = new Map()
    deals.forEach(deal => {
      const category = deal.category
      if (!categoryStats.has(category)) {
        categoryStats.set(category, {
          name: category,
          deals: 0,
          amount: 0,
          value: 0
        })
      }
      const stats = categoryStats.get(category)
      stats.deals += 1
      stats.amount += (Number(deal.currentFunding) || 0)
    })

    // Calculate percentages for categories
    const categoryData = Array.from(categoryStats.values()).map(cat => ({
      ...cat,
      value: totalRaised > 0 ? Math.round((cat.amount / totalRaised) * 100) : 0,
      color: getCategoryColor(cat.name)
    }))

    // Top performing deals
    const topDeals = deals
      .filter(deal => deal.investments.length > 0)
      .map(deal => ({
        id: deal.id,
        title: deal.title,
        category: deal.category,
        raised: Number(deal.currentFunding) || 0,
        goal: Number(deal.fundingGoal) || 0,
        return: Number(deal.expectedReturn) || 0,
        investors: deal.investments.length,
        status: deal.status,
        duration: Math.ceil((deal.duration || 180) / 30) // Convert days to months, default 6 months
      }))
      .sort((a, b) => b.return - a.return)
      .slice(0, 5)

    // Target vs actual (using funding goals as targets)
    const targetVsActual = monthlyData.map(month => {
      const monthDeals = deals.filter(d => {
        const dealMonth = d.createdAt.toLocaleDateString('en-US', { month: 'short' })
        return dealMonth === month.month
      })
      
      const target = monthDeals.reduce((sum, deal) => sum + (Number(deal.fundingGoal) || 0), 0)
      return {
        month: month.month,
        target,
        actual: month.value,
        deals: month.deals
      }
    })

    // Status distribution
    const statusData = [
      { name: 'Completed', value: completedDeals, color: '#10B981' },
      { name: 'Active', value: activeDeals, color: '#3B82F6' },
      { name: 'Pending', value: pendingDeals, color: '#F59E0B' },
      { name: 'Draft', value: draftDeals, color: '#6B7280' }
    ].filter(status => status.value > 0)

    const analyticsData = {
      // Key metrics
      metrics: {
        totalDeals,
        activeDeals,
        completedDeals,
        pendingDeals,
        draftDeals,
        totalValue,
        totalRaised,
        averageReturn,
        successRate,
        totalInvestors,
        repeatInvestors,
        averageDuration: deals.length > 0 
          ? Math.round(deals.reduce((sum, deal) => sum + Math.ceil(deal.duration / 30), 0) / deals.length)
          : 0
      },

      // Chart data
      performanceData: monthlyData,
      categoryData,
      statusData,
      topDeals,
      targetVsActual,

      // Additional metrics
      investorMetrics: {
        totalInvestors,
        newInvestors: totalInvestors - repeatInvestors,
        repeatInvestors,
        averageInvestment: allInvestments.length > 0 
          ? Math.round(allInvestments.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0) / allInvestments.length)
          : 0,
        investorRetention: totalInvestors > 0 
          ? Math.round((repeatInvestors / totalInvestors) * 100 * 100) / 100
          : 0
      }
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('Error fetching partner analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

// Helper function to get category colors
function getCategoryColor(category: string): string {
  const colors = {
    'Technology': '#3B82F6',
    'Real Estate': '#F59E0B', 
    'Healthcare': '#8B5CF6',
    'Manufacturing': '#10B981',
    'Finance': '#EF4444',
    'Education': '#06B6D4',
    'Retail': '#F97316',
    'Agriculture': '#84CC16'
  }
  return colors[category as keyof typeof colors] || '#6B7280'
}
