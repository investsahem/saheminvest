'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { useTranslation } from '../../../components/providers/I18nProvider'
import InvestorLayout from '../../../components/layout/InvestorLayout'
import { Button } from '../../../components/ui/Button'
import { Card, CardContent } from '../../../components/ui/Card'
import { 
  ArrowLeft,
  Target, 
  DollarSign,
  TrendingUp,
  Clock,
  Coins,
  CheckCircle,
  Activity,
  AlertCircle,
  History
} from 'lucide-react'

interface ProfitTransaction {
  id: string
  amount: number
  description: string
  status: string
  method: string
  reference: string
  createdAt: string
  updatedAt: string
}

interface InvestmentDetails {
  id: string
  investedAmount: number
  currentValue: number
  totalReturn: number
  returnPercentage: number
  distributedProfits: number
  pendingProfits: number
  unrealizedGains: number
  progress: number
  status: string
  lifecycleStage: string
  investmentDate: string
  project: {
    id: string
    title: string
    description: string
    category: string
    status: string
    thumbnailImage?: string
    images: string[]
    fundingGoal: number
    currentFunding: number
    expectedReturn: number
    duration: number
    endDate?: string
    createdAt: string
    updatedAt: string
    partner: {
      id: string
      companyName?: string
      name: string
    } | null
  }
  investor: {
    id: string
    name: string
    email: string
  }
  profitHistory: ProfitTransaction[]
  pendingProfitDistributions: ProfitTransaction[]
  investmentCount?: number
  investmentDates?: string[]
}

export default function InvestmentDetailsPage() {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const projectId = params.projectId as string

  const [investmentDetails, setInvestmentDetails] = useState<InvestmentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInvestmentDetails = async () => {
      if (!session?.user || !projectId) return

      try {
        setLoading(true)
        const response = await fetch(`/api/investments/project/${projectId}/details`)
        if (response.ok) {
          const details = await response.json()
          setInvestmentDetails(details)
        } else {
          setError('Failed to fetch investment details')
        }
      } catch (error) {
        console.error('Error fetching investment details:', error)
        setError('Error loading investment details')
      } finally {
        setLoading(false)
      }
    }

    fetchInvestmentDetails()
  }, [session, projectId])

  const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return '$0.00'
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString))
  }

  const getLifecycleStageInfo = (stage: string) => {
    switch (stage) {
      case 'ACTIVE':
        return {
          label: t('portfolio_investments.lifecycle_stages.investment_active'),
          color: 'bg-blue-100 text-blue-800',
          icon: <Activity className="w-4 h-4" />,
          description: t('portfolio_investments.lifecycle_stages.investment_active_desc')
        }
      case 'PROFITS_PENDING':
        return {
          label: t('portfolio_investments.lifecycle_stages.profits_pending'),
          color: 'bg-yellow-100 text-yellow-800',
          icon: <Clock className="w-4 h-4" />,
          description: t('portfolio_investments.lifecycle_stages.profits_pending_desc')
        }
      case 'PROFITS_DISTRIBUTED':
        return {
          label: t('portfolio_investments.lifecycle_stages.profits_distributed'),
          color: 'bg-green-100 text-green-800',
          icon: <Coins className="w-4 h-4" />,
          description: t('portfolio_investments.lifecycle_stages.profits_distributed_desc')
        }
      case 'COMPLETED_WITH_PROFITS':
        return {
          label: t('portfolio_investments.lifecycle_stages.investment_completed'),
          color: 'bg-emerald-100 text-emerald-800',
          icon: <CheckCircle className="w-4 h-4" />,
          description: t('portfolio_investments.lifecycle_stages.investment_completed_desc')
        }
      case 'COMPLETED':
        return {
          label: t('portfolio_investments.lifecycle_stages.investment_completed'),
          color: 'bg-gray-100 text-gray-800',
          icon: <CheckCircle className="w-4 h-4" />,
          description: t('portfolio_investments.lifecycle_stages.investment_completed_no_profits_desc')
        }
      default:
        return {
          label: t('portfolio_investments.lifecycle_stages.unknown_status'),
          color: 'bg-gray-100 text-gray-800',
          icon: <AlertCircle className="w-4 h-4" />,
          description: t('portfolio_investments.lifecycle_stages.status_unknown')
        }
    }
  }

  if (loading) {
    return (
      <InvestorLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </InvestorLayout>
    )
  }

  if (error || !investmentDetails) {
    return (
      <InvestorLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {t('portfolio_investments.details_page.error_title')}
          </h2>
          <p className="text-gray-600 mb-6">
            {error || t('portfolio_investments.details_page.error_message')}
          </p>
          <Button onClick={() => router.push('/portfolio/investments')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('portfolio_investments.details_page.back_to_investments')}
          </Button>
        </div>
      </InvestorLayout>
    )
  }

  return (
    <InvestorLayout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/portfolio/investments')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('portfolio_investments.details_page.back_to_investments')}
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('portfolio_investments.modal.investment_details')}
            </h1>
          </div>
        </div>

        {/* Project Information */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start space-x-4 mb-4">
              {investmentDetails.project.thumbnailImage ? (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                  <Image
                    src={investmentDetails.project.thumbnailImage}
                    alt={investmentDetails.project.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Target className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">{investmentDetails.project.title}</h3>
                <p className="text-gray-600">{investmentDetails.project.category}</p>
                <p className="text-sm text-gray-500">
                  {t('portfolio_investments.modal.partner')}: {investmentDetails.project.partner?.companyName || investmentDetails.project.partner?.name || t('portfolio_investments.modal.unknown_partner')}
                </p>
              </div>
              <div className="text-right">
                {(() => {
                  const stageInfo = getLifecycleStageInfo(investmentDetails.lifecycleStage)
                  return (
                    <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${stageInfo.color}`}>
                      {stageInfo.icon}
                      <span className="ml-1">{stageInfo.label}</span>
                    </span>
                  )
                })()}
              </div>
            </div>
            <p className="text-gray-700">{investmentDetails.project.description}</p>
          </CardContent>
        </Card>

        {/* Investment Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('portfolio_investments.modal.invested_amount')}</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(investmentDetails.investedAmount)}
                  </p>
                  {investmentDetails.investmentCount && investmentDetails.investmentCount > 1 && (
                    <p className="text-xs text-gray-500">
                      {investmentDetails.investmentCount} investments combined
                    </p>
                  )}
                </div>
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('portfolio_investments.modal.current_value')}</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(investmentDetails.currentValue)}
                  </p>
                </div>
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('portfolio_investments.modal.distributed_profits')}</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(investmentDetails.distributedProfits)}
                  </p>
                </div>
                <Coins className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('portfolio_investments.modal.pending_profits')}</p>
                  <p className="text-lg font-bold text-yellow-600">
                    {formatCurrency(investmentDetails.pendingProfits)}
                  </p>
                </div>
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Investment Progress */}
        <Card>
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('portfolio_investments.modal.investment_progress')}</h4>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">{t('portfolio_investments.modal.project_progress')}</span>
                <span className="text-sm text-gray-600">{investmentDetails.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full"
                  style={{ width: `${Math.min(investmentDetails.progress, 100)}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">{t('portfolio_investments.modal.investment_date')}</p>
                <p className="font-medium">{formatDate(investmentDetails.investmentDate)}</p>
              </div>
              <div>
                <p className="text-gray-600">{t('portfolio_investments.modal.expected_return')}</p>
                <p className="font-medium">{investmentDetails.project.expectedReturn}%</p>
              </div>
              <div>
                <p className="text-gray-600">{t('portfolio_investments.modal.duration')}</p>
                <p className="font-medium">{investmentDetails.project.duration} {t('portfolio_investments.modal.months')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profit Distribution History */}
        {investmentDetails.profitHistory.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <History className="w-5 h-5 mr-2" />
                {t('portfolio_investments.modal.profit_distribution_history')}
              </h4>
              <div className="space-y-3">
                {investmentDetails.profitHistory.map((profit) => (
                  <div key={profit.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">{formatCurrency(profit.amount)}</p>
                      <p className="text-sm text-green-600">{profit.description}</p>
                      <p className="text-xs text-gray-500">{formatDate(profit.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {t('portfolio_investments.modal.distributed')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Profit Distributions */}
        {investmentDetails.pendingProfitDistributions.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                {t('portfolio_investments.modal.pending_profit_distributions')}
              </h4>
              <div className="space-y-3">
                {investmentDetails.pendingProfitDistributions.map((profit) => (
                  <div key={profit.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium text-yellow-800">{formatCurrency(profit.amount)}</p>
                      <p className="text-sm text-yellow-600">{profit.description}</p>
                      <p className="text-xs text-gray-500">{formatDate(profit.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        {t('portfolio_investments.modal.awaiting_admin')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lifecycle Stage Information */}
        <Card>
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('portfolio_investments.modal.investment_lifecycle')}</h4>
            {(() => {
              const stageInfo = getLifecycleStageInfo(investmentDetails.lifecycleStage)
              return (
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-full ${stageInfo.color}`}>
                    {stageInfo.icon}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{stageInfo.label}</p>
                    <p className="text-sm text-gray-600">{stageInfo.description}</p>
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>
      </div>
    </InvestorLayout>
  )
}
