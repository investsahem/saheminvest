'use client'

import Link from 'next/link'
import { useI18n } from '../components/providers/I18nProvider'
import { Shield, Lock, Eye, Database, UserCheck, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react'

export default function PrivacyPolicy() {
  const { t, locale } = useI18n()

  const sections = [
    {
      icon: Database,
      title: t('privacy.sections.information_collection.title'),
      content: t('privacy.sections.information_collection.content'),
      items: [
        t('privacy.sections.information_collection.items.personal'),
        t('privacy.sections.information_collection.items.financial'),
        t('privacy.sections.information_collection.items.usage'),
        t('privacy.sections.information_collection.items.device')
      ]
    },
    {
      icon: Eye,
      title: t('privacy.sections.information_use.title'),
      content: t('privacy.sections.information_use.content'),
      items: [
        t('privacy.sections.information_use.items.service_provision'),
        t('privacy.sections.information_use.items.security'),
        t('privacy.sections.information_use.items.improvement'),
        t('privacy.sections.information_use.items.communication')
      ]
    },
    {
      icon: Lock,
      title: t('privacy.sections.data_protection.title'),
      content: t('privacy.sections.data_protection.content'),
      items: [
        t('privacy.sections.data_protection.items.encryption'),
        t('privacy.sections.data_protection.items.access_control'),
        t('privacy.sections.data_protection.items.monitoring'),
        t('privacy.sections.data_protection.items.backups')
      ]
    },
    {
      icon: UserCheck,
      title: t('privacy.sections.data_sharing.title'),
      content: t('privacy.sections.data_sharing.content'),
      items: [
        t('privacy.sections.data_sharing.items.partners'),
        t('privacy.sections.data_sharing.items.service_providers'),
        t('privacy.sections.data_sharing.items.legal'),
        t('privacy.sections.data_sharing.items.consent')
      ]
    },
    {
      icon: Shield,
      title: t('privacy.sections.your_rights.title'),
      content: t('privacy.sections.your_rights.content'),
      items: [
        t('privacy.sections.your_rights.items.access'),
        t('privacy.sections.your_rights.items.correction'),
        t('privacy.sections.your_rights.items.deletion'),
        t('privacy.sections.your_rights.items.portability')
      ]
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
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('privacy.title')}
            </h1>
            <p className="text-xl text-gray-300 mb-4">
              {t('privacy.description')}
            </p>
            <p className="text-sm text-gray-400">
              {t('privacy.last_updated')}: {t('privacy.update_date')}
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
              {t('privacy.introduction')}
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
                      <p className="text-gray-300 leading-relaxed mb-4">
                        {section.content}
                      </p>
                      {section.items && (
                        <ul className="space-y-2">
                          {section.items.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-[#6be2c9] flex-shrink-0 mt-1" />
                              <span className="text-gray-300">{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Cookies Policy */}
          <div className="mt-12 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Database className="w-6 h-6 text-[#039bdf]" />
              {t('privacy.cookies.title')}
            </h2>
            <p className="text-gray-300 mb-4">
              {t('privacy.cookies.description')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white font-bold mb-2">{t('privacy.cookies.essential.title')}</h3>
                <p className="text-gray-300 text-sm">{t('privacy.cookies.essential.description')}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-white font-bold mb-2">{t('privacy.cookies.analytics.title')}</h3>
                <p className="text-gray-300 text-sm">{t('privacy.cookies.analytics.description')}</p>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="mt-12 bg-gradient-to-br from-[#039bdf]/10 to-[#6be2c9]/10 backdrop-blur-sm border border-[#039bdf]/30 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-[#039bdf]" />
              {t('privacy.important.title')}
            </h2>
            <ul className="space-y-3">
              {[1, 2, 3].map((num) => (
                <li key={num} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#6be2c9] flex-shrink-0 mt-1" />
                  <span className="text-gray-300">
                    {t(`privacy.important.note_${num}`)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div className="mt-12 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t('privacy.contact.title')}
            </h2>
            <p className="text-gray-300 mb-4">
              {t('privacy.contact.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="mailto:privacy@sahaminvest.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#039bdf] to-[#6be2c9] text-white rounded-xl hover:shadow-lg hover:shadow-[#039bdf]/50 transition-all duration-300 font-medium"
              >
                {t('privacy.contact.email_us')}
              </a>
              <Link
                href="/help"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-medium"
              >
                {t('privacy.contact.visit_help_center')}
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

