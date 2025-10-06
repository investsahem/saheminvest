'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation, useI18n } from '../../../components/providers/I18nProvider'
import InvestorLayout from '../../../components/layout/InvestorLayout'
import { Card, CardContent } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { DealTimeline } from '../../../components/project/DealTimeline'
import { 
  ArrowLeft, Calendar, MapPin, Users, TrendingUp, Shield, 
  Clock, CheckCircle, Star, BarChart3, Target, DollarSign,
  ArrowRight, AlertCircle, Info, Building2, Mail, Phone,
  Globe, User, ExternalLink, Eye
} from 'lucide-react'

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
    linkedin?: string
    twitter?: string
    facebook?: string
    isVerified?: boolean
  }
  _count?: {
    investments: number
  }
}

export default function PortfolioDealDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { t } = useTranslation()
  const { locale } = useI18n()
  const dealId = params.id as string
  
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/deals/${dealId}?includePartner=true&_t=${Date.now()}`, {
          cache: 'no-store'
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('🔍 Full API Response:', data)
          console.log('🔍 investorCount:', data.investorCount)
          console.log('🔍 _count:', data._count)
          console.log('🔍 investments length:', data.investments?.length)
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Technology': return '💻'
      case 'Real Estate': return '🏢'
      case 'Healthcare': return '🏥'
      case 'Energy': return '⚡'
      case 'Agriculture': return '🌱'
      case 'Manufacturing': return '🏭'
      case 'Finance': return '💰'
      case 'Education': return '📚'
      case 'Transportation': return '🚗'
      case 'Entertainment': return '🎬'
      case 'Food & Beverage': return '🍽️'
      default: return '💼'
    }
  }

  const navigateToPartnerProfile = () => {
    if (deal?.owner?.id) {
      router.push(`/partners/${deal.owner.id}`)
    }
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

  if (error || !deal) {
    return (
      <InvestorLayout 
        title={error === 'Deal not found' ? t('deals.deal_details.deal_not_found') : t('deals.deal_details.error_loading')}
        subtitle=""
      >
        <Card>
          <CardContent className="p-16 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {error === 'Deal not found' ? t('deals.deal_details.deal_not_found') : t('deals.deal_details.error_loading')}
            </h2>
            <p className="text-gray-600 mb-8">
              {error === 'Deal not found' 
                ? t('deals.deal_details.deal_not_found_desc')
                : t('deals.deal_details.error_loading_desc')
              }
            </p>
            <Button onClick={() => router.push('/portfolio/deals')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('deals.deal_details.back_to_deals')}
            </Button>
          </CardContent>
        </Card>
      </InvestorLayout>
    )
  }

  return (
    <InvestorLayout 
      title={deal.title}
      subtitle={`${t('investor.view_details')} - ${deal.partner?.companyName || deal.owner.name}`}
    >
      <div className="space-y-8">
        {/* Back Button */}
        <div>
          <Button 
            variant="outline" 
            onClick={() => router.push('/portfolio/deals')}
            className={`flex items-center gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft className="w-4 h-4" />
            {t('deals.deal_details.back_to_deals')}
          </Button>
        </div>

        {/* Deal Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Deal Image */}
          <Card className="overflow-hidden">
            <div className="relative h-80">
              <Image
                src={deal.thumbnailImage || '/images/default-deal.jpg'}
                alt={deal.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              
              {/* Overlays */}
              <div className="absolute top-4 left-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-black/70 rounded-full text-sm text-white backdrop-blur-sm">
                  <span>{getCategoryIcon(deal.category)}</span>
                  <span>{deal.category}</span>
                </div>
              </div>

              <div className="absolute top-4 right-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm border ${
                  deal.status === 'ACTIVE' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                  deal.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                  'bg-gray-500/20 text-gray-300 border-gray-500/30'
                }`}>
                  {deal.status}
                </div>
              </div>

              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-between">
                  <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-300 font-bold backdrop-blur-sm">
                    {deal.expectedReturn}% {t('deals.expected_return')}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium border backdrop-blur-sm ${getRiskColor(deal.riskLevel)}`}>
                    {deal.riskLevel} {t('deals.risk')}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Deal Info */}
          <div className="space-y-6">
            {/* Title and Basic Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{deal.title}</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <span>{locale === 'ar' ? 'بواسطة' : 'by'}</span>
                <span className="text-green-600 font-semibold">
                  {deal.partner?.companyName || deal.owner.name}
                </span>
              </div>
            </div>

            {/* Progress Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-gray-900">{t('deals.funding_progress')}</span>
                  <span className="text-green-600 font-bold text-xl">
                    {getProgressPercentage(deal.currentFunding, deal.fundingGoal).toFixed(0)}%
                  </span>
                </div>
                
                <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-4">
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-1000"
                    style={{ width: `${getProgressPercentage(deal.currentFunding, deal.fundingGoal)}%` }}
                  />
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {t('deals.raised')}: <span className="text-green-600 font-bold">{formatCurrency(deal.currentFunding)}</span>
                  </span>
                  <span className="text-gray-600">
                    {t('deals.deal_details.funding_required')}: <span className="font-bold">{formatCurrency(deal.fundingGoal)}</span>
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Key Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">{deal.duration}M</div>
                  <div className="text-sm text-gray-600">{t('deals.duration')}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {(() => {
                      const count = deal.investorCount || deal._count?.investments || 0
                      console.log('🔍 Display count:', count, 'from investorCount:', deal.investorCount, '_count:', deal._count?.investments)
                      return count
                    })()}
                  </div>
                  <div className="text-sm text-gray-600">{t('deals.investors')}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">{formatCurrency(deal.minInvestment)}</div>
                  <div className="text-sm text-gray-600">{t('deals.min_investment')}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">{deal.expectedReturn}%</div>
                  <div className="text-sm text-gray-600">{t('deals.expected_return')}</div>
                </CardContent>
              </Card>
            </div>

            {/* Investment CTA */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{locale === 'ar' ? 'هل أنت مستعد للاستثمار؟' : 'Ready to Invest?'}</h3>
                <p className="text-gray-600 mb-4">
                  {(() => {
                    const count = deal.investorCount || deal._count?.investments || 0
                    console.log('🔍 CTA count:', count, 'from investorCount:', deal.investorCount, '_count:', deal._count?.investments)
                    return locale === 'ar' ? 
                      `انضم إلى ${count} مستثمر آخر وابدأ في كسب عوائد تصل إلى ${deal.expectedReturn}% سنوياً.` :
                      `Join ${count} other investors and start earning returns of up to ${deal.expectedReturn}% annually.`
                  })()}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href={`/deals/${deal.id}/invest`} className="flex-1">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      {t('deals.invest_now')}
                    </Button>
                  </Link>
                  <Link href={`/deals/${deal.id}`}>
                    <Button variant="outline">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {locale === 'ar' ? 'عرض عام' : 'Public View'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Deal Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('deals.deal_details.about_investment')}</h2>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {deal.description}
                </p>
              </CardContent>
            </Card>

            {/* Investment Timeline */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('deals.deal_details.investment_timeline')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">{t('deals.deal_details.start_date')}</div>
                      <div className="font-semibold text-gray-900">
                        {deal.startDate ? formatDate(deal.startDate) : formatDate(deal.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">{t('deals.deal_details.end_date')}</div>
                      <div className="font-semibold text-gray-900">
                        {deal.endDate ? formatDate(deal.endDate) : 'TBA'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('deals.deal_details.risk_assessment')}</h2>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-semibold text-gray-900">{t('deals.deal_details.risk_level')}:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(deal.riskLevel)}`}>
                        {deal.riskLevel}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {deal.riskLevel === 'Low' && t('deals.deal_details.low_risk_desc')}
                      {deal.riskLevel === 'Medium' && t('deals.deal_details.medium_risk_desc')}
                      {deal.riskLevel === 'High' && t('deals.deal_details.high_risk_desc')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Timeline */}
            <DealTimeline 
              dealId={deal.id}
              isOwner={session?.user?.id === deal.owner?.id}
            />
          </div>

          {/* Partner Information Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{t('deals.partner')}</h3>
                  {deal.partner?.isVerified && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">{locale === 'ar' ? 'موثق' : 'Verified'}</span>
                    </div>
                  )}
                </div>

                {/* Partner Logo and Name */}
                <div className="flex items-center gap-4 mb-4">
                  {deal.partner?.logo ? (
                    <div className="w-16 h-16 relative rounded-lg overflow-hidden border">
                      <Image
                        src={deal.partner.logo}
                        alt={deal.partner.companyName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-gray-900">{deal.partner?.companyName || deal.owner.name}</h4>
                    {deal.partner?.industry && (
                      <p className="text-sm text-gray-600">{deal.partner.industry}</p>
                    )}
                  </div>
                </div>

                {/* Partner Description */}
                {deal.partner?.description && (
                  <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                    {deal.partner.description}
                  </p>
                )}

                {/* Partner Details */}
                <div className="space-y-3">
                  {deal.partner?.foundedYear && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{locale === 'ar' ? 'تأسست في' : 'Founded in'} {deal.partner.foundedYear}</span>
                    </div>
                  )}
                  
                  {deal.partner?.employeeCount && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{deal.partner.employeeCount} {locale === 'ar' ? 'موظف' : 'employees'}</span>
                    </div>
                  )}

                  {deal.partner?.city && deal.partner?.country && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{deal.partner.city}, {deal.partner.country}</span>
                    </div>
                  )}

                  {deal.partner?.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a 
                        href={deal.partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700"
                      >
                        {deal.partner.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}

                </div>

                {/* View Partner Profile Button */}
                <div className="mt-6 pt-6 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={navigateToPartnerProfile}
                  >
                    <User className="w-4 h-4 mr-2" />
                    {locale === 'ar' ? 'عرض ملف الشريك' : 'View Partner Profile'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            {(deal.partner?.linkedin || deal.partner?.twitter || deal.partner?.facebook) && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">{locale === 'ar' ? 'وسائل التواصل' : 'Social Media'}</h3>
                  <div className="space-y-2">
                    {deal.partner.linkedin && (
                      <a 
                        href={deal.partner.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                        LinkedIn
                      </a>
                    )}
                    {deal.partner.twitter && (
                      <a 
                        href={deal.partner.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Twitter
                      </a>
                    )}
                    {deal.partner.facebook && (
                      <a 
                        href={deal.partner.facebook}
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
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              {locale === 'ar' ? 'ابدأ رحلتك الاستثمارية' : 'Start Your Investment Journey'}
            </h2>
            <p className="text-lg mb-6 opacity-90">
              {locale === 'ar' ? 
                'أنشئ حسابك الآن وانضم إلى آلاف المستثمرين الذين يحققون عوائد ثابتة من خلال منصتنا.' :
                'Create your account now and join thousands of investors earning consistent returns through our platform.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/deals/${deal.id}/invest`}>
                <Button className="!bg-white !text-green-600 hover:!bg-gray-100 font-bold px-8 py-3">
                  {t('deals.invest_now')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 px-8 py-3"
                onClick={() => router.push('/portfolio/deals')}
              >
                {locale === 'ar' ? 'عرض المزيد من الصفقات' : 'View More Deals'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </InvestorLayout>
  )
}
