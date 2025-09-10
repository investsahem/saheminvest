'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslation } from '../../components/providers/I18nProvider'
import PartnerLayout from '../../components/layout/PartnerLayout'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { 
  Search, Filter, Download, Eye, ArrowUpRight, ArrowDownLeft,
  DollarSign, Calendar, CheckCircle, Clock, AlertCircle, 
  TrendingUp, TrendingDown, CreditCard, Landmark, Building2
} from 'lucide-react'
import { formatCurrency, formatNumber, formatRawPercentage } from '../utils/formatters'

interface Transaction {
  id: string
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'INVESTMENT' | 'RETURN' | 'FEE' | 'COMMISSION'
  amount: number
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  date: string
  description: string
  dealTitle?: string
  investorName?: string
  reference: string
  method: string
}

const PartnerTransactionsPage = () => {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [summary, setSummary] = useState<any>({})
  const [pagination, setPagination] = useState<any>({})
  const transactionsPerPage = 20

  // Fetch real transactions data
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true)
        const queryParams = new URLSearchParams({
          type: filterType,
          status: filterStatus,
          page: currentPage.toString(),
          limit: transactionsPerPage.toString()
        })
        
        const response = await fetch(`/api/partner/transactions?${queryParams}`)
        if (response.ok) {
          const data = await response.json()
          setTransactions(data.transactions)
          setSummary(data.summary)
          setPagination(data.pagination)
        } else {
          console.error('Failed to fetch transactions')
        }
      } catch (error) {
        console.error('Error fetching transactions:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchTransactions()
    }
  }, [session, filterType, filterStatus, currentPage])

  // Filter transactions (client-side search only since API handles type/status filtering)
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = searchTerm === '' || 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.dealTitle && transaction.dealTitle.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesSearch
  })

  const paginatedTransactions = filteredTransactions

  const formatTransactionCurrency = (amount: number) => {
    return formatCurrency(Math.abs(amount), 'USD', 0)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'FAILED': return 'bg-red-100 text-red-800'
      case 'CANCELLED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />
      case 'PENDING': return <Clock className="w-4 h-4" />
      case 'FAILED': return <AlertCircle className="w-4 h-4" />
      case 'CANCELLED': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'COMMISSION': return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'RETURN': return <ArrowUpRight className="w-4 h-4 text-blue-600" />
      case 'DEPOSIT': return <ArrowDownLeft className="w-4 h-4 text-green-600" />
      case 'WITHDRAWAL': return <ArrowUpRight className="w-4 h-4 text-red-600" />
      case 'INVESTMENT': return <Building2 className="w-4 h-4 text-purple-600" />
      case 'FEE': return <CreditCard className="w-4 h-4 text-orange-600" />
      default: return <DollarSign className="w-4 h-4 text-gray-600" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'COMMISSION': return 'text-green-700'
      case 'RETURN': return 'text-blue-700'
      case 'DEPOSIT': return 'text-green-700'
      case 'WITHDRAWAL': return 'text-red-700'
      case 'INVESTMENT': return 'text-purple-700'
      case 'FEE': return 'text-orange-700'
      default: return 'text-gray-700'
    }
  }

  // Get summary metrics from API response
  const totalIncome = summary.totalIncome || 0
  const totalOutgoing = summary.totalOutgoing || 0
  const pendingAmount = summary.pendingAmount || 0
  const netBalance = summary.netBalance || 0
  const growth = summary.growth || { income: 0, outgoing: 0, net: 0 }

  return (
    <PartnerLayout
      title={t('partner_transactions.title')}
      subtitle={t('partner_transactions.subtitle')}
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">{t('partner_transactions.summary.total_income')}</p>
                  <p className="text-2xl font-bold text-green-900">{formatTransactionCurrency(totalIncome)}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    {growth.income >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {growth.income >= 0 ? '+' : ''}{formatRawPercentage(growth.income)}% {t('partner_transactions.summary.this_month')}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <ArrowDownLeft className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">{t('partner_transactions.summary.total_outgoing')}</p>
                  <p className="text-2xl font-bold text-red-900">{formatTransactionCurrency(totalOutgoing)}</p>
                  <p className="text-xs text-red-600 flex items-center mt-1">
                    {growth.outgoing >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {growth.outgoing >= 0 ? '+' : ''}{formatRawPercentage(Math.abs(growth.outgoing))}% {t('partner_transactions.summary.this_month')}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <ArrowUpRight className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">{t('partner_transactions.summary.pending')}</p>
                  <p className="text-2xl font-bold text-yellow-900">{formatTransactionCurrency(pendingAmount)}</p>
                  <p className="text-xs text-yellow-600 flex items-center mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    {t('partner_transactions.summary.awaiting_processing')}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">{t('partner_transactions.summary.net_balance')}</p>
                  <p className="text-2xl font-bold text-blue-900">{formatTransactionCurrency(netBalance)}</p>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    {growth.net >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {growth.net >= 0 ? '+' : ''}{formatRawPercentage(growth.net)}% {t('partner_transactions.summary.this_month')}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder={t('partner_transactions.filters.search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{t('partner_transactions.filters.all_types')}</option>
                  <option value="COMMISSION">{t('partner_transactions.types.commission')}</option>
                  <option value="RETURN">{t('partner_transactions.types.return')}</option>
                  <option value="DEPOSIT">{t('partner_transactions.types.deposit')}</option>
                  <option value="WITHDRAWAL">{t('partner_transactions.types.withdrawal')}</option>
                  <option value="INVESTMENT">{t('partner_transactions.types.investment')}</option>
                  <option value="FEE">{t('partner_transactions.types.fee')}</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{t('partner_transactions.filters.all_status')}</option>
                  <option value="COMPLETED">{t('partner_transactions.status.completed')}</option>
                  <option value="PENDING">{t('partner_transactions.status.pending')}</option>
                  <option value="FAILED">{t('partner_transactions.status.failed')}</option>
                  <option value="CANCELLED">{t('partner_transactions.status.cancelled')}</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  {t('partner_transactions.filters.export')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('partner_transactions.table.transaction')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('partner_transactions.table.type')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('partner_transactions.table.amount')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('partner_transactions.table.status')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('partner_transactions.table.date')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('partner_transactions.table.method')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('partner_transactions.table.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                {getTypeIcon(transaction.type)}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {transaction.description}
                              </div>
                              <div className="text-sm text-gray-500">
                                {transaction.reference}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center ${getTypeColor(transaction.type)}`}>
                            {getTypeIcon(transaction.type)}
                            <span className="ml-2 text-sm font-medium">
                              {transaction.type.charAt(0) + transaction.type.slice(1).toLowerCase()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-bold ${
                            transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.amount >= 0 ? '+' : '-'}{formatTransactionCurrency(transaction.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                            {getStatusIcon(transaction.status)}
                            {transaction.status.charAt(0) + transaction.status.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            {formatDate(transaction.date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-600">
                            <Landmark className="w-4 h-4 text-gray-400 mr-2" />
                            {transaction.method}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrev}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              {t('partner_transactions.pagination.previous')}
            </Button>
            
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "primary" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNext}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              {t('partner_transactions.pagination.next')}
            </Button>
          </div>
        )}

        {paginatedTransactions.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('partner_transactions.empty_state.no_transactions')}</h3>
              <p className="text-gray-600">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                  ? t('partner_transactions.empty_state.adjust_filters')
                  : t('partner_transactions.empty_state.history_appears_here')
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PartnerLayout>
  )
}

export default PartnerTransactionsPage