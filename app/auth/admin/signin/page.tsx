'use client'

import { signIn, getCsrfToken } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Card, CardHeader, CardContent } from '../../../components/ui/Card'
import { useTranslation, useI18n } from '../../../components/providers/I18nProvider'
import Link from 'next/link'

export default function AdminSignInPage() {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [csrfToken, setCsrfToken] = useState('')

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const token = await getCsrfToken()
      if (token) {
        setCsrfToken(token)
      }
    }
    fetchCsrfToken()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Check if we have CSRF token
    if (!csrfToken) {
      console.log('⏳ Waiting for CSRF token...')
      const token = await getCsrfToken()
      if (token) {
        setCsrfToken(token)
      } else {
        setError('Unable to get security token. Please refresh and try again.')
        setLoading(false)
        return
      }
    }

    try {
      console.log('🔐 Admin sign-in attempt:', { 
        email, 
        hasCsrfToken: !!csrfToken,
        csrfTokenLength: csrfToken?.length 
      })
      
      // Use direct form submission for admin
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = '/api/auth/signin/credentials'
      
      const csrfInput = document.createElement('input')
      csrfInput.type = 'hidden'
      csrfInput.name = 'csrfToken'
      csrfInput.value = csrfToken
      form.appendChild(csrfInput)
      
      const emailInput = document.createElement('input')
      emailInput.type = 'hidden'
      emailInput.name = 'email'
      emailInput.value = email
      form.appendChild(emailInput)
      
      const passwordInput = document.createElement('input')
      passwordInput.type = 'hidden'
      passwordInput.name = 'password'
      passwordInput.value = password
      form.appendChild(passwordInput)
      
      const callbackInput = document.createElement('input')
      callbackInput.type = 'hidden'
      callbackInput.name = 'callbackUrl'
      callbackInput.value = '/admin' // Direct to admin
      form.appendChild(callbackInput)
      
      console.log('📤 Submitting admin form with:', {
        action: form.action,
        method: form.method,
        csrfToken: csrfToken.substring(0, 10) + '...',
        email: email,
        callbackUrl: '/admin'
      })
      
      document.body.appendChild(form)
      form.submit()
      
    } catch (error) {
      console.error('❌ Admin sign-in error:', error)
      setError('Admin sign-in failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4 ${locale === 'ar' ? 'font-arabic' : ''}`}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            تسجيل دخول الإدارة
          </h1>
          <p className="text-gray-600">
            لوحة التحكم الإدارية - ساهم إنفست
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                البريد الإلكتروني للإدارة
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
                placeholder="admin@sahaminvest.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                كلمة المرور
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
                placeholder="أدخل كلمة المرور"
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
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
            >
              {loading ? 'جاري تسجيل الدخول...' : 'دخول الإدارة'}
            </Button>
          </form>
          
          <div className="text-center">
            <Link href="/auth/signin" className="text-sm text-blue-600 hover:text-blue-500">
              ← العودة لتسجيل الدخول العادي
            </Link>
          </div>
          
          <div className="text-center text-sm text-gray-500">
            مخصص للإداريين فقط • أمان عالي
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
