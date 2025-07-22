'use client'

import { useState } from 'react'
import { Header } from '../../components/layout/Header'
import { useTranslation } from '../../components/providers/I18nProvider'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

// Sample data - would come from API/database in real app
const partnerData = {
  companyName: 'شركة التقنية المتقدمة',
  rating: 4.8,
  totalDeals: 15,
  completedDeals: 12,
  activeDeals: 3,
  totalFunding: 850000,
  averageReturn: 6.2,
  successRate: 80,
  currentDeals: [
    {
      id: '1',
      title: 'هواتف مستعملة',
      fundingGoal: 20000,
      currentFunding: 20000,
      expectedReturn: 5,
      duration: 2,
      status: 'FUNDED',
      stage: 5,
      investorsCount: 1
    },
    {
      id: '2',
      title: 'تجارة أجهزة كهربائية',
      fundingGoal: 35000,
      currentFunding: 28000,
      expectedReturn: 6,
      duration: 3,
      status: 'ACTIVE',
      stage: 2,
      investorsCount: 8
    },
    {
      id: '3',
      title: 'استيراد أدوات منزلية',
      fundingGoal: 50000,
      currentFunding: 15000,
      expectedReturn: 7,
      duration: 4,
      status: 'ACTIVE',
      stage: 1,
      investorsCount: 3
    }
  ]
}

const dealStages = [
  'فتح الصفقة',
  'بدء التمويل',
  'إغلاق التمويل',
  'شراء البضائع',
  'استلام البضائع',
  'بدء البيع',
  'توزيع جزئي للأرباح',
  'توزيع كامل للأرباح',
  'إغلاق الصفقة'
]

export default function PartnerDashboard() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'overview' | 'deals' | 'performance'>('overview')

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-SA').format(num)
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "text-xs px-2 py-1 rounded-full font-medium"
    switch (status) {
      case 'ACTIVE':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'FUNDED':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'COMPLETED':
        return `${baseClasses} bg-gray-100 text-gray-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getStageProgress = (stage: number) => {
    return (stage / dealStages.length) * 100
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة تحكم الشريك</h1>
          <p className="text-gray-600">مرحباً بك {partnerData.companyName}</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { key: 'overview', label: 'نظرة عامة' },
              { key: 'deals', label: 'صفقاتي' },
              { key: 'performance', label: 'الأداء' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">إجمالي الصفقات</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(partnerData.totalDeals)}
                      </p>
                      <p className="text-xs text-green-600">
                        {formatNumber(partnerData.activeDeals)} نشطة
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">💼</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">معدل النجاح</p>
                      <p className="text-2xl font-bold text-green-600">
                        {partnerData.successRate}%
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatNumber(partnerData.completedDeals)} مكتملة
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">✅</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">إجمالي التمويل</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatNumber(partnerData.totalFunding)}
                      </p>
                      <p className="text-xs text-gray-500">ريال سعودي</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">💰</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">متوسط العائد</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {partnerData.averageReturn}%
                      </p>
                      <p className="text-xs text-gray-500">سنوياً</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📈</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Rating */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">تقييم الشريك</h3>
                <div className="flex items-center">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-8 h-8 ${
                          star <= Math.floor(partnerData.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="mr-2 text-2xl font-bold text-gray-900">{partnerData.rating}</span>
                  <span className="text-gray-500">من 5 نجوم</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Deals Tab */}
        {activeTab === 'deals' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">صفقاتي</h2>
              <Button>إنشاء صفقة جديدة</Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {partnerData.currentDeals.map((deal) => (
                <Card key={deal.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{deal.title}</h3>
                        <p className="text-sm text-gray-600">
                          {formatNumber(deal.investorsCount)} مستثمر • مدة {deal.duration} أشهر
                        </p>
                      </div>
                      <span className={getStatusBadge(deal.status)}>
                        {deal.status === 'ACTIVE' ? 'نشطة' : deal.status === 'FUNDED' ? 'ممولة' : 'مكتملة'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">التمويل المطلوب</p>
                        <p className="text-lg font-semibold">
                          {formatNumber(deal.fundingGoal)} ريال
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">التمويل المحقق</p>
                        <p className="text-lg font-semibold text-green-600">
                          {formatNumber(deal.currentFunding)} ريال
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">العائد المتوقع</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {deal.expectedReturn}%
                        </p>
                      </div>
                    </div>

                    {/* Funding Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>نسبة التمويل</span>
                        <span>{((deal.currentFunding / deal.fundingGoal) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min((deal.currentFunding / deal.fundingGoal) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Deal Stage Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>مرحلة الصفقة</span>
                        <span>{dealStages[deal.stage - 1]}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${getStageProgress(deal.stage)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" size="sm">
                        عرض التفاصيل
                      </Button>
                      <Button variant="outline" size="sm">
                        تحديث المرحلة
                      </Button>
                      {deal.status === 'FUNDED' && (
                        <Button variant="outline" size="sm">
                          توزيع الأرباح
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">تقرير الأداء</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">ملخص الأداء</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">الصفقات المكتملة:</span>
                      <span className="font-medium">{formatNumber(partnerData.completedDeals)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">معدل النجاح:</span>
                      <span className="font-medium text-green-600">{partnerData.successRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">متوسط العائد:</span>
                      <span className="font-medium text-blue-600">{partnerData.averageReturn}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">إجمالي التمويل:</span>
                      <span className="font-medium">{formatNumber(partnerData.totalFunding)} ريال</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">تقييمات المستثمرين</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="text-gray-600 w-16">5 نجوم</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                        <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                      <span className="text-sm text-gray-500">80%</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600 w-16">4 نجوم</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                        <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '15%' }}></div>
                      </div>
                      <span className="text-sm text-gray-500">15%</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600 w-16">3 نجوم</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                        <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '5%' }}></div>
                      </div>
                      <span className="text-sm text-gray-500">5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">نصائح لتحسين الأداء</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start">
                    <span className="text-blue-600 ml-2">💡</span>
                    <p>حافظ على التواصل المنتظم مع المستثمرين لتحديث حالة الصفقة</p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-600 ml-2">📈</span>
                    <p>اهتم بتحقيق العوائد المتوقعة أو أفضل لزيادة ثقة المستثمرين</p>
                  </div>
                  <div className="flex items-start">
                    <span className="text-purple-600 ml-2">🎯</span>
                    <p>قدم تقارير مفصلة ودقيقة عن مراحل تنفيذ الصفقة</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 