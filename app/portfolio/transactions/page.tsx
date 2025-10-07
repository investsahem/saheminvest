'use client'

import { useState, useEffect } from 'react'
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
  const [transactions, setTransactions] = useState<any[]>([])
  const [summary, setSummary] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalInvestments: 0,
    totalReturns: 0,
    depositCount: 0,
    withdrawalCount: 0,
    investmentCount: 0,
    returnCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  // Fetch transactions from API
  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        type: filter,
        status: statusFilter,
        dateRange,
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/portfolio/transactions?${params}`)
      if (!response.ok) throw new Error('Failed to fetch transactions')
      
      const data = await response.json()
      setTransactions(data.transactions)
      setSummary(data.summary)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchTransactions()
    }
  }, [session, filter, statusFilter, dateRange, searchTerm, pagination.page])

  // Refresh function for manual refresh
  const handleRefresh = () => {
    fetchTransactions()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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

  const getTransactionAmountSign = (transaction: any) => {
    // Determine the correct sign for the transaction amount based on type
    switch (transaction.type) {
      case 'deposit': 
      case 'return':
      case 'profit_distribution':
        return Math.abs(transaction.amount) // Always positive for money coming in
      case 'withdrawal':
      case 'investment':
        return -Math.abs(transaction.amount) // Always negative for money going out
      default:
        return transaction.amount // Use original amount for unknown types
    }
  }

  if (loading) {
    return (
      <InvestorLayout title={t('portfolio_transactions.title')} subtitle={t('portfolio_transactions.subtitle')}>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </InvestorLayout>
    )
  }

  return (
    <InvestorLayout title={t('portfolio_transactions.title')} subtitle={t('portfolio_transactions.subtitle')}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">{t('portfolio_transactions.summary_cards.total_deposits')}</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(summary.totalDeposits)}</p>
                <p className="text-sm text-green-600 mt-1">
                  {summary.depositCount} {t('portfolio_transactions.summary_cards.transactions')}
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
                <p className="text-sm font-medium text-red-700">{t('portfolio_transactions.summary_cards.total_withdrawals')}</p>
                <p className="text-2xl font-bold text-red-900">{formatCurrency(summary.totalWithdrawals)}</p>
                <p className="text-sm text-red-600 mt-1">
                  {summary.withdrawalCount} {t('portfolio_transactions.summary_cards.transactions')}
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
                <p className="text-sm font-medium text-blue-700">{t('portfolio_transactions.summary_cards.total_invested')}</p>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(summary.totalInvestments)}</p>
                <p className="text-sm text-blue-600 mt-1">
                  {summary.investmentCount} {t('portfolio_transactions.summary_cards.investments')}
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
                <p className="text-sm font-medium text-purple-700">{t('portfolio_transactions.summary_cards.total_returns')}</p>
                <p className="text-2xl font-bold text-purple-900">{formatCurrency(summary.totalReturns)}</p>
                <p className="text-sm text-purple-600 mt-1">
                  {summary.returnCount} {t('portfolio_transactions.summary_cards.payments')}
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
                placeholder={t('portfolio_transactions.filters.search_placeholder')}
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
                  <option value="all">{t('portfolio_transactions.filters.all_types')}</option>
                  <option value="deposits">{t('portfolio_transactions.filters.deposits')}</option>
                  <option value="withdrawals">{t('portfolio_transactions.filters.withdrawals')}</option>
                  <option value="investments">{t('portfolio_transactions.filters.investments')}</option>
                  <option value="returns">{t('portfolio_transactions.filters.returns')}</option>
                </select>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('portfolio_transactions.filters.all_status')}</option>
                <option value="completed">{t('portfolio_transactions.filters.completed')}</option>
                <option value="pending">{t('portfolio_transactions.filters.pending')}</option>
                <option value="failed">{t('portfolio_transactions.filters.failed')}</option>
              </select>

              {/* Date Range */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">{t('portfolio_transactions.filters.last_7_days')}</option>
                <option value="30d">{t('portfolio_transactions.filters.last_30_days')}</option>
                <option value="90d">{t('portfolio_transactions.filters.last_90_days')}</option>
                <option value="1y">{t('portfolio_transactions.filters.last_year')}</option>
                <option value="all">{t('portfolio_transactions.filters.all_time')}</option>
              </select>

              {/* Export Button */}
              <Button variant="outline" size="sm">
                <Download className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
                {t('portfolio_transactions.filters.export')}
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
              {t('portfolio_transactions.transaction_list.title')} ({transactions.length})
            </h3>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
              {t('portfolio_transactions.filters.refresh')}
            </Button>
          </div>

          <div className="space-y-4">
            {transactions.map((transaction) => (
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
                          <span className="text-gray-500">{t('portfolio_transactions.transaction_list.reference')}:</span>
                          <p className="font-medium">{transaction.reference}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('portfolio_transactions.transaction_list.date')}:</span>
                          <p className="font-medium">{formatDateTime(transaction.date)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('portfolio_transactions.transaction_list.method')}:</span>
                          <div className="flex items-center gap-1">
                            {getMethodIcon(transaction.method)}
                            <span className="font-medium capitalize">
                              {transaction.method === 'bank_transfer' ? t('portfolio_transactions.payment_methods.bank_transfer') :
                               transaction.method === 'credit_card' ? t('portfolio_transactions.payment_methods.credit_card') :
                               transaction.method === 'wallet' ? t('portfolio_transactions.payment_methods.wallet') :
                               transaction.method.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        {transaction.fees > 0 && (
                          <div>
                            <span className="text-gray-500">{t('portfolio_transactions.transaction_list.fees')}:</span>
                            <p className="font-medium text-red-600">{formatCurrency(transaction.fees)}</p>
                          </div>
                        )}
                      </div>

                      {/* Additional Info */}
                      {transaction.dealName && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-900">{t('portfolio_transactions.transaction_list.deal')}: {transaction.dealName}</p>
                          {transaction.partner && (
                            <p className="text-sm text-blue-700">{t('portfolio_transactions.transaction_list.partner')}: {transaction.partner}</p>
                          )}
                        </div>
                      )}

                      {transaction.status === 'pending' && transaction.estimatedCompletion && (
                        <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                          <p className="text-sm font-medium text-orange-900">{t('portfolio_transactions.transaction_list.processing')}</p>
                          <p className="text-sm text-orange-700">
                            {t('portfolio_transactions.transaction_list.expected_completion')}: {formatDateTime(transaction.estimatedCompletion)}
                          </p>
                        </div>
                      )}

                      {transaction.status === 'failed' && transaction.failureReason && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg">
                          <p className="text-sm font-medium text-red-900">{t('portfolio_transactions.filters.failed')}</p>
                          <p className="text-sm text-red-700">{t('portfolio_transactions.transaction_list.failed_reason')}: {transaction.failureReason}</p>
                          {transaction.refunded && (
                            <p className="text-sm text-green-700 mt-1">✓ {t('portfolio_transactions.transaction_list.amount_refunded')}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Amount and Actions */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        getTransactionAmountSign(transaction) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {getTransactionAmountSign(transaction) >= 0 ? '+' : ''}{formatCurrency(Math.abs(getTransactionAmountSign(transaction)))}
                      </p>
                      <p className="text-sm text-gray-500">
                        {t('portfolio_transactions.transaction_list.balance')}: {formatCurrency(transaction.balanceAfter)}
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
          {transactions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('portfolio_transactions.empty_state.no_transactions')}</h3>
              <p className="text-gray-600">
                {searchTerm || filter !== 'all' || statusFilter !== 'all' || dateRange !== 'all'
                  ? t('portfolio_transactions.empty_state.adjust_filters')
                  : t('portfolio_transactions.empty_state.no_transactions_yet')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </InvestorLayout>
  )
}

export default TransactionHistory