'use client'

import { signIn, getSession } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardHeader, CardContent } from '../../components/ui/Card'
import { useTranslation, useI18n } from '../../components/providers/I18nProvider'
import Link from 'next/link'

type UserType = 'investor' | 'admin'

export default function SignInPage() {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const [userType, setUserType] = useState<UserType>('investor')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(t('auth.signin.invalid_credentials'))
      } else {
        // Get callback URL from query params if it exists
        const urlParams = new URLSearchParams(window.location.search)
        const callbackUrl = urlParams.get('callbackUrl')
        
        // If there's a specific callback URL, decode it and use it
        if (callbackUrl) {
          const decodedUrl = decodeURIComponent(callbackUrl)
          console.log('Redirecting to callback URL:', decodedUrl)
          
          // Use window.location for more reliable mobile redirect
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              window.location.href = decodedUrl
            } else {
              router.replace(decodedUrl)
            }
          }, 300) // Increased delay for mobile
          return
        }
        
        // Get the session to determine the user role and redirect accordingly
        // Retry getting session if not available immediately
        let session = await getSession()
        let retries = 0
        
        while (!session?.user?.role && retries < 3) {
          await new Promise(resolve => setTimeout(resolve, 200))
          session = await getSession()
          retries++
        }
        
        const role = session?.user?.role
        
        // Add a delay before redirect to ensure session is fully updated
        setTimeout(() => {
          let redirectUrl = '/portfolio' // default
          
          // Determine redirect URL based on user role
          switch (role) {
            case 'ADMIN':
              redirectUrl = '/admin'
              break
            case 'DEAL_MANAGER':
              redirectUrl = '/deal-manager'
              break
            case 'FINANCIAL_OFFICER':
              redirectUrl = '/financial-officer'
              break
            case 'PORTFOLIO_ADVISOR':
              redirectUrl = '/portfolio-advisor'
              break
            case 'PARTNER':
              redirectUrl = '/partner/dashboard'
              break
            case 'INVESTOR':
            default:
              redirectUrl = '/portfolio'
              break
          }
          
          console.log('Redirecting to role-based URL:', redirectUrl)
          
          // Use window.location for more reliable mobile redirect
          if (typeof window !== 'undefined') {
            window.location.href = redirectUrl
          } else {
            router.replace(redirectUrl)
          }
        }, 300) // Increased delay for mobile
      }
    } catch (error) {
      console.error('Error during sign in:', error)
      setError(t('auth.signin.error_try_again'))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/portfolio' })
  }

  const getDemoAccounts = () => {
    if (userType === 'admin') {
      return [
        { label: t('auth.signin.demo_roles.admin'), email: 'admin@sahaminvest.com', role: 'Admin' },
        { label: t('auth.signin.demo_roles.deal_manager'), email: 'dealmanager@sahaminvest.com', role: 'Deal Manager' },
        { label: t('auth.signin.demo_roles.financial_officer'), email: 'finance@sahaminvest.com', role: 'Financial Officer' },
        { label: t('auth.signin.demo_roles.portfolio_advisor'), email: 'advisor@sahaminvest.com', role: 'Portfolio Advisor' },
      ]
    } else {
      return [
        { label: t('auth.signin.demo_roles.investor'), email: 'investor@sahaminvest.com', role: 'Investor' },
        { label: t('auth.signin.demo_roles.partner'), email: 'partner@sahaminvest.com', role: 'Partner' },
      ]
    }
  }

  const fillDemoAccount = (email: string) => {
    setEmail(email)
    setPassword('Azerty@123123')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t('auth.signin.title')} - {t('platform.name')}
          </h2>
          <p className="text-gray-600">
            {t('auth.signin.subtitle')}
          </p>
        </div>

        {/* User Type Selector */}
        <div className="bg-white rounded-lg p-1 flex">
          <button
            type="button"
            onClick={() => setUserType('investor')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              userType === 'investor'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            {t('auth.signin.investor_partner')}
          </button>
          <button
            type="button"
            onClick={() => setUserType('admin')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              userType === 'admin'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            {t('auth.signin.management_employee')}
          </button>
        </div>
        
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900 text-center">
              {userType === 'admin' ? t('auth.signin.admin_login') : t('auth.signin.investor_login')}
            </h3>
            <p className="text-sm text-gray-600 text-center">
              {userType === 'admin' 
                ? t('auth.signin.admin_only')
                : t('auth.signin.investor_only')
              }
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-center">
                  {error}
                </div>
              )}
              
              <Input
                label={t('forms.email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={t('forms.email_placeholder')}
              />
              
              <Input
                label={t('forms.password')}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={t('forms.password_placeholder')}
              />
              
              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={loading}
              >
                {loading ? t('auth.signin.logging_in') : t('auth.signin.title')}
              </Button>
            </form>

            {/* Forgot Password Link */}
            <div className="mt-4 text-center">
              <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                Forgot your password?
              </Link>
            </div>
            
            {/* Google Sign In - Only for investors */}
            {userType === 'investor' && (
              <>
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">{t('auth.signin.or_signin_with')}</span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleSignIn}
                    >
                      <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      {t('auth.signin.continue_google')}
                    </Button>
                  </div>
                </div>
              </>
            )}
            
            {/* Demo Accounts */}
            <div className="mt-6">
              <p className="text-sm text-gray-600 text-center mb-3">
                {t('auth.signin.demo_accounts')}
              </p>
              <div className="space-y-2">
                {getDemoAccounts().map((account, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="text-xs">
                      <div className="font-medium text-gray-900">{account.label}</div>
                      <div className="text-gray-600">{account.email}</div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fillDemoAccount(account.email)}
                      className="text-xs"
                    >
                      {t('auth.signin.use')}
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                {t('auth.signin.password_label')} Azerty@123123
              </p>
            </div>

            {/* Role Explanations */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                {userType === 'admin' ? t('auth.signin.role_explanations.admin_title') : t('auth.signin.role_explanations.investor_title')}
              </h4>
              <div className="text-xs text-blue-800 space-y-1">
                {userType === 'admin' ? (
                  <>
                    <div>• {t('auth.signin.role_explanations.admin_roles.admin')}</div>
                    <div>• {t('auth.signin.role_explanations.admin_roles.deal_manager')}</div>
                    <div>• {t('auth.signin.role_explanations.admin_roles.financial_officer')}</div>
                    <div>• {t('auth.signin.role_explanations.admin_roles.portfolio_advisor')}</div>
                  </>
                ) : (
                  <>
                    <div>• {t('auth.signin.role_explanations.investor_roles.investor')}</div>
                    <div>• {t('auth.signin.role_explanations.investor_roles.partner')}</div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center text-xs text-gray-500">
          <p>{t('auth.signin.security_notice')}</p>
        </div>

        {/* Signup Link */}
        <div className="text-center text-sm">
          <p className="text-gray-600">
            {locale === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
            <Link href="/auth/signup" className="text-blue-600 hover:text-blue-500 font-medium">
              {locale === 'ar' ? 'سجل الآن' : 'Sign up now'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 