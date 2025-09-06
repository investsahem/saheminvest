import { Deal, DealsAPIParams, DealsAPIResponse } from '../types/deals'

export class DealsService {
  private static instance: DealsService
  
  public static getInstance(): DealsService {
    if (!DealsService.instance) {
      DealsService.instance = new DealsService()
    }
    return DealsService.instance
  }

  /**
   * Fetch deals with unified parameters
   */
  async fetchDeals(params: DealsAPIParams = {}): Promise<DealsAPIResponse> {
    try {
      const searchParams = new URLSearchParams()
      
      if (params.page) searchParams.append('page', params.page.toString())
      if (params.limit) searchParams.append('limit', params.limit.toString())
      if (params.status) searchParams.append('status', params.status)
      if (params.category) searchParams.append('category', params.category)
      if (params.featured !== undefined) searchParams.append('featured', params.featured.toString())
      if (params.search) searchParams.append('search', params.search)
      if (params.includeAll) searchParams.append('includeAll', 'true')
      if (params.partner) searchParams.append('partner', 'true')

      const response = await fetch(`/api/deals?${searchParams}`, {
        credentials: 'include',
        cache: 'no-store'
      })

      if (!response.ok) {
        // Try to get detailed error information from the response
        let errorDetails = `HTTP error! status: ${response.status}`
        try {
          const errorData = await response.json()
          if (errorData.details) {
            errorDetails += ` - ${errorData.details}`
          }
          if (errorData.error) {
            errorDetails += ` - ${errorData.error}`
          }
          console.error('Detailed API error:', errorData)
        } catch (e) {
          // If response is not JSON, just use the status
        }
        throw new Error(errorDetails)
      }

      const data = await response.json()
      return {
        deals: data.deals || [],
        total: data.total || 0,
        totalPages: data.totalPages || 0,
        currentPage: data.currentPage || 1
      }
    } catch (error) {
      console.error('Error fetching deals:', error)
      return {
        deals: [],
        total: 0,
        totalPages: 0,
        currentPage: 1
      }
    }
  }

  /**
   * Fetch a single deal by ID
   */
  async fetchDealById(id: string): Promise<Deal | null> {
    try {
      const response = await fetch(`/api/deals/${id}`, {
        credentials: 'include',
        cache: 'no-store'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.deal || null
    } catch (error) {
      console.error('Error fetching deal:', error)
      return null
    }
  }

  /**
   * Update deal status
   */
  async updateDealStatus(id: string, status: string, reason?: string): Promise<boolean> {
    try {
      const formData = new FormData()
      formData.append('status', status)
      if (reason) {
        formData.append('statusReason', reason)
      }
      
      const response = await fetch(`/api/deals/${id}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include'
      })

      return response.ok
    } catch (error) {
      console.error('Error updating deal status:', error)
      return false
    }
  }

  /**
   * Update deal dates
   */
  async updateDealDates(id: string, startDate: string, endDate: string): Promise<boolean> {
    try {
      const formData = new FormData()
      formData.append('startDate', startDate)
      formData.append('endDate', endDate)
      
      const response = await fetch(`/api/deals/${id}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include'
      })

      return response.ok
    } catch (error) {
      console.error('Error updating deal dates:', error)
      return false
    }
  }

  /**
   * Create a new deal
   */
  async createDeal(formData: FormData): Promise<boolean> {
    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      return response.ok
    } catch (error) {
      console.error('Error creating deal:', error)
      return false
    }
  }

  /**
   * Update an existing deal
   */
  async updateDeal(id: string, formData: FormData): Promise<boolean> {
    try {
      const response = await fetch(`/api/deals/${id}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include'
      })

      return response.ok
    } catch (error) {
      console.error('Error updating deal:', error)
      return false
    }
  }

  /**
   * Delete a deal
   */
  async deleteDeal(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/deals/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      return response.ok
    } catch (error) {
      console.error('Error deleting deal:', error)
      return false
    }
  }

  /**
   * Toggle deal featured status
   */
  async toggleFeatured(id: string, featured: boolean): Promise<boolean> {
    try {
      const formData = new FormData()
      formData.append('featured', featured.toString())
      
      const response = await fetch(`/api/deals/${id}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include'
      })

      return response.ok
    } catch (error) {
      console.error('Error toggling featured status:', error)
      return false
    }
  }

  /**
   * Filter deals by search term (client-side filtering)
   */
  filterDeals(deals: Deal[], searchTerm: string): Deal[] {
    if (!searchTerm) return deals
    
    const term = searchTerm.toLowerCase()
    return deals.filter(deal =>
      deal.title.toLowerCase().includes(term) ||
      deal.description.toLowerCase().includes(term) ||
      deal.category.toLowerCase().includes(term) ||
      deal.owner.name.toLowerCase().includes(term) ||
      (deal.partner?.companyName && deal.partner.companyName.toLowerCase().includes(term))
    )
  }

  /**
   * Get deal statistics
   */
  getDealStats(deals: Deal[]) {
    return {
      total: deals.length,
      draft: deals.filter(d => d.status === 'DRAFT').length,
      pending: deals.filter(d => d.status === 'PENDING').length,
      active: deals.filter(d => d.status === 'ACTIVE').length,
      paused: deals.filter(d => d.status === 'PAUSED').length,
      funded: deals.filter(d => d.status === 'FUNDED').length,
      completed: deals.filter(d => d.status === 'COMPLETED').length,
      cancelled: deals.filter(d => d.status === 'CANCELLED').length,
      rejected: deals.filter(d => d.status === 'REJECTED').length,
      totalFunding: deals.reduce((sum, deal) => sum + parseFloat(deal.currentFunding.toString()), 0),
      totalGoal: deals.reduce((sum, deal) => sum + parseFloat(deal.fundingGoal.toString()), 0),
      published: deals.filter(d => d.status === 'PUBLISHED').length
    }
  }

  /**
   * Format currency consistently across all portals
   */
  formatCurrency(amount: number, locale: string = 'en'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  /**
   * Format date consistently across all portals
   */
  formatDate(dateString: string, locale: string = 'en'): string {
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(dateString))
  }
}

// Export singleton instance
export const dealsService = DealsService.getInstance()

