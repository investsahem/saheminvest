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

const PartnerAnalyticsPage = () => {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const [timeRange, setTimeRange] = useState('6months')
  const [loading, setLoading] = useState(true)

  // Sample analytics data
  const analyticsMetrics = {
    totalDeals: 15,
    activeDeals: 3,
    completedDeals: 12,
    totalValue: 850000,
    totalRaised: 720000,
    averageReturn: 15.2,
    successRate: 87.5,
    averageDuration: 16,
    totalInvestors: 125,
    repeatInvestors: 89
  }

  // Deal performance over time
  const performanceData = [
    { month: 'Jan', deals: 2, value: 120000, investors: 15, returns: 14.5 },
    { month: 'Feb', deals: 3, value: 180000, investors: 23, returns: 15.2 },
    { month: 'Mar', deals: 2, value: 150000, investors: 18, returns: 14.8 },
    { month: 'Apr', deals: 3, value: 210000, investors: 28, returns: 16.1 },
    { month: 'May', deals: 2, value: 160000, investors: 21, returns: 13.9 },
    { month: 'Jun', deals: 3, value: 220000, investors: 32, returns: 15.7 }
  ]

  // Deal category distribution
  const categoryData = [
    { name: 'Technology', value: 40, amount: 340000, color: '#3B82F6', deals: 6 },
    { name: 'Real Estate', value: 30, amount: 255000, color: '#F59E0B', deals: 5 },
    { name: 'Healthcare', value: 20, amount: 170000, color: '#8B5CF6', deals: 3 },
    { name: 'Manufacturing', value: 10, amount: 85000, color: '#10B981', deals: 1 }
  ]

  // Deal status distribution
  const statusData = [
    { name: 'Completed', value: 12, color: '#10B981' },
    { name: 'Active', value: 3, color: '#3B82F6' },
    { name: 'Draft', value: 0, color: '#6B7280' }
  ]

  // Top performing deals
  const topDeals = [
    { 
      id: '1', 
      title: 'AI Healthcare Platform', 
      category: 'Technology', 
      raised: 180000, 
      goal: 200000, 
      return: 18.5, 
      investors: 25, 
      status: 'Active',
      duration: 18 
    },
    { 
      id: '2', 
      title: 'Smart Home Solutions', 
      category: 'Technology', 
      raised: 150000, 
      goal: 150000, 
      return: 16.8, 
      investors: 20, 
      status: 'Completed',
      duration: 16 
    },
    { 
      id: '3', 
      title: 'Medical Device Manufacturing', 
      category: 'Healthcare', 
      raised: 120000, 
      goal: 120000, 
      return: 15.2, 
      investors: 18, 
      status: 'Completed',
      duration: 14 
    },
    { 
      id: '4', 
      title: 'Commercial Real Estate', 
      category: 'Real Estate', 
      raised: 200000, 
      goal: 200000, 
      return: 14.5, 
      investors: 30, 
      status: 'Completed',
      duration: 20 
    }
  ]

  // Monthly targets vs actual
  const targetVsActual = [
    { month: 'Jan', target: 100000, actual: 120000, deals: 2 },
    { month: 'Feb', target: 150000, actual: 180000, deals: 3 },
    { month: 'Mar', target: 140000, actual: 150000, deals: 2 },
    { month: 'Apr', target: 180000, actual: 210000, deals: 3 },
    { month: 'May', target: 160000, actual: 160000, deals: 2 },
    { month: 'Jun', target: 200000, actual: 220000, deals: 3 }
  ]

  // Investor engagement metrics
  const investorMetrics = {
    totalInvestors: 125,
    newInvestors: 23,
    repeatInvestors: 89,
    averageInvestment: 5760,
    investorRetention: 71.2
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
        title={t('partner.analytics')}
        subtitle={t('partner.analytics_subtitle')}
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PartnerLayout>
    )
  }

  return (
    <PartnerLayout
      title={t('partner.analytics')}
      subtitle={t('partner.analytics_subtitle')}
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
                  <p className="text-2xl font-bold text-blue-900">{analyticsMetrics.successRate}%</p>
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
                  <p className="text-2xl font-bold text-green-900">{analyticsMetrics.averageReturn}%</p>
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
                  <p className="text-sm font-medium text-purple-700">Total Raised</p>
                  <p className="text-2xl font-bold text-purple-900">{formatCurrency(analyticsMetrics.totalRaised)}</p>
                  <p className="text-xs text-purple-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +15.2% from last period
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
                  <p className="text-sm font-medium text-orange-700">Total Investors</p>
                  <p className="text-2xl font-bold text-orange-900">{formatNumber(analyticsMetrics.totalInvestors)}</p>
                  <p className="text-xs text-orange-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12.4% from last period
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
                <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">+15.2% overall</span>
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
                <h3 className="text-lg font-semibold text-gray-900">Target vs Actual</h3>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-yellow-600">110% of target</span>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Performance</h3>
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
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {categoryData.map((category) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                      <span className="text-sm text-gray-600">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{formatCurrency(category.amount)}</div>
                      <div className="text-xs text-gray-500">{category.deals} deals</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Deal Status */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Deal Status Overview</h3>
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
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Deals']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {statusData.map((status) => (
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
              <h3 className="text-lg font-semibold text-gray-900">Top Performing Deals</h3>
              <Button variant="outline" size="sm">
                View All Deals
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Raised</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investors</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topDeals.map((deal) => (
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
                          <span className="text-sm text-gray-900">{deal.duration}m</span>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{analyticsMetrics.totalDeals}</div>
                <div className="text-sm text-gray-600">Total Deals</div>
                <div className="text-xs text-green-600 mt-1">
                  {analyticsMetrics.completedDeals} completed
                </div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsMetrics.totalValue)}</div>
                <div className="text-sm text-gray-600">Total Value</div>
                <div className="text-xs text-green-600 mt-1">
                  {((analyticsMetrics.totalRaised / analyticsMetrics.totalValue) * 100).toFixed(1)}% funded
                </div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(analyticsMetrics.totalInvestors)}</div>
                <div className="text-sm text-gray-600">Total Investors</div>
                <div className="text-xs text-green-600 mt-1">
                  {Math.round((analyticsMetrics.repeatInvestors / analyticsMetrics.totalInvestors) * 100)}% repeat rate
                </div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{analyticsMetrics.averageDuration}</div>
                <div className="text-sm text-gray-600">Avg Duration (months)</div>
                <div className="text-xs text-green-600 mt-1">
                  2 months faster than average
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