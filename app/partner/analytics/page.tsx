'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslation } from '../../components/providers/I18nProvider'
import PartnerLayout from '../../components/layout/PartnerLayout'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { 
  TrendingUp, TrendingDown, Target, Award, Activity, Calendar, 
  Eye, ArrowUpRight, Users, PieChart as PieIcon, BarChart3, 
  Building2, FileText, Briefcase, CheckCircle, Clock, AlertCircle,
  DollarSign, Percent, Timer, Star
} from 'lucide-react'
import {
  LineChart, AreaChart, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, Line, 
  BarChart, Bar, ComposedChart
} from 'recharts'
import { formatPercentage, formatCurrency, formatNumber, formatRawPercentage } from '../utils/formatters'

const PartnerAnalyticsPage = () => {
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

  // Fallback to prevent errors while loading
  const analyticsMetrics = analyticsData?.metrics || {
    totalDeals: 0,
    activeDeals: 0,
    completedDeals: 0,
    totalValue: 0,
    totalRaised: 0,
    averageReturn: 0,
    successRate: 0,
    averageDuration: 0,
    totalInvestors: 0,
    repeatInvestors: 0
  }

  // Use real data from API
  const performanceData = analyticsData?.performanceData || []
  const categoryData = analyticsData?.categoryData || []
  const statusData = analyticsData?.statusData || []
  const topDeals = analyticsData?.topDeals || []
  const targetVsActual = analyticsData?.targetVsActual || []
  const investorMetrics = analyticsData?.investorMetrics || {
    totalInvestors: 0,
    newInvestors: 0,
    repeatInvestors: 0,
    averageInvestment: 0,
    investorRetention: 0
  }


  if (loading) {
    return (
      <PartnerLayout
        title={t('partner_analytics.title')}
        subtitle={t('partner_analytics.subtitle')}
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PartnerLayout>
    )
  }

  return (
    <PartnerLayout
      title={t('partner_analytics.title')}
      subtitle={t('partner_analytics.subtitle')}
    >
      <div className="space-y-6">
        {/* Time Range Selector */}
        <div className="flex justify-end">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { value: '1month', label: t('partner_analytics.time_ranges.1month') },
              { value: '3months', label: t('partner_analytics.time_ranges.3months') },
              { value: '6months', label: t('partner_analytics.time_ranges.6months') },
              { value: '1year', label: t('partner_analytics.time_ranges.1year') }
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
                  <p className="text-sm font-medium text-blue-700">{t('partner_analytics.metrics.success_rate')}</p>
                  <p className="text-2xl font-bold text-blue-900">{formatRawPercentage(analyticsMetrics.successRate)}%</p>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +2.3% {t('partner_analytics.metrics.from_last_period')}
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
                  <p className="text-sm font-medium text-green-700">{t('partner_analytics.metrics.avg_return')}</p>
                  <p className="text-2xl font-bold text-green-900">{formatRawPercentage(analyticsMetrics.averageReturn)}%</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +0.8% {t('partner_analytics.metrics.from_last_period')}
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
                  <p className="text-sm font-medium text-purple-700">{t('partner_analytics.metrics.total_raised')}</p>
                  <p className="text-2xl font-bold text-purple-900">{formatCurrency(analyticsMetrics.totalRaised)}</p>
                  <p className="text-xs text-purple-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +15.2% {t('partner_analytics.metrics.from_last_period')}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">{t('partner_analytics.metrics.total_investors')}</p>
                  <p className="text-2xl font-bold text-orange-900">{formatNumber(analyticsMetrics.totalInvestors)}</p>
                  <p className="text-xs text-orange-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12.4% {t('partner_analytics.metrics.from_last_period')}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Over Time */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">{t('partner_analytics.charts.performance_trends')}</h3>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">+15.2% {t('partner_analytics.metrics.overall')}</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'value' ? formatCurrency(Number(value)) : 
                      name === 'returns' ? `${value}%` : value,
                      name === 'value' ? 'Deal Value' :
                      name === 'returns' ? 'Avg Return' :
                      name === 'deals' ? 'Deals' : name
                    ]}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="value" fill="#3B82F6" />
                  <Line yAxisId="right" type="monotone" dataKey="returns" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 6 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Target vs Actual */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">{t('partner_analytics.charts.target_vs_actual')}</h3>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-yellow-600">110% {t('partner_analytics.metrics.of_target')}</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={targetVsActual}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Value']} />
                  <Legend />
                  <Bar dataKey="target" fill="#E5E7EB" name="Target" />
                  <Bar dataKey="actual" fill="#3B82F6" name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Category Performance and Deal Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('partner_analytics.charts.category_performance')}</h3>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {categoryData.map((category: any) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                      <span className="text-sm text-gray-600">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{formatCurrency(category.amount)}</div>
                      <div className="text-xs text-gray-500">{category.deals} {t('partner_analytics.units.deals')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Deal Status */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('partner_analytics.charts.deal_status_overview')}</h3>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Deals']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {statusData.map((status: any) => (
                  <div key={status.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }}></div>
                      <span className="text-sm text-gray-600">{status.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{status.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Deals */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">{t('partner_analytics.charts.top_performing_deals')}</h3>
              <Button variant="outline" size="sm">
                {t('partner_analytics.actions.view_all_deals')}
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('partner_analytics.table_headers.deal')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('partner_analytics.table_headers.category')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('partner_analytics.table_headers.raised')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('partner_analytics.table_headers.return')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('partner_analytics.table_headers.investors')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('partner_analytics.table_headers.duration')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('partner_analytics.table_headers.status')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topDeals.map((deal: any) => (
                    <tr key={deal.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{deal.title}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{deal.category}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(deal.raised)}</div>
                        <div className="text-xs text-gray-500">of {formatCurrency(deal.goal)}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-sm font-medium text-green-600">{deal.return}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">{deal.investors}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Timer className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">{deal.duration}{t('partner_analytics.units.months')}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          deal.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          deal.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {deal.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('partner_analytics.charts.performance_summary')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{analyticsMetrics.totalDeals}</div>
                <div className="text-sm text-gray-600">{t('partner_analytics.metrics.total_deals')}</div>
                <div className="text-xs text-green-600 mt-1">
                  {analyticsMetrics.completedDeals} {t('partner_analytics.metrics.completed')}
                </div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsMetrics.totalValue)}</div>
                <div className="text-sm text-gray-600">{t('partner_analytics.metrics.total_value')}</div>
                <div className="text-xs text-green-600 mt-1">
                  {formatPercentage(analyticsMetrics.totalRaised, analyticsMetrics.totalValue)}% {t('partner_analytics.metrics.funded')}
                </div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(analyticsMetrics.totalInvestors)}</div>
                <div className="text-sm text-gray-600">{t('partner_analytics.metrics.total_investors')}</div>
                <div className="text-xs text-green-600 mt-1">
                  {formatPercentage(analyticsMetrics.repeatInvestors, analyticsMetrics.totalInvestors, 0)}% {t('partner_analytics.metrics.repeat_rate')}
                </div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{analyticsMetrics.averageDuration}</div>
                <div className="text-sm text-gray-600">{t('partner_analytics.metrics.avg_duration')}</div>
                <div className="text-xs text-green-600 mt-1">
                  2 {t('partner_analytics.units.months')} {t('partner_analytics.metrics.faster_than_average')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PartnerLayout>
  )
}

export default PartnerAnalyticsPage