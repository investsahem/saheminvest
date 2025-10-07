import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const requestId = params.id
    
    // Get admin editable fields from request body (if any)
    const body = await request.json().catch(() => ({}))
    const { sahemInvestPercent, reservedGainPercent } = body

    // Get the profit distribution request
    const distributionRequest = await prisma.profitDistributionRequest.findUnique({
      where: { id: requestId },
      include: {
        project: {
          include: {
            investments: {
              include: {
                investor: true
              }
            }
          }
        },
        partner: true
      }
    })

    if (!distributionRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (distributionRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'Request already processed' }, { status: 400 })
    }

    // Update the request with admin-edited percentages if provided
    const finalSahemPercent = sahemInvestPercent ?? distributionRequest.sahemInvestPercent
    const finalReservedPercent = reservedGainPercent ?? distributionRequest.reservedGainPercent

    // Calculate distribution amounts
    const totalProfit = Number(distributionRequest.estimatedProfit)
    const sahemInvestAmount = (totalProfit * Number(finalSahemPercent)) / 100
    const reservedAmount = (totalProfit * Number(finalReservedPercent)) / 100
    const investorDistributionAmount = totalProfit - sahemInvestAmount - reservedAmount

    // Calculate total investment amount for ratio calculations
    const totalInvestmentAmount = distributionRequest.project.investments.reduce(
      (sum, inv) => sum + Number(inv.amount), 0
    )

    if (totalInvestmentAmount === 0) {
      return NextResponse.json({ error: 'No investments found for this deal' }, { status: 400 })
    }

    // Get all unique investor IDs and their current wallet data before transaction
    const uniqueInvestorIds = [...new Set(distributionRequest.project.investments.map(inv => inv.investorId))]
    const investorsData = await prisma.user.findMany({
      where: { id: { in: uniqueInvestorIds } },
      select: { id: true, walletBalance: true, totalReturns: true }
    })
    
    // Create a map for quick lookup
    const investorDataMap = new Map(investorsData.map(investor => [investor.id, investor]))

    // Prepare all operations for the transaction
    const transactionOperations: any[] = []
    const profitDistributionOperations: any[] = []
    const walletUpdateOperations: any[] = []
    const notificationOperations: any[] = []

    // Calculate all operations first
    for (const investment of distributionRequest.project.investments) {
      const investmentAmount = Number(investment.amount)
      const investmentRatio = investmentAmount / totalInvestmentAmount
      const investorProfitShare = investorDistributionAmount * investmentRatio
      const investorData = investorDataMap.get(investment.investorId)

      if (!investorData) continue

      const currentWalletBalance = Number(investorData.walletBalance || 0)
      const currentTotalReturns = Number(investorData.totalReturns || 0)

      if (distributionRequest.distributionType === 'FINAL') {
        // Capital return transaction
        transactionOperations.push({
          userId: investment.investorId,
          type: 'RETURN',
          amount: investmentAmount,
          status: 'COMPLETED',
          description: `Capital return from final distribution: ${distributionRequest.project.title}`,
          investmentId: investment.id
        })

        // Profit distribution transaction
        if (investorProfitShare > 0) {
          transactionOperations.push({
            userId: investment.investorId,
            type: 'PROFIT_DISTRIBUTION',
            amount: investorProfitShare,
            status: 'COMPLETED',
            description: `Final profit distribution from ${distributionRequest.project.title}`,
            investmentId: investment.id
          })
        }

        // Wallet update
        walletUpdateOperations.push({
          where: { id: investment.investorId },
          data: {
            walletBalance: currentWalletBalance + investmentAmount + investorProfitShare,
            totalReturns: currentTotalReturns + investorProfitShare
          }
        })

        // Profit distribution record
        profitDistributionOperations.push({
          projectId: distributionRequest.projectId,
          investorId: investment.investorId,
          investmentId: investment.id,
          amount: investorProfitShare,
          profitRate: totalProfit > 0 ? (investorProfitShare / investmentAmount) * 100 : 0,
          investmentShare: investmentRatio * 100,
          distributionDate: new Date(),
          status: 'COMPLETED',
          profitPeriod: 'FINAL'
        })

        // Investor notification
        const capitalMessage = ` وتم إرجاع رأس المال ${investmentAmount.toFixed(2)} دولار`
        notificationOperations.push({
          userId: investment.investorId,
          type: 'PROFIT_RECEIVED',
          title: 'تم استلام التوزيع النهائي',
          message: `تم إضافة ${investorProfitShare.toFixed(2)} دولار كأرباح من الصفقة "${distributionRequest.project.title}" إلى محفظتك${capitalMessage}.`,
          metadata: JSON.stringify({
            dealId: distributionRequest.projectId,
            profitAmount: investorProfitShare,
            capitalAmount: investmentAmount,
            profitRate: totalProfit > 0 ? (investorProfitShare / investmentAmount) * 100 : 0,
            distributionType: distributionRequest.distributionType
          }),
          read: false
        })
      } else {
        // Partial distribution - only profits
        if (investorProfitShare > 0) {
          transactionOperations.push({
            userId: investment.investorId,
            type: 'PROFIT_DISTRIBUTION',
            amount: investorProfitShare,
            status: 'COMPLETED',
            description: `Partial profit distribution from ${distributionRequest.project.title}`,
            investmentId: investment.id
          })
        }

        // Wallet update
        walletUpdateOperations.push({
          where: { id: investment.investorId },
          data: {
            walletBalance: currentWalletBalance + investorProfitShare,
            totalReturns: currentTotalReturns + investorProfitShare
          }
        })

        // Profit distribution record
        profitDistributionOperations.push({
          projectId: distributionRequest.projectId,
          investorId: investment.investorId,
          investmentId: investment.id,
          amount: investorProfitShare,
          profitRate: totalProfit > 0 ? (investorProfitShare / investmentAmount) * 100 : 0,
          investmentShare: investmentRatio * 100,
          distributionDate: new Date(),
          status: 'COMPLETED',
          profitPeriod: 'PARTIAL'
        })

        // Investor notification
        notificationOperations.push({
          userId: investment.investorId,
          type: 'PROFIT_RECEIVED',
          title: 'تم استلام أرباح جزئية',
          message: `تم إضافة ${investorProfitShare.toFixed(2)} دولار كأرباح من الصفقة "${distributionRequest.project.title}" إلى محفظتك.`,
          metadata: JSON.stringify({
            dealId: distributionRequest.projectId,
            profitAmount: investorProfitShare,
            capitalAmount: 0,
            profitRate: totalProfit > 0 ? (investorProfitShare / investmentAmount) * 100 : 0,
            distributionType: distributionRequest.distributionType
          }),
          read: false
        })
      }
    }

    // Execute all operations in a single transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update the request status
      await tx.profitDistributionRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
          sahemInvestPercent: finalSahemPercent,
          reservedGainPercent: finalReservedPercent
        }
      })

      // 2. Create all transactions
      if (transactionOperations.length > 0) {
        await tx.transaction.createMany({
          data: transactionOperations
        })
      }

      // 3. Create all profit distribution records
      if (profitDistributionOperations.length > 0) {
        await tx.profitDistribution.createMany({
          data: profitDistributionOperations
        })
      }

      // 4. Update all wallet balances
      for (const walletUpdate of walletUpdateOperations) {
        await tx.user.update(walletUpdate)
      }

      // 5. Create partner notification
      await tx.notification.create({
        data: {
          userId: distributionRequest.partnerId,
          type: 'PROFIT_DISTRIBUTION_APPROVED',
          title: 'تم الموافقة على توزيع الأرباح',
          message: `تم الموافقة على طلب توزيع الأرباح للصفقة "${distributionRequest.project.title}" وتم توزيع ${investorDistributionAmount.toFixed(2)} دولار على المستثمرين من إجمالي ${totalProfit.toFixed(2)} دولار.`,
          metadata: JSON.stringify({
            dealId: distributionRequest.projectId,
            requestId: distributionRequest.id,
            totalProfit: totalProfit,
            investorAmount: investorDistributionAmount,
            sahemAmount: sahemInvestAmount,
            reservedAmount: reservedAmount,
            distributionType: distributionRequest.distributionType
          }),
          read: false
        }
      })

      // 6. Create all investor notifications
      if (notificationOperations.length > 0) {
        await tx.notification.createMany({
          data: notificationOperations
        })
      }
    }, {
      timeout: 30000 // 30 second timeout
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Profit distribution approved and processed successfully',
      summary: {
        totalProfit: totalProfit,
        investorDistribution: investorDistributionAmount,
        sahemInvestAmount: sahemInvestAmount,
        reservedAmount: reservedAmount,
        investorCount: distributionRequest.project.investments.length,
        distributionType: distributionRequest.distributionType
      }
    })

  } catch (error) {
    console.error('Error approving profit distribution:', error)
    return NextResponse.json(
      { error: 'Failed to approve profit distribution' },
      { status: 500 }
    )
  }
}
