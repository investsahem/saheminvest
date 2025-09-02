import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import profitCalculationEngine from '../../../lib/profit-calculation'
import notificationService from '../../../lib/notifications'

// POST /api/admin/process-distributions - Process pending profit distributions
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admins and financial officers can process distributions
    if (!['ADMIN', 'FINANCIAL_OFFICER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { distributionIds } = await request.json()

    if (!distributionIds || !Array.isArray(distributionIds) || distributionIds.length === 0) {
      return NextResponse.json(
        { error: 'Distribution IDs are required' },
        { status: 400 }
      )
    }

    const results = []
    const errors = []

    // Process each distribution
    for (const distributionId of distributionIds) {
      try {
        const result = await profitCalculationEngine.processDistribution(distributionId)
        
        results.push({
          distributionId,
          success: true,
          totalDistributed: result.totalDistributed,
          transactionCount: result.transactions.length
        })

        // Send notifications to investors
        try {
          for (const transaction of result.transactions) {
            await notificationService.createNotification(
              transaction.userId,
              'Profit Distribution',
              `You have received a profit distribution of $${Number(transaction.amount)} from your investment.`,
              'PROFIT_DISTRIBUTION',
              {
                amount: Number(transaction.amount),
                reference: transaction.reference || '',
                transactionId: transaction.id
              }
            )
          }
        } catch (notificationError) {
          console.error('Failed to send notifications for distribution:', distributionId, notificationError)
        }

      } catch (error) {
        console.error(`Failed to process distribution ${distributionId}:`, error)
        errors.push({
          distributionId,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const totalDistributed = results.reduce((sum, result) => sum + Number(result.totalDistributed), 0)
    const totalTransactions = results.reduce((sum, result) => sum + result.transactionCount, 0)

    return NextResponse.json({
      success: true,
      processed: results.length,
      failed: errors.length,
      totalDistributed,
      totalTransactions,
      results,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully processed ${results.length} distributions${errors.length > 0 ? ` with ${errors.length} failures` : ''}`
    })

  } catch (error) {
    console.error('Batch distribution processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process distributions' },
      { status: 500 }
    )
  }
}

// GET /api/admin/process-distributions - Get pending distributions
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

    const pendingDistributions = await profitCalculationEngine.getPendingDistributions()

    // Calculate summary statistics
    const totalPendingAmount = pendingDistributions.reduce((sum: number, dist: any) => 
      sum + Number(dist.investorPool), 0
    )
    
    const totalInvestors = pendingDistributions.reduce((sum: number, dist: any) => 
      sum + dist.investorDistributions.length, 0
    )

    return NextResponse.json({
      success: true,
      distributions: pendingDistributions,
      summary: {
        count: pendingDistributions.length,
        totalPendingAmount,
        totalInvestors
      }
    })

  } catch (error) {
    console.error('Pending distributions retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve pending distributions' },
      { status: 500 }
    )
  }
}



