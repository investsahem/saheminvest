'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import FinancialOfficerLayout from '../components/layout/FinancialOfficerLayout'
import { useTranslation, useI18n } from '../components/providers/I18nProvider'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { 
  LineChart, AreaChart, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, Line
} from 'recharts'
import { 
  TrendingUp, TrendingDown, DollarSign, Target, Award, 
  Activity, Calendar, Eye, ArrowUpRight, Users, 
  PieChart as PieIcon, BarChart3, Building2, FileText, 
  Briefcase, CheckCircle, Clock, AlertCircle, CreditCard, Wallet
} from 'lucide-react'

const FinancialOfficerDashboard = () => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()

  // Financial metrics
  const monthlyRevenue = 125000
  const profitMargin = 18.5
  const cashFlow = 87500
  const monthlyGrowth = 12.3
  const totalTransactions = 1247
  const pendingTransactions = 23

  // Revenue trend data
  const revenueData = [
    { month: 'Jan', revenue: 95000, expenses: 78000, profit: 17000 },
    { month: 'Feb', revenue: 108000, expenses: 82000, profit: 26000 },
    { month: 'Mar', revenue: 112000, expenses: 85000, profit: 27000 },
    { month: 'Apr', revenue: 118000, expenses: 88000, profit: 30000 },
    { month: 'May', revenue: 125000, expenses: 90000, profit: 35000 },
    { month: 'Jun', revenue: 135000, expenses: 92000, profit: 43000 }
  ]

  // Transaction categories
  const transactionCategories = [
    { name: 'Investments', value: 45, amount: 562500, color: '#10B981' },
    { name: 'Withdrawals', value: 25, amount: 312500, color: '#F59E0B' },
    { name: 'Fees', value: 15, amount: 187500, color: '#3B82F6' },
    { name: 'Commissions', value: 10, amount: 125000, color: '#8B5CF6' },
    { name: 'Other', value: 5, amount: 62500, color: '#EF4444' }
  ]

  // Cash flow data
  const cashFlowData = [
    { day: 'Mon', inflow: 15000, outflow: 8000 },
    { day: 'Tue', inflow: 18000, outflow: 12000 },
    { day: 'Wed', inflow: 22000, outflow: 9000 },
    { day: 'Thu', inflow: 19000, outflow: 15000 },
    { day: 'Fri', inflow: 25000, outflow: 11000 },
    { day: 'Sat', inflow: 12000, outflow: 7000 },
    { day: 'Sun', inflow: 8000, outflow: 5000 }
  ]

  // Recent transactions
  const recentTransactions = [
    {
      id: 1,
      type: 'INVESTMENT',
      amount: 15000,
      investor: 'Ahmed Al-Rashid',
      deal: 'Tech Innovation Fund',
      date: '2024-01-15',
      status: 'COMPLETED'
    },
    {
      id: 2,
      type: 'WITHDRAWAL',
      amount: 8500,
      investor: 'Fatima Al-Zahra',
      deal: 'Real Estate Project',
      date: '2024-01-14',
      status: 'PENDING'
    },
    {
      id: 3,
      type: 'COMMISSION',
      amount: 2100,
      investor: 'Mohammed Al-Saud',
      deal: 'Healthcare Fund',
      date: '2024-01-13',
      status: 'COMPLETED'
    },
    {
      id: 4,
      type: 'FEE',
      amount: 450,
      investor: 'Sara Al-Otaibi',
      deal: 'Manufacturing Deal',
      date: '2024-01-12',
      status: 'COMPLETED'
    }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'INVESTMENT': return 'text-green-600'
      case 'WITHDRAWAL': return 'text-orange-600'
      case 'COMMISSION': return 'text-blue-600'
      case 'FEE': return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'FAILED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <FinancialOfficerLayout 
      title={t('financialOfficer.dashboard')}
    >
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">{t('financialOfficer.monthly_revenue')}</p>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(monthlyRevenue)}</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className={`w-4 h-4 text-blue-600 ${locale === 'ar' ? 'ml-1' : 'mr-1'}`} />
                  <span className="text-sm text-blue-600 font-medium">
                    +{monthlyGrowth}% vs last month
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('financialOfficer.profit_margin')}</p>
                <p className="text-2xl font-bold text-gray-900">{profitMargin}%</p>
                <p className="text-sm text-green-600 mt-2 font-medium">Above target</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('financialOfficer.cash_flow')}</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(cashFlow)}</p>
                <p className="text-sm text-blue-600 mt-2 font-medium">Weekly net flow</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{totalTransactions}</p>
                <p className="text-sm text-orange-600 mt-2 font-medium">{pendingTransactions} pending</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trends */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t('financialOfficer.revenue_trends')}</h3>
                <p className="text-sm text-gray-500">Monthly revenue, expenses, and profit</p>
              </div>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [formatCurrency(value as number), name]} 
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stackId="1"
                  stroke="#3B82F6" 
                  fill="#93C5FD" 
                  name="Revenue"
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stackId="2"
                  stroke="#10B981" 
                  fill="#6EE7B7" 
                  name="Profit"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Transaction Categories */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Transaction Categories</h3>
                <p className="text-sm text-gray-500">Distribution by transaction type</p>
              </div>
              <PieIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={transactionCategories}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      dataKey="value"
                      label={({ value }: { name: string, value: number }) => `${value}%`}
                    >
                      {transactionCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value}%`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className={`w-44 ${locale === 'ar' ? 'mr-2' : 'ml-2'}`}>
                <div className="space-y-2">
                  {transactionCategories.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className={`w-2 h-2 rounded-full ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs text-gray-600">{item.name}</span>
                      </div>
                      <span className="text-xs font-medium text-gray-900">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Cash Flow */}
      <div className="grid grid-cols-1 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Weekly Cash Flow</h3>
                <p className="text-sm text-gray-500">Daily inflow vs outflow</p>
              </div>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey="inflow" fill="#10B981" name="Inflow" />
                <Bar dataKey="outflow" fill="#EF4444" name="Outflow" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <Button variant="outline" size="sm">
              <Eye className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{transaction.investor}</h4>
                    <span className={`text-sm font-medium ${getTransactionTypeColor(transaction.type)}`}>
                      {transaction.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{transaction.deal}</p>
                  <div className="flex items-center mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(transaction.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('financialOfficer.quick_actions')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="flex flex-col items-center space-y-2 h-20 bg-blue-600 hover:bg-blue-700">
              <CreditCard className="w-6 h-6" />
              <span className="text-sm text-center">{t('financialOfficer.process_transactions')}</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
              <FileText className="w-6 h-6" />
              <span className="text-sm text-center">{t('financialOfficer.generate_invoices')}</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
              <BarChart3 className="w-6 h-6" />
              <span className="text-sm text-center">{t('financialOfficer.review_budgets')}</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
              <FileText className="w-6 h-6" />
              <span className="text-sm text-center">{t('financialOfficer.export_reports')}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </FinancialOfficerLayout>
  )
}

export default FinancialOfficerDashboard 