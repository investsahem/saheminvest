'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslation, useI18n } from '../providers/I18nProvider'
import { Menu, X } from 'lucide-react'

export default function PublicHeader() {
  const { t } = useTranslation()
  const { locale, setLocale } = useI18n()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Helper function to determine if a link is active
  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    if (href === '/deals') {
      return pathname === '/deals' && !pathname.includes('status=closed')
    }
    if (href === '/deals?status=closed') {
      return pathname === '/deals' && pathname.includes('status=closed')
    }
    return pathname.startsWith(href)
  }

  // Get active link styles
  const getLinkStyles = (href: string) => {
    return isActiveLink(href)
      ? 'text-[#6be2c9] bg-[#1a2246] px-3 py-2 rounded-lg font-semibold'
      : 'text-[#e9edf7] hover:bg-[#1a2246] px-3 py-2 rounded-lg transition-colors font-semibold'
  }

  const getMobileLinkStyles = (href: string) => {
    return isActiveLink(href)
      ? 'block text-[#6be2c9] bg-[#1a2246] px-3 py-2 rounded-lg font-semibold'
      : 'block text-[#e9edf7] hover:bg-[#1a2246] px-3 py-2 rounded-lg transition-colors font-semibold'
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-gradient-to-r from-[#0b1124ee] via-[#0b1124ee] to-[#0b112490] border-b border-[#233059]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
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
            <Link href="/" className={getLinkStyles('/')}>
              {t('navigation.home')}
            </Link>
            <Link href="/deals" className={getLinkStyles('/deals')}>
              {t('navigation.deals')}
            </Link>
            <Link href="/partners" className={getLinkStyles('/partners')}>
              {t('navigation.partners')}
            </Link>
            <Link href="/deals?status=closed" className={getLinkStyles('/deals?status=closed')}>
              {t('deals.closed_deals')}
            </Link>
            <Link href="/about" className={getLinkStyles('/about')}>
              {t('navigation.about')}
            </Link>
            
            {/* Language Toggle */}
            <button 
              onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
              className="ml-2 px-3 py-1 bg-gradient-to-r from-[#1d2547aa] to-[#121833aa] border border-[#2c3769] rounded-full text-sm text-[#e9edf7] hover:bg-gradient-to-r hover:from-[#2d3757] hover:to-[#1a2143] transition-all cursor-pointer"
            >
              {locale === 'ar' ? 'English' : 'عربي'}
            </button>
            
            {/* Go to Panel Button */}
            <Link href="/auth/signup" className="ml-2 px-4 py-2 bg-gradient-to-b from-[#25304d] to-[#121833] border border-[#263057] rounded-xl text-[#e9edf7] font-bold hover:transform hover:-translate-y-0.5 transition-all">
              {t('navigation.go_to_panel')}
            </Link>
          </nav>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-3">
            {/* Language Toggle */}
            <button 
              onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
              className="px-3 py-1 bg-gradient-to-r from-[#1d2547aa] to-[#121833aa] border border-[#2c3769] rounded-full text-sm text-[#e9edf7] hover:bg-gradient-to-r hover:from-[#2d3757] hover:to-[#1a2143] transition-all cursor-pointer"
            >
              {locale === 'ar' ? 'English' : 'عربي'}
            </button>
            
            {/* Go to Panel Button */}
            <Link href="/auth/signup" className="px-4 py-2 bg-gradient-to-b from-[#25304d] to-[#121833] border border-[#263057] rounded-xl text-[#e9edf7] font-bold hover:transform hover:-translate-y-0.5 transition-all text-sm">
              {t('navigation.panel')}
            </Link>
            
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#e9edf7] hover:bg-[#1a2246] rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-[#0b1124] border-b border-[#233059] shadow-xl">
              <nav className="container mx-auto px-4 py-4 space-y-2">
                <Link 
                  href="/" 
                  className={getMobileLinkStyles('/')}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('navigation.home')}
                </Link>
                <Link 
                  href="/deals" 
                  className={getMobileLinkStyles('/deals')}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('navigation.deals')}
                </Link>
                <Link 
                  href="/partners" 
                  className={getMobileLinkStyles('/partners')}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('navigation.partners')}
                </Link>
                <Link 
                  href="/deals?status=closed" 
                  className={getMobileLinkStyles('/deals?status=closed')}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('deals.closed_deals')}
                </Link>
                <Link 
                  href="/about" 
                  className={getMobileLinkStyles('/about')}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('navigation.about')}
                </Link>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
