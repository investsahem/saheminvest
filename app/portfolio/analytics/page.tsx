'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
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
  ArrowUpRight, ArrowDownRight, Activity, Eye, RefreshCw,
  Sparkles, Gauge, Clock, ArrowRight, Briefcase
} from 'lucide-react'

interface AnalyticsData {
  monthlyReturns: Array<{
    month: string
    returns: number
    cumulative: number
    benchmark: number
  }>
  portfolioGrowth: Array<{
    month: string
    invested: number
    value: number
    benchmark: number
  }>
  sectorPerformance: Array<{
    sector: string
    invested: number
    returns: number
    returnRate: number
    color: string
  }>
  riskAnalysis: Array<{
    risk: string
    allocation: number
    returns: number
    color: string
    count: number
  }>
  performanceMetrics: {
    totalReturns: number
    totalInvested: number
    averageReturn: number
    bestMonth: { month: string; return: number }
    worstMonth: { month: string; return: number }
    volatility: number
    sharpeRatio: number
    maxDrawdown: number
    winRate: number
  }
  summary: {
    totalInvestments: number
    totalInvested: number
    totalReturns: number
    activeInvestments: number
  }
}

const ReturnsAnalytics = () => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('6M')
  const [viewType, setViewType] = useState<'returns' | 'portfolio' | 'comparison'>('returns')
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Fetch analytics data from API
  const fetchAnalyticsData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
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
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchAnalyticsData()
    }
  }, [session, timeframe])

  const handleRefresh = () => {
    fetchAnalyticsData(true)
  }

  // Memoized data extraction
  const { monthlyReturns, portfolioGrowth, sectorPerformance, riskAnalysis, performanceMetrics, summary } = useMemo(() => ({
    monthlyReturns: analyticsData?.monthlyReturns || [],
    portfolioGrowth: analyticsData?.portfolioGrowth || [],
    sectorPerformance: analyticsData?.sectorPerformance || [],
    riskAnalysis: analyticsData?.riskAnalysis || [],
    performanceMetrics: analyticsData?.performanceMetrics || {
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
    summary: analyticsData?.summary || {
      totalInvestments: 0,
      totalInvested: 0,
      totalReturns: 0,
      activeInvestments: 0
    }
  }), [analyticsData])

  // Investment Health Score calculation
  const healthScore = useMemo(() => {
    if (!analyticsData) return 0
    const { winRate, sharpeRatio, volatility, averageReturn } = performanceMetrics

    // Weighted score calculation
    let score = 0
    score += Math.min(winRate, 100) * 0.3 // 30% weight
    score += Math.min(sharpeRatio * 20, 30) // 30% weight (sharpe of 1.5+ is excellent)
    score += Math.max(0, 20 - volatility) // 20% weight (lower volatility is better)
    score += Math.min(averageReturn * 2, 20) // 20% weight

    return Math.min(Math.max(Math.round(score), 0), 100)
  }, [performanceMetrics, analyticsData])

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

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getHealthScoreLabel = (score: number) => {
    if (score >= 80) return t('portfolio_analytics.health.excellent') || 'Excellent'
    if (score >= 60) return t('portfolio_analytics.health.good') || 'Good'
    if (score >= 40) return t('portfolio_analytics.health.fair') || 'Fair'
    return t('portfolio_analytics.health.needs_attention') || 'Needs Attention'
  }

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-xl">
          <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.name}:</span>
              <span className="font-medium text-gray-900">
                {typeof entry.value === 'number' ? formatCurrency(entry.value) : entry.value}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  // Skeleton Loading Component
  const SkeletonCard = () => (
    <Card className="animate-pulse">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-32 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-20" />
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  )

  // Empty State Component
  const EmptyState = ({ icon: Icon, title, description, action }: {
    icon: any
    title: string
    description: string
    action?: { label: string; href: string }
  }) => (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 mb-4">
        <Icon className="w-8 h-8 text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4 max-w-sm mx-auto">{description}</p>
      {action && (
        <Link href={action.href}>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            {action.label}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      )}
    </div>
  )

  // Loading state with skeletons
  if (loading) {
    return (
      <InvestorLayout title={t('investor.returns_analytics')}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <Card className="animate-pulse mb-6">
          <CardContent className="p-6">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4" />
            <div className="h-80 bg-gray-200 rounded" />
          </CardContent>
        </Card>
      </InvestorLayout>
    )
  }

  // Error state
  if (error && !analyticsData) {
    return (
      <InvestorLayout title={t('investor.returns_analytics')}>
        <EmptyState
          icon={Activity}
          title={t('portfolio_analytics.error.title') || 'Unable to Load Analytics'}
          description={t('portfolio_analytics.error.description') || 'Something went wrong while fetching your analytics data. Please try again.'}
          action={{ label: t('common.try_again') || 'Try Again', href: '/portfolio/analytics' }}
        />
      </InvestorLayout>
    )
  }

  // Check if user has no data
  const hasNoData = summary.totalInvestments === 0

  return (
    <InvestorLayout title={t('investor.returns_analytics')}>
      {/* Investment Health Score & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {/* Health Score Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-white/80">
                {t('portfolio_analytics.health.score') || 'Portfolio Health'}
              </p>
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-white">{healthScore}</span>
              <span className="text-lg text-white/70 mb-1">/100</span>
            </div>
            <p className="text-sm text-white/80 mt-2">
              {getHealthScoreLabel(healthScore)}
            </p>
          </CardContent>
        </Card>

        {/* Total Returns Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">
                  {t('portfolio_analytics.summary.total_returns')}
                </p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {formatCurrency(performanceMetrics.totalReturns)}
                </p>
                <div className="flex items-center mt-2">
                  {performanceMetrics.averageReturn >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${performanceMetrics.averageReturn >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
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

        {/* Sharpe Ratio */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t('portfolio_analytics.summary.sharpe_ratio')}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {performanceMetrics.sharpeRatio.toFixed(2)}
                </p>
                <p className="text-sm text-blue-600 mt-2">
                  {t('portfolio_analytics.summary.risk_adjusted_return')}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Win Rate */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t('portfolio_analytics.summary.win_rate')}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {performanceMetrics.winRate.toFixed(1)}%
                </p>
                <p className="text-sm text-purple-600 mt-2">
                  {t('portfolio_analytics.summary.profitable_investments')}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Volatility */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t('portfolio_analytics.summary.volatility')}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {performanceMetrics.volatility.toFixed(1)}%
                </p>
                <p className="text-sm text-orange-600 mt-2">
                  {t('portfolio_analytics.summary.standard_deviation')}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Summary Row */}
      <Card className="mb-6 bg-gradient-to-r from-gray-50 to-slate-50">
        <CardContent className="p-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {t('portfolio_analytics.quick_stats.total_investments') || 'Total Investments'}:
                </span>
                <span className="font-semibold text-gray-900">{summary.totalInvestments}</span>
              </div>
              <div className="hidden md:block h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {t('portfolio_analytics.quick_stats.total_invested') || 'Total Invested'}:
                </span>
                <span className="font-semibold text-gray-900">{formatCurrency(summary.totalInvested)}</span>
              </div>
              <div className="hidden md:block h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {t('portfolio_analytics.quick_stats.active') || 'Active'}:
                </span>
                <span className="font-semibold text-green-600">{summary.activeInvestments}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="text-gray-600"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="outline" size="sm" className="text-gray-600">
                <Download className="w-4 h-4 mr-2" />
                {t('portfolio_analytics.actions.export_report')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={viewType === 'returns' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewType('returns')}
                className={viewType === 'returns' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : ''}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                {t('portfolio_analytics.view_toggle.returns_analysis')}
              </Button>
              <Button
                variant={viewType === 'portfolio' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewType('portfolio')}
                className={viewType === 'portfolio' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : ''}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                {t('portfolio_analytics.view_toggle.portfolio_growth')}
              </Button>
              <Button
                variant={viewType === 'comparison' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewType('comparison')}
                className={viewType === 'comparison' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : ''}
              >
                <PieIcon className="w-4 h-4 mr-2" />
                {t('portfolio_analytics.view_toggle.sector_analysis')}
              </Button>
            </div>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map((period) => (
                <Button
                  key={period}
                  variant={timeframe === period ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setTimeframe(period)}
                  className={`text-xs px-3 ${timeframe === period
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 border-0'
                    }`}
                >
                  {period}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Check for empty data */}
      {hasNoData ? (
        <EmptyState
          icon={BarChart3}
          title={t('portfolio_analytics.empty.title') || 'No Analytics Data Yet'}
          description={t('portfolio_analytics.empty.description') || 'Start investing to see your portfolio analytics and performance metrics here.'}
          action={{
            label: t('portfolio_analytics.empty.browse_deals') || 'Browse Deals',
            href: '/portfolio/deals'
          }}
        />
      ) : (
        <>
          {/* Main Charts */}
          {viewType === 'returns' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Monthly Returns Chart */}
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {t('portfolio_analytics.charts.monthly_returns')}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {t('portfolio_analytics.charts.monthly_trends')}
                      </p>
                    </div>
                    <BarChart3 className="w-5 h-5 text-gray-400" />
                  </div>
                  {monthlyReturns.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlyReturns}>
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                            <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="returns" fill="url(#barGradient)" name={t('portfolio_analytics.labels.my_returns') || "My Returns"} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="benchmark" fill="#9CA3AF" name={t('portfolio_analytics.labels.benchmark') || "Benchmark"} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <EmptyState
                        icon={BarChart3}
                        title={t('portfolio_analytics.no_data.monthly') || 'No Monthly Data'}
                        description={t('portfolio_analytics.no_data.monthly_desc') || 'Returns data will appear here once you have investments.'}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Cumulative Returns */}
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {t('portfolio_analytics.charts.cumulative_returns')}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {t('portfolio_analytics.charts.total_returns_time')}
                      </p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-gray-400" />
                  </div>
                  {monthlyReturns.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={monthlyReturns}>
                        <defs>
                          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="cumulative"
                          stroke="#10B981"
                          strokeWidth={3}
                          fill="url(#areaGradient)"
                          name={t('portfolio_analytics.labels.my_returns') || "My Returns"}
                        />
                        <Line
                          type="monotone"
                          dataKey="benchmark"
                          stroke="#6B7280"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          name={t('portfolio_analytics.labels.benchmark') || "Benchmark"}
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <EmptyState
                        icon={TrendingUp}
                        title={t('portfolio_analytics.no_data.cumulative') || 'No Cumulative Data'}
                        description={t('portfolio_analytics.no_data.cumulative_desc') || 'Track your returns growth over time.'}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {viewType === 'portfolio' && (
            <Card className="mb-8 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t('portfolio_analytics.charts.portfolio_growth')}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {t('portfolio_analytics.charts.portfolio_vs_benchmark')}
                    </p>
                  </div>
                </div>
                {portfolioGrowth.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={portfolioGrowth}>
                      <defs>
                        <linearGradient id="investedGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6B7280" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#6B7280" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="#10B981" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="invested"
                        stroke="#6B7280"
                        fill="url(#investedGradient)"
                        name={t('portfolio_analytics.labels.invested_amount') || "Invested Amount"}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#10B981"
                        strokeWidth={2}
                        fill="url(#valueGradient)"
                        name={t('portfolio_analytics.labels.portfolio_value') || "Portfolio Value"}
                      />
                      <Line
                        type="monotone"
                        dataKey="benchmark"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name={t('portfolio_analytics.labels.benchmark') || "Benchmark"}
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState
                    icon={TrendingUp}
                    title={t('portfolio_analytics.no_data.portfolio') || 'No Portfolio Growth Data'}
                    description={t('portfolio_analytics.no_data.portfolio_desc') || 'Start investing to track your portfolio growth.'}
                    action={{ label: t('portfolio_analytics.empty.browse_deals') || 'Browse Deals', href: '/portfolio/deals' }}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {viewType === 'comparison' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Sector Performance */}
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {t('portfolio_analytics.charts.sector_performance')}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {t('portfolio_analytics.charts.returns_by_sector')}
                      </p>
                    </div>
                    <PieIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="space-y-4">
                    {sectorPerformance.length > 0 ? sectorPerformance.map((sector: any) => (
                      <div key={sector.sector} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full shadow-sm"
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
                      <EmptyState
                        icon={PieIcon}
                        title={t('portfolio_analytics.no_data.sector') || 'No Sector Data'}
                        description={t('portfolio_analytics.no_data.sector_desc') || 'Invest in different sectors to see performance comparison.'}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Risk Analysis */}
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {t('portfolio_analytics.charts.risk_analysis')}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {t('portfolio_analytics.charts.allocation_by_risk')}
                      </p>
                    </div>
                    <Gauge className="w-5 h-5 text-gray-400" />
                  </div>
                  {riskAnalysis.length > 0 ? (
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="flex-1">
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={riskAnalysis}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
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
                      <div className="w-full md:w-48 space-y-3">
                        {riskAnalysis.map((item: any) => (
                          <div key={item.risk} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-sm text-gray-700">{item.risk}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {formatPercentage(item.returns)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <EmptyState
                      icon={Gauge}
                      title={t('portfolio_analytics.no_data.risk') || 'No Risk Data'}
                      description={t('portfolio_analytics.no_data.risk_desc') || 'Diversify your investments to see risk analysis.'}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Performance Metrics */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('portfolio_analytics.performance.title')}
                </h3>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  {t('portfolio_analytics.actions.detailed_analysis')}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <p className="text-sm text-green-700 mb-1">
                    {t('portfolio_analytics.performance.best_month')}
                  </p>
                  <p className="text-xl font-bold text-green-900">
                    {formatCurrency(performanceMetrics.bestMonth.return)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">{performanceMetrics.bestMonth.month}</p>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-100">
                  <p className="text-sm text-red-700 mb-1">
                    {t('portfolio_analytics.performance.worst_month')}
                  </p>
                  <p className="text-xl font-bold text-red-900">
                    {formatCurrency(performanceMetrics.worstMonth.return)}
                  </p>
                  <p className="text-xs text-red-600 mt-1">{performanceMetrics.worstMonth.month}</p>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <p className="text-sm text-blue-700 mb-1">
                    {t('portfolio_analytics.performance.max_drawdown')}
                  </p>
                  <p className="text-xl font-bold text-blue-900">
                    {formatPercentage(performanceMetrics.maxDrawdown)}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {t('portfolio_analytics.performance.largest_decline')}
                  </p>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100">
                  <p className="text-sm text-purple-700 mb-1">
                    {t('portfolio_analytics.performance.average_return')}
                  </p>
                  <p className="text-xl font-bold text-purple-900">
                    {formatPercentage(performanceMetrics.averageReturn)}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    {t('portfolio_analytics.performance.annual_equivalent')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </InvestorLayout>
  )
}

export default ReturnsAnalytics