'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { signIn } from 'next-auth/react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardContent } from '../../components/ui/Card'
import { useTranslation } from '../../components/providers/I18nProvider'
import Link from 'next/link'

interface FormData {
  // Personal Information
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  nationalId: string
  
  // Address
  address: string
  city: string
  country: string
  postalCode: string
  
  // Employment & Financial
  occupation: string
  employerName: string
  monthlyIncome: string
  
  // Investment Profile  
  investmentExperience: string
  riskTolerance: string
  investmentGoals: string
  initialInvestment: string
  
  // Terms
  agreeToTerms: boolean
  marketingConsent: boolean
}

interface FormErrors {
  [key: string]: string
}

export default function SignUpPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [referenceNumber, setReferenceNumber] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationalId: '',
    address: '',
    city: '',
    country: 'Saudi Arabia',
    postalCode: '',
    occupation: '',
    employerName: '',
    monthlyIncome: '',
    investmentExperience: '',
    riskTolerance: '',
    investmentGoals: '',
    initialInvestment: '',
    agreeToTerms: false,
    marketingConsent: false
  })

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: FormErrors = {}
    
    switch (stepNumber) {
      case 1: // Personal Information
        if (!formData.firstName.trim()) newErrors.firstName = t('auth.signup.required_field')
        if (!formData.lastName.trim()) newErrors.lastName = t('auth.signup.required_field')
        if (!formData.email.trim()) newErrors.email = t('auth.signup.required_field')
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t('auth.signup.invalid_email')
        if (!formData.phone.trim()) newErrors.phone = t('auth.signup.required_field')
        if (!formData.dateOfBirth) newErrors.dateOfBirth = t('auth.signup.required_field')
        if (!formData.nationalId.trim()) newErrors.nationalId = t('auth.signup.required_field')
        break
        
      case 2: // Contact Information
        if (!formData.address.trim()) newErrors.address = t('auth.signup.required_field')
        if (!formData.city.trim()) newErrors.city = t('auth.signup.required_field')
        if (!formData.country.trim()) newErrors.country = t('auth.signup.required_field')
        break
        
      case 3: // Investment Profile
        if (!formData.occupation.trim()) newErrors.occupation = t('auth.signup.required_field')
        if (!formData.investmentExperience) newErrors.investmentExperience = t('auth.signup.required_field')
        if (!formData.riskTolerance) newErrors.riskTolerance = t('auth.signup.required_field')
        if (!formData.investmentGoals.trim()) newErrors.investmentGoals = t('auth.signup.required_field')
        break
        
      case 4: // Terms
        if (!formData.agreeToTerms) newErrors.agreeToTerms = t('auth.signup.required_field')
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setReferenceNumber(data.referenceNumber)
        setSuccess(true)
      } else {
        const error = await response.json()
        
        // Check if it's an existing user error
        if (response.status === 409 && error.message?.includes('user account')) {
          // Show modal asking if they want to sign in instead
          if (window.confirm(t('auth.signup.existing_user_redirect') || 'An account with this email already exists. Would you like to sign in instead?')) {
            router.push('/auth/signin')
            return
          }
        }
        
        setErrors({ general: error.message || 'An error occurred' })
      }
    } catch (error) {
      console.error('Network error:', error)
      setErrors({ general: 'Network error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      console.log('🔐 Google sign-up attempt')
      
      const result = await signIn('google', { 
        callbackUrl: '/portfolio',
        redirect: true // Let NextAuth handle the redirect
      })
      
      console.log('🔄 Google SignUp result:', result)
      
    } catch (error) {
      console.error('❌ Google sign-up error:', error)
      setErrors({ general: 'Google sign-up failed. Please try again.' })
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">{t('auth.signup.personal_info')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('auth.signup.first_name')}
                value={formData.firstName}
                onChange={(e) => updateFormData('firstName', e.target.value)}
                error={errors.firstName}
                required
              />
              <Input
                label={t('auth.signup.last_name')}
                value={formData.lastName}
                onChange={(e) => updateFormData('lastName', e.target.value)}
                error={errors.lastName}
                required
              />
            </div>
            
            <Input
              label={t('auth.signup.email')}
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              error={errors.email}
              required
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('auth.signup.phone')}
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
                error={errors.phone}
                required
              />
              <Input
                label={t('auth.signup.date_of_birth')}
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                error={errors.dateOfBirth}
                required
              />
            </div>
            
            <Input
              label={t('auth.signup.national_id')}
              value={formData.nationalId}
              onChange={(e) => updateFormData('nationalId', e.target.value)}
              error={errors.nationalId}
              required
            />
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">{t('auth.signup.contact_info')}</h3>
            
            <Input
              label={t('auth.signup.address')}
              value={formData.address}
              onChange={(e) => updateFormData('address', e.target.value)}
              error={errors.address}
              required
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('auth.signup.city')}
                value={formData.city}
                onChange={(e) => updateFormData('city', e.target.value)}
                error={errors.city}
                required
              />
              <Input
                label={t('auth.signup.country')}
                value={formData.country}
                onChange={(e) => updateFormData('country', e.target.value)}
                error={errors.country}
                required
              />
            </div>
            
            <Input
              label={t('auth.signup.postal_code')}
              value={formData.postalCode}
              onChange={(e) => updateFormData('postalCode', e.target.value)}
            />
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">{t('auth.signup.investment_profile')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('auth.signup.occupation')}
                value={formData.occupation}
                onChange={(e) => updateFormData('occupation', e.target.value)}
                error={errors.occupation}
                required
              />
              <Input
                label={t('auth.signup.employer_name')}
                value={formData.employerName}
                onChange={(e) => updateFormData('employerName', e.target.value)}
              />
            </div>
            
            <Input
              label={t('auth.signup.monthly_income')}
              type="number"
              value={formData.monthlyIncome}
              onChange={(e) => updateFormData('monthlyIncome', e.target.value)}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.signup.investment_experience')} *
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.investmentExperience}
                  onChange={(e) => updateFormData('investmentExperience', e.target.value)}
                >
                  <option value="">{t('common.select')}</option>
                  <option value="Beginner">{t('auth.signup.experience_beginner')}</option>
                  <option value="Intermediate">{t('auth.signup.experience_intermediate')}</option>
                  <option value="Advanced">{t('auth.signup.experience_advanced')}</option>
                </select>
                {errors.investmentExperience && <p className="text-red-500 text-sm mt-1">{errors.investmentExperience}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.signup.risk_tolerance')} *
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.riskTolerance}
                  onChange={(e) => updateFormData('riskTolerance', e.target.value)}
                >
                  <option value="">{t('common.select')}</option>
                  <option value="Low">{t('auth.signup.risk_low')}</option>
                  <option value="Medium">{t('auth.signup.risk_medium')}</option>
                  <option value="High">{t('auth.signup.risk_high')}</option>
                </select>
                {errors.riskTolerance && <p className="text-red-500 text-sm mt-1">{errors.riskTolerance}</p>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.signup.investment_goals')} *
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder={t('auth.signup.goals_placeholder')}
                value={formData.investmentGoals}
                onChange={(e) => updateFormData('investmentGoals', e.target.value)}
              />
              {errors.investmentGoals && <p className="text-red-500 text-sm mt-1">{errors.investmentGoals}</p>}
            </div>
            
            <Input
              label={t('auth.signup.initial_investment')}
              type="number"
              value={formData.initialInvestment}
              onChange={(e) => updateFormData('initialInvestment', e.target.value)}
            />
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">{t('auth.signup.terms')}</h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={(e) => updateFormData('agreeToTerms', e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="agreeToTerms" className="mr-2 block text-sm text-gray-900">
                  {t('auth.signup.agree_terms')} *
                </label>
              </div>
              {errors.agreeToTerms && <p className="text-red-500 text-sm">{errors.agreeToTerms}</p>}
              
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="marketingConsent"
                  checked={formData.marketingConsent}
                  onChange={(e) => updateFormData('marketingConsent', e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="marketingConsent" className="mr-2 block text-sm text-gray-900">
                  {t('auth.signup.marketing_consent')}
                </label>
              </div>
            </div>
          </div>
        )
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('auth.signup.success_title')}
              </h2>
              
              <p className="text-gray-600 mb-6">
                {t('auth.signup.success_message')}
              </p>
              
              {referenceNumber && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <p className="text-sm text-gray-600">
                    {t('auth.signup.success_reference')}
                  </p>
                  <p className="font-mono font-bold text-lg text-blue-600">
                    {referenceNumber}
                  </p>
                </div>
              )}
              
              <Link href="/">
                <Button className="w-full">
                  {t('auth.signup.back_home')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t('auth.signup.title')} - {t('platform.name')}
          </h2>
          <p className="text-gray-600">
            {t('auth.signup.subtitle')}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  stepNumber <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`flex-1 h-2 mx-2 rounded ${
                    stepNumber < step ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                {errors.general}
              </div>
            )}

            {/* Google Sign Up Option - Only show on first step */}
            {step === 1 && (
              <div className="mb-8">
                <Button
                  onClick={handleGoogleSignUp}
                  variant="outline"
                  className="w-full !bg-white !border-gray-300 !text-gray-900 hover:!bg-gray-50 hover:!text-gray-900 py-3 mb-4 font-medium !border-2"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {t('auth.signup.continue_google') || 'Continue with Google'}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">{t('auth.signup.or_signup_with_form') || 'Or sign up with form'}</span>
                  </div>
                </div>
              </div>
            )}
            
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>

            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep(step - 1)}
                >
                  {t('common.back')}
                </Button>
              ) : (
                <div />
              )}
              
              {step < 4 ? (
                <Button 
                  type="button" 
                  onClick={handleNext}
                >
                  {t('common.next')}
                </Button>
              ) : (
                <Button 
                  type="button" 
                  onClick={handleSubmit}
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? t('auth.signup.submitting') : t('auth.signup.submit_application')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Sign In Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            {t('auth.signup.have_account')} 
            <Link href="/auth/signin" className="text-blue-600 hover:text-blue-500 font-medium ml-1">
              {t('navigation.signin')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 