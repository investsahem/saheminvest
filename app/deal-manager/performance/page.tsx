'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DealManagerLayout from '../../components/layout/DealManagerLayout'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { 
  TrendingUp, TrendingDown, Target, Award, Activity, Calendar, 
  BarChart3, PieChart as PieIcon, DollarSign, Percent, Users, 
  Building2, CheckCircle, Clock, AlertCircle, ArrowUpRight, 
  ArrowDownRight, Star, Trophy, Zap
} from 'lucide-react'
import {
  LineChart, AreaChart, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, Line, 
  BarChart, Bar, ComposedChart
} from 'recharts'

const PerformanceTrackingPage = () => {
  const { data: session } = useSession()
  const [timeRange, setTimeRange] = useState('6months')
  const [loading, setLoading] = useState(true)

  // Performance metrics
  const performanceMetrics = {
    totalDeals: 45,
    successfulDeals: 39,
    totalValue: 8750000,
    totalReturns: 1312500,
    averageReturn: 15.2,
    successRate: 86.7,
    averageDealSize: 194444,
    averageCompletionTime: 18.5,
    totalInvestors: 1247,
    repeatInvestors: 892
  }

  // Performance over time
  const performanceData = [
    { 
      month: 'Jan', 
      deals: 8, 
      value: 1200000, 
      returns: 180000, 
      successRate: 87.5,
      investors: 156,
      avgReturn: 15.0
    },
    { 
      month: 'Feb', 
      deals: 12, 
      value: 1800000, 
      returns: 270000, 
      successRate: 91.7,
      investors: 203,
      avgReturn: 15.5
    },
    { 
      month: 'Mar', 
      deals: 15, 
      value: 2100000, 
      returns: 315000, 
      successRate: 86.7,
      investors: 289,
      avgReturn: 14.8
    },
    { 
      month: 'Apr', 
      deals: 18, 
      value: 2450000, 
      returns: 367500, 
      successRate: 88.9,
      investors: 367,
      avgReturn: 16.2
    },
    { 
      month: 'May', 
      deals: 22, 
      value: 3200000, 
      returns: 480000, 
      successRate: 81.8,
      investors: 445,
      avgReturn: 14.1
    },
    { 
      month: 'Jun', 
      deals: 25, 
      value: 3800000, 
      returns: 570000, 
      successRate: 84.0,
      investors: 523,
      avgReturn: 15.8
    }
  ]

  // Deal performance by category
  const categoryPerformance = [
    { 
      category: 'Real Estate', 
      deals: 16, 
      value: 3062500, 
      returns: 459375, 
      avgReturn: 15.0,
      successRate: 93.8,
      color: '#F59E0B' 
    },
    { 
      category: 'Technology', 
      deals: 11, 
      value: 2187500, 
      returns: 350000, 
      avgReturn: 16.0,
      successRate: 90.9,
      color: '#3B82F6' 
    },
    { 
      category: 'Healthcare', 
      deals: 9, 
      value: 1750000, 
      returns: 262500, 
      avgReturn: 15.0,
      successRate: 88.9,
      color: '#8B5CF6' 
    },
    { 
      category: 'Manufacturing', 
      deals: 7, 
      value: 1312500, 
      returns: 183750, 
      avgReturn: 14.0,
      successRate: 85.7,
      color: '#10B981' 
    },
    { 
      category: 'Energy', 
      deals: 2, 
      value: 437500, 
      returns: 57000, 
      avgReturn: 13.0,
      successRate: 50.0,
      color: '#EF4444' 
    }
  ]

  // Risk vs Return analysis
  const riskReturnData = [
    { risk: 'Low', deals: 18, avgReturn: 12.3, successRate: 94.4, value: 3500000 },
    { risk: 'Medium', deals: 22, avgReturn: 15.1, successRate: 86.4, value: 4200000 },
    { risk: 'High', deals: 5, avgReturn: 19.8, successRate: 60.0, value: 1050000 }
  ]

  // Top performing deals
  const topDeals = [
    {
      id: '1',
      title: 'Smart City Infrastructure',
      category: 'Real Estate',
      value: 2500000,
      returns: 450000,
      returnRate: 18.0,
      duration: 24,
      status: 'Completed',
      investors: 245
    },
    {
      id: '2',
      title: 'AI Healthcare Platform',
      category: 'Technology',
      value: 1800000,
      returns: 324000,
      returnRate: 18.0,
      duration: 18,
      status: 'Active',
      investors: 189
    },
    {
      id: '3',
      title: 'Green Energy Solutions',
      category: 'Energy',
      value: 1500000,
      returns: 255000,
      returnRate: 17.0,
      duration: 20,
      status: 'Completed',
      investors: 167
    },
    {
      id: '4',
      title: 'Medical Device Manufacturing',
      category: 'Healthcare',
      value: 1200000,
      returns: 192000,
      returnRate: 16.0,
      duration: 16,
      status: 'Active',
      investors: 134
    },
    {
      id: '5',
      title: 'Luxury Residential Complex',
      category: 'Real Estate',
      value: 3200000,
      returns: 480000,
      returnRate: 15.0,
      duration: 22,
      status: 'Active',
      investors: 298
    }
  ]

  // Monthly targets vs actual
  const targetVsActual = [
    { month: 'Jan', target: 1000000, actual: 1200000, deals: 8 },
    { month: 'Feb', target: 1500000, actual: 1800000, deals: 12 },
    { month: 'Mar', target: 2000000, actual: 2100000, deals: 15 },
    { month: 'Apr', target: 2200000, actual: 2450000, deals: 18 },
    { month: 'May', target: 2800000, actual: 3200000, deals: 22 },
    { month: 'Jun', target: 3500000, actual: 3800000, deals: 25 }
  ]

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
      <DealManagerLayout
        title="Performance Tracking"
        subtitle="Monitor and analyze deal performance metrics"
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DealManagerLayout>
    )
  }

  return (
    <DealManagerLayout
      title="Performance Tracking"
      subtitle="Monitor and analyze deal performance metrics"
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
                  <p className="text-sm font-medium text-purple-700">Total Returns</p>
                  <p className="text-2xl font-bold text-purple-900">{formatCurrency(performanceMetrics.totalReturns)}</p>
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
                  <p className="text-sm font-medium text-orange-700">Avg Deal Size</p>
                  <p className="text-2xl font-bold text-orange-900">{formatCurrency(performanceMetrics.averageDealSize)}</p>
                  <p className="text-xs text-orange-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +8.4% from last period
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
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
                      name === 'value' || name === 'returns' ? formatCurrency(Number(value)) : 
                      name === 'avgReturn' || name === 'successRate' ? `${value}%` : value,
                      name === 'value' ? 'Deal Value' :
                      name === 'returns' ? 'Returns' :
                      name === 'avgReturn' ? 'Avg Return' :
                      name === 'successRate' ? 'Success Rate' : name
                    ]}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="value" fill="#3B82F6" />
                  <Bar yAxisId="left" dataKey="returns" fill="#10B981" />
                  <Line yAxisId="right" type="monotone" dataKey="avgReturn" stroke="#8B5CF6" strokeWidth={3} />
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
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-yellow-600">108.7% of target</span>
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

        {/* Category Performance */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance by Category</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deals</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Returns</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Return</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categoryPerformance.map((category) => (
                    <tr key={category.category} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-3" 
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <span className="text-sm font-medium text-gray-900">{category.category}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{category.deals}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{formatCurrency(category.value)}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-sm font-medium text-green-600">{formatCurrency(category.returns)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{category.avgReturn}%</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${category.successRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{category.successRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Risk vs Return Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Risk vs Return Analysis</h3>
              <div className="space-y-4">
                {riskReturnData.map((risk, index) => (
                  <div key={risk.risk} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-md font-semibold text-gray-900">{risk.risk} Risk</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        index === 0 ? 'bg-green-100 text-green-800' :
                        index === 1 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {risk.deals} deals
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{formatCurrency(risk.value)}</div>
                        <div className="text-xs text-gray-500">Total Value</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{risk.avgReturn}%</div>
                        <div className="text-xs text-gray-500">Avg Return</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{risk.successRate}%</div>
                        <div className="text-xs text-gray-500">Success Rate</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Deals */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Top Performing Deals</h3>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {topDeals.slice(0, 5).map((deal, index) => (
                  <div key={deal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">{deal.title}</h4>
                        <p className="text-xs text-gray-500">{deal.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-bold text-green-600">{deal.returnRate}%</span>
                      </div>
                      <div className="text-xs text-gray-500">{formatCurrency(deal.returns)}</div>
                    </div>
                  </div>
                ))}
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
                  {((performanceMetrics.totalReturns / performanceMetrics.totalValue) * 100).toFixed(1)}% ROI
                </div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(performanceMetrics.totalInvestors)}</div>
                <div className="text-sm text-gray-600">Total Investors</div>
                <div className="text-xs text-green-600 mt-1">
                  {Math.round((performanceMetrics.repeatInvestors / performanceMetrics.totalInvestors) * 100)}% repeat rate
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
      </div>
    </DealManagerLayout>
  )
}

export default PerformanceTrackingPage