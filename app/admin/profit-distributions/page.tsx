'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslation } from '../../components/providers/I18nProvider'
import AdminLayout from '../../components/layout/AdminLayout'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { 
  CheckCircle, XCircle, Clock, Users, DollarSign, 
  Calendar, Eye, AlertCircle, TrendingUp, FileText
} from 'lucide-react'

interface ProfitDistributionRequest {
  id: string
  totalAmount: number
  distributionData: {
    investorId: string
    investorName: string
    investmentAmount: number
    profitAmount: number
  }[]
  description: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  reviewedAt?: string
  rejectionReason?: string
  project: {
    id: string
    title: string
    currentFunding: number
    fundingGoal: number
  }
  partner: {
    id: string
    name: string
    email: string
  }
}

const ProfitDistributionsPage = () => {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const [requests, setRequests] = useState<ProfitDistributionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<ProfitDistributionRequest | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [processing, setProcessing] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // Fetch profit distribution requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/profit-distribution-requests', {
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          setRequests(data.requests)
        } else {
          console.error('Failed to fetch requests')
        }
      } catch (error) {
        console.error('Error fetching requests:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4" />
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const handleViewDetails = (request: ProfitDistributionRequest) => {
    setSelectedRequest(request)
    setShowDetailsModal(true)
  }

  const handleApproveRequest = async (requestId: string) => {
    try {
      setProcessing(requestId)
      
      const response = await fetch(`/api/admin/profit-distribution-requests?id=${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'APPROVE'
        }),
        credentials: 'include'
      })

      if (response.ok) {
        // Refresh requests
        window.location.reload()
      } else {
        const error = await response.json()
        alert(`خطأ في الموافقة: ${error.error}`)
      }
    } catch (error) {
      console.error('Error approving request:', error)
      alert('حدث خطأ في الموافقة على الطلب')
    } finally {
      setProcessing(null)
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      setProcessing(requestId)
      
      const response = await fetch(`/api/admin/profit-distribution-requests?id=${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'REJECT',
          rejectionReason
        }),
        credentials: 'include'
      })

      if (response.ok) {
        // Refresh requests
        window.location.reload()
      } else {
        const error = await response.json()
        alert(`خطأ في الرفض: ${error.error}`)
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
      alert('حدث خطأ في رفض الطلب')
    } finally {
      setProcessing(null)
      setRejectionReason('')
    }
  }

  if (loading) {
    return (
      <AdminLayout title="طلبات توزيع الأرباح" subtitle="مراجعة وموافقة طلبات توزيع الأرباح">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="طلبات توزيع الأرباح" subtitle="مراجعة وموافقة طلبات توزيع الأرباح">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">طلبات قيد المراجعة</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {requests.filter(r => r.status === 'PENDING').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">طلبات موافق عليها</p>
                  <p className="text-2xl font-bold text-green-600">
                    {requests.filter(r => r.status === 'APPROVED').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي المبالغ المطلوبة</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(
                      requests
                        .filter(r => r.status === 'PENDING')
                        .reduce((sum, r) => sum + r.totalAmount, 0)
                    )}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requests List */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">طلبات توزيع الأرباح</h3>
            
            {requests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-right py-3 px-4 font-medium text-gray-600">الصفقة</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">الشريك</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">المبلغ الإجمالي</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">عدد المستثمرين</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">تاريخ الطلب</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">الحالة</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request) => (
                      <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{request.project.title}</p>
                            <p className="text-sm text-gray-600">{request.description}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{request.partner.name}</p>
                            <p className="text-sm text-gray-600">{request.partner.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-medium text-green-600">
                          {formatCurrency(request.totalAmount)}
                        </td>
                        <td className="py-4 px-4">
                          {request.distributionData.length}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {formatDate(request.createdAt)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            <span className="mr-1">
                              {request.status === 'PENDING' && 'قيد المراجعة'}
                              {request.status === 'APPROVED' && 'موافق عليه'}
                              {request.status === 'REJECTED' && 'مرفوض'}
                            </span>
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(request)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              عرض
                            </Button>
                            
                            {request.status === 'PENDING' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveRequest(request.id)}
                                  disabled={processing === request.id}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  موافقة
                                </Button>
                                
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const reason = prompt('سبب الرفض (اختياري):')
                                    if (reason !== null) {
                                      setRejectionReason(reason)
                                      handleRejectRequest(request.id)
                                    }
                                  }}
                                  disabled={processing === request.id}
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  رفض
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
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبات</h3>
                <p className="text-gray-600">لم يتم تقديم أي طلبات توزيع أرباح بعد.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details Modal */}
        {showDetailsModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">تفاصيل طلب توزيع الأرباح</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    إغلاق
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Request Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">معلومات الطلب</h3>
                      <div className="space-y-2">
                        <p><strong>الصفقة:</strong> {selectedRequest.project.title}</p>
                        <p><strong>الشريك:</strong> {selectedRequest.partner.name}</p>
                        <p><strong>الوصف:</strong> {selectedRequest.description}</p>
                        <p><strong>تاريخ الطلب:</strong> {formatDate(selectedRequest.createdAt)}</p>
                        <p><strong>المبلغ الإجمالي:</strong> {formatCurrency(selectedRequest.totalAmount)}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">معلومات الصفقة</h3>
                      <div className="space-y-2">
                        <p><strong>التمويل الحالي:</strong> {formatCurrency(selectedRequest.project.currentFunding)}</p>
                        <p><strong>هدف التمويل:</strong> {formatCurrency(selectedRequest.project.fundingGoal)}</p>
                        <p><strong>نسبة التمويل:</strong> {((selectedRequest.project.currentFunding / selectedRequest.project.fundingGoal) * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Distribution Details */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">توزيع الأرباح على المستثمرين</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-right py-3 px-4 font-medium text-gray-600">المستثمر</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-600">مبلغ الاستثمار</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-600">مبلغ الربح</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-600">نسبة العائد</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedRequest.distributionData.map((distribution, index) => (
                            <tr key={index} className="border-t border-gray-200">
                              <td className="py-3 px-4 font-medium">{distribution.investorName}</td>
                              <td className="py-3 px-4">{formatCurrency(distribution.investmentAmount)}</td>
                              <td className="py-3 px-4 text-green-600 font-medium">
                                {formatCurrency(distribution.profitAmount)}
                              </td>
                              <td className="py-3 px-4 text-blue-600 font-medium">
                                {((distribution.profitAmount / distribution.investmentAmount) * 100).toFixed(2)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td className="py-3 px-4 font-bold">الإجمالي</td>
                            <td className="py-3 px-4 font-bold">
                              {formatCurrency(selectedRequest.distributionData.reduce((sum, d) => sum + d.investmentAmount, 0))}
                            </td>
                            <td className="py-3 px-4 font-bold text-green-600">
                              {formatCurrency(selectedRequest.totalAmount)}
                            </td>
                            <td className="py-3 px-4 font-bold text-blue-600">
                              {(
                                (selectedRequest.totalAmount / 
                                selectedRequest.distributionData.reduce((sum, d) => sum + d.investmentAmount, 0)) * 100
                              ).toFixed(2)}%
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Actions for pending requests */}
                  {selectedRequest.status === 'PENDING' && (
                    <div className="flex gap-4 pt-4 border-t border-gray-200">
                      <Button
                        onClick={() => {
                          handleApproveRequest(selectedRequest.id)
                          setShowDetailsModal(false)
                        }}
                        disabled={processing === selectedRequest.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        موافقة على الطلب
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => {
                          const reason = prompt('سبب الرفض (اختياري):')
                          if (reason !== null) {
                            setRejectionReason(reason)
                            handleRejectRequest(selectedRequest.id)
                            setShowDetailsModal(false)
                          }
                        }}
                        disabled={processing === selectedRequest.id}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        رفض الطلب
                      </Button>
                    </div>
                  )}

                  {/* Status info for processed requests */}
                  {selectedRequest.status !== 'PENDING' && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium">
                        حالة الطلب: 
                        <span className={selectedRequest.status === 'APPROVED' ? 'text-green-600' : 'text-red-600'}>
                          {selectedRequest.status === 'APPROVED' ? ' موافق عليه' : ' مرفوض'}
                        </span>
                      </p>
                      {selectedRequest.reviewedAt && (
                        <p className="text-sm text-gray-600 mt-1">
                          تاريخ المراجعة: {formatDate(selectedRequest.reviewedAt)}
                        </p>
                      )}
                      {selectedRequest.rejectionReason && (
                        <p className="text-sm text-red-600 mt-1">
                          سبب الرفض: {selectedRequest.rejectionReason}
                        </p>
                      )}
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

export default ProfitDistributionsPage
