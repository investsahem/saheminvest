'use client'

import { useState, useEffect, useCallback } from 'react'
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
import InvestorBreakdownTable from './components/InvestorBreakdownTable'
import type {
  HistoricalPartialSummary,
  InvestorDistributionDetail,
  InvestorHistoricalData
} from '../../types/profit-distribution'
import {
  calculateInvestorDistributions
} from '../../lib/profit-distribution-client-utils'

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
  reservedAmount?: number
  sahemInvestAmount?: number

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
  // New: actual amounts for admin to set
  reservedAmount: number
  sahemInvestAmount: number
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

  // New state for historical data and investor distributions
  const [historicalData, setHistoricalData] = useState<HistoricalPartialSummary | null>(null)
  const [investorHistoricalData, setInvestorHistoricalData] = useState<InvestorHistoricalData[]>([])
  const [investorDistributions, setInvestorDistributions] = useState<InvestorDistributionDetail[]>([])
  const [loadingHistorical, setLoadingHistorical] = useState(false)

  const fetchRequests = useCallback(async () => {
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
  }, [searchTerm, statusFilter])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  // Fetch historical data when FINAL distribution is selected
  useEffect(() => {
    const loadHistoricalData = async () => {
      if (selectedRequest && selectedRequest.distributionType === 'FINAL') {
        try {
          const data = await fetchHistoricalData(selectedRequest.id)
          if (data) {
            // Calculate investor distributions with historical data
            const totalInvestmentAmount = selectedRequest.project.investments.reduce(
              (sum, inv) => sum + Number(inv.amount), 0
            )
            const currentFields = editingFields || initializeEditingFields(selectedRequest)

            // Calculate correct values using percentages (same as preview)
            const totalCapital = Number(selectedRequest.project.currentFunding)
            const totalProfit = (Number(currentFields.estimatedGainPercent) / 100) * totalCapital
            const partialCapital = data.historicalSummary ? data.historicalSummary.totalPartialCapital : 0
            const finalCapitalToInvestors = totalCapital - partialCapital
            const sahemCommission = (totalProfit * currentFields.sahemInvestPercent) / 100
            const finalProfitToInvestors = totalProfit - sahemCommission

            const investments = selectedRequest.project.investments.map(inv => ({
              investorId: inv.investor.id,
              investorName: inv.investor.name || 'Unknown',
              investorEmail: inv.investor.id, // Will be replaced by actual email from data
              amount: Number(inv.amount)
            }))

            const investorDists = calculateInvestorDistributions(
              investments,
              totalInvestmentAmount,
              finalProfitToInvestors,
              finalCapitalToInvestors,
              data.investorHistoricalData
            )

            setInvestorDistributions(investorDists)
          }
        } catch (error) {
          console.error('Error in loadHistoricalData:', error)
        }
      } else if (selectedRequest && selectedRequest.distributionType !== 'FINAL') {
        // Reset state for non-FINAL distributions
        setHistoricalData(null)
        setInvestorHistoricalData([])
        setInvestorDistributions([])
      }
    }
    loadHistoricalData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRequest?.id, selectedRequest?.distributionType])

  // Recalculate investor distributions when editingFields changes (admin edits amounts)
  useEffect(() => {
    if (selectedRequest && selectedRequest.distributionType === 'FINAL' && editingFields && historicalData) {
      try {
        const totalInvestmentAmount = selectedRequest.project.investments.reduce(
          (sum, inv) => sum + Number(inv.amount), 0
        )

        // Calculate correct values using percentages (same as preview)
        const totalCapital = Number(selectedRequest.project.currentFunding)
        const totalProfit = (Number(editingFields.estimatedGainPercent) / 100) * totalCapital
        const partialCapital = historicalData ? historicalData.totalPartialCapital : 0
        const finalCapitalToInvestors = totalCapital - partialCapital
        const sahemCommission = (totalProfit * editingFields.sahemInvestPercent) / 100
        const finalProfitToInvestors = totalProfit - sahemCommission

        const investments = selectedRequest.project.investments.map(inv => ({
          investorId: inv.investor.id,
          investorName: inv.investor.name || 'Unknown',
          investorEmail: inv.investor.id,
          amount: Number(inv.amount)
        }))

        const investorDists = calculateInvestorDistributions(
          investments,
          totalInvestmentAmount,
          finalProfitToInvestors,
          finalCapitalToInvestors,
          investorHistoricalData
        )

        setInvestorDistributions(investorDists)
        console.log('🔄 Recalculated investor distributions after admin edit:', {
          investorsProfit: finalProfitToInvestors,
          investorsCapital: finalCapitalToInvestors,
          investorCount: investorDists.length
        })
      } catch (error) {
        console.error('Error recalculating investor distributions:', error)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingFields?.estimatedProfit, editingFields?.estimatedReturnCapital, editingFields?.sahemInvestPercent, editingFields?.isLoss])

  // Fetch historical partial distribution data for FINAL distributions
  const fetchHistoricalData = async (requestId: string) => {
    try {
      setLoadingHistorical(true)
      const response = await fetch(`/api/admin/profit-distribution-requests/${requestId}/history`)
      if (response.ok) {
        const data = await response.json()
        setHistoricalData(data.historicalSummary)
        setInvestorHistoricalData(data.investorHistoricalData)
        return data
      }
    } catch (error) {
      console.error('Error fetching historical data:', error)
    } finally {
      setLoadingHistorical(false)
    }
    return null
  }

  // Initialize editing fields from request
  const initializeEditingFields = (request: ProfitDistributionRequest): EditableDistributionFields => {
    // Convert all values to proper numbers
    const totalAmount = Number(request.totalAmount) || 0
    const estimatedGainPercent = Number(request.estimatedGainPercent) || 0
    const estimatedClosingPercent = Number(request.estimatedClosingPercent) || 0
    const estimatedProfit = Number(request.estimatedProfit) || 0
    const estimatedReturnCapital = Number(request.estimatedReturnCapital) || 0

    // For FINAL distributions, always start with 0% commission (admin sets it)
    // For PARTIAL distributions, use partner's submitted values
    const isFinal = request.distributionType === 'FINAL'
    const sahemInvestPercent = isFinal ? 0 : (Number(request.sahemInvestPercent) || 0)
    const reservedGainPercent = isFinal ? 0 : (Number(request.reservedGainPercent) || 0)
    const reservedAmount = isFinal ? 0 : (Number(request.reservedAmount) || 0)
    const sahemInvestAmount = isFinal ? 0 : (Number(request.sahemInvestAmount) || 0)

    return {
      totalAmount,
      estimatedGainPercent,
      estimatedClosingPercent,
      estimatedProfit,
      estimatedReturnCapital,
      sahemInvestPercent,
      reservedGainPercent,
      reservedAmount,
      sahemInvestAmount,
      isLoss: estimatedProfit < 0 || estimatedGainPercent < 0
    }
  }

  // Calculate distribution breakdown
  const calculateDistribution = (fields: EditableDistributionFields, request: ProfitDistributionRequest) => {
    const isFinal = request.distributionType === 'FINAL'
    const isPartial = request.distributionType === 'PARTIAL'
    const isLoss = fields.isLoss

    // Ensure all values are proper numbers
    const safeProfit = Number(fields.estimatedProfit) || 0
    const safeCapital = Number(fields.estimatedReturnCapital) || 0
    const safeTotalAmount = Number(fields.totalAmount) || 0
    const safeSahemPercent = Number(fields.sahemInvestPercent) || 0
    const safeReservePercent = Number(fields.reservedGainPercent) || 0
    const safeReservedAmount = Number(fields.reservedAmount) || 0
    const safeSahemAmount = Number(fields.sahemInvestAmount) || 0

    let sahemAmount = 0
    let reserveAmount = 0
    let investorsProfit = 0
    let investorsCapital = safeCapital
    let calculatedSahemPercent = safeSahemPercent
    let calculatedReservePercent = safeReservePercent

    if (isPartial) {
      // PARTIAL: Deduct amounts from TOTAL AMOUNT (not from profit)
      sahemAmount = safeSahemAmount
      reserveAmount = safeReservedAmount

      // Calculate percentages from amounts (for display)
      calculatedSahemPercent = safeTotalAmount > 0 ? (safeSahemAmount / safeTotalAmount) * 100 : 0
      calculatedReservePercent = safeTotalAmount > 0 ? (safeReservedAmount / safeTotalAmount) * 100 : 0

      // What goes to investors is the total minus commissions
      investorsProfit = safeTotalAmount - sahemAmount - reserveAmount
      investorsCapital = 0 // No capital return in partial distributions
    } else if (isFinal && isLoss) {
      // FINAL LOSS: No commission, all remaining goes to investors to recover capital
      sahemAmount = 0
      reserveAmount = 0
      investorsProfit = 0
      investorsCapital = safeTotalAmount // All remaining amount for capital recovery
      calculatedSahemPercent = 0
      calculatedReservePercent = 0
    } else {
      // FINAL PROFIT: Only Sahem commission from PROFIT (NO reserve in final)
      sahemAmount = (safeProfit * safeSahemPercent) / 100
      reserveAmount = 0  // NO reserve in final distributions
      investorsProfit = safeProfit - sahemAmount  // Only Sahem commission deducted
      investorsCapital = safeCapital
      calculatedReservePercent = 0  // NO reserve in final
    }

    const totalToInvestors = investorsCapital + investorsProfit

    return {
      sahemAmount,
      reserveAmount,
      investorsProfit,
      investorsCapital,
      totalToInvestors,
      isLoss,
      isFinal,
      isPartial,
      calculatedSahemPercent,
      calculatedReservePercent
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
        // New: send actual amounts
        requestBody.reservedAmount = editedFields.reservedAmount
        requestBody.sahemInvestAmount = editedFields.sahemInvestAmount
        requestBody.isLoss = editedFields.isLoss
      }

      // Include custom investor distributions if available
      if (investorDistributions && investorDistributions.length > 0) {
        requestBody.investorDistributions = investorDistributions.map(inv => ({
          investorId: inv.investorId,
          finalCapital: inv.finalCapital,
          finalProfit: inv.finalProfit,
          partialCapitalHistory: inv.partialCapitalReceived,
          partialProfitHistory: inv.partialProfitReceived
        }))
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
        setInvestorDistributions([])
        setHistoricalData(null)
        setInvestorHistoricalData([])
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
                          <p className="font-bold text-blue-600">{formatCurrency((Number(request.estimatedGainPercent) / 100) * request.project.currentFunding)}</p>
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
                          <p className="text-orange-600">{formatCurrency(((Number(request.estimatedGainPercent) / 100) * request.project.currentFunding * Number(request.sahemInvestPercent)) / 100)}</p>
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
                    {/* Partner Data - Shows current values (including admin edits) */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                        <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
                        بيانات التوزيع الحالية
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            إجمالي المبلغ (USD) {selectedRequest.distributionType === 'FINAL' && '- يتم الحساب تلقائياً'}
                          </label>
                          <div className={`px-3 py-2 border rounded-md font-semibold ${currentFields.totalAmount !== Number(selectedRequest.totalAmount)
                            ? 'bg-green-100 border-green-400 text-green-900'
                            : 'bg-gray-50 border-gray-300'
                            }`}>
                            {formatCurrency(currentFields.totalAmount)}
                            {currentFields.totalAmount !== Number(selectedRequest.totalAmount) && (
                              <span className="text-xs block">(الأصلي: {formatCurrency(Number(selectedRequest.totalAmount))})</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            نسبة الربح المقدر (%)
                          </label>
                          <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-semibold">
                            {currentFields.estimatedGainPercent}%
                          </div>
                        </div>
                        {/* Show closing percent for PARTIAL only */}
                        {selectedRequest.distributionType === 'PARTIAL' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              نسبة إغلاق الصفقة (%)
                            </label>
                            <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-semibold">
                              {currentFields.estimatedClosingPercent}%
                            </div>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            نوع التوزيع
                          </label>
                          <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-semibold">
                            {selectedRequest.distributionType === 'PARTIAL' ? 'جزئي' : 'نهائي'}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-white border border-blue-200 rounded-md">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">الوصف:</span> {selectedRequest.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          ملاحظة: هذه البيانات المقدمة من الشريك (للقراءة فقط).
                          يمكنك تعديل إعدادات العمولة في القسم التالي.
                        </p>
                        {selectedRequest.distributionType === 'FINAL' && historicalData && historicalData.totalPartialCapital > 0 && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-300 rounded text-xs">
                            <strong>تذكير:</strong> تم توزيع {formatCurrency(historicalData.totalPartialCapital)} كتوزيعات جزئية.
                            رأس المال المتبقي = رأس المال الكلي ({formatCurrency(selectedRequest.project.currentFunding)}) - التوزيعات الجزئية ({formatCurrency(historicalData.totalPartialCapital)})
                            = {formatCurrency(selectedRequest.project.currentFunding - historicalData.totalPartialCapital)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Admin Controls Section - Different for PARTIAL vs FINAL */}
                    {selectedRequest.distributionType === 'PARTIAL' ? (
                      // PARTIAL: Admin sets amounts (in USD), percentages calculated automatically
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                          <Target className="w-5 h-5 mr-2 text-green-600" />
                          إعدادات الإدارة (قابلة للتعديل)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              المبلغ المحتفظ به (USD)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={currentFields.reservedAmount}
                              onChange={(e) => setEditingFields({
                                ...currentFields,
                                reservedAmount: Number(e.target.value)
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <p className="text-xs text-gray-600 mt-1">
                              النسبة: {distribution.calculatedReservePercent.toFixed(2)}%
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              عمولة ساهم انفست (USD)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={currentFields.sahemInvestAmount}
                              onChange={(e) => setEditingFields({
                                ...currentFields,
                                sahemInvestAmount: Number(e.target.value)
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <p className="text-xs text-gray-600 mt-1">
                              النسبة: {distribution.calculatedSahemPercent.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-white border border-green-200 rounded-md">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">ملاحظة:</span> يتم خصم هذه المبالغ من المبلغ الإجمالي ({formatCurrency(currentFields.totalAmount)})، وليس من الربح.
                          </p>
                        </div>
                      </div>
                    ) : null}


                    {/* Commission Settings - Only for FINAL distributions */}
                    {selectedRequest.distributionType === 'FINAL' && (
                      <>
                        {/* Commission Settings for FINAL */}
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                            <Target className="w-5 h-5 mr-2 text-orange-600" />
                            إعدادات العمولة للتوزيع النهائي
                          </h3>
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
                              placeholder="0"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            <p className="text-xs text-gray-600 mt-1">
                              المبلغ: {formatCurrency(distribution.sahemAmount)}
                            </p>
                            {currentFields.sahemInvestPercent === 0 && (
                              <p className="text-xs text-blue-600 mt-1">
                                💡 قم بتعيين نسبة العمولة (مثال: 10%)
                              </p>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Distribution Preview */}
                    <div className={`${distribution.isLoss ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} border rounded-lg p-4`}>
                      <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        معاينة التوزيع
                      </h3>

                      {selectedRequest.distributionType === 'PARTIAL' ? (
                        // PARTIAL Distribution Preview
                        <div className="space-y-4">
                          <div className="p-4 bg-white rounded-lg border border-green-300">
                            <div className="flex items-center gap-2 mb-3">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <h4 className="font-semibold text-green-800">توزيع جزئي</h4>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700">المبلغ الإجمالي:</span>
                                <span className="text-lg font-bold text-blue-700">{formatCurrency(currentFields.totalAmount)}</span>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700">المبلغ المحتفظ به:</span>
                                <span className="text-lg font-bold text-red-700">- {formatCurrency(distribution.reserveAmount)}</span>
                                <span className="text-xs text-gray-500">({distribution.calculatedReservePercent.toFixed(2)}%)</span>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700">عمولة ساهم انفست:</span>
                                <span className="text-lg font-bold text-red-700">- {formatCurrency(distribution.sahemAmount)}</span>
                                <span className="text-xs text-gray-500">({distribution.calculatedSahemPercent.toFixed(2)}%)</span>
                              </div>
                              <div className="border-t-2 border-gray-300 pt-3">
                                <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg border-2 border-green-400">
                                  <span className="text-sm font-bold text-gray-800">المبلغ للمستثمرين:</span>
                                  <span className="text-xl font-bold text-green-700">{formatCurrency(distribution.investorsProfit)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          {(distribution.reserveAmount + distribution.sahemAmount >= currentFields.totalAmount) && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-red-800 text-sm font-medium flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                تحذير: مجموع المبالغ المحتفظة والعمولات يساوي أو يتجاوز المبلغ الإجمالي!
                              </p>
                            </div>
                          )}
                        </div>
                      ) : distribution.isLoss ? (
                        // FINAL Distribution - Loss Scenario
                        <div className="space-y-4">
                          <div className="p-4 bg-white rounded-lg border border-red-300">
                            <div className="flex items-center gap-2 mb-3">
                              <AlertCircle className="w-5 h-5 text-red-600" />
                              <h4 className="font-semibold text-red-800">سيناريو الخسارة</h4>
                            </div>
                            <p className="text-sm text-gray-700 mb-3">
                              في حالة الخسارة، لا يتم خصم عمولة ساهم انفست.
                              كل المبلغ المتبقي يذهب للمستثمرين لاسترداد رأس المال (ناقص الخسارة).
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="text-center p-3 bg-red-50 rounded-lg">
                                <p className="text-xs text-gray-600 mb-1">عمولة ساهم انفست</p>
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
                        // FINAL Distribution - Profit Scenario - Global Deal Overview
                        (() => {
                          // Calculate global deal totals (including partial and final)
                          const totalCapital = Number(selectedRequest.project.currentFunding);
                          const totalProfit = (Number(currentFields.estimatedGainPercent) / 100) * totalCapital;

                          // Calculate total capital returned to investors (partial + final)
                          // Auto-calculate remaining capital = total capital - partial capital already distributed
                          const partialCapital = historicalData ? historicalData.totalPartialCapital : 0;
                          const finalCapitalToInvestors = totalCapital - partialCapital; // Auto-calculated, not partner-submitted
                          const globalCapitalReturned = totalCapital; // Full capital is always returned

                          // Calculate total profit to investors (should be only in final)
                          // Use calculated profit (percentage × capital) not the submitted estimatedProfit
                          const partialProfit = historicalData ? historicalData.totalPartialProfit : 0;
                          // Final profit = total calculated profit - Sahem commission - any partial profit already distributed
                          const sahemCommissionFromProfit = (totalProfit * currentFields.sahemInvestPercent) / 100;
                          const finalProfitToInvestors = totalProfit - sahemCommissionFromProfit - partialProfit;
                          const globalProfitToInvestors = totalProfit - sahemCommissionFromProfit;

                          // Calculate Sahem commission (from profit only)
                          const sahemCommission = distribution.sahemAmount;
                          const partialSahemCommission = historicalData ? historicalData.totalSahemCommission : 0;
                          const globalSahemCommission = partialSahemCommission + sahemCommission;

                          // Total to investors
                          const globalTotalToInvestors = globalCapitalReturned + globalProfitToInvestors;

                          // Grand total of the deal
                          const grandTotal = totalCapital + totalProfit;

                          return (
                            <div className="space-y-4">
                              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-400">
                                <div className="flex items-center gap-2 mb-4">
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                  <h4 className="font-semibold text-green-800">معاينة التوزيع - الصفقة بالكامل</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                  {/* Total Capital */}
                                  <div className="bg-white p-4 rounded-lg border border-blue-300">
                                    <p className="text-xs text-gray-600 mb-2">رأس المال الكلي المسترد</p>
                                    <p className="text-2xl font-bold text-blue-700">{formatCurrency(globalCapitalReturned)}</p>
                                    <div className="mt-2 pt-2 border-t border-blue-100">
                                      <p className="text-xs text-gray-500">جزئي: {formatCurrency(partialCapital)}</p>
                                      <p className="text-xs text-gray-500">نهائي: {formatCurrency(finalCapitalToInvestors)}</p>
                                    </div>
                                    <p className="text-xs text-blue-600 mt-2">
                                      من أصل {formatCurrency(totalCapital)}
                                    </p>
                                  </div>

                                  {/* Total Profit */}
                                  <div className="bg-white p-4 rounded-lg border border-green-300">
                                    <p className="text-xs text-gray-600 mb-2">الأرباح الكلية للمستثمرين</p>
                                    <p className="text-2xl font-bold text-green-700">{formatCurrency(globalProfitToInvestors)}</p>
                                    <div className="mt-2 pt-2 border-t border-green-100">
                                      <p className="text-xs text-gray-500">جزئي: {formatCurrency(partialProfit)}</p>
                                      <p className="text-xs text-gray-500">نهائي: {formatCurrency(finalProfitToInvestors)}</p>
                                    </div>
                                    <p className="text-xs text-green-600 mt-2">
                                      من أصل {formatCurrency(totalProfit)} ({currentFields.estimatedGainPercent}%)
                                    </p>
                                  </div>

                                  {/* Grand Total */}
                                  <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-lg border-2 border-purple-400">
                                    <p className="text-xs text-purple-800 font-semibold mb-2">الإجمالي الكلي للمستثمرين</p>
                                    <p className="text-2xl font-bold text-purple-900">{formatCurrency(globalTotalToInvestors)}</p>
                                    <p className="text-xs text-purple-600 mt-2">رأس المال + الأرباح</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      من أصل {formatCurrency(grandTotal)}
                                    </p>
                                  </div>
                                </div>


                                {/* Note */}
                                <div className="mt-3 p-2 bg-white/70 rounded-lg border border-green-200">
                                  <p className="text-xs text-gray-700">
                                    <strong>ملاحظة:</strong> هذه المعاينة تعرض الأرقام الإجمالية للصفقة بالكامل (جزئي + نهائي) وتتحدث ديناميكياً مع نسبة العمولة.
                                  </p>
                                </div>
                              </div>

                              {(Number(currentFields.sahemInvestPercent) > 100) && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                  <p className="text-red-800 text-sm font-medium flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    تحذير: نسبة العمولة ({Number(currentFields.sahemInvestPercent).toFixed(1)}%) تتجاوز 100%
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })()
                      )}
                    </div>

                    {/* FINAL Distribution: Show new sophisticated components */}
                    {selectedRequest.distributionType === 'FINAL' && (
                      <>
                        {/* Per-Investor Breakdown Table */}
                        {investorDistributions.length > 0 && (
                          <InvestorBreakdownTable
                            investors={investorDistributions}
                            expectedTotalProfit={distribution.investorsProfit}
                            expectedTotalCapital={distribution.investorsCapital}
                            onInvestorAmountsChange={(updated) => {
                              setInvestorDistributions(updated)
                            }}
                            readonly={false}
                          />
                        )}
                      </>
                    )}

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
                            if (!distribution.isLoss && Number(currentFields.sahemInvestPercent) > 100) {
                              alert('خطأ: نسبة العمولة لا يمكن أن تتجاوز 100%')
                              return
                            }

                            if (confirm(`هل أنت متأكد من الموافقة على هذا التوزيع؟\n\nسيتم توزيع ${formatCurrency(distribution.totalToInvestors)} على ${selectedRequest.project.uniqueInvestorCount} مستثمر`)) {
                              handleApprove(selectedRequest.id, currentFields)
                            }
                          }}
                          disabled={processing === selectedRequest.id ||
                            (!distribution.isLoss && Number(currentFields.sahemInvestPercent) > 100)}
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