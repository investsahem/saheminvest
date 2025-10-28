// Comprehensive type definitions for profit distribution system

export interface HistoricalPartialSummary {
  totalPartialDistributions: number
  totalPartialProfit: number
  totalPartialCapital: number
  distributionDates: string[]
  distributionCount: number
}

export interface InvestorDistributionDetail {
  investorId: string
  investorName: string
  investorEmail: string
  totalInvestment: number
  investmentRatio: number
  partialCapitalReceived: number
  partialProfitReceived: number
  partialDistributionCount: number
  finalCapital: number
  finalProfit: number
  finalTotal: number
}

export interface ProfitabilityAnalysis {
  isProfitable: boolean
  profitOrLossAmount: number
  profitOrLossPercentage: number
  reason: string
  details: {
    originalInvestment: number
    totalDistributed: number
    commissionsPaid: number
    investorRecovery: number
  }
  message: string
}

export interface DistributionBreakdown {
  sahemAmount: number
  reserveAmount: number
  investorsProfit: number
  investorsCapital: number
  totalToInvestors: number
  isLoss: boolean
  isFinal: boolean
}

export interface InvestorHistoricalData {
  investorId: string
  investorName: string
  investorEmail: string
  totalInvestment: number
  partialDistributions: {
    count: number
    totalProfit: number
    totalCapital: number
    dates: string[]
  }
}

export interface CustomInvestorAmount {
  investorId: string
  finalCapital: number
  finalProfit: number
  partialCapitalHistory?: number
  partialProfitHistory?: number
}

export interface DistributionHistoryItem {
  id: string
  date: string
  amount: number
  type: 'PARTIAL' | 'FINAL'
  profitAmount: number
  capitalAmount: number
  investorCount: number
}

export interface PartnerDistributionDetails {
  requestId: string
  dealId: string
  dealTitle: string
  distributionType: 'PARTIAL' | 'FINAL'
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  totalAmount: number
  estimatedGainPercent: number
  requestedAt: string
  historicalSummary: {
    partialDistributionCount: number
    totalPartialAmount: number
    distributionDates: string[]
  }
  commissionBreakdown: {
    sahemInvestAmount: number
    reservedAmount: number
    investorPool: number
    totalProfit: number
  }
  profitabilityStatus: {
    isProfitable: boolean
    statusMessage: string
    profitOrLossAmount: number
  }
}

