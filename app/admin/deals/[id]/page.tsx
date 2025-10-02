'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation, useI18n } from '../../../components/providers/I18nProvider'
import AdminLayout from '../../../components/layout/AdminLayout'
import { Card, CardContent } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { DealTimeline } from '../../../components/project/DealTimeline'
import { 
  ArrowLeft, Calendar, MapPin, Users, TrendingUp, Shield, 
  Clock, CheckCircle, Star, BarChart3, Target, DollarSign,
  ArrowRight, AlertCircle, Info, Building2, Mail, Phone,
  Globe, User, ExternalLink, Eye, Edit, Trash2, Play, Pause,
  X, Check, FileText, Package, Wallet, Activity
} from 'lucide-react'

interface Investment {
  id: string
  amount: number
  createdAt: string
  status: string
  investor: {
    id: string
    name: string
    email: string
  }
}

interface ProfitDistribution {
  id: string
  amount: number
  profitRate: number
  distributionType: string
  description: string
  status: string
  createdAt: string
  approvedAt?: string
  approvedBy?: {
    name: string
  }
}

interface Deal {
  id: string
  title: string
  description: string
  category: string
  fundingGoal: number
  currentFunding: number
  expectedReturn: number
  duration: number
  riskLevel: string
  thumbnailImage: string
  status: string
  investorCount: number
  minInvestment: number
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
  featured: boolean
  owner: {
    id: string
    name: string
    email: string
  }
  partner?: {
    id: string
    companyName: string
    description?: string
    logo?: string
    website?: string
    email?: string
    phone?: string
    address?: string
    city?: string
    country?: string
    industry?: string
    foundedYear?: number
    employeeCount?: string
    isVerified?: boolean
  }
  investments?: Investment[]
  profitDistributions?: ProfitDistribution[]
  _count?: {
    investments: number
  }
}

export default function AdminDealDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { t } = useTranslation()
  const { locale } = useI18n()
  const dealId = params.id as string
  
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/deals/${dealId}?includePartner=true&includeInvestments=true&includeDistributions=true`)
        
        if (response.ok) {
          const data = await response.json()
          setDeal(data)
        } else if (response.status === 404) {
          setError('Deal not found')
        } else {
          setError('Failed to load deal details')
        }
      } catch (error) {
        console.error('Error fetching deal:', error)
        setError('Network error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (dealId) {
      fetchDeal()
    }
  }, [dealId])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
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
      day: 'numeric'
    })
  }

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'FUNDED': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'COMPLETED': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'PAUSED': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200'
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const formData = new FormData()
      formData.append('status', newStatus)
      
      const response = await fetch(`/api/deals/${dealId}`, {
        method: 'PUT',
        body: formData
      })

      if (response.ok) {
        const updatedDeal = await response.json()
        setDeal(updatedDeal)
        setShowStatusModal(false)
        alert(locale === 'ar' ? 'تم تحديث حالة الصفقة بنجاح' : 'Deal status updated successfully')
      } else {
        throw new Error('Failed to update status')
      }
    } catch (error) {
      console.error('Error updating deal status:', error)
      alert(locale === 'ar' ? 'فشل في تحديث حالة الصفقة' : 'Failed to update deal status')
    }
  }

  if (loading) {
    return (
      <AdminLayout
        title={locale === 'ar' ? 'تحميل...' : 'Loading...'}
        subtitle=""
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (error || !deal) {
    return (
      <AdminLayout
        title={locale === 'ar' ? 'خطأ' : 'Error'}
        subtitle=""
      >
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {error === 'Deal not found' 
                ? (locale === 'ar' ? 'الصفقة غير موجودة' : 'Deal not found')
                : (locale === 'ar' ? 'فشل في تحميل تفاصيل الصفقة' : 'Failed to load deal details')
              }
            </h3>
            <Button onClick={() => router.push('/admin/deals')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {locale === 'ar' ? 'العودة إلى الصفقات' : 'Back to Deals'}
            </Button>
          </CardContent>
        </Card>
      </AdminLayout>
    )
  }

  const totalInvested = deal.investments?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0
  const totalDistributed = deal.profitDistributions?.reduce((sum, dist) => sum + Number(dist.amount), 0) || 0
  const uniqueInvestors = new Set(deal.investments?.map(inv => inv.investor.id) || []).size

  return (
    <AdminLayout
      title={deal.title}
      subtitle={locale === 'ar' ? 'تفاصيل الصفقة الكاملة' : 'Complete Deal Details'}
    >
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="outline" onClick={() => router.push('/admin/deals')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {locale === 'ar' ? 'العودة إلى الصفقات' : 'Back to Deals'}
        </Button>

        {/* Deal Header */}
        <Card>
          <CardContent className="p-6">
            <div className={`flex ${locale === 'ar' ? 'flex-row-reverse' : 'flex-row'} gap-6`}>
              {/* Deal Image */}
              {deal.thumbnailImage && (
                <div className="w-48 h-48 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={deal.thumbnailImage}
                    alt={deal.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {/* Deal Info */}
              <div className="flex-1">
                <div className={`flex ${locale === 'ar' ? 'flex-row-reverse' : 'flex-row'} items-start justify-between mb-4`}>
                  <div>
                    <h1 className={`text-3xl font-bold text-gray-900 mb-2 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                      {deal.title}
                    </h1>
                    <p className={`text-gray-600 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                      {locale === 'ar' ? 'بواسطة' : 'By'} {deal.partner?.companyName || deal.owner.name}
                    </p>
                  </div>
                  <div className={`flex ${locale === 'ar' ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(deal.status)}`}>
                      {deal.status}
                    </div>
                    {deal.featured && (
                      <div className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                        <Star className="w-4 h-4 inline mr-1" />
                        {locale === 'ar' ? 'مميز' : 'Featured'}
                      </div>
                    )}
                  </div>
                </div>
                
                <p className={`text-gray-700 mb-4 ${locale === 'ar' ? 'font-arabic text-right' : ''}`}>
                  {deal.description}
                </p>
                
                {/* Quick Actions */}
                <div className={`flex ${locale === 'ar' ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
                  <Button
                    size="sm"
                    onClick={() => setShowStatusModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    {locale === 'ar' ? 'تغيير الحالة' : 'Change Status'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/deals/${deal.id}`)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {locale === 'ar' ? 'معاينة عامة' : 'Public Preview'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm text-gray-600 mb-1 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                    {locale === 'ar' ? 'هدف التمويل' : 'Funding Goal'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(deal.fundingGoal)}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm text-gray-600 mb-1 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                    {locale === 'ar' ? 'التمويل الحالي' : 'Current Funding'}
                  </p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(deal.currentFunding)}</p>
                  <p className="text-xs text-gray-500">{getProgressPercentage(deal.currentFunding, deal.fundingGoal).toFixed(1)}%</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm text-gray-600 mb-1 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                    {locale === 'ar' ? 'المستثمرون' : 'Investors'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{uniqueInvestors}</p>
                  <p className="text-xs text-gray-500">{deal.investments?.length || 0} {locale === 'ar' ? 'استثمارات' : 'investments'}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm text-gray-600 mb-1 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                    {locale === 'ar' ? 'الأرباح الموزعة' : 'Profits Distributed'}
                  </p>
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalDistributed)}</p>
                  <p className="text-xs text-gray-500">{deal.profitDistributions?.length || 0} {locale === 'ar' ? 'توزيعات' : 'distributions'}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deal Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Deal Details */}
            <Card>
              <CardContent className="p-6">
                <h2 className={`text-xl font-bold text-gray-900 mb-4 ${locale === 'ar' ? 'font-arabic text-right' : ''}`}>
                  {locale === 'ar' ? 'تفاصيل الصفقة' : 'Deal Details'}
                </h2>
                <div className="space-y-3">
                  <div className={`flex ${locale === 'ar' ? 'flex-row-reverse' : 'flex-row'} justify-between`}>
                    <span className={`text-gray-600 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                      {locale === 'ar' ? 'الفئة' : 'Category'}:
                    </span>
                    <span className="font-semibold">{deal.category}</span>
                  </div>
                  <div className={`flex ${locale === 'ar' ? 'flex-row-reverse' : 'flex-row'} justify-between`}>
                    <span className={`text-gray-600 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                      {locale === 'ar' ? 'العائد المتوقع' : 'Expected Return'}:
                    </span>
                    <span className="font-semibold text-green-600">{deal.expectedReturn}%</span>
                  </div>
                  <div className={`flex ${locale === 'ar' ? 'flex-row-reverse' : 'flex-row'} justify-between`}>
                    <span className={`text-gray-600 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                      {locale === 'ar' ? 'المدة' : 'Duration'}:
                    </span>
                    <span className="font-semibold">{deal.duration} {locale === 'ar' ? 'شهر' : 'months'}</span>
                  </div>
                  <div className={`flex ${locale === 'ar' ? 'flex-row-reverse' : 'flex-row'} justify-between`}>
                    <span className={`text-gray-600 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                      {locale === 'ar' ? 'مستوى المخاطرة' : 'Risk Level'}:
                    </span>
                    <span className="font-semibold">{deal.riskLevel}</span>
                  </div>
                  <div className={`flex ${locale === 'ar' ? 'flex-row-reverse' : 'flex-row'} justify-between`}>
                    <span className={`text-gray-600 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                      {locale === 'ar' ? 'الحد الأدنى للاستثمار' : 'Min Investment'}:
                    </span>
                    <span className="font-semibold">{formatCurrency(deal.minInvestment)}</span>
                  </div>
                  <div className={`flex ${locale === 'ar' ? 'flex-row-reverse' : 'flex-row'} justify-between`}>
                    <span className={`text-gray-600 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                      {locale === 'ar' ? 'تاريخ البداية' : 'Start Date'}:
                    </span>
                    <span className="font-semibold">{deal.startDate ? formatDate(deal.startDate) : 'N/A'}</span>
                  </div>
                  <div className={`flex ${locale === 'ar' ? 'flex-row-reverse' : 'flex-row'} justify-between`}>
                    <span className={`text-gray-600 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                      {locale === 'ar' ? 'تاريخ النهاية' : 'End Date'}:
                    </span>
                    <span className="font-semibold">{deal.endDate ? formatDate(deal.endDate) : 'N/A'}</span>
                  </div>
                  <div className={`flex ${locale === 'ar' ? 'flex-row-reverse' : 'flex-row'} justify-between`}>
                    <span className={`text-gray-600 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                      {locale === 'ar' ? 'تاريخ الإنشاء' : 'Created'}:
                    </span>
                    <span className="font-semibold">{formatDate(deal.createdAt)}</span>
                  </div>
                  <div className={`flex ${locale === 'ar' ? 'flex-row-reverse' : 'flex-row'} justify-between`}>
                    <span className={`text-gray-600 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                      {locale === 'ar' ? 'آخر تحديث' : 'Last Updated'}:
                    </span>
                    <span className="font-semibold">{formatDate(deal.updatedAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Partner Information */}
            {deal.partner && (
              <Card>
                <CardContent className="p-6">
                  <h2 className={`text-xl font-bold text-gray-900 mb-4 ${locale === 'ar' ? 'font-arabic text-right' : ''}`}>
                    {locale === 'ar' ? 'معلومات الشريك' : 'Partner Information'}
                  </h2>
                  <div className="space-y-4">
                    <div className={`flex ${locale === 'ar' ? 'flex-row-reverse' : 'flex-row'} items-center gap-4`}>
                      {deal.partner.logo && (
                        <img
                          src={deal.partner.logo}
                          alt={deal.partner.companyName}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <h3 className="font-bold text-lg">{deal.partner.companyName}</h3>
                        {deal.partner.industry && (
                          <p className="text-sm text-gray-600">{deal.partner.industry}</p>
                        )}
                      </div>
                    </div>
                    {deal.partner.description && (
                      <p className={`text-gray-600 ${locale === 'ar' ? 'font-arabic text-right' : ''}`}>
                        {deal.partner.description}
                      </p>
                    )}
                    <div className="space-y-2">
                      {deal.partner.email && (
                        <div className={`flex ${locale === 'ar' ? 'flex-row-reverse' : 'flex-row'} items-center gap-2 text-sm`}>
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{deal.partner.email}</span>
                        </div>
                      )}
                      {deal.partner.phone && (
                        <div className={`flex ${locale === 'ar' ? 'flex-row-reverse' : 'flex-row'} items-center gap-2 text-sm`}>
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{deal.partner.phone}</span>
                        </div>
                      )}
                      {deal.partner.website && (
                        <div className={`flex ${locale === 'ar' ? 'flex-row-reverse' : 'flex-row'} items-center gap-2 text-sm`}>
                          <Globe className="w-4 h-4 text-gray-400" />
                          <a href={deal.partner.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {deal.partner.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Investors List */}
            <Card>
              <CardContent className="p-6">
                <h2 className={`text-xl font-bold text-gray-900 mb-4 ${locale === 'ar' ? 'font-arabic text-right' : ''}`}>
                  {locale === 'ar' ? 'المستثمرون' : 'Investors'} ({uniqueInvestors})
                </h2>
                {deal.investments && deal.investments.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {deal.investments.map((investment) => (
                      <div key={investment.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className={`flex ${locale === 'ar' ? 'flex-row-reverse' : 'flex-row'} justify-between items-start`}>
                          <div>
                            <p className="font-semibold text-gray-900">{investment.investor.name}</p>
                            <p className="text-sm text-gray-600">{investment.investor.email}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(investment.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">{formatCurrency(Number(investment.amount))}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              investment.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {investment.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-gray-500 text-center py-8 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                    {locale === 'ar' ? 'لا يوجد مستثمرون بعد' : 'No investors yet'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Profit Distributions */}
            <Card>
              <CardContent className="p-6">
                <h2 className={`text-xl font-bold text-gray-900 mb-4 ${locale === 'ar' ? 'font-arabic text-right' : ''}`}>
                  {locale === 'ar' ? 'توزيعات الأرباح' : 'Profit Distributions'}
                </h2>
                {deal.profitDistributions && deal.profitDistributions.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {deal.profitDistributions.map((distribution) => (
                      <div key={distribution.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className={`flex ${locale === 'ar' ? 'flex-row-reverse' : 'flex-row'} justify-between items-start mb-2`}>
                          <div>
                            <p className="font-bold text-emerald-600">{formatCurrency(Number(distribution.amount))}</p>
                            <p className="text-sm text-gray-600">{distribution.profitRate}% {locale === 'ar' ? 'ربح' : 'profit'}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            distribution.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            distribution.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {distribution.status}
                          </span>
                        </div>
                        <p className={`text-xs text-gray-500 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                          {distribution.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(distribution.createdAt)}
                        </p>
                        {distribution.approvedBy && (
                          <p className="text-xs text-green-600 mt-1">
                            {locale === 'ar' ? 'تمت الموافقة بواسطة' : 'Approved by'}: {distribution.approvedBy.name}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-gray-500 text-center py-8 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                    {locale === 'ar' ? 'لا توجد توزيعات أرباح بعد' : 'No profit distributions yet'}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Project Timeline */}
        <Card>
          <CardContent className="p-6">
            <h2 className={`text-xl font-bold text-gray-900 mb-4 ${locale === 'ar' ? 'font-arabic text-right' : ''}`}>
              {locale === 'ar' ? 'الجدول الزمني للمشروع' : 'Project Timeline'}
            </h2>
            <DealTimeline 
              dealId={deal.id}
              isOwner={true}
              className="bg-white"
            />
          </CardContent>
        </Card>

        {/* Status Change Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardContent className="p-6">
                <h3 className={`text-lg font-semibold mb-4 ${locale === 'ar' ? 'text-right font-arabic' : ''}`}>
                  {locale === 'ar' ? 'تغيير حالة الصفقة' : 'Change Deal Status'}
                </h3>
                <div className="space-y-2">
                  {['DRAFT', 'PENDING', 'ACTIVE', 'PAUSED', 'FUNDED', 'COMPLETED', 'CANCELLED', 'REJECTED'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 ${
                        deal.status === status ? 'bg-blue-50 border-blue-300' : ''
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                <Button
                  onClick={() => setShowStatusModal(false)}
                  variant="outline"
                  className="w-full mt-4"
                >
                  {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

