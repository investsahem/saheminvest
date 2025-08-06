'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import FinancialOfficerLayout from '../../components/layout/FinancialOfficerLayout'
import { useTranslation, useI18n } from '../../components/providers/I18nProvider'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { 
  LineChart, AreaChart, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, Line
} from 'recharts'
import { 
  TrendingUp, TrendingDown, DollarSign, Target, Award, 
  Activity, Calendar, Eye, ArrowUpRight, Users, 
  PieChart as PieIcon, BarChart3, Building2, FileText, 
  Briefcase, CheckCircle, Clock, AlertCircle, CreditCard, Wallet,
  Download, Filter, RefreshCw
} from 'lucide-react'

const FinancialAnalyticsPage = () => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()
  const [selectedPeriod, setSelectedPeriod] = useState('6M')

  // Enhanced financial analytics data
  const revenueData = [
    { month: 'Jan', revenue: 450000, expenses: 320000, profit: 130000, investments: 280000, withdrawals: 150000 },
    { month: 'Feb', revenue: 520000, expenses: 350000, profit: 170000, investments: 320000, withdrawals: 180000 },
    { month: 'Mar', revenue: 580000, expenses: 380000, profit: 200000, investments: 380000, withdrawals: 200000 },
    { month: 'Apr', revenue: 640000, expenses: 420000, profit: 220000, investments: 420000, withdrawals: 220000 },
    { month: 'May', revenue: 720000, expenses: 460000, profit: 260000, investments: 480000, withdrawals: 240000 },
    { month: 'Jun', revenue: 850000, expenses: 500000, profit: 350000, investments: 560000, withdrawals: 280000 }
  ]

  const platformMetrics = [
    { name: 'Investment Volume', value: 2450000, change: 15.3, color: '#10B981' },
    { name: 'Withdrawal Volume', value: 1200000, change: -8.2, color: '#F59E0B' },
    { name: 'Platform Fees', value: 145000, change: 22.1, color: '#3B82F6' },
    { name: 'Partner Commissions', value: 98000, change: 12.8, color: '#8B5CF6' }
  ]

  const userSegmentData = [
    { segment: 'Individual Investors', amount: 3200000, count: 1247, color: '#10B981' },
    { segment: 'Corporate Partners', amount: 1800000, count: 89, color: '#3B82F6' },
    { segment: 'Portfolio Advisors', amount: 950000, count: 45, color: '#F59E0B' },
    { segment: 'Institutional', amount: 650000, count: 12, color: '#8B5CF6' }
  ]

  const riskMetrics = [
    { category: 'Low Risk', percentage: 45, amount: 2800000, color: '#10B981' },
    { category: 'Medium Risk', percentage: 35, amount: 2100000, color: '#F59E0B' },
    { category: 'High Risk', percentage: 20, amount: 1200000, color: '#EF4444' }
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

  return (
    <FinancialOfficerLayout 
      title={t('financialOfficer.financial_analytics')}
      subtitle="Comprehensive financial performance analysis and insights"
    >
      {/* Period Selector */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">{t('financialOfficer.financial_analytics')}</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['1M', '3M', '6M', '1Y'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {platformMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(metric.value)}</p>
                  <div className="flex items-center mt-2">
                    {metric.change > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      metric.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(metric.change)}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-gray-600" style={{ color: metric.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue and Profit Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue vs Expenses Trend</h3>
              <RefreshCw className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.3} name="Revenue" />
                <Area type="monotone" dataKey="expenses" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Investment vs Withdrawal Flow</h3>
              <Eye className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line type="monotone" dataKey="investments" stroke="#3B82F6" strokeWidth={3} name="Investments" />
                <Line type="monotone" dataKey="withdrawals" stroke="#F59E0B" strokeWidth={3} name="Withdrawals" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* User Segments and Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Segment Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userSegmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="amount"
                >
                  {userSegmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
            <div className="space-y-4">
              {riskMetrics.map((risk, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3" 
                      style={{ backgroundColor: risk.color }}
                    ></div>
                    <span className="font-medium text-gray-900">{risk.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{formatCurrency(risk.amount)}</div>
                    <div className="text-sm text-gray-500">{risk.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Risk Distribution</span>
                <span>100%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 flex overflow-hidden">
                {riskMetrics.map((risk, index) => (
                  <div
                    key={index}
                    className="h-full"
                    style={{ 
                      width: `${risk.percentage}%`, 
                      backgroundColor: risk.color 
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Ratios and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Financial Ratios</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">3.2</div>
                <div className="text-sm text-gray-600">Current Ratio</div>
                <div className="text-xs text-green-600 mt-1">Healthy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">18.5%</div>
                <div className="text-sm text-gray-600">ROI</div>
                <div className="text-xs text-green-600 mt-1">Above Target</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">2.1</div>
                <div className="text-sm text-gray-600">Debt-to-Equity</div>
                <div className="text-xs text-yellow-600 mt-1">Monitor</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AlertCircle className="w-4 h-4 mr-2" />
                Risk Alert
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Review
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </FinancialOfficerLayout>
  )
}

export default FinancialAnalyticsPage