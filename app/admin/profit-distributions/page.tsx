'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import AdminLayout from '../../components/layout/AdminLayout'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { 
  CheckCircle, XCircle, Clock, DollarSign, Users, 
  Calendar, AlertCircle, Search, Filter, Eye,
  TrendingUp, Target, FileText, Plus
} from 'lucide-react'

interface ProfitDistributionRequest {
  id: string
  project: {
    id: string
    title: string
    fundingGoal: number
    currentFunding: number
    uniqueInvestorCount: number
    investments: Array<{
      id: string
      amount: number
      investor: {
        id: string
        name: string
      }
    }>
  }
  partner: {
    id: string
    name: string
    email: string
  }
  // Partner-provided fields (read-only for admin)
  totalAmount: number
  estimatedGainPercent: number
  estimatedClosingPercent: number
  distributionType: 'PARTIAL' | 'FINAL'
  description: string
  estimatedProfit: number
  estimatedReturnCapital: number
  
  // Admin-editable fields
  sahemInvestPercent: number
  reservedGainPercent: number
  
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
}

interface EditableDistributionFields {
  totalAmount: number
  estimatedGainPercent: number
  estimatedClosingPercent: number
  estimatedProfit: number
  estimatedReturnCapital: number
  sahemInvestPercent: number
  reservedGainPercent: number
  isLoss: boolean // New: indicates if the deal resulted in a loss
}

const AdminProfitDistributionsPage = () => {
  const { data: session } = useSession()
  const [requests, setRequests] = useState<ProfitDistributionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState<ProfitDistributionRequest | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)
  const [editingFields, setEditingFields] = useState<EditableDistributionFields | null>(null)

  useEffect(() => {
    fetchRequests()
  }, [searchTerm, statusFilter])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const response = await fetch(`/api/admin/profit-distribution-requests?${params}`)
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests)
      }
    } catch (error) {
      console.error('Error fetching profit distribution requests:', error)
    } finally {
      setLoading(false)
    }
  }

  // Initialize editing fields from request
  const initializeEditingFields = (request: ProfitDistributionRequest): EditableDistributionFields => {
    return {
      totalAmount: request.totalAmount,
      estimatedGainPercent: request.estimatedGainPercent,
      estimatedClosingPercent: request.estimatedClosingPercent,
      estimatedProfit: request.estimatedProfit,
      estimatedReturnCapital: request.estimatedReturnCapital,
      sahemInvestPercent: request.sahemInvestPercent,
      reservedGainPercent: request.reservedGainPercent,
      isLoss: request.estimatedProfit < 0 || request.estimatedGainPercent < 0
    }
  }

  // Calculate distribution breakdown
  const calculateDistribution = (fields: EditableDistributionFields, request: ProfitDistributionRequest) => {
    const isFinal = request.distributionType === 'FINAL'
    const isLoss = fields.isLoss
    
    let sahemAmount = 0
    let reserveAmount = 0
    let investorsProfit = 0
    let investorsCapital = fields.estimatedReturnCapital

    if (isFinal && isLoss) {
      // Loss scenario: No commission, all remaining goes to investors to recover capital
      sahemAmount = 0
      reserveAmount = 0
      investorsProfit = 0
      investorsCapital = fields.totalAmount // All remaining amount for capital recovery
    } else {
      // Profit scenario (or partial): Normal distribution with commissions
      sahemAmount = (fields.estimatedProfit * fields.sahemInvestPercent) / 100
      reserveAmount = (fields.estimatedProfit * fields.reservedGainPercent) / 100
      investorsProfit = fields.estimatedProfit - sahemAmount - reserveAmount
    }

    const totalToInvestors = investorsCapital + investorsProfit

    return {
      sahemAmount,
      reserveAmount,
      investorsProfit,
      investorsCapital,
      totalToInvestors,
      isLoss,
      isFinal
    }
  }

  const handleApprove = async (requestId: string, editedFields?: EditableDistributionFields) => {
    try {
      setProcessing(requestId)
      
      const requestBody: any = {}
      if (editedFields) {
        requestBody.totalAmount = editedFields.totalAmount
        requestBody.estimatedGainPercent = editedFields.estimatedGainPercent
        requestBody.estimatedClosingPercent = editedFields.estimatedClosingPercent
        requestBody.estimatedProfit = editedFields.estimatedProfit
        requestBody.estimatedReturnCapital = editedFields.estimatedReturnCapital
        requestBody.sahemInvestPercent = editedFields.sahemInvestPercent
        requestBody.reservedGainPercent = editedFields.reservedGainPercent
        requestBody.isLoss = editedFields.isLoss
      }

      const response = await fetch(`/api/admin/profit-distribution-requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      if (response.ok) {
        alert('تم الموافقة على توزيع الأرباح وتم إضافتها لمحافظ المستثمرين')
        fetchRequests()
        setSelectedRequest(null)
        setEditingFields(null)
      } else {
        const error = await response.json()
        alert(error.error || 'حدث خطأ في الموافقة')
      }
    } catch (error) {
      console.error('Error approving request:', error)
      alert('حدث خطأ في الموافقة')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (requestId: string, reason: string) => {
    try {
      setProcessing(requestId)
      const response = await fetch(`/api/admin/profit-distribution-requests/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })

      if (response.ok) {
        alert('تم رفض طلب توزيع الأرباح')
        fetchRequests()
        setSelectedRequest(null)
      } else {
        const error = await response.json()
        alert(error.error || 'حدث خطأ في الرفض')
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
      alert('حدث خطأ في الرفض')
    } finally {
      setProcessing(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />
      case 'REJECTED': return <XCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const pendingCount = requests.filter(r => r.status === 'PENDING').length
  const totalAmount = requests.filter(r => r.status === 'PENDING').reduce((sum, r) => sum + r.totalAmount, 0)

  return (
    <AdminLayout
      title="إدارة توزيع الأرباح"
      subtitle="مراجعة والموافقة على طلبات توزيع الأرباح من الشركاء"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">طلبات معلقة</p>
                  <p className="text-2xl font-bold text-yellow-900">{pendingCount}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">مبلغ معلق</p>
                  <p className="text-2xl font-bold text-green-900">{formatCurrency(totalAmount)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">معتمد اليوم</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {requests.filter(r => r.status === 'APPROVED' && 
                      new Date(r.createdAt).toDateString() === new Date().toDateString()).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">إجمالي الطلبات</p>
                  <p className="text-2xl font-bold text-purple-900">{requests.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
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
                    placeholder="البحث في الطلبات..."
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
                  <option value="all">جميع الحالات</option>
                  <option value="PENDING">معلق</option>
                  <option value="APPROVED">معتمد</option>
                  <option value="REJECTED">مرفوض</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  تصدير
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد طلبات</h3>
              <p className="text-gray-600">لا توجد طلبات توزيع أرباح حالياً.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{request.project.title}</h3>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1">
                            {request.status === 'PENDING' && 'معلق'}
                            {request.status === 'APPROVED' && 'معتمد'}
                            {request.status === 'REJECTED' && 'مرفوض'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <p className="font-medium">الشريك</p>
                          <p>{request.partner.name}</p>
                        </div>
                        <div>
                          <p className="font-medium">نوع التوزيع</p>
                          <p>{request.distributionType === 'PARTIAL' ? 'جزئي' : 'نهائي'}</p>
                        </div>
                        <div>
                          <p className="font-medium">إجمالي المبلغ</p>
                          <p className="font-bold text-green-600">{formatCurrency(request.totalAmount)}</p>
                        </div>
                        <div>
                          <p className="font-medium">الربح المقدر ({request.estimatedGainPercent}%)</p>
                          <p className="font-bold text-blue-600">{formatCurrency(request.estimatedProfit)}</p>
                        </div>
                        <div>
                          <p className="font-medium">رأس المال المُسترد</p>
                          <p className="font-bold text-purple-600">{formatCurrency(request.estimatedReturnCapital)}</p>
                        </div>
                        <div>
                          <p className="font-medium">إغلاق الصفقة</p>
                          <p>{request.estimatedClosingPercent}%</p>
                        </div>
                        <div>
                          <p className="font-medium">عدد المستثمرين</p>
                          <p>{request.project.uniqueInvestorCount || 0}</p>
                        </div>
                        <div>
                          <p className="font-medium">نسبة ساهم ({Number(request.sahemInvestPercent)}%)</p>
                          <p className="text-orange-600">{formatCurrency((request.estimatedProfit * Number(request.sahemInvestPercent)) / 100)}</p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">الوصف:</span> {request.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        تم الإرسال في: {formatDate(request.createdAt)}
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedRequest(request)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        تفاصيل
                      </Button>
                      
                      {request.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(request.id)}
                            disabled={processing === request.id}
                            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            موافقة
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const reason = prompt('سبب الرفض:')
                              if (reason) handleReject(request.id, reason)
                            }}
                            disabled={processing === request.id}
                            className="text-red-600 border-red-300 hover:bg-red-50 flex items-center gap-1"
                          >
                            <XCircle className="w-4 h-4" />
                            رفض
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Request Details Modal */}
        {selectedRequest && (() => {
          const currentFields = editingFields || initializeEditingFields(selectedRequest)
          const distribution = calculateDistribution(currentFields, selectedRequest)
          
          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">تفاصيل طلب توزيع الأرباح</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedRequest.distributionType === 'FINAL' ? (
                          <span className={`font-medium ${distribution.isLoss ? 'text-red-600' : 'text-green-600'}`}>
                            توزيع نهائي - {distribution.isLoss ? 'خسارة' : 'ربح'}
                          </span>
                        ) : (
                          <span className="font-medium text-blue-600">توزيع جزئي</span>
                        )}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(null)
                        setEditingFields(null)
                      }}
                    >
                      إغلاق
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {/* Partner Data - Now Editable */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                        <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
                        بيانات التوزيع (قابلة للتعديل)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            إجمالي المبلغ (USD)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={currentFields.totalAmount}
                            onChange={(e) => setEditingFields({
                              ...currentFields,
                              totalAmount: Number(e.target.value)
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            نسبة الربح المقدر (%)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={currentFields.estimatedGainPercent}
                            onChange={(e) => {
                              const percent = Number(e.target.value)
                              const profit = (selectedRequest.project.currentFunding * percent) / 100
                              setEditingFields({
                                ...currentFields,
                                estimatedGainPercent: percent,
                                estimatedProfit: profit,
                                isLoss: percent < 0
                              })
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            نسبة إغلاق الصفقة (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={currentFields.estimatedClosingPercent}
                            onChange={(e) => setEditingFields({
                              ...currentFields,
                              estimatedClosingPercent: Number(e.target.value)
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            مبلغ الربح (USD)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={currentFields.estimatedProfit}
                            onChange={(e) => {
                              const profit = Number(e.target.value)
                              setEditingFields({
                                ...currentFields,
                                estimatedProfit: profit,
                                isLoss: profit < 0
                              })
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            رأس المال المُسترد (USD)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={currentFields.estimatedReturnCapital}
                            onChange={(e) => setEditingFields({
                              ...currentFields,
                              estimatedReturnCapital: Number(e.target.value)
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            نوع التوزيع
                          </label>
                          <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                            {selectedRequest.distributionType === 'PARTIAL' ? 'جزئي' : 'نهائي'}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-white border border-blue-200 rounded-md">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">الوصف:</span> {selectedRequest.description}
                        </p>
                      </div>
                    </div>

                    {/* Commission Settings */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                        <Target className="w-5 h-5 mr-2 text-orange-600" />
                        إعدادات العمولة
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            نسبة ساهم انفست (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={currentFields.sahemInvestPercent}
                            onChange={(e) => setEditingFields({
                              ...currentFields,
                              sahemInvestPercent: Number(e.target.value)
                            })}
                            disabled={distribution.isLoss && selectedRequest.distributionType === 'FINAL'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                          />
                          {distribution.isLoss && selectedRequest.distributionType === 'FINAL' && (
                            <p className="text-xs text-red-600 mt-1">لا عمولة في حالة الخسارة</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            نسبة الاحتياطي (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={currentFields.reservedGainPercent}
                            onChange={(e) => setEditingFields({
                              ...currentFields,
                              reservedGainPercent: Number(e.target.value)
                            })}
                            disabled={distribution.isLoss && selectedRequest.distributionType === 'FINAL'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                          />
                          {distribution.isLoss && selectedRequest.distributionType === 'FINAL' && (
                            <p className="text-xs text-red-600 mt-1">لا احتياطي في حالة الخسارة</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            حالة الصفقة
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={currentFields.isLoss}
                              onChange={(e) => setEditingFields({
                                ...currentFields,
                                isLoss: e.target.checked
                              })}
                              disabled={selectedRequest.distributionType === 'PARTIAL'}
                              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            />
                            <span className="text-sm">خسارة (لا عمولة)</span>
                          </div>
                          {selectedRequest.distributionType === 'PARTIAL' && (
                            <p className="text-xs text-gray-600 mt-1">متاح فقط في التوزيع النهائي</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Distribution Preview */}
                    <div className={`${distribution.isLoss ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} border rounded-lg p-4`}>
                      <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        معاينة التوزيع النهائي
                      </h3>
                      
                      {distribution.isLoss && selectedRequest.distributionType === 'FINAL' ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-white rounded-lg border border-red-300">
                            <div className="flex items-center gap-2 mb-3">
                              <AlertCircle className="w-5 h-5 text-red-600" />
                              <h4 className="font-semibold text-red-800">سيناريو الخسارة</h4>
                            </div>
                            <p className="text-sm text-gray-700 mb-3">
                              في حالة الخسارة، لا يتم خصم عمولات ساهم انفست أو الاحتياطي. 
                              كل المبلغ المتبقي يذهب للمستثمرين لاسترداد رأس المال (ناقص الخسارة).
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="text-center p-3 bg-red-50 rounded-lg">
                                <p className="text-xs text-gray-600 mb-1">عمولة ساهم انفست</p>
                                <p className="font-bold text-red-700">{formatCurrency(0)}</p>
                                <p className="text-xs text-gray-500">0%</p>
                              </div>
                              <div className="text-center p-3 bg-red-50 rounded-lg">
                                <p className="text-xs text-gray-600 mb-1">الاحتياطي</p>
                                <p className="font-bold text-red-700">{formatCurrency(0)}</p>
                                <p className="text-xs text-gray-500">0%</p>
                              </div>
                              <div className="text-center p-3 bg-red-50 rounded-lg">
                                <p className="text-xs text-gray-600 mb-1">الخسارة</p>
                                <p className="font-bold text-red-700">{formatCurrency(Math.abs(currentFields.estimatedProfit))}</p>
                              </div>
                              <div className="text-center p-3 bg-green-100 rounded-lg border border-green-300">
                                <p className="text-xs text-gray-600 mb-1">للمستثمرين (استرداد)</p>
                                <p className="font-bold text-green-700">{formatCurrency(distribution.totalToInvestors)}</p>
                                <p className="text-xs text-gray-500">من أصل {formatCurrency(selectedRequest.project.currentFunding)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-4 bg-white rounded-lg border border-green-300">
                            <div className="flex items-center gap-2 mb-3">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <h4 className="font-semibold text-green-800">
                                {selectedRequest.distributionType === 'FINAL' ? 'سيناريو الربح' : 'توزيع جزئي'}
                              </h4>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                              <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <p className="text-xs text-gray-600 mb-1">إجمالي الربح</p>
                                <p className="font-bold text-blue-700">{formatCurrency(currentFields.estimatedProfit)}</p>
                              </div>
                              <div className="text-center p-3 bg-orange-50 rounded-lg">
                                <p className="text-xs text-gray-600 mb-1">ساهم انفست</p>
                                <p className="font-bold text-orange-700">{formatCurrency(distribution.sahemAmount)}</p>
                                <p className="text-xs text-gray-500">{currentFields.sahemInvestPercent}%</p>
                              </div>
                              <div className="text-center p-3 bg-purple-50 rounded-lg">
                                <p className="text-xs text-gray-600 mb-1">الاحتياطي</p>
                                <p className="font-bold text-purple-700">{formatCurrency(distribution.reserveAmount)}</p>
                                <p className="text-xs text-gray-500">{currentFields.reservedGainPercent}%</p>
                              </div>
                              <div className="text-center p-3 bg-green-50 rounded-lg">
                                <p className="text-xs text-gray-600 mb-1">ربح المستثمرين</p>
                                <p className="font-bold text-green-700">{formatCurrency(distribution.investorsProfit)}</p>
                                <p className="text-xs text-gray-500">{(100 - currentFields.sahemInvestPercent - currentFields.reservedGainPercent).toFixed(1)}%</p>
                              </div>
                              <div className="text-center p-3 bg-teal-50 rounded-lg border-2 border-teal-400">
                                <p className="text-xs text-gray-600 mb-1">إجمالي للمستثمرين</p>
                                <p className="font-bold text-teal-700">{formatCurrency(distribution.totalToInvestors)}</p>
                                <p className="text-xs text-gray-500">ربح + رأس مال</p>
                              </div>
                            </div>
                            {selectedRequest.distributionType === 'FINAL' && (
                              <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-600">
                                  رأس المال المُسترد: <span className="font-semibold">{formatCurrency(distribution.investorsCapital)}</span>
                                </p>
                              </div>
                            )}
                          </div>
                          {(currentFields.sahemInvestPercent + currentFields.reservedGainPercent > 100) && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-red-800 text-sm font-medium flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                تحذير: مجموع النسب ({(currentFields.sahemInvestPercent + currentFields.reservedGainPercent).toFixed(1)}%) يتجاوز 100%
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Deal Info */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">معلومات الصفقة</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex flex-col">
                          <span className="text-gray-600">اسم الصفقة:</span>
                          <span className="font-medium">{selectedRequest.project.title}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-600">الشريك:</span>
                          <span className="font-medium">{selectedRequest.partner.name}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-600">عدد المستثمرين:</span>
                          <span className="font-medium">{selectedRequest.project.uniqueInvestorCount || 0}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-600">هدف التمويل:</span>
                          <span className="font-medium">{formatCurrency(selectedRequest.project.fundingGoal)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-600">التمويل الحالي:</span>
                          <span className="font-medium">{formatCurrency(selectedRequest.project.currentFunding)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-600">تاريخ الطلب:</span>
                          <span className="font-medium">{formatDate(selectedRequest.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {selectedRequest.status === 'PENDING' && (
                      <div className="flex gap-4 pt-4 border-t">
                        <Button
                          onClick={() => {
                            if (!distribution.isLoss && 
                                currentFields.sahemInvestPercent + currentFields.reservedGainPercent > 100) {
                              alert('خطأ: مجموع النسب لا يمكن أن يتجاوز 100%')
                              return
                            }
                            
                            if (confirm(`هل أنت متأكد من الموافقة على هذا التوزيع؟\n\nسيتم توزيع ${formatCurrency(distribution.totalToInvestors)} على ${selectedRequest.project.uniqueInvestorCount} مستثمر`)) {
                              handleApprove(selectedRequest.id, currentFields)
                            }
                          }}
                          disabled={processing === selectedRequest.id || 
                            (!distribution.isLoss && currentFields.sahemInvestPercent + currentFields.reservedGainPercent > 100)}
                          className="bg-green-600 hover:bg-green-700 text-white flex-1"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          موافقة وتوزيع الأرباح
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const reason = prompt('سبب الرفض:')
                            if (reason) handleReject(selectedRequest.id, reason)
                          }}
                          disabled={processing === selectedRequest.id}
                          className="text-red-600 border-red-300 hover:bg-red-50 flex-1"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          رفض الطلب
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })()}
      </div>
    </AdminLayout>
  )
}

export default AdminProfitDistributionsPage