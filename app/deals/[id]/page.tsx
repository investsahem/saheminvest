'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import { DealTimeline } from '../../components/project/DealTimeline'
import { 
  ArrowLeft, Calendar, MapPin, Users, TrendingUp, Shield, 
  Clock, CheckCircle, Star, BarChart3, Target, DollarSign,
  ArrowRight, AlertCircle, Info
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
  partner?: {
    companyName: string
    description?: string
  }
  owner: {
    name: string
  }
}

export default function DealDetailsPage() {
  const params = useParams()
  const dealId = params.id as string
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/deals/${dealId}`)
        
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
    return new Date(dateString).toLocaleDateString('en-US', {
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
                  Home
                </Link>
                <Link href="/deals" className="text-[#6be2c9] bg-[#1a2246] px-3 py-2 rounded-lg font-semibold">
                  Deals
                </Link>
                <Link href="/about" className="text-[#e9edf7] hover:bg-[#1a2246] px-3 py-2 rounded-lg transition-colors font-semibold">
                  About
                </Link>
                <Link href="/auth/signin" className="ml-2 px-4 py-2 bg-gradient-to-b from-[#25304d] to-[#121833] border border-[#263057] rounded-xl text-[#e9edf7] font-bold hover:transform hover:-translate-y-0.5 transition-all">
                  Go to Panel
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#0f1640] to-[#1a2555] border border-[#2d3a6b] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-[#6be2c9]" />
            </div>
            <h1 className="text-3xl font-bold text-[#e9edf7] mb-4">
              {error === 'Deal not found' ? 'Deal Not Found' : 'Error Loading Deal'}
            </h1>
            <p className="text-[#b8c2d8] mb-8">
              {error === 'Deal not found' 
                ? 'The deal you\'re looking for doesn\'t exist or has been removed.'
                : 'We encountered an error while loading the deal details. Please try again.'
              }
            </p>
            <Link href="/deals">
              <motion.button
                className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-b from-[#6be2c9] to-[#55e6a5] text-[#0b1020] font-bold rounded-xl shadow-lg shadow-[#6be2c9]/25 hover:transform hover:-translate-y-1 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Deals
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    )
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
                Home
              </Link>
              <Link href="/deals" className="text-[#6be2c9] bg-[#1a2246] px-3 py-2 rounded-lg font-semibold">
                Deals
              </Link>
              <Link href="/about" className="text-[#e9edf7] hover:bg-[#1a2246] px-3 py-2 rounded-lg transition-colors font-semibold">
                About
              </Link>
              <Link href="/auth/signin" className="ml-2 px-4 py-2 bg-gradient-to-b from-[#25304d] to-[#121833] border border-[#263057] rounded-xl text-[#e9edf7] font-bold hover:transform hover:-translate-y-0.5 transition-all">
                Go to Panel
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Back Button */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link href="/deals">
          <motion.button
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0f1640]/50 border border-[#2d3a6b]/30 rounded-xl text-[#e9edf7] hover:bg-[#0f1640] transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Deals
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
                  <span>by</span>
                  <span className="text-[#6be2c9] font-semibold">
                    {deal.partner?.companyName || deal.owner.name}
                  </span>
                </div>
              </div>

              {/* Progress Section */}
              <div className="p-6 bg-gradient-to-br from-[#0b1124cc] to-[#0b1124aa] border border-[#253261] rounded-2xl backdrop-blur-sm">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[#e9edf7] font-semibold">Funding Progress</span>
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
                    Raised: <span className="text-[#6be2c9] font-bold">{formatCurrency(deal.currentFunding)}</span>
                  </span>
                  <span className="text-[#b8c2d8]">
                    Goal: <span className="text-[#e9edf7] font-bold">{formatCurrency(deal.fundingGoal)}</span>
                  </span>
                </div>
              </div>

              {/* Key Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-[#0f1636cc] to-[#0f1636aa] border border-[#2a3666] rounded-xl backdrop-blur-sm text-center">
                  <div className="text-2xl font-bold text-[#6be2c9] mb-1">{deal.duration}M</div>
                  <div className="text-sm text-[#b8c2d8]">Duration</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-[#0f1636cc] to-[#0f1636aa] border border-[#2a3666] rounded-xl backdrop-blur-sm text-center">
                  <div className="text-2xl font-bold text-[#23a1ff] mb-1">{deal.investorCount}</div>
                  <div className="text-sm text-[#b8c2d8]">Investors</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-[#0f1636cc] to-[#0f1636aa] border border-[#2a3666] rounded-xl backdrop-blur-sm text-center">
                  <div className="text-2xl font-bold text-[#f59e0b] mb-1">{formatCurrency(deal.minInvestment)}</div>
                  <div className="text-sm text-[#b8c2d8]">Min Investment</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-[#0f1636cc] to-[#0f1636aa] border border-[#2a3666] rounded-xl backdrop-blur-sm text-center">
                  <div className="text-2xl font-bold text-[#6be2c9] mb-1">{deal.expectedReturn}%</div>
                  <div className="text-sm text-[#b8c2d8]">Expected Return</div>
                </div>
              </div>

              {/* Investment CTA */}
              <div className="p-6 bg-gradient-to-br from-[#111a3f] to-[#0c1230] border border-[#2a3566] rounded-2xl backdrop-blur-sm">
                <h3 className="text-xl font-bold text-[#e9edf7] mb-4">Ready to Invest?</h3>
                <p className="text-[#b8c2d8] mb-6">
                  Join {deal.investorCount} other investors and start earning returns of up to {deal.expectedReturn}% annually.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/auth/signin" className="flex-1">
                    <motion.button
                      className="w-full py-4 bg-gradient-to-r from-[#6be2c9] to-[#23a1ff] text-[#0b1020] font-bold rounded-xl shadow-lg shadow-[#6be2c9]/25 hover:shadow-xl hover:shadow-[#6be2c9]/30 transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Invest Now
                    </motion.button>
                  </Link>
                  <Link href="/auth/signin">
                    <motion.button
                      className="px-6 py-4 bg-gradient-to-b from-[#25304d] to-[#121833] border border-[#263057] text-[#e9edf7] font-bold rounded-xl hover:transform hover:-translate-y-0.5 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Learn More
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
            <h2 className="text-2xl font-bold text-[#e9edf7] mb-4">About This Investment</h2>
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
            <h2 className="text-2xl font-bold text-[#e9edf7] mb-6">Investment Timeline</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#6be2c9]/20 to-[#23a1ff]/20 border border-[#6be2c9]/30 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-[#6be2c9]" />
                </div>
                <div>
                  <div className="text-sm text-[#b8c2d8]">Start Date</div>
                  <div className="text-[#e9edf7] font-semibold">
                    {deal.startDate ? formatDate(deal.startDate) : 'TBA'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#6be2c9]/20 to-[#23a1ff]/20 border border-[#6be2c9]/30 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[#6be2c9]" />
                </div>
                <div>
                  <div className="text-sm text-[#b8c2d8]">End Date</div>
                  <div className="text-[#e9edf7] font-semibold">
                    {deal.endDate ? formatDate(deal.endDate) : 'TBA'}
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
            <h2 className="text-2xl font-bold text-[#e9edf7] mb-6">Risk Assessment</h2>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#f59e0b]/20 to-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-[#f59e0b]" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[#e9edf7] font-semibold">Risk Level:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getRiskColor(deal.riskLevel)}`}>
                    {deal.riskLevel}
                  </span>
                </div>
                <p className="text-[#b8c2d8] leading-relaxed">
                  {deal.riskLevel === 'Low' && 'This investment carries minimal risk with stable, predictable returns. Suitable for conservative investors seeking steady income.'}
                  {deal.riskLevel === 'Medium' && 'This investment carries moderate risk with potential for good returns. Suitable for investors comfortable with some volatility.'}
                  {deal.riskLevel === 'High' && 'This investment carries higher risk but offers potential for significant returns. Suitable for experienced investors seeking growth opportunities.'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Project Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
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
          <h2 className="text-3xl lg:text-4xl font-black text-[#e9edf7] mb-6">
            Start Your Investment Journey
          </h2>
          <p className="text-lg text-[#b8c2d8] mb-8 max-w-2xl mx-auto leading-relaxed">
            Create your account now and join thousands of investors earning consistent returns through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signin">
              <motion.button
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-b from-[#6be2c9] to-[#55e6a5] text-[#0b1020] font-bold rounded-xl shadow-lg shadow-[#6be2c9]/25 hover:transform hover:-translate-y-1 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Create Account & Invest
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link href="/deals">
              <motion.button
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-b from-[#25304d] to-[#121833] border border-[#263057] text-[#e9edf7] font-bold rounded-xl hover:transform hover:-translate-y-1 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View More Deals
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