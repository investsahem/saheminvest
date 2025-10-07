// Utility functions for investor calculations
export interface Investment {
  investorId: string
  amount?: number | any // Allow Prisma Decimal type
  investor?: {
    id: string
    name?: string
    email?: string
  }
}

export interface Deal {
  id: string
  investments?: Investment[]
  _count?: {
    investments: number
  }
}

/**
 * Calculate unique investor count from investments array
 * @param investments Array of investments with investorId
 * @returns Number of unique investors
 */
export function calculateUniqueInvestors(investments: any[] = []): number {
  const uniqueInvestorIds = new Set(
    investments
      .filter(inv => inv.investorId) // Filter out any items without investorId
      .map(inv => inv.investorId)
  )
  return uniqueInvestorIds.size
}

/**
 * Get unique investor IDs from investments array
 * @param investments Array of investments with investorId
 * @returns Array of unique investor IDs
 */
export function getUniqueInvestorIds(investments: any[] = []): string[] {
  const uniqueInvestorIds = new Set(
    investments
      .filter(inv => inv.investorId)
      .map(inv => inv.investorId)
  )
  return Array.from(uniqueInvestorIds)
}

/**
 * Add unique investor count to deal object
 * @param deal Deal object with investments
 * @returns Deal object with uniqueInvestorCount property
 */
export function addUniqueInvestorCount<T extends Deal>(deal: T): T & { uniqueInvestorCount: number } {
  return {
    ...deal,
    uniqueInvestorCount: calculateUniqueInvestors(deal.investments)
  }
}

/**
 * Add unique investor counts to array of deals
 * @param deals Array of deal objects
 * @returns Array of deals with uniqueInvestorCount property
 */
export function addUniqueInvestorCounts<T extends Deal>(deals: T[]): (T & { uniqueInvestorCount: number })[] {
  return deals.map(deal => addUniqueInvestorCount(deal))
}

/**
 * Calculate total unique investors across multiple deals
 * @param deals Array of deals with investments
 * @returns Total number of unique investors across all deals
 */
export function calculateTotalUniqueInvestors(deals: Deal[]): number {
  const allInvestorIds = new Set<string>()
  
  deals.forEach(deal => {
    if (deal.investments) {
      deal.investments.forEach(investment => {
        if (investment.investorId) {
          allInvestorIds.add(investment.investorId)
        }
      })
    }
  })
  
  return allInvestorIds.size
}

/**
 * Debug function to log investor counting information
 * @param dealId Deal ID for logging
 * @param investments Array of investments
 * @param context Context string for logging
 */
export function debugInvestorCount(dealId: string, investments: any[] = [], context: string = ''): void {
  const uniqueInvestorIds = getUniqueInvestorIds(investments)
  const totalInvestments = investments.length
  const uniqueInvestorCount = uniqueInvestorIds.length
  
  console.log(`🔍 Investor Count Debug [${context}]:`, {
    dealId,
    totalInvestments,
    uniqueInvestorIds,
    uniqueInvestorCount,
    investmentsByInvestor: investments.reduce((acc, inv) => {
      if (inv.investorId) {
        acc[inv.investorId] = (acc[inv.investorId] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)
  })
}
