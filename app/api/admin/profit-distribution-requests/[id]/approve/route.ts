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
    const { 
      totalAmount,
      estimatedProfit,
      estimatedGainPercent,
      estimatedClosingPercent,
      estimatedReturnCapital,
      sahemInvestPercent, 
      reservedGainPercent,
      isLoss,
      investorDistributions // Custom per-investor amounts (optional)
    } = body

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

    // Use edited values or fall back to original request values
    const finalTotalAmount = totalAmount ?? Number(distributionRequest.totalAmount)
    const finalEstimatedProfit = estimatedProfit ?? Number(distributionRequest.estimatedProfit)
    const finalEstimatedGainPercent = estimatedGainPercent ?? Number(distributionRequest.estimatedGainPercent)
    const finalEstimatedClosingPercent = estimatedClosingPercent ?? Number(distributionRequest.estimatedClosingPercent)
    const finalEstimatedReturnCapital = estimatedReturnCapital ?? Number(distributionRequest.estimatedReturnCapital)
    const finalIsLoss = isLoss ?? (finalEstimatedProfit < 0)
    const isFinalDistribution = distributionRequest.distributionType === 'FINAL'

    // Calculate distribution amounts based on profit/loss scenario
    let finalSahemPercent: number
    let finalReservedPercent: number
    let sahemInvestAmount: number
    let reservedAmount: number
    let investorDistributionAmount: number
    let capitalReturnAmount: number

    if (isFinalDistribution && finalIsLoss) {
      // LOSS SCENARIO: No commissions, all remaining amount goes to investors
      finalSahemPercent = 0
      finalReservedPercent = 0
      sahemInvestAmount = 0
      reservedAmount = 0
      investorDistributionAmount = 0 // No profit
      capitalReturnAmount = finalTotalAmount // All remaining funds for capital recovery
      
      console.log(`Processing LOSS scenario: Total remaining ${finalTotalAmount} goes to investors for capital recovery`)
    } else {
      // PROFIT SCENARIO (or Partial): Normal commission distribution
      finalSahemPercent = sahemInvestPercent ?? Number(distributionRequest.sahemInvestPercent)
      finalReservedPercent = reservedGainPercent ?? Number(distributionRequest.reservedGainPercent)
      sahemInvestAmount = (finalEstimatedProfit * finalSahemPercent) / 100
      reservedAmount = (finalEstimatedProfit * finalReservedPercent) / 100
      investorDistributionAmount = finalEstimatedProfit - sahemInvestAmount - reservedAmount
      capitalReturnAmount = finalEstimatedReturnCapital
      
      console.log(`Processing ${isFinalDistribution ? 'PROFIT' : 'PARTIAL'} scenario: Profit ${finalEstimatedProfit}, Sahem ${sahemInvestAmount}, Reserve ${reservedAmount}, Investors ${investorDistributionAmount}, Capital ${capitalReturnAmount}`)
    }

    const totalProfit = finalEstimatedProfit

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

    // Group investments by investor and calculate totals
    const investorGroups = new Map<string, {
      totalInvestment: number
      investments: typeof distributionRequest.project.investments
    }>()

    for (const investment of distributionRequest.project.investments) {
      const investorId = investment.investorId
      if (!investorGroups.has(investorId)) {
        investorGroups.set(investorId, {
          totalInvestment: 0,
          investments: []
        })
      }
      const group = investorGroups.get(investorId)!
      group.totalInvestment += Number(investment.amount)
      group.investments.push(investment)
    }

    console.log(`Processing ${investorGroups.size} unique investors from ${distributionRequest.project.investments.length} investments`)

    // Create a map for custom investor amounts if provided
    const customAmountsMap = new Map<string, { finalCapital: number; finalProfit: number }>()
    if (investorDistributions && Array.isArray(investorDistributions)) {
      for (const dist of investorDistributions) {
        customAmountsMap.set(dist.investorId, {
          finalCapital: dist.finalCapital || 0,
          finalProfit: dist.finalProfit || 0
        })
      }
      console.log(`Using custom amounts for ${customAmountsMap.size} investors`)
    }

    // Calculate all operations first - ONE per investor
    for (const [investorId, investorGroup] of investorGroups.entries()) {
      const investorTotalInvestment = investorGroup.totalInvestment
      const investmentRatio = investorTotalInvestment / totalInvestmentAmount
      
      // Use custom amounts if provided, otherwise calculate from ratio
      let investorProfitShare: number
      let investorCapitalReturn: number
      
      if (customAmountsMap.has(investorId)) {
        const customAmounts = customAmountsMap.get(investorId)!
        investorProfitShare = customAmounts.finalProfit
        investorCapitalReturn = customAmounts.finalCapital
        console.log(`Using custom amounts for investor ${investorId}: profit=${investorProfitShare}, capital=${investorCapitalReturn}`)
      } else {
        investorProfitShare = investorDistributionAmount * investmentRatio
        investorCapitalReturn = capitalReturnAmount * investmentRatio
      }
      
      const investorData = investorDataMap.get(investorId)

      if (!investorData) continue

      const currentWalletBalance = Number(investorData.walletBalance || 0)
      const currentTotalReturns = Number(investorData.totalReturns || 0)

      // Use the first investment for linking (or we could link to all)
      const firstInvestment = investorGroup.investments[0]

      if (isFinalDistribution) {
        // FINAL DISTRIBUTION
        if (finalIsLoss) {
          // LOSS SCENARIO: Return capital only (partial recovery)
          transactionOperations.push({
            userId: investorId,
            type: 'RETURN',
            amount: investorCapitalReturn,
            status: 'COMPLETED',
            description: `Capital return (partial recovery after loss) from final distribution: ${distributionRequest.project.title}`,
            investmentId: firstInvestment.id
          })

          // Wallet update - only capital return, no profit
          walletUpdateOperations.push({
            where: { id: investorId },
            data: {
              walletBalance: currentWalletBalance + investorCapitalReturn,
              totalReturns: currentTotalReturns // No profit to add in loss scenario
            }
          })

          // Profit distribution record (showing loss)
          const lossAmount = investorTotalInvestment - investorCapitalReturn
          profitDistributionOperations.push({
            projectId: distributionRequest.projectId,
            investorId: investorId,
            investmentId: firstInvestment.id,
            amount: -lossAmount, // Negative to indicate loss
            profitRate: -((lossAmount / investorTotalInvestment) * 100),
            investmentShare: investmentRatio * 100,
            distributionDate: new Date(),
            status: 'COMPLETED',
            profitPeriod: 'FINAL'
          })

          // Investor notification for loss
          notificationOperations.push({
            userId: investorId,
            type: 'PROFIT_RECEIVED',
            title: 'تم استلام التوزيع النهائي',
            message: `تم إرجاع ${investorCapitalReturn.toFixed(2)} دولار من رأس المال من الصفقة "${distributionRequest.project.title}". لم تحقق الصفقة ربحاً، وتم استرداد جزء من رأس المال.`,
            metadata: JSON.stringify({
              dealId: distributionRequest.projectId,
              profitAmount: 0,
              capitalAmount: investorCapitalReturn,
              originalInvestment: investorTotalInvestment,
              lossAmount: lossAmount,
              profitRate: -((lossAmount / investorTotalInvestment) * 100),
              distributionType: 'FINAL',
              isLoss: true
            }),
            read: false
          })
        } else {
          // PROFIT SCENARIO: Return capital + profit
          // Capital return transaction
          transactionOperations.push({
            userId: investorId,
            type: 'RETURN',
            amount: investorCapitalReturn,
            status: 'COMPLETED',
            description: `Capital return from final distribution: ${distributionRequest.project.title}`,
            investmentId: firstInvestment.id
          })

          // Profit distribution transaction
          if (investorProfitShare > 0) {
            transactionOperations.push({
              userId: investorId,
              type: 'PROFIT_DISTRIBUTION',
              amount: investorProfitShare,
              status: 'COMPLETED',
              description: `Final profit distribution from ${distributionRequest.project.title}`,
              investmentId: firstInvestment.id
            })
          }

          // Wallet update
          walletUpdateOperations.push({
            where: { id: investorId },
            data: {
              walletBalance: currentWalletBalance + investorCapitalReturn + investorProfitShare,
              totalReturns: currentTotalReturns + investorProfitShare
            }
          })

          // Profit distribution record
          profitDistributionOperations.push({
            projectId: distributionRequest.projectId,
            investorId: investorId,
            investmentId: firstInvestment.id,
            amount: investorProfitShare,
            profitRate: totalProfit > 0 ? (investorProfitShare / investorTotalInvestment) * 100 : 0,
            investmentShare: investmentRatio * 100,
            distributionDate: new Date(),
            status: 'COMPLETED',
            profitPeriod: 'FINAL'
          })

          // Investor notification
          const capitalMessage = ` وتم إرجاع رأس المال ${investorCapitalReturn.toFixed(2)} دولار`
          notificationOperations.push({
            userId: investorId,
            type: 'PROFIT_RECEIVED',
            title: 'تم استلام التوزيع النهائي',
            message: `تم إضافة ${investorProfitShare.toFixed(2)} دولار كأرباح من الصفقة "${distributionRequest.project.title}" إلى محفظتك${capitalMessage}.`,
            metadata: JSON.stringify({
              dealId: distributionRequest.projectId,
              profitAmount: investorProfitShare,
              capitalAmount: investorCapitalReturn,
              profitRate: totalProfit > 0 ? (investorProfitShare / investorTotalInvestment) * 100 : 0,
              distributionType: 'FINAL',
              isLoss: false
            }),
            read: false
          })
        }
      } else {
        // Partial distribution - only profits
        if (investorProfitShare > 0) {
          transactionOperations.push({
            userId: investorId,
            type: 'PROFIT_DISTRIBUTION',
            amount: investorProfitShare,
            status: 'COMPLETED',
            description: `Partial profit distribution from ${distributionRequest.project.title}`,
            investmentId: firstInvestment.id
          })
        }

        // Wallet update
        walletUpdateOperations.push({
          where: { id: investorId },
          data: {
            walletBalance: currentWalletBalance + investorProfitShare,
            totalReturns: currentTotalReturns + investorProfitShare
          }
        })

        // Profit distribution record
        profitDistributionOperations.push({
          projectId: distributionRequest.projectId,
          investorId: investorId,
          investmentId: firstInvestment.id,
          amount: investorProfitShare,
          profitRate: totalProfit > 0 ? (investorProfitShare / investorTotalInvestment) * 100 : 0,
          investmentShare: investmentRatio * 100,
          distributionDate: new Date(),
          status: 'COMPLETED',
          profitPeriod: 'PARTIAL'
        })

        // Investor notification
        notificationOperations.push({
          userId: investorId,
          type: 'PROFIT_RECEIVED',
          title: 'تم استلام أرباح جزئية',
          message: `تم إضافة ${investorProfitShare.toFixed(2)} دولار كأرباح من الصفقة "${distributionRequest.project.title}" إلى محفظتك.`,
          metadata: JSON.stringify({
            dealId: distributionRequest.projectId,
            profitAmount: investorProfitShare,
            capitalAmount: 0,
            profitRate: totalProfit > 0 ? (investorProfitShare / investorTotalInvestment) * 100 : 0,
            distributionType: distributionRequest.distributionType
          }),
          read: false
        })
      }
    }

    // Execute all operations in a single transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update the request status with all edited fields
      await tx.profitDistributionRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
          // Update all editable fields
          totalAmount: finalTotalAmount,
          estimatedProfit: finalEstimatedProfit,
          estimatedGainPercent: finalEstimatedGainPercent,
          estimatedClosingPercent: finalEstimatedClosingPercent,
          estimatedReturnCapital: capitalReturnAmount,
          sahemInvestPercent: finalSahemPercent,
          reservedGainPercent: finalReservedPercent,
          // Store custom investor amounts if provided
          investorCustomAmounts: investorDistributions ? JSON.stringify(investorDistributions) : null
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
      const partnerNotificationMessage = finalIsLoss && isFinalDistribution
        ? `تم الموافقة على طلب التوزيع النهائي للصفقة "${distributionRequest.project.title}". الصفقة أظهرت خسارة، وتم توزيع ${capitalReturnAmount.toFixed(2)} دولار على المستثمرين لاسترداد رأس المال (بدون عمولات).`
        : `تم الموافقة على طلب توزيع الأرباح للصفقة "${distributionRequest.project.title}" وتم توزيع ${investorDistributionAmount.toFixed(2)} دولار كأرباح و ${capitalReturnAmount.toFixed(2)} دولار كرأس مال على المستثمرين من إجمالي ${totalProfit.toFixed(2)} دولار.`
      
      await tx.notification.create({
        data: {
          userId: distributionRequest.partnerId,
          type: 'PROFIT_DISTRIBUTION_APPROVED',
          title: 'تم الموافقة على توزيع الأرباح',
          message: partnerNotificationMessage,
          metadata: JSON.stringify({
            dealId: distributionRequest.projectId,
            requestId: distributionRequest.id,
            totalProfit: totalProfit,
            investorAmount: investorDistributionAmount,
            capitalReturnAmount: capitalReturnAmount,
            sahemAmount: sahemInvestAmount,
            reservedAmount: reservedAmount,
            distributionType: distributionRequest.distributionType,
            isLoss: finalIsLoss
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
      message: finalIsLoss && isFinalDistribution 
        ? 'Loss distribution approved and processed successfully'
        : 'Profit distribution approved and processed successfully',
      summary: {
        totalProfit: totalProfit,
        totalAmount: finalTotalAmount,
        investorDistribution: investorDistributionAmount,
        capitalReturn: capitalReturnAmount,
        sahemInvestAmount: sahemInvestAmount,
        reservedAmount: reservedAmount,
        uniqueInvestorCount: investorGroups.size,
        totalInvestmentCount: distributionRequest.project.investments.length,
        distributionType: distributionRequest.distributionType,
        isLoss: finalIsLoss,
        estimatedGainPercent: finalEstimatedGainPercent,
        estimatedClosingPercent: finalEstimatedClosingPercent
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
