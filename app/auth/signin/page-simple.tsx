'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardHeader, CardContent } from '../../components/ui/Card'
import { useTranslation, useI18n } from '../../components/providers/I18nProvider'
import Link from 'next/link'

export default function SignInPageSimple() {
  const { t } = useTranslation()
  const { locale } = useI18n()
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
      console.log('🔐 Simple sign-in process...', { email })
      
      // Get callback URL from query params
      const urlParams = new URLSearchParams(window.location.search)
      const callbackUrl = urlParams.get('callbackUrl')
      
      // Determine redirect URL based on email pattern (simpler approach)
      let defaultRedirectUrl = '/portfolio'
      if (email.includes('admin@')) {
        defaultRedirectUrl = '/admin'
      } else if (email.includes('partner@')) {
        defaultRedirectUrl = '/partner/dashboard'
      } else if (email.includes('dealmanager@')) {
        defaultRedirectUrl = '/deal-manager'
      } else if (email.includes('finance@')) {
        defaultRedirectUrl = '/financial-officer'
      } else if (email.includes('advisor@')) {
        defaultRedirectUrl = '/portfolio-advisor'
      }
      
      const finalRedirectUrl = callbackUrl ? decodeURIComponent(callbackUrl) : defaultRedirectUrl
      console.log('🎯 Redirecting to:', finalRedirectUrl)
      
      // Let NextAuth handle everything - simpler and more reliable
      await signIn('credentials', {
        email,
        password,
        callbackUrl: finalRedirectUrl,
      })
      
      // If we reach here, there was an error (successful login redirects automatically)
      console.log('❌ Sign-in failed - no redirect occurred')
      setError('Invalid credentials')
      
    } catch (error) {
      console.error('❌ Sign-in error:', error)
      setError('Sign-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const demoCredentials = [
    { label: 'Admin', email: 'admin@sahaminvest.com', role: 'ADMIN' },
    { label: 'Investor', email: 'investor@sahaminvest.com', role: 'INVESTOR' },
    { label: 'Partner', email: 'partner@sahaminvest.com', role: 'PARTNER' },
  ]

  const fillCredentials = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('Azerty@123123')
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 ${locale === 'ar' ? 'font-arabic' : ''}`}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('auth.signin.title')} - ساهم إنفست
          </h1>
          <p className="text-gray-600">
            منصة الاستثمار الرقمية الموثوقة
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.signin.email')}
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
                placeholder="البريد الإلكتروني"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.signin.password')}
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
                placeholder="كلمة المرور"
              />
            </div>
            
            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>
          </form>
          
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">
              حسابات تجريبية:
            </h3>
            <div className="space-y-2">
              {demoCredentials.map((demo) => (
                <button
                  key={demo.email}
                  onClick={() => fillCredentials(demo.email)}
                  className="w-full text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded border"
                >
                  <div className="font-medium">{demo.label}</div>
                  <div className="text-gray-600">{demo.email}</div>
                </button>
              ))}
              <div className="text-xs text-gray-500 text-center mt-2">
                كلمة المرور: Azerty@123123
              </div>
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-500">
            محمي بأمان مصرفي • جميع البيانات مشفرة
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
