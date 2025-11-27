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

  // Ensure numeric values are safe
  const safeTotalInvestment = Number(totalInvestmentAmount) || 0
  const safeDistributionAmount = Number(investorDistributionAmount) || 0
  const safeCapitalReturn = Number(capitalReturnAmount) || 0

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
    const totalInvestment = investorInvestments.reduce((sum, inv) => sum + Number(inv.amount || 0), 0)
    const investmentRatio = safeTotalInvestment > 0 ? totalInvestment / safeTotalInvestment : 0

    const historical = historicalData.find(h => h.investorId === investorId)
    // IMPORTANT: Partial distributions are CAPITAL RECOVERY, not profit
    const partialProfitReceived = Number(historical?.partialDistributions.totalProfit) || 0  // Should always be 0 for partials
    const partialCapitalReceived = Number(historical?.partialDistributions.totalCapital) || 0  // Actual capital recovered

    // Calculate final distribution amounts
    // IMPORTANT: capitalReturnAmount is ALREADY the remaining capital after partials
    // So we distribute it proportionally WITHOUT subtracting partials again
    const finalProfit = safeDistributionAmount * investmentRatio  // Investor's share of profit
    const finalCapital = safeCapitalReturn * investmentRatio  // Investor's share of remaining capital

    results.push({
      investorId,
      investorName: investorInvestments[0].investorName || 'Unknown',
      investorEmail: investorInvestments[0].investorEmail || '',
      totalInvestment,
      investmentRatio,
      partialCapitalReceived,
      partialProfitReceived,
      partialDistributionCount: Number(historical?.partialDistributions.count) || 0,
      finalCapital,
      finalProfit,
      finalTotal: finalCapital + finalProfit
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
  // Ensure all inputs are valid numbers
  const safeOriginalInvestment = Number(originalInvestment) || 0
  const safeTotalAmount = Number(totalAmount) || 0
  const safeEstimatedProfit = Number(estimatedProfit) || 0
  const safeEstimatedCapitalReturn = Number(estimatedCapitalReturn) || 0
  const safeSahemPercent = Number(sahemPercent) || 0
  const safeReservePercent = Number(reservePercent) || 0

  if (isLoss || safeEstimatedProfit < 0) {
    // Loss scenario
    const lossAmount = safeOriginalInvestment - safeTotalAmount
    const lossPercentage = safeOriginalInvestment > 0 ? (lossAmount / safeOriginalInvestment) * 100 : 0
    const investorRecovery = safeTotalAmount

    return {
      isProfitable: false,
      profitOrLossAmount: -lossAmount,
      profitOrLossPercentage: -lossPercentage,
      reason: 'الصفقة لم تحقق أرباحاً كافية لاسترداد رأس المال بالكامل',
      details: {
        originalInvestment: safeOriginalInvestment,
        totalDistributed: safeTotalAmount,
        commissionsPaid: 0, // No commissions in loss
        investorRecovery
      },
      message: `تم فقدان ${lossAmount.toFixed(2)} دولار (${lossPercentage.toFixed(2)}%) من رأس المال. سيتم إرجاع ${investorRecovery.toFixed(2)} دولار للمستثمرين بدون أي عمولات.`
    }
  } else {
    // Profit scenario
    const sahemAmount = (safeEstimatedProfit * safeSahemPercent) / 100
    const reserveAmount = (safeEstimatedProfit * safeReservePercent) / 100
    const commissionsPaid = sahemAmount + reserveAmount
    const investorProfit = safeEstimatedProfit - commissionsPaid
    const profitPercentage = safeOriginalInvestment > 0 ? (safeEstimatedProfit / safeOriginalInvestment) * 100 : 0

    return {
      isProfitable: true,
      profitOrLossAmount: safeEstimatedProfit,
      profitOrLossPercentage: profitPercentage,
      reason: 'الصفقة حققت أرباحاً وسيتم إرجاع رأس المال بالكامل مع الأرباح',
      details: {
        originalInvestment: safeOriginalInvestment,
        totalDistributed: safeTotalAmount,
        commissionsPaid,
        investorRecovery: safeEstimatedCapitalReturn + investorProfit
      },
      message: `تم تحقيق ربح قدره ${safeEstimatedProfit.toFixed(2)} دولار (${profitPercentage.toFixed(2)}%). سيحصل المستثمرون على ${safeEstimatedCapitalReturn.toFixed(2)} دولار رأس مال و ${investorProfit.toFixed(2)} دولار أرباح.`
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
  // Ensure all inputs are valid numbers
  const safeProfit = Number(estimatedProfit) || 0
  const safeCapital = Number(estimatedReturnCapital) || 0
  const safeSahemPercent = Number(sahemPercent) || 0
  const safeReservePercent = Number(reservePercent) || 0

  let sahemAmount = 0
  let reserveAmount = 0
  let investorsProfit = 0
  let investorsCapital = safeCapital

  if (isFinal && isLoss) {
    // Loss scenario: No commissions, all remaining goes to investors
    sahemAmount = 0
    reserveAmount = 0
    investorsProfit = 0
    investorsCapital = safeCapital // All remaining amount for capital recovery
  } else {
    // Profit scenario (or partial): Normal distribution with commissions
    sahemAmount = (safeProfit * safeSahemPercent) / 100
    reserveAmount = (safeProfit * safeReservePercent) / 100
    investorsProfit = safeProfit - sahemAmount - reserveAmount
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
  const safeAmount = Number(amount) || 0
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(safeAmount)
}

/**
 * Format date
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

