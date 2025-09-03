'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DealCard } from '../components/project/DealCard'
import DealForm from '../components/forms/DealForm'
import AdminLayout from '../components/layout/AdminLayout'
import InvestorLayout from '../components/layout/InvestorLayout'
import { useTranslation, useI18n } from '../components/providers/I18nProvider'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Deal } from '../types/deals'
import { dealsService } from '../lib/deals-service'
import { 
  Plus, Filter, Search, Grid, List, TrendingUp,
  Clock, CheckCircle, AlertCircle, X, RefreshCw, Eye, Star, Pause
} from 'lucide-react'



const DealsContent = () => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [imageRefreshTimestamp, setImageRefreshTimestamp] = useState(Date.now())

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Check user permissions
  const isAdmin = session?.user?.role === 'ADMIN'
  const isDealManager = session?.user?.role === 'DEAL_MANAGER'
  const canCreateDeals = isAdmin || isDealManager
  const canManageAllDeals = isAdmin || isDealManager

  // Fetch deals using unified service
  const fetchDeals = async () => {
    try {
      setLoading(true)
      
      const params = {
        page: currentPage,
        limit: 12,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        search: searchTerm || undefined,
        includeAll: canManageAllDeals
      }

      // For investors, only show active/published deals
      if (!canManageAllDeals) {
        params.status = 'ACTIVE'
      }

      const response = await dealsService.fetchDeals(params)
      console.log('Fetched deals:', response.deals.length, 'deals')
      console.log('Deal images:', response.deals.map((d: Deal) => ({ title: d.title, image: d.thumbnailImage })))
      setDeals(response.deals)
      setTotalPages(response.totalPages)
    } catch (error) {
      console.error('Error fetching deals:', error)
      setDeals([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  // Handle edit parameter from URL
  useEffect(() => {
    const editId = searchParams.get('edit')
    if (editId && deals.length > 0) {
      const dealToEdit = deals.find(deal => deal.id === editId)
      if (dealToEdit) {
        setEditingDeal(dealToEdit)
        // Clear the URL parameter
        router.replace('/deals', { scroll: false })
      }
    }
  }, [searchParams, deals, router])

  useEffect(() => {
    fetchDeals()
  }, [currentPage, statusFilter, categoryFilter, searchTerm])

  // Server-side filtering is now handled by the API
  const filteredDeals = deals

  // Handle deal actions
  const handleStatusChange = async (dealId: string, newStatus: string) => {
    try {
      const formData = new FormData()
      formData.append('status', newStatus)
      
      const response = await fetch(`/api/deals/${dealId}`, {
        method: 'PUT',
        body: formData
      })

      if (response.ok) {
        fetchDeals()

      }
    } catch (error) {
      console.error('Error updating deal status:', error)
    }
  }

  const handleDeleteDeal = async (dealId: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) return

    try {
      const response = await fetch(`/api/deals/${dealId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchDeals()

      }
    } catch (error) {
      console.error('Error deleting deal:', error)
    }
  }

  const handleToggleFeatured = async (dealId: string, featured: boolean) => {
    try {
      const formData = new FormData()
      formData.append('featured', (!featured).toString())
      
      const response = await fetch(`/api/deals/${dealId}`, {
        method: 'PUT',
        body: formData
      })

      if (response.ok) {
        fetchDeals()
      }
    } catch (error) {
      console.error('Error updating featured status:', error)
    }
  }

  // Get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return { color: 'text-gray-600 bg-gray-100', icon: Clock, label: 'Draft' }
      case 'PENDING':
        return { color: 'text-yellow-600 bg-yellow-100', icon: Clock, label: 'Pending' }
      case 'PUBLISHED':
        return { color: 'text-blue-600 bg-blue-100', icon: Eye, label: 'Published' }
      case 'ACTIVE':
        return { color: 'text-green-600 bg-green-100', icon: CheckCircle, label: 'Active' }
      case 'PAUSED':
        return { color: 'text-orange-600 bg-orange-100', icon: Pause, label: 'Paused' }
      case 'FUNDED':
        return { color: 'text-purple-600 bg-purple-100', icon: TrendingUp, label: 'Funded' }
      case 'COMPLETED':
        return { color: 'text-green-600 bg-green-100', icon: CheckCircle, label: 'Completed' }
      case 'CANCELLED':
        return { color: 'text-red-600 bg-red-100', icon: X, label: 'Cancelled' }
      default:
        return { color: 'text-gray-600 bg-gray-100', icon: Clock, label: status }
    }
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

  // Categories for filter
  const categories = [
    'Technology', 'Real Estate', 'Healthcare', 'Energy', 
    'Agriculture', 'Manufacturing', 'Finance', 'Education',
    'Transportation', 'Entertainment', 'Food & Beverage', 'Other'
  ]

  if (showAddForm) {
    const addContent = (
      <DealForm
        mode="create"
        onCancel={() => setShowAddForm(false)}
        onSubmit={async (formData) => {
          const response = await fetch('/api/deals', {
            method: 'POST',
            body: formData,
            credentials: 'include'
          })
          if (response.ok) {
            setShowAddForm(false)
            fetchDeals()
          }
        }}
      />
    )

    // Render with appropriate layout
    if (isAdmin) {
      return (
        <AdminLayout
          title="Add New Deal"
          subtitle="Create a new investment opportunity"
        >
          {addContent}
        </AdminLayout>
      )
    } else {
      return (
        <InvestorLayout
          title="Add New Deal"
          subtitle="Create a new investment opportunity"
        >
          {addContent}
        </InvestorLayout>
      )
    }
  }

  if (editingDeal) {
    const editContent = (
      <DealForm
        deal={editingDeal}
        mode="edit"
        onCancel={() => setEditingDeal(null)}
        onSubmit={async (formData) => {
          try {
            console.log('Sending PUT request to update deal:', editingDeal.id)
            console.log('Current session:', session)
            console.log('User role:', session?.user?.role)
            console.log('User ID:', session?.user?.id)
            
            const response = await fetch(`/api/deals/${editingDeal.id}`, {
              method: 'PUT',
              body: formData,
              credentials: 'include' // Ensure cookies are sent
            })
            
            if (response.ok) {
              const updatedDeal = await response.json()
              console.log('Deal updated successfully:', updatedDeal)
              console.log('New image URL:', updatedDeal.thumbnailImage)
              setEditingDeal(null)
              // Force complete refresh with cache clearing
              // Force complete refresh - clear deals first, then reload with new timestamp
              console.log('🔄 Forcing complete refresh...')
              setDeals([]) // Clear current deals
              setImageRefreshTimestamp(Date.now()) // Force new timestamp
              setTimeout(async () => {
                await fetchDeals() // Reload deals after clearing
                console.log('✅ Complete refresh done')
              }, 100)
            } else {
              const errorData = await response.json()
              console.error('Error updating deal:', errorData)
              alert('Error updating deal: ' + (errorData.error || 'Unknown error'))
            }
          } catch (error) {
            console.error('Network error:', error)
            alert('Network error occurred while updating deal')
          }
        }}
      />
    )

    // Render with appropriate layout
    if (isAdmin) {
      return (
        <AdminLayout
          title="Edit Deal"
          subtitle={`Editing: ${editingDeal.title}`}
        >
          {editContent}
        </AdminLayout>
      )
    } else {
      return (
        <InvestorLayout
          title="Edit Deal"
          subtitle={`Editing: ${editingDeal.title}`}
        >
          {editContent}
        </InvestorLayout>
      )
    }
  }

  const pageContent = (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('deals.title')}</h1>
          <p className="text-gray-600">{t('deals.subtitle')}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
                    onClick={() => {
          console.log('🔄 Force refreshing deals and images...')
          setImageRefreshTimestamp(Date.now())
          fetchDeals()
        }}
            variant="outline"
            className="border-gray-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {canCreateDeals && (
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Deal
            </Button>
          )}
            </div>
          </div>
          
      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search deals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
          </div>
          
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="FUNDED">Funded</option>
              <option value="COMPLETED">Completed</option>
              {canManageAllDeals && (
                <>
                  <option value="DRAFT">Draft</option>
                  <option value="PENDING">Pending</option>
                </>
              )}
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
          </div>
        </div>
      </CardContent>
    </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600" />
                  </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Deals</p>
                <p className="text-2xl font-bold text-gray-900">{deals.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Deals</p>
                <p className="text-2xl font-bold text-gray-900">
                  {deals.filter(d => d.status === 'ACTIVE').length}
                </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Funding</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(deals.reduce((sum, deal) => sum + parseFloat(deal.currentFunding.toString()), 0))}
                </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Featured</p>
                    <p className="text-2xl font-bold text-gray-900">
                  {deals.filter(d => d.featured).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

      {/* Deals Grid/List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredDeals.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No deals found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No deals have been created yet'
              }
            </p>
            {canCreateDeals && (
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Deal
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {filteredDeals.map((deal) => (
              <DealCard
                key={deal.id}
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
                partnerDealsCount={5} // You might want to fetch this from the API
                minInvestment={deal.minInvestment || 1000}
                isPartnerView={false} // This is for investors, so no partner view
              />
            ))}
      </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "primary" : "outline"}
                  onClick={() => setCurrentPage(page)}
                  className="w-10"
                >
                  {page}
                </Button>
              ))}
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
        </div>
          )}
        </>
      )}
    </div>
  )

  // Render with appropriate layout
  if (isAdmin) {
    return (
      <AdminLayout 
        title={t('deals.title')}
        subtitle={t('deals.subtitle')}
      >
        {pageContent}
      </AdminLayout>
    )
  } else {
    // For non-admin users, use InvestorLayout for consistency
    return (
      <InvestorLayout
        title={t('deals.title')}
        subtitle={t('deals.subtitle')}
      >
            {pageContent}
      </InvestorLayout>
    )
  }
}

const DealsPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <DealsContent />
    </Suspense>
  )
}

export default DealsPage