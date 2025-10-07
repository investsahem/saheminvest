'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import InvestorLayout from '../../components/layout/InvestorLayout'
import { useTranslation, useI18n } from '../../components/providers/I18nProvider'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { 
  User, Mail, Phone, MapPin, Shield, Bell, 
  Globe, CreditCard, Eye, EyeOff, Save, Edit,
  AlertCircle, CheckCircle, Settings, Lock,
  Smartphone, Camera, Upload, Download,
  Trash2, RefreshCw, Key, Database, UserCheck,
  FileText, Calendar, DollarSign, Building2, Clock
} from 'lucide-react'

const ProfileSettings = () => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()
  
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences' | 'advisor'>('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [advisorApplication, setAdvisorApplication] = useState({
    hasApplication: false,
    applicationStatus: null as 'PENDING' | 'APPROVED' | 'REJECTED' | null,
    submittedAt: null as string | null,
    rejectionReason: null as string | null
  })
  const [showAdvisorForm, setShowAdvisorForm] = useState(false)
  const [advisorFormData, setAdvisorFormData] = useState({
    investmentExperience: '',
    riskTolerance: '',
    investmentGoals: '',
    monthlyIncome: '',
    initialInvestment: '',
    additionalInfo: '',
    agreeToTerms: false
  })
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // User profile data from database
  const [userProfile, setUserProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    country: '',
    profileImage: '',
    investmentExperience: '',
    riskTolerance: '',
    investmentGoals: '',
    monthlyIncome: 0,
    occupation: '',
    nationalId: '',
    preferredLanguage: 'en',
    timezone: 'UTC',
    // Additional form fields
    investorType: 'Individual',
    annualIncome: ''
  })

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: true,
    emailVerified: true,
    phoneVerified: true,
    lastPasswordChange: '2023-12-15T10:30:00Z',
    loginSessions: [
      { id: '1', device: 'MacBook Pro', location: 'Riyadh, SA', lastActive: '2024-01-20T14:30:00Z', current: true },
      { id: '2', device: 'iPhone 15', location: 'Riyadh, SA', lastActive: '2024-01-20T12:15:00Z', current: false },
      { id: '3', device: 'Chrome Browser', location: 'Dubai, AE', lastActive: '2024-01-18T09:45:00Z', current: false }
    ]
  })

  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      investmentUpdates: true,
      monthlyStatements: true,
      dealAlerts: true,
      securityAlerts: true,
      marketingEmails: false
    },
    sms: {
      criticalAlerts: true,
      payoutNotifications: true,
      loginAlerts: true
    },
    push: {
      dealUpdates: true,
      priceAlerts: false,
      newsUpdates: false
    }
  })

  const [preferences, setPreferences] = useState({
    language: locale,
    currency: 'USD',
    timezone: 'Asia/Riyadh',
    dateFormat: 'DD/MM/YYYY',
    theme: 'light',
    dashboardLayout: 'standard',
    autoLogout: 30 // minutes
  })

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) return

      try {
        setLoading(true)
        const response = await fetch('/api/investor/profile', {
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          setUserProfile(data.profile)
          setNotificationSettings(prev => ({
            ...prev,
            email: {
              ...prev.email,
              marketingEmails: data.profile.marketingEmails,
              investmentUpdates: data.profile.emailNotifications,
              monthlyStatements: data.profile.emailNotifications,
              dealAlerts: data.profile.emailNotifications,
              securityAlerts: data.profile.emailNotifications
            },
            sms: {
              ...prev.sms,
              criticalAlerts: data.profile.smsNotifications,
              payoutNotifications: data.profile.smsNotifications,
              loginAlerts: data.profile.smsNotifications
            },
            push: {
              ...prev.push,
              dealUpdates: data.profile.pushNotifications,
              priceAlerts: data.profile.pushNotifications,
              newsUpdates: data.profile.pushNotifications
            }
          }))
          setSecuritySettings(prev => ({
            ...prev,
            twoFactorEnabled: data.profile.twoFactorEnabled
          }))
          setPreferences(prev => ({
            ...prev,
            language: data.profile.preferredLanguage || locale,
            timezone: data.profile.timezone || 'UTC'
          }))
        } else {
          console.error('Failed to fetch profile')
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [session, locale])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleSaveProfile = async () => {
    if (!session?.user) return

    try {
      setSaving(true)
      const response = await fetch('/api/investor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(userProfile)
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Profile saved successfully:', data.message)
        setIsEditing(false)
        // Show success notification
        alert('Profile updated successfully!')
      } else {
        const error = await response.json()
        console.error('Failed to save profile:', error.error)
        alert('Failed to save profile: ' + error.error)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error saving profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setSaving(true)
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/investor/upload-image', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setUserProfile(prev => ({
          ...prev,
          profileImage: data.imageUrl
        }))
        alert('Profile image updated successfully!')
      } else {
        const error = await response.json()
        alert('Failed to upload image: ' + error.error)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error uploading image. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = () => {
    console.log('Password change requested')
    // Implement password change logic
  }

  const handleLogoutSession = (sessionId: string) => {
    console.log('Logging out session:', sessionId)
    // Implement session logout logic
  }

  const handleDeleteAccount = () => {
    console.log('Account deletion requested')
    // Implement account deletion logic
  }

  const handleAdvisorFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!advisorFormData.agreeToTerms) {
      alert('Please agree to the terms of service')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/advisor-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(advisorFormData)
      })

      const data = await response.json()

      if (response.ok) {
        setAdvisorApplication({
          hasApplication: true,
          applicationStatus: 'PENDING',
          submittedAt: new Date().toISOString(),
          rejectionReason: null
        })
        setShowAdvisorForm(false)
        setAdvisorFormData({
          investmentExperience: '',
          riskTolerance: '',
          investmentGoals: '',
          monthlyIncome: '',
          initialInvestment: '',
          additionalInfo: '',
          agreeToTerms: false
        })
        alert(t('portfolioAdvisor.application_submitted'))
      } else {
        alert(data.error || 'Failed to submit application')
      }
    } catch (error) {
      console.error('Error submitting application:', error)
      alert('Failed to submit application')
    } finally {
      setSubmitting(false)
    }
  }

  const handleFormChange = (field: string, value: string | boolean) => {
    setAdvisorFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const tabs = [
    { id: 'profile', name: t('portfolio_settings.tabs.profile'), icon: User },
    { id: 'security', name: t('portfolio_settings.tabs.security'), icon: Shield },
    { id: 'notifications', name: t('portfolio_settings.tabs.notifications'), icon: Bell },
    { id: 'preferences', name: t('portfolio_settings.tabs.preferences'), icon: Settings },
    { id: 'advisor', name: t('portfolio_settings.tabs.advisor'), icon: UserCheck }
  ]

  if (loading) {
    return (
      <InvestorLayout title={t('portfolio_settings.title')}>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </InvestorLayout>
    )
  }

  return (
    <InvestorLayout title={t('portfolio_settings.title')}>
      {/* Tab Navigation */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'primary' : 'outline'}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Profile Information Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">{t('portfolio_settings.profile.title')}</h3>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {isEditing ? t('portfolio_settings.profile.cancel') : t('portfolio_settings.profile.edit')}
                </Button>
              </div>

              {/* Profile Image */}
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                  {userProfile.profileImage ? (
                    <img 
                      src={userProfile.profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-white" />
                  )}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="profile-image-upload"
                    />
                    <label 
                      htmlFor="profile-image-upload"
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer"
                    >
                      <Upload className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
                      {t('portfolio_settings.profile.upload_photo')}
                    </label>
                  </div>
                )}
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('portfolio_settings.profile.first_name')}</label>
                  <input
                    type="text"
                    value={userProfile.firstName}
                    onChange={(e) => setUserProfile({...userProfile, firstName: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('portfolio_settings.profile.last_name')}</label>
                  <input
                    type="text"
                    value={userProfile.lastName}
                    onChange={(e) => setUserProfile({...userProfile, lastName: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('portfolio_settings.profile.email')}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('portfolio_settings.profile.phone')}</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={userProfile.phone}
                      onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('portfolio_settings.profile.date_of_birth')}</label>
                  <input
                    type="date"
                    value={userProfile.dateOfBirth}
                    onChange={(e) => setUserProfile({...userProfile, dateOfBirth: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('portfolio_settings.profile.address')}</label>
                  <input
                    type="text"
                    value={userProfile.address}
                    onChange={(e) => setUserProfile({...userProfile, address: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    {t('portfolio_settings.profile.cancel')}
                  </Button>
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    {saving ? (
                      <RefreshCw className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'} animate-spin`} />
                    ) : (
                      <Save className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
                    )}
                    {saving ? t('portfolio_settings.profile.saving') : t('portfolio_settings.profile.save_changes')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Investment Profile */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('portfolio_settings.profile.investment_profile')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Investor Type</label>
                  <select
                    value={userProfile.investorType}
                    onChange={(e) => setUserProfile({...userProfile, investorType: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  >
                    <option value="Individual">Individual</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Institutional">Institutional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Risk Tolerance</label>
                  <select
                    value={userProfile.riskTolerance}
                    onChange={(e) => setUserProfile({...userProfile, riskTolerance: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Investment Experience</label>
                  <select
                    value={userProfile.investmentExperience}
                    onChange={(e) => setUserProfile({...userProfile, investmentExperience: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  >
                    <option value="Less than 1 year">Less than 1 year</option>
                    <option value="1-3 years">1-3 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="More than 5 years">More than 5 years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Annual Income</label>
                  <select
                    value={userProfile.annualIncome}
                    onChange={(e) => setUserProfile({...userProfile, annualIncome: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  >
                    <option value="Less than $50,000">Less than $50,000</option>
                    <option value="$50,000 - $100,000">$50,000 - $100,000</option>
                    <option value="$100,000 - $250,000">$100,000 - $250,000</option>
                    <option value="More than $250,000">More than $250,000</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Password & Authentication */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('portfolio_settings.security.password_auth_title')}</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">{t('portfolio_settings.security.password')}</p>
                      <p className="text-sm text-gray-600">
                        {t('portfolio_settings.security.last_changed')}: {formatDate(securitySettings.lastPasswordChange)}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handlePasswordChange}>
                    {t('portfolio_settings.security.change_password')}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">{t('portfolio_settings.security.two_factor')}</p>
                      <p className="text-sm text-gray-600">
                        {securitySettings.twoFactorEnabled ? t('portfolio_settings.security.enabled') : t('portfolio_settings.security.disabled')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {securitySettings.twoFactorEnabled && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    <Button variant="outline">
                      {securitySettings.twoFactorEnabled ? t('portfolio_settings.security.disable') : t('portfolio_settings.security.enable')}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Status */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('portfolio_settings.security.verification_status')}</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">{t('portfolio_settings.security.email_verified')}</p>
                      <p className="text-sm text-gray-600">{userProfile.email}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">{t('portfolio_settings.security.phone_verified')}</p>
                      <p className="text-sm text-gray-600">{userProfile.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('portfolio_settings.security.active_sessions')}</h3>
              
              <div className="space-y-4">
                {securitySettings.loginSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {session.device}
                          {session.current && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              {t('portfolio_settings.security.current')}
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-600">
                          {session.location} • {t('portfolio_settings.security.last_active')}: {formatDateTime(session.lastActive)}
                        </p>
                      </div>
                    </div>
                    {!session.current && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleLogoutSession(session.id)}
                      >
                        {t('portfolio_settings.security.end_session')}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          {/* Email Notifications */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('portfolio_settings.notifications.email_notifications')}</h3>
              
              <div className="space-y-4">
                {Object.entries(notificationSettings.email).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {t(`portfolio_settings.notifications.${key}`) || key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {t('portfolio_settings.notifications.receive_via_email')}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          email: { ...notificationSettings.email, [key]: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SMS Notifications */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('portfolio_settings.notifications.sms_notifications')}</h3>
              
              <div className="space-y-4">
                {Object.entries(notificationSettings.sms).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {t(`portfolio_settings.notifications.${key}`) || key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {t('portfolio_settings.notifications.receive_via_sms')}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          sms: { ...notificationSettings.sms, [key]: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          {/* Language & Region */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('portfolio_settings.preferences.language_region')}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('portfolio_settings.preferences.language')}</label>
                  <select
                    value={preferences.language}
                    onChange={(e) => setPreferences({...preferences, language: e.target.value as 'en' | 'ar'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('portfolio_settings.preferences.currency')}</label>
                  <select
                    value={preferences.currency}
                    onChange={(e) => setPreferences({...preferences, currency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="SAR">SAR (ر.س)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('portfolio_settings.preferences.timezone')}</label>
                  <select
                    value={preferences.timezone}
                    onChange={(e) => setPreferences({...preferences, timezone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Asia/Riyadh">Asia/Riyadh (GMT+3)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
                    <option value="UTC">UTC (GMT+0)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('portfolio_settings.preferences.date_format')}</label>
                  <select
                    value={preferences.dateFormat}
                    onChange={(e) => setPreferences({...preferences, dateFormat: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('portfolio_settings.preferences.account_actions')}</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{t('portfolio_settings.preferences.export_data')}</p>
                      <p className="text-sm text-gray-600">{t('portfolio_settings.preferences.export_data_desc')}</p>
                    </div>
                  </div>
                  <Button variant="outline">
                    {t('portfolio_settings.preferences.export')}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium text-gray-900">{t('portfolio_settings.preferences.delete_account')}</p>
                      <p className="text-sm text-gray-600">{t('portfolio_settings.preferences.delete_account_desc')}</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleDeleteAccount}>
                    {t('portfolio_settings.preferences.delete')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Portfolio Advisor Application */}
      {activeTab === 'advisor' && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <UserCheck className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">{t('portfolioAdvisor.advisor_application')}</h3>
              </div>

              {!advisorApplication.hasApplication ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserCheck className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Apply for Portfolio Advisor Services</h4>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Get personalized investment guidance from our certified portfolio advisors. Apply now to be matched with an advisor who understands your investment goals.
                  </p>
                  <Button onClick={() => setShowAdvisorForm(true)}>
                    <UserCheck className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
                    {t('portfolioAdvisor.apply_for_advisor')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${
                    advisorApplication.applicationStatus === 'PENDING' ? 'bg-yellow-50 border border-yellow-200' :
                    advisorApplication.applicationStatus === 'APPROVED' ? 'bg-green-50 border border-green-200' :
                    'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      {advisorApplication.applicationStatus === 'PENDING' && <Clock className="w-5 h-5 text-yellow-600" />}
                      {advisorApplication.applicationStatus === 'APPROVED' && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {advisorApplication.applicationStatus === 'REJECTED' && <AlertCircle className="w-5 h-5 text-red-600" />}
                      <div>
                        <p className="font-medium">
                          {advisorApplication.applicationStatus === 'PENDING' && t('portfolioAdvisor.application_pending')}
                          {advisorApplication.applicationStatus === 'APPROVED' && 'Application Approved'}
                          {advisorApplication.applicationStatus === 'REJECTED' && 'Application Rejected'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Submitted on {advisorApplication.submittedAt && new Date(advisorApplication.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {advisorApplication.applicationStatus === 'REJECTED' && advisorApplication.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-100 rounded-md">
                        <p className="text-sm text-red-800">
                          <strong>Reason:</strong> {advisorApplication.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Application Form Modal */}
          {showAdvisorForm && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Portfolio Advisor Application</h3>
                  <Button variant="outline" onClick={() => setShowAdvisorForm(false)}>
                    Cancel
                  </Button>
                </div>

                <form className="space-y-6" onSubmit={handleAdvisorFormSubmit}>
                  {/* Investment Experience */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Investment Experience
                      </label>
                      <select 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={advisorFormData.investmentExperience}
                        onChange={(e) => handleFormChange('investmentExperience', e.target.value)}
                        required
                      >
                        <option value="">Select experience level</option>
                        <option value="beginner">Beginner (0-2 years)</option>
                        <option value="intermediate">Intermediate (2-5 years)</option>
                        <option value="advanced">Advanced (5+ years)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Risk Tolerance
                      </label>
                      <select 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={advisorFormData.riskTolerance}
                        onChange={(e) => handleFormChange('riskTolerance', e.target.value)}
                        required
                      >
                        <option value="">Select risk tolerance</option>
                        <option value="low">Conservative (Low Risk)</option>
                        <option value="medium">Moderate (Medium Risk)</option>
                        <option value="high">Aggressive (High Risk)</option>
                      </select>
                    </div>
                  </div>

                  {/* Investment Goals */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Investment Goals
                    </label>
                    <textarea 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                      placeholder="Describe your investment goals, timeline, and what you hope to achieve with professional advisory services..."
                      value={advisorFormData.investmentGoals}
                      onChange={(e) => handleFormChange('investmentGoals', e.target.value)}
                      required
                    />
                  </div>

                  {/* Financial Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Income Range
                      </label>
                      <select 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={advisorFormData.monthlyIncome}
                        onChange={(e) => handleFormChange('monthlyIncome', e.target.value)}
                      >
                        <option value="">Select income range</option>
                        <option value="0-5000">$0 - $5,000</option>
                        <option value="5000-10000">$5,000 - $10,000</option>
                        <option value="10000-25000">$10,000 - $25,000</option>
                        <option value="25000+">$25,000+</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Initial Investment Amount
                      </label>
                      <select 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={advisorFormData.initialInvestment}
                        onChange={(e) => handleFormChange('initialInvestment', e.target.value)}
                      >
                        <option value="">Select amount</option>
                        <option value="1000-5000">$1,000 - $5,000</option>
                        <option value="5000-25000">$5,000 - $25,000</option>
                        <option value="25000-100000">$25,000 - $100,000</option>
                        <option value="100000+">$100,000+</option>
                      </select>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Information
                    </label>
                    <textarea 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Any additional information you'd like to share about your investment preferences or specific needs..."
                      value={advisorFormData.additionalInfo}
                      onChange={(e) => handleFormChange('additionalInfo', e.target.value)}
                    />
                  </div>

                  {/* Terms Agreement */}
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      id="terms" 
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={advisorFormData.agreeToTerms}
                      onChange={(e) => handleFormChange('agreeToTerms', e.target.checked)}
                      required
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700">
                      I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and understand that portfolio advisory services may involve fees and that all investments carry risk.
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setShowAdvisorForm(false)} disabled={submitting}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      <FileText className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
                      {submitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Save Button (for preferences) */}
      {(activeTab === 'notifications' || activeTab === 'preferences') && (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-end">
              <Button>
                <Save className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
{t('portfolio_settings.preferences.save_changes')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </InvestorLayout>
  )
}

export default ProfileSettings