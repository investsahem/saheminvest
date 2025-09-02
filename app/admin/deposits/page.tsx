'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import AdminLayout from '../../components/layout/AdminLayout'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardContent } from '../../components/ui/Card'
import { 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  Calendar,
  CreditCard,
  Building2,
  Wallet,
  Eye,
  AlertCircle
} from 'lucide-react'

interface PendingDeposit {
  id: string
  userId: string
  userName: string
  userEmail: string
  amount: number
  method: string
  status: string
  reference: string
  description: string
  createdAt: string
  updatedAt: string
}

interface User {
  id: string
  name: string
  email: string
  walletBalance: number
}

export default function AdminDepositsPage() {
  const { data: session } = useSession()
  const [pendingDeposits, setPendingDeposits] = useState<PendingDeposit[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showManualDepositModal, setShowManualDepositModal] = useState(false)
  const [manualDeposit, setManualDeposit] = useState({
    userId: '',
    amount: '',
    method: 'cash',
    description: ''
  })

  useEffect(() => {
    fetchPendingDeposits()
    fetchUsers()
  }, [])

  const fetchPendingDeposits = async () => {
    try {
      const response = await fetch('/api/admin/deposits')
      if (response.ok) {
        const data = await response.json()
        setPendingDeposits(data.deposits || [])
      }
    } catch (error) {
      console.error('Error fetching pending deposits:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveDeposit = async (depositId: string) => {
    setProcessing(depositId)
    try {
      const response = await fetch(`/api/admin/deposits/${depositId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        await fetchPendingDeposits()
        alert('Deposit approved successfully!')
      } else {
        alert('Failed to approve deposit')
      }
    } catch (error) {
      console.error('Error approving deposit:', error)
      alert('Error approving deposit')
    } finally {
      setProcessing(null)
    }
  }

  const handleRejectDeposit = async (depositId: string) => {
    setProcessing(depositId)
    try {
      const response = await fetch(`/api/admin/deposits/${depositId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        await fetchPendingDeposits()
        alert('Deposit rejected successfully!')
      } else {
        alert('Failed to reject deposit')
      }
    } catch (error) {
      console.error('Error rejecting deposit:', error)
      alert('Error rejecting deposit')
    } finally {
      setProcessing(null)
    }
  }

  const handleManualDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualDeposit.userId || !manualDeposit.amount) {
      alert('Please fill in all required fields')
      return
    }

    setProcessing('manual')
    try {
      const response = await fetch('/api/admin/deposits/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: manualDeposit.userId,
          amount: parseFloat(manualDeposit.amount),
          method: manualDeposit.method,
          description: manualDeposit.description || `Manual ${manualDeposit.method} deposit by admin`
        })
      })
      
      if (response.ok) {
        await fetchPendingDeposits()
        setShowManualDepositModal(false)
        setManualDeposit({ userId: '', amount: '', method: 'cash', description: '' })
        alert('Manual deposit added successfully!')
      } else {
        const errorData = await response.json()
        alert(`Failed to add deposit: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error adding manual deposit:', error)
      alert('Error adding manual deposit')
    } finally {
      setProcessing(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash': return <DollarSign className="w-4 h-4" />
      case 'bank': return <Building2 className="w-4 h-4" />
      case 'card': return <CreditCard className="w-4 h-4" />
      default: return <Wallet className="w-4 h-4" />
    }
  }

  const filteredDeposits = pendingDeposits.filter(deposit => {
    const matchesSearch = deposit.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deposit.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deposit.reference.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || deposit.status.toLowerCase() === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <AdminLayout title="Manage Deposits" subtitle="Process investor deposits and manage wallet funding">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Manage Deposits" subtitle="Process investor deposits and manage wallet funding">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search deposits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <Button
            onClick={() => setShowManualDepositModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Manual Deposit
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-700">Pending Deposits</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {pendingDeposits.filter(d => d.status === 'PENDING').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-700">Completed Today</p>
                  <p className="text-2xl font-bold text-green-900">
                    {pendingDeposits.filter(d => 
                      d.status === 'COMPLETED' && 
                      new Date(d.updatedAt).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-yellow-700">Pending Amount</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {formatCurrency(pendingDeposits
                      .filter(d => d.status === 'PENDING')
                      .reduce((sum, d) => sum + d.amount, 0)
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-700">Total Processed</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatCurrency(pendingDeposits
                      .filter(d => d.status === 'COMPLETED')
                      .reduce((sum, d) => sum + d.amount, 0)
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deposits Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Investor
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
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDeposits.map((deposit) => (
                    <tr key={deposit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{deposit.userName}</div>
                            <div className="text-sm text-gray-500">{deposit.userEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{formatCurrency(deposit.amount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getMethodIcon(deposit.method)}
                          <span className="ml-2 text-sm text-gray-900 capitalize">{deposit.method}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deposit.status)}`}>
                          {getStatusIcon(deposit.status)}
                          <span className="ml-1 capitalize">{deposit.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(deposit.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {deposit.reference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {deposit.status === 'PENDING' ? (
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveDeposit(deposit.id)}
                              disabled={processing === deposit.id}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {processing === deposit.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectDeposit(deposit.id)}
                              disabled={processing === deposit.id}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredDeposits.length === 0 && (
              <div className="text-center py-12">
                <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No deposits found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'No deposit requests have been submitted yet.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manual Deposit Modal */}
        {showManualDepositModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Manual Deposit</h3>
              
              <form onSubmit={handleManualDeposit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Investor *
                  </label>
                  <select
                    value={manualDeposit.userId}
                    onChange={(e) => setManualDeposit(prev => ({ ...prev, userId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose an investor...</option>
                    {users.filter(user => user.id !== session?.user?.id).map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email}) - Balance: {formatCurrency(user.walletBalance)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={manualDeposit.amount}
                    onChange={(e) => setManualDeposit(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Method
                  </label>
                  <select
                    value={manualDeposit.method}
                    onChange={(e) => setManualDeposit(prev => ({ ...prev, method: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="check">Check</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Input
                    type="text"
                    value={manualDeposit.description}
                    onChange={(e) => setManualDeposit(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowManualDepositModal(false)}
                    disabled={processing === 'manual'}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={processing === 'manual'}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {processing === 'manual' ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Deposit
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}


