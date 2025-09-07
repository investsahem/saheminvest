// Unified Deal interface for all portals
export interface Deal {
  id: string
  title: string
  description: string
  category: string
  location?: string
  fundingGoal: number
  currentFunding: number
  minInvestment: number
  expectedReturn: number
  duration: number
  riskLevel?: string
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'ACTIVE' | 'PAUSED' | 'FUNDED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED'
  startDate?: string
  endDate?: string
  publishedAt?: string
  thumbnailImage?: string
  images: string[]
  highlights: string[]
  tags: string[]
  featured: boolean
  slug?: string
  timeline?: any[]
  owner: {
    id: string
    name: string
    email: string
    image?: string
  }
  partner?: {
    id: string
    companyName: string
    logo?: string
  }
  investments: Array<{
    id: string
    amount: number
    investor: {
      id: string
      name: string
    }
  }>
  profitDistributions?: Array<{
    id: string
    amount: number
    profitRate: number
    distributionDate: string
    status: string
    profitPeriod: string
  }>
  _count: {
    investments: number
  }
  investorCount?: number // Backward compatibility
  createdAt: string
  updatedAt: string
}

// Unified API parameters interface
export interface DealsAPIParams {
  page?: number
  limit?: number
  status?: string
  category?: string
  featured?: boolean
  search?: string
  includeAll?: boolean
  partner?: boolean
}

// Unified API response interface
export interface DealsAPIResponse {
  deals: Deal[]
  total: number
  totalPages: number
  currentPage: number
}

