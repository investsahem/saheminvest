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

    // Start transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update the request status with final percentages
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

      // 2. Handle distribution logic based on type
      if (distributionRequest.distributionType === 'FINAL') {
        // For final distributions, return capital first, then distribute profits
        for (const investment of distributionRequest.project.investments) {
          const investmentAmount = Number(investment.amount)
          const investmentRatio = investmentAmount / totalInvestmentAmount
          const investorProfitShare = investorDistributionAmount * investmentRatio

          // Create capital return transaction
          await tx.transaction.create({
            data: {
              userId: investment.investorId,
              type: 'CAPITAL_RETURN',
              amount: investmentAmount,
              status: 'COMPLETED',
              description: `Capital return from final distribution: ${distributionRequest.project.title}`
            }
          })

          // Create profit distribution transaction if there's profit to distribute
          if (investorProfitShare > 0) {
            await tx.transaction.create({
              data: {
                userId: investment.investorId,
                type: 'PROFIT_RETURN',
                amount: investorProfitShare,
                status: 'COMPLETED',
                description: `Final profit distribution from ${distributionRequest.project.title}`
              }
            })
          }

          // Create profit distribution record
          await tx.profitDistribution.create({
            data: {
              projectId: distributionRequest.projectId,
              investorId: investment.investorId,
              investmentId: investment.id,
              amount: investorProfitShare,
              profitRate: totalProfit > 0 ? (investorProfitShare / investmentAmount) * 100 : 0,
              investmentShare: investmentRatio * 100,
              distributionDate: new Date(),
              status: 'COMPLETED',
              profitPeriod: 'FINAL'
            }
          })

          // Update investor's wallet balance and total returns
          const investor = await tx.user.findUnique({
            where: { id: investment.investorId }
          })

          if (investor) {
            await tx.user.update({
              where: { id: investment.investorId },
              data: {
                walletBalance: (investor.walletBalance || 0) + investmentAmount + investorProfitShare,
                totalReturns: (investor.totalReturns || 0) + investorProfitShare
              }
            })
          }
        }
      } else {
        // For partial distributions, only distribute profits (no capital return)
        for (const investment of distributionRequest.project.investments) {
          const investmentAmount = Number(investment.amount)
          const investmentRatio = investmentAmount / totalInvestmentAmount
          const investorProfitShare = investorDistributionAmount * investmentRatio

          // Create profit distribution transaction
          if (investorProfitShare > 0) {
            await tx.transaction.create({
              data: {
                userId: investment.investorId,
                type: 'PROFIT_RETURN',
                amount: investorProfitShare,
                status: 'COMPLETED',
                description: `Partial profit distribution from ${distributionRequest.project.title}`
              }
            })
          }

          // Create profit distribution record
          await tx.profitDistribution.create({
            data: {
              projectId: distributionRequest.projectId,
              investorId: investment.investorId,
              investmentId: investment.id,
              amount: investorProfitShare,
              profitRate: totalProfit > 0 ? (investorProfitShare / investmentAmount) * 100 : 0,
              investmentShare: investmentRatio * 100,
              distributionDate: new Date(),
              status: 'COMPLETED',
              profitPeriod: 'PARTIAL'
            }
          })

          // Update investor's wallet balance and total returns
          const investor = await tx.user.findUnique({
            where: { id: investment.investorId }
          })

          if (investor) {
            await tx.user.update({
              where: { id: investment.investorId },
              data: {
                walletBalance: (investor.walletBalance || 0) + investorProfitShare,
                totalReturns: (investor.totalReturns || 0) + investorProfitShare
              }
            })
          }
        }
      }

      // 3. Create notification for partner
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

      // 4. Create notifications for investors
      for (const investment of distributionRequest.project.investments) {
        const investmentAmount = Number(investment.amount)
        const investmentRatio = investmentAmount / totalInvestmentAmount
        const investorProfitShare = investorDistributionAmount * investmentRatio
        
        const capitalMessage = distributionRequest.distributionType === 'FINAL' 
          ? ` وتم إرجاع رأس المال ${investmentAmount.toFixed(2)} دولار`
          : ''

        await tx.notification.create({
          data: {
            userId: investment.investorId,
            type: 'PROFIT_RECEIVED',
            title: distributionRequest.distributionType === 'FINAL' 
              ? 'تم استلام التوزيع النهائي' 
              : 'تم استلام أرباح جزئية',
            message: `تم إضافة ${investorProfitShare.toFixed(2)} دولار كأرباح من الصفقة "${distributionRequest.project.title}" إلى محفظتك${capitalMessage}.`,
            metadata: JSON.stringify({
              dealId: distributionRequest.projectId,
              profitAmount: investorProfitShare,
              capitalAmount: distributionRequest.distributionType === 'FINAL' ? investmentAmount : 0,
              profitRate: totalProfit > 0 ? (investorProfitShare / investmentAmount) * 100 : 0,
              distributionType: distributionRequest.distributionType
            }),
            read: false
          }
        })
      }
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
