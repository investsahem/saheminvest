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
  Clock
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

  const navigateToInvestmentDetails = (projectId: string) => {
    router.push(`/portfolio/investments/${projectId}`)
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
          icon: <CheckCircle className="w-4 h-4" />,
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

  // Group investments by projectId and aggregate amounts
  const groupedInvestments = investments.reduce((acc: Record<string, Investment>, investment: Investment) => {
    const projectId = investment.projectId
    
    if (!acc[projectId]) {
      // First investment in this project - use it as base
      acc[projectId] = { ...investment }
    } else {
      // Accumulate amounts for subsequent investments in the same project
      acc[projectId].investedAmount += investment.investedAmount
      acc[projectId].currentFunding += investment.currentFunding
      acc[projectId].totalReturn += investment.totalReturn
      acc[projectId].distributedProfits += investment.distributedProfits
      acc[projectId].unrealizedGains += investment.unrealizedGains
      
      // Recalculate return percentage based on accumulated amounts
      if (acc[projectId].investedAmount > 0) {
        acc[projectId].returnPercentage = (acc[projectId].totalReturn / acc[projectId].investedAmount) * 100
      }
      
      // Keep the earliest investment date (or latest, depending on preference)
      if (new Date(investment.investmentDate) < new Date(acc[projectId].investmentDate)) {
        acc[projectId].investmentDate = investment.investmentDate
      }
    }
    
    return acc
  }, {})

  // Convert grouped investments back to array
  const consolidatedInvestments = Object.values(groupedInvestments)

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
              {consolidatedInvestments.filter(inv => ['active', 'funded'].includes(inv.status)).length}
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
                {consolidatedInvestments.map((investment) => (
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
                          onClick={() => navigateToInvestmentDetails(investment.projectId)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {t('portfolio_investments.actions.view_details')}
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

      </div>
    </InvestorLayout>
  )
}