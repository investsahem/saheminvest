'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTranslation } from '../../../../components/providers/I18nProvider'
import PartnerLayout from '../../../../components/layout/PartnerLayout'
import { Card, CardContent } from '../../../../components/ui/Card'
import { Button } from '../../../../components/ui/Button'
import { DealTimeline } from '../../../../components/project/DealTimeline'
import {
  ArrowLeft, Users, DollarSign, TrendingUp, Calendar,
  Plus, Send, AlertCircle, CheckCircle, Clock, Eye,
  BarChart3, PieChart, Activity, Target, FileText
} from 'lucide-react'

interface Deal {
  id: string
  title: string
  description: string
  status: string
  fundingGoal: number
  currentFunding: number
  expectedReturn: number
  duration: number
  startDate: string
  endDate: string
  thumbnailImage?: string
  investments: Investment[]
  profitDistributions: ProfitDistribution[]
  profitDistributionRequests?: ProfitDistributionRequest[]
  investorCount: number
  _count: {
    investments: number
  }
}

interface Investment {
  id: string
  amount: number
  investmentDate: string
  investor: {
    id: string
    name: string
  }
}

interface ProfitDistribution {
  id: string
  amount: number
  profitRate: number
  distributionDate: string
  description: string
  status: string
}

interface ProfitDistributionRequest {
  id: string
  totalAmount: number
  estimatedGainPercent: number
  estimatedClosingPercent: number
  estimatedProfit: number
  estimatedReturnCapital: number
  distributionType: string
  description: string
  status: string
  createdAt: string
  reviewedAt: string | null
  sahemInvestAmount: number
  reservedAmount: number
}

interface ProfitDistributionFormData {
  estimatedGainPercent: number
  estimatedClosingPercent: number
  totalAmount: number
  distributionType: 'PARTIAL' | 'FINAL'
  description: string
}

const DealManagePage = () => {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const dealId = params.id as string

  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)
  const [showProfitForm, setShowProfitForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [profitForm, setProfitForm] = useState<ProfitDistributionFormData>({
    estimatedGainPercent: 7,
    estimatedClosingPercent: 100,
    totalAmount: 0,
    distributionType: 'PARTIAL',
    description: ''
  })

  // Fetch deal details
  useEffect(() => {
    const fetchDeal = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/deals/${dealId}?includeInvestments=true&includeDistributions=true`, {
          credentials: 'include'
        })

        if (response.ok) {
          const dealData = await response.json()
          setDeal(dealData)
        } else {
          console.error('Failed to fetch deal')
          router.push('/partner/deals')
        }
      } catch (error) {
        console.error('Error fetching deal:', error)
        router.push('/partner/deals')
      } finally {
        setLoading(false)
      }
    }

    if (dealId) {
      fetchDeal()
    }
  }, [dealId, router])

  const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return '$0.00'
    }

    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount)
    } catch (error) {
      console.error('Error formatting currency:', error, 'amount:', amount)
      return '$0.00'
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'

    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Invalid Date'
      }

      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date)
    } catch (error) {
      console.error('Error formatting date:', error, 'dateString:', dateString)
      return 'Invalid Date'
    }
  }

  const handleSubmitProfitDistribution = async (data: ProfitDistributionFormData) => {
    try {
      setSubmitting(true)

      const response = await fetch('/api/partner/profit-distribution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dealId: dealId,
          estimatedGainPercent: data.estimatedGainPercent,
          estimatedClosingPercent: data.estimatedClosingPercent,
          totalAmount: data.totalAmount,
          distributionType: data.distributionType,
          description: data.description
        })
      })

      if (response.ok) {
        alert(t('deal_management.profit_distribution_submitted'))
        setShowProfitForm(false)
        // Refresh deal data
        window.location.reload()
      } else {
        const errorData = await response.json()
        alert(errorData.error || t('deal_management.profit_distribution_error'))
      }
    } catch (error) {
      console.error('Error submitting profit distribution:', error)
      alert(t('deal_management.profit_distribution_error'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <PartnerLayout title={t('deal_management.title')} subtitle={t('deal_management.subtitle')}>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PartnerLayout>
    )
  }

  if (!deal) {
    return (
      <PartnerLayout title={t('deal_management.title')} subtitle={t('deal_management.deal_not_found')}>
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('deal_management.deal_not_found')}</h2>
            <p className="text-gray-600 mb-4">{t('deal_management.deal_not_found_message')}</p>
            <Button onClick={() => router.push('/partner/deals')}>
              {t('deal_management.back_to_deals')}
            </Button>
          </CardContent>
        </Card>
      </PartnerLayout>
    )
  }

  const totalInvested = (deal.investments || []).reduce((sum, inv) => {
    const amount = Number(inv.amount)
    return sum + (isNaN(amount) ? 0 : amount)
  }, 0)

  const totalDistributed = (deal.profitDistributions || []).reduce((sum, dist) => {
    const amount = Number(dist.amount)
    return sum + (isNaN(amount) ? 0 : amount)
  }, 0)

  const fundingProgress = deal.fundingGoal > 0 ? (deal.currentFunding / deal.fundingGoal) * 100 : 0

  // Group investments by investor ID (same person)
  const getGroupedInvestorsList = () => {
    if (!deal.investments || deal.investments.length === 0) {
      return []
    }

    const investorGroups = {} as Record<string, {
      investorId: string
      totalAmount: number
      earliestDate: string
      investments: Investment[]
    }>

    (deal.investments || []).forEach(investment => {
      const investorId = investment.investor.id
      if (!investorGroups[investorId]) {
        investorGroups[investorId] = {
          investorId: investorId,
          totalAmount: 0,
          earliestDate: investment.investmentDate,
          investments: []
        }
      }

      investorGroups[investorId].totalAmount += Number(investment.amount)
      investorGroups[investorId].investments.push(investment)

      // Keep earliest date
      if (new Date(investment.investmentDate) < new Date(investorGroups[investorId].earliestDate)) {
        investorGroups[investorId].earliestDate = investment.investmentDate
      }
    })

    // Convert to array and sort by earliest investment date
    return Object.values(investorGroups)
      .sort((a, b) => new Date(a.earliestDate).getTime() - new Date(b.earliestDate).getTime())
  }

  const groupedInvestors = getGroupedInvestorsList()

  return (
    <PartnerLayout title={t('deal_management.title')} subtitle={deal.title}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.push('/partner/deals')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('deal_management.back_to_deals')}
          </Button>

          <div className="flex gap-2">
            {deal.status === 'COMPLETED' ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">{t('deal_management.completed_deal_view_profits')}</span>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setShowProfitForm(true)}
                className="bg-green-600 hover:bg-green-700"
                disabled={deal.status !== 'PUBLISHED' && deal.status !== 'ACTIVE' && deal.status !== 'FUNDED'}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('deal_management.distribute_profits')}
              </Button>
            )}
          </div>
        </div>

        {/* Deal Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('deal_management.total_investments')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalInvested)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('deal_management.investors_count')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {deal.investorCount || 0}
                  </p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('deal_management.distributed_profits')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalDistributed)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('deal_management.deal_status')}</p>
                  <p className="text-lg font-bold text-gray-900">
                    {deal.status === 'ACTIVE' && t('deal_management.deal_statuses.active')}
                    {deal.status === 'FUNDED' && t('deal_management.deal_statuses.funded')}
                    {deal.status === 'COMPLETED' && t('deal_management.deal_statuses.completed')}
                    {deal.status === 'DRAFT' && t('deal_management.deal_statuses.draft')}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deal Progress */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('deal_management.deal_progress')}</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{t('deal_management.funding_achieved')}</span>
                  <span>{fundingProgress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{formatCurrency(deal.currentFunding)}</span>
                  <span>{formatCurrency(deal.fundingGoal)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Investors List - Modern Card Design */}
        <Card className="bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">{t('deal_management.investors_list')}</h3>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {groupedInvestors.length} {t('deal_management.investor')}
              </div>
            </div>

            {groupedInvestors.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">{t('deal_management.no_investments')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {groupedInvestors.map((investor, index) => {
                  // Calculate profits for this investor based on their total investment
                  const investorProfits = (deal.profitDistributions || [])
                    .filter(dist => dist.status === 'COMPLETED')
                    .reduce((sum, dist) => {
                      const distributionAmount = Number(dist.amount)
                      if (isNaN(investor.totalAmount) || isNaN(distributionAmount) || totalInvested <= 0) {
                        return sum
                      }
                      const investorShare = (investor.totalAmount / totalInvested) * distributionAmount
                      return sum + (isNaN(investorShare) ? 0 : investorShare)
                    }, 0)

                  // Calculate investor share percentage
                  const sharePercent = totalInvested > 0
                    ? ((investor.totalAmount / totalInvested) * 100).toFixed(1)
                    : '0.0'

                  return (
                    <div key={investor.investorId}
                      className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-200 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        {/* Investor Info */}
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{t('deal_management.investor')} #{index + 1}</p>
                            <p className="text-sm text-gray-500">{formatDate(investor.earliestDate)}</p>
                          </div>
                        </div>

                        {/* Investment Details */}
                        <div className="flex items-center gap-6">
                          {/* Investment Amount */}
                          <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">{t('deal_management.investment_amount')}</p>
                            <p className="font-bold text-gray-900 text-lg">{formatCurrency(investor.totalAmount)}</p>
                          </div>

                          {/* Share Percentage */}
                          <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">{t('deal_management.share_percent') || 'الحصة'}</p>
                            <div className="flex items-center justify-center">
                              <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold">
                                {sharePercent}%
                              </div>
                            </div>
                          </div>

                          {/* Profits Received */}
                          <div className="text-center min-w-[120px]">
                            <p className="text-xs text-gray-500 mb-1">{t('deal_management.profits_received')}</p>
                            <p className={`font-bold text-lg ${investorProfits > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                              {investorProfits > 0 ? '+' : ''}{formatCurrency(investorProfits)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Progress bar showing profit rate */}
                      {investorProfits > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>{t('deal_management.profit_rate') || 'نسبة الربح'}</span>
                            <span className="text-green-600 font-medium">
                              {((investorProfits / investor.totalAmount) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min((investorProfits / investor.totalAmount) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profit Distribution History */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('deal_management.profit_distribution_history')}</h3>
              {deal.status === 'COMPLETED' && (
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {t('deal_management.completed_deal')}
                </div>
              )}
            </div>

            {/* Distribution Requests Section - Shows estimates with pending/approved status */}
            {(deal.profitDistributionRequests || []).length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {t('deal_management.distribution_requests') || 'طلبات التوزيع'}
                </h4>
                <div className="space-y-3">
                  {(deal.profitDistributionRequests || []).map((request) => (
                    <div key={request.id}
                      className={`rounded-xl border-2 p-4 ${request.status === 'PENDING'
                          ? 'bg-amber-50 border-amber-200'
                          : request.status === 'APPROVED'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {/* Distribution Type Badge */}
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${request.distributionType === 'FINAL'
                              ? 'bg-green-600 text-white'
                              : 'bg-purple-600 text-white'
                            }`}>
                            {request.distributionType === 'FINAL'
                              ? (t('deal_management.final_distribution') || 'توزيع نهائي')
                              : (t('deal_management.partial_distribution') || 'توزيع جزئي')
                            }
                          </span>
                          {/* Status Badge */}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${request.status === 'PENDING'
                              ? 'bg-amber-200 text-amber-800'
                              : request.status === 'APPROVED'
                                ? 'bg-green-200 text-green-800'
                                : 'bg-red-200 text-red-800'
                            }`}>
                            {request.status === 'PENDING' && (t('deal_management.pending_approval') || 'قيد المراجعة')}
                            {request.status === 'APPROVED' && (t('deal_management.approved') || 'تمت الموافقة')}
                            {request.status === 'REJECTED' && (t('deal_management.rejected') || 'مرفوض')}
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(Number(request.totalAmount))}</p>
                      </div>

                      {request.description && (
                        <p className="text-sm text-gray-600 mb-3">{request.description}</p>
                      )}

                      {/* Estimated Percentages Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                        <div className="bg-white/70 rounded-lg p-2">
                          <p className="text-xs text-gray-500">{t('deal_management.expected_return_percent') || 'العائد المتوقع (%)'}</p>
                          <p className="text-lg font-bold text-blue-600">{Number(request.estimatedGainPercent).toFixed(1)}%</p>
                        </div>
                        <div className="bg-white/70 rounded-lg p-2">
                          <p className="text-xs text-gray-500">{t('deal_management.closing_percent') || 'نسبة الإغلاق (%)'}</p>
                          <p className="text-lg font-bold text-purple-600">{Number(request.estimatedClosingPercent).toFixed(1)}%</p>
                        </div>
                        <div className="bg-white/70 rounded-lg p-2">
                          <p className="text-xs text-gray-500">{t('deal_management.estimated_profit') || 'الربح المتوقع'}</p>
                          <p className="text-lg font-bold text-green-600">{formatCurrency(Number(request.estimatedProfit))}</p>
                        </div>
                        <div className="bg-white/70 rounded-lg p-2">
                          <p className="text-xs text-gray-500">{t('deal_management.capital_return') || 'رأس المال'}</p>
                          <p className="text-lg font-bold text-gray-700">{formatCurrency(Number(request.estimatedReturnCapital))}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                        <span>{t('deal_management.submitted_on') || 'تاريخ الطلب'}: {formatDate(request.createdAt)}</span>
                        {request.reviewedAt && (
                          <span>{t('deal_management.reviewed_on') || 'تاريخ المراجعة'}: {formatDate(request.reviewedAt)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Distributions */}
            {(deal.profitDistributions || []).length > 0 ? (
              <div className="space-y-4">
                {/* Summary for completed deals */}
                {deal.status === 'COMPLETED' && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-green-900 mb-2">{t('deal_management.final_profit_summary')}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-green-600">{t('deal_management.total_distributed_profits')}</p>
                        <p className="font-bold text-green-900">{formatCurrency(totalDistributed)}</p>
                      </div>
                      <div>
                        <p className="text-green-600">{t('deal_management.distributions_count')}</p>
                        <p className="font-bold text-green-900">{(deal.profitDistributions || []).length}</p>
                      </div>
                      <div>
                        <p className="text-green-600">{t('deal_management.return_rate')}</p>
                        <p className="font-bold text-green-900">
                          {totalInvested > 0 && !isNaN(totalDistributed) && !isNaN(totalInvested)
                            ? ((totalDistributed / totalInvested) * 100).toFixed(1)
                            : '0.0'}%
                        </p>
                      </div>
                      <div>
                        <p className="text-green-600">{t('deal_management.deal_status')}</p>
                        <p className="font-bold text-green-900">{t('deal_management.deal_status_completed')}</p>
                      </div>
                    </div>
                  </div>
                )}

                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  {t('deal_management.completed_distributions') || 'التوزيعات المكتملة'}
                </h4>

                {(deal.profitDistributions || []).map((distribution) => (
                  <div key={distribution.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">{distribution.description || t('deal_management.profit_distribution')}</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(distribution.distributionDate)} • {t('deal_management.profit_rate')}: {
                          !isNaN(Number(distribution.profitRate))
                            ? Number(distribution.profitRate).toFixed(1)
                            : '0.0'
                        }%
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(Number(distribution.amount))}
                      </p>
                      <div className="flex items-center gap-1">
                        {distribution.status === 'COMPLETED' && <CheckCircle className="w-4 h-4 text-green-600" />}
                        {distribution.status === 'PENDING' && <Clock className="w-4 h-4 text-yellow-600" />}
                        <span className="text-sm text-gray-600">
                          {distribution.status === 'COMPLETED' && t('deal_management.completed')}
                          {distribution.status === 'PENDING' && t('deal_management.under_review')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (deal.profitDistributionRequests || []).length === 0 && (
              <div className="text-center py-8">
                {deal.status === 'COMPLETED' ? (
                  <div>
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">{t('deal_management.completed_deal_no_profits')}</p>
                  </div>
                ) : (
                  <div>
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">{t('deal_management.no_profits_distributed')}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Timeline Management */}
        <DealTimeline
          dealId={deal.id}
          isOwner={true}
        />

        {/* Profit Distribution Form Modal - Only for non-completed deals */}
        {showProfitForm && deal.status !== 'COMPLETED' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">{t('deal_management.new_profit_distribution')}</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowProfitForm(false)}
                  >
                    {t('deal_management.close')}
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Total Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('deal_management.amount_usd')}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={profitForm.totalAmount || ''}
                      onChange={(e) => setProfitForm(prev => ({ ...prev, totalAmount: Number(e.target.value) || 0 }))}
                      placeholder="e.g., 21400"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Estimated Gain % */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('deal_management.estimated_gain_percent')}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={profitForm.estimatedGainPercent || ''}
                      onChange={(e) => setProfitForm(prev => ({ ...prev, estimatedGainPercent: Number(e.target.value) || 0 }))}
                      placeholder="e.g., 7"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Estimated Deal Closing % */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('deal_management.estimated_deal_closing_percent')}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={profitForm.estimatedClosingPercent || ''}
                      onChange={(e) => setProfitForm(prev => ({ ...prev, estimatedClosingPercent: Number(e.target.value) || 0 }))}
                      placeholder="e.g., 100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Distribution Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('deal_management.distribution_type')}</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="distributionType"
                          value="PARTIAL"
                          checked={profitForm.distributionType === 'PARTIAL'}
                          onChange={(e) => setProfitForm(prev => ({ ...prev, distributionType: e.target.value as 'PARTIAL' | 'FINAL' }))}
                          className="mr-2"
                        />
                        {t('deal_management.partial_distribution')}
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="distributionType"
                          value="FINAL"
                          checked={profitForm.distributionType === 'FINAL'}
                          onChange={(e) => setProfitForm(prev => ({ ...prev, distributionType: e.target.value as 'PARTIAL' | 'FINAL' }))}
                          className="mr-2"
                        />
                        {t('deal_management.final_distribution')}
                      </label>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('deal_management.distribution_description')}</label>
                    <input
                      type="text"
                      value={profitForm.description}
                      onChange={(e) => setProfitForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder={t('deal_management.distribution_description_placeholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={() => handleSubmitProfitDistribution(profitForm)}
                      disabled={submitting || !profitForm.totalAmount || !profitForm.estimatedGainPercent || !profitForm.description}
                      className="bg-green-600 hover:bg-green-700 flex-1"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {submitting ? t('deal_management.sending') : t('deal_management.submit_for_admin_review')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowProfitForm(false)}
                      disabled={submitting}
                    >
                      {t('deal_management.cancel')}
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

export default DealManagePage
