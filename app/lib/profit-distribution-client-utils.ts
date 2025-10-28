// CLIENT-SIDE utility functions for profit distribution
// These functions do NOT use Prisma and can be imported in client components

import type {
  InvestorDistributionDetail,
  ProfitabilityAnalysis,
  InvestorHistoricalData,
  CustomInvestorAmount,
  DistributionBreakdown
} from '../types/profit-distribution'

/**
 * Calculate investor distributions based on investment ratios
 */
export function calculateInvestorDistributions(
  investments: Array<{ investorId: string; investorName: string; investorEmail: string; amount: number }>,
  totalInvestmentAmount: number,
  investorDistributionAmount: number,
  capitalReturnAmount: number,
  historicalData: InvestorHistoricalData[]
): InvestorDistributionDetail[] {
  const results: InvestorDistributionDetail[] = []

  // Group investments by investor
  const investorGroups = new Map<string, typeof investments>()
  for (const investment of investments) {
    if (!investorGroups.has(investment.investorId)) {
      investorGroups.set(investment.investorId, [])
    }
    investorGroups.get(investment.investorId)!.push(investment)
  }

  // Calculate for each investor
  for (const [investorId, investorInvestments] of investorGroups) {
    const totalInvestment = investorInvestments.reduce((sum, inv) => sum + inv.amount, 0)
    const investmentRatio = totalInvestment / totalInvestmentAmount

    const historical = historicalData.find(h => h.investorId === investorId)

    results.push({
      investorId,
      investorName: investorInvestments[0].investorName,
      investorEmail: investorInvestments[0].investorEmail,
      totalInvestment,
      investmentRatio,
      partialCapitalReceived: historical?.partialDistributions.totalCapital || 0,
      partialProfitReceived: historical?.partialDistributions.totalProfit || 0,
      partialDistributionCount: historical?.partialDistributions.count || 0,
      finalCapital: capitalReturnAmount * investmentRatio,
      finalProfit: investorDistributionAmount * investmentRatio,
      finalTotal: (capitalReturnAmount + investorDistributionAmount) * investmentRatio
    })
  }

  return results.sort((a, b) => b.totalInvestment - a.totalInvestment)
}

/**
 * Validate that custom investor amounts match the expected totals
 */
export function validateInvestorAmounts(
  customAmounts: CustomInvestorAmount[],
  expectedTotalProfit: number,
  expectedTotalCapital: number,
  tolerance: number = 0.01
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  const totalCustomProfit = customAmounts.reduce((sum, amt) => sum + amt.finalProfit, 0)
  const totalCustomCapital = customAmounts.reduce((sum, amt) => sum + amt.finalCapital, 0)

  if (Math.abs(totalCustomProfit - expectedTotalProfit) > tolerance) {
    errors.push(
      `Total profit mismatch: Expected ${expectedTotalProfit.toFixed(2)}, got ${totalCustomProfit.toFixed(2)}`
    )
  }

  if (Math.abs(totalCustomCapital - expectedTotalCapital) > tolerance) {
    errors.push(
      `Total capital mismatch: Expected ${expectedTotalCapital.toFixed(2)}, got ${totalCustomCapital.toFixed(2)}`
    )
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Analyze profitability of a deal
 */
export function analyzeProfitability(
  originalInvestment: number,
  totalAmount: number,
  estimatedProfit: number,
  estimatedCapitalReturn: number,
  sahemPercent: number,
  reservePercent: number,
  isLoss: boolean
): ProfitabilityAnalysis {
  if (isLoss || estimatedProfit < 0) {
    // Loss scenario
    const lossAmount = originalInvestment - totalAmount
    const lossPercentage = (lossAmount / originalInvestment) * 100
    const investorRecovery = totalAmount

    return {
      isProfitable: false,
      profitOrLossAmount: -lossAmount,
      profitOrLossPercentage: -lossPercentage,
      reason: 'الصفقة لم تحقق أرباحاً كافية لاسترداد رأس المال بالكامل',
      details: {
        originalInvestment,
        totalDistributed: totalAmount,
        commissionsPaid: 0, // No commissions in loss
        investorRecovery
      },
      message: `تم فقدان ${lossAmount.toFixed(2)} دولار (${lossPercentage.toFixed(2)}%) من رأس المال. سيتم إرجاع ${investorRecovery.toFixed(2)} دولار للمستثمرين بدون أي عمولات.`
    }
  } else {
    // Profit scenario
    const sahemAmount = (estimatedProfit * sahemPercent) / 100
    const reserveAmount = (estimatedProfit * reservePercent) / 100
    const commissionsPaid = sahemAmount + reserveAmount
    const investorProfit = estimatedProfit - commissionsPaid
    const profitPercentage = (estimatedProfit / originalInvestment) * 100

    return {
      isProfitable: true,
      profitOrLossAmount: estimatedProfit,
      profitOrLossPercentage: profitPercentage,
      reason: 'الصفقة حققت أرباحاً وسيتم إرجاع رأس المال بالكامل مع الأرباح',
      details: {
        originalInvestment,
        totalDistributed: totalAmount,
        commissionsPaid,
        investorRecovery: estimatedCapitalReturn + investorProfit
      },
      message: `تم تحقيق ربح قدره ${estimatedProfit.toFixed(2)} دولار (${profitPercentage.toFixed(2)}%). سيحصل المستثمرون على ${estimatedCapitalReturn.toFixed(2)} دولار رأس مال و ${investorProfit.toFixed(2)} دولار أرباح.`
    }
  }
}

/**
 * Calculate distribution breakdown
 */
export function calculateDistribution(
  estimatedProfit: number,
  estimatedReturnCapital: number,
  sahemPercent: number,
  reservePercent: number,
  isLoss: boolean,
  isFinal: boolean
): DistributionBreakdown {
  let sahemAmount = 0
  let reserveAmount = 0
  let investorsProfit = 0
  let investorsCapital = estimatedReturnCapital

  if (isFinal && isLoss) {
    // Loss scenario: No commissions, all remaining goes to investors
    sahemAmount = 0
    reserveAmount = 0
    investorsProfit = 0
    investorsCapital = estimatedReturnCapital // All remaining amount for capital recovery
  } else {
    // Profit scenario (or partial): Normal distribution with commissions
    sahemAmount = (estimatedProfit * sahemPercent) / 100
    reserveAmount = (estimatedProfit * reservePercent) / 100
    investorsProfit = estimatedProfit - sahemAmount - reserveAmount
  }

  const totalToInvestors = investorsCapital + investorsProfit

  return {
    sahemAmount,
    reserveAmount,
    investorsProfit,
    investorsCapital,
    totalToInvestors,
    isLoss,
    isFinal
  }
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Format date
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

