'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, Filter, TrendingUp, Clock, MapPin, Users, 
  ArrowRight, Star, Shield, Eye, CheckCircle 
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
  partner?: {
    companyName: string
  }
  owner: {
    name: string
  }
}

export default function PublicDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')

  const categories = [
    'Technology', 'Real Estate', 'Healthcare', 'Energy', 
    'Agriculture', 'Manufacturing', 'Finance', 'Education',
    'Transportation', 'Entertainment', 'Food & Beverage', 'Other'
  ]

  // Fetch public deals (only ACTIVE and FUNDED deals)
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/deals?status=ACTIVE,FUNDED&limit=50')
        if (response.ok) {
          const data = await response.json()
          setDeals(data.deals || [])
        }
      } catch (error) {
        console.error('Error fetching deals:', error)
        setDeals([])
      } finally {
        setLoading(false)
      }
    }

    fetchDeals()
  }, [])

  // Filter and sort deals
  const filteredAndSortedDeals = deals
    .filter(deal => {
      const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           deal.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || deal.category === categoryFilter
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.id).getTime() - new Date(a.id).getTime() // Assuming ID contains timestamp
        case 'funding':
          return b.currentFunding - a.currentFunding
        case 'return':
          return b.expectedReturn - a.expectedReturn
        case 'progress':
          return (b.currentFunding / b.fundingGoal) - (a.currentFunding / a.fundingGoal)
        default:
          return 0
      }
    })

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

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
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
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <Link href="/" className="text-[#e9edf7] hover:bg-[#1a2246] px-3 py-2 rounded-lg transition-colors font-semibold">
                Home
              </Link>
              <Link href="/deals" className="text-[#6be2c9] bg-[#1a2246] px-3 py-2 rounded-lg font-semibold">
                Deals
              </Link>
              <Link href="/about" className="text-[#e9edf7] hover:bg-[#1a2246] px-3 py-2 rounded-lg transition-colors font-semibold">
                About
              </Link>
              <div className="ml-2 px-3 py-1 bg-gradient-to-r from-[#1d2547aa] to-[#121833aa] border border-[#2c3769] rounded-full text-sm text-[#e9edf7]">
                عربي
              </div>
              <Link href="/auth/signin" className="ml-2 px-4 py-2 bg-gradient-to-b from-[#25304d] to-[#121833] border border-[#263057] rounded-xl text-[#e9edf7] font-bold hover:transform hover:-translate-y-0.5 transition-all">
                Go to Panel
              </Link>
            </nav>

            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center gap-3">
              <div className="px-3 py-1 bg-gradient-to-r from-[#1d2547aa] to-[#121833aa] border border-[#2c3769] rounded-full text-sm text-[#e9edf7]">
                عربي
              </div>
              <Link href="/auth/signin" className="px-4 py-2 bg-gradient-to-b from-[#25304d] to-[#121833] border border-[#263057] rounded-xl text-[#e9edf7] font-bold hover:transform hover:-translate-y-0.5 transition-all text-sm">
                Panel
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-20">
        {/* Background Elements */}
        <div className="absolute top-[-40px] right-[10%] w-56 h-56 rounded-full bg-gradient-radial from-[#54ffe3] to-transparent opacity-35 blur-[40px] pointer-events-none mix-blend-screen"></div>
        <div className="absolute bottom-[-60px] left-[5%] w-56 h-56 rounded-full bg-gradient-radial from-[#2fa4ff] to-transparent opacity-35 blur-[40px] pointer-events-none mix-blend-screen"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center max-w-4xl mx-auto mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1d2547aa] to-[#121833aa] border border-[#2c3769] rounded-full text-sm text-[#e9edf7] mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-2 h-2 bg-[#6be2c9] rounded-full animate-pulse"></div>
              Live Investment Opportunities
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6 bg-gradient-to-b from-[#eaf4ff] via-[#d4e7ff] to-[#a9c6ff] bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Discover Profitable Investment Deals
            </motion.h1>
            
            <motion.p 
              className="text-lg lg:text-xl text-[#cdd6ec] leading-relaxed mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              Explore vetted investment opportunities with guaranteed returns up to 15% annually. Start investing with as little as $1,000.
            </motion.p>

            {/* Quick Stats */}
            <motion.div 
              className="flex flex-wrap justify-center gap-6 mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-[#0f1640]/50 border border-[#2d3a6b]/30 rounded-full">
                <TrendingUp className="w-4 h-4 text-[#6be2c9]" />
                <span className="text-[#e9edf7] text-sm">{deals.length} Active Deals</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-[#0f1640]/50 border border-[#2d3a6b]/30 rounded-full">
                <Shield className="w-4 h-4 text-[#6be2c9]" />
                <span className="text-[#e9edf7] text-sm">Bank-level Security</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-[#0f1640]/50 border border-[#2d3a6b]/30 rounded-full">
                <CheckCircle className="w-4 h-4 text-[#6be2c9]" />
                <span className="text-[#e9edf7] text-sm">Guaranteed Returns</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div 
            className="max-w-4xl mx-auto mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <div className="p-6 bg-gradient-to-br from-[#0b1124cc] to-[#0b1124aa] border border-[#253261] rounded-2xl backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b8c2d8]" />
                    <input
                      type="text"
                      placeholder="Search deals..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#0f1640] border border-[#2d3a6b] rounded-xl text-[#e9edf7] placeholder-[#b8c2d8] focus:outline-none focus:ring-2 focus:ring-[#6be2c9] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0f1640] border border-[#2d3a6b] rounded-xl text-[#e9edf7] focus:outline-none focus:ring-2 focus:ring-[#6be2c9] focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0f1640] border border-[#2d3a6b] rounded-xl text-[#e9edf7] focus:outline-none focus:ring-2 focus:ring-[#6be2c9] focus:border-transparent"
                  >
                    <option value="newest">Newest</option>
                    <option value="funding">Most Funded</option>
                    <option value="return">Highest Return</option>
                    <option value="progress">Most Progress</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Deals Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="flex justify-center items-center py-20">
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
        ) : filteredAndSortedDeals.length === 0 ? (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-[#0f1640] to-[#1a2555] border border-[#2d3a6b] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Eye className="w-10 h-10 text-[#6be2c9]" />
            </div>
            <h3 className="text-2xl font-bold text-[#e9edf7] mb-4">No deals found</h3>
            <p className="text-[#b8c2d8] mb-8">
              {searchTerm || categoryFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'No active deals available at the moment'
              }
            </p>
            <Link href="/auth/signin">
              <motion.button
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-b from-[#6be2c9] to-[#55e6a5] text-[#0b1020] font-bold rounded-xl shadow-lg shadow-[#6be2c9]/25 hover:transform hover:-translate-y-1 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Get Started
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {filteredAndSortedDeals.map((deal, index) => (
              <motion.div
                key={deal.id}
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a0f2e] via-[#0f1640] to-[#1a2555] border border-[#2d3a6b]/50 shadow-2xl"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.02, y: -10 }}
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#6be2c9]/5 to-[#23a1ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Deal Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={deal.thumbnailImage || '/images/default-deal.jpg'} 
                    alt={deal.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-[#0b1124]/80 border border-[#6be2c9]/30 rounded-full text-sm text-[#6be2c9] font-medium backdrop-blur-sm">
                      <span>{getCategoryIcon(deal.category)}</span>
                      <span>{deal.category}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      deal.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      deal.status === 'FUNDED' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                      'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    } backdrop-blur-sm`}>
                      {deal.status}
                    </div>
                  </div>
                </div>

                {/* Deal Content */}
                <div className="relative p-6">
                  {/* Title and Return */}
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-[#ffffff] leading-tight line-clamp-2 flex-1 mr-4">
                      {deal.title}
                    </h3>
                    <div className="px-3 py-1 bg-gradient-to-r from-[#6be2c9]/20 to-[#23a1ff]/20 border border-[#6be2c9]/30 rounded-full text-sm text-[#6be2c9] font-bold whitespace-nowrap backdrop-blur-sm">
                      {deal.expectedReturn}% ROI
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[#b8c2d8] text-sm leading-relaxed mb-6 line-clamp-2">
                    {deal.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-[#b8c2d8] mb-2">
                      <span>Progress</span>
                      <span className="text-[#6be2c9] font-bold">
                        {getProgressPercentage(deal.currentFunding, deal.fundingGoal).toFixed(0)}%
                      </span>
                    </div>
                    <div className="relative w-full bg-[#1a2555] rounded-full h-2 overflow-hidden">
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-[#6be2c9] to-[#23a1ff] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${getProgressPercentage(deal.currentFunding, deal.fundingGoal)}%` }}
                        transition={{ duration: 1.5, delay: 0.5 + index * 0.1 }}
                      />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                    <div>
                      <div className="text-lg font-bold text-[#6be2c9] mb-1">
                        {formatCurrency(deal.currentFunding / 1000)}K
                      </div>
                      <div className="text-xs text-[#b8c2d8]">Raised</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[#23a1ff] mb-1">
                        {deal.duration}M
                      </div>
                      <div className="text-xs text-[#b8c2d8]">Duration</div>
                    </div>
                    <div>
                      <div className={`text-lg font-bold mb-1 ${
                        deal.riskLevel === 'Low' ? 'text-green-400' :
                        deal.riskLevel === 'Medium' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {deal.riskLevel}
                      </div>
                      <div className="text-xs text-[#b8c2d8]">Risk</div>
                    </div>
                  </div>

                  {/* Footer Info */}
                  <div className="flex items-center justify-between text-sm text-[#b8c2d8] mb-6">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{deal.investorCount} investors</span>
                    </div>
                    <div>
                      Min: {formatCurrency(deal.minInvestment)}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Link href={`/deals/${deal.id}`} className="flex-1">
                      <motion.button 
                        className="w-full py-3 bg-gradient-to-r from-[#6be2c9]/10 to-[#23a1ff]/10 border border-[#6be2c9]/30 rounded-xl text-[#6be2c9] font-medium hover:from-[#6be2c9]/20 hover:to-[#23a1ff]/20 transition-all duration-300 backdrop-blur-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        View Details
                      </motion.button>
                    </Link>
                    <Link href="/auth/signin">
                      <motion.button 
                        className="px-6 py-3 bg-gradient-to-r from-[#6be2c9] to-[#23a1ff] text-[#0b1020] font-bold rounded-xl shadow-lg shadow-[#6be2c9]/25 hover:shadow-xl hover:shadow-[#6be2c9]/30 transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Invest Now
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
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
          <h2 className="text-3xl lg:text-4xl font-black text-[#e9edf7] mb-6">
            Ready to Start Investing?
          </h2>
          <p className="text-lg text-[#b8c2d8] mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of investors who are achieving rewarding returns through our platform. Create your account in minutes and start investing today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signin">
              <motion.button
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-b from-[#6be2c9] to-[#55e6a5] text-[#0b1020] font-bold rounded-xl shadow-lg shadow-[#6be2c9]/25 hover:transform hover:-translate-y-1 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Create Account
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link href="/about">
              <motion.button
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-b from-[#25304d] to-[#121833] border border-[#263057] text-[#e9edf7] font-bold rounded-xl hover:transform hover:-translate-y-1 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Learn More
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-[#24315b] bg-gradient-to-b from-[#0b1124] to-[#0b1124f0]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-conic from-[#6be2c9] via-[#23a1ff] to-[#7ef1d9] p-0.5">
                <div className="w-full h-full rounded-xl bg-[#0b1020] flex items-center justify-center">
                  <span className="text-[#6be2c9] font-bold text-lg">S</span>
                </div>
              </div>
              <span className="text-[#e9edf7] font-black text-xl tracking-wide">Sahem Invest</span>
            </div>
            <p className="text-[#95a5c9]">
              © 2025 Sahem Invest. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}