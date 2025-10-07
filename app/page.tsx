'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { motion, useAnimation, useInView } from 'framer-motion'
import { Button } from './components/ui/Button'
import { Card, CardContent } from './components/ui/Card'
import { useTranslation, useI18n } from './components/providers/I18nProvider'
import PublicHeader from './components/layout/PublicHeader'
import PublicFooter from './components/layout/PublicFooter'
import SmartInvestButton from './components/common/SmartInvestButton'
import { Play, TrendingUp, Shield, BarChart3, Briefcase, Smartphone, Target, Users, CheckCircle, Star, ChevronLeft, ChevronRight } from 'lucide-react'

interface Deal {
  id: string
  title: string
  category: string
  fundingGoal: number
  currentFunding: number
  expectedReturn: number
  duration: number
  riskLevel: string
  thumbnailImage: string
  status: string
  investorCount: number
}

export default function HomePage() {
  const { t } = useTranslation()
  const { locale, setLocale } = useI18n()
  const [liveStats, setLiveStats] = useState({
    totalToday: 0,
    activeInvestors: 0,
    successfulDeals: 0,
    totalInvested: 0,
    averageReturn: 12.5
  })
  const [deals, setDeals] = useState<Deal[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const formatInvestmentAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M+`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K+`
    } else {
      return `$${amount.toFixed(0)}+`
    }
  }

  const stats = [
    { number: `${liveStats.activeInvestors.toLocaleString('en-US')}+`, label: t('hero.stats.active_investors') },
    { number: liveStats.successfulDeals.toString(), label: t('hero.stats.successful_deals') },
    { number: formatInvestmentAmount(liveStats.totalInvested), label: t('hero.stats.total_invested') },
    { number: `${liveStats.averageReturn.toFixed(1)}%`, label: t('hero.stats.average_return') }
  ]

  const testimonials = [
    {
      name: t('testimonials.ahmed.name'),
      role: t('testimonials.ahmed.role'),
      image: '👨‍💼',
      text: t('testimonials.ahmed.text')
    },
    {
      name: t('testimonials.fatima.name'),
      role: t('testimonials.fatima.role'),
      image: '👩‍💼',
      text: t('testimonials.fatima.text')
    },
    {
      name: t('testimonials.mohammed.name'),
      role: t('testimonials.mohammed.role'),
      image: '👨‍🚀',
      text: t('testimonials.mohammed.text')
    }
  ]

    const howItWorks = [
    {
      step: 1,
      title: t('how_it_works.steps.register.title'),
      description: t('how_it_works.steps.register.description'),
      icon: '📝'
    },
    {
      step: 2,
      title: t('how_it_works.steps.browse.title'),
      description: t('how_it_works.steps.browse.description'),
      icon: '🔍'
    },
    {
      step: 3,
      title: t('how_it_works.steps.invest.title'),
      description: t('how_it_works.steps.invest.description'),
      icon: '💰'
    },
    {
      step: 4,
      title: t('how_it_works.steps.earn.title'),
      description: t('how_it_works.steps.earn.description'),
      icon: '📊'
    }
  ]

  // Animation variants
  const fadeInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0 }
  }

  const fadeInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0 }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const staggerItem = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fetch real deals for carousel
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await fetch('/api/deals?limit=6&status=ACTIVE,FUNDED')
        if (response.ok) {
          const data = await response.json()
          if (data.deals && data.deals.length > 0) {
            // Transform the real deals to match our interface
            const transformedDeals = data.deals.map((deal: any) => ({
              id: deal.id,
              title: deal.title,
              category: getCategoryFromTitle(deal.title),
              fundingGoal: deal.fundingGoal,
              currentFunding: deal.currentFunding,
              expectedReturn: deal.expectedReturn,
              duration: calculateDuration(deal.startDate, deal.endDate),
              riskLevel: getRiskLevel(deal.expectedReturn),
              thumbnailImage: deal.thumbnailImage || getDefaultImage(deal.title),
              status: deal.status,
              investorCount: deal.investorCount || 0
            }))
            setDeals(transformedDeals)
          } else {
            // If no deals found, show empty state
            setDeals([])
          }
        }
      } catch (error) {
        console.error('Error fetching deals:', error)
        setDeals([])
      }
    }

    fetchDeals()
  }, [])

  // Fetch real homepage statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Add cache busting parameter to ensure fresh data
        const response = await fetch(`/api/homepage/stats?t=${Date.now()}`, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        if (response.ok) {
          const data = await response.json()
          console.log('Fetched stats:', data) // Debug log
          setLiveStats({
            totalToday: data.todayInvestments,
            activeInvestors: data.activeInvestors,
            successfulDeals: data.successfulDeals,
            totalInvested: data.totalInvested,
            averageReturn: data.averageReturn
          })
        }
      } catch (error) {
        console.error('Error fetching homepage stats:', error)
      }
    }

    fetchStats()
  }, [])

  // Helper functions for deal transformation
  const getCategoryFromTitle = (title: string) => {
    if (title.includes('تقنية') || title.includes('ذكية') || title.includes('إلكترونية')) return 'Technology'
    if (title.includes('هواتف') || title.includes('خلوية')) return 'Mobile'
    if (title.includes('مالية') || title.includes('معاملات')) return 'Finance'
    if (title.includes('كهربائية')) return 'Electronics'
    return 'Business'
  }

  const calculateDuration = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 12
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30))
    return diffMonths
  }

  const getRiskLevel = (expectedReturn: number) => {
    if (expectedReturn < 5) return 'Low'
    if (expectedReturn < 15) return 'Medium'
    return 'High'
  }

  const getDefaultImage = (title: string) => {
    if (title.includes('هواتف') || title.includes('خلوية')) return '/images/phone-deal.jpg'
    if (title.includes('إلكترونية') || title.includes('كهربائية')) return '/images/electronics-deal.jpg'
    return '/images/construction-deal.jpg'
  }

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'Technology': return '💻'
      case 'Mobile': return '📱'
      case 'Finance': return '💰'
      case 'Electronics': return '🔌'
      case 'Business': return '🏢'
      case 'Energy': return '⚡'
      case 'Healthcare': return '🏥'
      default: return '💼'
    }
  }


  // Refresh stats periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/homepage/stats?t=${Date.now()}`, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        if (response.ok) {
          const data = await response.json()
          console.log('Refreshed stats:', data) // Debug log
          setLiveStats({
            totalToday: data.todayInvestments,
            activeInvestors: data.activeInvestors,
            successfulDeals: data.successfulDeals,
            totalInvested: data.totalInvested,
            averageReturn: data.averageReturn
          })
        }
      } catch (error) {
        console.error('Error refreshing stats:', error)
      }
    }, 60000) // Refresh every minute

    return () => clearInterval(interval)
  }, [])

  // Canvas animation for background
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
    }> = []

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.3 + 0.1
      })
    }

    function animate() {
      if (!ctx || !canvas) return
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach(particle => {
        particle.x += particle.vx
        particle.y += particle.vy
        
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1
        
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(107, 226, 201, ${particle.opacity})`
        ctx.fill()
      })
      
      requestAnimationFrame(animate)
    }
    
    animate()
  }, [])

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-900">
      {/* Unified Public Header */}
      <PublicHeader />

      {/* Hero Section */}
      <main className="relative overflow-hidden py-12 lg:py-20">
        {/* Animated Background Canvas */}
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
          aria-hidden="true"
        />
        
        {/* Gradient Orbs */}
        <div className="absolute top-[-40px] right-[10%] w-56 h-56 rounded-full bg-gradient-radial from-[#54ffe3] to-transparent opacity-35 blur-[40px] pointer-events-none mix-blend-screen"></div>
        <div className="absolute bottom-[-60px] left-[5%] w-56 h-56 rounded-full bg-gradient-radial from-[#2fa4ff] to-transparent opacity-35 blur-[40px] pointer-events-none mix-blend-screen"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
             <motion.div 
                className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#1d2547aa] to-[#121833aa] border border-[#2c3769] rounded-full text-sm text-[#e9edf7] mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {t('hero.welcome')}
              </motion.div>
              
               <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6 bg-gradient-to-b from-[#eaf4ff] via-[#d4e7ff] to-[#a9c6ff] bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {t('hero.title')}
                 </motion.h1>
              
               <motion.p 
                className="text-lg lg:text-xl text-[#cdd6ec] leading-relaxed mb-8 max-w-2xl"
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                                >
                {t('hero.description')}
                 </motion.p>
              
               <motion.div 
                 className="flex flex-col sm:flex-row gap-4 mb-8"
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
               >
                 <SmartInvestButton>
                  <motion.button
                    className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-b from-[#6be2c9] to-[#55e6a5] text-[#0b1020] font-bold rounded-xl shadow-lg shadow-[#6be2c9]/25 hover:transform hover:-translate-y-1 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>{t('hero.cta.start_investing')}</span>
                  </motion.button>
                 </SmartInvestButton>
                 <Link href="/deals">
                  <motion.button
                    className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-b from-[#25304d] to-[#121833] border border-[#263057] text-[#e9edf7] font-bold rounded-xl hover:transform hover:-translate-y-1 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>{t('hero.cta.explore_opportunities')}</span>
                  </motion.button>
                 </Link>
               </motion.div>
               
              {/* Stats Pills */}
               <motion.div 
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                {[
                  { value: `${liveStats.activeInvestors.toLocaleString()}+`, label: t('hero.stats.active_investors') },
                  { value: liveStats.successfulDeals.toString(), label: t('hero.stats.successful_deals') },
                  { value: formatInvestmentAmount(liveStats.totalInvested), label: t('hero.stats.total_invested') },
                  { value: `${liveStats.averageReturn.toFixed(1)}%`, label: t('hero.stats.average_return') }
                ].map((stat, index) => (
                   <motion.div 
                     key={index} 
                    className="flex flex-col gap-1 min-w-[140px] px-4 py-3 bg-[#10173a] border border-[#283363] rounded-xl"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-2xl lg:text-3xl font-black text-[#6be2c9] tracking-wide">{stat.value}</div>
                    <div className="text-sm text-[#b8c2d8]">{stat.label}</div>
                   </motion.div>
                 ))}
               </motion.div>
             </motion.div>

            {/* Right Content - Bento Grid */}
             <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {/* Modern Video Demo Card */}
               <motion.div 
                className="lg:col-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a0f2e] via-[#0f1640] to-[#1a2555] border border-[#2d3a6b]/50 shadow-2xl"
                 whileHover={{ scale: 1.01, y: -5 }}
                 transition={{ duration: 0.4 }}
               >
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800/10 to-slate-700/10 opacity-20"></div>
                
                {/* Glow Effect */}
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-radial from-[#6be2c9]/20 to-transparent blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-radial from-[#23a1ff]/15 to-transparent blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                
                <div className="relative p-8">
                  <motion.div 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6be2c9]/10 to-[#23a1ff]/10 border border-[#6be2c9]/30 rounded-full text-sm text-[#6be2c9] font-medium mb-6 backdrop-blur-sm"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="w-2 h-2 bg-[#6be2c9] rounded-full animate-pulse"></div>
                    {t('hero.demo.badge')}
                  </motion.div>
                  
                  <motion.h3 
                    className="text-2xl lg:text-3xl font-black text-[#ffffff] mb-3 leading-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {t('hero.demo.title')}
                  </motion.h3>
                  
                  <motion.p 
                    className="text-[#b8c2d8] mb-6 text-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {t('hero.demo.description')}
                  </motion.p>
                  
                  <motion.button 
                    className="group/btn relative flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-[#6be2c9] to-[#23a1ff] text-[#0a0f2e] font-bold rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#6be2c9]/25"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    {/* Button Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#ffffff]/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative w-12 h-12 bg-[#ffffff]/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover/btn:scale-110 transition-transform duration-300">
                      <Play className="w-6 h-6 text-[#0a0f2e] ml-1" />
                    </div>
                    <div className="relative">
                      <span className="text-lg">{t('hero.demo.watch_demo')}</span>
                      <div className="text-sm opacity-80">{t('hero.demo.start_journey')}</div>
                    </div>
                  </motion.button>
                  
                  {/* Modern Chart Visualization */}
                  <motion.div 
                    className="mt-8 relative h-32 bg-gradient-to-br from-[#0a1235]/80 to-[#1a2555]/80 border border-[#2d3a6b]/30 rounded-2xl p-4 backdrop-blur-sm overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    {/* Animated Chart Lines */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 200 80">
                        <motion.path
                          d="M10,60 Q50,20 100,30 T190,25"
                          stroke="url(#gradient)"
                          strokeWidth="3"
                          fill="none"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 2, delay: 0.8 }}
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6be2c9" />
                            <stop offset="100%" stopColor="#23a1ff" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    
                    {/* Chart Data Points */}
                    <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
                      {[40, 65, 45, 80, 70, 90].map((height, i) => (
                        <motion.div
                          key={i}
                          className="w-2 bg-gradient-to-t from-[#6be2c9] to-[#23a1ff] rounded-full opacity-60"
                          style={{ height: `${height}%` }}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: 1 + i * 0.1, duration: 0.5 }}
                        />
                      ))}
                    </div>
                    
                    {/* Floating Stats */}
                    <motion.div 
                      className="absolute top-2 right-2 px-3 py-1 bg-[#6be2c9]/20 border border-[#6be2c9]/30 rounded-full text-xs text-[#6be2c9] font-medium backdrop-blur-sm"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.5 }}
                    >
                      +15% ROI
                    </motion.div>
                  </motion.div>
                </div>
               </motion.div>
               
              {/* Guaranteed Return Card */}
               <motion.div 
                className="p-6 bg-gradient-to-br from-[#0b1124cc] to-[#0b1124aa] border border-[#6be2c988] rounded-2xl shadow-[0_0_0_8px_var(--ring)] backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#1d2547aa] to-[#121833aa] border border-[#2c3769] rounded-full text-sm text-[#79ffd6] mb-3">
                  ✓ {t('guaranteed_return_card.badge')}
                   </div>
                <h3 className="text-xl font-bold text-[#e9edf7] mb-2">{t('guaranteed_return_card.title')}</h3>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#1d2547aa] to-[#121833aa] border border-[#2c3769] rounded-full text-sm text-[#79ffd6] mb-3">
                  🛡️ {t('guaranteed_return_card.security_badge')}
                   </div>
                <p className="text-[#b8c2d8] text-sm">{t('guaranteed_return_card.security_description')}</p>
               </motion.div>
             </motion.div>
          </div>
        </div>
      </main>

      {/* About Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
           <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6 }}
             viewport={{ once: true }}
           >
          <h2 className="text-3xl lg:text-4xl font-black text-[#e9edf7] mb-4">{t('about.section_title')}</h2>
          <p className="text-[#b8c2d8] text-lg max-w-3xl mx-auto">
            {t('about.section_description')}
          </p>
           </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: t('about.cards.what.title'),
              description: t('about.cards.what.description'),
              icon: '🎯'
            },
            {
              title: t('about.cards.vision.title'),
              description: t('about.cards.vision.description'),
              icon: '💡'
            },
            {
              title: t('about.cards.mission.title'),
              description: t('about.cards.mission.description'),
              icon: '🚀'
            },
            {
              title: t('about.cards.values.title'),
              description: t('about.cards.values.description'),
              icon: '⭐'
            }
          ].map((item, index) => (
           <motion.div 
              key={index}
              className="p-6 bg-gradient-to-br from-[#0b1124cc] to-[#0b1124aa] border border-[#253261] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,.35)] backdrop-blur-sm"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -5 }}
             viewport={{ once: true }}
           >
              <div className="text-3xl mb-4">{item.icon}</div>
              <h3 className="text-lg font-bold text-[#e9edf7] mb-3">{item.title}</h3>
              <p className="text-[#b8c2d8] text-sm leading-relaxed">{item.description}</p>
                   </motion.div>
          ))}
         </div>
       </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                                <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6 }}
             viewport={{ once: true }}
           >
          <h2 className="text-3xl lg:text-4xl font-black text-[#e9edf7] mb-4">{t('how_it_works.title')}</h2>
          <p className="text-[#b8c2d8] text-lg max-w-2xl mx-auto">
            {t('how_it_works.description')}
          </p>
           </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {howItWorks.map((step, index) => (
               <motion.div 
                 key={index} 
              className="p-6 bg-gradient-to-br from-[#0f1636cc] to-[#0f1636aa] border border-[#2a3666] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,.35)] backdrop-blur-sm relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -5 }}
                       viewport={{ once: true }}
                     >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#1d2547aa] to-[#121833aa] border border-[#2c3769] rounded-full text-sm text-[#e9edf7] mb-4">
                {step.icon} {step.description}
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-[#142255] border border-[#2c4588] rounded-lg text-[#9cc3ff] font-black font-mono text-lg">
                       {step.step}
                </span>
                <h3 className="text-lg font-bold text-[#e9edf7]">{step.title}</h3>
                 </div>
               </motion.div>
                            ))}
         </div>
       </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: <Shield className="w-6 h-6" />, key: 'bank_security' },
            { icon: <BarChart3 className="w-6 h-6" />, key: 'advanced_analytics' },
            { icon: <Briefcase className="w-6 h-6" />, key: 'opportunity_diversity' },
            { icon: <Smartphone className="w-6 h-6" />, key: 'ease_of_use' },
            { icon: <Target className="w-6 h-6" />, key: 'guaranteed_returns' },
            { icon: <Users className="w-6 h-6" />, key: 'continuous_support' }
            ].map((feature, index) => (
            <motion.div
              key={index}
              className="flex items-start gap-4 p-4 bg-gradient-to-br from-[#0e1534aa] to-[#0e1534aa] border border-[#26325f] rounded-xl backdrop-blur-sm"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 bg-gradient-to-b from-[#142455] to-[#0d183a] border border-[#2b3b73] rounded-xl flex items-center justify-center text-[#cfe0ff] flex-shrink-0">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#e9edf7] mb-2">{t(`features.${feature.key}.title`)}</h3>
                <p className="text-[#b8c2d8] text-sm">{t(`features.${feature.key}.description`)}</p>
                  </div>
            </motion.div>
            ))}
        </div>
      </section>

      {/* Modern Live Deals Carousel */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div 
          className="flex items-center justify-between mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div>
            <motion.h2 
              className="text-3xl lg:text-4xl font-black text-[#e9edf7] mb-2"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              {t('live_activity.title')}
            </motion.h2>
            <motion.p 
              className="text-[#b8c2d8] text-lg"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {t('live_activity.description')}
            </motion.p>
          </div>
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#123b3a] to-[#1c7d74] border border-[#1c7d74] rounded-full text-sm text-[#79ffd6] font-medium">
              <div className="w-2 h-2 bg-[#79ffd6] rounded-full animate-pulse"></div>
              {t('live_activity.live')}
            </div>
            {/* Deal count indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-[#0f1640]/50 border border-[#2d3a6b]/30 rounded-full text-xs text-[#b8c2d8]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#6be2c9]"></div>
              {deals.length} {t('live_activity.active_deals')}
            </div>
          </motion.div>
        </motion.div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.slice(0, 6).map((deal, index) => (
            <motion.div 
              key={deal.id}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a0f2e] via-[#0f1640] to-[#1a2555] border border-[#2d3a6b]/50 shadow-2xl"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -10 }}
              viewport={{ once: true }}
            >
              {/* Glow Effect on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#6be2c9]/5 to-[#23a1ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Content */}
              <div className="relative p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <motion.div 
                    className="w-14 h-14 bg-gradient-to-br from-[#6be2c9]/20 to-[#23a1ff]/20 border border-[#6be2c9]/30 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-sm"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    {getIconForCategory(deal.category)}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-[#ffffff] font-bold text-lg leading-tight line-clamp-2">{deal.title}</h3>
                      <motion.div 
                        className="ml-2 px-3 py-1 bg-gradient-to-r from-[#6be2c9]/20 to-[#23a1ff]/20 border border-[#6be2c9]/30 rounded-full text-xs text-[#6be2c9] font-bold whitespace-nowrap backdrop-blur-sm"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        {deal.expectedReturn}% ROI
                      </motion.div>
                    </div>
                    <p className="text-[#b8c2d8] text-sm">{deal.category} • {deal.investorCount} investors</p>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-[#b8c2d8] mb-3">
                    <span className="font-medium">{t('live_activity.funding_progress')}</span>
                    <span className="font-bold text-[#6be2c9]">{Math.round((deal.currentFunding / deal.fundingGoal) * 100)}%</span>
                  </div>
                  <div className="relative w-full bg-[#1a2555] rounded-full h-3 overflow-hidden">
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-[#6be2c9] to-[#23a1ff] rounded-full shadow-lg"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(deal.currentFunding / deal.fundingGoal) * 100}%` }}
                      transition={{ duration: 1.5, delay: 0.5 + index * 0.1, ease: "easeOut" }}
                      viewport={{ once: true }}
                    />
                    {/* Glow effect */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-[#6be2c9] to-[#23a1ff] rounded-full blur-sm opacity-50"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(deal.currentFunding / deal.fundingGoal) * 100}%` }}
                      transition={{ duration: 1.5, delay: 0.5 + index * 0.1, ease: "easeOut" }}
                      viewport={{ once: true }}
                    />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <motion.div 
                      className="text-xl font-bold text-[#6be2c9] mb-1"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      ${(deal.currentFunding / 1000).toFixed(0)}K
                    </motion.div>
                    <div className="text-xs text-[#b8c2d8]">{t('live_activity.raised')}</div>
                  </div>
                  <div className="text-center">
                    <motion.div 
                      className="text-xl font-bold text-[#23a1ff] mb-1"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      {deal.duration}M
                    </motion.div>
                    <div className="text-xs text-[#b8c2d8]">{t('live_activity.duration')}</div>
                  </div>
                  <div className="text-center">
                    <motion.div 
                      className="text-xl font-bold text-[#f59e0b] mb-1"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ delay: 1.0 + index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      {deal.riskLevel}
                    </motion.div>
                    <div className="text-xs text-[#b8c2d8]">{t('live_activity.risk')}</div>
                  </div>
                </div>

                {/* Action Button */}
                <SmartInvestButton dealId={deal.id}>
                  <motion.button 
                    className="w-full py-3 bg-gradient-to-r from-[#6be2c9]/10 to-[#23a1ff]/10 border border-[#6be2c9]/30 rounded-xl text-[#6be2c9] font-medium hover:from-[#6be2c9]/20 hover:to-[#23a1ff]/20 transition-all duration-300 backdrop-blur-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    {t('live_activity.view_details')}
                  </motion.button>
                </SmartInvestButton>
              </div>
            </motion.div>
          ))}

          {/* Loading State */}
          {deals.length === 0 && (
            <motion.div 
              className="flex items-center justify-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-center">
                <motion.div 
                  className="w-20 h-20 bg-gradient-to-br from-[#0f1640] to-[#1a2555] border border-[#2d3a6b] rounded-2xl flex items-center justify-center mx-auto mb-6"
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
                <p className="text-[#b8c2d8] text-lg">{t('live_activity.loading')}</p>
              </div>
            </motion.div>
          )}

        </div>

        {/* Activity Summary */}
        <motion.div 
          className="mt-8 p-6 bg-gradient-to-br from-[#0b1124cc] to-[#0b1124aa] border border-[#253261] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,.35)] backdrop-blur-sm"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#123b3a] to-[#1c7d74] border border-[#1c7d74] rounded-full text-sm text-[#79ffd6] mb-4">
              <div className="w-2 h-2 bg-[#79ffd6] rounded-full animate-pulse"></div>
              {t('live_activity.recent_activity')}
            </div>
            <p className="text-[#b8c2d8]">
              {t('live_activity.total_today')}: <span className="text-[#6be2c9] font-bold">${liveStats.totalToday.toLocaleString()}</span>
              {liveStats.totalToday === 0 && (
                <span className="block text-sm text-[#95a5c9] mt-1">{t('live_activity.no_investments')}</span>
              )}
            </p>
          </div>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl lg:text-4xl font-black text-[#e9edf7] mb-4">{t('testimonials.title')}</h2>
          <p className="text-[#b8c2d8] text-lg">{t('testimonials.subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Ahmed Mohammed',
              role: 'Investor',
              avatar: '👨‍💼',
              text: 'I achieved excellent returns through Sahem Invest platform. The platform is reliable and easy to use.'
            },
            {
              name: 'Fatima Al-Ali',
              role: 'Entrepreneur',
              avatar: '👩‍💼',
              text: 'Excellent platform for getting the necessary funding for my projects. Smooth and transparent process.'
            },
            {
              name: 'Mohammed Al-Saadoun',
              role: 'Experienced Investor',
              avatar: '👨‍🚀',
              text: 'The best investment platform I\'ve tried. Diverse opportunities and guaranteed returns.'
            }
          ].map((testimonial, index) => (
            <motion.div
              key={index}
              className="p-6 bg-gradient-to-br from-[#0e1430cc] to-[#0e1430aa] border border-[#293668] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,.35)] backdrop-blur-sm"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -5 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#101b44] to-[#2a3b79] border border-[#2a3b79] rounded-xl flex items-center justify-center text-xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#e9edf7]">{testimonial.name}</h4>
                  <p className="text-[#b8c2d8] text-sm">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-[#b8c2d8] leading-relaxed mb-4">&ldquo;{testimonial.text}&rdquo;</p>
              <div className="flex gap-1 text-[#ffd87b]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

             {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
         <motion.div 
          className="text-center p-12 lg:p-16 bg-gradient-to-br from-[#111a3f] to-[#0c1230] border border-[#2a3566] rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,.35)] backdrop-blur-sm"
           initial={{ opacity: 0, y: 50 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           viewport={{ once: true }}
         >
           <motion.h2 
            className="text-3xl lg:text-4xl font-black text-[#e9edf7] mb-6"
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6, delay: 0.2 }}
             viewport={{ once: true }}
                        >
            {t('cta.title')}
             </motion.h2>
           <motion.p 
            className="text-lg text-[#b8c2d8] mb-8 max-w-2xl mx-auto leading-relaxed"
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6, delay: 0.4 }}
             viewport={{ once: true }}
                        >
            {t('cta.description')}
             </motion.p>
           <motion.div 
             className="flex flex-col sm:flex-row gap-4 justify-center"
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6, delay: 0.6 }}
             viewport={{ once: true }}
           >
             <Link href="/auth/signup">
              <motion.button
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-b from-[#6be2c9] to-[#55e6a5] text-[#0b1020] font-bold rounded-xl shadow-lg shadow-[#6be2c9]/25 hover:transform hover:-translate-y-1 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t('cta.register_free')}
              </motion.button>
             </Link>
             <Link href="/deals">
              <motion.button
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-b from-[#25304d] to-[#121833] border border-[#263057] text-[#e9edf7] font-bold rounded-xl hover:transform hover:-translate-y-1 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t('cta.browse_opportunities')}
              </motion.button>
             </Link>
           </motion.div>
         </motion.div>
       </section>

      {/* Unified Footer */}
      <PublicFooter />
    </div>
  )
}
