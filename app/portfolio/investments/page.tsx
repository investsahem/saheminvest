'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useTranslation } from '../../components/providers/I18nProvider'
import InvestorLayout from '../../components/layout/InvestorLayout'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { 
  Eye, 
  Plus, 
  Target, 
  AlertCircle,
  Activity,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Calendar,
  X,
  History,
  Coins
} from 'lucide-react'

interface Investment {
  id: string
  projectId: string
  projectTitle: string
  category: string
  thumbnailImage?: string
  investedAmount: number
  currentFunding: number
  totalReturn: number
  returnPercentage: number
  distributedProfits: number
  unrealizedGains: number
  progress: number
  status: string
  investmentDate: string
  duration: number
  expectedReturn: number
  endDate?: string
}

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
    }
  }
  investor: {
    id: string
    name: string
    email: string
  }
  profitHistory: ProfitTransaction[]
  pendingProfitDistributions: ProfitTransaction[]
}

interface PortfolioData {
  portfolio: {
    totalValue: number
    totalInvested: number
    totalReturns: number
    portfolioReturn: number
    distributedProfits: number
    unrealizedGains: number
    activeInvestments: number
    totalInvestments: number
  }
  investments: Investment[]
}

export default function InvestmentsPage() {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const router = useRouter()
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedInvestment, setSelectedInvestment] = useState<InvestmentDetails | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    const fetchPortfolioData = async () => {
      if (!session?.user) return

      try {
        const response = await fetch('/api/portfolio/overview')
        if (response.ok) {
          const data = await response.json()
          setPortfolioData(data)
        } else {
          console.error('Failed to fetch portfolio data')
        }
      } catch (error) {
        console.error('Error fetching portfolio data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPortfolioData()
  }, [session])

  const fetchInvestmentDetails = async (investmentId: string) => {
    setDetailsLoading(true)
    try {
      const response = await fetch(`/api/investments/${investmentId}/details`)
      if (response.ok) {
        const details = await response.json()
        setSelectedInvestment(details)
        setShowDetailsModal(true)
      } else {
        console.error('Failed to fetch investment details')
      }
    } catch (error) {
      console.error('Error fetching investment details:', error)
    } finally {
      setDetailsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    // Handle NaN, null, undefined values
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Activity className="w-4 h-4 text-blue-600" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'funded':
        return <Target className="w-4 h-4 text-purple-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'funded':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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

  if (!portfolioData || portfolioData.investments.length === 0) {
    return (
      <InvestorLayout>
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">{t('portfolio_investments.empty_state.title')}</h2>
          <p className="text-gray-600 mb-6">{t('portfolio_investments.empty_state.description')}</p>
          <Button onClick={() => router.push('/deals')}>
            {t('portfolio_investments.empty_state.cta')}
          </Button>
        </div>
      </InvestorLayout>
    )
  }

  const { portfolio, investments } = portfolioData

  return (
    <InvestorLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{t('portfolio_investments.title')}</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">{t('portfolio_investments.summary_cards.total_invested')}</div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(portfolio.totalInvested)}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">{t('portfolio_investments.summary_cards.current_value')}</div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(portfolio.totalValue)}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">{t('portfolio_investments.summary_cards.total_return')}</div>
            <div className={`text-2xl font-bold ${portfolio.totalReturns >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(portfolio.totalReturns)}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">{t('portfolio_investments.summary_cards.active_investments')}</div>
            <div className="text-2xl font-bold text-gray-900">
              {portfolio.activeInvestments}
            </div>
          </div>
        </div>

        {/* Investments List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('portfolio_investments.table.project')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('portfolio_investments.table.amount_invested')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('portfolio_investments.table.current_value')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('portfolio_investments.table.return')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('portfolio_investments.table.progress')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('portfolio_investments.table.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('portfolio_investments.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {investments.map((investment) => (
                  <tr key={investment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        {investment.thumbnailImage ? (
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                            <Image
                              src={investment.thumbnailImage}
                              alt={investment.projectTitle}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Target className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {investment.projectTitle}
                          </div>
                          <div className="text-sm text-gray-500">
                            {t('portfolio_investments.table.invested_on')} {formatDate(investment.investmentDate)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatCurrency(investment.investedAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatCurrency(investment.currentFunding)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className={investment.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}>
                        <div className="font-medium">{formatCurrency(investment.totalReturn)}</div>
                        <div className="text-xs">
                          ({investment.returnPercentage >= 0 ? '+' : ''}{investment.returnPercentage.toFixed(1)}%)
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(investment.progress, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{investment.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(investment.status)}`}>
                        {getStatusIcon(investment.status)}
                        <span className="ml-1 capitalize">{t(`portfolio_investments.status.${investment.status}`) || investment.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchInvestmentDetails(investment.id)}
                          disabled={detailsLoading}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {detailsLoading ? t('portfolio_investments.actions.loading') : t('portfolio_investments.actions.view_details')}
                        </Button>
                        {investment.status === 'active' && (
                          <Button
                            size="sm"
                            onClick={() => router.push(`/deals/${investment.projectId}/invest`)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            {t('portfolio_investments.actions.add_more')}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Investment Details Modal */}
        {showDetailsModal && selectedInvestment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{t('portfolio_investments.modal.investment_details')}</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Project Information */}
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4 mb-4">
                      {selectedInvestment.project.thumbnailImage ? (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                          <Image
                            src={selectedInvestment.project.thumbnailImage}
                            alt={selectedInvestment.project.title}
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
                        <h3 className="text-xl font-semibold text-gray-900">{selectedInvestment.project.title}</h3>
                        <p className="text-gray-600">{selectedInvestment.project.category}</p>
                        <p className="text-sm text-gray-500">
                          {t('portfolio_investments.modal.partner')}: {selectedInvestment.project.partner.companyName || selectedInvestment.project.partner.name}
                        </p>
                      </div>
                      <div className="text-right">
                        {(() => {
                          const stageInfo = getLifecycleStageInfo(selectedInvestment.lifecycleStage)
                          return (
                            <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${stageInfo.color}`}>
                              {stageInfo.icon}
                              <span className="ml-1">{stageInfo.label}</span>
                            </span>
                          )
                        })()}
                      </div>
                    </div>
                    <p className="text-gray-700">{selectedInvestment.project.description}</p>
                  </CardContent>
                </Card>

                {/* Investment Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{t('portfolio_investments.modal.invested_amount')}</p>
                          <p className="text-lg font-bold text-gray-900">
                            {formatCurrency(selectedInvestment.investedAmount)}
                          </p>
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
                            {formatCurrency(selectedInvestment.currentValue)}
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
                            {formatCurrency(selectedInvestment.distributedProfits)}
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
                            {formatCurrency(selectedInvestment.pendingProfits)}
                          </p>
                        </div>
                        <Clock className="w-6 h-6 text-yellow-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Investment Progress */}
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('portfolio_investments.modal.investment_progress')}</h4>
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">{t('portfolio_investments.modal.project_progress')}</span>
                        <span className="text-sm text-gray-600">{selectedInvestment.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full"
                          style={{ width: `${Math.min(selectedInvestment.progress, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">{t('portfolio_investments.modal.investment_date')}</p>
                        <p className="font-medium">{formatDate(selectedInvestment.investmentDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">{t('portfolio_investments.modal.expected_return')}</p>
                        <p className="font-medium">{selectedInvestment.project.expectedReturn}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">{t('portfolio_investments.modal.duration')}</p>
                        <p className="font-medium">{selectedInvestment.project.duration} {t('portfolio_investments.modal.months')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Profit Distribution History */}
                {selectedInvestment.profitHistory.length > 0 && (
                  <Card className="mb-6">
                    <CardContent className="p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <History className="w-5 h-5 mr-2" />
                        {t('portfolio_investments.modal.profit_distribution_history')}
                      </h4>
                      <div className="space-y-3">
                        {selectedInvestment.profitHistory.map((profit) => (
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
                {selectedInvestment.pendingProfitDistributions.length > 0 && (
                  <Card className="mb-6">
                    <CardContent className="p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Clock className="w-5 h-5 mr-2" />
                        {t('portfolio_investments.modal.pending_profit_distributions')}
                      </h4>
                      <div className="space-y-3">
                        {selectedInvestment.pendingProfitDistributions.map((profit) => (
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
                      const stageInfo = getLifecycleStageInfo(selectedInvestment.lifecycleStage)
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
            </div>
          </div>
        )}
      </div>
    </InvestorLayout>
  )
}