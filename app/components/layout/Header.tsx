'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/Button'
import { useTranslation } from '../providers/I18nProvider'
import { LanguageSwitcher } from '../common/LanguageSwitcher'

export function Header() {
  const { t } = useTranslation()
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleGoToPanel = () => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Redirect based on user role
    const role = session?.user?.role
    switch (role) {
      case 'ADMIN':
        router.push('/admin')
        break
      case 'DEAL_MANAGER':
        router.push('/deal-manager')
        break
      case 'FINANCIAL_OFFICER':
        router.push('/financial-officer')
        break
      case 'PORTFOLIO_ADVISOR':
        router.push('/portfolio-advisor')
        break
      case 'PARTNER':
        router.push('/partner/dashboard')
        break
      case 'INVESTOR':
      default:
        router.push('/portfolio')
        break
    }
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-[#050a30]">{t('platform.name')}</h1>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-[#050a30] hover:text-[#039bdf] transition-colors">
              {t('navigation.home')}
            </Link>
            <Link href="/deals" className="text-[#050a30] hover:text-[#039bdf] transition-colors">
              {t('navigation.deals')}
            </Link>
            {session && (
              <>
                <Link href="/portfolio" className="text-[#050a30] hover:text-[#039bdf] transition-colors">
                  {t('navigation.portfolio')}
                </Link>
                <Link href="/dashboard" className="text-[#050a30] hover:text-[#039bdf] transition-colors">
                  {t('navigation.dashboard')}
                </Link>
              </>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            
            {/* Go to Panel Button */}
            <Button 
              onClick={handleGoToPanel}
              className="bg-[#039bdf] hover:bg-[#0284c7] text-white"
            >
              {session ? t('navigation.go_to_panel') : t('navigation.signin')}
            </Button>
            
            {status === 'loading' ? (
              <div className="w-8 h-8 animate-spin rounded-full border-2 border-gray-300 border-t-[#039bdf]" />
            ) : session ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-[#050a30]">
                  مرحباً، {session.user?.name || session.user?.email}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => signOut()}
                >
                  {t('navigation.signout')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/signup">
                  <Button variant="outline" size="sm">
                    {t('navigation.signup')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t pt-4 pb-2">
          <nav className="flex flex-col space-y-2">
            <Link href="/" className="text-[#050a30] hover:text-[#039bdf] py-2">
              {t('navigation.home')}
            </Link>
            <Link href="/deals" className="text-[#050a30] hover:text-[#039bdf] py-2">
              {t('navigation.deals')}
            </Link>
            {session && (
              <>
                <Link href="/portfolio" className="text-[#050a30] hover:text-[#039bdf] py-2">
                  {t('navigation.portfolio')}
                </Link>
                <Link href="/dashboard" className="text-[#050a30] hover:text-[#039bdf] py-2">
                  {t('navigation.dashboard')}
                </Link>
              </>
            )}
            {/* Mobile Go to Panel Button */}
            <button 
              onClick={handleGoToPanel}
              className="text-[#039bdf] hover:text-[#0284c7] py-2 font-medium text-left"
            >
              {session ? t('navigation.go_to_panel') : t('navigation.signin')}
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
} 