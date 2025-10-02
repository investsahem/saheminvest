'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useTranslation, useI18n } from '../providers/I18nProvider'
import { Menu, X, User, Settings, LogOut, ChevronDown } from 'lucide-react'

export default function PublicHeader() {
  const { t } = useTranslation()
  const { locale, setLocale } = useI18n()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [lastActivity, setLastActivity] = useState(Date.now())
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()

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

  // Auto-logout after 30 minutes of inactivity
  useEffect(() => {
    if (!session) return

    const updateActivity = () => {
      setLastActivity(Date.now())
    }

    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true)
    })

    // Check for inactivity every minute
    const inactivityTimer = setInterval(() => {
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivity
      const thirtyMinutes = 30 * 60 * 1000 // 30 minutes in milliseconds

      if (timeSinceLastActivity >= thirtyMinutes) {
        signOut({ callbackUrl: '/' })
      }
    }, 60000) // Check every minute

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true)
      })
      clearInterval(inactivityTimer)
    }
  }, [session, lastActivity])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserMenuOpen])

  // Handle logout
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  // Get user dashboard URL based on role
  const getDashboardUrl = () => {
    if (!session?.user) return '/portfolio'
    
    switch (session.user.role) {
      case 'ADMIN':
        return '/admin'
      case 'PARTNER':
        return '/partner'
      case 'DEAL_MANAGER':
        return '/deal-manager'
      case 'FINANCIAL_OFFICER':
        return '/financial-officer'
      default:
        return '/portfolio'
    }
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
            
            {/* User Menu or Auth Buttons */}
            {session ? (
              <div className="relative ml-2 user-menu-container">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 bg-gradient-to-b from-[#25304d] to-[#121833] border border-[#263057] rounded-xl text-[#e9edf7] font-medium hover:transform hover:-translate-y-0.5 transition-all"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-[#6be2c9] to-[#23a1ff] rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-[#0b1020]" />
                  </div>
                  <span className="hidden lg:block">{session.user.name?.split(' ')[0] || 'User'}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#0b1124] border border-[#253261] rounded-xl shadow-2xl backdrop-blur-sm z-50">
                    <div className="p-3 border-b border-[#253261]">
                      <p className="text-[#e9edf7] font-medium">{session.user.name}</p>
                      <p className="text-[#b8c2d8] text-sm">{session.user.email}</p>
                    </div>
                    <div className="py-2">
                      <Link
                        href={getDashboardUrl()}
                        className="flex items-center gap-3 px-3 py-2 text-[#e9edf7] hover:bg-[#1a2246] transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        {t('navigation.dashboard')}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2 text-[#ff6b6b] hover:bg-[#1a2246] transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('navigation.logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link href="/auth/signin" className="px-4 py-2 text-[#e9edf7] font-medium hover:bg-[#1a2246] rounded-xl transition-colors">
                  {t('navigation.signin')}
                </Link>
                <Link href="/auth/signup" className="px-4 py-2 bg-gradient-to-b from-[#25304d] to-[#121833] border border-[#263057] rounded-xl text-[#e9edf7] font-bold hover:transform hover:-translate-y-0.5 transition-all">
                  {t('navigation.go_to_panel')}
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            {/* Language Toggle */}
            <button 
              onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
              className="px-2 py-1 bg-gradient-to-r from-[#1d2547aa] to-[#121833aa] border border-[#2c3769] rounded-full text-xs text-[#e9edf7] hover:bg-gradient-to-r hover:from-[#2d3757] hover:to-[#1a2143] transition-all cursor-pointer"
            >
              {locale === 'ar' ? 'EN' : 'AR'}
            </button>
            
            {/* User Avatar or Menu Toggle */}
            {session ? (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center gap-1 px-2 py-1.5 bg-gradient-to-b from-[#25304d] to-[#121833] border border-[#263057] rounded-lg text-[#e9edf7] font-medium"
              >
                <div className="w-6 h-6 bg-gradient-to-br from-[#6be2c9] to-[#23a1ff] rounded-full flex items-center justify-center">
                  <User className="w-3 h-3 text-[#0b1020]" />
                </div>
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            ) : (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-b from-[#25304d] to-[#121833] border border-[#263057] rounded-lg text-[#e9edf7] font-medium"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                <span className="text-sm">{t('navigation.menu')}</span>
              </button>
            )}
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

                {/* Mobile Auth Buttons for non-authenticated users */}
                {!session && (
                  <div className="border-t border-[#233059] pt-4 mt-4 space-y-3">
                    <Link 
                      href="/auth/signin" 
                      className="block text-center py-3 text-[#e9edf7] hover:bg-[#1a2246] rounded-lg transition-colors font-medium border border-[#233059]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('navigation.signin')}
                    </Link>
                    <Link 
                      href="/auth/signup" 
                      className="block py-3 bg-gradient-to-r from-[#6be2c9] to-[#23a1ff] text-[#0b1020] font-bold rounded-xl transition-all text-center shadow-lg shadow-[#6be2c9]/25"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('navigation.create_account')}
                    </Link>
                  </div>
                )}

                {/* Mobile User Menu */}
                {session && (
                  <div className="border-t border-[#233059] pt-4 mt-4">
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#6be2c9] to-[#23a1ff] rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-[#0b1020]" />
                      </div>
                      <div>
                        <p className="text-[#e9edf7] font-medium text-sm">{session.user.name}</p>
                        <p className="text-[#b8c2d8] text-xs">{session.user.email}</p>
                      </div>
                    </div>
                    <Link 
                      href={getDashboardUrl()}
                      className="flex items-center gap-3 px-3 py-2 text-[#e9edf7] hover:bg-[#1a2246] rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      {t('navigation.dashboard')}
                    </Link>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        handleLogout()
                      }}
                      className="flex items-center gap-3 px-3 py-2 text-[#ff6b6b] hover:bg-[#1a2246] rounded-lg transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('navigation.logout')}
                    </button>
                  </div>
                )}
              </nav>
            </div>
          )}

          {/* Desktop User Menu Overlay */}
          {session && isUserMenuOpen && (
            <div className="hidden md:block absolute right-4 top-full mt-2 w-48 bg-[#0b1124] border border-[#253261] rounded-xl shadow-2xl backdrop-blur-sm z-50 user-menu-container">
              <div className="p-3 border-b border-[#253261]">
                <p className="text-[#e9edf7] font-medium">{session.user.name}</p>
                <p className="text-[#b8c2d8] text-sm">{session.user.email}</p>
              </div>
              <div className="py-2">
                <Link
                  href={getDashboardUrl()}
                  className="flex items-center gap-3 px-3 py-2 text-[#e9edf7] hover:bg-[#1a2246] transition-colors"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  {t('navigation.dashboard')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2 text-[#ff6b6b] hover:bg-[#1a2246] transition-colors w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  {t('navigation.logout')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
