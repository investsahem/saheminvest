'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import PartnerLayout from '../../components/layout/PartnerLayout'
import { useTranslation } from '../../components/providers/I18nProvider'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { 
  DollarSign, TrendingUp, Users, Calendar, Send, 
  AlertCircle, CheckCircle, Clock, Eye, Plus,
  Target, BarChart3, Activity, ArrowRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Deal {
  id: string
  title: string
  currentFunding: number
  fundingGoal: number
  expectedReturn: number
  status: string
  investorsCount: number
  investments: Array<{
    id: string
    amount: number
    investor: {
      id: string
      name: string
      email: string
    }
  }>
}

interface ProfitDistributionFormData {
  totalAmount: number
  estimatedGainPercent: number
  estimatedClosingPercent: number
  distributionType: 'PARTIAL' | 'FINAL'
  description: string
}

interface ProfitDistributionRequest {
  id: string
  projectId: string
  project: {
    title: string
  }
  totalAmount: number
  estimatedGainPercent: number
  estimatedClosingPercent: number
  distributionType: string
  description: string
  status: string
  requestedAt: string
}

const PartnerProfitDistributionsPage = () => {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeDeals, setActiveDeals] = useState<Deal[]>([])
  const [distributionRequests, setDistributionRequests] = useState<ProfitDistributionRequest[]>([])
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<ProfitDistributionFormData>({
    totalAmount: 0,
    estimatedGainPercent: 0,
    estimatedClosingPercent: 100,
    distributionType: 'PARTIAL',
    description: ''
  })
  const [partialHistory, setPartialHistory] = useState<{
    totalPartialAmount: number
    totalPartialCapital: number
    totalPartialProfit: number
    distributionCount: number
  } | null>(null)
  const [loadingHistory, setLoadingHistory] = useState(false)

  // Fetch active deals and distribution requests
  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user) return

      try {
        setLoading(true)
        
        // Fetch active deals
        const dealsResponse = await fetch('/api/partner/deals?status=ACTIVE')
        if (dealsResponse.ok) {
          const dealsData = await dealsResponse.json()
          setActiveDeals(dealsData.deals || [])
        }

        // Fetch distribution requests
        const requestsResponse = await fetch('/api/partner/profit-distribution-requests')
        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json()
          setDistributionRequests(requestsData.requests || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session])

  // Fetch partial distribution history for selected deal
  const fetchPartialHistory = async (dealId: string) => {
    try {
      setLoadingHistory(true)
      const response = await fetch(`/api/partner/deals/${dealId}/partial-history`)
      if (response.ok) {
        const data = await response.json()
        setPartialHistory(data)
        return data
      }
    } catch (error) {
      console.error('Error fetching partial history:', error)
    } finally {
      setLoadingHistory(false)
    }
    return null
  }

  // Handle when partner selects a deal
  const handleSelectDeal = async (deal: Deal) => {
    setSelectedDeal(deal)
    setShowForm(true)
    
    // Fetch partial history for this deal
    const history = await fetchPartialHistory(deal.id)
    
    // Auto-fill the remaining capital amount
    if (history) {
      const totalCapital = deal.currentFunding
      const partialCapitalPaid = history.totalPartialCapital
      const remainingCapital = totalCapital - partialCapitalPaid
      
      // Pre-fill the form with remaining capital
      setFormData(prev => ({
        ...prev,
        totalAmount: remainingCapital
      }))
    } else {
      // No partial history, pre-fill with total capital
      setFormData(prev => ({
        ...prev,
        totalAmount: deal.currentFunding
      }))
    }
  }

  // Calculate remaining capital and suggested amounts
  const calculateRemaining = () => {
    if (!selectedDeal || !partialHistory) return null
    
    const totalCapital = selectedDeal.currentFunding
    const partialCapitalPaid = partialHistory.totalPartialCapital
    const remainingCapital = totalCapital - partialCapitalPaid
    
    return {
      totalCapital,
      partialCapitalPaid,
      remainingCapital
    }
  }

  const handleSubmitDistribution = async () => {
    if (!selectedDeal) return

    try {
      setSubmitting(true)

      const response = await fetch('/api/partner/profit-distribution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dealId: selectedDeal.id,
          estimatedGainPercent: formData.estimatedGainPercent,
          estimatedClosingPercent: formData.estimatedClosingPercent,
          totalAmount: formData.totalAmount,
          distributionType: formData.distributionType,
          description: formData.description
        })
      })

      if (response.ok) {
        alert(t('partner.profit_distribution_submitted'))
        setShowForm(false)
        setSelectedDeal(null)
        setFormData({
          totalAmount: 0,
          estimatedGainPercent: 0,
          estimatedClosingPercent: 100,
          distributionType: 'PARTIAL',
          description: ''
        })
        
        // Refresh distribution requests
        const requestsResponse = await fetch('/api/partner/profit-distribution-requests')
        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json()
          setDistributionRequests(requestsData.requests || [])
        }
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to submit profit distribution request')
      }
    } catch (error) {
      console.error('Error submitting distribution:', error)
      alert('Failed to submit profit distribution request')
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />
      case 'PENDING': return <Clock className="w-4 h-4" />
      case 'REJECTED': return <AlertCircle className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <PartnerLayout title={t('partner.profit_distributions_page_title')} subtitle={t('partner.profit_distributions_page_subtitle')}>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PartnerLayout>
    )
  }

  return (
    <PartnerLayout title={t('partner.profit_distributions_page_title')} subtitle={t('partner.profit_distributions_page_subtitle')}>
      <div className="space-y-6">
        {/* Active Deals - Available for Distribution */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">{t('partner.active_deals_ready_for_distribution')}</h3>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-600">{activeDeals.length} {t('partner.active_deals_count')}</span>
              </div>
            </div>

            {activeDeals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeDeals.map((deal) => (
                  <div key={deal.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 text-sm">{deal.title}</h4>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Activity className="w-3 h-3" />
                        ACTIVE
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex justify-between">
                        <span>{t('partner.current_funding')}:</span>
                        <span className="font-medium">{formatCurrency(deal.currentFunding)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('deals.expected_return')}:</span>
                        <span className="font-medium">{deal.expectedReturn}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('deals.investors')}:</span>
                        <span className="font-medium">{deal.investorsCount}</span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => handleSelectDeal(deal)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t('partner.distribute_profits')}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('partner.no_active_deals')}</h3>
                <p className="text-gray-600">{t('partner.no_active_deals_message')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Distribution Requests History */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">{t('partner.distribution_requests')}</h3>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-purple-600">{distributionRequests.length} {t('partner.distribution_requests_count')}</span>
              </div>
            </div>

            {distributionRequests.length > 0 ? (
              <div className="space-y-4">
                {distributionRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{request.project.title}</h4>
                        <p className="text-sm text-gray-600">{request.description}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {request.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">{t('partner.amount')}:</span>
                        <div className="font-semibold text-gray-900">{formatCurrency(request.totalAmount)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">{t('partner.estimated_gain')}:</span>
                        <div className="font-semibold text-green-600">{request.estimatedGainPercent}%</div>
                      </div>
                      <div>
                        <span className="text-gray-600">{t('partner.estimated_deal_closing')}:</span>
                        <div className="font-semibold text-blue-600">{request.estimatedClosingPercent}%</div>
                      </div>
                      <div>
                        <span className="text-gray-600">{t('partner.type')}:</span>
                        <div className="font-semibold text-purple-600">{request.distributionType}</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-500">{t('partner.requested_on')} {formatDate(request.requestedAt)}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/partner/profit-distributions/${request.id}`)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        عرض التفاصيل
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('partner.no_distribution_requests')}</h3>
                <p className="text-gray-600">{t('partner.no_distribution_requests_message')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profit Distribution Form Modal */}
        {showForm && selectedDeal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">{t('partner.new_profit_distribution')}</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setShowForm(false)
                      setSelectedDeal(null)
                    }}
                  >
                    {t('partner.close')}
                  </Button>
                </div>

                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">{selectedDeal.title}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600">{t('partner.current_funding')}:</span>
                      <div className="font-semibold text-blue-900">{formatCurrency(selectedDeal.currentFunding)}</div>
                    </div>
                    <div>
                      <span className="text-blue-600">{t('deals.investors')}:</span>
                      <div className="font-semibold text-blue-900">{selectedDeal.investorsCount}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Remaining Capital Info - Show for ALL distributions */}
                  {partialHistory && (() => {
                    const remaining = calculateRemaining()
                    if (!remaining) return null
                    
                    return (
                      <div className="p-4 bg-blue-50 border-2 border-blue-400 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                          <DollarSign className="w-5 h-5 mr-2" />
                          معلومات رأس المال
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-800">إجمالي رأس المال:</span>
                            <span className="font-bold text-blue-900">{formatCurrency(remaining.totalCapital)}</span>
                          </div>
                          {partialHistory.distributionCount > 0 && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-blue-800">تم توزيعه في توزيعات جزئية ({partialHistory.distributionCount}):</span>
                                <span className="font-bold text-red-700">- {formatCurrency(remaining.partialCapitalPaid)}</span>
                              </div>
                              <div className="flex justify-between pt-2 border-t-2 border-blue-400">
                                <span className="text-blue-900 font-bold">المتبقي المتاح للتوزيع:</span>
                                <span className="font-bold text-green-700">{formatCurrency(remaining.remainingCapital)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })()}

                  {/* No history case */}
                  {!partialHistory && !loadingHistory && selectedDeal && (
                    <div className="p-4 bg-blue-50 border border-blue-300 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                        <DollarSign className="w-5 h-5 mr-2" />
                        معلومات رأس المال
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-800">إجمالي رأس المال المتاح:</span>
                          <span className="font-bold text-blue-900">{formatCurrency(selectedDeal.currentFunding)}</span>
                        </div>
                        <p className="text-xs text-blue-700 mt-2">
                          لا توجد توزيعات سابقة. كامل رأس المال متاح للتوزيع.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Amount - Pre-filled with remaining capital */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('partner.amount')} ($) * 
                      <span className="text-xs text-gray-500 font-normal mr-2">(تم التعبئة تلقائياً - يمكن التعديل)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.totalAmount || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: Number(e.target.value) || 0 }))}
                      placeholder="e.g., 21400"
                      className="w-full px-3 py-2 border-2 border-green-300 bg-green-50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 font-semibold"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      💡 تم تعبئة المبلغ تلقائياً برأس المال المتبقي. يمكنك تعديله حسب الحاجة.
                    </p>
                  </div>

                  {/* Estimated Gain % */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('partner.estimated_gain')} % *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.estimatedGainPercent || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedGainPercent: Number(e.target.value) || 0 }))}
                      placeholder="e.g., 7"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Estimated Deal Closing % */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('partner.estimated_deal_closing')} % *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.estimatedClosingPercent || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedClosingPercent: Number(e.target.value) || 0 }))}
                      placeholder="e.g., 100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Distribution Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('partner.distribution_type')} *</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="distributionType"
                          value="PARTIAL"
                          checked={formData.distributionType === 'PARTIAL'}
                          onChange={(e) => setFormData(prev => ({ ...prev, distributionType: e.target.value as 'PARTIAL' | 'FINAL' }))}
                          className="mr-2"
                        />
                        {t('partner.partial_distribution')}
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="distributionType"
                          value="FINAL"
                          checked={formData.distributionType === 'FINAL'}
                          onChange={(e) => setFormData(prev => ({ ...prev, distributionType: e.target.value as 'PARTIAL' | 'FINAL' }))}
                          className="mr-2"
                        />
                        {t('partner.final_distribution')}
                      </label>
                    </div>
                  </div>

                  {/* Additional info for FINAL distributions */}
                  {formData.distributionType === 'FINAL' && (
                    <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>⚠️ تنبيه:</strong> التوزيع النهائي = رأس المال المتبقي + الأرباح. 
                        {partialHistory && partialHistory.distributionCount > 0 ? (
                          <> المبلغ المعبأ ({formatCurrency(formData.totalAmount)}) هو رأس المال المتبقي فقط. أضف الأرباح إليه.</>
                        ) : (
                          <> أدخل المبلغ الإجمالي (رأس المال + الأرباح).</>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Additional info for PARTIAL distributions */}
                  {formData.distributionType === 'PARTIAL' && (
                    <div className="p-3 bg-green-50 border border-green-300 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>💡 معلومة:</strong> التوزيع الجزئي = استرداد جزء من رأس المال (لا يشمل أرباح). 
                        المبلغ المعبأ هو رأس المال المتبقي بالكامل، يمكنك تقليله لتوزيع جزء منه فقط.
                      </p>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('partner.distribution_description')} *</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder={t('partner.distribution_description_placeholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={handleSubmitDistribution}
                      disabled={submitting || !formData.totalAmount || !formData.estimatedGainPercent || !formData.description}
                      className="bg-green-600 hover:bg-green-700 flex-1"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {submitting ? t('partner.submitting') : t('partner.submit_for_admin_review')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowForm(false)
                        setSelectedDeal(null)
                      }}
                      disabled={submitting}
                    >
                      {t('common.cancel')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PartnerLayout>
  )
}

export default PartnerProfitDistributionsPage
