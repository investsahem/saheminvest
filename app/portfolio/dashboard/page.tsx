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

  const formatCurrency = (amount: number) => {
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
      <InvestorLayout title="Portfolio Dashboard" subtitle="Track your investment performance">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </InvestorLayout>
    )
  }

  if (!portfolioData) {
    return (
      <InvestorLayout title="Portfolio Dashboard" subtitle="Track your investment performance">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Portfolio Data</h2>
            <p className="text-gray-600 mb-4">Start investing to see your portfolio performance.</p>
            <Button onClick={() => router.push('/deals')}>
              Browse Investment Opportunities
            </Button>
          </CardContent>
        </Card>
      </InvestorLayout>
    )
  }

  const { portfolio, dailyChange, investments, summary } = portfolioData

  return (
    <InvestorLayout title="Portfolio Dashboard" subtitle="Track your investment performance">
      <div className="space-y-6">
        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Portfolio Value */}
          <Card className="lg:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-blue-700">Portfolio Value</p>
                  <p className="text-4xl font-bold text-blue-900">
                    {formatCurrency(portfolio.totalValue)}
                  </p>
                </div>
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                  <PieChart className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                  portfolio.portfolioReturn >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {portfolio.portfolioReturn >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>+{portfolio.portfolioReturn.toFixed(1)}%</span>
                </div>
                
                <div className="text-sm text-blue-700">
                  Total Return: {formatCurrency(portfolio.totalReturns)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Change */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-green-700">Today's Change</p>
                  <p className={`text-2xl font-bold ${
                    dailyChange.isPositive ? 'text-green-900' : 'text-red-900'
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
              
              <div className={`text-sm font-medium ${
                dailyChange.isPositive ? 'text-green-800' : 'text-red-800'
              }`}>
                ({dailyChange.isPositive ? '+' : ''}{dailyChange.percentage.toFixed(2)}%)
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Invested</p>
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
                  <p className="text-sm font-medium text-gray-600">Current Value</p>
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
                  <p className="text-sm font-medium text-gray-600">Total Return</p>
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
                  <p className="text-sm font-medium text-gray-600">Active Investments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {portfolio.activeInvestments}
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
              <h3 className="text-lg font-semibold text-gray-900">My Investments</h3>
              <Button 
                onClick={() => router.push('/deals')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Investment
              </Button>
            </div>

            {investments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Project</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Amount Invested</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Current Value</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Return</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Progress</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments.map((investment) => (
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
                                Invested on {formatDate(investment.investmentDate)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right font-medium">
                          {formatCurrency(investment.investedAmount)}
                        </td>
                        <td className="py-4 px-4 text-right font-medium">
                          {formatCurrency(investment.currentFunding)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className={`font-medium ${
                            investment.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(investment.totalReturn)}
                          </div>
                          <div className={`text-sm ${
                            investment.returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'
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
                              <span className="ml-1 capitalize">{investment.status}</span>
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/deals/${investment.projectId}`)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                            {investment.status === 'active' && (
                              <Button
                                size="sm"
                                onClick={() => router.push(`/deals/${investment.projectId}/invest`)}
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add More
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Investments Yet</h3>
                <p className="text-gray-600 mb-4">Start building your portfolio by investing in exciting projects.</p>
                <Button onClick={() => router.push('/deals')}>
                  Browse Investment Opportunities
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </InvestorLayout>
  )
}
