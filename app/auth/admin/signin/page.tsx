'use client'

import { signIn, getSession } from 'next-auth/react'
import { useState } from 'react'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('🔐 Admin sign-in attempt:', { email })
      
      // Use NextAuth's built-in redirect for admin
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl: '/admin', // Always redirect to admin
      })

      // This code should not execute if redirect works
      if (result?.error) {
        console.log('❌ Admin sign-in failed:', result.error)
        setError('Invalid admin credentials')
        setLoading(false)
      }
      
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
