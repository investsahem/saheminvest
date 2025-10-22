'use client'

import Link from 'next/link'
import { useTranslation } from '../components/providers/I18nProvider'
import { FileText, Shield, Scale, AlertCircle, CheckCircle, ChevronRight } from 'lucide-react'

export default function TermsOfService() {
  const { t, locale } = useTranslation()

  const sections = [
    {
      icon: FileText,
      title: t('terms.sections.acceptance.title'),
      content: t('terms.sections.acceptance.content')
    },
    {
      icon: Shield,
      title: t('terms.sections.services.title'),
      content: t('terms.sections.services.content')
    },
    {
      icon: Scale,
      title: t('terms.sections.user_responsibilities.title'),
      content: t('terms.sections.user_responsibilities.content')
    },
    {
      icon: AlertCircle,
      title: t('terms.sections.investment_risks.title'),
      content: t('terms.sections.investment_risks.content')
    },
    {
      icon: CheckCircle,
      title: t('terms.sections.fees.title'),
      content: t('terms.sections.fees.content')
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050a30] via-[#0a1045] to-[#050a30]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#039bdf]/10 via-transparent to-[#6be2c9]/10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#039bdf] to-[#6be2c9] flex items-center justify-center mx-auto mb-6">
              <Scale className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('terms.title')}
            </h1>
            <p className="text-xl text-gray-300 mb-4">
              {t('terms.description')}
            </p>
            <p className="text-sm text-gray-400">
              {t('terms.last_updated')}: {t('terms.update_date')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8 mb-8">
            <p className="text-gray-300 leading-relaxed">
              {t('terms.introduction')}
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => {
              const Icon = section.icon
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:border-[#039bdf] transition-all duration-300"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#039bdf] to-[#6be2c9] flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white mb-4">
                        {index + 1}. {section.title}
                      </h2>
                      <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                        {section.content}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Additional Important Points */}
          <div className="mt-12 bg-gradient-to-br from-[#039bdf]/10 to-[#6be2c9]/10 backdrop-blur-sm border border-[#039bdf]/30 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-[#039bdf]" />
              {t('terms.important_notes.title')}
            </h2>
            <ul className="space-y-3">
              {[1, 2, 3, 4].map((num) => (
                <li key={num} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#6be2c9] flex-shrink-0 mt-1" />
                  <span className="text-gray-300">
                    {t(`terms.important_notes.note_${num}`)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div className="mt-12 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t('terms.contact.title')}
            </h2>
            <p className="text-gray-300 mb-4">
              {t('terms.contact.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="mailto:legal@sahaminvest.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#039bdf] to-[#6be2c9] text-white rounded-xl hover:shadow-lg hover:shadow-[#039bdf]/50 transition-all duration-300 font-medium"
              >
                {t('terms.contact.email_us')}
              </a>
              <Link
                href="/help"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-medium"
              >
                {t('terms.contact.visit_help_center')}
              </Link>
            </div>
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

