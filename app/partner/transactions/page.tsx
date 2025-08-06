'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import PartnerLayout from '../../components/layout/PartnerLayout'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { 
  Search, Filter, Download, Eye, ArrowUpRight, ArrowDownLeft,
  DollarSign, Calendar, CheckCircle, Clock, AlertCircle, 
  TrendingUp, TrendingDown, CreditCard, Landmark, Building2
} from 'lucide-react'

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
  const { data: session } = useSession()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const transactionsPerPage = 20

  // Sample transactions data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const sampleTransactions: Transaction[] = [
        {
          id: '1',
          type: 'COMMISSION',
          amount: 15000,
          status: 'COMPLETED',
          date: '2024-01-20',
          description: 'Commission from AI Healthcare Platform deal',
          dealTitle: 'AI Healthcare Platform',
          investorName: 'Ahmed Al-Rashid',
          reference: 'COM-2024-001',
          method: 'Bank Transfer'
        },
        {
          id: '2',
          type: 'RETURN',
          amount: 25000,
          status: 'COMPLETED',
          date: '2024-01-18',
          description: 'Return payment to investors - Smart Home Solutions',
          dealTitle: 'Smart Home Solutions',
          reference: 'RET-2024-002',
          method: 'Bank Transfer'
        },
        {
          id: '3',
          type: 'COMMISSION',
          amount: 12000,
          status: 'PENDING',
          date: '2024-01-15',
          description: 'Commission from Medical Device Manufacturing',
          dealTitle: 'Medical Device Manufacturing',
          investorName: 'Sarah Johnson',
          reference: 'COM-2024-003',
          method: 'Bank Transfer'
        },
        {
          id: '4',
          type: 'FEE',
          amount: -500,
          status: 'COMPLETED',
          date: '2024-01-12',
          description: 'Platform fee for deal management',
          reference: 'FEE-2024-004',
          method: 'Auto Deduction'
        },
        {
          id: '5',
          type: 'COMMISSION',
          amount: 18000,
          status: 'COMPLETED',
          date: '2024-01-10',
          description: 'Commission from Commercial Real Estate deal',
          dealTitle: 'Commercial Real Estate',
          investorName: 'Mohammed Al-Saadoun',
          reference: 'COM-2024-005',
          method: 'Bank Transfer'
        },
        {
          id: '6',
          type: 'RETURN',
          amount: 30000,
          status: 'COMPLETED',
          date: '2024-01-08',
          description: 'Return payment to investors - Tech Startup Fund',
          dealTitle: 'Tech Startup Fund',
          reference: 'RET-2024-006',
          method: 'Bank Transfer'
        }
      ]
      setTransactions(sampleTransactions)
      setLoading(false)
    }, 1000)
  }, [])

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = searchTerm === '' || 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.dealTitle && transaction.dealTitle.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = filterType === 'all' || transaction.type === filterType
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  // Paginate transactions
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * transactionsPerPage,
    currentPage * transactionsPerPage
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount))
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

  // Calculate summary metrics
  const totalIncome = transactions
    .filter(t => ['COMMISSION', 'RETURN', 'DEPOSIT'].includes(t.type) && t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalOutgoing = transactions
    .filter(t => ['WITHDRAWAL', 'FEE'].includes(t.type) && t.status === 'COMPLETED')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const pendingAmount = transactions
    .filter(t => t.status === 'PENDING')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  return (
    <PartnerLayout
      title="Transactions"
      subtitle="Track all your financial transactions"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Total Income</p>
                  <p className="text-2xl font-bold text-green-900">{formatCurrency(totalIncome)}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +15.2% this month
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
                  <p className="text-sm font-medium text-red-700">Total Outgoing</p>
                  <p className="text-2xl font-bold text-red-900">{formatCurrency(totalOutgoing)}</p>
                  <p className="text-xs text-red-600 flex items-center mt-1">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    -5.8% this month
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
                  <p className="text-sm font-medium text-yellow-700">Pending</p>
                  <p className="text-2xl font-bold text-yellow-900">{formatCurrency(pendingAmount)}</p>
                  <p className="text-xs text-yellow-600 flex items-center mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    Awaiting processing
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
                  <p className="text-sm font-medium text-blue-700">Net Balance</p>
                  <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalIncome - totalOutgoing)}</p>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +21.4% this month
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
                    placeholder="Search transactions..."
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
                  <option value="all">All Types</option>
                  <option value="COMMISSION">Commission</option>
                  <option value="RETURN">Return</option>
                  <option value="DEPOSIT">Deposit</option>
                  <option value="WITHDRAWAL">Withdrawal</option>
                  <option value="INVESTMENT">Investment</option>
                  <option value="FEE">Fee</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
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
                        Transaction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
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
                            {transaction.amount >= 0 ? '+' : '-'}{formatCurrency(transaction.amount)}
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
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}

        {paginatedTransactions.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-600">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Your transaction history will appear here.'
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