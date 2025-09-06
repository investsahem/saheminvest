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
  }
  partner: {
    id: string
    name: string
    email: string
  }
  totalAmount: number
  distributionType: 'PARTIAL' | 'FINAL'
  description: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  distributionData: Array<{
    investorId: string
    investorName: string
    investmentAmount: number
    profitAmount: number
    profitRate: number
  }>
}

const AdminProfitDistributionsPage = () => {
  const { data: session } = useSession()
  const [requests, setRequests] = useState<ProfitDistributionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState<ProfitDistributionRequest | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)

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

  const handleApprove = async (requestId: string) => {
    try {
      setProcessing(requestId)
      const response = await fetch(`/api/admin/profit-distribution-requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        alert('تم الموافقة على توزيع الأرباح وتم إضافتها لمحافظ المستثمرين')
        fetchRequests()
        setSelectedRequest(null)
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
                          <p className="font-medium">عدد المستثمرين</p>
                          <p>{request.distributionData.length}</p>
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
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">تفاصيل طلب توزيع الأرباح</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedRequest(null)}
                  >
                    إغلاق
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Request Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">معلومات الطلب</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">الصفقة:</span>
                          <span className="font-medium">{selectedRequest.project.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">الشريك:</span>
                          <span className="font-medium">{selectedRequest.partner.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">نوع التوزيع:</span>
                          <span className="font-medium">
                            {selectedRequest.distributionType === 'PARTIAL' ? 'توزيع جزئي' : 'توزيع نهائي'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">إجمالي المبلغ:</span>
                          <span className="font-bold text-green-600">{formatCurrency(selectedRequest.totalAmount)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">معلومات الصفقة</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">هدف التمويل:</span>
                          <span className="font-medium">{formatCurrency(selectedRequest.project.fundingGoal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">التمويل المحقق:</span>
                          <span className="font-medium">{formatCurrency(selectedRequest.project.currentFunding)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">عدد المستثمرين:</span>
                          <span className="font-medium">{selectedRequest.distributionData.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Investor Distribution */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">توزيع الأرباح على المستثمرين</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-right py-3 px-4 font-medium text-gray-600">المستثمر</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-600">مبلغ الاستثمار</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-600">مبلغ الربح</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-600">معدل الربح</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedRequest.distributionData.map((distribution, index) => (
                            <tr key={index} className="border-t border-gray-100">
                              <td className="py-3 px-4 font-medium">{distribution.investorName}</td>
                              <td className="py-3 px-4">{formatCurrency(distribution.investmentAmount)}</td>
                              <td className="py-3 px-4 text-green-600 font-bold">{formatCurrency(distribution.profitAmount)}</td>
                              <td className="py-3 px-4">{distribution.profitRate.toFixed(1)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Actions */}
                  {selectedRequest.status === 'PENDING' && (
                    <div className="flex gap-4 pt-4 border-t">
                      <Button
                        onClick={() => handleApprove(selectedRequest.id)}
                        disabled={processing === selectedRequest.id}
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
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminProfitDistributionsPage