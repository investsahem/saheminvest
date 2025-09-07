'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation, useI18n } from '../../components/providers/I18nProvider'
import InvestorLayout from '../../components/layout/InvestorLayout'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { DealCard } from '../../components/project/DealCard'
import { 
  ArrowLeft, Calendar, MapPin, Users, TrendingUp, Shield, 
  Clock, CheckCircle, Star, BarChart3, Target, DollarSign,
  ArrowRight, AlertCircle, Info, Building2, Mail, Phone,
  Globe, User, ExternalLink, Eye, Award, Briefcase
} from 'lucide-react'

interface Partner {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  partnerProfile?: {
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
    linkedin?: string
    twitter?: string
    facebook?: string
    investmentAreas?: string[]
    minimumDealSize?: number
    maximumDealSize?: number
    businessType?: string
    registrationNumber?: string
  }
  projects?: Array<{
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
    minInvestment: number
    endDate: string
    _count?: {
      investments: number
    }
  }>
}

export default function PartnerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { t } = useTranslation()
  const { locale } = useI18n()
  const partnerId = params.id as string
  
  const [partner, setPartner] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/partners/${partnerId}`)
        
        if (response.ok) {
          const data = await response.json()
          setPartner(data)
        } else if (response.status === 404) {
          setError('Partner not found')
        } else {
          setError('Failed to load partner details')
        }
      } catch (error) {
        console.error('Error fetching partner:', error)
        setError('Network error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (partnerId) {
      fetchPartner()
    }
  }, [partnerId])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <InvestorLayout title={t('common.loading')} subtitle="">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </InvestorLayout>
    )
  }

  if (error || !partner) {
    return (
      <InvestorLayout 
        title={error === 'Partner not found' ? t('partner.profile') : t('common.error')}
        subtitle=""
      >
        <Card>
          <CardContent className="p-16 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {error === 'Partner not found' ? (locale === 'ar' ? 'لم يتم العثور على الشريك' : 'Partner Not Found') : t('common.error')}
            </h2>
            <p className="text-gray-600 mb-8">
              {error === 'Partner not found' 
                ? (locale === 'ar' ? 'الشريك الذي تبحث عنه غير موجود أو تم حذفه.' : 'The partner you\'re looking for doesn\'t exist or has been removed.')
                : (locale === 'ar' ? 'حدث خطأ أثناء تحميل تفاصيل الشريك. يرجى المحاولة مرة أخرى.' : 'We encountered an error while loading the partner details. Please try again.')
              }
            </p>
            <Button onClick={() => router.push('/portfolio/deals')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {locale === 'ar' ? 'العودة للصفقات' : 'Back to Deals'}
            </Button>
          </CardContent>
        </Card>
      </InvestorLayout>
    )
  }

  const profile = partner.partnerProfile
  const activeProjects = partner.projects?.filter(p => ['ACTIVE', 'PUBLISHED'].includes(p.status)) || []
  const completedProjects = partner.projects?.filter(p => p.status === 'COMPLETED') || []
  const totalFunding = partner.projects?.reduce((sum, p) => sum + p.currentFunding, 0) || 0
  const successRate = partner.projects?.length ? (completedProjects.length / partner.projects.length) * 100 : 0

  return (
    <InvestorLayout 
      title={profile?.companyName || partner.name}
      subtitle={locale === 'ar' ? 'ملف الشريك' : 'Partner Profile'}
    >
      <div className="space-y-8">
        {/* Back Button */}
        <div>
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className={`flex items-center gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft className="w-4 h-4" />
            {locale === 'ar' ? 'العودة' : 'Back'}
          </Button>
        </div>

        {/* Partner Header */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-8 text-white">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Partner Logo */}
              <div className="flex-shrink-0">
                {profile?.logo ? (
                  <div className="w-24 h-24 relative rounded-xl overflow-hidden border-4 border-white/20">
                    <Image
                      src={profile.logo}
                      alt={profile.companyName}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-white/20 rounded-xl flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-white" />
                  </div>
                )}
              </div>

              {/* Partner Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{profile?.companyName || partner.name}</h1>
                  <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">{locale === 'ar' ? 'موثق' : 'Verified'}</span>
                  </div>
                </div>
                
                {profile?.industry && (
                  <p className="text-white/90 mb-2">{profile.industry}</p>
                )}
                
                {profile?.description && (
                  <p className="text-white/80 leading-relaxed max-w-2xl">
                    {profile.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="bg-white p-6 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">{partner.projects?.length || 0}</div>
                <div className="text-sm text-gray-600">{locale === 'ar' ? 'إجمالي الصفقات' : 'Total Deals'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">{activeProjects.length}</div>
                <div className="text-sm text-gray-600">{locale === 'ar' ? 'صفقات نشطة' : 'Active Deals'}</div>
              </div>
              <div className="text-2xl font-bold text-purple-600 mb-1 text-center">
                <div>{formatCurrency(totalFunding)}</div>
                <div className="text-sm text-gray-600">{locale === 'ar' ? 'إجمالي التمويل' : 'Total Funding'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">{successRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">{locale === 'ar' ? 'معدل النجاح' : 'Success Rate'}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Partner Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Company Information */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{locale === 'ar' ? 'معلومات الشركة' : 'Company Information'}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profile?.foundedYear && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">{locale === 'ar' ? 'تأسست في' : 'Founded'}</div>
                        <div className="font-semibold text-gray-900">{profile.foundedYear}</div>
                      </div>
                    </div>
                  )}

                  {profile?.employeeCount && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">{locale === 'ar' ? 'عدد الموظفين' : 'Team Size'}</div>
                        <div className="font-semibold text-gray-900">{profile.employeeCount} {locale === 'ar' ? 'موظف' : 'employees'}</div>
                      </div>
                    </div>
                  )}

                  {profile?.businessType && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">{locale === 'ar' ? 'نوع العمل' : 'Business Type'}</div>
                        <div className="font-semibold text-gray-900">{profile.businessType}</div>
                      </div>
                    </div>
                  )}

                  {(profile?.city || profile?.country) && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">{locale === 'ar' ? 'الموقع' : 'Location'}</div>
                        <div className="font-semibold text-gray-900">
                          {[profile.city, profile.country].filter(Boolean).join(', ')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Investment Areas */}
                {profile?.investmentAreas && profile.investmentAreas.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold text-gray-900 mb-3">{locale === 'ar' ? 'مجالات الاستثمار' : 'Investment Areas'}</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.investmentAreas.map((area, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Deal Size Range */}
                {(profile?.minimumDealSize || profile?.maximumDealSize) && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold text-gray-900 mb-3">{locale === 'ar' ? 'نطاق حجم الصفقة' : 'Deal Size Range'}</h3>
                    <div className="flex items-center gap-2 text-gray-700">
                      {profile.minimumDealSize && (
                        <span>{locale === 'ar' ? 'من' : 'From'} {formatCurrency(profile.minimumDealSize)}</span>
                      )}
                      {profile.minimumDealSize && profile.maximumDealSize && (
                        <span>-</span>
                      )}
                      {profile.maximumDealSize && (
                        <span>{locale === 'ar' ? 'إلى' : 'to'} {formatCurrency(profile.maximumDealSize)}</span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Deals */}
            {activeProjects.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{locale === 'ar' ? 'الصفقات النشطة' : 'Active Deals'}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeProjects.slice(0, 4).map((project) => (
                      <DealCard
                        key={project.id}
                        id={project.id}
                        title={project.title}
                        description={project.description}
                        image={project.thumbnailImage || '/images/default-deal.jpg'}
                        fundingGoal={project.fundingGoal}
                        currentFunding={project.currentFunding}
                        expectedReturn={{
                          min: project.expectedReturn,
                          max: project.expectedReturn
                        }}
                        duration={project.duration}
                        endDate={project.endDate}
                        contributorsCount={project._count?.investments || 0}
                        partnerName={profile?.companyName || partner.name}
                        partnerDealsCount={partner.projects?.length || 0}
                        minInvestment={project.minInvestment}
                        isPortfolioView={true}
                      />
                    ))}
                  </div>
                  {activeProjects.length > 4 && (
                    <div className="text-center mt-6">
                      <Button 
                        variant="outline"
                        onClick={() => router.push(`/portfolio/deals?partner=${partnerId}`)}
                      >
                        {locale === 'ar' ? 'عرض جميع الصفقات النشطة' : 'View All Active Deals'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{locale === 'ar' ? 'معلومات التواصل' : 'Contact Information'}</h3>
                
                <div className="space-y-3">
                  {profile?.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a 
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 text-sm"
                      >
                        {profile.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}

                  {profile?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a 
                        href={`mailto:${profile.email}`}
                        className="text-green-600 hover:text-green-700 text-sm"
                      >
                        {profile.email}
                      </a>
                    </div>
                  )}

                  {profile?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a 
                        href={`tel:${profile.phone}`}
                        className="text-green-600 hover:text-green-700 text-sm"
                      >
                        {profile.phone}
                      </a>
                    </div>
                  )}

                  {profile?.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-gray-700 text-sm">{profile.address}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            {(profile?.linkedin || profile?.twitter || profile?.facebook) && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{locale === 'ar' ? 'وسائل التواصل الاجتماعي' : 'Social Media'}</h3>
                  <div className="space-y-2">
                    {profile.linkedin && (
                      <a 
                        href={profile.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                        LinkedIn
                      </a>
                    )}
                    {profile.twitter && (
                      <a 
                        href={profile.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Twitter
                      </a>
                    )}
                    {profile.facebook && (
                      <a 
                        href={profile.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Facebook
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Partnership Since */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{locale === 'ar' ? 'شريك منذ' : 'Partner Since'}</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{formatDate(partner.createdAt)}</div>
                    <div className="text-sm text-gray-600">
                      {locale === 'ar' ? 'عضو في ساهم إنفست' : 'Member of Sahem Invest'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              {locale === 'ar' ? 'مهتم بالاستثمار؟' : 'Interested in Investing?'}
            </h2>
            <p className="text-lg mb-6 opacity-90">
              {locale === 'ar' ? 
                'استكشف الفرص الاستثمارية المتاحة من هذا الشريك الموثوق.' :
                'Explore available investment opportunities from this trusted partner.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-white text-green-600 hover:bg-gray-100 font-bold px-8 py-3"
                onClick={() => router.push(`/portfolio/deals?partner=${partnerId}`)}
              >
                {locale === 'ar' ? 'عرض الصفقات' : 'View Deals'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 px-8 py-3"
                onClick={() => router.push('/portfolio/deals')}
              >
                {locale === 'ar' ? 'جميع الفرص' : 'All Opportunities'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </InvestorLayout>
  )
}