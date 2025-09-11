'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { useTranslation } from '../components/providers/I18nProvider'
import PublicHeader from '../components/layout/PublicHeader'
import {
  Building2,
  TrendingUp,
  Users,
  DollarSign,
  Star,
  CheckCircle,
  ArrowRight,
  Shield,
  Globe,
  Briefcase,
  Target,
  Award,
  UserCheck,
  BarChart3,
  Clock,
  Phone,
  Mail
} from 'lucide-react'

const benefits = [
  {
    icon: DollarSign,
    title: 'Competitive Commissions',
    description: 'Earn attractive commissions on every successful deal you bring to our platform.',
    color: 'text-green-600'
  },
  {
    icon: TrendingUp,
    title: 'Growth Opportunities',
    description: 'Scale your business with access to high-quality investment opportunities.',
    color: 'text-blue-600'
  },
  {
    icon: Shield,
    title: 'Trust & Security',
    description: 'Partner with a regulated platform that prioritizes investor protection.',
    color: 'text-purple-600'
  },
  {
    icon: Users,
    title: 'Investor Network',
    description: 'Connect with a diverse network of qualified investors seeking opportunities.',
    color: 'text-orange-600'
  },
  {
    icon: Briefcase,
    title: 'Professional Support',
    description: 'Get dedicated support from our team throughout the deal lifecycle.',
    color: 'text-teal-600'
  },
  {
    icon: BarChart3,
    title: 'Analytics & Insights',
    description: 'Access detailed analytics and reporting tools to optimize your performance.',
    color: 'text-indigo-600'
  }
]

const stats = [
  {
    icon: Building2,
    number: '250+',
    label: 'Active Partners',
    description: 'Trusted partners worldwide'
  },
  {
    icon: DollarSign,
    number: '$50M+',
    label: 'Deals Facilitated',
    description: 'Total funding raised'
  },
  {
    icon: Target,
    number: '95%',
    label: 'Success Rate',
    description: 'Of deals reaching targets'
  },
  {
    icon: Award,
    number: '4.8/5',
    label: 'Partner Rating',
    description: 'Average satisfaction score'
  }
]

const partnerTypes = [
  {
    title: 'Investment Firms',
    description: 'Established investment companies looking to expand their deal flow',
    icon: Building2,
    examples: ['Private Equity', 'Venture Capital', 'Investment Banks']
  },
  {
    title: 'Real Estate Companies',
    description: 'Property developers and real estate investment specialists',
    icon: Globe,
    examples: ['Property Developers', 'Real Estate Funds', 'REITs']
  },
  {
    title: 'Financial Advisors',
    description: 'Independent advisors seeking quality investment opportunities',
    icon: Users,
    examples: ['Wealth Managers', 'Financial Planners', 'Investment Advisors']
  },
  {
    title: 'Business Brokers',
    description: 'Professionals facilitating business acquisitions and investments',
    icon: UserCheck,
    examples: ['M&A Advisors', 'Business Brokers', 'Corporate Finance']
  }
]

const steps = [
  {
    step: '01',
    title: 'Submit Application',
    description: 'Complete our comprehensive partner application form',
    icon: Star
  },
  {
    step: '02',
    title: 'Review Process',
    description: 'Our team reviews your application and credentials',
    icon: Clock
  },
  {
    step: '03',
    title: 'Approval & Onboarding',
    description: 'Get approved and complete partner onboarding',
    icon: CheckCircle
  },
  {
    step: '04',
    title: 'Start Earning',
    description: 'Begin bringing deals and earning commissions',
    icon: TrendingUp
  }
]

export default function BecomePartnerPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-900">
      {/* Unified Public Header */}
      <PublicHeader />

      {/* Hero Section */}
      <main className="relative overflow-hidden py-12 lg:py-20">
        {/* Gradient Orbs */}
        <div className="absolute top-[-40px] right-[10%] w-56 h-56 rounded-full bg-gradient-radial from-[#54ffe3] to-transparent opacity-35 blur-[40px] pointer-events-none mix-blend-screen"></div>
        <div className="absolute bottom-[-60px] left-[5%] w-56 h-56 rounded-full bg-gradient-radial from-[#2fa4ff] to-transparent opacity-35 blur-[40px] pointer-events-none mix-blend-screen"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
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
                🤝 Partner Program
              </motion.div>
              
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6 bg-gradient-to-b from-[#eaf4ff] via-[#d4e7ff] to-[#a9c6ff] bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Become a <span className="bg-gradient-to-b from-[#6be2c9] to-[#55e6a5] bg-clip-text text-transparent">Strategic Partner</span>
              </motion.h1>
              
              <motion.p 
                className="text-lg lg:text-xl text-[#cdd6ec] leading-relaxed mb-8 max-w-2xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                Join our exclusive network of partners and unlock new revenue streams by connecting 
                investors with premium investment opportunities.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Link href="/auth/partner-signup">
                  <motion.button
                    className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-b from-[#6be2c9] to-[#55e6a5] text-[#0b1020] font-bold rounded-xl shadow-lg shadow-[#6be2c9]/25 hover:transform hover:-translate-y-1 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                <motion.button
                  className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-b from-[#25304d] to-[#121833] border border-[#263057] text-[#e9edf7] font-bold rounded-xl hover:transform hover:-translate-y-1 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Learn More</span>
                </motion.button>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Partner Success Stats */}
              <motion.div 
                className="lg:col-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a0f2e] via-[#0f1640] to-[#1a2555] border border-[#2d3a6b]/50 shadow-2xl p-8"
                whileHover={{ scale: 1.01, y: -5 }}
                transition={{ duration: 0.4 }}
              >
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-radial from-[#6be2c9]/20 to-transparent blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                <div className="relative">
                  <motion.div 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6be2c9]/10 to-[#23a1ff]/10 border border-[#6be2c9]/30 rounded-full text-sm text-[#6be2c9] font-medium mb-6 backdrop-blur-sm"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="w-2 h-2 bg-[#6be2c9] rounded-full animate-pulse"></div>
                    Partner Network
                  </motion.div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    {stats.map((stat, index) => (
                      <motion.div 
                        key={index} 
                        className="text-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-[#6be2c9]/20 to-[#23a1ff]/20 border border-[#6be2c9]/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                          <stat.icon className="w-6 h-6 text-[#6be2c9]" />
                        </div>
                        <div className="text-2xl font-bold text-[#6be2c9] mb-1">{stat.number}</div>
                        <div className="text-sm font-medium text-[#e9edf7]">{stat.label}</div>
                        <div className="text-xs text-[#b8c2d8] mt-1">{stat.description}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-black text-[#e9edf7] mb-4">
            Why Partner With Us?
          </h2>
          <p className="text-[#b8c2d8] text-lg max-w-3xl mx-auto">
            Discover the advantages of joining our partner ecosystem and how we can help 
            you grow your business while providing value to investors.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="p-6 bg-gradient-to-br from-[#0b1124cc] to-[#0b1124aa] border border-[#253261] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,.35)] backdrop-blur-sm"
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-[#0f1640] to-[#1a2555] border border-[#2d3a6b] flex items-center justify-center mb-6`}>
                <benefit.icon className={`w-8 h-8 ${benefit.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-[#e9edf7] mb-3">
                {benefit.title}
              </h3>
              <p className="text-[#b8c2d8] leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Partner Types Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-black text-[#e9edf7] mb-4">
            Who Can Partner With Us?
          </h2>
          <p className="text-[#b8c2d8] text-lg max-w-3xl mx-auto">
            We welcome various types of financial professionals and organizations 
            to join our partner network.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {partnerTypes.map((type, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="p-8 bg-gradient-to-br from-[#0e1430cc] to-[#0e1430aa] border border-[#293668] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,.35)] backdrop-blur-sm"
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#6be2c9]/20 to-[#23a1ff]/20 border border-[#6be2c9]/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <type.icon className="w-6 h-6 text-[#6be2c9]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-[#e9edf7] mb-3">
                    {type.title}
                  </h3>
                  <p className="text-[#b8c2d8] mb-4">
                    {type.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {type.examples.map((example, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-3 py-1 text-xs bg-gradient-to-r from-[#6be2c9]/20 to-[#23a1ff]/20 border border-[#6be2c9]/30 text-[#6be2c9] rounded-full backdrop-blur-sm"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-black text-[#e9edf7] mb-4">
            How to Become a Partner
          </h2>
          <p className="text-[#b8c2d8] text-lg max-w-3xl mx-auto">
            Our straightforward partner onboarding process gets you up and running quickly.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative text-center p-6 bg-gradient-to-br from-[#0f1636cc] to-[#0f1636aa] border border-[#2a3666] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,.35)] backdrop-blur-sm"
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[#0f1640] to-[#1a2555] border border-[#2d3a6b] rounded-full flex items-center justify-center shadow-lg">
                  <step.icon className="w-8 h-8 text-[#6be2c9]" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-[#6be2c9] to-[#23a1ff] text-[#0b1020] rounded-full flex items-center justify-center text-sm font-bold">
                  {step.step}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-[#e9edf7] mb-3">
                {step.title}
              </h3>
              <p className="text-[#b8c2d8]">
                {step.description}
              </p>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 -right-4 w-8 h-0.5 bg-[#6be2c9]/30"></div>
              )}
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
            Ready to Join Our Partner Network?
          </motion.h2>
          <motion.p 
            className="text-lg text-[#b8c2d8] mb-8 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Start your journey as a strategic partner today and unlock new opportunities 
            for growth and success.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <Link href="/auth/partner-signup">
              <motion.button
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-b from-[#6be2c9] to-[#55e6a5] text-[#0b1020] font-bold rounded-xl shadow-lg shadow-[#6be2c9]/25 hover:transform hover:-translate-y-1 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Apply for Partnership
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <motion.button
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-b from-[#25304d] to-[#121833] border border-[#263057] text-[#e9edf7] font-bold rounded-xl hover:transform hover:-translate-y-1 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Phone className="w-5 h-5" />
              Schedule a Call
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-[#24315b] bg-gradient-to-b from-[#0b1124] to-[#0b1124f0]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-conic from-[#6be2c9] via-[#23a1ff] to-[#7ef1d9] p-0.5">
                  <div className="w-full h-full rounded-xl bg-[#0b1020] flex items-center justify-center">
                    <span className="text-[#6be2c9] font-bold text-lg">S</span>
                  </div>
                </div>
                <span className="text-[#e9edf7] font-black text-xl tracking-wide">Sahem Invest</span>
              </div>
              <p className="text-[#b8c2d8] mb-4 leading-relaxed">
                Join our exclusive partner network and unlock new revenue opportunities in the investment sector.
              </p>
              <div className="flex gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#1d2547aa] to-[#121833aa] border border-[#2c3769] rounded-full text-sm text-[#e9edf7]" title="Email">
                  📧
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#1d2547aa] to-[#121833aa] border border-[#2c3769] rounded-full text-sm text-[#e9edf7]" title="Phone">
                  📱
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#1d2547aa] to-[#121833aa] border border-[#2c3769] rounded-full text-sm text-[#e9edf7]" title="Website">
                  🌐
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-[#e9edf7] mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link href="/deals" className="block text-[#b8c2d8] hover:text-[#e6f0ff] transition-colors">Deals</Link>
                <Link href="/portfolio" className="block text-[#b8c2d8] hover:text-[#e6f0ff] transition-colors">Portfolio</Link>
                <Link href="/auth/partner-signup" className="block text-[#6be2c9] hover:text-[#79ffd6] transition-colors font-medium">Apply Now</Link>
                <Link href="/about" className="block text-[#b8c2d8] hover:text-[#e6f0ff] transition-colors">About Us</Link>
                <Link href="/contact" className="block text-[#b8c2d8] hover:text-[#e6f0ff] transition-colors">Contact Us</Link>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold text-[#e9edf7] mb-4">Partnership</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-[#6be2c9]" />
                  <span className="text-[#b8c2d8] text-sm">partnerships@sahaminvest.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-[#6be2c9]" />
                  <span className="text-[#b8c2d8] text-sm">+971 4 123 4567</span>
                </div>
                <Link href="/terms" className="block text-[#b8c2d8] hover:text-[#e6f0ff] transition-colors text-sm">Terms of Service</Link>
                <Link href="/privacy" className="block text-[#b8c2d8] hover:text-[#e6f0ff] transition-colors text-sm">Privacy Policy</Link>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-[#24315b] text-center">
            <p className="text-[#95a5c9]">
              © 2025 Sahem Invest. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
