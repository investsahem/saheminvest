'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { useTranslation, useI18n } from '../../components/providers/I18nProvider'

const ForgotPasswordPage = () => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        setError(data.error || 'An error occurred')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 ${locale === 'ar' ? 'font-arabic' : ''}`}>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t('auth.forgot_password.check_email')}
            </h1>
            <p className="text-gray-600">
              {t('auth.forgot_password.check_email_message')}
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500 text-center">
              {t('auth.forgot_password.check_spam')}
            </p>

            <Button
              onClick={() => {
                setIsSubmitted(false)
                setEmail('')
              }}
              variant="outline"
              className="w-full py-3"
            >
              {t('auth.forgot_password.try_different_email')}
            </Button>

            <Link href="/auth/signin">
              <Button variant="outline" className="w-full py-3">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('auth.forgot_password.back_to_signin')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 ${locale === 'ar' ? 'font-arabic' : ''}`}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('auth.forgot_password.title')}
          </h1>
          <p className="text-gray-600">
            {t('auth.forgot_password.subtitle')}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.forgot_password.email_label')}
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.forgot_password.email_placeholder')}
                required
                disabled={isLoading}
                className="w-full"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !email}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('auth.forgot_password.sending')}
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  {t('auth.forgot_password.send_reset_link')}
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <Link href="/auth/signin" className="text-sm text-blue-600 hover:text-blue-500">
              <ArrowLeft className="w-4 h-4 inline mr-1" />
              {t('auth.forgot_password.back_to_signin')}
            </Link>
          </div>

          <div className="text-center text-sm text-gray-500">
            {t('auth.forgot_password.no_account')}{' '}
            <Link href="/auth/signup" className="text-blue-600 hover:text-blue-500">
              {t('auth.forgot_password.signup_here')}
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

export default ForgotPasswordPage