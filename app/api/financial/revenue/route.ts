import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'FINANCIAL_OFFICER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '6M'
    const category = searchParams.get('category')

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case '1M':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        break
      case '3M':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
        break
      case '6M':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1)
        break
      case '1Y':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1)
    }

    // Get revenue data from transactions
    const revenueTransactions = await prisma.transaction.findMany({
      where: {
        type: {
          in: ['FEE', 'COMMISSION']
        },
        status: 'COMPLETED',
        createdAt: {
          gte: startDate
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    })

    // Group revenue by month
    interface MonthlyRevenueData {
      month: string;
      platformFees: number;
      managementFees: number;
      advisoryFees: number;
      subscriptions: number;
      total: number;
    }
    
    const monthlyRevenue: { [key: string]: MonthlyRevenueData } = revenueTransactions.reduce((acc, transaction) => {
      const month = transaction.createdAt.toISOString().substring(0, 7) // YYYY-MM
      if (!acc[month]) {
        acc[month] = {
          month,
          platformFees: 0,
          managementFees: 0,
          advisoryFees: 0,
          subscriptions: 0,
          total: 0
        }
      }
      
      switch (transaction.type) {
        case 'FEE':
          if (transaction.description?.includes('management')) {
            acc[month].managementFees += Number(transaction.amount)
          } else if (transaction.description?.includes('advisory')) {
            acc[month].advisoryFees += Number(transaction.amount)
          } else {
            acc[month].platformFees += Number(transaction.amount)
          }
          break
        case 'COMMISSION':
          acc[month].platformFees += Number(transaction.amount)
          break
      }
      
      acc[month].total += Number(transaction.amount)
      return acc
    }, {} as { [key: string]: MonthlyRevenueData })

    // Convert to array and sort by month
    const monthlyData: MonthlyRevenueData[] = Object.values(monthlyRevenue).sort((a, b) => 
      a.month.localeCompare(b.month)
    )

    // Calculate revenue streams
    const revenueStreams = [
      {
        name: 'Platform Fees',
        category: 'Transaction Fees',
        currentMonth: monthlyData[monthlyData.length - 1]?.platformFees || 0,
        lastMonth: monthlyData[monthlyData.length - 2]?.platformFees || 0,
        color: '#10B981'
      },
      {
        name: 'Management Fees',
        category: 'Asset Management',
        currentMonth: monthlyData[monthlyData.length - 1]?.managementFees || 0,
        lastMonth: monthlyData[monthlyData.length - 2]?.managementFees || 0,
        color: '#3B82F6'
      },
      {
        name: 'Advisory Fees',
        category: 'Consultation',
        currentMonth: monthlyData[monthlyData.length - 1]?.advisoryFees || 0,
        lastMonth: monthlyData[monthlyData.length - 2]?.advisoryFees || 0,
        color: '#F59E0B'
      },
      {
        name: 'Subscriptions',
        category: 'Premium Services',
        currentMonth: monthlyData[monthlyData.length - 1]?.subscriptions || 0,
        lastMonth: monthlyData[monthlyData.length - 2]?.subscriptions || 0,
        color: '#8B5CF6'
      }
    ]

    // Add growth percentage to revenue streams
    const enhancedStreams = revenueStreams.map(stream => {
      const growth = stream.lastMonth > 0 
        ? ((stream.currentMonth - stream.lastMonth) / stream.lastMonth) * 100 
        : 0
      
      const totalRevenue = revenueStreams.reduce((sum, s) => sum + s.currentMonth, 0)
      const percentage = totalRevenue > 0 ? (stream.currentMonth / totalRevenue) * 100 : 0
      
      return {
        ...stream,
        growth,
        percentage: Math.round(percentage)
      }
    })

    // Get revenue by user segment
    const userSegments = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    })

    const segmentRevenue = await Promise.all(
      userSegments.map(async (segment) => {
        const segmentTransactions = await prisma.transaction.aggregate({
          _sum: {
            amount: true
          },
          _count: {
            id: true
          },
          where: {
            user: {
              role: segment.role
            },
            type: {
              in: ['FEE', 'COMMISSION']
            },
            status: 'COMPLETED',
            createdAt: {
              gte: startDate
            }
          }
        })

        return {
          segment: segment.role,
          revenue: Number(segmentTransactions._sum.amount) || 0,
          transactions: segmentTransactions._count.id || 0,
          avgRevenue: (segmentTransactions._count.id || 0) > 0 
            ? (Number(segmentTransactions._sum.amount) || 0) / (segmentTransactions._count.id || 0)
            : 0
        }
      })
    )

    return NextResponse.json({
      monthlyData,
      revenueStreams: enhancedStreams,
      segmentRevenue: segmentRevenue.filter(s => s.revenue > 0),
      summary: {
        totalRevenue: enhancedStreams.reduce((sum, stream) => sum + stream.currentMonth, 0),
        totalGrowth: enhancedStreams.reduce((sum, stream) => sum + stream.growth, 0) / enhancedStreams.length,
        activeStreams: enhancedStreams.filter(s => s.currentMonth > 0).length
      }
    })

  } catch (error) {
    console.error('Error fetching revenue data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'FINANCIAL_OFFICER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { name, category, targetAmount, description } = body

    if (!name || !category || !targetAmount) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category, targetAmount' },
        { status: 400 }
      )
    }

    // Create revenue stream record (you might want to create a RevenueStream model)
    // For now, we'll just return success
    return NextResponse.json({
      id: Date.now(),
      name,
      category,
      targetAmount: parseFloat(targetAmount),
      description,
      createdAt: new Date(),
      createdBy: session.user.id
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating revenue stream:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}