'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from './components/ui/Button'
import { Card, CardContent } from './components/ui/Card'
import { Header } from './components/layout/Header'
import { useTranslation, useI18n } from './components/providers/I18nProvider'

export default function HomePage() {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const [liveStats, setLiveStats] = useState({
    totalToday: 140800,
    activeInvestors: 1247
  })

  const stats = [
    { number: `${liveStats.activeInvestors.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')}+`, label: t('hero.stats.active_investors') },
    { number: '156', label: t('hero.stats.successful_deals') },
    { number: '$2.8M+', label: t('hero.stats.total_invested') },
    { number: '12.5%', label: t('hero.stats.average_return') }
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

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        totalToday: prev.totalToday + Math.floor(Math.random() * 5000) + 1000,
        activeInvestors: prev.activeInvestors + Math.floor(Math.random() * 3)
      }))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#050a30] via-[#0a1548] to-[#039bdf]">
        <div className="absolute inset-0 bg-black/20"></div>
                 <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
             <motion.div 
               className="text-white"
               initial="hidden"
               animate="visible"
               variants={fadeInLeft}
             >
               <motion.h1 
                 className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
                 initial={{ opacity: 0, y: 50 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.8, delay: 0.2 }}
                                >
                   {t('hero.title')}
                   <motion.span 
                     className="block text-[#039bdf]"
                     initial={{ opacity: 0, x: -50 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ duration: 0.8, delay: 0.5 }}
                   >
                     {t('hero.subtitle')}
                   </motion.span>
                 </motion.h1>
               <motion.p 
                 className="text-xl text-blue-100 mb-8 leading-relaxed"
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.6, delay: 0.7 }}
                                >
                   {t('hero.description')}
                 </motion.p>
               <motion.div 
                 className="flex flex-col sm:flex-row gap-4 mb-8"
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.6, delay: 0.9 }}
               >
                 <Link href="/auth/signin">
                   <motion.div
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                   >
                     <Button size="lg" className="w-full sm:w-auto bg-[#039bdf] hover:bg-[#0284c7] text-white border-none">
                       {t('hero.cta_invest')}
                     </Button>
                   </motion.div>
                 </Link>
                 <Link href="/deals">
                   <motion.div
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                   >
                     <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-[#050a30]">
                       {t('hero.cta_explore')}
                     </Button>
                   </motion.div>
                 </Link>
               </motion.div>
               
               {/* Stats */}
               <motion.div 
                 className="grid grid-cols-2 md:grid-cols-4 gap-6"
                 variants={staggerContainer}
                 initial="hidden"
                 animate="visible"
               >
                 {stats.map((stat, index) => (
                   <motion.div 
                     key={index} 
                     className="text-center"
                     variants={staggerItem}
                     whileHover={{ scale: 1.1, y: -5 }}
                     transition={{ type: "spring", stiffness: 300 }}
                   >
                     <motion.div 
                       className="text-2xl font-bold text-[#039bdf]"
                       initial={{ scale: 0 }}
                       animate={{ scale: 1 }}
                       transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                     >
                       {stat.number}
                     </motion.div>
                     <div className="text-sm text-blue-200">{stat.label}</div>
                   </motion.div>
                 ))}
               </motion.div>
             </motion.div>

                         {/* Video/Image Section */}
             <motion.div 
               className="relative"
               initial="hidden"
               animate="visible"
               variants={fadeInRight}
             >
               <motion.div 
                 className="relative bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden"
                 whileHover={{ scale: 1.02 }}
                 transition={{ duration: 0.3 }}
               >
                 <div className="aspect-video bg-gradient-to-br from-[#039bdf]/20 to-[#050a30]/40 flex items-center justify-center">
                   <div className="text-center text-white">
                     <motion.div 
                       className="w-20 h-20 bg-[#039bdf] rounded-full flex items-center justify-center mx-auto mb-4"
                       whileHover={{ scale: 1.1, rotate: 360 }}
                       transition={{ duration: 0.5 }}
                     >
                       <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M8 5v14l11-7z"/>
                       </svg>
                     </motion.div>
                     <h3 className="text-xl font-semibold mb-2">{t('hero.video_title')}</h3>
                     <p className="text-blue-200">{t('hero.video_description')}</p>
                   </div>
                 </div>
               </motion.div>
               
               {/* Floating Cards */}
               <motion.div 
                 className="absolute -top-4 -right-4 bg-white rounded-lg p-4 shadow-xl"
                 initial={{ opacity: 0, scale: 0, rotate: -10 }}
                 animate={{ opacity: 1, scale: 1, rotate: 0 }}
                 transition={{ duration: 0.6, delay: 1.5 }}
                 whileHover={{ scale: 1.05, y: -5 }}
               >
                 <div className="flex items-center gap-2">
                   <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                     <span className="text-green-600 text-sm">✓</span>
                   </div>
                   <div>
                     <div className="text-sm font-semibold text-[#050a30]">{t('hero.guaranteed_return')}</div>
                     <div className="text-xs text-gray-600">{t('hero.up_to_return')}</div>
                   </div>
                 </div>
               </motion.div>
               
               <motion.div 
                 className="absolute -bottom-4 -left-4 bg-white rounded-lg p-4 shadow-xl"
                 initial={{ opacity: 0, scale: 0, rotate: 10 }}
                 animate={{ opacity: 1, scale: 1, rotate: 0 }}
                 transition={{ duration: 0.6, delay: 1.8 }}
                 whileHover={{ scale: 1.05, y: -5 }}
               >
                 <div className="flex items-center gap-2">
                   <div className="w-8 h-8 bg-[#039bdf] rounded-full flex items-center justify-center">
                     <span className="text-white text-sm">🛡️</span>
                   </div>
                   <div>
                     <div className="text-sm font-semibold text-[#050a30]">{t('hero.bank_security')}</div>
                     <div className="text-xs text-gray-600">{t('hero.full_protection')}</div>
                   </div>
                 </div>
               </motion.div>
             </motion.div>
          </div>
        </div>
      </section>

             {/* What is Sahaminvest */}
       <section className="py-20 bg-gray-50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <motion.div 
             className="text-center mb-16"
             initial={{ opacity: 0, y: 50 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6 }}
             viewport={{ once: true }}
           >
             <motion.h2 
               className="text-4xl font-bold text-[#050a30] mb-6"
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.2 }}
               viewport={{ once: true }}
                            >
                 {t('about.title')}
               </motion.h2>
             <motion.p 
               className="text-xl text-gray-600 max-w-3xl mx-auto"
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.4 }}
               viewport={{ once: true }}
                            >
                 {t('about.description')}
               </motion.p>
           </motion.div>

           <motion.div 
             className="grid grid-cols-1 lg:grid-cols-3 gap-8"
             variants={staggerContainer}
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
           >
                         <motion.div variants={staggerItem}>
               <Card className="border-l-4 border-[#039bdf] hover:shadow-lg transition-shadow">
                 <CardContent className="p-8">
                   <motion.div 
                     className="w-16 h-16 bg-[#039bdf] rounded-full flex items-center justify-center mb-6"
                     whileHover={{ scale: 1.1, rotate: 360 }}
                     transition={{ duration: 0.5 }}
                   >
                     <span className="text-2xl text-white">🎯</span>
                   </motion.div>
                   <h3 className="text-2xl font-bold text-[#050a30] mb-4">{t('about.vision.title')}</h3>
                   <p className="text-gray-600 leading-relaxed">
                     {t('about.vision.description')}
                   </p>
                 </CardContent>
               </Card>
             </motion.div>

             <motion.div variants={staggerItem}>
               <Card className="border-l-4 border-[#039bdf] hover:shadow-lg transition-shadow">
                 <CardContent className="p-8">
                   <motion.div 
                     className="w-16 h-16 bg-[#039bdf] rounded-full flex items-center justify-center mb-6"
                     whileHover={{ scale: 1.1, rotate: 360 }}
                     transition={{ duration: 0.5 }}
                   >
                     <span className="text-2xl text-white">💡</span>
                   </motion.div>
                   <h3 className="text-2xl font-bold text-[#050a30] mb-4">{t('about.mission.title')}</h3>
                   <p className="text-gray-600 leading-relaxed">
                     {t('about.mission.description')}
                   </p>
                 </CardContent>
               </Card>
             </motion.div>

             <motion.div variants={staggerItem}>
               <Card className="border-l-4 border-[#039bdf] hover:shadow-lg transition-shadow">
                 <CardContent className="p-8">
                   <motion.div 
                     className="w-16 h-16 bg-[#039bdf] rounded-full flex items-center justify-center mb-6"
                     whileHover={{ scale: 1.1, rotate: 360 }}
                     transition={{ duration: 0.5 }}
                   >
                     <span className="text-2xl text-white">⭐</span>
                   </motion.div>
                   <h3 className="text-2xl font-bold text-[#050a30] mb-4">{t('about.values.title')}</h3>
                   <p className="text-gray-600 leading-relaxed">
                     {t('about.values.description')}
                   </p>
                 </CardContent>
               </Card>
             </motion.div>
           </motion.div>
         </div>
       </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <motion.div 
             className="text-center mb-16"
             initial={{ opacity: 0, y: 50 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6 }}
             viewport={{ once: true }}
           >
             <motion.h2 
               className="text-4xl font-bold text-[#050a30] mb-6"
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.2 }}
               viewport={{ once: true }}
                            >
                 {t('how_it_works.title')}
               </motion.h2>
             <motion.p 
               className="text-xl text-gray-600 max-w-2xl mx-auto"
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.4 }}
               viewport={{ once: true }}
                            >
                 {t('how_it_works.description')}
               </motion.p>
           </motion.div>

           <motion.div 
             className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-4"
             variants={staggerContainer}
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
           >
             {howItWorks.map((step, index) => (
               <motion.div 
                 key={index} 
                 className="flex flex-col lg:flex-row items-center"
                 variants={staggerItem}
                 whileHover={{ y: -10 }}
                 transition={{ type: "spring", stiffness: 300 }}
               >
                 <div className="text-center lg:w-64">
                   <div className="relative inline-block">
                     <motion.div 
                       className="w-20 h-20 bg-gradient-to-br from-[#050a30] to-[#039bdf] rounded-full flex items-center justify-center mb-6 mx-auto"
                       whileHover={{ scale: 1.1, rotate: 360 }}
                       transition={{ duration: 0.5 }}
                     >
                       <span className="text-3xl">{step.icon}</span>
                     </motion.div>
                     <motion.div 
                       className="absolute -top-2 -right-2 w-8 h-8 bg-[#039bdf] text-white rounded-full flex items-center justify-center text-sm font-bold"
                       initial={{ scale: 0 }}
                       whileInView={{ scale: 1 }}
                       transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                       viewport={{ once: true }}
                     >
                       {step.step}
                     </motion.div>
                   </div>
                   <h3 className="text-xl font-bold text-[#050a30] mb-3">{step.title}</h3>
                   <p className="text-gray-600 leading-relaxed">{step.description}</p>
                 </div>
                 
                 {index < howItWorks.length - 1 && (
                   <motion.div 
                     className="hidden lg:flex items-center justify-center mx-4"
                     initial={{ opacity: 0, x: -20 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                     viewport={{ once: true }}
                   >
                     <svg className="w-8 h-8 text-[#039bdf]" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                     </svg>
                   </motion.div>
                 )}
               </motion.div>
                            ))}
           </motion.div>
         </div>
       </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#050a30] mb-6">{t('features.title')}</h2>
            <p className="text-xl text-gray-600">{t('features.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🛡️',
                title: t('features.bank_security.title'),
                description: t('features.bank_security.description')
              },
              {
                icon: '📊',
                title: t('features.advanced_analytics.title'),
                description: t('features.advanced_analytics.description')
              },
              {
                icon: '💼',
                title: t('features.opportunity_diversity.title'),
                description: t('features.opportunity_diversity.description')
              },
              {
                icon: '📱',
                title: t('features.ease_of_use.title'),
                description: t('features.ease_of_use.description')
              },
              {
                icon: '🎯',
                title: t('features.guaranteed_returns.title'),
                description: t('features.guaranteed_returns.description')
              },
              {
                icon: '🤝',
                title: t('features.continuous_support.title'),
                description: t('features.continuous_support.description')
              }
            ].map((feature, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#050a30] to-[#039bdf] rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#050a30] mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

             {/* Live Investment Activity */}
       <section className="py-16 bg-gray-50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <motion.div 
             className="text-center mb-12"
             initial={{ opacity: 0, y: 50 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6 }}
             viewport={{ once: true }}
           >
             <motion.h2 
               className="text-3xl font-bold text-[#050a30] mb-4"
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.2 }}
               viewport={{ once: true }}
                            >
                 {t('live_activity.title')}
               </motion.h2>
             <motion.p 
               className="text-gray-600"
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.4 }}
               viewport={{ once: true }}
                            >
                 {t('live_activity.description')}
               </motion.p>
           </motion.div>
           
           <motion.div 
             className="bg-white rounded-2xl shadow-lg p-8"
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.6 }}
             viewport={{ once: true }}
           >
             <div className="space-y-4 max-h-80 overflow-y-auto">
               {[
                 { name: t('live_activity.sample_data.investors.0.name'), amount: '15,000', project: t('live_activity.sample_data.investors.0.project'), time: t('live_activity.sample_data.investors.0.time'), avatar: '👨‍💼' },
                 { name: t('live_activity.sample_data.investors.1.name'), amount: '8,500', project: t('live_activity.sample_data.investors.1.project'), time: t('live_activity.sample_data.investors.1.time'), avatar: '👩‍💼' },
                 { name: t('live_activity.sample_data.investors.2.name'), amount: '25,000', project: t('live_activity.sample_data.investors.2.project'), time: t('live_activity.sample_data.investors.2.time'), avatar: '👨‍🚀' },
                 { name: t('live_activity.sample_data.investors.3.name'), amount: '12,000', project: t('live_activity.sample_data.investors.3.project'), time: t('live_activity.sample_data.investors.3.time'), avatar: '👩‍💻' },
                 { name: t('live_activity.sample_data.investors.4.name'), amount: '30,000', project: t('live_activity.sample_data.investors.4.project'), time: t('live_activity.sample_data.investors.4.time'), avatar: '👨‍💼' },
                 { name: t('live_activity.sample_data.investors.5.name'), amount: '18,500', project: t('live_activity.sample_data.investors.5.project'), time: t('live_activity.sample_data.investors.5.time'), avatar: '👩‍💼' },
                 { name: t('live_activity.sample_data.investors.6.name'), amount: '22,000', project: t('live_activity.sample_data.investors.6.project'), time: t('live_activity.sample_data.investors.6.time'), avatar: '👨‍🔧' },
                 { name: t('live_activity.sample_data.investors.7.name'), amount: '9,800', project: t('live_activity.sample_data.investors.7.project'), time: t('live_activity.sample_data.investors.7.time'), avatar: '👩‍🎨' }
               ].map((activity, index) => (
                 <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors relative">
                   {index < 3 && (
                     <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                       {t('live_activity.new_badge')}
                     </div>
                   )}
                   <div className="flex items-center space-x-4">
                     <div className="text-2xl">{activity.avatar}</div>
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center space-x-2">
                         <span className="font-semibold text-[#050a30]">{activity.name}</span>
                         <span className="text-gray-600">{t('live_activity.just_invested')}</span>
                         <span className="font-bold text-[#039bdf]">${activity.amount}</span>
                       </div>
                       <p className="text-sm text-gray-600 truncate">{t('live_activity.in_project')} {activity.project}</p>
                     </div>
                   </div>
                   <div className="text-xs text-gray-500 whitespace-nowrap">
                     {activity.time}
                   </div>
                 </div>
               ))}
             </div>
             
             <div className="mt-6 text-center">
               <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                 <span className="text-sm font-medium">{t('live_activity.recent_activity')}</span>
               </div>
               <p className="text-sm text-gray-600 mt-2">
                 {t('live_activity.stats.today_total')}: <span className="font-bold text-[#039bdf]">${liveStats.totalToday.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')}</span>
               </p>
                            </div>
             </motion.div>
           </div>
         </section>

       {/* Social Proof - Testimonials */}
       <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#050a30] mb-6">{t('testimonials.title')}</h2>
                         <p className="text-xl text-gray-600">{t('testimonials.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="text-4xl ml-4">{testimonial.image}</div>
                    <div>
                      <h4 className="font-bold text-[#050a30]">{testimonial.name}</h4>
                      <p className="text-[#039bdf] text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">&ldquo;{testimonial.text}&rdquo;</p>
                  <div className="flex text-[#039bdf]">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>⭐</span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      

             {/* CTA Section */}
       <section className="py-20 bg-[#050a30]">
         <motion.div 
           className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
           initial={{ opacity: 0, y: 50 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           viewport={{ once: true }}
         >
           <motion.h2 
             className="text-4xl font-bold text-white mb-6"
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6, delay: 0.2 }}
             viewport={{ once: true }}
                        >
               {t('cta.title')}
             </motion.h2>
           <motion.p 
             className="text-xl text-blue-100 mb-8 leading-relaxed"
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
             <Link href="/auth/signin">
               <motion.div
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
               >
                 <Button size="lg" className="bg-[#039bdf] hover:bg-[#0284c7] text-white border-none">
                   {t('cta.register_now')}
                 </Button>
               </motion.div>
             </Link>
             <Link href="/deals">
               <motion.div
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
               >
                 <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-[#050a30]">
                   {t('cta.browse_opportunities')}
                 </Button>
               </motion.div>
             </Link>
           </motion.div>
         </motion.div>
       </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold text-[#050a30] mb-4">{t('platform.name')}</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {t('footer.description')}
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-[#039bdf] rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-[#0284c7] transition-colors">
                  <span>📧</span>
                </div>
                <div className="w-10 h-10 bg-[#039bdf] rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-[#0284c7] transition-colors">
                  <span>📱</span>
                </div>
                <div className="w-10 h-10 bg-[#039bdf] rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-[#0284c7] transition-colors">
                  <span>🌐</span>
              </div>
              </div>
        </div>

            <div>
              <h4 className="font-bold text-[#050a30] mb-4">{t('footer.quick_links')}</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="/deals" className="hover:text-[#039bdf] transition-colors">{t('navigation.deals')}</a></li>
                <li><a href="/portfolio" className="hover:text-[#039bdf] transition-colors">{t('navigation.portfolio')}</a></li>
                <li><a href="/about" className="hover:text-[#039bdf] transition-colors">{t('footer.about_us')}</a></li>
                <li><a href="/contact" className="hover:text-[#039bdf] transition-colors">{t('footer.contact_us')}</a></li>
              </ul>
                  </div>
            
            <div>
              <h4 className="font-bold text-[#050a30] mb-4">{t('footer.support')}</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="/help" className="hover:text-[#039bdf] transition-colors">{t('footer.help_center')}</a></li>
                <li><a href="/terms" className="hover:text-[#039bdf] transition-colors">{t('footer.terms')}</a></li>
                <li><a href="/privacy" className="hover:text-[#039bdf] transition-colors">{t('footer.privacy')}</a></li>
                <li><a href="/security" className="hover:text-[#039bdf] transition-colors">{t('footer.security')}</a></li>
              </ul>
                  </div>
                </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-gray-600">
              &copy; 2025 {t('platform.name')}. {t('footer.rights_reserved')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
