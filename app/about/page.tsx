'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shield, BarChart3, Users, Target, CheckCircle, Award } from 'lucide-react'

export default function AboutPage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
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
    { number: '5000+', label: 'Active Investors' },
    { number: '150+', label: 'Successful Deals' },
    { number: '$50M+', label: 'Total Invested' },
    { number: '15%', label: 'Average Return' }
  ]

  const values = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Transparency',
      description: 'Complete transparency in all our operations and investment processes'
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Excellence',
      description: 'Commitment to excellence in service quality and investment opportunities'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Community',
      description: 'Building a strong community of investors and entrepreneurs'
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Innovation',
      description: 'Leveraging cutting-edge technology for better investment experiences'
    }
  ]

  const team = [
    {
      name: 'Ahmed Al-Rashid',
      role: 'CEO & Founder',
      avatar: '👨‍💼',
      description: '15+ years in investment banking and fintech'
    },
    {
      name: 'Sarah Mohammed',
      role: 'CTO',
      avatar: '👩‍💻',
      description: 'Technology leader with expertise in financial platforms'
    },
    {
      name: 'Omar Al-Zahra',
      role: 'Head of Investments',
      avatar: '👨‍💼',
      description: 'Investment expert with deep market knowledge'
    }
  ]

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
              <Link href="/deals" className="text-[#e9edf7] hover:bg-[#1a2246] px-3 py-2 rounded-lg transition-colors font-semibold">
                Deals
              </Link>
              <Link href="/about" className="text-[#6be2c9] bg-[#1a2246] px-3 py-2 rounded-lg font-semibold">
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
              About Sahem Invest
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6 bg-gradient-to-b from-[#eaf4ff] via-[#d4e7ff] to-[#a9c6ff] bg-clip-text text-transparent"
              variants={staggerItem}
            >
              Empowering Financial Growth Through Smart Investments
            </motion.h1>
            
            <motion.p 
              className="text-lg lg:text-xl text-[#cdd6ec] leading-relaxed mb-8 max-w-3xl mx-auto"
              variants={staggerItem}
            >
              We are the leading digital investment platform in Lebanon, connecting investors with profitable business opportunities and enabling everyone to participate in economic growth.
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
            <h2 className="text-3xl lg:text-4xl font-black text-[#e9edf7] mb-6">Our Mission</h2>
            <p className="text-lg text-[#b8c2d8] leading-relaxed mb-6">
              To provide a transparent and secure investment platform that enables investors to access diverse investment opportunities while ensuring the highest standards of safety and quality.
            </p>
            <div className="space-y-4">
              {[
                'Democratize access to investment opportunities',
                'Ensure transparency in all transactions',
                'Provide guaranteed returns up to 15% annually',
                'Build a trusted community of investors'
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
            <h3 className="text-2xl font-black text-[#e9edf7] mb-4">Our Vision</h3>
            <p className="text-[#b8c2d8] leading-relaxed">
              To be the leading investment platform in the region, empowering individuals to achieve financial freedom through smart and secure investments, while fostering economic growth and innovation across Lebanon.
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
          <h2 className="text-3xl lg:text-4xl font-black text-[#e9edf7] mb-4">Our Core Values</h2>
          <p className="text-[#b8c2d8] text-lg max-w-2xl mx-auto">
            The principles that guide everything we do at Sahem Invest
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

      {/* Team */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl lg:text-4xl font-black text-[#e9edf7] mb-4">Leadership Team</h2>
          <p className="text-[#b8c2d8] text-lg max-w-2xl mx-auto">
            Meet the experienced professionals driving our mission forward
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={index}
              className="p-6 bg-gradient-to-br from-[#0e1430cc] to-[#0e1430aa] border border-[#293668] rounded-2xl backdrop-blur-sm text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -5 }}
              viewport={{ once: true }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-[#101b44] to-[#2a3b79] border border-[#2a3b79] rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4">
                {member.avatar}
              </div>
              <h3 className="text-xl font-bold text-[#e9edf7] mb-2">{member.name}</h3>
              <p className="text-[#6be2c9] font-medium mb-3">{member.role}</p>
              <p className="text-[#b8c2d8] text-sm leading-relaxed">{member.description}</p>
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
            Ready to Start Investing?
          </h2>
          <p className="text-lg text-[#b8c2d8] mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of investors who trust Sahem Invest for their financial growth. Start your investment journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signin">
              <motion.button
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-b from-[#6be2c9] to-[#55e6a5] text-[#0b1020] font-bold rounded-xl shadow-lg shadow-[#6be2c9]/25 hover:transform hover:-translate-y-1 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Investing Now
              </motion.button>
            </Link>
            <Link href="/deals">
              <motion.button
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-b from-[#25304d] to-[#121833] border border-[#263057] text-[#e9edf7] font-bold rounded-xl hover:transform hover:-translate-y-1 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Explore Deals
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
