import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { PrismaClient } from '@prisma/client'
import EmailTriggers from '../../../../../lib/email-triggers'

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
      // New: actual amounts for reserve and commission
      reservedAmount,
      sahemInvestAmount,
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
    let finalSahemInvestAmount: number
    let finalReservedAmount: number
    let investorDistributionAmount: number
    let capitalReturnAmount: number
    const isPartialDistribution = distributionRequest.distributionType === 'PARTIAL'

    if (isPartialDistribution) {
      // PARTIAL DISTRIBUTION: All amounts go to CAPITAL RECOVERY, no profit yet!
      // Business Logic: Investors must recover 100% of their capital first, then profit starts
      finalReservedAmount = reservedAmount ?? Number(distributionRequest.reservedAmount ?? 0)
      finalSahemInvestAmount = sahemInvestAmount ?? Number(distributionRequest.sahemInvestAmount ?? 0)

      // Calculate percentages from amounts (for storage)
      finalReservedPercent = finalTotalAmount > 0 ? (finalReservedAmount / finalTotalAmount) * 100 : 0
      finalSahemPercent = finalTotalAmount > 0 ? (finalSahemInvestAmount / finalTotalAmount) * 100 : 0

      // Total amount to investors after commissions
      const netToInvestors = finalTotalAmount - finalReservedAmount - finalSahemInvestAmount

      // IMPORTANT: In partial distributions, ALL net amount is for capital recovery
      // NO profit is distributed until final distribution
      investorDistributionAmount = 0  // No profit in partials
      capitalReturnAmount = netToInvestors  // All goes to capital recovery

      console.log(`Processing PARTIAL scenario: Total ${finalTotalAmount}, Reserved ${finalReservedAmount}, Sahem ${finalSahemInvestAmount}`)
      console.log(`  -> Net to investors: ${netToInvestors} - ALL goes to capital recovery (no profit yet)`)
    } else if (isFinalDistribution && finalIsLoss) {
      // FINAL LOSS SCENARIO: No commissions, all remaining amount goes to investors
      finalSahemPercent = 0
      finalReservedPercent = 0
      finalSahemInvestAmount = 0
      finalReservedAmount = 0
      investorDistributionAmount = 0 // No profit
      capitalReturnAmount = finalTotalAmount // All remaining funds for capital recovery

      console.log(`Processing FINAL LOSS scenario: Total remaining ${finalTotalAmount} goes to investors for capital recovery`)
    } else {
      // FINAL PROFIT SCENARIO: Only Sahem commission applied to PROFIT (NO reserve in final)
      finalSahemPercent = sahemInvestPercent ?? Number(distributionRequest.sahemInvestPercent)
      finalReservedPercent = 0  // NO reserve in final distributions
      finalSahemInvestAmount = (finalEstimatedProfit * finalSahemPercent) / 100
      finalReservedAmount = 0  // NO reserve in final distributions
      investorDistributionAmount = finalEstimatedProfit - finalSahemInvestAmount  // Only Sahem commission deducted
      capitalReturnAmount = finalEstimatedReturnCapital

      console.log(`Processing FINAL PROFIT scenario: Profit ${finalEstimatedProfit}, Sahem ${finalSahemInvestAmount}, Investors Profit ${investorDistributionAmount}, Capital ${capitalReturnAmount}`)
      console.log(`  -> NO RESERVE in final distribution (reserve only in partials)`)
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
      // IMPORTANT: For FINAL distributions, custom amounts from frontend already have
      // partial distributions subtracted (see calculateInvestorDistributions in profit-distribution-client-utils.ts)
      let investorProfitShare: number
      let investorCapitalReturn: number

      if (customAmountsMap.has(investorId)) {
        const customAmounts = customAmountsMap.get(investorId)!
        investorProfitShare = customAmounts.finalProfit
        investorCapitalReturn = customAmounts.finalCapital
        console.log(`Using custom amounts for investor ${investorId}: profit=${investorProfitShare}, capital=${investorCapitalReturn}`)
      } else {
        // Fallback: Calculate from ratio (used only if frontend doesn't send custom amounts)
        // Note: This doesn't account for partial distributions - frontend should always send custom amounts for FINAL
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
            capitalAmount: investorCapitalReturn,  // Track capital returned
            profitAmount: -lossAmount,  // Negative profit (loss)
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
            capitalAmount: investorCapitalReturn,  // Track capital returned in final
            profitAmount: investorProfitShare,  // Track profit amount
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
        // PARTIAL DISTRIBUTION - ONLY capital return, NO profit
        // Business Logic: Capital recovery first, profit comes in final distribution

        // Capital return transaction only
        if (investorCapitalReturn > 0) {
          transactionOperations.push({
            userId: investorId,
            type: 'RETURN',
            amount: investorCapitalReturn,
            status: 'COMPLETED',
            description: `Partial capital return from ${distributionRequest.project.title}`,
            investmentId: firstInvestment.id
          })
        }

        // Wallet update - add capital to wallet, NO change to totalReturns (no profit)
        walletUpdateOperations.push({
          where: { id: investorId },
          data: {
            walletBalance: currentWalletBalance + investorCapitalReturn,
            totalReturns: currentTotalReturns  // No profit in partial distributions
          }
        })

        // Profit distribution record - record this as capital recovery with capital amount
        profitDistributionOperations.push({
          projectId: distributionRequest.projectId,
          investorId: investorId,
          investmentId: firstInvestment.id,
          amount: 0,  // No profit in partial distributions
          capitalAmount: investorCapitalReturn,  // Track capital returned
          profitAmount: 0,  // No profit in partial distributions
          profitRate: 0,  // No profit yet
          investmentShare: investmentRatio * 100,
          distributionDate: new Date(),
          status: 'COMPLETED',
          profitPeriod: 'PARTIAL'
        })

        // Investor notification - capital recovery only
        notificationOperations.push({
          userId: investorId,
          type: 'CAPITAL_RETURN',
          title: 'تم استرداد جزء من رأس المال',
          message: `تم إرجاع ${investorCapitalReturn.toFixed(2)} دولار من رأس المال المستثمر في الصفقة "${distributionRequest.project.title}" إلى محفظتك. هذا جزء من استرداد رأس المال الخاص بك.`,
          metadata: JSON.stringify({
            dealId: distributionRequest.projectId,
            profitAmount: 0,  // No profit in partials
            capitalAmount: investorCapitalReturn,
            totalAmount: investorCapitalReturn,
            profitRate: 0,
            distributionType: distributionRequest.distributionType,
            isCapitalRecovery: true
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
          // Store actual amounts
          reservedAmount: finalReservedAmount,
          sahemInvestAmount: finalSahemInvestAmount,
          // Store custom investor amounts if provided
          investorCustomAmounts: investorDistributions ? investorDistributions : undefined
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
      let partnerNotificationMessage: string
      if (finalIsLoss && isFinalDistribution) {
        partnerNotificationMessage = `تم الموافقة على طلب التوزيع النهائي للصفقة "${distributionRequest.project.title}". الصفقة أظهرت خسارة، وتم توزيع ${capitalReturnAmount.toFixed(2)} دولار على المستثمرين لاسترداد رأس المال (بدون عمولات).`
      } else if (isPartialDistribution) {
        partnerNotificationMessage = `تم الموافقة على التوزيع الجزئي للصفقة "${distributionRequest.project.title}". تم توزيع ${investorDistributionAmount.toFixed(2)} دولار على المستثمرين، بعد خصم ${finalReservedAmount.toFixed(2)} دولار احتياطي و ${finalSahemInvestAmount.toFixed(2)} دولار عمولة.`
      } else {
        partnerNotificationMessage = `تم الموافقة على طلب التوزيع النهائي للصفقة "${distributionRequest.project.title}" وتم توزيع ${investorDistributionAmount.toFixed(2)} دولار كأرباح و ${capitalReturnAmount.toFixed(2)} دولار كرأس مال على المستثمرين من إجمالي ${totalProfit.toFixed(2)} دولار.`
      }

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
            sahemAmount: finalSahemInvestAmount,
            reservedAmount: finalReservedAmount,
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

      // 7. Mark project as COMPLETED after FINAL distribution
      if (isFinalDistribution) {
        await tx.project.update({
          where: { id: distributionRequest.projectId },
          data: { status: 'COMPLETED' }
        })
        console.log(`Project ${distributionRequest.projectId} marked as COMPLETED after FINAL distribution`)
      }
    }, {
      timeout: 30000 // 30 second timeout
    })

    // Send admin email notification for profit distribution
    try {
      await EmailTriggers.notifyAdminProfitDistribution({
        dealTitle: distributionRequest.project.title,
        totalAmount: finalTotalAmount,
        distributionType: distributionRequest.distributionType,
        investorCount: investorGroups.size,
        approvedBy: session.user.name || session.user.email || 'Admin'
      })
    } catch (notificationError) {
      console.error('Failed to send admin profit distribution notification:', notificationError)
    }

    return NextResponse.json({
      success: true,
      message: finalIsLoss && isFinalDistribution
        ? 'Loss distribution approved and processed successfully'
        : isPartialDistribution
          ? 'Partial distribution approved and processed successfully'
          : 'Profit distribution approved and processed successfully',
      summary: {
        totalProfit: totalProfit,
        totalAmount: finalTotalAmount,
        investorDistribution: investorDistributionAmount,
        capitalReturn: capitalReturnAmount,
        sahemInvestAmount: finalSahemInvestAmount,
        reservedAmount: finalReservedAmount,
        sahemInvestPercent: finalSahemPercent,
        reservedGainPercent: finalReservedPercent,
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

