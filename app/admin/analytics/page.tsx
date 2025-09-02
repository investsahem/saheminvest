'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import AdminLayout from '../../components/layout/AdminLayout'
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
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<string>('6months')
  const [selectedMetric, setSelectedMetric] = useState<string>('revenue')

  // Sample analytics data
  const revenueData = [
    { month: 'Jul 2023', revenue: 45000, investments: 125000, deals: 8, users: 1100 },
    { month: 'Aug 2023', revenue: 52000, investments: 145000, deals: 12, users: 1180 },
    { month: 'Sep 2023', revenue: 48000, investments: 132000, deals: 10, users: 1220 },
    { month: 'Oct 2023', revenue: 61000, investments: 178000, deals: 15, users: 1350 },
    { month: 'Nov 2023', revenue: 55000, investments: 165000, deals: 13, users: 1420 },
    { month: 'Dec 2023', revenue: 67000, investments: 195000, deals: 18, users: 1580 },
    { month: 'Jan 2024', revenue: 71000, investments: 210000, deals: 20, users: 1647 },
  ]

  const userGrowthData = [
    { month: 'Jul', investors: 890, partners: 45, advisors: 12, total: 947 },
    { month: 'Aug', investors: 945, partners: 52, advisors: 15, total: 1012 },
    { month: 'Sep', investors: 980, partners: 48, advisors: 18, total: 1046 },
    { month: 'Oct', investors: 1100, partners: 65, advisors: 22, total: 1187 },
    { month: 'Nov', investors: 1180, partners: 58, advisors: 25, total: 1263 },
    { month: 'Dec', investors: 1320, partners: 72, advisors: 28, total: 1420 },
    { month: 'Jan', investors: 1420, partners: 78, advisors: 32, total: 1530 },
  ]

  const transactionData = [
    { category: 'Electronics', deals: 35, funded: 32, success: 91.4, avgAmount: 85000 },
    { category: 'Real Estate', deals: 28, funded: 27, success: 96.4, avgAmount: 150000 },
    { category: 'Agriculture', deals: 22, funded: 19, success: 86.4, avgAmount: 65000 },
    { category: 'Technology', deals: 18, funded: 17, success: 94.4, avgAmount: 95000 },
    { category: 'Healthcare', deals: 15, funded: 13, success: 86.7, avgAmount: 120000 },
    { category: 'Energy', deals: 12, funded: 11, success: 91.7, avgAmount: 200000 },
  ]

  const investmentFlowData = [
    { name: 'New Investments', value: 65, amount: 2850000, color: '#3B82F6' },
    { name: 'Reinvestments', value: 25, amount: 1100000, color: '#10B981' },
    { name: 'Pending', value: 7, amount: 310000, color: '#F59E0B' },
    { name: 'Cancelled', value: 3, amount: 140000, color: '#EF4444' },
  ]

  const regionalData = [
    { region: 'Dubai', deals: 45, amount: 1850000, growth: 12.5 },
    { region: 'Abu Dhabi', deals: 32, amount: 1420000, growth: 8.3 },
    { region: 'Sharjah', deals: 18, amount: 780000, growth: 15.2 },
    { region: 'Ras Al Khaimah', deals: 12, amount: 520000, growth: 22.1 },
    { region: 'Ajman', deals: 8, amount: 340000, growth: 18.7 },
    { region: 'Other Emirates', deals: 15, amount: 690000, growth: 9.8 },
  ]

  const partnerPerformanceData = [
    { name: 'Emirates Real Estate Group', deals: 28, commission: 125000, success: 96.8, tier: 'platinum' },
    { name: 'Tech Solutions Ltd', deals: 12, commission: 45000, success: 94.2, tier: 'gold' },
    { name: 'Green Energy Consultants', deals: 8, commission: 22000, success: 87.5, tier: 'silver' },
    { name: 'Healthcare Innovations LLC', deals: 5, commission: 15000, success: 80.0, tier: 'bronze' },
    { name: 'Agricultural Ventures Co', deals: 3, commission: 5500, success: 66.7, tier: 'bronze' },
  ]

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000)
  }, [])

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

  // Calculate key metrics
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0)
  const totalInvestments = revenueData.reduce((sum, item) => sum + item.investments, 0)
  const totalDeals = revenueData.reduce((sum, item) => sum + item.deals, 0)
  const currentUsers = userGrowthData[userGrowthData.length - 1]?.total || 0
  
  const revenueGrowth = revenueData.length > 1 
    ? ((revenueData[revenueData.length - 1].revenue - revenueData[revenueData.length - 2].revenue) / revenueData[revenueData.length - 2].revenue) * 100
    : 0

  const investmentGrowth = revenueData.length > 1 
    ? ((revenueData[revenueData.length - 1].investments - revenueData[revenueData.length - 2].investments) / revenueData[revenueData.length - 2].investments) * 100
    : 0

  if (loading) {
    return (
      <AdminLayout
        title="Analytics Dashboard"
        subtitle="Comprehensive business intelligence and insights"
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title="Analytics Dashboard"
      subtitle="Comprehensive business intelligence and insights"
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
                  <option value="1month">Last Month</option>
                  <option value="3months">Last 3 Months</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="1year">Last Year</option>
                  <option value="all">All Time</option>
                </select>

                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="revenue">Revenue</option>
                  <option value="investments">Investments</option>
                  <option value="deals">Deals</option>
                  <option value="users">Users</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
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
                  <p className="text-sm font-medium text-blue-700">Total Revenue</p>
                  <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalRevenue)}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+{formatPercent(revenueGrowth)}</span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
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
                  <p className="text-sm font-medium text-green-700">Total Investments</p>
                  <p className="text-2xl font-bold text-green-900">{formatCurrency(totalInvestments)}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+{formatPercent(investmentGrowth)}</span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
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
                  <p className="text-sm font-medium text-purple-700">Total Deals</p>
                  <p className="text-2xl font-bold text-purple-900">{totalDeals}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+25%</span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
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
                  <p className="text-sm font-medium text-orange-700">Active Users</p>
                  <p className="text-2xl font-bold text-orange-900">{currentUsers.toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+7.8%</span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
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
                <h3 className="text-lg font-semibold text-gray-900">Revenue & Investment Trends</h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Investments</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stackId="1" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="investments" 
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
                <h3 className="text-lg font-semibold text-gray-900">User Growth by Type</h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Investors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Partners</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span>Advisors</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userGrowthData}>
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
                <h3 className="text-lg font-semibold text-gray-900">Investment Flow Distribution</h3>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Details
                </Button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={investmentFlowData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {investmentFlowData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {investmentFlowData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
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
                <h3 className="text-lg font-semibold text-gray-900">Deal Performance by Category</h3>
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {transactionData.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{category.category}</span>
                        <span className="text-sm text-gray-600">{category.deals} deals</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-green-600">
                            {formatPercent(category.success)} success
                          </span>
                          <span className="text-xs text-blue-600">
                            {formatCurrency(category.avgAmount)} avg
                          </span>
                        </div>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${category.success}%` }}
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

        {/* Regional Performance */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Regional Performance</h3>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regionalData.map((region, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{region.region}</h4>
                    <div className="flex items-center text-sm text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +{formatPercent(region.growth)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Deals</span>
                      <span className="font-medium">{region.deals}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Amount</span>
                      <span className="font-medium">{formatCurrency(region.amount)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Partner Performance */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Top Partner Performance</h3>
              <Button variant="outline" size="sm">
                <Building2 className="w-4 h-4 mr-2" />
                View All Partners
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partner</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deals</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Success Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {partnerPerformanceData.map((partner, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                            <Building2 className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{partner.name}</span>
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
                            {partner.tier.charAt(0).toUpperCase() + partner.tier.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{partner.deals}</td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600">{formatCurrency(partner.commission)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-900 mr-2">{formatPercent(partner.success)}</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${partner.success}%` }}
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