'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import InvestorLayout from '../../components/layout/InvestorLayout'
import { useTranslation, useI18n } from '../../components/providers/I18nProvider'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { 
  LineChart, AreaChart, PieChart, BarChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, Line, Bar
} from 'recharts'
import { 
  TrendingUp, TrendingDown, DollarSign, Target, Award, 
  BarChart3, PieChart as PieIcon, Calendar, Download,
  ArrowUpRight, ArrowDownRight, Activity, Eye, RefreshCw
} from 'lucide-react'

const ReturnsAnalytics = () => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('6M')
  const [viewType, setViewType] = useState<'returns' | 'portfolio' | 'comparison'>('returns')
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch analytics data from API
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/portfolio/analytics?timeframe=${timeframe}`)
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }
      
      const data = await response.json()
      setAnalyticsData(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setError('Failed to load analytics data')
      // Fallback to empty data structure
      setAnalyticsData({
        monthlyReturns: [],
        portfolioGrowth: [],
        sectorPerformance: [],
        riskAnalysis: [],
        performanceMetrics: {
          totalReturns: 0,
          totalInvested: 0,
          averageReturn: 0,
          bestMonth: { month: 'N/A', return: 0 },
          worstMonth: { month: 'N/A', return: 0 },
          volatility: 0,
          sharpeRatio: 0,
          maxDrawdown: 0,
          winRate: 0
        },
        summary: {
          totalInvestments: 0,
          totalInvested: 0,
          totalReturns: 0,
          activeInvestments: 0
        }
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchAnalyticsData()
    }
  }, [session, timeframe])

  const handleRefresh = () => {
    fetchAnalyticsData()
  }

  // Extract data from API response
  const monthlyReturns = analyticsData?.monthlyReturns || []
  const portfolioGrowth = analyticsData?.portfolioGrowth || []
  const sectorPerformance = analyticsData?.sectorPerformance || []
  const riskAnalysis = analyticsData?.riskAnalysis || []
  const performanceMetrics = analyticsData?.performanceMetrics || {
    totalReturns: 0,
    totalInvested: 0,
    averageReturn: 0,
    bestMonth: { month: 'N/A', return: 0 },
    worstMonth: { month: 'N/A', return: 0 },
    volatility: 0,
    sharpeRatio: 0,
    maxDrawdown: 0,
    winRate: 0
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  // Loading state
  if (loading) {
    return (
      <InvestorLayout title={t('investor.returns_analytics')}>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </InvestorLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <InvestorLayout title={t('investor.returns_analytics')}>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">⚠️ {error}</div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </InvestorLayout>
    )
  }

  return (
    <InvestorLayout title={t('investor.returns_analytics')}>
      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">{t('portfolio_analytics.summary.total_returns')}</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(performanceMetrics.totalReturns)}</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className={`w-4 h-4 text-green-600 ${locale === 'ar' ? 'ml-1' : 'mr-1'}`} />
                  <span className="text-sm text-green-600 font-medium">
                    {formatPercentage(performanceMetrics.averageReturn)}
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('portfolio_analytics.summary.sharpe_ratio')}</p>
                <p className="text-2xl font-bold text-gray-900">{performanceMetrics.sharpeRatio}</p>
                <p className="text-sm text-blue-600 mt-2">{t('portfolio_analytics.summary.risk_adjusted_return')}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('portfolio_analytics.summary.win_rate')}</p>
                <p className="text-2xl font-bold text-gray-900">{performanceMetrics.winRate}%</p>
                <p className="text-sm text-purple-600 mt-2">{t('portfolio_analytics.summary.profitable_investments')}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('portfolio_analytics.summary.volatility')}</p>
                <p className="text-2xl font-bold text-gray-900">{performanceMetrics.volatility}%</p>
                <p className="text-sm text-orange-600 mt-2">{t('portfolio_analytics.summary.standard_deviation')}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex gap-2">
              <Button
                variant={viewType === 'returns' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewType('returns')}
              >
                {t('portfolio_analytics.view_toggle.returns_analysis')}
              </Button>
              <Button
                variant={viewType === 'portfolio' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewType('portfolio')}
              >
                {t('portfolio_analytics.view_toggle.portfolio_growth')}
              </Button>
              <Button
                variant={viewType === 'comparison' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewType('comparison')}
              >
                {t('portfolio_analytics.view_toggle.sector_analysis')}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
                {t('portfolio_analytics.actions.export_report')}
              </Button>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Charts */}
      {viewType === 'returns' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Returns Chart */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('portfolio_analytics.charts.monthly_returns')}</h3>
                  <p className="text-sm text-gray-500">{t('portfolio_analytics.charts.monthly_trends')}</p>
                </div>
                <div className={`flex ${locale === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                  {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map((period) => (
                    <Button
                      key={period}
                      variant={timeframe === period ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setTimeframe(period)}
                      className="text-xs"
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyReturns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey="returns" fill="#10B981" name="My Returns" />
                  <Bar dataKey="benchmark" fill="#6B7280" name="Benchmark" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cumulative Returns */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('portfolio_analytics.charts.cumulative_returns')}</h3>
                  <p className="text-sm text-gray-500">{t('portfolio_analytics.charts.total_returns_time')}</p>
                </div>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyReturns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="cumulative" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    name="My Returns"
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="benchmark" 
                    stroke="#6B7280" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Benchmark"
                    dot={{ fill: '#6B7280', strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {viewType === 'portfolio' && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t('portfolio_analytics.charts.portfolio_growth')}</h3>
                <p className="text-sm text-gray-500">{t('portfolio_analytics.charts.portfolio_vs_benchmark')}</p>
              </div>
              <div className={`flex ${locale === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map((period) => (
                  <Button
                    key={period}
                    variant={timeframe === period ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setTimeframe(period)}
                    className="text-xs"
                  >
                    {period}
                  </Button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={portfolioGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="invested" 
                  stackId="1"
                  stroke="#6B7280" 
                  fill="#E5E7EB" 
                  name="Invested Amount"
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stackId="2"
                  stroke="#10B981" 
                  fill="#10B981" 
                  name="Portfolio Value"
                />
                <Line 
                  type="monotone" 
                  dataKey="benchmark" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Benchmark"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {viewType === 'comparison' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sector Performance */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('portfolio_analytics.charts.sector_performance')}</h3>
                  <p className="text-sm text-gray-500">{t('portfolio_analytics.charts.returns_by_sector')}</p>
                </div>
                <PieIcon className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {sectorPerformance.length > 0 ? sectorPerformance.map((sector: any) => (
                  <div key={sector.sector} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: sector.color }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{sector.sector}</p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(sector.invested)} {t('portfolio_analytics.labels.invested')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {formatCurrency(sector.returns)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatPercentage(sector.returnRate)}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-4">📊</div>
                    <p>No sector data available</p>
                    <p className="text-sm">Start investing to see sector performance</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Risk Analysis */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('portfolio_analytics.charts.risk_analysis')}</h3>
                  <p className="text-sm text-gray-500">{t('portfolio_analytics.charts.allocation_by_risk')}</p>
                </div>
              </div>
              {riskAnalysis.length > 0 ? (
                <div className="flex">
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={riskAnalysis}
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          dataKey="allocation"
                          label={({ allocation }) => `${allocation.toFixed(1)}%`}
                        >
                          {riskAnalysis.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className={`w-44 ${locale === 'ar' ? 'mr-2' : 'ml-2'}`}>
                    <div className="space-y-3">
                      {riskAnalysis.map((item: any) => (
                        <div key={item.risk} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div 
                              className={`w-3 h-3 rounded-full ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} 
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm text-gray-600">{item.risk}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {formatPercentage(item.returns)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.allocation.toFixed(1)}% {t('portfolio_analytics.labels.allocation')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">⚖️</div>
                  <p>No risk analysis data available</p>
                  <p className="text-sm">Make investments to see risk distribution</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Metrics */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">{t('portfolio_analytics.performance.title')}</h3>
            <Button variant="outline" size="sm">
              <Eye className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
              {t('portfolio_analytics.actions.detailed_analysis')}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700 mb-1">{t('portfolio_analytics.performance.best_month')}</p>
              <p className="text-lg font-bold text-green-900">
                {formatCurrency(performanceMetrics.bestMonth.return)}
              </p>
              <p className="text-xs text-green-600">{performanceMetrics.bestMonth.month}</p>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-700 mb-1">{t('portfolio_analytics.performance.worst_month')}</p>
              <p className="text-lg font-bold text-red-900">
                {formatCurrency(performanceMetrics.worstMonth.return)}
              </p>
              <p className="text-xs text-red-600">{performanceMetrics.worstMonth.month}</p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 mb-1">{t('portfolio_analytics.performance.max_drawdown')}</p>
              <p className="text-lg font-bold text-blue-900">
                {formatPercentage(performanceMetrics.maxDrawdown)}
              </p>
              <p className="text-xs text-blue-600">{t('portfolio_analytics.performance.largest_decline')}</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-700 mb-1">{t('portfolio_analytics.performance.average_return')}</p>
              <p className="text-lg font-bold text-purple-900">
                {formatPercentage(performanceMetrics.averageReturn)}
              </p>
              <p className="text-xs text-purple-600">{t('portfolio_analytics.performance.annual_equivalent')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </InvestorLayout>
  )
}

export default ReturnsAnalytics