'use client'

import Link from 'next/link'
import { useTranslation } from '../components/providers/I18nProvider'
import { Shield, Lock, Key, Eye, Server, AlertTriangle, CheckCircle, ChevronRight, FileCheck, Users, Activity } from 'lucide-react'

export default function Security() {
  const { t, locale } = useTranslation()

  const securityFeatures = [
    {
      icon: Lock,
      title: t('security.features.encryption.title'),
      description: t('security.features.encryption.description'),
      details: [
        t('security.features.encryption.details.ssl'),
        t('security.features.encryption.details.data'),
        t('security.features.encryption.details.transmission')
      ]
    },
    {
      icon: Key,
      title: t('security.features.authentication.title'),
      description: t('security.features.authentication.description'),
      details: [
        t('security.features.authentication.details.mfa'),
        t('security.features.authentication.details.biometric'),
        t('security.features.authentication.details.session')
      ]
    },
    {
      icon: Server,
      title: t('security.features.infrastructure.title'),
      description: t('security.features.infrastructure.description'),
      details: [
        t('security.features.infrastructure.details.cloud'),
        t('security.features.infrastructure.details.backup'),
        t('security.features.infrastructure.details.redundancy')
      ]
    },
    {
      icon: Eye,
      title: t('security.features.monitoring.title'),
      description: t('security.features.monitoring.description'),
      details: [
        t('security.features.monitoring.details.realtime'),
        t('security.features.monitoring.details.alerts'),
        t('security.features.monitoring.details.logs')
      ]
    },
    {
      icon: FileCheck,
      title: t('security.features.compliance.title'),
      description: t('security.features.compliance.description'),
      details: [
        t('security.features.compliance.details.regulations'),
        t('security.features.compliance.details.audits'),
        t('security.features.compliance.details.certifications')
      ]
    },
    {
      icon: Users,
      title: t('security.features.access_control.title'),
      description: t('security.features.access_control.description'),
      details: [
        t('security.features.access_control.details.role_based'),
        t('security.features.access_control.details.least_privilege'),
        t('security.features.access_control.details.review')
      ]
    }
  ]

  const bestPractices = [
    {
      icon: Key,
      title: t('security.best_practices.strong_password.title'),
      tips: [
        t('security.best_practices.strong_password.tips.length'),
        t('security.best_practices.strong_password.tips.mix'),
        t('security.best_practices.strong_password.tips.unique'),
        t('security.best_practices.strong_password.tips.manager')
      ]
    },
    {
      icon: Shield,
      title: t('security.best_practices.enable_mfa.title'),
      tips: [
        t('security.best_practices.enable_mfa.tips.always'),
        t('security.best_practices.enable_mfa.tips.app'),
        t('security.best_practices.enable_mfa.tips.backup')
      ]
    },
    {
      icon: AlertTriangle,
      title: t('security.best_practices.phishing.title'),
      tips: [
        t('security.best_practices.phishing.tips.verify'),
        t('security.best_practices.phishing.tips.links'),
        t('security.best_practices.phishing.tips.info'),
        t('security.best_practices.phishing.tips.report')
      ]
    },
    {
      icon: Activity,
      title: t('security.best_practices.monitor.title'),
      tips: [
        t('security.best_practices.monitor.tips.regular'),
        t('security.best_practices.monitor.tips.alerts'),
        t('security.best_practices.monitor.tips.unauthorized')
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
              {t('security.title')}
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              {t('security.description')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3">
                <div className="text-[#6be2c9] text-2xl font-bold">256-bit</div>
                <div className="text-gray-300 text-sm">{t('security.stats.encryption')}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3">
                <div className="text-[#6be2c9] text-2xl font-bold">24/7</div>
                <div className="text-gray-300 text-sm">{t('security.stats.monitoring')}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3">
                <div className="text-[#6be2c9] text-2xl font-bold">99.9%</div>
                <div className="text-gray-300 text-sm">{t('security.stats.uptime')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            {t('security.features_title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:border-[#039bdf] transition-all duration-300 hover:shadow-lg hover:shadow-[#039bdf]/20"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#039bdf] to-[#6be2c9] flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 mb-4 text-sm">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-[#6be2c9] flex-shrink-0 mt-1" />
                        <span className="text-gray-300 text-sm">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4 text-center">
            {t('security.best_practices_title')}
          </h2>
          <p className="text-gray-300 text-center mb-12">
            {t('security.best_practices_description')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bestPractices.map((practice, index) => {
              const Icon = practice.icon
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:border-[#039bdf] transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#039bdf] to-[#6be2c9] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      {practice.title}
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {practice.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-[#6be2c9] flex-shrink-0 mt-1" />
                        <span className="text-gray-300 text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Report Security Issue */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-4">
                  {t('security.report.title')}
                </h2>
                <p className="text-gray-300 mb-4">
                  {t('security.report.description')}
                </p>
                <a
                  href="mailto:security@sahaminvest.com"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 font-medium"
                >
                  {t('security.report.button')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            {t('security.certifications.title')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center hover:border-[#039bdf] transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#039bdf] to-[#6be2c9] flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <p className="text-white font-medium text-sm">
                  {t(`security.certifications.cert_${num}`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t('security.contact.title')}
            </h2>
            <p className="text-gray-300 mb-6">
              {t('security.contact.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/help"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#039bdf] to-[#6be2c9] text-white rounded-xl hover:shadow-lg hover:shadow-[#039bdf]/50 transition-all duration-300 font-medium"
              >
                {t('security.contact.help_center')}
              </Link>
              <a
                href="mailto:security@sahaminvest.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-medium"
              >
                {t('security.contact.email_us')}
              </a>
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

