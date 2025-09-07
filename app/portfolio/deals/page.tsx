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
  ChevronDown, SlidersHorizontal, ArrowUpRight, Bookmark,
  Archive
} from 'lucide-react'

const PortfolioDealsPage = () => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()
  
  const [activeDeals, setActiveDeals] = useState<Deal[]>([])
  const [closedDeals, setClosedDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active')
  const deals = activeTab === 'active' ? activeDeals : closedDeals
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

  // Fetch deals for investors - separate active and closed
  const fetchDeals = async () => {
    try {
      setLoading(true)
      
      const params = {
        page: 1,
        limit: 100, // Get more to filter client-side
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        search: searchTerm || undefined,
        includeAll: false // Investor view
      }

      const response = await dealsService.fetchDeals(params)
      
      // Separate active and completed deals
      const investableStatuses = ['ACTIVE', 'PUBLISHED']
      const completedStatuses = ['COMPLETED']
      
      let activeDealsFiltered = response.deals.filter(deal => 
        investableStatuses.includes(deal.status)
      )
      
      let closedDealsFiltered = response.deals.filter(deal => 
        completedStatuses.includes(deal.status)
      )

      // Apply client-side filters to current tab
      const currentDeals = activeTab === 'active' ? activeDealsFiltered : closedDealsFiltered
      let filteredDeals = currentDeals

      if (riskFilter !== 'all') {
        filteredDeals = filteredDeals.filter(deal => deal.riskLevel === riskFilter)
      }

      if (returnFilter !== 'all') {
        const minReturn = parseInt(returnFilter)
        filteredDeals = filteredDeals.filter(deal => deal.expectedReturn >= minReturn)
      }

      // Apply sorting
      filteredDeals = sortDeals(filteredDeals, sortBy)

      // Store separated deals
      setActiveDeals(activeDealsFiltered)
      setClosedDeals(closedDealsFiltered)
      
      // Store all investable deals for stats calculation (only active)
      setAllInvestableDeals(activeDealsFiltered)
      
      // Apply pagination client-side since we're filtering
      const startIndex = (currentPage - 1) * 12
      const endIndex = startIndex + 12
      const paginatedDeals = filteredDeals.slice(startIndex, endIndex)
      
      setTotalPages(Math.ceil(filteredDeals.length / 12))
    } catch (error) {
      console.error('Error fetching deals:', error)
      setActiveDeals([])
      setClosedDeals([])
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
  }, [currentPage, categoryFilter, searchTerm, activeTab])

  useEffect(() => {
    // Re-fetch when filters change to apply them properly
    fetchDeals()
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
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 p-8 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold mb-2">{t('deals.investment_marketplace')}</h1>
                <p className="text-green-100 text-lg">
                  {t('deals.explore_vetted_opportunities')}
                </p>
              </div>
              <div className="flex items-center gap-4 mt-4 lg:mt-0">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <span className="font-medium">{allInvestableDeals.filter(d => d.featured).length} {t('deals.featured')}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <Activity className="w-5 h-5 text-emerald-300" />
                  <span className="font-medium">{allInvestableDeals.length} {t('deals.available')}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <DollarSign className="w-6 h-6 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-emerald-100 text-sm">{t('deals.total_available')}</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalFunding)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-teal-500/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-teal-300" />
                  </div>
                  <div>
                    <p className="text-teal-100 text-sm">{t('deals.avg_expected_return')}</p>
                    <p className="text-2xl font-bold">{avgReturn.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Users className="w-6 h-6 text-green-300" />
                  </div>
                  <div>
                    <p className="text-green-100 text-sm">{t('deals.active_investors')}</p>
                    <p className="text-2xl font-bold">{totalInvestors.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-6">
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    activeTab === 'active'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  {t('deals.active_deals')}
                  <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
                    {activeDeals.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('closed')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    activeTab === 'closed'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Archive className="w-4 h-4" />
                  {t('deals.closed_deals')}
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                    {closedDeals.length}
                  </span>
                </button>
              </div>
            </div>
            
            {/* Tab Description */}
            <div className="text-center mb-6">
              <p className="text-gray-600">
                {activeTab === 'active' 
                  ? (locale === 'ar' ? 'اكتشف واستثمر في أفضل الصفقات المتاحة' : 'Discover and invest in the best available deals')
                  : t('deals.closed_deals_subtitle')
                }
              </p>
            </div>
          </CardContent>
        </Card>

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
                    placeholder={t('deals.search_investment_opportunities')}
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
                  <option value="all">{t('deals.all_categories')}</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                >
                  <option value="featured">{t('deals.featured_first')}</option>
                  <option value="newest">{t('deals.newest')}</option>
                  <option value="ending_soon">{t('deals.ending_soon')}</option>
                  <option value="highest_return">{t('deals.highest_return')}</option>
                  <option value="lowest_minimum">{t('deals.lowest_minimum')}</option>
                  <option value="most_funded">{t('deals.most_funded')}</option>
                </select>

                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-3 border-gray-200 hover:bg-gray-50"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  {t('deals.filters')}
                </Button>

                <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 ${viewMode === 'grid' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-50'} transition-colors`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 ${viewMode === 'list' ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-50'} transition-colors`}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('deals.risk_level')}</label>
                    <select
                      value={riskFilter}
                      onChange={(e) => setRiskFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">{t('deals.all_risk_levels')}</option>
                      <option value="LOW">{t('deals.low_risk')}</option>
                      <option value="MEDIUM">{t('deals.medium_risk')}</option>
                      <option value="HIGH">{t('deals.high_risk')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('deals.minimum_return')}</label>
                    <select
                      value={returnFilter}
                      onChange={(e) => setReturnFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">{t('deals.any_return')}</option>
                      <option value="5">{t('return_5_plus')}</option>
                      <option value="10">{t('return_10_plus')}</option>
                      <option value="15">{t('return_15_plus')}</option>
                      <option value="20">{t('return_20_plus')}</option>
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
                      {t('deals.clear_filters')}
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
                  {activeTab === 'closed' ? (
                    <Archive className="w-10 h-10 text-gray-400" />
                  ) : (
                    <AlertCircle className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {activeTab === 'closed' 
                    ? t('deals.no_closed_deals')
                    : 'No Investment Opportunities Found'
                  }
                </h3>
                <p className="text-gray-600 mb-6">
                  {activeTab === 'closed' ? (
                    t('deals.closed_deals_coming_soon')
                  ) : (
                    searchTerm || categoryFilter !== 'all' || riskFilter !== 'all' || returnFilter !== 'all'
                      ? 'Try adjusting your search criteria or filters to find more opportunities.'
                      : 'No investment opportunities are currently available. Check back soon for new deals!'
                  )}
                </p>
                {activeTab === 'active' && (searchTerm || categoryFilter !== 'all' || riskFilter !== 'all' || returnFilter !== 'all') && (
                  <Button
                    onClick={() => {
                      setSearchTerm('')
                      setCategoryFilter('all')
                      setRiskFilter('all')
                      setReturnFilter('all')
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
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
              {deals.map((deal) => {
                // Calculate actual return and profit distributed for closed deals
                const actualReturn = activeTab === 'closed' && deal.profitDistributions && deal.profitDistributions.length > 0 
                  ? Math.round(
                      (deal.profitDistributions.reduce((sum: number, dist: any) => {
                        const rate = Number(dist.profitRate || 0);
                        return sum + (isNaN(rate) ? 0 : rate);
                      }, 0) / deal.profitDistributions.length) * 10
                    ) / 10 // Average profit rate, rounded to 1 decimal place
                  : activeTab === 'closed' ? Number(deal.expectedReturn) : undefined
                
                const profitDistributed = activeTab === 'closed' && deal.profitDistributions && deal.profitDistributions.length > 0
                  ? deal.profitDistributions.reduce((sum: number, dist: any) => {
                      const amount = parseFloat(dist.amount?.toString() || '0');
                      return sum + (isNaN(amount) ? 0 : amount);
                    }, 0)
                  : undefined

                return (
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
                      isClosedView={activeTab === 'closed'}
                      isPortfolioView={true}
                      actualReturn={actualReturn}
                      completionDate={deal.updatedAt} // Use updated date as completion date for now
                      profitDistributed={profitDistributed}
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
                )
              })}
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
