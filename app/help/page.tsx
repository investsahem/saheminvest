'use client'

import Link from 'next/link'
import { useI18n } from '../components/providers/I18nProvider'
import { Search, MessageCircle, Book, FileText, HelpCircle, Mail, Phone, Clock, ChevronRight } from 'lucide-react'

export default function HelpCenter() {
  const { t, locale } = useI18n()

  const categories = [
    {
      icon: Book,
      title: t('help.categories.getting_started.title'),
      description: t('help.categories.getting_started.description'),
      articles: [
        t('help.categories.getting_started.articles.create_account'),
        t('help.categories.getting_started.articles.verify_identity'),
        t('help.categories.getting_started.articles.first_investment')
      ]
    },
    {
      icon: FileText,
      title: t('help.categories.investments.title'),
      description: t('help.categories.investments.description'),
      articles: [
        t('help.categories.investments.articles.how_to_invest'),
        t('help.categories.investments.articles.minimum_amount'),
        t('help.categories.investments.articles.returns')
      ]
    },
    {
      icon: MessageCircle,
      title: t('help.categories.account.title'),
      description: t('help.categories.account.description'),
      articles: [
        t('help.categories.account.articles.update_profile'),
        t('help.categories.account.articles.reset_password'),
        t('help.categories.account.articles.notifications')
      ]
    },
    {
      icon: HelpCircle,
      title: t('help.categories.payments.title'),
      description: t('help.categories.payments.description'),
      articles: [
        t('help.categories.payments.articles.deposit_methods'),
        t('help.categories.payments.articles.withdrawal'),
        t('help.categories.payments.articles.fees')
      ]
    }
  ]

  const contactMethods = [
    {
      icon: Mail,
      title: t('help.contact.email'),
      value: 'support@sahaminvest.com',
      action: t('help.contact.send_email')
    },
    {
      icon: Phone,
      title: t('help.contact.phone'),
      value: '+966 XX XXX XXXX',
      action: t('help.contact.call_us')
    },
    {
      icon: Clock,
      title: t('help.contact.hours'),
      value: t('help.contact.hours_value'),
      action: ''
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050a30] via-[#0a1045] to-[#050a30]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#039bdf]/10 via-transparent to-[#6be2c9]/10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('help.hero.title')}
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              {t('help.hero.description')}
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className={`absolute ${locale === 'ar' ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
                <input
                  type="text"
                  placeholder={t('help.search_placeholder')}
                  className={`w-full ${locale === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#039bdf] backdrop-blur-sm`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          {t('help.categories_title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:border-[#039bdf] transition-all duration-300 hover:shadow-lg hover:shadow-[#039bdf]/20"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#039bdf] to-[#6be2c9] flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {category.title}
                </h3>
                <p className="text-gray-300 mb-4 text-sm">
                  {category.description}
                </p>
                <ul className="space-y-2">
                  {category.articles.map((article, idx) => (
                    <li key={idx}>
                      <Link href="#" className="text-[#039bdf] hover:text-[#6be2c9] transition-colors text-sm flex items-center gap-2">
                        <ChevronRight className={`w-4 h-4 ${locale === 'ar' ? 'rotate-180' : ''}`} />
                        {article}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            {t('help.faq_title')}
          </h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((num) => (
              <div
                key={num}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:border-[#039bdf] transition-all duration-300"
              >
                <h3 className="text-lg font-bold text-white mb-2">
                  {t(`help.faq.question_${num}`)}
                </h3>
                <p className="text-gray-300">
                  {t(`help.faq.answer_${num}`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              {t('help.contact.title')}
            </h2>
            <p className="text-gray-300 text-lg">
              {t('help.contact.description')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => {
              const Icon = method.icon
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:border-[#039bdf] transition-all duration-300"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#039bdf] to-[#6be2c9] flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {method.title}
                  </h3>
                  <p className="text-[#039bdf] mb-3 font-medium">
                    {method.value}
                  </p>
                  {method.action && (
                    <button className="text-sm text-gray-300 hover:text-white transition-colors">
                      {method.action}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Back to Home Link */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#039bdf] hover:text-[#6be2c9] transition-colors font-medium"
        >
          <ChevronRight className={`w-5 h-5 ${locale === 'ar' ? '' : 'rotate-180'}`} />
          {t('common.back')} {t('navigation.home')}
        </Link>
      </div>
    </div>
  )
}

