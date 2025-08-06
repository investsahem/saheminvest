'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import FinancialOfficerLayout from '../../components/layout/FinancialOfficerLayout'
import { useTranslation, useI18n } from '../../components/providers/I18nProvider'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { 
  DollarSign, TrendingUp, TrendingDown, Target, ArrowUpRight, 
  ArrowDownRight, Users, Building2, CreditCard, Wallet, 
  Calendar, Filter, Download, RefreshCw, Plus, Edit, Trash2
} from 'lucide-react'

const RevenueManagementPage = () => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()
  const [selectedTab, setSelectedTab] = useState('overview')

  // Revenue streams data
  const revenueStreams = [
    {
      id: 1,
      name: 'Platform Fees',
      category: 'Transaction Fees',
      currentMonth: 125000,
      lastMonth: 118000,
      percentage: 45,
      growth: 5.9,
      color: '#10B981'
    },
    {
      id: 2,
      name: 'Management Fees',
      category: 'Asset Management',
      currentMonth: 85000,
      lastMonth: 82000,
      percentage: 30,
      growth: 3.7,
      color: '#3B82F6'
    },
    {
      id: 3,
      name: 'Advisory Fees',
      category: 'Consultation',
      currentMonth: 45000,
      lastMonth: 48000,
      percentage: 16,
      growth: -6.3,
      color: '#F59E0B'
    },
    {
      id: 4,
      name: 'Premium Services',
      category: 'Subscriptions',
      currentMonth: 25000,
      lastMonth: 22000,
      percentage: 9,
      growth: 13.6,
      color: '#8B5CF6'
    }
  ]

  // Monthly revenue breakdown
  const monthlyData = [
    { month: 'Jan', platform: 95000, management: 65000, advisory: 35000, premium: 18000, total: 213000 },
    { month: 'Feb', platform: 108000, management: 72000, advisory: 38000, premium: 20000, total: 238000 },
    { month: 'Mar', platform: 115000, management: 78000, advisory: 42000, premium: 22000, total: 257000 },
    { month: 'Apr', platform: 118000, management: 80000, advisory: 45000, premium: 23000, total: 266000 },
    { month: 'May', platform: 122000, management: 83000, advisory: 47000, premium: 24000, total: 276000 },
    { month: 'Jun', platform: 125000, management: 85000, advisory: 45000, premium: 25000, total: 280000 }
  ]

  // Revenue by user segment
  const segmentRevenue = [
    { segment: 'Individual Investors', revenue: 145000, transactions: 1247, avgRevenue: 116 },
    { segment: 'Corporate Partners', revenue: 89000, transactions: 89, avgRevenue: 1000 },
    { segment: 'Portfolio Advisors', revenue: 32000, transactions: 45, avgRevenue: 711 },
    { segment: 'Institutional Clients', revenue: 14000, transactions: 12, avgRevenue: 1167 }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const totalRevenue = revenueStreams.reduce((sum, stream) => sum + stream.currentMonth, 0)
  const totalGrowth = ((totalRevenue - revenueStreams.reduce((sum, stream) => sum + stream.lastMonth, 0)) / revenueStreams.reduce((sum, stream) => sum + stream.lastMonth, 0)) * 100

  return (
    <FinancialOfficerLayout 
      title={t('financialOfficer.revenue_management')}
      subtitle="Monitor and optimize platform revenue streams"
    >
      {/* Header with Actions */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('financialOfficer.revenue_management')}</h2>
          <p className="text-gray-600 mt-1">Track revenue performance across all streams</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Stream
          </Button>
        </div>
      </div>

      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Total Revenue</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(totalRevenue)}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600 font-medium">
                    {formatPercentage(totalGrowth)}
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue Target</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(300000)}</p>
                <p className="text-sm text-blue-600 mt-2 font-medium">
                  {((totalRevenue / 300000) * 100).toFixed(1)}% achieved
                </p>
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
                <p className="text-sm font-medium text-gray-600">Avg. Revenue/User</p>
                <p className="text-2xl font-bold text-gray-900">$215</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600 font-medium">+8.2%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Streams</p>
                <p className="text-2xl font-bold text-gray-900">{revenueStreams.length}</p>
                <p className="text-sm text-gray-500 mt-2">Revenue sources</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview' },
            { id: 'streams', name: 'Revenue Streams' },
            { id: 'segments', name: 'User Segments' },
            { id: 'forecasting', name: 'Forecasting' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue Trend</h3>
                <RefreshCw className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#10B981" strokeWidth={3} name="Total Revenue" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueStreams}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="currentMonth"
                  >
                    {revenueStreams.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === 'streams' && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Streams Performance</h3>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Stream
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stream Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Month
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Growth
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Share
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {revenueStreams.map((stream) => (
                    <tr key={stream.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: stream.color }}></div>
                          <div className="text-sm font-medium text-gray-900">{stream.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stream.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(stream.currentMonth)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {stream.growth > 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                          )}
                          <span className={`text-sm font-medium ${
                            stream.growth > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatPercentage(stream.growth)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stream.percentage}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTab === 'segments' && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue by User Segment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {segmentRevenue.map((segment, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{segment.segment}</h4>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(segment.revenue)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {segment.transactions} transactions
                    </div>
                    <div className="text-sm text-gray-600">
                      Avg: {formatCurrency(segment.avgRevenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={segmentRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="segment" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="revenue" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </FinancialOfficerLayout>
  )
}

export default RevenueManagementPage