'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '../../components/providers/I18nProvider'
import PartnerLayout from '../../components/layout/PartnerLayout'
import { DealCard } from '../../components/project/DealCard'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import DealForm from '../../components/forms/DealForm'
import ProfitDistributionForm from '../../components/forms/ProfitDistributionForm'
import { Deal } from '../../types/deals'
import { dealsService } from '../../lib/deals-service'
import { 
  Plus, Search, Filter, Eye, Edit, Trash2, Play, Pause, 
  TrendingUp, Users, Calendar, DollarSign, AlertCircle, CheckCircle,
  BarChart3, Target, Building2, Briefcase, Clock, X
} from 'lucide-react'
import { useAdminNotifications } from '../../hooks/useAdminNotifications'



const PartnerDealsPage = () => {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const router = useRouter()
  const { sendDealNotification } = useAdminNotifications()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddDeal, setShowAddDeal] = useState(false)
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null)
  const [distributingProfits, setDistributingProfits] = useState<Deal | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const dealsPerPage = 12

  // Fetch deals for current partner
  useEffect(() => {
    fetchDeals()
  }, [searchTerm, filterStatus])

  const fetchDeals = async () => {
    try {
      setLoading(true)
      
      const params = {
        search: searchTerm || undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        limit: 50,
        partner: true // Filter for partner's own deals
      }

      const response = await dealsService.fetchDeals(params)
      setDeals(response.deals)
    } catch (error) {
      console.error('Error fetching deals:', error)
      setDeals([])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (dealId: string, newStatus: string) => {
    try {
      const formData = new FormData()
      formData.append('status', newStatus)

      const response = await fetch(`/api/deals/${dealId}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include'
      })

      if (response.ok) {
        await fetchDeals()
      }
    } catch (error) {
      console.error('Error updating deal status:', error)
    }
  }

  const handleDeleteDeal = async (dealId: string) => {
    const deal = deals.find(d => d.id === dealId)
    const confirmMessage = `Are you sure you want to delete "${deal?.title}"? This action cannot be undone.`
    
    if (!confirm(confirmMessage)) return

    try {
      const response = await fetch(`/api/deals/${dealId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        await fetchDeals()
        alert('Deal deleted successfully!')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to delete deal')
      }
    } catch (error) {
      console.error('Error deleting deal:', error)
      alert('Error deleting deal')
    }
  }

  const handleProfitDistribution = async (distributions: any[]) => {
    try {
      const response = await fetch('/api/partner/profit-distribution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dealId: distributingProfits?.id,
          distributions
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit profit distribution')
      }

      alert('Profit distribution submitted for admin approval')
      setDistributingProfits(null)
      fetchDeals() // Refresh deals
    } catch (error) {
      console.error('Error submitting profit distribution:', error)
      throw error
    }
  }

  // Paginate deals (filtering is now done server-side)
  const totalPages = Math.ceil(deals.length / dealsPerPage)
  const paginatedDeals = deals.slice(
    (currentPage - 1) * dealsPerPage,
    currentPage * dealsPerPage
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': 
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'PAUSED': return 'bg-orange-100 text-orange-800'
      case 'FUNDED': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-purple-100 text-purple-800'
      case 'REJECTED': 
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PUBLISHED': 
      case 'ACTIVE': return <CheckCircle className="w-4 h-4" />
      case 'PENDING': return <Clock className="w-4 h-4" />
      case 'DRAFT': return <Edit className="w-4 h-4" />
      case 'PAUSED': return <Pause className="w-4 h-4" />
      case 'FUNDED': return <Target className="w-4 h-4" />
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />
      case 'REJECTED': return <X className="w-4 h-4" />
      case 'CANCELLED': return <X className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const formatCurrency = (amount: number) => dealsService.formatCurrency(amount, 'en')

  if (showAddDeal) {
    return (
      <PartnerLayout
        title={t('partner.create_new_deal')}
        subtitle={t('partner.create_new_deal_subtitle')}
      >
        <DealForm
          mode="create"
          onSubmit={async (formData: FormData) => {
            try {
              // Set status to PENDING for admin approval
              formData.append('status', 'PENDING')
              
              const response = await fetch('/api/deals', {
                method: 'POST',
                body: formData,
                credentials: 'include'
              })
              if (response.ok) {
                const newDeal = await response.json()
                
                // Send notification to admins
                await sendDealNotification(newDeal.id, 'created')
                
                setShowAddDeal(false)
                fetchDeals()
                alert('Deal created successfully! It will be reviewed by admin before being published.')
              } else {
                const errorData = await response.json()
                alert(errorData.error || 'Failed to create deal')
              }
            } catch (error) {
              console.error('Error creating deal:', error)
              alert('Error creating deal')
            }
          }}
          onCancel={() => setShowAddDeal(false)}
        />
      </PartnerLayout>
    )
  }

  if (editingDeal) {
    return (
      <PartnerLayout
        title={t('partner.edit_deal')}
        subtitle={`Editing: ${editingDeal.title}`}
      >
        <DealForm
          deal={editingDeal}
          mode="edit"
          onSubmit={async (formData: FormData) => {
            try {
              // If deal is already active/published, set it back to PENDING for re-approval
              if (editingDeal.status === 'ACTIVE' || editingDeal.status === 'PUBLISHED') {
                formData.append('status', 'PENDING')
              }
              
              console.log('🚀 Sending PUT request to update deal:', editingDeal.id)
              
              const response = await fetch(`/api/deals/${editingDeal.id}`, {
                method: 'PUT',
                body: formData,
                credentials: 'include'
              })
              
              console.log('📡 API Response status:', response.status)
              
              if (response.ok) {
                const updatedDeal = await response.json()
                console.log('✅ Deal updated successfully:', {
                  id: updatedDeal.id,
                  title: updatedDeal.title,
                  thumbnailImage: updatedDeal.thumbnailImage
                })
                
                // Send notification to admins if deal was active/published (requires re-approval)
                if (editingDeal.status === 'ACTIVE' || editingDeal.status === 'PUBLISHED') {
                  await sendDealNotification(editingDeal.id, 'updated', ['Deal details updated'])
                }
                
                setEditingDeal(null)
                
                // Force a hard refresh of the deals data
                console.log('🔄 Force refreshing deals data...')
                setDeals([]) // Clear current deals first
                await fetchDeals() // Wait for deals to refresh
                console.log('🔄 Deals refreshed after update')
                
                if (editingDeal.status === 'ACTIVE' || editingDeal.status === 'PUBLISHED') {
                  alert('Deal updated successfully! It will be reviewed by admin before being published again.')
                } else {
                  alert('Deal updated successfully!')
                }
              } else {
                const errorData = await response.json()
                console.error('❌ API Error:', errorData)
                alert(errorData.error || 'Failed to update deal')
              }
            } catch (error) {
              console.error('Error updating deal:', error)
              alert('Error updating deal')
            }
          }}
          onCancel={() => setEditingDeal(null)}
        />
      </PartnerLayout>
    )
  }

  if (distributingProfits) {
    return (
      <PartnerLayout
        title="Distribute Profits"
        subtitle={`Profit Distribution for: ${distributingProfits.title}`}
      >
                        <ProfitDistributionForm
                          deal={{
                            ...distributingProfits,
                            investments: distributingProfits.investments?.map(inv => ({
                              ...inv,
                              investor: {
                                ...inv.investor,
                                email: (inv.investor as any).email || `${inv.investor.name}@example.com`
                              }
                            })) || []
                          }}
                          onSubmit={handleProfitDistribution}
                          onCancel={() => setDistributingProfits(null)}
                        />
      </PartnerLayout>
    )
  }

  return (
    <PartnerLayout
      title={t('partner.my_deals')}
      subtitle={t('partner.my_deals_subtitle')}
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">{t('partner_deals.total_deals')}</p>
                  <p className="text-2xl font-bold text-blue-900">{deals.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">{t('partner_deals.active')}</p>
                  <p className="text-2xl font-bold text-green-900">
                    {deals.filter(d => d.status === 'ACTIVE' || d.status === 'PUBLISHED').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">{t('partner_deals.pending_review')}</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {deals.filter(d => d.status === 'PENDING').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">{t('partner_deals.completed')}</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {deals.filter(d => d.status === 'COMPLETED').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder={t('partner_deals.search_deals')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{t('partner_deals.all_status')}</option>
                  <option value="DRAFT">{t('partner_deals.draft')}</option>
                  <option value="PENDING">{t('partner_deals.pending_review')}</option>
                  <option value="ACTIVE">{t('partner_deals.active')}</option>
                  <option value="PUBLISHED">{t('partner_deals.published')}</option>
                  <option value="PAUSED">{t('partner_deals.paused')}</option>
                  <option value="FUNDED">{t('partner_deals.funded')}</option>
                  <option value="COMPLETED">{t('partner_deals.completed')}</option>
                  <option value="REJECTED">{t('partner_deals.rejected')}</option>
                  <option value="CANCELLED">{t('partner_deals.cancelled')}</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  {t('partner_deals.export')}
                </Button>
                <Button 
                  className="flex items-center gap-2"
                  onClick={() => setShowAddDeal(true)}
                >
                  <Plus className="w-4 h-4" />
                  {t('partner_deals.create_deal')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deals Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedDeals.map((deal) => (
                <div key={deal.id} className="relative">
                  <DealCard
                    id={deal.id}
                    title={deal.title}
                    description={deal.description || ''}
                    image={deal.thumbnailImage || '/images/default-deal.jpg'}
                    fundingGoal={deal.fundingGoal}
                    currentFunding={deal.currentFunding}
                    expectedReturn={{
                      min: typeof deal.expectedReturn === 'number' ? deal.expectedReturn : (Number(deal.expectedReturn)),
                      max: typeof deal.expectedReturn === 'number' ? deal.expectedReturn : (Number(deal.expectedReturn))
                    }}
                    duration={deal.duration || 12}
                    endDate={deal.endDate || ''}
                    contributorsCount={deal._count?.investments || deal.investorCount || 0}
                    partnerName={deal.owner?.partnerProfile?.companyName || deal.partner?.companyName || deal.owner.name || 'Partner'}
                    partnerProfile={deal.owner?.partnerProfile}
                    partnerDealsCount={5} // You might want to fetch this from the API
                    minInvestment={deal.minInvestment || 1000}
                    isPartnerView={true}
                    isClosedView={deal.status === 'COMPLETED'}
                    actualReturn={deal.status === 'COMPLETED' && deal.profitDistributions && deal.profitDistributions.length > 0 
                      ? Math.round(
                          (deal.profitDistributions.reduce((sum: number, dist: any) => {
                            const rate = Number(dist.profitRate || 0);
                            return sum + (isNaN(rate) ? 0 : rate);
                          }, 0) / deal.profitDistributions.length) * 10
                        ) / 10 // Average profit rate, rounded to 1 decimal place
                      : deal.status === 'COMPLETED' ? Number(deal.expectedReturn) : undefined}
                    completionDate={deal.status === 'COMPLETED' ? deal.updatedAt : undefined}
                    profitDistributed={deal.status === 'COMPLETED' && deal.profitDistributions && deal.profitDistributions.length > 0
                      ? deal.profitDistributions.reduce((sum: number, dist: any) => {
                          const amount = parseFloat(dist.amount?.toString() || '0');
                          return sum + (isNaN(amount) ? 0 : amount);
                        }, 0)
                      : undefined}
                  />
                  
                  {/* Deal Actions Overlay */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    {/* Status Badge */}
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deal.status)}`}>
                      {getStatusIcon(deal.status)}
                      <span className="ml-1">
                        {deal.status === 'PENDING' ? t('partner_deals.pending_review') : 
                         deal.status === 'ACTIVE' ? t('partner_deals.active') :
                         deal.status === 'PUBLISHED' ? t('partner_deals.published') :
                         deal.status === 'COMPLETED' ? t('partner_deals.completed') :
                         deal.status === 'DRAFT' ? t('partner_deals.draft') :
                         deal.status === 'PAUSED' ? t('partner_deals.paused') :
                         deal.status === 'FUNDED' ? t('partner_deals.funded') :
                         deal.status === 'REJECTED' ? t('partner_deals.rejected') :
                         deal.status === 'CANCELLED' ? t('partner_deals.cancelled') :
                         deal.status}
                      </span>
                    </div>
                    
                    {/* Pending notification */}
                    {deal.status === 'PENDING' && (
                      <div className="px-2 py-1 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                        Awaiting admin approval
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex gap-1">
                      {/* Edit Button */}
                      <Button
                        size="sm"
                        onClick={() => setEditingDeal(deal)}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
                        title="Edit Deal"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="text-xs">تعديل</span>
                      </Button>
                      
                      {/* View Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/deals/${deal.id}`, '_blank')}
                        className="bg-white hover:bg-gray-50 flex items-center gap-1"
                        title="View Deal"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-xs">عرض</span>
                      </Button>
                      
                      {/* Manage Deal Button - Only for deals with investments */}
                      {(deal.investorCount || 0) > 0 && (
                        <Button
                          size="sm"
                          onClick={() => router.push(`/partner/deals/${deal.id}/manage`)}
                          className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1"
                          title="ادارة الصفقة"
                        >
                          <BarChart3 className="w-4 h-4" />
                          <span className="text-xs">إدارة</span>
                        </Button>
                      )}
                      
                      {/* Distribute Profits Button - Only for active/funded deals with investments (not completed) */}
                      {(deal.status === 'ACTIVE' || deal.status === 'FUNDED') && 
                       (deal.investorCount || 0) > 0 && (
                        <Button
                          size="sm"
                          onClick={() => setDistributingProfits(deal)}
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                          title="Distribute Profits"
                        >
                          <DollarSign className="w-4 h-4" />
                          <span className="text-xs">أرباح</span>
                        </Button>
                      )}
                      
                      {/* View Profit History Button - Only for completed deals with profit distributions */}
                      {deal.status === 'COMPLETED' && (deal.investorCount || 0) > 0 && (
                        <Button
                          size="sm"
                          onClick={() => router.push(`/partner/deals/${deal.id}/manage`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
                          title="View Profit History"
                        >
                          <DollarSign className="w-4 h-4" />
                          <span className="text-xs">سجل</span>
                        </Button>
                      )}
                      
                      {/* Delete Button - Only for draft deals */}
                      {deal.status === 'DRAFT' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteDeal(deal.id)}
                          className="bg-white hover:bg-red-50 text-red-600 border-red-300"
                          title="Delete Deal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {deals.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('partner_deals.no_deals_found')}</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : t('partner_deals.no_deals_message')
                }
              </p>
              {(!searchTerm && filterStatus === 'all') && (
                <Button onClick={() => setShowAddDeal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('partner_deals.create_deal')}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PartnerLayout>
  )
}

export default PartnerDealsPage