'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import FinancialOfficerLayout from '../../components/layout/FinancialOfficerLayout'
import { useTranslation, useI18n } from '../../components/providers/I18nProvider'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { 
  Search, Filter, Download, Eye, CheckCircle, XCircle, 
  Clock, AlertTriangle, ArrowUpRight, ArrowDownLeft,
  CreditCard, Wallet, Building2, Users, Calendar,
  MoreVertical, Edit, Trash2, Flag
} from 'lucide-react'

const TransactionMonitoringPage = () => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock transaction data
  const transactions = [
    {
      id: 'TXN-001',
      type: 'DEPOSIT',
      amount: 50000,
      user: 'Ahmed Mohammed',
      userType: 'INVESTOR',
      method: 'Bank Transfer',
      status: 'COMPLETED',
      date: '2024-01-15T10:30:00Z',
      reference: 'REF-2024-001',
      fees: 0,
      description: 'Investment deposit for Tech Startup Fund'
    },
    {
      id: 'TXN-002',
      type: 'WITHDRAWAL',
      amount: 25000,
      user: 'Sara Al-Otaibi',
      userType: 'INVESTOR',
      method: 'Bank Transfer',
      status: 'PENDING',
      date: '2024-01-15T09:15:00Z',
      reference: 'REF-2024-002',
      fees: 50,
      description: 'Profit withdrawal from Healthcare Fund'
    },
    {
      id: 'TXN-003',
      type: 'COMMISSION',
      amount: 3500,
      user: 'Tech Solutions Ltd',
      userType: 'PARTNER',
      method: 'Platform Credit',
      status: 'COMPLETED',
      date: '2024-01-14T16:45:00Z',
      reference: 'REF-2024-003',
      fees: 175,
      description: 'Partner commission for completed deal'
    },
    {
      id: 'TXN-004',
      type: 'FEE',
      amount: 750,
      user: 'Mohammed Al-Saud',
      userType: 'INVESTOR',
      method: 'Platform Debit',
      status: 'COMPLETED',
      date: '2024-01-14T14:20:00Z',
      reference: 'REF-2024-004',
      fees: 0,
      description: 'Management fee for portfolio advisory'
    },
    {
      id: 'TXN-005',
      type: 'DEPOSIT',
      amount: 100000,
      user: 'Green Energy Corp',
      userType: 'PARTNER',
      method: 'Wire Transfer',
      status: 'FAILED',
      date: '2024-01-13T11:30:00Z',
      reference: 'REF-2024-005',
      fees: 0,
      description: 'Project funding deposit - verification failed'
    },
    {
      id: 'TXN-006',
      type: 'WITHDRAWAL',
      amount: 15000,
      user: 'Fatima Al-Ali',
      userType: 'INVESTOR',
      method: 'Digital Wallet',
      status: 'UNDER_REVIEW',
      date: '2024-01-13T08:45:00Z',
      reference: 'REF-2024-006',
      fees: 25,
      description: 'Emergency withdrawal request'
    }
  ]

  const transactionStats = {
    total: transactions.length,
    completed: transactions.filter(t => t.status === 'COMPLETED').length,
    pending: transactions.filter(t => t.status === 'PENDING').length,
    failed: transactions.filter(t => t.status === 'FAILED').length,
    underReview: transactions.filter(t => t.status === 'UNDER_REVIEW').length,
    totalVolume: transactions.reduce((sum, t) => sum + t.amount, 0),
    totalFees: transactions.reduce((sum, t) => sum + t.fees, 0)
  }

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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'FAILED': return 'bg-red-100 text-red-800'
      case 'UNDER_REVIEW': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />
      case 'PENDING': return <Clock className="w-4 h-4" />
      case 'FAILED': return <XCircle className="w-4 h-4" />
      case 'UNDER_REVIEW': return <AlertTriangle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return <ArrowUpRight className="w-4 h-4 text-green-600" />
      case 'WITHDRAWAL': return <ArrowDownLeft className="w-4 h-4 text-red-600" />
      case 'COMMISSION': return <CreditCard className="w-4 h-4 text-blue-600" />
      case 'FEE': return <Wallet className="w-4 h-4 text-purple-600" />
      default: return <CreditCard className="w-4 h-4" />
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    if (selectedFilter !== 'all' && transaction.status !== selectedFilter) return false
    if (searchTerm && !transaction.user.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !transaction.reference.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  return (
    <FinancialOfficerLayout 
      title={t('financialOfficer.transaction_monitoring')}
      subtitle="Monitor and manage all platform transactions"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('financialOfficer.transaction_monitoring')}</h2>
          <p className="text-gray-600 mt-1">Real-time transaction monitoring and management</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Report
          </Button>
        </div>
      </div>

      {/* Transaction Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Volume</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(transactionStats.totalVolume)}</p>
                <p className="text-sm text-gray-500 mt-1">{transactionStats.total} transactions</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{transactionStats.completed}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {((transactionStats.completed / transactionStats.total) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {transactionStats.pending + transactionStats.underReview}
                </p>
                <p className="text-sm text-gray-500 mt-1">Needs attention</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Fees</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(transactionStats.totalFees)}</p>
                <p className="text-sm text-gray-500 mt-1">Platform revenue</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by user name or reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All', count: transactionStats.total },
                { key: 'COMPLETED', label: 'Completed', count: transactionStats.completed },
                { key: 'PENDING', label: 'Pending', count: transactionStats.pending },
                { key: 'UNDER_REVIEW', label: 'Review', count: transactionStats.underReview },
                { key: 'FAILED', label: 'Failed', count: transactionStats.failed }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setSelectedFilter(filter.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedFilter === filter.key
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTypeIcon(transaction.type)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{transaction.id}</div>
                          <div className="text-sm text-gray-500">{transaction.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          {transaction.userType === 'INVESTOR' ? (
                            <Users className="w-4 h-4 text-gray-600" />
                          ) : (
                            <Building2 className="w-4 h-4 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{transaction.user}</div>
                          <div className="text-sm text-gray-500">{transaction.userType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </div>
                      {transaction.fees > 0 && (
                        <div className="text-xs text-gray-500">
                          Fee: {formatCurrency(transaction.fees)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        <span className="mr-1">{getStatusIcon(transaction.status)}</span>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        {transaction.status === 'PENDING' && (
                          <>
                            <button className="text-green-600 hover:text-green-900" title="Approve">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900" title="Reject">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {transaction.status === 'UNDER_REVIEW' && (
                          <button className="text-orange-600 hover:text-orange-900" title="Flag">
                            <Flag className="w-4 h-4" />
                          </button>
                        )}
                        <button className="text-gray-400 hover:text-gray-600" title="More Options">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">No transactions found matching your criteria.</div>
            </div>
          )}
        </CardContent>
      </Card>
    </FinancialOfficerLayout>
  )
}

export default TransactionMonitoringPage