'use client'

import Link from 'next/link'
import { useTranslation } from '../providers/I18nProvider'

export default function PublicFooter() {
  const { t } = useTranslation()

  return (
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
              {t('footer.description')}
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
            <h4 className="text-lg font-bold text-[#e9edf7] mb-4">{t('footer.quick_links')}</h4>
            <div className="space-y-2">
              <Link href="/deals" className="block text-[#b8c2d8] hover:text-[#e6f0ff] transition-colors">{t('footer.links.deals')}</Link>
              <Link href="/portfolio" className="block text-[#b8c2d8] hover:text-[#e6f0ff] transition-colors">{t('footer.links.portfolio')}</Link>
              <Link href="/become-partner" className="block text-[#6be2c9] hover:text-[#79ffd6] transition-colors font-medium">{t('footer.links.become_partner')}</Link>
              <Link href="/about" className="block text-[#b8c2d8] hover:text-[#e6f0ff] transition-colors">{t('footer.links.about_us')}</Link>
              <Link href="/contact" className="block text-[#b8c2d8] hover:text-[#e6f0ff] transition-colors">{t('footer.links.contact_us')}</Link>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-bold text-[#e9edf7] mb-4">{t('footer.support')}</h4>
            <div className="space-y-2">
              <Link href="/help" className="block text-[#b8c2d8] hover:text-[#e6f0ff] transition-colors">{t('footer.support_links.help_center')}</Link>
              <Link href="/terms" className="block text-[#b8c2d8] hover:text-[#e6f0ff] transition-colors">{t('footer.support_links.terms_of_service')}</Link>
              <Link href="/privacy" className="block text-[#b8c2d8] hover:text-[#e6f0ff] transition-colors">{t('footer.support_links.privacy_policy')}</Link>
              <Link href="/security" className="block text-[#b8c2d8] hover:text-[#e6f0ff] transition-colors">{t('footer.support_links.security')}</Link>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-[#24315b] text-center">
          <p className="text-[#95a5c9]">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}
