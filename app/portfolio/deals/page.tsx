'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslation, useI18n } from '../../components/providers/I18nProvider'
import InvestorLayout from '../../components/layout/InvestorLayout'
import { DealCard } from '../../components/project/DealCard'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Deal } from '../../types/deals'
import { dealsService } from '../../lib/deals-service'
import { 
  Search, Filter, Grid, List, TrendingUp, Star, Eye, Heart,
  Clock, CheckCircle, AlertCircle, RefreshCw, BarChart3, Target,
  DollarSign, Users, Calendar, Zap, Award, Sparkles, Activity,
  ChevronDown, SlidersHorizontal, ArrowUpRight, Bookmark
} from 'lucide-react'

const PortfolioDealsPage = () => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()
  
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [riskFilter, setRiskFilter] = useState<string>('all')
  const [returnFilter, setReturnFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<string>('featured')
  const [showFilters, setShowFilters] = useState(false)
  const [savedDeals, setSavedDeals] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [allInvestableDeals, setAllInvestableDeals] = useState<Deal[]>([])

  // Fetch deals for investors - only show deals they can invest in
  const fetchDeals = async () => {
    try {
      setLoading(true)
      
      const params = {
        page: currentPage,
        limit: 50, // Get more to filter client-side
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        search: searchTerm || undefined,
        includeAll: false // Investor view
      }

      const response = await dealsService.fetchDeals(params)
      
      // Filter out deals that investors shouldn't see
      let filteredDeals = response.deals.filter(deal => {
        // Only show deals that investors can actually invest in
        // Exclude: FUNDED, COMPLETED, CANCELLED, REJECTED, DRAFT, PENDING
        const investableStatuses = ['ACTIVE', 'PUBLISHED']
        return investableStatuses.includes(deal.status)
      })

      // Apply client-side filters
      if (riskFilter !== 'all') {
        filteredDeals = filteredDeals.filter(deal => deal.riskLevel === riskFilter)
      }

      if (returnFilter !== 'all') {
        const minReturn = parseInt(returnFilter)
        filteredDeals = filteredDeals.filter(deal => deal.expectedReturn >= minReturn)
      }

      // Apply sorting
      filteredDeals = sortDeals(filteredDeals, sortBy)

      // Store all investable deals for stats calculation
      setAllInvestableDeals(filteredDeals)
      
      // Apply pagination client-side since we're filtering
      const startIndex = (currentPage - 1) * 12
      const endIndex = startIndex + 12
      const paginatedDeals = filteredDeals.slice(startIndex, endIndex)
      
      setDeals(paginatedDeals)
      setTotalPages(Math.ceil(filteredDeals.length / 12))
    } catch (error) {
      console.error('Error fetching deals:', error)
      setDeals([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const sortDeals = (deals: Deal[], sortBy: string) => {
    switch (sortBy) {
      case 'featured':
        return deals.sort((a, b) => Number(b.featured) - Number(a.featured))
      case 'newest':
        return deals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case 'ending_soon':
        return deals.sort((a, b) => {
          const aEnd = a.endDate ? new Date(a.endDate).getTime() : Infinity
          const bEnd = b.endDate ? new Date(b.endDate).getTime() : Infinity
          return aEnd - bEnd
        })
      case 'highest_return':
        return deals.sort((a, b) => b.expectedReturn - a.expectedReturn)
      case 'lowest_minimum':
        return deals.sort((a, b) => a.minInvestment - b.minInvestment)
      case 'most_funded':
        return deals.sort((a, b) => {
          const aProgress = (a.currentFunding / a.fundingGoal) * 100
          const bProgress = (b.currentFunding / b.fundingGoal) * 100
          return bProgress - aProgress
        })
      default:
        return deals
    }
  }

  useEffect(() => {
    fetchDeals()
  }, [currentPage, categoryFilter, searchTerm])

  useEffect(() => {
    // Re-sort and filter when filters change
    if (deals.length > 0) {
      const filtered = deals.filter(deal => {
        if (riskFilter !== 'all' && deal.riskLevel !== riskFilter) return false
        if (returnFilter !== 'all' && deal.expectedReturn < parseInt(returnFilter)) return false
        return true
      })
      setDeals(sortDeals(filtered, sortBy))
    }
  }, [riskFilter, returnFilter, sortBy])

  // Toggle saved deals
  const toggleSavedDeal = (dealId: string) => {
    setSavedDeals(prev => 
      prev.includes(dealId) 
        ? prev.filter(id => id !== dealId)
        : [...prev, dealId]
    )
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Get deal stats from all investable deals (not just paginated)
  const totalFunding = allInvestableDeals.reduce((sum, deal) => sum + deal.currentFunding, 0)
  const avgReturn = allInvestableDeals.length > 0 ? allInvestableDeals.reduce((sum, deal) => sum + deal.expectedReturn, 0) / allInvestableDeals.length : 0
  const totalInvestors = allInvestableDeals.reduce((sum, deal) => sum + (deal._count?.investments || 0), 0)

  const categories = [
    'Technology', 'Real Estate', 'Healthcare', 'Energy', 
    'Agriculture', 'Manufacturing', 'Finance', 'Education',
    'Transportation', 'Entertainment', 'Food & Beverage'
  ]

  return (
    <InvestorLayout
      title={locale === 'ar' ? 'فرص الاستثمار' : 'Investment Opportunities'}
      subtitle={locale === 'ar' ? 'اكتشف واستثمر في أفضل الصفقات المتاحة' : 'Discover and invest in the best available deals'}
    >
      <div className="space-y-8">
        {/* Modern Header with Stats */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold mb-2">Investment Marketplace</h1>
                <p className="text-blue-100 text-lg">
                  Explore vetted investment opportunities from trusted partners
                </p>
              </div>
              <div className="flex items-center gap-4 mt-4 lg:mt-0">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <span className="font-medium">{allInvestableDeals.filter(d => d.featured).length} Featured</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <Activity className="w-5 h-5 text-green-300" />
                  <span className="font-medium">{allInvestableDeals.length} Available</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-300" />
                  </div>
                  <div>
                    <p className="text-green-100 text-sm">Total Available</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalFunding)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm">Avg. Expected Return</p>
                    <p className="text-2xl font-bold">{avgReturn.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Users className="w-6 h-6 text-purple-300" />
                  </div>
                  <div>
                    <p className="text-purple-100 text-sm">Active Investors</p>
                    <p className="text-2xl font-bold">{totalInvestors.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Search and Filters */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className={`absolute ${locale === 'ar' ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400`} />
                  <input
                    type="text"
                    placeholder={locale === 'ar' ? 'البحث في الفرص الاستثمارية...' : 'Search investment opportunities...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full ${locale === 'ar' ? 'pr-12 pl-4 text-right font-arabic' : 'pl-12 pr-4'} py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors`}
                  />
                </div>
              </div>

              {/* Quick Filters */}
              <div className="flex items-center gap-3">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                >
                  <option value="featured">Featured First</option>
                  <option value="newest">Newest</option>
                  <option value="ending_soon">Ending Soon</option>
                  <option value="highest_return">Highest Return</option>
                  <option value="lowest_minimum">Lowest Minimum</option>
                  <option value="most_funded">Most Funded</option>
                </select>

                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-3 border-gray-200 hover:bg-gray-50"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </Button>

                <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'} transition-colors`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'} transition-colors`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                <Button
                  onClick={fetchDeals}
                  variant="outline"
                  className="px-4 py-3 border-gray-200 hover:bg-gray-50"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Risk Level</label>
                    <select
                      value={riskFilter}
                      onChange={(e) => setRiskFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Risk Levels</option>
                      <option value="LOW">Low Risk</option>
                      <option value="MEDIUM">Medium Risk</option>
                      <option value="HIGH">High Risk</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Return</label>
                    <select
                      value={returnFilter}
                      onChange={(e) => setReturnFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Any Return</option>
                      <option value="5">5%+ Return</option>
                      <option value="10">10%+ Return</option>
                      <option value="15">15%+ Return</option>
                      <option value="20">20%+ Return</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      onClick={() => {
                        setRiskFilter('all')
                        setReturnFilter('all')
                        setCategoryFilter('all')
                        setSearchTerm('')
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deals Grid/List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : deals.length === 0 ? (
          <Card className="border-0 shadow-xl">
            <CardContent className="p-16 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No Investment Opportunities Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || categoryFilter !== 'all' || riskFilter !== 'all' || returnFilter !== 'all'
                    ? 'Try adjusting your search criteria or filters to find more opportunities.'
                    : 'No investment opportunities are currently available. Check back soon for new deals!'
                  }
                </p>
                {(searchTerm || categoryFilter !== 'all' || riskFilter !== 'all' || returnFilter !== 'all') && (
                  <Button
                    onClick={() => {
                      setSearchTerm('')
                      setCategoryFilter('all')
                      setRiskFilter('all')
                      setReturnFilter('all')
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
              : 'space-y-6'
            }>
              {deals.map((deal) => (
                <div key={deal.id} className="relative group">
                  <DealCard
                    id={deal.id}
                    title={deal.title}
                    description={deal.description || ''}
                    image={deal.thumbnailImage || '/images/default-deal.jpg'}
                    fundingGoal={deal.fundingGoal}
                    currentFunding={deal.currentFunding}
                    expectedReturn={{
                      min: Number(deal.expectedReturn),
                      max: Number(deal.expectedReturn)
                    }}
                    duration={deal.duration || 12}
                    endDate={deal.endDate || ''}
                    contributorsCount={deal._count?.investments || deal.investorCount || 0}
                    partnerName={deal.partner?.companyName || deal.owner.name || 'Partner'}
                    partnerDealsCount={5}
                    minInvestment={deal.minInvestment || 1000}
                    isPartnerView={false}
                  />
                  
                  {/* Save/Bookmark Button */}
                  <button
                    onClick={() => toggleSavedDeal(deal.id)}
                    className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 ${
                      savedDeals.includes(deal.id)
                        ? 'bg-red-500 text-white shadow-lg'
                        : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500 shadow-md'
                    } opacity-0 group-hover:opacity-100`}
                  >
                    {savedDeals.includes(deal.id) ? (
                      <Heart className="w-4 h-4 fill-current" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>

                  {/* Featured Badge */}
                  {deal.featured && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Featured
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-12">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2"
                >
                  Previous
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "primary" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className="w-10 h-10"
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </InvestorLayout>
  )
}

export default PortfolioDealsPage
