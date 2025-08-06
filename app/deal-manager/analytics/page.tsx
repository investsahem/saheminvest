'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DealManagerLayout from '../../components/layout/DealManagerLayout'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { 
  LineChart, AreaChart, PieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, Line, BarChart, Bar
} from 'recharts'
import { 
  TrendingUp, TrendingDown, Target, Award, Activity, Calendar, 
  Eye, ArrowUpRight, Users, PieChart as PieIcon, BarChart3, 
  Building2, FileText, Briefcase, CheckCircle, Clock, AlertCircle,
  DollarSign, Percent, Timer, Star
} from 'lucide-react'

const DealAnalyticsPage = () => {
  const { data: session } = useSession()
  const [timeRange, setTimeRange] = useState('6months')
  const [loading, setLoading] = useState(true)

  // Sample analytics data
  const dealMetrics = {
    totalDeals: 45,
    activeDeals: 12,
    completedDeals: 28,
    totalValue: 8750000,
    totalRaised: 7200000,
    averageReturn: 14.2,
    successRate: 87.5,
    averageDuration: 18,
    totalInvestors: 1247
  }

  // Deal performance over time
  const performanceData = [
    { month: 'Jan', deals: 8, value: 1200000, investors: 156, returns: 12.5 },
    { month: 'Feb', deals: 12, value: 1800000, investors: 203, returns: 13.2 },
    { month: 'Mar', deals: 15, value: 2100000, investors: 289, returns: 14.1 },
    { month: 'Apr', deals: 18, value: 2450000, investors: 367, returns: 15.3 },
    { month: 'May', deals: 22, value: 3200000, investors: 445, returns: 13.8 },
    { month: 'Jun', deals: 25, value: 3800000, investors: 523, returns: 14.7 }
  ]

  // Sector distribution
  const sectorData = [
    { name: 'Real Estate', value: 35, amount: 3062500, color: '#F59E0B', deals: 16 },
    { name: 'Technology', value: 25, amount: 2187500, color: '#3B82F6', deals: 11 },
    { name: 'Healthcare', value: 20, amount: 1750000, color: '#8B5CF6', deals: 9 },
    { name: 'Manufacturing', value: 15, amount: 1312500, color: '#10B981', deals: 7 },
    { name: 'Energy', value: 5, amount: 437500, color: '#EF4444', deals: 2 }
  ]

  // Deal status distribution
  const statusData = [
    { name: 'Published', value: 12, color: '#10B981' },
    { name: 'Funded', value: 8, color: '#3B82F6' },
    { name: 'Completed', value: 20, color: '#8B5CF6' },
    { name: 'Draft', value: 3, color: '#6B7280' },
    { name: 'Paused', value: 2, color: '#F59E0B' }
  ]

  // Top performing deals
  const topDeals = [
    { id: '1', title: 'Smart City Infrastructure', category: 'Real Estate', raised: 2500000, goal: 2500000, return: 18.5, investors: 245, status: 'Completed' },
    { id: '2', title: 'AI Healthcare Platform', category: 'Technology', raised: 1800000, goal: 2000000, return: 16.2, investors: 189, status: 'Active' },
    { id: '3', title: 'Green Energy Solutions', category: 'Energy', raised: 1500000, goal: 1500000, return: 15.8, investors: 167, status: 'Completed' },
    { id: '4', title: 'Medical Device Manufacturing', category: 'Healthcare', raised: 1200000, goal: 1500000, return: 14.3, investors: 134, status: 'Active' },
    { id: '5', title: 'Luxury Residential Complex', category: 'Real Estate', raised: 3200000, goal: 3500000, return: 13.9, investors: 298, status: 'Active' }
  ]

  // Risk analysis data
  const riskData = [
    { level: 'Low Risk', count: 18, percentage: 40, avgReturn: 12.3 },
    { level: 'Medium Risk', count: 22, percentage: 49, avgReturn: 15.1 },
    { level: 'High Risk', count: 5, percentage: 11, avgReturn: 19.8 }
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
        title="Deal Analytics"
        subtitle="Comprehensive analytics and performance insights"
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DealManagerLayout>
    )
  }

  return (
    <DealManagerLayout
      title="Deal Analytics"
      subtitle="Comprehensive analytics and performance insights"
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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Deal Value</p>
                  <p className="text-2xl font-bold text-blue-900">{formatCurrency(dealMetrics.totalValue)}</p>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +15.3% from last period
                  </p>
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
                  <p className="text-sm font-medium text-green-700">Success Rate</p>
                  <p className="text-2xl font-bold text-green-900">{dealMetrics.successRate}%</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +2.1% from last period
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Avg Return</p>
                  <p className="text-2xl font-bold text-purple-900">{dealMetrics.averageReturn}%</p>
                  <p className="text-xs text-purple-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +0.8% from last period
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Percent className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Total Investors</p>
                  <p className="text-2xl font-bold text-orange-900">{formatNumber(dealMetrics.totalInvestors)}</p>
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
          {/* Deal Performance Over Time */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Deal Performance</h3>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Last 6 months</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'value' ? formatCurrency(Number(value)) : value,
                      name === 'value' ? 'Total Value' : name === 'deals' ? 'Deals' : 'Investors'
                    ]}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="value" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="deals" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Returns Trend */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Returns Trend</h3>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">+14.2% avg</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}%`, 'Return Rate']} />
                  <Legend />
                  <Line type="monotone" dataKey="returns" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sector Distribution */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Sector Distribution</h3>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sectorData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sectorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {sectorData.map((sector) => (
                  <div key={sector.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sector.color }}></div>
                      <span className="text-sm text-gray-600">{sector.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{formatCurrency(sector.amount)}</div>
                      <div className="text-xs text-gray-500">{sector.deals} deals</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Deal Status */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Deal Status</h3>
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
                View All
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

        {/* Risk Analysis */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Risk Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {riskData.map((risk, index) => (
                <div key={risk.level} className="text-center">
                  <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${
                    index === 0 ? 'bg-green-100' : index === 1 ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    <div className={`w-8 h-8 rounded-full ${
                      index === 0 ? 'bg-green-500' : index === 1 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">{risk.level}</h4>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{risk.count}</p>
                  <p className="text-sm text-gray-600">deals ({risk.percentage}%)</p>
                  <p className="text-sm font-medium text-gray-900 mt-2">
                    Avg Return: {risk.avgReturn}%
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DealManagerLayout>
  )
}

export default DealAnalyticsPage