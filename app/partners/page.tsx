'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTranslation, useI18n } from '../components/providers/I18nProvider'
import { 
  Search, Filter, MapPin, Calendar, Star, Users, TrendingUp, 
  Building2, Globe, Award, ChevronRight, Eye, Briefcase,
  Clock, CheckCircle, ArrowUpRight, Sparkles, BarChart3,
  Target, DollarSign, Phone, Mail, ExternalLink
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
    investments?: number
  }
  deals?: Array<{
    id: string
    title: string
    status: string
    expectedReturn: number
    currentFunding: number
    fundingGoal: number
  }>
  averageRating?: number
  totalReviews?: number
}

export default function PartnersPage() {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [industryFilter, setIndustryFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPartners, setTotalPartners] = useState(0)
  const partnersPerPage = 16

  const industries = [
    'Technology', 'Real Estate', 'Healthcare', 'Energy', 
    'Agriculture', 'Manufacturing', 'Finance', 'Education',
    'Transportation', 'Entertainment', 'Food & Beverage', 'Retail'
  ]

  // Fetch partners
  const fetchPartners = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: partnersPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(industryFilter !== 'all' && { industry: industryFilter })
      })

      const response = await fetch(`/api/partners/public?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPartners(data.partners || [])
        setTotalPages(data.totalPages || 1)
        setTotalPartners(data.total || 0)
      } else {
        console.error('Failed to fetch partners')
        setPartners([])
      }
    } catch (error) {
      console.error('Error fetching partners:', error)
      setPartners([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPartners()
  }, [currentPage, searchTerm, industryFilter])

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

  // Format number
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-gradient-to-r from-[#0b1124ee] via-[#0b1124ee] to-[#0b112490] border-b border-[#233059]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-conic from-[#6be2c9] via-[#23a1ff] to-[#7ef1d9] p-0.5">
                <div className="w-full h-full rounded-xl bg-[#0b1020] flex items-center justify-center">
                  <span className="text-[#6be2c9] font-bold text-lg">S</span>
                </div>
              </div>
              <span className="text-[#e9edf7] font-black text-xl tracking-wide">Sahem Invest</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-2">
              <Link href="/" className="text-[#e9edf7] hover:bg-[#1a2246] px-3 py-2 rounded-lg transition-colors font-semibold">
                {t('navigation.home')}
              </Link>
              <Link href="/deals" className="text-[#e9edf7] hover:bg-[#1a2246] px-3 py-2 rounded-lg transition-colors font-semibold">
                {t('navigation.deals')}
              </Link>
              <Link href="/partners" className="text-[#6be2c9] bg-[#1a2246] px-3 py-2 rounded-lg transition-colors font-semibold">
                Our Partners
              </Link>
              <Link href="/about" className="text-[#e9edf7] hover:bg-[#1a2246] px-3 py-2 rounded-lg transition-colors font-semibold">
                {t('navigation.about')}
              </Link>
              <Link href="/auth/signin" className="ml-2 px-4 py-2 bg-gradient-to-b from-[#25304d] to-[#121833] border border-[#263057] rounded-xl text-[#e9edf7] font-bold hover:transform hover:-translate-y-0.5 transition-all">
                Go to Panel
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        {/* Background Effects */}
        <div className="absolute top-[-40px] right-[10%] w-56 h-56 rounded-full bg-gradient-radial from-[#54ffe3] to-transparent opacity-20 blur-[40px] pointer-events-none"></div>
        <div className="absolute bottom-[-60px] left-[5%] w-56 h-56 rounded-full bg-gradient-radial from-[#2fa4ff] to-transparent opacity-20 blur-[40px] pointer-events-none"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1d2547aa] to-[#121833aa] border border-[#2c3769] rounded-full text-sm text-[#6be2c9] mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Building2 className="w-4 h-4" />
              {t('partners.hero_title')}
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6 bg-gradient-to-b from-[#eaf4ff] via-[#d4e7ff] to-[#a9c6ff] bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {t('partners.hero_subtitle')}
            </motion.h1>
            
            <motion.p 
              className="text-lg lg:text-xl text-[#cdd6ec] leading-relaxed mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {t('partners.hero_description')}
            </motion.p>

            {/* Stats */}
            <motion.div 
              className="flex flex-wrap justify-center gap-6 mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex flex-col items-center gap-2 px-6 py-4 bg-[#10173a] border border-[#283363] rounded-xl">
                <div className="text-3xl font-black text-[#6be2c9]">{totalPartners}</div>
                <div className="text-sm text-[#b8c2d8]">{t('partners.verified_partners')}</div>
              </div>
              <div className="flex flex-col items-center gap-2 px-6 py-4 bg-[#10173a] border border-[#283363] rounded-xl">
                <div className="text-3xl font-black text-[#23a1ff]">{industries.length}</div>
                <div className="text-sm text-[#b8c2d8]">{t('partners.industries')}</div>
              </div>
              <div className="flex flex-col items-center gap-2 px-6 py-4 bg-[#10173a] border border-[#283363] rounded-xl">
                <div className="text-3xl font-black text-[#f59e0b]">4.8</div>
                <div className="text-sm text-[#b8c2d8]">{t('partners.avg_rating')}</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <motion.div 
          className="bg-gradient-to-br from-[#0b1124cc] to-[#0b1124aa] border border-[#253261] rounded-2xl p-6 backdrop-blur-sm"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b8c2d8]" />
                <input
                  type="text"
                  placeholder={t('partners.search_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#0f1640] border border-[#2d3a6b] rounded-xl text-[#e9edf7] placeholder-[#b8c2d8] focus:outline-none focus:ring-2 focus:ring-[#6be2c9] focus:border-transparent"
                />
              </div>
            </div>

            {/* Industry Filter */}
            <div className="lg:w-64">
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="w-full px-4 py-3 bg-[#0f1640] border border-[#2d3a6b] rounded-xl text-[#e9edf7] focus:outline-none focus:ring-2 focus:ring-[#6be2c9] focus:border-transparent"
              >
                <option value="all">{t('partners.all_industries')}</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Partners Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6be2c9]"></div>
          </div>
        ) : partners.length === 0 ? (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-20 h-20 bg-[#0f1640] border border-[#2d3a6b] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-[#6be2c9]" />
            </div>
            <h3 className="text-2xl font-bold text-[#e9edf7] mb-4">No Partners Found</h3>
            <p className="text-[#b8c2d8] mb-6">Try adjusting your search criteria or check back later for new partners.</p>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {partners.map((partner, index) => (
                <motion.div
                  key={partner.id}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a0f2e] via-[#0f1640] to-[#1a2555] border border-[#2d3a6b]/50 shadow-xl hover:shadow-2xl transition-all duration-300"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#6be2c9]/5 to-[#23a1ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#6be2c9]/20 to-[#23a1ff]/20 border border-[#6be2c9]/30 rounded-xl flex items-center justify-center text-xl backdrop-blur-sm">
                          {getIndustryIcon(partner.industry)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-bold text-[#ffffff] truncate">{partner.companyName}</h3>
                          <p className="text-sm text-[#b8c2d8]">{partner.industry}</p>
                        </div>
                      </div>
                      {partner.verified && (
                        <div className="p-1 bg-[#6be2c9]/20 border border-[#6be2c9]/30 rounded-full">
                          <CheckCircle className="w-4 h-4 text-[#6be2c9]" />
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {partner.description && (
                      <p className="text-sm text-[#b8c2d8] mb-4 line-clamp-2">{partner.description}</p>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-xl font-bold text-[#6be2c9] mb-1">{partner._count.deals}</div>
                        <div className="text-xs text-[#b8c2d8]">{t('partners.active_deals')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-[#23a1ff] mb-1">
                          {partner.averageRating ? partner.averageRating.toFixed(1) : '4.5'}
                        </div>
                        <div className="text-xs text-[#b8c2d8]">{t('partners.rating')}</div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="space-y-2 mb-6">
                      {partner.location && (
                        <div className="flex items-center gap-2 text-xs text-[#b8c2d8]">
                          <MapPin className="w-3 h-3" />
                          {partner.location}
                        </div>
                      )}
                      {partner.foundedYear && (
                        <div className="flex items-center gap-2 text-xs text-[#b8c2d8]">
                          <Calendar className="w-3 h-3" />
                          Founded {partner.foundedYear}
                        </div>
                      )}
                      {partner.employeeCount && (
                        <div className="flex items-center gap-2 text-xs text-[#b8c2d8]">
                          <Users className="w-3 h-3" />
                          {partner.employeeCount} {t('partners.employees')}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <Link href={`/partners/${partner.id}`}>
                      <motion.button 
                        className="w-full py-3 bg-gradient-to-r from-[#6be2c9]/10 to-[#23a1ff]/10 border border-[#6be2c9]/30 rounded-xl text-[#6be2c9] font-medium hover:from-[#6be2c9]/20 hover:to-[#23a1ff]/20 transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {t('partners.view_partner_details')}
                        <ArrowUpRight className="w-4 h-4" />
                      </motion.button>
                    </Link>

                    {/* Featured Badge */}
                    {partner._count.deals > 5 && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        Top
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div 
                className="flex justify-center items-center space-x-2 mt-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-[#0f1640] border border-[#2d3a6b] rounded-lg text-[#e9edf7] hover:bg-[#1a2555] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (currentPage <= 4) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = currentPage - 3 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-gradient-to-r from-[#6be2c9] to-[#23a1ff] text-[#0a0f2e]'
                          : 'bg-[#0f1640] border border-[#2d3a6b] text-[#e9edf7] hover:bg-[#1a2555]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-[#0f1640] border border-[#2d3a6b] rounded-lg text-[#e9edf7] hover:bg-[#1a2555] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </motion.div>
            )}
          </>
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
