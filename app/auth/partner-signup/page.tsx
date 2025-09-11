'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardContent } from '../../components/ui/Card'
import { useTranslation } from '../../components/providers/I18nProvider'
import Link from 'next/link'
import {
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Briefcase,
  FileText,
  DollarSign,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Upload
} from 'lucide-react'

interface PartnerFormData {
  // Company Information
  companyName: string
  contactName: string
  email: string
  phone: string
  website: string
  
  // Address
  address: string
  city: string
  country: string
  postalCode: string
  
  // Business Information
  industry: string
  businessType: string
  registrationNumber: string
  foundedYear: string
  employeeCount: string
  description: string
  
  // Experience & Investment Focus
  yearsExperience: string
  investmentAreas: string[]
  minimumDealSize: string
  maximumDealSize: string
  previousDeals: string
  
  // Terms
  agreeToTerms: boolean
  marketingConsent: boolean
}

interface FormErrors {
  [key: string]: string
}

const initialFormData: PartnerFormData = {
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  city: '',
  country: '',
  postalCode: '',
  industry: '',
  businessType: '',
  registrationNumber: '',
  foundedYear: '',
  employeeCount: '',
  description: '',
  yearsExperience: '',
  investmentAreas: [],
  minimumDealSize: '',
  maximumDealSize: '',
  previousDeals: '',
  agreeToTerms: false,
  marketingConsent: false
}

export default function PartnerSignUpPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [formData, setFormData] = useState<PartnerFormData>(initialFormData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const investmentAreaOptions = [
    'Technology',
    'Real Estate',
    'Healthcare',
    'Finance',
    'Energy',
    'Manufacturing',
    'Agriculture',
    'Tourism',
    'Education',
    'E-commerce',
    'Logistics',
    'Food & Beverage',
    'Other'
  ]

  const businessTypeOptions = [
    'Limited Liability Company (LLC)',
    'Corporation',
    'Partnership',
    'Sole Proprietorship',
    'Joint Venture',
    'Other'
  ]

  const employeeCountOptions = [
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '500+'
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleInvestmentAreaChange = (area: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        investmentAreas: [...prev.investmentAreas, area]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        investmentAreas: prev.investmentAreas.filter(a => a !== area)
      }))
    }
  }

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: FormErrors = {}

    if (stepNumber === 1) {
      // Company Information
      if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required'
      if (!formData.contactName.trim()) newErrors.contactName = 'Contact name is required'
      if (!formData.email.trim()) newErrors.email = 'Email is required'
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address'
      }
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    } else if (stepNumber === 2) {
      // Address Information
      if (!formData.address.trim()) newErrors.address = 'Address is required'
      if (!formData.city.trim()) newErrors.city = 'City is required'
      if (!formData.country.trim()) newErrors.country = 'Country is required'
    } else if (stepNumber === 3) {
      // Business Information
      if (!formData.industry.trim()) newErrors.industry = 'Industry is required'
      if (!formData.businessType.trim()) newErrors.businessType = 'Business type is required'
      if (!formData.description.trim()) newErrors.description = 'Company description is required'
      if (formData.description && formData.description.length < 50) {
        newErrors.description = 'Please provide a more detailed description (minimum 50 characters)'
      }
    } else if (stepNumber === 4) {
      // Investment Focus
      if (formData.investmentAreas.length === 0) {
        newErrors.investmentAreas = 'Please select at least one investment area'
      }
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to the terms and conditions'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 4))
    }
  }

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(step)) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/auth/partner-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSubmitSuccess(true)
      } else {
        const errorData = await response.json()
        setErrors({ submit: errorData.message || 'Failed to submit application' })
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="shadow-xl border-0">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Application Submitted!
              </h1>
              <p className="text-gray-600 mb-6">
                Thank you for your interest in becoming a partner. We have received your application 
                and will review it within 2-3 business days. You will receive an email confirmation shortly.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/auth/signin')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Sign In
                </Button>
                <Link
                  href="/"
                  className="block text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Return to Homepage
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Homepage
          </Link>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Already have an account?</span>
            <Link
              href="/auth/signin"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Partner Application</h1>
              <span className="text-sm text-gray-500">Step {step} of 4</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-xl border-0">
              <CardContent className="p-8">
                <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
                  
                  {/* Step 1: Company Information */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <Building2 className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                        <h2 className="text-xl font-semibold text-gray-900">Company Information</h2>
                        <p className="text-gray-600">Tell us about your company</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Name *
                          </label>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                              type="text"
                              value={formData.companyName}
                              onChange={(e) => handleInputChange('companyName', e.target.value)}
                              className="pl-12"
                              placeholder="Your Company Name"
                              error={errors.companyName}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contact Person *
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                              type="text"
                              value={formData.contactName}
                              onChange={(e) => handleInputChange('contactName', e.target.value)}
                              className="pl-12"
                              placeholder="Full Name"
                              error={errors.contactName}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              className="pl-12"
                              placeholder="company@example.com"
                              error={errors.email}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number *
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              className="pl-12"
                              placeholder="+1 (555) 123-4567"
                              error={errors.phone}
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Website
                          </label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                              type="url"
                              value={formData.website}
                              onChange={(e) => handleInputChange('website', e.target.value)}
                              className="pl-12"
                              placeholder="https://www.yourcompany.com"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Address Information */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                        <h2 className="text-xl font-semibold text-gray-900">Company Address</h2>
                        <p className="text-gray-600">Where is your company located?</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Street Address *
                          </label>
                          <Input
                            type="text"
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            placeholder="123 Business Street"
                            error={errors.address}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              City *
                            </label>
                            <Input
                              type="text"
                              value={formData.city}
                              onChange={(e) => handleInputChange('city', e.target.value)}
                              placeholder="Dubai"
                              error={errors.city}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Country *
                            </label>
                            <Input
                              type="text"
                              value={formData.country}
                              onChange={(e) => handleInputChange('country', e.target.value)}
                              placeholder="UAE"
                              error={errors.country}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Postal Code
                            </label>
                            <Input
                              type="text"
                              value={formData.postalCode}
                              onChange={(e) => handleInputChange('postalCode', e.target.value)}
                              placeholder="12345"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Business Information */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <Briefcase className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                        <h2 className="text-xl font-semibold text-gray-900">Business Details</h2>
                        <p className="text-gray-600">Tell us more about your business</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Industry *
                          </label>
                          <select
                            value={formData.industry}
                            onChange={(e) => handleInputChange('industry', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Industry</option>
                            {investmentAreaOptions.map(area => (
                              <option key={area} value={area}>{area}</option>
                            ))}
                          </select>
                          {errors.industry && (
                            <p className="mt-1 text-sm text-red-600">{errors.industry}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Type *
                          </label>
                          <select
                            value={formData.businessType}
                            onChange={(e) => handleInputChange('businessType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Business Type</option>
                            {businessTypeOptions.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                          {errors.businessType && (
                            <p className="mt-1 text-sm text-red-600">{errors.businessType}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Registration Number
                          </label>
                          <Input
                            type="text"
                            value={formData.registrationNumber}
                            onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                            placeholder="Business registration number"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Founded Year
                          </label>
                          <Input
                            type="number"
                            value={formData.foundedYear}
                            onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                            placeholder="2020"
                            min="1900"
                            max={new Date().getFullYear()}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Employee Count
                          </label>
                          <select
                            value={formData.employeeCount}
                            onChange={(e) => handleInputChange('employeeCount', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Employee Count</option>
                            {employeeCountOptions.map(count => (
                              <option key={count} value={count}>{count}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Years of Experience
                          </label>
                          <Input
                            type="number"
                            value={formData.yearsExperience}
                            onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                            placeholder="5"
                            min="0"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Description *
                          </label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe your company, its services, and what makes it unique..."
                          />
                          {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Investment Focus & Terms */}
                  {step === 4 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <DollarSign className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                        <h2 className="text-xl font-semibold text-gray-900">Investment Focus</h2>
                        <p className="text-gray-600">What types of deals are you interested in?</p>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Investment Areas of Interest *
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {investmentAreaOptions.map(area => (
                              <label key={area} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={formData.investmentAreas.includes(area)}
                                  onChange={(e) => handleInvestmentAreaChange(area, e.target.checked)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{area}</span>
                              </label>
                            ))}
                          </div>
                          {errors.investmentAreas && (
                            <p className="mt-1 text-sm text-red-600">{errors.investmentAreas}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Minimum Deal Size (USD)
                            </label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                              <Input
                                type="number"
                                value={formData.minimumDealSize}
                                onChange={(e) => handleInputChange('minimumDealSize', e.target.value)}
                                className="pl-12"
                                placeholder="10000"
                                min="0"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Maximum Deal Size (USD)
                            </label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                              <Input
                                type="number"
                                value={formData.maximumDealSize}
                                onChange={(e) => handleInputChange('maximumDealSize', e.target.value)}
                                className="pl-12"
                                placeholder="1000000"
                                min="0"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Previous Deals Completed
                            </label>
                            <Input
                              type="number"
                              value={formData.previousDeals}
                              onChange={(e) => handleInputChange('previousDeals', e.target.value)}
                              placeholder="0"
                              min="0"
                            />
                          </div>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="border-t pt-6">
                          <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                              <input
                                type="checkbox"
                                id="agreeToTerms"
                                checked={formData.agreeToTerms}
                                onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                                I agree to the{' '}
                                <Link href="/terms" className="text-blue-600 hover:text-blue-700 underline">
                                  Terms and Conditions
                                </Link>{' '}
                                and{' '}
                                <Link href="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                                  Privacy Policy
                                </Link>
                                *
                              </label>
                            </div>
                            {errors.agreeToTerms && (
                              <p className="text-sm text-red-600">{errors.agreeToTerms}</p>
                            )}

                            <div className="flex items-start space-x-3">
                              <input
                                type="checkbox"
                                id="marketingConsent"
                                checked={formData.marketingConsent}
                                onChange={(e) => handleInputChange('marketingConsent', e.target.checked)}
                                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <label htmlFor="marketingConsent" className="text-sm text-gray-700">
                                I would like to receive marketing emails and updates about new investment opportunities
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error Display */}
                  {errors.submit && (
                    <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm">{errors.submit}</span>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={step === 1}
                      className="flex items-center space-x-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </Button>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Submitting...</span>
                        </div>
                      ) : step === 4 ? (
                        'Submit Application'
                      ) : (
                        'Next Step'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
