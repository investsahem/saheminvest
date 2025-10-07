'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import PartnerLayout from '../../components/layout/PartnerLayout'
import { useTranslation } from '../../components/providers/I18nProvider'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { 
  Building2, Mail, Phone, MapPin, Globe, Users, 
  DollarSign, Target, Award, Camera, Edit, Save,
  X, Plus, Trash2, AlertCircle, CheckCircle, TrendingUp
} from 'lucide-react'

interface PartnerProfile {
  id: string
  companyName: string
  companyDescription: string
  industry: string
  foundedYear: number
  employeeCount: string
  website: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  logo: string
  investmentFocus: string[]
  minInvestment: number
  maxInvestment: number
  averageReturn: number
  successRate: number
  totalDeals: number
  totalFunding: number
  socialLinks: {
    linkedin: string
    twitter: string
    facebook: string
  }
  certifications: string[]
  teamMembers: Array<{
    id: string
    name: string
    position: string
    email: string
    image: string
  }>
}

const PartnerProfilePage = () => {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('company')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [profile, setProfile] = useState<PartnerProfile>({
    id: '',
    companyName: '',
    companyDescription: '',
    industry: '',
    foundedYear: new Date().getFullYear(),
    employeeCount: '1-10',
    website: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Lebanon',
    logo: '',
    investmentFocus: [],
    minInvestment: 1000,
    maxInvestment: 100000,
    averageReturn: 0,
    successRate: 0,
    totalDeals: 0,
    totalFunding: 0,
    socialLinks: {
      linkedin: '',
      twitter: '',
      facebook: ''
    },
    certifications: [],
    teamMembers: []
  })

  const industries = [
    'Technology', 'Real Estate', 'Healthcare', 'Energy', 'Agriculture',
    'Manufacturing', 'Finance', 'Education', 'Transportation', 'Entertainment',
    'Food & Beverage', 'Retail', 'Construction', 'Tourism', 'Other'
  ]

  const employeeCounts = ['1-10', '11-50', '51-200', '201-500', '500+']
  
  const investmentAreas = [
    'Technology Startups', 'Real Estate Development', 'Healthcare Innovation',
    'Renewable Energy', 'Agricultural Projects', 'Manufacturing',
    'Financial Services', 'E-commerce', 'Mobile Apps', 'AI & Machine Learning',
    'Blockchain', 'Green Technology', 'Food & Beverage', 'Tourism'
  ]

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) return
      
      try {
        const response = await fetch('/api/partner/profile')
        if (response.ok) {
          const data = await response.json()
          setProfile(data)
        } else {
          console.error('Failed to fetch partner profile')
        }
      } catch (error) {
        console.error('Error fetching partner profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [session])

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/partner/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: t('partner.updated_successfully') })
        setIsEditing(false)
      } else {
        setMessage({ type: 'error', text: t('partner.error_occurred') })
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('partner.error_occurred') })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof PartnerProfile] as any,
        [field]: value
      }
    }))
  }

  const addInvestmentFocus = (area: string) => {
    if (!profile.investmentFocus.includes(area)) {
      handleInputChange('investmentFocus', [...profile.investmentFocus, area])
    }
  }

  const removeInvestmentFocus = (area: string) => {
    handleInputChange('investmentFocus', profile.investmentFocus.filter(f => f !== area))
  }

  const addCertification = (cert: string) => {
    if (cert.trim() && !profile.certifications.includes(cert.trim())) {
      handleInputChange('certifications', [...profile.certifications, cert.trim()])
    }
  }

  const removeCertification = (cert: string) => {
    handleInputChange('certifications', profile.certifications.filter(c => c !== cert))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <PartnerLayout title="Partner Profile" subtitle="Manage your company profile">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PartnerLayout>
    )
  }

  return (
    <PartnerLayout 
      title={t('partner.profile')} 
      subtitle={t('partner.profile_settings_title')}
    >
      <div className="space-y-6">
        {/* Header with Edit Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('partner.profile')}</h1>
            <p className="text-gray-600 mt-1">{t('partner.profile_settings_title')}</p>
          </div>
          <div className="flex items-center gap-3">
            {message && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                {message.text}
              </div>
            )}
            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                >
                  <X className="w-4 h-4 mr-2" />
                  {t('partner.cancel')}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? t('partner.loading') : t('partner.save')}
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                {t('partner.edit')}
              </Button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'company', label: t('partner.company_name'), icon: Building2 },
              { id: 'contact', label: t('partner.contact_name'), icon: Mail },
              { id: 'investment', label: t('deals.investment_amount'), icon: DollarSign },
              { id: 'team', label: 'Team', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Company Information Tab */}
        {activeTab === 'company' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Company Logo */}
            <Card className="lg:col-span-1">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('deal_card.company_logo')}</h3>
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    {profile.logo ? (
                      <img src={profile.logo} alt="Company Logo" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Building2 className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  {isEditing && (
                    <Button variant="outline" size="sm">
                      <Camera className="w-4 h-4 mr-2" />
                      {t('partner.upload')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Company Details */}
            <Card className="lg:col-span-2">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('partner.company_name')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('partner.company_name')}
                    </label>
                    {isEditing ? (
                      <Input
                        value={profile.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        placeholder="Enter company name"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.companyName || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('partner.industry')}
                    </label>
                    {isEditing ? (
                      <select
                        value={profile.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Industry</option>
                        {industries.map(industry => (
                          <option key={industry} value={industry}>{industry}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900">{profile.industry || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('partner.Founded Year')}
                    </label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={profile.foundedYear}
                        onChange={(e) => handleInputChange('foundedYear', parseInt(e.target.value))}
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    ) : (
                      <p className="text-gray-900">{profile.foundedYear || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('partner.Employee Count')}
                    </label>
                    {isEditing ? (
                      <select
                        value={profile.employeeCount}
                        onChange={(e) => handleInputChange('employeeCount', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {employeeCounts.map(count => (
                          <option key={count} value={count}>{count}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900">{profile.employeeCount}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('deal_card.company_description')}
                  </label>
                  {isEditing ? (
                    <textarea
                      value={profile.companyDescription}
                      onChange={(e) => handleInputChange('companyDescription', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe your company..."
                    />
                  ) : (
                    <p className="text-gray-900">{profile.companyDescription || 'No description provided'}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Contact Information Tab */}
        {activeTab === 'contact' && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('partner.contact_name')}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="w-4 h-4 inline mr-1" />
                    {t('forms.email')}
                  </label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="company@example.com"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.email || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="w-4 h-4 inline mr-1" />
                    {t('forms.phone')}
                  </label>
                  {isEditing ? (
                    <Input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+961 XX XXX XXX"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.phone || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Globe className="w-4 h-4 inline mr-1" />
                    {t('partner.website')}
                  </label>
                  {isEditing ? (
                    <Input
                      type="url"
                      value={profile.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://www.company.com"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {profile.website ? (
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {profile.website}
                        </a>
                      ) : (
                        'Not specified'
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {t('partner.country')}
                  </label>
                  {isEditing ? (
                    <Input
                      value={profile.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      placeholder="Lebanon"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.country}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {t('partner.address')}
                  </label>
                  {isEditing ? (
                    <Input
                      value={profile.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Full address"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.address || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('partner.city')}
                  </label>
                  {isEditing ? (
                    <Input
                      value={profile.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Beirut"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.city || 'Not specified'}</p>
                  )}
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-3">{t('partner.Social Media')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                    {isEditing ? (
                      <Input
                        value={profile.socialLinks.linkedin}
                        onChange={(e) => handleNestedInputChange('socialLinks', 'linkedin', e.target.value)}
                        placeholder="https://linkedin.com/company/..."
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profile.socialLinks.linkedin ? (
                          <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            LinkedIn Profile
                          </a>
                        ) : (
                          t('partner.Not specified')
                        )}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                    {isEditing ? (
                      <Input
                        value={profile.socialLinks.twitter}
                        onChange={(e) => handleNestedInputChange('socialLinks', 'twitter', e.target.value)}
                        placeholder="https://twitter.com/..."
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profile.socialLinks.twitter ? (
                          <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Twitter Profile
                          </a>
                        ) : (
                          t('partner.Not specified')
                        )}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                    {isEditing ? (
                      <Input
                        value={profile.socialLinks.facebook}
                        onChange={(e) => handleNestedInputChange('socialLinks', 'facebook', e.target.value)}
                        placeholder="https://facebook.com/..."
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profile.socialLinks.facebook ? (
                          <a href={profile.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Facebook Page
                          </a>
                        ) : (
                          t('partner.Not specified')
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Investment Focus Tab */}
        {activeTab === 'investment' && (
          <div className="space-y-6">
            {/* Investment Statistics */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('partner.investment_statistics')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-900">{profile.totalDeals}</p>
                    <p className="text-sm text-blue-700">{t('deals.total_deals')}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-900">{formatCurrency(profile.totalFunding)}</p>
                    <p className="text-sm text-green-700">{t('partner.total_funding')}</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-900">{profile.successRate}%</p>
                    <p className="text-sm text-purple-700">{t('partner.success_rate')}</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-orange-900">{profile.averageReturn}%</p>
                    <p className="text-sm text-orange-700">{t('partner.avg_return')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investment Preferences */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('partner.Investment Preferences')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('partner.Minimum Investment')}
                    </label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={profile.minInvestment}
                        onChange={(e) => handleInputChange('minInvestment', parseInt(e.target.value))}
                        min="0"
                      />
                    ) : (
                      <p className="text-gray-900">{formatCurrency(profile.minInvestment)}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('partner.Maximum Investment')}
                    </label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={profile.maxInvestment}
                        onChange={(e) => handleInputChange('maxInvestment', parseInt(e.target.value))}
                        min="0"
                      />
                    ) : (
                      <p className="text-gray-900">{formatCurrency(profile.maxInvestment)}</p>
                    )}
                  </div>
                </div>

                {/* Investment Focus Areas */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t('partner.Investment Focus Areas')}
                  </label>
                  
                  {isEditing && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {investmentAreas.filter(area => !profile.investmentFocus.includes(area)).map(area => (
                          <button
                            key={area}
                            onClick={() => addInvestmentFocus(area)}
                            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                          >
                            <Plus className="w-3 h-3 inline mr-1" />
                            {area}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {profile.investmentFocus.map(area => (
                      <div
                        key={area}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {area}
                        {isEditing && (
                          <button
                            onClick={() => removeInvestmentFocus(area)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                    {profile.investmentFocus.length === 0 && (
                      <p className="text-gray-500 text-sm">No investment focus areas specified</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{t('partner.Team Members')}</h3>
                {isEditing && (
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('partner.Add Member')}
                  </Button>
                )}
              </div>

              {profile.teamMembers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.teamMembers.map(member => (
                    <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            {member.image ? (
                              <img src={member.image} alt={member.name} className="w-full h-full object-cover rounded-full" />
                            ) : (
                              <Users className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{member.name}</h4>
                            <p className="text-sm text-gray-600">{member.position}</p>
                          </div>
                        </div>
                        {isEditing && (
                          <button className="text-red-600 hover:text-red-800">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">{t('partner.No team members added yet')}</p>
                  {isEditing && (
                    <Button size="sm" className="mt-3">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Member
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PartnerLayout>
  )
}

export default PartnerProfilePage
