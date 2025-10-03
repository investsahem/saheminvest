'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import AdminLayout from '../../components/layout/AdminLayout'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useTranslation } from '../../components/providers/I18nProvider'
import { 
  DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft,
  Search, Filter, Download, Eye, Plus, Calendar, CreditCard,
  Building2, User, CheckCircle, Clock, AlertCircle, X
} from 'lucide-react'

interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal' | 'investment' | 'return' | 'fee' | 'commission'
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  user: {
    id: string
    name: string
    email: string
    role: string
    walletBalance?: number
  }
  deal?: {
    id: string
    title: string
    category?: string
    status?: string
  }
  description: string
  reference: string
  createdAt: string
  updatedAt: string
  method?: 'card' | 'bank' | 'cash'
}

interface Statistics {
  totalDeposits: number
  totalWithdrawals: number
  totalInvestments: number
  totalReturns: number
  totalFees: number
  totalCommissions: number
  pendingCount: number
  completedCount: number
  failedCount: number
  totalVolume: number
}

const FinancesPage = () => {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [statistics, setStatistics] = useState<Statistics>({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalInvestments: 0,
    totalReturns: 0,
    totalFees: 0,
    totalCommissions: 0,
    pendingCount: 0,
    completedCount: 0,
    failedCount: 0,
    totalVolume: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showTransactionModal, setShowTransactionModal] = useState(false)

  // Fetch real transactions from API
  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50'
      })
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      
      if (typeFilter !== 'all') {
        params.append('type', typeFilter)
      }
      
      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await fetch(`/api/admin/transactions?${params}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
        setStatistics(data.statistics || statistics)
        setTotalPages(data.pagination?.pages || 1)
      } else {
        console.error('Error fetching transactions:', response.statusText)
        setTransactions([])
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [currentPage, statusFilter, typeFilter, searchTerm])

  const handleViewTransaction = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/admin/transactions/${transactionId}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const transaction = await response.json()
        setSelectedTransaction(transaction)
        setShowTransactionModal(true)
      } else {
        alert(t('finances.fetch_error'))
      }
    } catch (error) {
      console.error('Error fetching transaction:', error)
      alert(t('finances.fetch_error'))
    }
  }

  const handleUpdateTransactionStatus = async (transactionId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/transactions/${transactionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      })
      
      if (response.ok) {
        alert(t('finances.transaction_approved').replace('{status}', status.toLowerCase()))
        fetchTransactions() // Refresh the list
        setShowTransactionModal(false)
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating transaction:', error)
      alert(t('finances.transaction_error'))
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="w-5 h-5 text-green-600" />
      case 'withdrawal':
        return <ArrowUpRight className="w-5 h-5 text-red-600" />
      case 'investment':
        return <TrendingUp className="w-5 h-5 text-blue-600" />
      case 'return':
        return <DollarSign className="w-5 h-5 text-purple-600" />
      case 'fee':
        return <AlertCircle className="w-5 h-5 text-orange-600" />
      case 'commission':
        return <Building2 className="w-5 h-5 text-indigo-600" />
      default:
        return <DollarSign className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status: Transaction['status']) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'cancelled':
        return `${baseClasses} bg-gray-100 text-gray-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getTypeColor = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
      case 'return':
        return 'text-green-600'
      case 'withdrawal':
      case 'fee':
        return 'text-red-600'
      case 'investment':
        return 'text-blue-600'
      case 'commission':
        return 'text-indigo-600'
      default:
        return 'text-gray-600'
    }
  }

  // Use statistics from API instead of calculating on frontend

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = searchTerm === '' || 
      transaction.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  if (loading) {
    return (
      <AdminLayout
        title={t('finances.title')}
        subtitle={t('finances.subtitle')}
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title={t('finances.title')}
      subtitle={t('finances.subtitle')}
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">{t('finances.total_deposits')}</p>
                  <p className="text-2xl font-bold text-green-900">{formatCurrency(statistics.totalDeposits)}</p>
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
                  <p className="text-sm font-medium text-red-700">{t('finances.total_withdrawals')}</p>
                  <p className="text-2xl font-bold text-red-900">{formatCurrency(statistics.totalWithdrawals)}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <ArrowUpRight className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">{t('finances.total_investments')}</p>
                  <p className="text-2xl font-bold text-blue-900">{formatCurrency(statistics.totalInvestments)}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">{t('finances.total_returns')}</p>
                  <p className="text-2xl font-bold text-purple-900">{formatCurrency(statistics.totalReturns)}</p>
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
                  <p className="text-sm font-medium text-orange-700">{t('finances.pending')}</p>
                  <p className="text-2xl font-bold text-orange-900">{statistics.pendingCount}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder={t('finances.search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{t('finances.all_status')}</option>
                  <option value="completed">{t('finances.completed')}</option>
                  <option value="pending">{t('finances.pending')}</option>
                  <option value="failed">{t('finances.failed')}</option>
                  <option value="cancelled">{t('finances.cancelled')}</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{t('finances.all_types')}</option>
                  <option value="deposit">{t('finances.deposits')}</option>
                  <option value="withdrawal">{t('finances.withdrawals')}</option>
                  <option value="investment">{t('finances.investments')}</option>
                  <option value="return">{t('finances.returns')}</option>
                  <option value="fee">{t('finances.fees')}</option>
                  <option value="commission">{t('finances.commissions')}</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  {t('finances.export')}
                </Button>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  {t('finances.add_transaction')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('finances.transaction')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('finances.user')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('finances.amount')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('finances.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('finances.date')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('finances.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-3">
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.reference}
                            </div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {transaction.description}
                            </div>
                            {transaction.deal && (
                              <div className="text-xs text-blue-600 mt-1">
                                {t('finances.deal')}: {transaction.deal.title}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {transaction.user.email}
                            </div>
                            <div className="text-xs text-gray-400">
                              {transaction.user.role}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${getTypeColor(transaction.type)}`}>
                          {['deposit', 'return', 'commission'].includes(transaction.type) ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </div>
                        {transaction.method && (
                          <div className="text-xs text-gray-500 capitalize">
                            {t('finances.via')} {transaction.method}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(transaction.status)}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewTransaction(transaction.id)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {transaction.status === 'pending' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-green-600 border-green-300 hover:bg-green-50"
                                onClick={() => handleUpdateTransactionStatus(transaction.id, 'completed')}
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-600 border-red-300 hover:bg-red-50"
                                onClick={() => handleUpdateTransactionStatus(transaction.id, 'failed')}
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">{t('finances.no_transactions')}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t('finances.no_transactions_message')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {t('finances.showing_transactions').replace('{count}', filteredTransactions.length.toString())}
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  >
                    {t('finances.previous')}
                  </Button>
                  <span className="text-sm text-gray-500">
                    {t('finances.page_of').replace('{current}', currentPage.toString()).replace('{total}', totalPages.toString())}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  >
                    {t('finances.next')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transaction Details Modal */}
        {showTransactionModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">{t('finances.transaction_details')}</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowTransactionModal(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Transaction Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('finances.reference')}</label>
                      <p className="text-sm text-gray-900 font-mono">{selectedTransaction.reference}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('finances.status')}</label>
                      <span className={getStatusBadge(selectedTransaction.status)}>
                        {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('finances.type')}</label>
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(selectedTransaction.type)}
                        <span className="text-sm text-gray-900 capitalize">{selectedTransaction.type}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('finances.amount')}</label>
                      <p className={`text-lg font-medium ${getTypeColor(selectedTransaction.type)}`}>
                        {['deposit', 'return', 'commission'].includes(selectedTransaction.type) ? '+' : '-'}
                        {formatCurrency(selectedTransaction.amount)}
                      </p>
                    </div>
                    {selectedTransaction.method && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('finances.method')}</label>
                        <p className="text-sm text-gray-900 capitalize">{selectedTransaction.method}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('finances.created')}</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedTransaction.createdAt)}</p>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="border-t pt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">{t('finances.user_information')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('finances.name')}</label>
                        <p className="text-sm text-gray-900">{selectedTransaction.user.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('finances.email')}</label>
                        <p className="text-sm text-gray-900">{selectedTransaction.user.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('finances.role')}</label>
                        <p className="text-sm text-gray-900">{selectedTransaction.user.role}</p>
                      </div>
                      {selectedTransaction.user.walletBalance !== undefined && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t('finances.wallet_balance')}</label>
                          <p className="text-sm text-gray-900">{formatCurrency(selectedTransaction.user.walletBalance)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Deal Info */}
                  {selectedTransaction.deal && (
                    <div className="border-t pt-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">{t('finances.related_deal')}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t('finances.deal_title')}</label>
                          <p className="text-sm text-gray-900">{selectedTransaction.deal.title}</p>
                        </div>
                        {selectedTransaction.deal.category && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('finances.category')}</label>
                            <p className="text-sm text-gray-900">{selectedTransaction.deal.category}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {selectedTransaction.description && (
                    <div className="border-t pt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('finances.description')}</label>
                      <p className="text-sm text-gray-900">{selectedTransaction.description}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {selectedTransaction.status === 'pending' && (
                    <div className="border-t pt-6">
                      <div className="flex items-center gap-3">
                        <Button 
                          onClick={() => handleUpdateTransactionStatus(selectedTransaction.id, 'completed')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {t('finances.approve_transaction')}
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleUpdateTransactionStatus(selectedTransaction.id, 'failed')}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-2" />
                          {t('finances.reject_transaction')}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default FinancesPage