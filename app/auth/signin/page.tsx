'use client'

import { signIn, getCsrfToken } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardHeader, CardContent } from '../../components/ui/Card'
import { useTranslation, useI18n } from '../../components/providers/I18nProvider'
import Link from 'next/link'

export default function SignInPage() {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [csrfToken, setCsrfToken] = useState('')

  useEffect(() => {
    // Get CSRF token on component mount
    const fetchCsrfToken = async () => {
      const token = await getCsrfToken()
      if (token) {
        setCsrfToken(token)
        console.log('🔒 CSRF token obtained')
      }
    }
    fetchCsrfToken()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('🔐 Sign-in attempt:', { email })
      
      // Get callback URL from the current URL
      const urlParams = new URLSearchParams(window.location.search)
      const callbackUrl = urlParams.get('callbackUrl') || '/api/auth/redirect'
      
      console.log('📍 Callback URL:', callbackUrl)
      
      // Use NextAuth signIn function
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl,
        redirect: false
      })
      
      console.log('🔄 SignIn result:', result)
      
      if (result?.error) {
        console.error('❌ Sign-in error:', result.error)
        setError('Invalid credentials. Please try again.')
        setLoading(false)
      } else if (result?.ok) {
        console.log('✅ Sign-in successful, redirecting...')
        // Redirect to the callback URL or role-based redirect
        window.location.href = callbackUrl
      } else {
        console.error('❌ Unexpected sign-in result:', result)
        setError('Sign-in failed. Please try again.')
        setLoading(false)
      }
      
    } catch (error) {
      console.error('❌ Sign-in error:', error)
      setError('Sign-in failed. Please try again.')
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      console.log('🔐 Google sign-in attempt')
      
      // Get callback URL from the current URL or default to portfolio
      const urlParams = new URLSearchParams(window.location.search)
      const callbackUrl = urlParams.get('callbackUrl') || '/portfolio'
      
      console.log('📍 Google OAuth Callback URL:', callbackUrl)
      
      const result = await signIn('google', { 
        callbackUrl,
        redirect: true // Let NextAuth handle the redirect
      })
      
      console.log('🔄 Google SignIn result:', result)
      
    } catch (error) {
      console.error('❌ Google sign-in error:', error)
      setError('Google sign-in failed. Please try again.')
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 ${locale === 'ar' ? 'font-arabic' : ''}`}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('auth.signin.title')} - {t('platform.name')}
          </h1>
          <p className="text-gray-600">
            {t('auth.signin.subtitle')}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('forms.email')}
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
                placeholder={t('forms.email_placeholder')}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('forms.password')}
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
                placeholder={t('forms.password_placeholder')}
              />
            </div>
            
            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded">
                {error}
              </div>
            )}
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            >
              {loading ? t('auth.signin.logging_in') : t('auth.signin.title')}
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{t('auth.signin.or_signin_with')}</span>
            </div>
          </div>
          
          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            className="w-full !bg-white !border-gray-300 !text-gray-900 hover:!bg-gray-50 hover:!text-gray-900 py-3 font-medium !border-2"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('auth.signin.continue_google')}
          </Button>
          
          <div className="text-center">
            <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
              {t('auth.signin.forgot_password')}
            </Link>
          </div>
          
          <div className="text-center">
            <Link href="/auth/admin/signin" className="text-xs text-gray-500 hover:text-gray-700">
              {t('auth.signin.admin_login')}
            </Link>
          </div>
          
          <div className="text-center text-sm text-gray-500">
            {t('auth.signin.security_notice')}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
