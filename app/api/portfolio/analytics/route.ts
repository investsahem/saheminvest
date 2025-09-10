import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/db'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '6M'

    // Calculate date range based on timeframe
    const now = new Date()
    let startDate = new Date()
    
    switch (timeframe) {
      case '1M':
        startDate.setMonth(now.getMonth() - 1)
        break
      case '3M':
        startDate.setMonth(now.getMonth() - 3)
        break
      case '6M':
        startDate.setMonth(now.getMonth() - 6)
        break
      case '1Y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case 'ALL':
        startDate = new Date('2020-01-01') // Set to platform start
        break
      default:
        startDate.setMonth(now.getMonth() - 6)
    }

    // Fetch user's investments with related data
    const investments = await prisma.investment.findMany({
      where: {
        investorId: session.user.id,
        createdAt: {
          gte: startDate
        }
      },
      include: {
        project: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                partnerProfile: {
                  select: {
                    companyName: true,
                    industry: true
                  }
                }
              }
            },
            dealPerformances: true
          }
        },
        transactions: {
          where: {
            type: {
              in: ['INVESTMENT', 'RETURN', 'PROFIT_DISTRIBUTION']
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Fetch all user transactions for broader analysis
    const allTransactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startDate
        },
        type: {
          in: ['INVESTMENT', 'RETURN', 'PROFIT_DISTRIBUTION']
        }
      },
      include: {
        investment: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
                category: true,
                riskLevel: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Calculate total metrics
    const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.amount), 0)
    const totalReturns = allTransactions
      .filter(t => ['RETURN', 'PROFIT_DISTRIBUTION'].includes(t.type))
      .reduce((sum, t) => sum + Number(t.amount), 0)

    // Calculate monthly returns data
    const monthlyData = new Map<string, any>()
    let cumulativeReturns = 0
    let benchmarkReturns = 0 // Assuming 8% annual benchmark
    const benchmarkMonthlyRate = 0.08 / 12

    allTransactions.forEach(transaction => {
      const monthKey = new Date(transaction.createdAt).toISOString().slice(0, 7) // YYYY-MM
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month: new Date(transaction.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
          }),
          returns: 0,
          cumulative: 0,
          benchmark: 0
        })
      }

      const monthData = monthlyData.get(monthKey)
      
      if (['RETURN', 'PROFIT_DISTRIBUTION'].includes(transaction.type)) {
        monthData.returns += Number(transaction.amount)
        cumulativeReturns += Number(transaction.amount)
      }
      
      monthData.cumulative = cumulativeReturns
      benchmarkReturns += totalInvested * benchmarkMonthlyRate
      monthData.benchmark = benchmarkReturns
    })

    const monthlyReturns = Array.from(monthlyData.values()).slice(-12) // Last 12 months

    // Calculate portfolio growth data
    const portfolioGrowth: any[] = []
    let investedAmount = 0
    let portfolioValue = 0

    monthlyReturns.forEach(month => {
      const monthInvestments = allTransactions
        .filter(t => t.type === 'INVESTMENT' && 
                new Date(t.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) === month.month)
        .reduce((sum, t) => sum + Number(t.amount), 0)
      
      investedAmount += monthInvestments
      portfolioValue = investedAmount + month.cumulative
      
      portfolioGrowth.push({
        month: month.month,
        invested: investedAmount,
        value: portfolioValue,
        benchmark: investedAmount * 1.08 // 8% benchmark
      })
    })

    // Calculate sector performance
    const sectorMap = new Map<string, any>()
    
    investments.forEach(investment => {
      const sector = investment.project.owner?.partnerProfile?.industry || 
                    investment.project.category || 'Other'
      const amount = Number(investment.amount)
      const returns = investment.transactions
        .filter(t => ['RETURN', 'PROFIT_DISTRIBUTION'].includes(t.type))
        .reduce((sum, t) => sum + Number(t.amount), 0)
      
      if (!sectorMap.has(sector)) {
        sectorMap.set(sector, {
          sector,
          invested: 0,
          returns: 0,
          returnRate: 0,
          color: getSectorColor(sector)
        })
      }
      
      const sectorData = sectorMap.get(sector)
      sectorData.invested += amount
      sectorData.returns += returns
      sectorData.returnRate = sectorData.invested > 0 ? (sectorData.returns / sectorData.invested) * 100 : 0
    })

    const sectorPerformance = Array.from(sectorMap.values())

    // Calculate risk analysis
    const riskMap = new Map<string, any>([
      ['LOW', { risk: 'Low Risk', allocation: 0, returns: 0, count: 0, color: '#10B981' }],
      ['MEDIUM', { risk: 'Medium Risk', allocation: 0, returns: 0, count: 0, color: '#F59E0B' }],
      ['HIGH', { risk: 'High Risk', allocation: 0, returns: 0, count: 0, color: '#EF4444' }]
    ])

    investments.forEach(investment => {
      const riskLevel = investment.project.riskLevel || 'MEDIUM'
      const amount = Number(investment.amount)
      const returns = investment.transactions
        .filter(t => ['RETURN', 'PROFIT_DISTRIBUTION'].includes(t.type))
        .reduce((sum, t) => sum + Number(t.amount), 0)
      
      const riskData = riskMap.get(riskLevel)
      if (riskData) {
        riskData.allocation += amount
        riskData.returns += returns
        riskData.count += 1
      }
    })

    // Convert to percentages and calculate average returns
    const riskAnalysis = Array.from(riskMap.values()).map(risk => ({
      ...risk,
      allocation: totalInvested > 0 ? (risk.allocation / totalInvested) * 100 : 0,
      returns: risk.allocation > 0 ? (risk.returns / risk.allocation) * 100 : 0
    })).filter(risk => risk.allocation > 0)

    // Calculate performance metrics
    const averageReturn = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0
    
    // Calculate monthly returns for volatility
    const monthlyReturnRates = monthlyReturns.map((month, index) => {
      if (index === 0) return 0
      const prevMonth = monthlyReturns[index - 1]
      return prevMonth.cumulative > 0 ? 
        ((month.cumulative - prevMonth.cumulative) / prevMonth.cumulative) * 100 : 0
    }).filter(rate => rate !== 0)

    // Calculate volatility (standard deviation of monthly returns)
    const avgMonthlyReturn = monthlyReturnRates.reduce((sum, rate) => sum + rate, 0) / monthlyReturnRates.length
    const variance = monthlyReturnRates.reduce((sum, rate) => sum + Math.pow(rate - avgMonthlyReturn, 2), 0) / monthlyReturnRates.length
    const volatility = Math.sqrt(variance)

    // Calculate Sharpe ratio (assuming 2% risk-free rate)
    const riskFreeRate = 2 // 2% annual
    const sharpeRatio = volatility > 0 ? (averageReturn - riskFreeRate) / volatility : 0

    // Find best and worst months
    const sortedMonths = [...monthlyReturns].sort((a, b) => b.returns - a.returns)
    const bestMonth = sortedMonths[0] || { month: 'N/A', return: 0 }
    const worstMonth = sortedMonths[sortedMonths.length - 1] || { month: 'N/A', return: 0 }

    // Calculate max drawdown
    let maxDrawdown = 0
    let peak = 0
    portfolioGrowth.forEach(point => {
      if (point.value > peak) {
        peak = point.value
      }
      const drawdown = peak > 0 ? ((peak - point.value) / peak) * 100 : 0
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
      }
    })

    // Calculate win rate
    const profitableInvestments = investments.filter(inv => {
      const returns = inv.transactions
        .filter(t => ['RETURN', 'PROFIT_DISTRIBUTION'].includes(t.type))
        .reduce((sum, t) => sum + Number(t.amount), 0)
      return returns > Number(inv.amount)
    }).length
    
    const winRate = investments.length > 0 ? (profitableInvestments / investments.length) * 100 : 0

    const performanceMetrics = {
      totalReturns,
      totalInvested,
      averageReturn,
      bestMonth: {
        month: bestMonth.month,
        return: bestMonth.returns || 0
      },
      worstMonth: {
        month: worstMonth.month,
        return: worstMonth.returns || 0
      },
      volatility: isNaN(volatility) ? 0 : volatility,
      sharpeRatio: isNaN(sharpeRatio) ? 0 : Math.max(0, sharpeRatio),
      maxDrawdown: -maxDrawdown, // Negative value
      winRate
    }

    return NextResponse.json({
      monthlyReturns,
      portfolioGrowth,
      sectorPerformance,
      riskAnalysis,
      performanceMetrics,
      summary: {
        totalInvestments: investments.length,
        totalInvested,
        totalReturns,
        activeInvestments: investments.filter(inv => 
          ['ACTIVE', 'PUBLISHED'].includes(inv.project.status)
        ).length
      }
    })

  } catch (error) {
    console.error('Error fetching portfolio analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

// Helper function to assign colors to sectors
function getSectorColor(sector: string): string {
  const colors = [
    '#10B981', // Green
    '#3B82F6', // Blue  
    '#8B5CF6', // Purple
    '#F59E0B', // Orange
    '#EF4444', // Red
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#EC4899', // Pink
    '#6366F1'  // Indigo
  ]
  
  const sectorColors: { [key: string]: string } = {
    'Real Estate': '#10B981',
    'Technology': '#3B82F6',
    'Healthcare': '#8B5CF6',
    'Energy': '#F59E0B',
    'Agriculture': '#EF4444',
    'Finance': '#06B6D4',
    'Manufacturing': '#84CC16',
    'Retail': '#F97316',
    'Education': '#EC4899',
    'Other': '#6366F1'
  }
  
  return sectorColors[sector] || colors[sector.length % colors.length]
}
