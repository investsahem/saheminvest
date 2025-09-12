'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation, useI18n } from '../components/providers/I18nProvider'
import PublicHeader from '../components/layout/PublicHeader'
import PublicFooter from '../components/layout/PublicFooter'
import { Shield, Users, Target, Award, CheckCircle } from 'lucide-react'

export default function AboutPage() {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const [liveStats, setLiveStats] = useState({
    activeInvestors: 0,
    successfulDeals: 0,
    totalInvested: 0,
    averageReturn: 12.5
  })

  const formatInvestmentAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M+`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K+`
    } else {
      return `$${amount.toFixed(0)}+`
    }
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

  const stats = [
    { number: `${liveStats.activeInvestors.toLocaleString('en-US')}+`, label: t('about.stats.active_investors') },
    { number: liveStats.successfulDeals.toString(), label: t('about.stats.successful_deals') },
    { number: formatInvestmentAmount(liveStats.totalInvested), label: t('about.stats.total_invested') },
    { number: `${liveStats.averageReturn.toFixed(1)}%`, label: t('about.stats.average_return') }
  ]

  const values = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: t('about.values.transparency.title'),
      description: t('about.values.transparency.description')
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: t('about.values.excellence.title'),
      description: t('about.values.excellence.description')
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: t('about.values.community.title'),
      description: t('about.values.community.description')
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: t('about.values.innovation.title'),
      description: t('about.values.innovation.description')
    }
  ]

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
          setLiveStats({
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

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Unified Public Header */}
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        {/* Background Elements */}
        <div className="absolute top-[-40px] right-[10%] w-56 h-56 rounded-full bg-gradient-radial from-[#54ffe3] to-transparent opacity-35 blur-[40px] pointer-events-none mix-blend-screen"></div>
        <div className="absolute bottom-[-60px] left-[5%] w-56 h-56 rounded-full bg-gradient-radial from-[#2fa4ff] to-transparent opacity-35 blur-[40px] pointer-events-none mix-blend-screen"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1d2547aa] to-[#121833aa] border border-[#2c3769] rounded-full text-sm text-[#e9edf7] mb-6"
              variants={staggerItem}
            >
              {t('about.badge')}
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6 bg-gradient-to-b from-[#eaf4ff] via-[#d4e7ff] to-[#a9c6ff] bg-clip-text text-transparent"
              variants={staggerItem}
            >
              {t('about.hero_title')}
            </motion.h1>
            
            <motion.p 
              className="text-lg lg:text-xl text-[#cdd6ec] leading-relaxed mb-8 max-w-3xl mx-auto"
              variants={staggerItem}
            >
              {t('about.hero_subtitle')}
            </motion.p>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
              variants={staggerContainer}
            >
              {stats.map((stat, index) => (
                <motion.div 
                  key={index}
                  className="p-6 bg-gradient-to-br from-[#0b1124cc] to-[#0b1124aa] border border-[#253261] rounded-2xl backdrop-blur-sm"
                  variants={staggerItem}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl lg:text-4xl font-black text-[#6be2c9] mb-2">{stat.number}</div>
                  <div className="text-[#b8c2d8] text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-black text-[#e9edf7] mb-6">{t('about.mission.title')}</h2>
            <p className="text-lg text-[#b8c2d8] leading-relaxed mb-6">
              {t('about.mission.description')}
            </p>
            <div className="space-y-4">
              {[
                t('about.mission.points.democratize'),
                t('about.mission.points.transparency'),
                t('about.mission.points.returns'),
                t('about.mission.points.community')
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <CheckCircle className="w-5 h-5 text-[#6be2c9] flex-shrink-0" />
                  <span className="text-[#b8c2d8]">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="p-8 bg-gradient-to-br from-[#0b1124cc] to-[#0b1124aa] border border-[#253261] rounded-3xl backdrop-blur-sm"
          >
            <h3 className="text-2xl font-black text-[#e9edf7] mb-4">{t('about.vision.title')}</h3>
            <p className="text-[#b8c2d8] leading-relaxed">
              {t('about.vision.description')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl lg:text-4xl font-black text-[#e9edf7] mb-4">{t('about.values.title')}</h2>
          <p className="text-[#b8c2d8] text-lg max-w-2xl mx-auto">
            {t('about.values.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <motion.div
              key={index}
              className="p-6 bg-gradient-to-br from-[#0f1636cc] to-[#0f1636aa] border border-[#2a3666] rounded-2xl backdrop-blur-sm"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -5 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 bg-gradient-to-b from-[#142455] to-[#0d183a] border border-[#2b3b73] rounded-xl flex items-center justify-center text-[#6be2c9] mb-4">
                {value.icon}
              </div>
              <h3 className="text-lg font-bold text-[#e9edf7] mb-3">{value.title}</h3>
              <p className="text-[#b8c2d8] text-sm leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </section>


      {/* CTA */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div 
          className="text-center p-12 lg:p-16 bg-gradient-to-br from-[#111a3f] to-[#0c1230] border border-[#2a3566] rounded-3xl backdrop-blur-sm"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl lg:text-4xl font-black text-[#e9edf7] mb-6">
            {t('about.cta.title')}
          </h2>
          <p className="text-lg text-[#b8c2d8] mb-8 max-w-2xl mx-auto leading-relaxed">
            {t('about.cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signin">
              <motion.button
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-b from-[#6be2c9] to-[#55e6a5] text-[#0b1020] font-bold rounded-xl shadow-lg shadow-[#6be2c9]/25 hover:transform hover:-translate-y-1 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t('about.cta.start_investing')}
              </motion.button>
            </Link>
            <Link href="/deals">
              <motion.button
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-b from-[#25304d] to-[#121833] border border-[#263057] text-[#e9edf7] font-bold rounded-xl hover:transform hover:-translate-y-1 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t('about.cta.explore_deals')}
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Unified Footer */}
      <PublicFooter />
    </div>
  )
}
