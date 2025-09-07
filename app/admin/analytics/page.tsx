'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import AdminLayout from '../../components/layout/AdminLayout'
import { useTranslation } from '../../components/providers/I18nProvider'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { 
  LineChart, AreaChart, BarChart, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Area, Line, Bar
} from 'recharts'
import { 
  TrendingUp, TrendingDown, DollarSign, Users, Target, Activity,
  Calendar, Download, Filter, Eye, BarChart3, PieChart as PieIcon,
  ArrowUpRight, ArrowDownLeft, Building2, Star, Award
} from 'lucide-react'

const AnalyticsPage = () => {
  const { data: session } = useSession()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<string>('6months')
  const [selectedMetric, setSelectedMetric] = useState<string>('revenue')
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch analytics data from API
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!session?.user) return
      
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`, {
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          setAnalyticsData(data)
        } else {
          setError('Failed to fetch analytics data')
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
        setError('Error loading analytics data')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [session, timeRange])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  if (loading) {
    return (
      <AdminLayout
        title={t('analytics.title')}
        subtitle={t('analytics.subtitle')}
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (error || !analyticsData) {
    return (
      <AdminLayout
        title={t('analytics.title')}
        subtitle={t('analytics.subtitle')}
      >
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Analytics</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title={t('analytics.title')}
      subtitle={t('analytics.subtitle')}
    >
      <div className="space-y-6">
        {/* Controls */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1month">{t('analytics.time_ranges.1month')}</option>
                  <option value="3months">{t('analytics.time_ranges.3months')}</option>
                  <option value="6months">{t('analytics.time_ranges.6months')}</option>
                  <option value="1year">{t('analytics.time_ranges.1year')}</option>
                  <option value="all">{t('analytics.time_ranges.all')}</option>
                </select>

                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="revenue">{t('analytics.metrics.revenue')}</option>
                  <option value="investments">{t('analytics.metrics.investments')}</option>
                  <option value="deals">{t('analytics.metrics.deals')}</option>
                  <option value="users">{t('analytics.metrics.users')}</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  {t('analytics.buttons.filter')}
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  {t('analytics.buttons.export')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">{t('analytics.key_metrics.total_revenue')}</p>
                  <p className="text-2xl font-bold text-blue-900">{formatCurrency(analyticsData.totalRevenue)}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+{formatPercent(analyticsData.revenueGrowth)}</span>
                    <span className="text-sm text-gray-500 ml-1">{t('analytics.key_metrics.vs_last_month')}</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">{t('analytics.key_metrics.total_investments')}</p>
                  <p className="text-2xl font-bold text-green-900">{formatCurrency(analyticsData.totalInvestments)}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+{formatPercent(analyticsData.investmentGrowth)}</span>
                    <span className="text-sm text-gray-500 ml-1">{t('analytics.key_metrics.vs_last_month')}</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">{t('analytics.key_metrics.total_deals')}</p>
                  <p className="text-2xl font-bold text-purple-900">{analyticsData.totalDeals}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+{formatPercent(analyticsData.dealGrowth)}</span>
                    <span className="text-sm text-gray-500 ml-1">{t('analytics.key_metrics.vs_last_month')}</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">{t('analytics.key_metrics.active_users')}</p>
                  <p className="text-2xl font-bold text-orange-900">{analyticsData.activeUsers.toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+{formatPercent(analyticsData.userGrowth)}</span>
                    <span className="text-sm text-gray-500 ml-1">{t('analytics.key_metrics.vs_last_month')}</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">{t('analytics.charts.revenue_trends')}</h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>{t('analytics.metrics.revenue')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>{t('analytics.metrics.investments')}</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Area 
                    type="monotone" 
                    dataKey="funding" 
                    stackId="1" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="goal" 
                    stackId="2" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Growth */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">{t('analytics.charts.user_growth')}</h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>{t('analytics.labels.investors')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>{t('analytics.labels.partners')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span>{t('analytics.labels.advisors')}</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="investors" fill="#3B82F6" />
                  <Bar dataKey="partners" fill="#10B981" />
                  <Bar dataKey="advisors" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Investment Flow */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">{t('analytics.charts.investment_flow')}</h3>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  {t('analytics.buttons.details')}
                </Button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.investmentFlowData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analyticsData.investmentFlowData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {analyticsData.investmentFlowData.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{t(`analytics.status.${item.name.toLowerCase()}`) || item.name}</div>
                      <div className="text-xs text-gray-500">{formatCurrency(item.amount)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Deal Performance */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">{t('analytics.charts.deal_performance')}</h3>
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {t('analytics.buttons.view_all')}
                </Button>
              </div>
              <div className="space-y-4">
                {analyticsData.categoryPerformance.map((category: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{t(`analytics.categories.${category.category?.toLowerCase()}`) || category.category}</span>
                        <span className="text-sm text-gray-600">{category.deals} {t('analytics.labels.deals')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-green-600">
                            {formatPercent(category.successRate)} {t('analytics.labels.success')}
                          </span>
                          <span className="text-xs text-blue-600">
                            {formatCurrency((category.totalFunding || 0) / (category.deals || 1))} {t('analytics.labels.avg')}
                          </span>
                        </div>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${Math.min(category.successRate || 0, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Partner Performance */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">{t('analytics.charts.partner_performance')}</h3>
              <Button variant="outline" size="sm">
                <Building2 className="w-4 h-4 mr-2" />
                {t('analytics.buttons.view_all_partners')}
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('analytics.labels.partners')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('analytics.labels.tier')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('analytics.labels.deals')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('analytics.labels.amount')}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('analytics.labels.success_rate')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {analyticsData.partnerPerformance.slice(0, 5).map((partner: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                            <Building2 className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{partner.name || 'Unknown Partner'}</div>
                            <div className="text-xs text-gray-500">{partner.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Award className={`w-4 h-4 ${
                            partner.tier === 'platinum' ? 'text-purple-600' :
                            partner.tier === 'gold' ? 'text-yellow-600' :
                            partner.tier === 'silver' ? 'text-gray-600' : 'text-orange-600'
                          }`} />
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            partner.tier === 'platinum' ? 'bg-purple-100 text-purple-800' :
                            partner.tier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                            partner.tier === 'silver' ? 'bg-gray-100 text-gray-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {t(`analytics.tiers.${partner.tier}`)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{partner.deals || 0}</td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600">{formatCurrency(partner.totalFunding || 0)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-900 mr-2">{formatPercent(partner.successRate || 0)}</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${Math.min(partner.successRate || 0, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default AnalyticsPage