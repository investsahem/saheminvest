'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import InvestorLayout from '../../components/layout/InvestorLayout'
import { useTranslation } from '../../components/providers/I18nProvider'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Calendar,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

interface Investment {
  id: string
  projectId: string
  projectTitle: string
  category: string
  thumbnailImage?: string
  investedAmount: number
  currentValue: number
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
    totalHistoricalInvested: number
    totalReturns: number
    portfolioReturn: number
    distributedProfits: number
    unrealizedGains: number
    activeInvestments: number
    totalInvestments: number
  }
  dailyChange: {
    amount: number
    percentage: number
    isPositive: boolean
  }
  investments: Investment[]
  summary: {
    bestPerformer: Investment | null
    totalProjects: number
    averageReturn: number
  }
}

export default function InvestorDashboard() {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const router = useRouter()
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user) return

      try {
        // Fetch both portfolio and wallet data
        const [portfolioResponse, walletResponse] = await Promise.all([
          fetch('/api/portfolio/overview'),
          fetch('/api/wallet/balance')
        ])

        if (portfolioResponse.ok) {
          const data = await portfolioResponse.json()
          setPortfolioData(data)
        } else {
          console.error('Failed to fetch portfolio data')
        }

        if (walletResponse.ok) {
          const walletData = await walletResponse.json()
          setWalletBalance(walletData.balance || 0)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session])

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

  if (loading) {
    return (
      <InvestorLayout title={t('investor.portfolio_dashboard')} subtitle={t('investor.track_investment_performance')}>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </InvestorLayout>
    )
  }

  if (!portfolioData) {
    return (
      <InvestorLayout title={t('investor.portfolio_dashboard')} subtitle={t('investor.track_investment_performance')}>
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('investor.no_portfolio_data')}</h2>
            <p className="text-gray-600 mb-4">{t('investor.start_investing_message')}</p>
            <Button onClick={() => router.push('/portfolio/deals')}>
              {t('investor.browse_investment_opportunities')}
            </Button>
          </CardContent>
        </Card>
      </InvestorLayout>
    )
  }

  const { portfolio, dailyChange, investments, summary } = portfolioData

  // Group investments by projectId and aggregate amounts
  const groupedInvestments = investments.reduce((acc: Record<string, Investment>, investment: Investment) => {
    const projectId = investment.projectId

    if (!acc[projectId]) {
      // First investment in this project - use it as base
      acc[projectId] = { ...investment }
    } else {
      // Accumulate amounts for subsequent investments in the same project
      acc[projectId].investedAmount += investment.investedAmount
      acc[projectId].currentValue += investment.currentValue
      acc[projectId].totalReturn += investment.totalReturn
      acc[projectId].distributedProfits += investment.distributedProfits
      acc[projectId].unrealizedGains += investment.unrealizedGains

      // Recalculate return percentage based on accumulated amounts
      if (acc[projectId].investedAmount > 0) {
        acc[projectId].returnPercentage = (acc[projectId].totalReturn / acc[projectId].investedAmount) * 100
      }

      // Keep the earliest investment date
      if (new Date(investment.investmentDate) < new Date(acc[projectId].investmentDate)) {
        acc[projectId].investmentDate = investment.investmentDate
      }
    }

    return acc
  }, {})

  // Convert grouped investments back to array
  const consolidatedInvestments = Object.values(groupedInvestments)

  return (
    <InvestorLayout title={t('investor.portfolio_dashboard')} subtitle={t('investor.track_investment_performance')}>
      <div className="space-y-6">
        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Portfolio Value - Shows Total Wallet (Capital + Profit) */}
          <Card className="lg:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-blue-700">{t('investor.portfolio_value')}</p>
                  <p className="text-4xl font-bold text-blue-900">
                    {formatCurrency(walletBalance)}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {t('investor.includes_capital_and_profits') || 'رأس المال + الأرباح'}
                  </p>
                </div>
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                  <PieChart className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${portfolio.portfolioReturn >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                  {portfolio.portfolioReturn >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>+{portfolio.portfolioReturn.toFixed(1)}%</span>
                </div>

                <div className="text-sm text-blue-700">
                  {t('investor.total_return')}: {formatCurrency(portfolio.totalReturns)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Change */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-green-700">{t('investor.todays_change')}</p>
                  <p className={`text-2xl font-bold ${dailyChange.isPositive ? 'text-green-900' : 'text-red-900'
                    }`}>
                    {dailyChange.isPositive ? '+' : ''}{formatCurrency(dailyChange.amount)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  {dailyChange.isPositive ? (
                    <ArrowUpRight className="w-6 h-6 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-6 h-6 text-red-600" />
                  )}
                </div>
              </div>

              <div className={`text-sm font-medium ${dailyChange.isPositive ? 'text-green-800' : 'text-red-800'
                }`}>
                ({dailyChange.isPositive ? '+' : ''}{dailyChange.percentage.toFixed(2)}%)
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profit Distribution Summary */}
        {portfolio.distributedProfits > 0 && (
          <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700">{t('investor.modal.profits_distributed')}</p>
                  <p className="text-3xl font-bold text-emerald-900">
                    {formatCurrency(portfolio.distributedProfits)}
                  </p>
                  <p className="text-sm text-emerald-600 mt-1">
                    {t('investor.profits_distributed_across').replace('{count}', consolidatedInvestments.length.toString()) || `Profits distributed across ${consolidatedInvestments.length} investments`}
                  </p>
                </div>
                <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Portfolio Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('investor.total_invested')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(portfolio.totalHistoricalInvested || portfolio.totalInvested)}
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
                  <p className="text-sm font-medium text-gray-600">{t('investor.current_value')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(portfolio.totalValue)}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('investor.total_return')}</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(portfolio.totalReturns)}
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
                  <p className="text-sm font-medium text-gray-600">{t('investor.active_investments')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {consolidatedInvestments.filter(inv => ['active', 'funded'].includes(inv.status)).length}
                  </p>
                </div>
                <Target className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Investments */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">{t('investor.my_investments')}</h3>
              <Button
                onClick={() => router.push('/portfolio/deals')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('investor.new_investment')}
              </Button>
            </div>

            {consolidatedInvestments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">{t('investor.project')}</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">{t('investor.amount_invested')}</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">{t('investor.distributed')}</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">{t('investor.current_value')}</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">{t('investor.return')}</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">{t('investor.progress')}</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">{t('investor.table.status')}</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">{t('investor.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consolidatedInvestments.map((investment) => (
                      <tr key={investment.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
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
                              <p className="font-medium text-gray-900">{investment.projectTitle}</p>
                              <p className="text-sm text-gray-500">
                                {t('investor.invested_on')} {formatDate(investment.investmentDate)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right font-medium">
                          {formatCurrency(investment.investedAmount)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="font-medium text-blue-600">
                            {formatCurrency(investment.distributedProfits || 0)}
                          </div>
                          {(investment.distributedProfits || 0) > 0 && (
                            <div className="text-xs text-green-600">
                              {t('common.received') || 'Received'}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right font-medium">
                          {formatCurrency(investment.currentValue)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className={`font-medium ${investment.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {formatCurrency(investment.totalReturn)}
                          </div>
                          <div className={`text-sm ${investment.returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                            ({investment.returnPercentage >= 0 ? '+' : ''}{investment.returnPercentage.toFixed(1)}%)
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${Math.min(investment.progress, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 mt-1">{investment.progress}%</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(investment.status)}`}>
                              {getStatusIcon(investment.status)}
                              <span className="ml-1 capitalize">{t(`investor.status.${investment.status}`) || investment.status}</span>
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/portfolio/deals/${investment.projectId}`)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              {t('investor.view_details')}
                            </Button>
                            {investment.status === 'active' && (
                              <Button
                                size="sm"
                                onClick={() => router.push(`/deals/${investment.projectId}/invest`)}
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                {t('investor.add_more')}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('investor.no_investments_yet')}</h3>
                <p className="text-gray-600 mb-4">{t('investor.start_building_portfolio')}</p>
                <Button onClick={() => router.push('/portfolio/deals')}>
                  {t('investor.browse_investment_opportunities')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </InvestorLayout>
  )
}
