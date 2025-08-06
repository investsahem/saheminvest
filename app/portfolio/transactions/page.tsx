'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import InvestorLayout from '../../components/layout/InvestorLayout'
import { useTranslation, useI18n } from '../../components/providers/I18nProvider'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { 
  ArrowUpRight, ArrowDownLeft, DollarSign, TrendingUp, 
  Calendar, Filter, Search, Download, Eye, RefreshCw,
  CheckCircle, Clock, AlertCircle, XCircle, Building2,
  CreditCard, Landmark, Wallet, Target, Award
} from 'lucide-react'

const TransactionHistory = () => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()
  
  const [filter, setFilter] = useState<'all' | 'deposits' | 'withdrawals' | 'investments' | 'returns'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all')
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d')
  const [searchTerm, setSearchTerm] = useState('')

  // Sample transaction data
  const transactions = [
    {
      id: 'TXN-2024-001',
      type: 'deposit',
      amount: 5000,
      status: 'completed',
      date: '2024-01-20T14:30:00Z',
      method: 'bank_transfer',
      description: 'Bank transfer deposit',
      reference: 'DEP-2024-001',
      fees: 0,
      balanceAfter: 12500,
      processingTime: '2 business days',
      bankReference: 'BT240120001'
    },
    {
      id: 'TXN-2024-002',
      type: 'investment',
      amount: -3000,
      status: 'completed',
      date: '2024-01-19T09:15:00Z',
      method: 'wallet',
      description: 'Investment in Tech Innovation Fund',
      reference: 'INV-2024-015',
      dealId: 'DEAL-2696',
      dealName: 'Tech Innovation Fund',
      fees: 0,
      balanceAfter: 9500,
      partner: 'Smart Trading Ltd.'
    },
    {
      id: 'TXN-2024-003',
      type: 'withdrawal',
      amount: -2000,
      status: 'pending',
      date: '2024-01-18T16:45:00Z',
      method: 'bank_transfer',
      description: 'Bank transfer withdrawal',
      reference: 'WTH-2024-003',
      fees: 25,
      balanceAfter: 10500,
      processingTime: '3-5 business days',
      estimatedCompletion: '2024-01-23T16:45:00Z'
    },
    {
      id: 'TXN-2024-004',
      type: 'return',
      amount: 450,
      status: 'completed',
      date: '2024-01-17T11:20:00Z',
      method: 'wallet',
      description: 'Monthly return from Real Estate Project',
      reference: 'RET-2024-008',
      dealId: 'DEAL-2695',
      dealName: 'Downtown Commercial Complex',
      fees: 0,
      balanceAfter: 12475,
      returnPeriod: 'January 2024'
    },
    {
      id: 'TXN-2024-005',
      type: 'deposit',
      amount: 3000,
      status: 'completed',
      date: '2024-01-16T13:10:00Z',
      method: 'credit_card',
      description: 'Credit card deposit',
      reference: 'DEP-2024-002',
      fees: 90, // 3% fee
      balanceAfter: 12025,
      cardLast4: '4532',
      processingTime: 'Instant'
    },
    {
      id: 'TXN-2024-006',
      type: 'investment',
      amount: -4000,
      status: 'completed',
      date: '2024-01-15T10:30:00Z',
      method: 'wallet',
      description: 'Investment in Healthcare Development Project',
      reference: 'INV-2024-014',
      dealId: 'DEAL-2697',
      dealName: 'Healthcare Development Project',
      fees: 0,
      balanceAfter: 9125,
      partner: 'Health Innovations Inc.'
    },
    {
      id: 'TXN-2024-007',
      type: 'withdrawal',
      amount: -1000,
      status: 'failed',
      date: '2024-01-14T15:20:00Z',
      method: 'bank_transfer',
      description: 'Bank transfer withdrawal - Failed',
      reference: 'WTH-2024-002',
      fees: 0,
      balanceAfter: 13125,
      failureReason: 'Insufficient verification documents',
      refunded: true
    },
    {
      id: 'TXN-2024-008',
      type: 'return',
      amount: 280,
      status: 'completed',
      date: '2024-01-13T09:45:00Z',
      method: 'wallet',
      description: 'Quarterly return from Tech Innovation Fund',
      reference: 'RET-2024-007',
      dealId: 'DEAL-2696',
      dealName: 'Tech Innovation Fund',
      fees: 0,
      balanceAfter: 13125,
      returnPeriod: 'Q4 2023'
    }
  ]

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    // Type filter
    if (filter !== 'all') {
      if (filter === 'deposits' && transaction.type !== 'deposit') return false
      if (filter === 'withdrawals' && transaction.type !== 'withdrawal') return false
      if (filter === 'investments' && transaction.type !== 'investment') return false
      if (filter === 'returns' && transaction.type !== 'return') return false
    }

    // Status filter
    if (statusFilter !== 'all' && transaction.status !== statusFilter) return false

    // Date range filter
    const transactionDate = new Date(transaction.date)
    const now = new Date()
    const daysDiff = Math.floor((now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (dateRange === '7d' && daysDiff > 7) return false
    if (dateRange === '30d' && daysDiff > 30) return false
    if (dateRange === '90d' && daysDiff > 90) return false
    if (dateRange === '1y' && daysDiff > 365) return false

    // Search filter
    if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !transaction.reference.toLowerCase().includes(searchTerm.toLowerCase())) return false

    return true
  })

  // Calculate summary stats
  const totalDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalWithdrawals = Math.abs(transactions.filter(t => t.type === 'withdrawal' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0))
  const totalInvestments = Math.abs(transactions.filter(t => t.type === 'investment' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0))
  const totalReturns = transactions.filter(t => t.type === 'return' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft className="w-5 h-5 text-green-600" />
      case 'withdrawal': return <ArrowUpRight className="w-5 h-5 text-red-600" />
      case 'investment': return <Target className="w-5 h-5 text-blue-600" />
      case 'return': return <Award className="w-5 h-5 text-purple-600" />
      default: return <DollarSign className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending': return <Clock className="w-4 h-4 text-orange-600" />
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-orange-100 text-orange-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer': return <Landmark className="w-4 h-4 text-gray-600" />
      case 'credit_card': return <CreditCard className="w-4 h-4 text-gray-600" />
      case 'wallet': return <Wallet className="w-4 h-4 text-gray-600" />
      default: return <DollarSign className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <InvestorLayout title={t('investor.transaction_history')}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Total Deposits</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(totalDeposits)}</p>
                <p className="text-sm text-green-600 mt-1">
                  {transactions.filter(t => t.type === 'deposit').length} transactions
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <ArrowDownLeft className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-rose-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Total Withdrawals</p>
                <p className="text-2xl font-bold text-red-900">{formatCurrency(totalWithdrawals)}</p>
                <p className="text-sm text-red-600 mt-1">
                  {transactions.filter(t => t.type === 'withdrawal').length} transactions
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Invested</p>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalInvestments)}</p>
                <p className="text-sm text-blue-600 mt-1">
                  {transactions.filter(t => t.type === 'investment').length} investments
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Total Returns</p>
                <p className="text-2xl font-bold text-purple-900">{formatCurrency(totalReturns)}</p>
                <p className="text-sm text-purple-600 mt-1">
                  {transactions.filter(t => t.type === 'return').length} payments
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              {/* Type Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="deposits">Deposits</option>
                  <option value="withdrawals">Withdrawals</option>
                  <option value="investments">Investments</option>
                  <option value="returns">Returns</option>
                </select>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>

              {/* Date Range */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
                <option value="all">All time</option>
              </select>

              {/* Export Button */}
              <Button variant="outline" size="sm">
                <Download className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Transaction History ({filteredTransactions.length})
            </h3>
            <Button variant="outline" size="sm">
              <RefreshCw className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
              Refresh
            </Button>
          </div>

          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Transaction Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{transaction.description}</h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {getStatusIcon(transaction.status)}
                          <span className={locale === 'ar' ? 'mr-1' : 'ml-1'}>
                            {transaction.status}
                          </span>
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="text-gray-500">Reference:</span>
                          <p className="font-medium">{transaction.reference}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Date:</span>
                          <p className="font-medium">{formatDateTime(transaction.date)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Method:</span>
                          <div className="flex items-center gap-1">
                            {getMethodIcon(transaction.method)}
                            <span className="font-medium capitalize">{transaction.method.replace('_', ' ')}</span>
                          </div>
                        </div>
                        {transaction.fees > 0 && (
                          <div>
                            <span className="text-gray-500">Fees:</span>
                            <p className="font-medium text-red-600">{formatCurrency(transaction.fees)}</p>
                          </div>
                        )}
                      </div>

                      {/* Additional Info */}
                      {transaction.dealName && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-900">Deal: {transaction.dealName}</p>
                          {transaction.partner && (
                            <p className="text-sm text-blue-700">Partner: {transaction.partner}</p>
                          )}
                        </div>
                      )}

                      {transaction.status === 'pending' && transaction.estimatedCompletion && (
                        <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                          <p className="text-sm font-medium text-orange-900">Processing</p>
                          <p className="text-sm text-orange-700">
                            Expected completion: {formatDateTime(transaction.estimatedCompletion)}
                          </p>
                        </div>
                      )}

                      {transaction.status === 'failed' && transaction.failureReason && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg">
                          <p className="text-sm font-medium text-red-900">Failed</p>
                          <p className="text-sm text-red-700">Reason: {transaction.failureReason}</p>
                          {transaction.refunded && (
                            <p className="text-sm text-green-700 mt-1">✓ Amount refunded to wallet</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Amount and Actions */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                      </p>
                      <p className="text-sm text-gray-500">
                        Balance: {formatCurrency(transaction.balanceAfter)}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-600">
                {searchTerm || filter !== 'all' || statusFilter !== 'all' || dateRange !== 'all'
                  ? 'Try adjusting your filters to see more transactions.'
                  : "You don't have any transactions yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </InvestorLayout>
  )
}

export default TransactionHistory