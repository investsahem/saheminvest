'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTranslation } from '../../../../components/providers/I18nProvider'
import PartnerLayout from '../../../../components/layout/PartnerLayout'
import { Card, CardContent } from '../../../../components/ui/Card'
import { Button } from '../../../../components/ui/Button'
import { Input } from '../../../../components/ui/Input'
import { 
  ArrowLeft, Users, DollarSign, TrendingUp, Calendar, 
  Plus, Send, AlertCircle, CheckCircle, Clock, Eye,
  BarChart3, PieChart, Activity, Target, FileText
} from 'lucide-react'

interface Deal {
  id: string
  title: string
  description: string
  status: string
  fundingGoal: number
  currentFunding: number
  expectedReturn: number
  duration: number
  startDate: string
  endDate: string
  thumbnailImage?: string
  investments: Investment[]
  profitDistributions: ProfitDistribution[]
  _count: {
    investments: number
  }
}

interface Investment {
  id: string
  amount: number
  investmentDate: string
  investor: {
    id: string
    name: string
  }
}

interface ProfitDistribution {
  id: string
  amount: number
  profitRate: number
  distributionDate: string
  description: string
  status: string
}

interface ProfitDistributionForm {
  totalAmount: number
  description: string
  distributionType: 'PARTIAL' | 'FINAL'
  distributionData: {
    investorId: string
    investorName: string
    investmentAmount: number
    profitAmount: number
  }[]
}

const DealManagePage = () => {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const dealId = params.id as string

  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)
  const [showProfitForm, setShowProfitForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [profitForm, setProfitForm] = useState<ProfitDistributionForm>({
    totalAmount: 0,
    description: '',
    distributionType: 'PARTIAL',
    distributionData: []
  })

  // Fetch deal details
  useEffect(() => {
    const fetchDeal = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/deals/${dealId}`, {
          credentials: 'include'
        })

        if (response.ok) {
          const dealData = await response.json()
          setDeal(dealData)
          
          // Initialize profit distribution form
          console.log('Deal data loaded:', {
            dealId: dealData.id,
            title: dealData.title,
            investmentsCount: dealData.investments?.length || 0,
            investments: dealData.investments
          })
          
          if (dealData.investments && dealData.investments.length > 0) {
            const distributionData = dealData.investments.map((inv: Investment, index: number) => ({
              investorId: inv.investor.id,
              investorName: `مستثمر #${index + 1}`,
              investmentAmount: Number(inv.amount),
              profitAmount: 0
            }))
            
            console.log('Setting profit form distribution data:', distributionData)
            
            setProfitForm(prev => ({
              ...prev,
              distributionData
            }))
          } else {
            console.log('No investments found in deal')
          }
        } else {
          console.error('Failed to fetch deal')
          router.push('/partner/deals')
        }
      } catch (error) {
        console.error('Error fetching deal:', error)
        router.push('/partner/deals')
      } finally {
        setLoading(false)
      }
    }

    if (dealId) {
      fetchDeal()
    }
  }, [dealId, router])

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
      day: 'numeric'
    }).format(new Date(dateString))
  }

  const handleProfitAmountChange = (investorId: string, amount: number) => {
    setProfitForm(prev => {
      const updatedData = prev.distributionData.map(data =>
        data.investorId === investorId
          ? { ...data, profitAmount: amount }
          : data
      )
      
      // Calculate new total
      const newTotal = updatedData.reduce((sum, data) => sum + (data.profitAmount || 0), 0)
      
      return {
        ...prev,
        distributionData: updatedData,
        totalAmount: newTotal
      }
    })
  }

  const handleSubmitProfitDistribution = async () => {
    try {
      setSubmitting(true)

      const response = await fetch('/api/partner/profit-distribution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dealId: dealId,
          distributions: profitForm.distributionData.map(data => ({
            investorId: data.investorId,
            investmentAmount: data.investmentAmount,
            profitAmount: data.profitAmount || 0
          }))
        })
      })

      if (response.ok) {
        alert('تم إرسال طلب توزيع الأرباح للمراجعة الإدارية')
        setShowProfitForm(false)
        // Refresh deal data
        window.location.reload()
      } else {
        alert('حدث خطأ في إرسال الطلب')
      }
    } catch (error) {
      console.error('Error submitting profit distribution:', error)
      alert('حدث خطأ في إرسال الطلب')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <PartnerLayout title="إدارة الصفقة" subtitle="إدارة وتوزيع الأرباح">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PartnerLayout>
    )
  }

  if (!deal) {
    return (
      <PartnerLayout title="إدارة الصفقة" subtitle="الصفقة غير موجودة">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">الصفقة غير موجودة</h2>
            <p className="text-gray-600 mb-4">لا يمكن العثور على الصفقة المطلوبة.</p>
            <Button onClick={() => router.push('/partner/deals')}>
              العودة إلى الصفقات
            </Button>
          </CardContent>
        </Card>
      </PartnerLayout>
    )
  }

  const totalInvested = deal.investments.reduce((sum, inv) => sum + Number(inv.amount), 0)
  const totalDistributed = deal.profitDistributions.reduce((sum, dist) => sum + Number(dist.amount), 0)
  const fundingProgress = (deal.currentFunding / deal.fundingGoal) * 100

  return (
    <PartnerLayout title="إدارة الصفقة" subtitle={deal.title}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.push('/partner/deals')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة إلى الصفقات
          </Button>
          
          <div className="flex gap-2">
            {deal.status === 'COMPLETED' ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">صفقة مكتملة - عرض سجل الأرباح</span>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setShowProfitForm(true)}
                className="bg-green-600 hover:bg-green-700"
                disabled={deal.status !== 'ACTIVE' && deal.status !== 'FUNDED'}
              >
                <Plus className="w-4 h-4 mr-2" />
                توزيع أرباح
              </Button>
            )}
          </div>
        </div>

        {/* Deal Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي الاستثمارات</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalInvested)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">عدد المستثمرين</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {deal._count.investments}
                  </p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">الأرباح الموزعة</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalDistributed)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">حالة الصفقة</p>
                  <p className="text-lg font-bold text-gray-900">
                    {deal.status === 'ACTIVE' && 'نشطة'}
                    {deal.status === 'FUNDED' && 'مموّلة'}
                    {deal.status === 'COMPLETED' && 'مكتملة'}
                    {deal.status === 'DRAFT' && 'مسودة'}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deal Progress */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">تقدم الصفقة</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>التمويل المحقق</span>
                  <span>{fundingProgress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{formatCurrency(deal.currentFunding)}</span>
                  <span>{formatCurrency(deal.fundingGoal)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Investors List */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">قائمة المستثمرين</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4 font-medium text-gray-600">المستثمر</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">مبلغ الاستثمار</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">تاريخ الاستثمار</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">الأرباح المستلمة</th>
                  </tr>
                </thead>
                <tbody>
                  {deal.investments.map((investment, index) => {
                    const investorProfits = deal.profitDistributions
                      .filter(dist => dist.status === 'COMPLETED')
                      .reduce((sum, dist) => {
                        // Calculate this investor's share based on investment ratio
                        const investorShare = (Number(investment.amount) / totalInvested) * Number(dist.amount)
                        return sum + investorShare
                      }, 0)

                    return (
                      <tr key={investment.id} className="border-b border-gray-100">
                        <td className="py-4 px-4 font-medium">
                          مستثمر #{index + 1}
                        </td>
                        <td className="py-4 px-4">
                          {formatCurrency(Number(investment.amount))}
                        </td>
                        <td className="py-4 px-4">
                          {formatDate(investment.investmentDate)}
                        </td>
                        <td className="py-4 px-4 text-green-600 font-medium">
                          {formatCurrency(investorProfits)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Profit Distribution History */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">سجل توزيع الأرباح</h3>
              {deal.status === 'COMPLETED' && (
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  صفقة مكتملة
                </div>
              )}
            </div>
            
            {deal.profitDistributions.length > 0 ? (
              <div className="space-y-4">
                {/* Summary for completed deals */}
                {deal.status === 'COMPLETED' && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-green-900 mb-2">ملخص الأرباح النهائي</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-green-600">إجمالي الأرباح الموزعة</p>
                        <p className="font-bold text-green-900">{formatCurrency(totalDistributed)}</p>
                      </div>
                      <div>
                        <p className="text-green-600">عدد التوزيعات</p>
                        <p className="font-bold text-green-900">{deal.profitDistributions.length}</p>
                      </div>
                      <div>
                        <p className="text-green-600">معدل العائد</p>
                        <p className="font-bold text-green-900">
                          {((totalDistributed / totalInvested) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-green-600">حالة الصفقة</p>
                        <p className="font-bold text-green-900">مكتملة بنجاح</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {deal.profitDistributions.map((distribution) => (
                  <div key={distribution.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <div>
                      <p className="font-medium text-gray-900">{distribution.description || 'توزيع أرباح'}</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(distribution.distributionDate)} • معدل الربح: {Number(distribution.profitRate).toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(Number(distribution.amount))}
                      </p>
                      <div className="flex items-center gap-1">
                        {distribution.status === 'COMPLETED' && <CheckCircle className="w-4 h-4 text-green-600" />}
                        {distribution.status === 'PENDING' && <Clock className="w-4 h-4 text-yellow-600" />}
                        <span className="text-sm text-gray-600">
                          {distribution.status === 'COMPLETED' && 'مكتمل'}
                          {distribution.status === 'PENDING' && 'قيد المراجعة'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                {deal.status === 'COMPLETED' ? (
                  <div>
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">صفقة مكتملة بدون توزيع أرباح مسجل</p>
                  </div>
                ) : (
                  <div>
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">لم يتم توزيع أرباح بعد</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profit Distribution Form Modal - Only for non-completed deals */}
        {showProfitForm && deal.status !== 'COMPLETED' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">توزيع أرباح جديد</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowProfitForm(false)}
                  >
                    إغلاق
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Distribution Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">نوع التوزيع</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="distributionType"
                          value="PARTIAL"
                          checked={profitForm.distributionType === 'PARTIAL'}
                          onChange={(e) => setProfitForm(prev => ({ ...prev, distributionType: e.target.value as 'PARTIAL' | 'FINAL' }))}
                          className="mr-2"
                        />
                        توزيع جزئي
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="distributionType"
                          value="FINAL"
                          checked={profitForm.distributionType === 'FINAL'}
                          onChange={(e) => setProfitForm(prev => ({ ...prev, distributionType: e.target.value as 'PARTIAL' | 'FINAL' }))}
                          className="mr-2"
                        />
                        توزيع نهائي
                      </label>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">وصف التوزيع</label>
                    <Input
                      value={profitForm.description}
                      onChange={(e) => setProfitForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="مثال: توزيع أرباح الربع الأول"
                    />
                  </div>

                  {/* Investor Profit Distribution */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">توزيع الأرباح على المستثمرين</h3>
                    {profitForm.distributionData.length === 0 ? (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800">لا توجد استثمارات في هذه الصفقة لتوزيع الأرباح عليها.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {profitForm.distributionData.map((data, index) => (
                        <div key={data.investorId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{data.investorName}</p>
                            <p className="text-sm text-gray-600">
                              استثمر: {formatCurrency(data.investmentAmount)}
                            </p>
                          </div>
                          <div className="w-32">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={data.profitAmount || ''}
                              onChange={(e) => handleProfitAmountChange(data.investorId, Number(e.target.value) || 0)}
                              placeholder="0.00"
                              className="text-right"
                            />
                            <label className="text-xs text-gray-500 mt-1 block">مبلغ الربح ($)</label>
                          </div>
                        </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Total Amount */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-900">إجمالي الأرباح:</span>
                      <span className="text-xl font-bold text-blue-600">
                        {formatCurrency(profitForm.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4">
                    <Button
                      onClick={handleSubmitProfitDistribution}
                      disabled={submitting || profitForm.totalAmount <= 0 || !profitForm.description}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {submitting ? 'جاري الإرسال...' : 'إرسال للمراجعة الإدارية'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowProfitForm(false)}
                      disabled={submitting}
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PartnerLayout>
  )
}

export default DealManagePage
