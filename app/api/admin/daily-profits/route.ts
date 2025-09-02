import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import dailyProfitService from '../../../lib/daily-profit-service'

// POST /api/admin/daily-profits - Trigger daily profit processing
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admins and financial officers can trigger profit processing
    if (!['ADMIN', 'FINANCIAL_OFFICER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { date, autoDistribute = false } = await request.json()
    
    const processDate = date ? new Date(date) : new Date()
    
    // Validate date is not in the future
    if (processDate > new Date()) {
      return NextResponse.json(
        { error: 'Cannot process profits for future dates' },
        { status: 400 }
      )
    }

    console.log(`Manual daily profit processing triggered by ${session.user.email} for ${processDate.toISOString().split('T')[0]}`)

    // Process daily profits
    const results = await dailyProfitService.processAllDeals(processDate)

    // Auto-distribute if requested (simplified for now)
    let distributionResults = null
    if (autoDistribute) {
      distributionResults = { message: 'Auto-distribution not implemented yet' }
    }

    return NextResponse.json({
      success: true,
      date: processDate.toISOString().split('T')[0],
      processing: results,
      distribution: distributionResults,
      message: `Daily profit processing completed. Processed ${results.processed} deals, generated $${results.totalProfitGenerated.toFixed(2)} in profits.`
    })

  } catch (error) {
    console.error('Manual daily profit processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process daily profits' },
      { status: 500 }
    )
  }
}

// GET /api/admin/daily-profits - Get daily profit processing status and health check
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!['ADMIN', 'FINANCIAL_OFFICER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'health') {
      return NextResponse.json({
        success: true,
        health: { status: 'ok', message: 'Service is running' },
        timestamp: new Date().toISOString()
      })
    }

    // Default: get processing status and recent activity
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    // Get recent active deals with performance data
    const recentPerformances = await prisma.project.findMany({
      where: {
        status: 'ACTIVE'
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        category: true,
        currentFunding: true,
        fundingGoal: true,
        expectedReturn: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Get pending transactions (as a proxy for pending distributions)
    const pendingDistributions = await prisma.transaction.count({
      where: { 
        status: 'PENDING',
        type: 'RETURN'
      }
    })

    // Get today's processing stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get today's profit-related transactions
    const todayStats = await prisma.transaction.aggregate({
      where: {
        type: 'RETURN',
        status: 'COMPLETED',
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      },
      _count: {
        id: true
      },
      _sum: {
        amount: true
      }
    })

    return NextResponse.json({
      success: true,
      status: {
        pendingDistributions,
        todayProcessed: todayStats._count.id || 0,
        todayDailyProfit: Number(todayStats._sum.amount) || 0,
        todayCumulativeProfit: Number(todayStats._sum.amount) || 0
      },
      recentActivity: recentPerformances,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Daily profit status retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve daily profit status' },
      { status: 500 }
    )
  }
}



