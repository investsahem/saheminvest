'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslation } from '../../components/providers/I18nProvider'
import PartnerLayout from '../../components/layout/PartnerLayout'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { 
  TrendingUp, TrendingDown, Target, Award, Activity, Calendar, 
  BarChart3, PieChart as PieIcon, DollarSign, Percent, Users, 
  Building2, CheckCircle, Clock, AlertCircle, ArrowUpRight, 
  ArrowDownRight, Star, Trophy, Zap, Timer
} from 'lucide-react'
import { formatPercentage, formatCurrency, formatNumber, formatRawPercentage } from '../utils/formatters'

const PartnerPerformancePage = () => {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const [timeRange, setTimeRange] = useState('6months')
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<any>(null)

  // Fetch real analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/partner/analytics?timeRange=${timeRange}`)
        if (response.ok) {
          const data = await response.json()
          setAnalyticsData(data)
        } else {
          console.error('Failed to fetch analytics data')
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchAnalytics()
    }
  }, [timeRange, session])

  // Calculate performance metrics from real data
  const performanceMetrics = analyticsData ? {
    totalDeals: analyticsData.metrics.totalDeals,
    successfulDeals: analyticsData.metrics.completedDeals,
    totalValue: analyticsData.metrics.totalValue,
    totalReturns: analyticsData.metrics.totalRaised * (analyticsData.metrics.averageReturn / 100),
    averageReturn: analyticsData.metrics.averageReturn,
    successRate: analyticsData.metrics.successRate,
    averageDealSize: analyticsData.metrics.totalDeals > 0 ? analyticsData.metrics.totalValue / analyticsData.metrics.totalDeals : 0,
    averageCompletionTime: analyticsData.metrics.averageDuration,
    totalInvestors: analyticsData.metrics.totalInvestors,
    repeatInvestors: analyticsData.metrics.repeatInvestors,
    investorSatisfaction: 4.8, // This would come from reviews in real implementation
    timeToFunding: 12.3 // This would be calculated from deal creation to funding dates
  } : {
    totalDeals: 0,
    successfulDeals: 0,
    totalValue: 0,
    totalReturns: 0,
    averageReturn: 0,
    successRate: 0,
    averageDealSize: 0,
    averageCompletionTime: 0,
    totalInvestors: 0,
    repeatInvestors: 0,
    investorSatisfaction: 0,
    timeToFunding: 0
  }


  if (loading) {
    return (
      <PartnerLayout
        title={t('partner_performance.title')}
        subtitle={t('partner_performance.subtitle')}
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PartnerLayout>
    )
  }

  return (
    <PartnerLayout
      title={t('partner_performance.title')}
      subtitle={t('partner_performance.subtitle')}
    >
      <div className="space-y-6">
        {/* Time Range Selector */}
        <div className="flex justify-end">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { value: '1month', label: t('partner_performance.time_ranges.1month') },
              { value: '3months', label: t('partner_performance.time_ranges.3months') },
              { value: '6months', label: t('partner_performance.time_ranges.6months') },
              { value: '1year', label: t('partner_performance.time_ranges.1year') }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  timeRange === option.value
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">{t('partner_performance.metrics.success_rate')}</p>
                  <p className="text-2xl font-bold text-blue-900">{formatRawPercentage(performanceMetrics.successRate)}%</p>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +2.3% {t('partner_performance.metrics.from_last_period')}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">{t('partner_performance.metrics.avg_return')}</p>
                  <p className="text-2xl font-bold text-green-900">{formatRawPercentage(performanceMetrics.averageReturn)}%</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +0.8% {t('partner_performance.metrics.from_last_period')}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Percent className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">{t('partner_performance.metrics.satisfaction')}</p>
                  <p className="text-2xl font-bold text-purple-900">{formatRawPercentage(performanceMetrics.investorSatisfaction)}{t('partner_performance.units.rating')}</p>
                  <p className="text-xs text-purple-600 flex items-center mt-1">
                    <Star className="w-3 h-3 mr-1" />
                    {t('partner_performance.metrics.excellent_rating')}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">{t('partner_performance.metrics.time_to_fund')}</p>
                  <p className="text-2xl font-bold text-orange-900">{formatRawPercentage(performanceMetrics.timeToFunding)}{t('partner_performance.units.days')}</p>
                  <p className="text-xs text-orange-600 flex items-center mt-1">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    -2.1 {t('partner_performance.metrics.days_improved')}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Timer className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Summary */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('partner_performance.sections.performance_summary')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{performanceMetrics.totalDeals}</div>
                <div className="text-sm text-gray-600">{t('partner_performance.metrics.total_deals')}</div>
                <div className="text-xs text-green-600 mt-1">
                  {performanceMetrics.successfulDeals} {t('partner_performance.metrics.successful')}
                </div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(performanceMetrics.totalValue)}</div>
                <div className="text-sm text-gray-600">{t('partner_performance.metrics.total_value')}</div>
                <div className="text-xs text-green-600 mt-1">
                  {formatPercentage(performanceMetrics.totalReturns, performanceMetrics.totalValue)}% {t('partner_performance.metrics.roi')}
                </div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(performanceMetrics.totalInvestors)}</div>
                <div className="text-sm text-gray-600">{t('partner_performance.metrics.total_investors')}</div>
                <div className="text-xs text-green-600 mt-1">
                  {formatPercentage(performanceMetrics.repeatInvestors, performanceMetrics.totalInvestors, 0)}% {t('partner_performance.metrics.repeat_rate')}
                </div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{formatRawPercentage(performanceMetrics.averageCompletionTime)}</div>
                <div className="text-sm text-gray-600">{t('partner_performance.metrics.avg_completion')}</div>
                <div className="text-xs text-green-600 mt-1">
                  2.3 {t('partner_performance.units.months')} {t('partner_performance.metrics.faster_than_industry')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Rankings */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">{t('partner_performance.sections.performance_rankings')}</h3>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-yellow-600">{t('partner_performance.sections.top_overall')}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { category: t('partner_performance.rankings.deal_success_rate'), rank: 3, total: 50, percentile: 94 },
                { category: t('partner_performance.rankings.average_returns'), rank: 7, total: 50, percentile: 86 },
                { category: t('partner_performance.rankings.investor_satisfaction'), rank: 2, total: 50, percentile: 96 },
                { category: t('partner_performance.rankings.time_to_funding'), rank: 5, total: 50, percentile: 90 },
                { category: t('partner_performance.rankings.deal_volume'), rank: 12, total: 50, percentile: 76 }
              ].map((ranking) => {
                const getRankColor = (rank: number, total: number) => {
                  const percentile = ((total - rank) / total) * 100
                  if (percentile >= 90) return 'text-green-600 bg-green-100'
                  if (percentile >= 70) return 'text-blue-600 bg-blue-100'
                  if (percentile >= 50) return 'text-yellow-600 bg-yellow-100'
                  return 'text-red-600 bg-red-100'
                }

                return (
                  <div key={ranking.category} className="border rounded-lg p-4 text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${getRankColor(ranking.rank, ranking.total)}`}>
                      <span className="text-lg font-bold">#{ranking.rank}</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{ranking.category}</h4>
                    <p className="text-sm text-gray-600">out of {ranking.total} partners</p>
                    <p className="text-xs text-gray-500 mt-1">{ranking.percentile}th percentile</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Benchmark Comparison */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('partner_performance.sections.industry_benchmark')}</h3>
            <div className="space-y-4">
              {[
                { metric: t('partner_performance.metrics.success_rate'), partner: performanceMetrics.successRate, industry: 72.3, excellent: 90 },
                { metric: t('partner_performance.metrics.avg_return'), partner: performanceMetrics.averageReturn, industry: 12.8, excellent: 18 },
                { metric: t('partner_performance.metrics.time_to_fund'), partner: performanceMetrics.timeToFunding, industry: 18.5, excellent: 10 },
                { metric: t('partner_performance.metrics.satisfaction'), partner: performanceMetrics.investorSatisfaction, industry: 4.2, excellent: 5.0 },
                { metric: 'Repeat Investors', partner: performanceMetrics.totalInvestors > 0 ? (performanceMetrics.repeatInvestors / performanceMetrics.totalInvestors) * 100 : 0, industry: 58.4, excellent: 80 },
                { metric: 'Deal Completion', partner: performanceMetrics.averageCompletionTime, industry: 22.1, excellent: 15 }
              ].map((benchmark) => (
                <div key={benchmark.metric} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-md font-semibold text-gray-900">{benchmark.metric}</h4>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-600">{t('partner_performance.benchmark.you')}</div>
                        <div className="text-lg font-bold text-blue-600">
                          {benchmark.metric.includes('Time') ? `${benchmark.partner}d` : 
                           benchmark.metric.includes('Satisfaction') ? `${benchmark.partner}/5` : 
                           `${benchmark.partner}%`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">{t('partner_performance.benchmark.industry')}</div>
                        <div className="text-lg font-bold text-gray-600">
                          {benchmark.metric.includes('Time') ? `${benchmark.industry}d` : 
                           benchmark.metric.includes('Satisfaction') ? `${benchmark.industry}/5` : 
                           `${benchmark.industry}%`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">{t('partner_performance.benchmark.excellent')}</div>
                        <div className="text-lg font-bold text-green-600">
                          {benchmark.metric.includes('Time') ? `${benchmark.excellent}d` : 
                           benchmark.metric.includes('Satisfaction') ? `${benchmark.excellent}/5` : 
                           `${benchmark.excellent}%`}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="relative h-3 rounded-full overflow-hidden">
                      {/* Industry average bar */}
                      <div 
                        className="absolute bg-gray-400 h-3 rounded-full" 
                        style={{ width: `${(benchmark.industry / benchmark.excellent) * 100}%` }}
                      ></div>
                      {/* Your performance bar */}
                      <div 
                        className={`absolute h-3 rounded-full ${
                          benchmark.partner >= benchmark.excellent ? 'bg-green-500' :
                          benchmark.partner >= benchmark.industry ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.min((benchmark.partner / benchmark.excellent) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0</span>
                    <span>{t('partner_performance.benchmark.excellent')}: {benchmark.excellent}{benchmark.metric.includes('Time') ? t('partner_performance.units.days') : benchmark.metric.includes('Satisfaction') ? t('partner_performance.units.rating') : t('partner_performance.units.percentage')}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PartnerLayout>
  )
}

export default PartnerPerformancePage