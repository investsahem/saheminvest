'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import { DealTimeline } from '../../components/project/DealTimeline'
import PublicHeader from '../../components/layout/PublicHeader'
import PublicFooter from '../../components/layout/PublicFooter'
import SmartInvestButton from '../../components/common/SmartInvestButton'
import { useTranslation, useI18n } from '../../components/providers/I18nProvider'
import { 
  ArrowLeft, Calendar, MapPin, Users, TrendingUp, Shield, 
  Clock, CheckCircle, Star, BarChart3, Target, DollarSign,
  ArrowRight, AlertCircle, Info
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
    image?: string
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
  investments?: Investment[]
  partner?: {
    id: string
    companyName: string
    displayName?: string
    tagline?: string
    description?: string
    logo?: string
    brandColor?: string
    isVerified?: boolean
    isPublic?: boolean
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
  owner: {
    name: string
  }
}

export default function DealDetailsPage() {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const params = useParams()
  const dealId = params.id as string
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/deals/${dealId}?includePartner=true&includeInvestments=true`)
        
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
    return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'en-US' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <motion.div 
          className="w-20 h-20 bg-gradient-to-br from-[#0f1640] to-[#1a2555] border border-[#2d3a6b] rounded-2xl flex items-center justify-center"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <TrendingUp className="w-10 h-10 text-[#6be2c9]" />
        </motion.div>
      </div>
    )
  }

  if (error || !deal) {
    return (
      <div className="min-h-screen bg-slate-900">
        {/* Unified Public Header */}
        <PublicHeader />

        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#0f1640] to-[#1a2555] border border-[#2d3a6b] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-[#6be2c9]" />
            </div>
            <h1 className="text-3xl font-bold text-[#e9edf7] mb-4">
              {error === 'Deal not found' ? t('deals.deal_not_found') : t('deals.error_loading')}
            </h1>
            <p className="text-[#b8c2d8] mb-8">
              {error === 'Deal not found' 
                ? t('deals.deal_not_found_desc')
                : t('deals.error_loading_desc')
              }
            </p>
            <Link href="/deals">
              <motion.button
                className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-b from-[#6be2c9] to-[#55e6a5] text-[#0b1020] font-bold rounded-xl shadow-lg shadow-[#6be2c9]/25 hover:transform hover:-translate-y-1 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft className="w-5 h-5" />
{t('deals.back_to_deals')}
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Unified Public Header */}
      <PublicHeader />

      {/* Back Button */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link href="/deals">
          <motion.button
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0f1640]/50 border border-[#2d3a6b]/30 rounded-xl text-[#e9edf7] hover:bg-[#0f1640] transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="w-4 h-4" />
{t('deals.back_to_deals')}
          </motion.button>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-[-40px] right-[10%] w-56 h-56 rounded-full bg-gradient-radial from-[#54ffe3] to-transparent opacity-35 blur-[40px] pointer-events-none mix-blend-screen"></div>
        <div className="absolute bottom-[-60px] left-[5%] w-56 h-56 rounded-full bg-gradient-radial from-[#2fa4ff] to-transparent opacity-35 blur-[40px] pointer-events-none mix-blend-screen"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Deal Image */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src={deal.thumbnailImage || '/images/default-deal.jpg'} 
                  alt={deal.title}
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                
                {/* Overlays */}
                <div className="absolute top-6 left-6">
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#0b1124]/80 border border-[#6be2c9]/30 rounded-full text-sm text-[#6be2c9] font-medium backdrop-blur-sm">
                    <span>{getCategoryIcon(deal.category)}</span>
                    <span>{deal.category}</span>
                  </div>
                </div>

                <div className="absolute top-6 right-6">
                  <div className={`px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm ${
                    deal.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    deal.status === 'FUNDED' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                    'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {deal.status}
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center justify-between">
                    <div className="px-4 py-2 bg-gradient-to-r from-[#6be2c9]/20 to-[#23a1ff]/20 border border-[#6be2c9]/30 rounded-full text-lg text-[#6be2c9] font-bold backdrop-blur-sm">
                      {deal.expectedReturn}% ROI
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-bold border backdrop-blur-sm ${getRiskColor(deal.riskLevel)}`}>
                      {deal.riskLevel} Risk
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Deal Info */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Title and Partner */}
              <div>
                <h1 className="text-3xl lg:text-4xl font-black text-[#e9edf7] mb-4 leading-tight">
                  {deal.title}
                </h1>
                <div className="flex items-center gap-2 text-[#b8c2d8]">
                  <span>{t('deals.by')}</span>
                  {deal.partner?.id ? (
                    <Link 
                      href={`/partners/${deal.partner.id}`}
                      className="text-[#6be2c9] font-semibold hover:text-[#79ffd6] transition-colors cursor-pointer"
                    >
                      {deal.partner.companyName}
                    </Link>
                  ) : (
                    <span className="text-[#6be2c9] font-semibold">
                      {deal.partner?.companyName || deal.owner.name}
                    </span>
                  )}
                  {deal.partner?.isVerified && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-[#6be2c9]/20 border border-[#6be2c9]/30 rounded-full text-xs text-[#6be2c9]">
                      <CheckCircle className="w-3 h-3" />
                      <span>{t('deals.verified')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Section */}
              <div className="p-6 bg-gradient-to-br from-[#0b1124cc] to-[#0b1124aa] border border-[#253261] rounded-2xl backdrop-blur-sm">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[#e9edf7] font-semibold">{t('deals.funding_progress')}</span>
                  <span className="text-[#6be2c9] font-bold text-xl">
                    {getProgressPercentage(deal.currentFunding, deal.fundingGoal).toFixed(0)}%
                  </span>
                </div>
                
                <div className="relative w-full bg-[#1a2555] rounded-full h-4 overflow-hidden mb-4">
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-[#6be2c9] to-[#23a1ff] rounded-full shadow-lg"
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgressPercentage(deal.currentFunding, deal.fundingGoal)}%` }}
                    transition={{ duration: 2, ease: "easeOut" }}
                  />
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-[#6be2c9] to-[#23a1ff] rounded-full blur-sm opacity-50"
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgressPercentage(deal.currentFunding, deal.fundingGoal)}%` }}
                    transition={{ duration: 2, ease: "easeOut" }}
                  />
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-[#b8c2d8]">
                    {t('deals.raised')}: <span className="text-[#6be2c9] font-bold">{formatCurrency(deal.currentFunding)}</span>
                  </span>
                  <span className="text-[#b8c2d8]">
                    {t('deals.goal')}: <span className="text-[#e9edf7] font-bold">{formatCurrency(deal.fundingGoal)}</span>
                  </span>
                </div>
              </div>

              {/* Key Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-[#0f1636cc] to-[#0f1636aa] border border-[#2a3666] rounded-xl backdrop-blur-sm text-center">
                  <div className="text-2xl font-bold text-[#6be2c9] mb-1">{deal.duration} {t('common.months')}</div>
                  <div className="text-sm text-[#b8c2d8]">{t('deals.duration')}</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-[#0f1636cc] to-[#0f1636aa] border border-[#2a3666] rounded-xl backdrop-blur-sm text-center">
                  <div className="text-2xl font-bold text-[#23a1ff] mb-1">{deal.investorCount}</div>
                  <div className="text-sm text-[#b8c2d8]">{t('deals.investors')}</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-[#0f1636cc] to-[#0f1636aa] border border-[#2a3666] rounded-xl backdrop-blur-sm text-center">
                  <div className="text-2xl font-bold text-[#f59e0b] mb-1">{formatCurrency(deal.minInvestment)}</div>
                  <div className="text-sm text-[#b8c2d8]">{t('deals.min_investment')}</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-[#0f1636cc] to-[#0f1636aa] border border-[#2a3666] rounded-xl backdrop-blur-sm text-center">
                  <div className="text-2xl font-bold text-[#6be2c9] mb-1">{deal.expectedReturn}%</div>
                  <div className="text-sm text-[#b8c2d8]">{t('deals.expected_return')}</div>
                </div>
              </div>

              {/* Investment CTA */}
              <div className="p-6 bg-gradient-to-br from-[#111a3f] to-[#0c1230] border border-[#2a3566] rounded-2xl backdrop-blur-sm">
                <h3 className="text-xl font-bold text-[#e9edf7] mb-4">
                  {deal.status === 'COMPLETED' || deal.status === 'CANCELLED' 
                    ? t('deals.deal_closed') 
                    : t('deals.ready_to_invest')}
                </h3>
                <p className="text-[#b8c2d8] mb-6">
                  {deal.status === 'COMPLETED' || deal.status === 'CANCELLED'
                    ? t('deals.deal_closed_desc')
                    : `${t('deals.join_investors')} ${deal.investorCount} ${t('deals.other_investors')} ${t('deals.earning_returns')} ${deal.expectedReturn}% ${t('deals.annually')}.`
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  {deal.status === 'COMPLETED' || deal.status === 'CANCELLED' ? (
                    <motion.button
                      disabled
                      className="w-full py-4 bg-gradient-to-r from-gray-400 to-gray-500 text-gray-200 font-bold rounded-xl opacity-50 cursor-not-allowed blur-[0.5px] relative"
                      title={t('deals.investment_closed')}
                    >
                      <span className="filter blur-[0.3px]">{t('deals.invest_now')}</span>
                      <div className="absolute inset-0 bg-black/20 rounded-xl"></div>
                    </motion.button>
                  ) : (
                    <SmartInvestButton dealId={deal.id} className="flex-1">
                      <motion.button
                        className="w-full py-4 bg-gradient-to-r from-[#6be2c9] to-[#23a1ff] text-[#0b1020] font-bold rounded-xl shadow-lg shadow-[#6be2c9]/25 hover:shadow-xl hover:shadow-[#6be2c9]/30 transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {t('deals.invest_now')}
                      </motion.button>
                    </SmartInvestButton>
                  )}
                  <Link href={`/deals/${deal.id}`}>
                    <motion.button
                      className="px-6 py-4 bg-gradient-to-b from-[#25304d] to-[#121833] border border-[#263057] text-[#e9edf7] font-bold rounded-xl hover:transform hover:-translate-y-0.5 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {t('deals.learn_more')}
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Deal Details Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Description */}
          <motion.div
            className="p-8 bg-gradient-to-br from-[#0b1124cc] to-[#0b1124aa] border border-[#253261] rounded-2xl backdrop-blur-sm"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-[#e9edf7] mb-4">{t('deals_detail.about_investment')}</h2>
            <p className="text-[#b8c2d8] leading-relaxed text-lg">
              {deal.description}
            </p>
          </motion.div>

          {/* Investment Timeline */}
          <motion.div
            className="p-8 bg-gradient-to-br from-[#0f1636cc] to-[#0f1636aa] border border-[#2a3666] rounded-2xl backdrop-blur-sm"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-[#e9edf7] mb-6">{t('deals_detail.investment_timeline')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#6be2c9]/20 to-[#23a1ff]/20 border border-[#6be2c9]/30 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-[#6be2c9]" />
                </div>
                <div>
                  <div className="text-sm text-[#b8c2d8]">{t('deals_detail.start_date')}</div>
                  <div className="text-[#e9edf7] font-semibold">
                    {deal.startDate ? formatDate(deal.startDate) : t('deals_detail.tba')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#6be2c9]/20 to-[#23a1ff]/20 border border-[#6be2c9]/30 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[#6be2c9]" />
                </div>
                <div>
                  <div className="text-sm text-[#b8c2d8]">{t('deals_detail.end_date')}</div>
                  <div className="text-[#e9edf7] font-semibold">
                    {deal.endDate ? formatDate(deal.endDate) : t('deals_detail.tba')}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Risk Information */}
          <motion.div
            className="p-8 bg-gradient-to-br from-[#0e1430cc] to-[#0e1430aa] border border-[#293668] rounded-2xl backdrop-blur-sm"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-[#e9edf7] mb-6">{t('deals_detail.risk_assessment')}</h2>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#f59e0b]/20 to-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-[#f59e0b]" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[#e9edf7] font-semibold">{t('deals_detail.risk_level')}:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getRiskColor(deal.riskLevel)}`}>
                    {deal.riskLevel}
                  </span>
                </div>
                <p className="text-[#b8c2d8] leading-relaxed">
                  {deal.riskLevel === 'Low' && t('deals_detail.low_risk_desc')}
                  {deal.riskLevel === 'Medium' && t('deals_detail.medium_risk_desc')}
                  {deal.riskLevel === 'High' && t('deals_detail.high_risk_desc')}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Partner Information */}
          {deal.partner && (
            <motion.div
              className="p-8 bg-gradient-to-br from-[#0b1124cc] to-[#0b1124aa] border border-[#253261] rounded-2xl backdrop-blur-sm"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold text-[#e9edf7] mb-6">{t('deals_detail.about_partner')}</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Partner Logo and Basic Info */}
                <div className="lg:col-span-2">
                  <div className="flex items-start gap-6 mb-6">
                    {deal.partner.logo ? (
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#6be2c9]/30 flex-shrink-0">
                        <img 
                          src={deal.partner.logo} 
                          alt={deal.partner.companyName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-[#6be2c9]/20 to-[#23a1ff]/20 border border-[#6be2c9]/30 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                        🏢
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-[#e9edf7]">
                          {deal.partner.companyName}
                        </h3>
                        {deal.partner.isVerified && (
                          <div className="flex items-center gap-1 px-3 py-1 bg-[#6be2c9]/20 border border-[#6be2c9]/30 rounded-full text-sm text-[#6be2c9]">
                            <CheckCircle className="w-4 h-4" />
                            <span>{t('deals.verified_partner')}</span>
                          </div>
                        )}
                      </div>
                      {deal.partner.industry && (
                        <p className="text-[#23a1ff] font-medium mb-2">{deal.partner.industry}</p>
                      )}
                      {deal.partner.tagline && (
                        <p className="text-[#b8c2d8] italic mb-3">{deal.partner.tagline}</p>
                      )}
                      {deal.partner.description && (
                        <p className="text-[#b8c2d8] leading-relaxed">{deal.partner.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Partner Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {deal.partner.foundedYear && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#6be2c9]/20 to-[#23a1ff]/20 border border-[#6be2c9]/30 rounded-xl flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-[#6be2c9]" />
                        </div>
                        <div>
                          <div className="text-sm text-[#b8c2d8]">{t('deals.founded')}</div>
                          <div className="text-[#e9edf7] font-semibold">{deal.partner.foundedYear}</div>
                        </div>
                      </div>
                    )}
                    
                    {deal.partner.employeeCount && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#6be2c9]/20 to-[#23a1ff]/20 border border-[#6be2c9]/30 rounded-xl flex items-center justify-center">
                          <Users className="w-5 h-5 text-[#6be2c9]" />
                        </div>
                        <div>
                          <div className="text-sm text-[#b8c2d8]">{t('deals.team_size')}</div>
                          <div className="text-[#e9edf7] font-semibold">{deal.partner.employeeCount} {t('deals.employees')}</div>
                        </div>
                      </div>
                    )}
                    
                    {(deal.partner.city || deal.partner.country) && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#6be2c9]/20 to-[#23a1ff]/20 border border-[#6be2c9]/30 rounded-xl flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-[#6be2c9]" />
                        </div>
                        <div>
                          <div className="text-sm text-[#b8c2d8]">{t('deals.location')}</div>
                          <div className="text-[#e9edf7] font-semibold">
                            {[deal.partner.city, deal.partner.country].filter(Boolean).join(', ')}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {deal.partner.website && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#6be2c9]/20 to-[#23a1ff]/20 border border-[#6be2c9]/30 rounded-xl flex items-center justify-center">
                          <ArrowRight className="w-5 h-5 text-[#6be2c9]" />
                        </div>
                        <div>
                          <div className="text-sm text-[#b8c2d8]">{t('deals.website')}</div>
                          <a 
                            href={deal.partner.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#6be2c9] font-semibold hover:text-[#79ffd6] transition-colors"
                          >
                            {t('deals_detail.visit_website')}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Partner Stats */}
                <div className="space-y-6">
                  <div className="p-4 bg-[#0f1640]/50 border border-[#2d3a6b]/30 rounded-xl">
                    <h4 className="text-lg font-bold text-[#e9edf7] mb-4">{t('deals_detail.investment_focus')}</h4>
                    <div className="space-y-3">
                      {deal.partner.minimumDealSize && (
                        <div>
                          <div className="text-sm text-[#b8c2d8]">{t('deals_detail.min_deal_size')}</div>
                          <div className="text-[#6be2c9] font-bold">
                            {formatCurrency(deal.partner.minimumDealSize)}
                          </div>
                        </div>
                      )}
                      {deal.partner.maximumDealSize && (
                        <div>
                          <div className="text-sm text-[#b8c2d8]">{t('deals_detail.max_deal_size')}</div>
                          <div className="text-[#6be2c9] font-bold">
                            {formatCurrency(deal.partner.maximumDealSize)}
                          </div>
                        </div>
                      )}
                      {deal.partner.investmentAreas && deal.partner.investmentAreas.length > 0 && (
                        <div>
                          <div className="text-sm text-[#b8c2d8] mb-2">{t('deals_detail.investment_areas')}</div>
                          <div className="flex flex-wrap gap-2">
                            {deal.partner.investmentAreas.map((area, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 bg-[#6be2c9]/20 border border-[#6be2c9]/30 rounded-full text-xs text-[#6be2c9]"
                              >
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-center">
                    <Link 
                      href={`/partners/${deal.partner.id}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6be2c9]/10 to-[#23a1ff]/10 border border-[#6be2c9]/30 rounded-xl text-[#6be2c9] font-medium hover:from-[#6be2c9]/20 hover:to-[#23a1ff]/20 transition-all duration-300"
                    >
{t('deals_detail.view_partner_profile')}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Investors Section */}
          {deal.investments && deal.investments.length > 0 && (
            <motion.div
              className="p-8 bg-gradient-to-br from-[#0b1124cc] to-[#0b1124aa] border border-[#253261] rounded-2xl backdrop-blur-sm"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#e9edf7]">{t('deals_detail.investors_info')}</h2>
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6be2c9]/20 to-[#23a1ff]/20 border border-[#6be2c9]/30 rounded-full text-sm text-[#6be2c9] font-medium">
                  <Users className="w-4 h-4" />
                  {deal.investorCount} {t('deals_detail.unique_investors')}
                </div>
              </div>

              {/* Investment Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-4 bg-[#0f1640]/50 border border-[#2d3a6b]/30 rounded-xl text-center">
                  <div className="text-2xl font-bold text-[#6be2c9] mb-1">
                    {formatCurrency(deal.currentFunding)}
                  </div>
                  <div className="text-sm text-[#b8c2d8]">{t('deals_detail.total_invested')}</div>
                </div>
                <div className="p-4 bg-[#0f1640]/50 border border-[#2d3a6b]/30 rounded-xl text-center">
                  <div className="text-2xl font-bold text-[#23a1ff] mb-1">
                    {deal.investments.length}
                  </div>
                  <div className="text-sm text-[#b8c2d8]">{t('deals_detail.total_investments')}</div>
                </div>
                <div className="p-4 bg-[#0f1640]/50 border border-[#2d3a6b]/30 rounded-xl text-center">
                  <div className="text-2xl font-bold text-[#f59e0b] mb-1">
                    {deal.investments.length > 0 ? formatCurrency(Math.round(deal.investments.reduce((sum, inv) => sum + Number(inv.amount), 0) / deal.investments.length)) : '$0'}
                  </div>
                  <div className="text-sm text-[#b8c2d8]">{t('deals_detail.avg_investment')}</div>
                </div>
              </div>


              {/* Investment Distribution Chart */}
              <div className="mt-8 p-6 bg-[#0f1640]/30 border border-[#2d3a6b]/20 rounded-xl">
                <h4 className="text-lg font-semibold text-[#e9edf7] mb-4">{t('deals_detail.investment_distribution')}</h4>
                <div className="space-y-3">
                  {(() => {
                    // Group investments by amount ranges
                    const ranges = [
                      { min: 0, max: 1000, label: '$0 - $1K', color: 'bg-blue-500' },
                      { min: 1000, max: 5000, label: '$1K - $5K', color: 'bg-green-500' },
                      { min: 5000, max: 10000, label: '$5K - $10K', color: 'bg-yellow-500' },
                      { min: 10000, max: Infinity, label: '$10K+', color: 'bg-purple-500' }
                    ]
                    
                    const distribution = ranges.map(range => {
                      const count = deal.investments!.filter(inv => 
                        Number(inv.amount) >= range.min && Number(inv.amount) < range.max
                      ).length
                      const percentage = deal.investments!.length > 0 ? (count / deal.investments!.length) * 100 : 0
                      return { ...range, count, percentage }
                    }).filter(item => item.count > 0)

                    return distribution.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-20 text-sm text-[#b8c2d8]">{item.label}</div>
                        <div className="flex-1 bg-[#1a2555] rounded-full h-3 overflow-hidden">
                          <motion.div 
                            className={`h-full ${item.color} rounded-full`}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.percentage}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            viewport={{ once: true }}
                          />
                        </div>
                        <div className="w-16 text-sm text-[#e9edf7] text-right">
                          {item.count} ({Math.round(item.percentage)}%)
                        </div>
                      </div>
                    ))
                  })()}
                </div>
              </div>
            </motion.div>
          )}

          {/* Project Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <DealTimeline 
              dealId={deal.id}
              isOwner={false}
              className="bg-gradient-to-br from-[#0b1124cc] to-[#0b1124aa] border border-[#253261] backdrop-blur-sm"
            />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <motion.div 
          className="text-center p-12 lg:p-16 bg-gradient-to-br from-[#111a3f] to-[#0c1230] border border-[#2a3566] rounded-3xl backdrop-blur-sm"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {deal.status === 'COMPLETED' || deal.status === 'CANCELLED' ? (
            <>
              <h2 className="text-3xl lg:text-4xl font-black text-[#e9edf7] mb-6">
                {t('deals_detail.deal_completed')}
              </h2>
              <p className="text-lg text-[#b8c2d8] mb-8 max-w-2xl mx-auto leading-relaxed">
                {t('deals_detail.deal_completed_desc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/deals">
                  <motion.button
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-b from-[#6be2c9] to-[#55e6a5] text-[#0b1020] font-bold rounded-xl shadow-lg shadow-[#6be2c9]/25 hover:transform hover:-translate-y-1 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t('deals_detail.view_active_deals')}
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl lg:text-4xl font-black text-[#e9edf7] mb-6">
                {t('deals_detail.start_investment_journey')}
              </h2>
              <p className="text-lg text-[#b8c2d8] mb-8 max-w-2xl mx-auto leading-relaxed">
                {t('deals_detail.create_account_description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <SmartInvestButton dealId={deal.id}>
                  <motion.button
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-b from-[#6be2c9] to-[#55e6a5] text-[#0b1020] font-bold rounded-xl shadow-lg shadow-[#6be2c9]/25 hover:transform hover:-translate-y-1 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t('deals_detail.create_account_invest')}
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </SmartInvestButton>
                <Link href="/deals">
                  <motion.button
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-b from-[#25304d] to-[#121833] border border-[#263057] text-[#e9edf7] font-bold rounded-xl hover:transform hover:-translate-y-1 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t('deals_detail.view_more_deals')}
                  </motion.button>
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </section>

      {/* Unified Footer */}
      <PublicFooter />
    </div>
  )
}