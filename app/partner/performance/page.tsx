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
import { formatPercentage, formatCurrency, formatNumber } from '../utils/formatters'

const PartnerPerformancePage = () => {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const [timeRange, setTimeRange] = useState('6months')
  const [loading, setLoading] = useState(true)

  // Performance metrics
  const performanceMetrics = {
    totalDeals: 15,
    successfulDeals: 13,
    totalValue: 850000,
    totalReturns: 127500,
    averageReturn: 15.2,
    successRate: 86.7,
    averageDealSize: 56667,
    averageCompletionTime: 16.5,
    totalInvestors: 125,
    repeatInvestors: 89,
    investorSatisfaction: 4.8,
    timeToFunding: 12.3
  }

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000)
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  if (loading) {
    return (
      <PartnerLayout
        title={t('partner.performance_tracking')}
        subtitle={t('partner.performance_tracking_subtitle')}
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PartnerLayout>
    )
  }

  return (
    <PartnerLayout
      title={t('partner.performance_tracking')}
      subtitle={t('partner.performance_tracking_subtitle')}
    >
      <div className="space-y-6">
        {/* Time Range Selector */}
        <div className="flex justify-end">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { value: '1month', label: '1M' },
              { value: '3months', label: '3M' },
              { value: '6months', label: '6M' },
              { value: '1year', label: '1Y' }
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
                  <p className="text-sm font-medium text-blue-700">Success Rate</p>
                  <p className="text-2xl font-bold text-blue-900">{performanceMetrics.successRate}%</p>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +2.3% from last period
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
                  <p className="text-sm font-medium text-green-700">Avg Return</p>
                  <p className="text-2xl font-bold text-green-900">{performanceMetrics.averageReturn}%</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +0.8% from last period
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
                  <p className="text-sm font-medium text-purple-700">Satisfaction</p>
                  <p className="text-2xl font-bold text-purple-900">{performanceMetrics.investorSatisfaction}/5</p>
                  <p className="text-xs text-purple-600 flex items-center mt-1">
                    <Star className="w-3 h-3 mr-1" />
                    Excellent rating
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
                  <p className="text-sm font-medium text-orange-700">Time to Fund</p>
                  <p className="text-2xl font-bold text-orange-900">{performanceMetrics.timeToFunding}d</p>
                  <p className="text-xs text-orange-600 flex items-center mt-1">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    -2.1 days improved
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
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{performanceMetrics.totalDeals}</div>
                <div className="text-sm text-gray-600">Total Deals</div>
                <div className="text-xs text-green-600 mt-1">
                  {performanceMetrics.successfulDeals} successful
                </div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(performanceMetrics.totalValue)}</div>
                <div className="text-sm text-gray-600">Total Value</div>
                <div className="text-xs text-green-600 mt-1">
                  {formatPercentage(performanceMetrics.totalReturns, performanceMetrics.totalValue)}% ROI
                </div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(performanceMetrics.totalInvestors)}</div>
                <div className="text-sm text-gray-600">Total Investors</div>
                <div className="text-xs text-green-600 mt-1">
                  {formatPercentage(performanceMetrics.repeatInvestors, performanceMetrics.totalInvestors, 0)}% repeat rate
                </div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{performanceMetrics.averageCompletionTime}</div>
                <div className="text-sm text-gray-600">Avg Completion (months)</div>
                <div className="text-xs text-green-600 mt-1">
                  2.3 months faster than industry
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Rankings */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Performance Rankings</h3>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-yellow-600">Top 10% overall</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { category: 'Deal Success Rate', rank: 3, total: 50, percentile: 94 },
                { category: 'Average Returns', rank: 7, total: 50, percentile: 86 },
                { category: 'Investor Satisfaction', rank: 2, total: 50, percentile: 96 },
                { category: 'Time to Funding', rank: 5, total: 50, percentile: 90 },
                { category: 'Deal Volume', rank: 12, total: 50, percentile: 76 }
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
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Industry Benchmark Comparison</h3>
            <div className="space-y-4">
              {[
                { metric: 'Success Rate', partner: 86.7, industry: 72.3, excellent: 90 },
                { metric: 'Avg Return', partner: 15.2, industry: 12.8, excellent: 18 },
                { metric: 'Time to Fund', partner: 12.3, industry: 18.5, excellent: 10 },
                { metric: 'Investor Satisfaction', partner: 4.8, industry: 4.2, excellent: 5.0 },
                { metric: 'Repeat Investors', partner: 71.2, industry: 58.4, excellent: 80 },
                { metric: 'Deal Completion', partner: 16.5, industry: 22.1, excellent: 15 }
              ].map((benchmark) => (
                <div key={benchmark.metric} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-md font-semibold text-gray-900">{benchmark.metric}</h4>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-600">You</div>
                        <div className="text-lg font-bold text-blue-600">
                          {benchmark.metric.includes('Time') ? `${benchmark.partner}d` : 
                           benchmark.metric.includes('Satisfaction') ? `${benchmark.partner}/5` : 
                           `${benchmark.partner}%`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Industry</div>
                        <div className="text-lg font-bold text-gray-600">
                          {benchmark.metric.includes('Time') ? `${benchmark.industry}d` : 
                           benchmark.metric.includes('Satisfaction') ? `${benchmark.industry}/5` : 
                           `${benchmark.industry}%`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Excellent</div>
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
                    <span>Excellent: {benchmark.excellent}{benchmark.metric.includes('Time') ? 'd' : benchmark.metric.includes('Satisfaction') ? '/5' : '%'}</span>
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