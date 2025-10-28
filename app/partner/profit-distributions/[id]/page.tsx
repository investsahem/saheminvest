'use client'

import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import PartnerLayout from '../../../components/layout/PartnerLayout'
import { useTranslation } from '../../../components/providers/I18nProvider'
import { Card, CardContent } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import {
  DollarSign,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Target,
  Activity
} from 'lucide-react'
import type { PartnerDistributionDetails } from '../../../types/profit-distribution'

export default function PartnerDistributionDetailsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const router = useRouter()
  const unwrappedParams = use(params)
  const [details, setDetails] = useState<PartnerDistributionDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/partner/profit-distribution-requests/${unwrappedParams.id}`)
        if (response.ok) {
          const data = await response.json()
          setDetails(data)
        } else {
          console.error('Failed to fetch distribution details')
        }
      } catch (error) {
        console.error('Error fetching distribution details:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchDetails()
    }
  }, [unwrappedParams.id, session])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4" />
      case 'PENDING':
        return <Clock className="w-4 h-4" />
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <PartnerLayout
        title={t('partner.distribution_details')}
        subtitle={t('partner.viewing_distribution_request')}
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PartnerLayout>
    )
  }

  if (!details) {
    return (
      <PartnerLayout
        title={t('partner.distribution_details')}
        subtitle={t('partner.viewing_distribution_request')}
      >
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">طلب غير موجود</h3>
            <p className="text-gray-600 mb-4">لم يتم العثور على تفاصيل هذا الطلب.</p>
            <Button onClick={() => router.push('/partner/profit-distributions')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              العودة إلى قائمة الطلبات
            </Button>
          </CardContent>
        </Card>
      </PartnerLayout>
    )
  }

  const isFinal = details.distributionType === 'FINAL'

  return (
    <PartnerLayout
      title={t('partner.distribution_details')}
      subtitle={details.dealTitle}
    >
      <div className="space-y-6">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.push('/partner/profit-distributions')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          العودة
        </Button>

        {/* Request Status */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{details.dealTitle}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {isFinal ? 'توزيع نهائي' : 'توزيع جزئي'} •  تم الإرسال في {formatDate(details.requestedAt)}
                </p>
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(details.status)}`}>
                {getStatusIcon(details.status)}
                {details.status === 'APPROVED' && 'معتمد'}
                {details.status === 'PENDING' && 'معلق'}
                {details.status === 'REJECTED' && 'مرفوض'}
              </div>
            </div>

            {details.status === 'REJECTED' && details.rejectionReason && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>سبب الرفض:</strong> {details.rejectionReason}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Distribution Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">إجمالي المبلغ</p>
                  <p className="text-2xl font-bold text-green-900">{formatCurrency(details.totalAmount)}</p>
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
                  <p className="text-sm font-medium text-blue-700">نسبة الربح المقدر</p>
                  <p className="text-2xl font-bold text-blue-900">{details.estimatedGainPercent}%</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-r border-2 ${details.profitabilityStatus.isProfitable ? 'from-green-50 to-emerald-50 border-green-300' : 'from-red-50 to-orange-50 border-red-300'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">حالة الصفقة</p>
                  <p className={`text-lg font-bold ${details.profitabilityStatus.isProfitable ? 'text-green-900' : 'text-red-900'}`}>
                    {details.profitabilityStatus.statusMessage}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${details.profitabilityStatus.isProfitable ? 'bg-green-100' : 'bg-red-100'}`}>
                  {details.profitabilityStatus.isProfitable ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Historical Partial Distributions (only for FINAL) */}
        {isFinal && details.historicalSummary.partialDistributionCount > 0 && (
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                التوزيعات الجزئية السابقة
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <p className="text-sm text-gray-600">عدد التوزيعات السابقة</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {details.historicalSummary.partialDistributionCount}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <p className="text-sm text-gray-600">إجمالي المبلغ الموزع سابقاً</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatCurrency(details.historicalSummary.totalPartialAmount)}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">تواريخ التوزيعات</h4>
                <div className="flex flex-wrap gap-2">
                  {details.historicalSummary.distributionDates.map((date, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"
                    >
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(date)}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Commission Breakdown */}
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-orange-600" />
              تفصيل العمولات والتوزيع
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <p className="text-xs text-gray-600 mb-1">إجمالي الربح</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(details.commissionBreakdown.totalProfit)}
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <p className="text-xs text-gray-600 mb-1">عمولة ساهم انفست</p>
                <p className="text-xl font-bold text-orange-700">
                  {formatCurrency(details.commissionBreakdown.sahemInvestAmount)}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  {details.commissionBreakdown.sahemPercent}%
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <p className="text-xs text-gray-600 mb-1">مبلغ الاحتياطي</p>
                <p className="text-xl font-bold text-purple-700">
                  {formatCurrency(details.commissionBreakdown.reservedAmount)}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  {details.commissionBreakdown.reservePercent}%
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 border-2 border-green-300">
                <p className="text-xs text-gray-600 mb-1">مجموع المستثمرين</p>
                <p className="text-xl font-bold text-green-700">
                  {formatCurrency(details.commissionBreakdown.investorPool)}
                </p>
                <p className="text-xs text-green-600 mt-1">بعد العمولات</p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white rounded-lg border border-orange-200">
              <p className="text-xs text-gray-600">
                <strong>ملاحظة:</strong> هذه الأرقام تمثل إجمالي التوزيع على مستوى الصفقة. 
                لا يتم عرض تفاصيل المستثمرين الفردية للحفاظ على خصوصيتهم.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        {details.description && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">الوصف</h3>
              <p className="text-gray-700 leading-relaxed">{details.description}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PartnerLayout>
  )
}

