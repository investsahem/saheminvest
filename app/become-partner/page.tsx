'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { useTranslation } from '../components/providers/I18nProvider'
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform rotate-12 translate-y-32"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Become a <span className="text-blue-300">Strategic Partner</span>
              </h1>
              <p className="text-xl mb-8 text-blue-100 leading-relaxed">
                Join our exclusive network of partners and unlock new revenue streams by connecting 
                investors with premium investment opportunities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/partner-signup">
                  <Button 
                    size="lg"
                    className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-4 text-lg font-semibold"
                  >
                    Apply Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg"
                >
                  Learn More
                </Button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-blue-100">{stat.number}</div>
                      <div className="text-sm font-medium text-white">{stat.label}</div>
                      <div className="text-xs text-blue-200 mt-1">{stat.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Partner With Us?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6`}>
                      <benefit.icon className={`w-8 h-8 ${benefit.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Types Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Who Can Partner With Us?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <type.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          {type.title}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {type.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {type.examples.map((example, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-full"
                            >
                              {example}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How to Become a Partner
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
                className="relative text-center"
              >
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <step.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 -right-4 w-8 h-0.5 bg-blue-200"></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-6">
              Ready to Join Our Partner Network?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Start your journey as a strategic partner today and unlock new opportunities 
              for growth and success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/partner-signup">
                <Button 
                  size="lg"
                  className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-4 text-lg font-semibold"
                >
                  Apply for Partnership
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button 
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg"
              >
                <Phone className="mr-2 w-5 h-5" />
                Schedule a Call
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-bold mb-6">Have Questions?</h3>
              <p className="text-gray-300 mb-8 leading-relaxed">
                Our partnership team is here to help answer any questions you may have 
                about joining our network. Get in touch with us today.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">partnerships@sahaminvest.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">+971 4 123 4567</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8">
                  <h4 className="text-xl font-semibold text-white mb-6">
                    Partnership Inquiry
                  </h4>
                  <form className="space-y-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Company Name"
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Contact Name"
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <textarea
                        placeholder="Tell us about your company..."
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700 py-3"
                    >
                      Send Inquiry
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
