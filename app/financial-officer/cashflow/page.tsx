'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import FinancialOfficerLayout from '../../components/layout/FinancialOfficerLayout'
import { useTranslation, useI18n } from '../../components/providers/I18nProvider'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, ComposedChart, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { 
  TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownLeft,
  Calendar, Filter, Download, RefreshCw, AlertTriangle, CheckCircle,
  Wallet, CreditCard, Building2, Users, Eye, Plus
} from 'lucide-react'

const CashFlowPage = () => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()
  const [selectedPeriod, setSelectedPeriod] = useState('6M')
  const [selectedView, setSelectedView] = useState('monthly')

  // Cash flow data
  const cashFlowData = [
    { 
      period: 'Jan 2024', 
      inflow: 450000, 
      outflow: 320000, 
      netFlow: 130000,
      investments: 280000,
      withdrawals: 150000,
      fees: 170000,
      expenses: 170000,
      operatingCashFlow: 300000,
      investingCashFlow: -50000,
      financingCashFlow: -120000
    },
    { 
      period: 'Feb 2024', 
      inflow: 520000, 
      outflow: 380000, 
      netFlow: 140000,
      investments: 320000,
      withdrawals: 180000,
      fees: 200000,
      expenses: 200000,
      operatingCashFlow: 320000,
      investingCashFlow: -60000,
      financingCashFlow: -140000
    },
    { 
      period: 'Mar 2024', 
      inflow: 580000, 
      outflow: 420000, 
      netFlow: 160000,
      investments: 380000,
      withdrawals: 200000,
      fees: 200000,
      expenses: 220000,
      operatingCashFlow: 360000,
      investingCashFlow: -80000,
      financingCashFlow: -120000
    },
    { 
      period: 'Apr 2024', 
      inflow: 640000, 
      outflow: 480000, 
      netFlow: 160000,
      investments: 420000,
      withdrawals: 220000,
      fees: 220000,
      expenses: 260000,
      operatingCashFlow: 380000,
      investingCashFlow: -100000,
      financingCashFlow: -120000
    },
    { 
      period: 'May 2024', 
      inflow: 720000, 
      outflow: 520000, 
      netFlow: 200000,
      investments: 480000,
      withdrawals: 240000,
      fees: 240000,
      expenses: 280000,
      operatingCashFlow: 440000,
      investingCashFlow: -120000,
      financingCashFlow: -120000
    },
    { 
      period: 'Jun 2024', 
      inflow: 850000, 
      outflow: 580000, 
      netFlow: 270000,
      investments: 560000,
      withdrawals: 280000,
      fees: 290000,
      expenses: 300000,
      operatingCashFlow: 550000,
      investingCashFlow: -150000,
      financingCashFlow: -130000
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

  const currentMonth = cashFlowData[cashFlowData.length - 1]

  return (
    <FinancialOfficerLayout
      title={t('financialOfficer.cash_flow')}
      subtitle="Monitor and analyze cash flow patterns and liquidity"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('financialOfficer.cash_flow')}</h2>
          <p className="text-gray-600 mt-1">Real-time cash flow monitoring and analysis</p>
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
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Net Cash Flow</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(currentMonth.netFlow)}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">+12.5%</span>
                </div>
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
                <p className="text-sm font-medium text-gray-600">Total Inflow</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(currentMonth.inflow)}</p>
                <p className="text-sm text-blue-600 mt-2 font-medium">Current month</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Outflow</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(currentMonth.outflow)}</p>
                <p className="text-sm text-red-600 mt-2 font-medium">Current month</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <ArrowDownLeft className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cash Position</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(1875000)}</p>
                <p className="text-sm text-purple-600 mt-2 font-medium">Available liquidity</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Chart */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Cash Flow Trend</h3>
            <RefreshCw className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line type="monotone" dataKey="inflow" stroke="#10B981" strokeWidth={2} name="Inflow" />
              <Line type="monotone" dataKey="outflow" stroke="#EF4444" strokeWidth={2} name="Outflow" />
              <Line type="monotone" dataKey="netFlow" stroke="#3B82F6" strokeWidth={3} name="Net Flow" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Operating Cash Flow */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Operating Cash Flow Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="operatingCashFlow" fill="#10B981" name="Operating" />
              <Bar dataKey="investingCashFlow" fill="#F59E0B" name="Investing" />
              <Bar dataKey="financingCashFlow" fill="#EF4444" name="Financing" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </FinancialOfficerLayout>
  )
}

export default CashFlowPage