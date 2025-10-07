'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useTranslation, useI18n } from '../../components/providers/I18nProvider'
import PublicHeader from '../../components/layout/PublicHeader'
import { DealCard } from '../../components/project/DealCard'
import { 
  ArrowLeft, MapPin, Calendar, Star, Users, TrendingUp, 
  Building2, Globe, Award, ChevronRight, Eye, Briefcase,
  Clock, CheckCircle, ArrowUpRight, Sparkles, BarChart3,
  Target, DollarSign, Phone, Mail, ExternalLink, Shield,
  MessageSquare, ThumbsUp, Verified, BadgeCheck, Trophy,
  Activity, PieChart, TrendingDown
} from 'lucide-react'

interface Partner {
  id: string
  companyName: string
  contactEmail: string
  contactPhone?: string
  industry: string
  description?: string
  website?: string
  foundedYear?: number
  employeeCount?: string
  location?: string
  logoUrl?: string
  verified: boolean
  createdAt: string
  _count: {
    deals: number
  }
  deals?: Array<{
    id: string
    title: string
    description?: string
    thumbnailImage?: string
    status: string
    expectedReturn: number
    currentFunding: number
    fundingGoal: number
    duration?: number
    endDate?: string
    minInvestment?: number
    _count?: {
      investments: number
    }
    investorCount?: number
  }>
  averageRating?: number
  totalReviews?: number
  reviews?: Array<{
    id: string
    rating: number
    comment: string
    createdAt: string
    investor: {
      name: string
    }
    deal: {
      title: string
    }
  }>
}

export default function PartnerDetailsPage() {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const params = useParams()
  const partnerId = params?.id as string
  
  const [partner, setPartner] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'deals' | 'reviews'>('overview')

  // Fetch partner details
  useEffect(() => {
    const fetchPartner = async () => {
      if (!partnerId) return
      
      try {
        setLoading(true)
        const response = await fetch(`/api/partners/${partnerId}/public`)
        if (response.ok) {
          const data = await response.json()
          setPartner(data)
        } else {
          console.error('Failed to fetch partner details')
        }
      } catch (error) {
        console.error('Error fetching partner details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPartner()
  }, [partnerId])

  // Get industry icon
  const getIndustryIcon = (industry: string) => {
    const icons: { [key: string]: string } = {
      'Technology': '💻',
      'Real Estate': '🏢',
      'Healthcare': '🏥',
      'Energy': '⚡',
      'Agriculture': '🌱',
      'Manufacturing': '🏭',
      'Finance': '💰',
      'Education': '📚',
      'Transportation': '🚛',
      'Entertainment': '🎭',
      'Food & Beverage': '🍽️',
      'Retail': '🛍️'
    }
    return icons[industry] || '🏢'
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Format number
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // Render star rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6be2c9]"></div>
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-[#0f1640] border border-[#2d3a6b] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-[#6be2c9]" />
          </div>
          <h3 className="text-2xl font-bold text-[#e9edf7] mb-4">Partner Not Found</h3>
          <p className="text-[#b8c2d8] mb-6">The partner you're looking for doesn't exist or has been removed.</p>
          <Link href="/partners" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6be2c9] to-[#23a1ff] text-[#0a0f2e] font-bold rounded-xl hover:shadow-lg transition-all">
            <ArrowLeft className="w-4 h-4" />
            {t('partners.back_to_partners')}
          </Link>
        </div>
      </div>
    )
  }

  // Calculate stats
  const totalFunding = partner.deals?.reduce((sum, deal) => sum + deal.currentFunding, 0) || 0
  const totalGoal = partner.deals?.reduce((sum, deal) => sum + deal.fundingGoal, 0) || 0
  const avgReturn = partner.deals && partner.deals.length > 0 
    ? partner.deals.reduce((sum, deal) => sum + deal.expectedReturn, 0) / partner.deals.length 
    : 0
  const successfulDeals = partner.deals?.filter(deal => deal.status === 'COMPLETED').length || 0

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Unified Public Header */}
      <PublicHeader />

      {/* Partner Header */}
      <section className="relative overflow-hidden py-16 lg:py-20">
        {/* Background Effects */}
        <div className="absolute top-[-40px] right-[10%] w-56 h-56 rounded-full bg-gradient-radial from-[#54ffe3] to-transparent opacity-20 blur-[40px] pointer-events-none"></div>
        <div className="absolute bottom-[-60px] left-[5%] w-56 h-56 rounded-full bg-gradient-radial from-[#2fa4ff] to-transparent opacity-20 blur-[40px] pointer-events-none"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="bg-gradient-to-br from-[#0b1124cc] to-[#0b1124aa] border border-[#253261] rounded-3xl p-8 lg:p-12 backdrop-blur-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Partner Info */}
              <div className="lg:col-span-2">
                <div className="flex items-start gap-6 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#6be2c9]/20 to-[#23a1ff]/20 border border-[#6be2c9]/30 rounded-2xl flex items-center justify-center text-3xl backdrop-blur-sm flex-shrink-0 overflow-hidden">
                    {partner.logoUrl ? (
                      <Image 
                        src={partner.logoUrl} 
                        alt={partner.companyName}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover rounded-2xl"
                        onError={(e) => {
                          // Fallback to industry icon if logo fails to load
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const parent = target.parentElement
                          if (parent) {
                            parent.innerHTML = getIndustryIcon(partner.industry)
                          }
                        }}
                      />
                    ) : (
                      getIndustryIcon(partner.industry)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h1 className="text-3xl lg:text-4xl font-black text-[#ffffff] mb-2">{partner.companyName}</h1>
                      {partner.verified && (
                        <div className="flex items-center gap-2 bg-[#6be2c9]/20 border border-[#6be2c9]/30 rounded-full px-4 py-2">
                          <BadgeCheck className="w-5 h-5 text-[#6be2c9]" />
                          <span className="text-sm font-medium text-[#6be2c9]">{t('partners.verified_partners')}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xl text-[#23a1ff] mb-4">{partner.industry}</p>
                    {partner.description && (
                      <p className="text-[#b8c2d8] leading-relaxed">{partner.description}</p>
                    )}
                  </div>
                </div>

                {/* Contact & Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {partner.location && (
                      <div className="flex items-center gap-3 text-[#b8c2d8]">
                        <MapPin className="w-5 h-5 text-[#6be2c9]" />
                        <span>{partner.location}</span>
                      </div>
                    )}
                    {partner.foundedYear && (
                      <div className="flex items-center gap-3 text-[#b8c2d8]">
                        <Calendar className="w-5 h-5 text-[#6be2c9]" />
                        <span>Founded {partner.foundedYear}</span>
                      </div>
                    )}
                    {partner.employeeCount && (
                      <div className="flex items-center gap-3 text-[#b8c2d8]">
                        <Users className="w-5 h-5 text-[#6be2c9]" />
                        <span>{partner.employeeCount} employees</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {partner.website && (
                      <div className="flex items-center gap-3 text-[#b8c2d8]">
                        <Globe className="w-5 h-5 text-[#6be2c9]" />
                        <a 
                          href={partner.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-[#6be2c9] transition-colors"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-6">
                <div className="bg-[#0f1640]/50 border border-[#2d3a6b]/30 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-[#e9edf7] mb-4">{t('partners.performance_stats')}</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[#b8c2d8]">{t('partners.total_deals')}</span>
                      <span className="text-xl font-bold text-[#6be2c9]">{partner._count.deals}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#b8c2d8]">{t('partners.successful_deals')}</span>
                      <span className="text-xl font-bold text-[#23a1ff]">{successfulDeals}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#b8c2d8]">{t('partners.avg_return')}</span>
                      <span className="text-xl font-bold text-[#f59e0b]">{avgReturn.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#b8c2d8]">{t('partners.total_funding')}</span>
                      <span className="text-xl font-bold text-[#10b981]">{formatCurrency(totalFunding)}</span>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="bg-[#0f1640]/50 border border-[#2d3a6b]/30 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-[#e9edf7] mb-4">{t('partners.partner_rating')}</h3>
                  <div className="text-center">
                    <div className="text-3xl font-black text-[#6be2c9] mb-2">
                      {partner.averageRating ? partner.averageRating.toFixed(1) : '4.8'}
                    </div>
                    <div className="flex justify-center gap-1 mb-2">
                      {renderStars(Math.round(partner.averageRating || 4.8))}
                    </div>
                    <div className="text-sm text-[#b8c2d8]">
                      {t('partners.based_on_reviews').replace('{count}', (partner.totalReviews || 0).toString())}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex justify-center">
          <div className="flex bg-[#0f1640] border border-[#2d3a6b] rounded-2xl p-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-[#6be2c9] to-[#23a1ff] text-[#0a0f2e]'
                  : 'text-[#b8c2d8] hover:text-[#e9edf7]'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              {t('partners.overview')}
            </button>
            <button
              onClick={() => setActiveTab('deals')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'deals'
                  ? 'bg-gradient-to-r from-[#6be2c9] to-[#23a1ff] text-[#0a0f2e]'
                  : 'text-[#b8c2d8] hover:text-[#e9edf7]'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              {t('partners.deals')} ({partner._count.deals})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'reviews'
                  ? 'bg-gradient-to-r from-[#6be2c9] to-[#23a1ff] text-[#0a0f2e]'
                  : 'text-[#b8c2d8] hover:text-[#e9edf7]'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              {t('partners.reviews')} ({partner.totalReviews || 0})
            </button>
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        {activeTab === 'overview' && (
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-[#0b1124cc] to-[#0b1124aa] border border-[#253261] rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-[#e9edf7] mb-6">Recent Deals</h3>
                <div className="space-y-4">
                  {partner.deals?.slice(0, 3).map((deal) => (
                    <div key={deal.id} className="flex items-center gap-4 p-4 bg-[#0f1640]/50 border border-[#2d3a6b]/30 rounded-xl">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#6be2c9]/20 to-[#23a1ff]/20 border border-[#6be2c9]/30 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-6 h-6 text-[#6be2c9]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[#e9edf7] truncate">{deal.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-[#b8c2d8]">
                          <span>{deal.expectedReturn}% ROI</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            deal.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                            deal.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {deal.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#6be2c9]">
                          {formatCurrency(deal.currentFunding)}
                        </div>
                        <div className="text-sm text-[#b8c2d8]">
                          of {formatCurrency(deal.fundingGoal)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#0b1124cc] to-[#0b1124aa] border border-[#253261] rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-[#e9edf7] mb-6">Investment Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#6be2c9]/20 rounded-lg">
                      <Target className="w-5 h-5 text-[#6be2c9]" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[#e9edf7]">
                        {((totalFunding / totalGoal) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-[#b8c2d8]">Funding Success Rate</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#23a1ff]/20 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-[#23a1ff]" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[#e9edf7]">
                        {avgReturn.toFixed(1)}%
                      </div>
                      <div className="text-sm text-[#b8c2d8]">Average Return</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#f59e0b]/20 rounded-lg">
                      <Trophy className="w-5 h-5 text-[#f59e0b]" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[#e9edf7]">{successfulDeals}</div>
                      <div className="text-sm text-[#b8c2d8]">Completed Deals</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'deals' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {partner.deals && partner.deals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {partner.deals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    id={deal.id}
                    title={deal.title}
                    description={deal.description || ''}
                    image={deal.thumbnailImage || '/images/default-deal.jpg'}
                    fundingGoal={deal.fundingGoal}
                    currentFunding={deal.currentFunding}
                    expectedReturn={{
                      min: deal.expectedReturn,
                      max: deal.expectedReturn
                    }}
                    duration={deal.duration || 12}
                    endDate={deal.endDate || ''}
                    contributorsCount={deal.investorCount || 0}
                    partnerName={partner.companyName}
                    partnerDealsCount={partner._count.deals}
                    minInvestment={deal.minInvestment || 1000}
                    isPartnerView={false}
                    isClosedView={deal.status === 'COMPLETED'}
                    isPortfolioView={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-[#0f1640] border border-[#2d3a6b] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Briefcase className="w-10 h-10 text-[#6be2c9]" />
                </div>
                <h3 className="text-2xl font-bold text-[#e9edf7] mb-4">No Deals Available</h3>
                <p className="text-[#b8c2d8]">This partner hasn't published any deals yet.</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'reviews' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {partner.reviews && partner.reviews.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {partner.reviews.map((review) => (
                  <div 
                    key={review.id} 
                    className="bg-gradient-to-br from-[#0b1124cc] to-[#0b1124aa] border border-[#253261] rounded-2xl p-6 backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-[#e9edf7]">{review.investor.name}</h4>
                        <p className="text-sm text-[#b8c2d8]">Deal: {review.deal.title}</p>
                      </div>
                      <div className="flex gap-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p className="text-[#b8c2d8] mb-4">{review.comment}</p>
                    <div className="text-sm text-[#95a5c9]">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-[#0f1640] border border-[#2d3a6b] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-10 h-10 text-[#6be2c9]" />
                </div>
                <h3 className="text-2xl font-bold text-[#e9edf7] mb-4">No Reviews Yet</h3>
                <p className="text-[#b8c2d8]">This partner hasn't received any reviews yet.</p>
              </div>
            )}
          </motion.div>
        )}
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-[#24315b] bg-gradient-to-b from-[#0b1124] to-[#0b1124f0]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-[#95a5c9]">
              © 2025 Sahem Invest. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}