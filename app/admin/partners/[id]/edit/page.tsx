'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import AdminLayout from '../../../../components/layout/AdminLayout'
import { useTranslation, useI18n } from '../../../../components/providers/I18nProvider'
import { Card, CardContent } from '../../../../components/ui/Card'
import { Button } from '../../../../components/ui/Button'
import { Input } from '../../../../components/ui/Input'
import { 
  Building2, Mail, Phone, MapPin, Globe, Calendar, 
  Save, ArrowLeft, CheckCircle, AlertCircle, 
  X, Star, Award, Camera, Upload
} from 'lucide-react'

interface Partner {
  id: string
  companyName: string
  contactName: string
  email: string
  phone?: string
  address?: string
  city?: string
  country?: string
  website?: string
  industry: string
  companyDescription?: string
  status: 'active' | 'pending' | 'suspended' | 'inactive'
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  joinedAt: string
  lastActive: string
  logoUrl?: string
  stats: {
    totalDeals: number
    totalInvested: number
    successRate: number
    activeDeals: number
  }
  documents: {
    businessLicense: boolean
    taxCertificate: boolean
    bankDetails: boolean
    partnership: boolean
  }
}

const industries = [
  'Technology', 'Real Estate', 'Healthcare', 'Energy', 'Agriculture',
  'Manufacturing', 'Finance', 'Education', 'Transportation', 'Entertainment',
  'Food & Beverage', 'Retail', 'Construction', 'Tourism', 'Other'
]

const tiers = ['bronze', 'silver', 'gold', 'platinum']
const statuses = ['active', 'pending', 'suspended', 'inactive']

export default function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()
  const [partner, setPartner] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)

  useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  useEffect(() => {
    if (!resolvedParams?.id) return

    const fetchPartner = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/admin/partners/${resolvedParams.id}`, {
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          setPartner(data)
        } else if (response.status === 404) {
          setError('Partner not found')
        } else if (response.status === 401) {
          setError('Authentication required. Please sign in as an admin.')
        } else if (response.status === 403) {
          setError('Access denied. Admin privileges required.')
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          setError(errorData.error || 'Failed to fetch partner details')
        }
      } catch (error) {
        console.error('Error fetching partner:', error)
        setError('Network error. Please check your connection.')
      } finally {
        setLoading(false)
      }
    }

    fetchPartner()
  }, [resolvedParams])

  const handleInputChange = (field: string, value: any) => {
    setPartner(prev => prev ? { ...prev, [field]: value } : null)
  }

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setPartner(prev => prev ? {
      ...prev,
      [parent]: {
        ...prev[parent as keyof Partner] as any,
        [field]: value
      }
    } : null)
  }

  const handleSave = async () => {
    if (!partner || !resolvedParams?.id) return

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/partners/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          companyName: partner.companyName,
          contactName: partner.contactName,
          email: partner.email,
          phone: partner.phone,
          address: partner.address,
          city: partner.city,
          country: partner.country,
          website: partner.website,
          industry: partner.industry,
          companyDescription: partner.companyDescription,
          status: partner.status,
          tier: partner.tier,
          logoUrl: partner.logoUrl
        })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: t('partners.partner_updated_successfully') })
        // Redirect to detail page after successful update
        setTimeout(() => {
          router.push(`/admin/partners/${resolvedParams.id}`)
        }, 1500)
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || t('partners.update_error') })
      }
    } catch (error) {
      console.error('Error updating partner:', error)
      setMessage({ type: 'error', text: t('partners.update_error') })
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !partner) return

    try {
      setSaving(true)
      const formData = new FormData()
      formData.append('image', file)
      formData.append('type', 'logo')

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setPartner(prev => prev ? { ...prev, logoUrl: data.imageUrl } : null)
        setMessage({ type: 'success', text: 'Logo updated successfully!' })
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || 'Failed to upload logo' })
      }
    } catch (error) {
      console.error('Error uploading logo:', error)
      setMessage({ type: 'error', text: 'Failed to upload logo' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout
        title={t('partners.edit_partner')}
        subtitle={t('partners.edit_partner_details')}
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout
        title={t('partners.edit_partner')}
        subtitle={t('partners.edit_partner_details')}
      >
        <div className="flex justify-center items-center py-12">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Partner</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => router.push('/admin/partners')} className="w-full">
                {t('common.back')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    )
  }

  if (!partner) {
    return (
      <AdminLayout
        title={t('partners.edit_partner')}
        subtitle={t('partners.edit_partner_details')}
      >
        <div className="flex justify-center items-center py-12">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Partner Not Found</h3>
              <p className="text-gray-600 mb-4">The requested partner could not be found.</p>
              <Button onClick={() => router.push('/admin/partners')} className="w-full">
                {t('common.back')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title={`${t('partners.edit')} ${partner.companyName}`}
      subtitle={t('partners.edit_partner_details')}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/partners/${partner.id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </Button>
          
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
            
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? t('common.saving') : t('common.save')}
            </Button>
          </div>
        </div>

        {/* Company Information */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('partners.company_information')}</h3>
            
            {/* Company Logo */}
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {partner.logoUrl ? (
                    <img 
                      src={partner.logoUrl} 
                      alt={`${partner.companyName} logo`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label 
                  htmlFor="logo-upload"
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                </label>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{partner.companyName}</h4>
                <p className="text-sm text-gray-600">{partner.industry}</p>
                <p className="text-xs text-gray-500 mt-1">Click the camera icon to update logo</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('partner.company_name')} *
                </label>
                <Input
                  value={partner.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Enter company name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('partner.contact_name')} *
                </label>
                <Input
                  value={partner.contactName}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                  placeholder="Enter contact name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('forms.email')} *
                </label>
                <Input
                  type="email"
                  value={partner.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="company@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('forms.phone')}
                </label>
                <Input
                  type="tel"
                  value={partner.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+961 XX XXX XXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('partner.industry')} *
                </label>
                <select
                  value={partner.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Industry</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('partner.website')}
                </label>
                <Input
                  type="url"
                  value={partner.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://www.company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('partners.tier')}
                </label>
                <select
                  value={partner.tier}
                  onChange={(e) => handleInputChange('tier', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {tiers.map(tier => (
                    <option key={tier} value={tier}>
                      {tier.charAt(0).toUpperCase() + tier.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('partners.status')}
                </label>
                <select
                  value={partner.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('deal_card.company_description')}
              </label>
              <textarea
                value={partner.companyDescription || ''}
                onChange={(e) => handleInputChange('companyDescription', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of the company..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('partners.address_information')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('partner.address')}
                </label>
                <Input
                  value={partner.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Full address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('partner.city')}
                </label>
                <Input
                  value={partner.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Beirut"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('partner.country')}
                </label>
                <Input
                  value={partner.country || ''}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="Lebanon"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Status */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('partners.documents_status')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(partner.documents).map(([doc, completed]) => (
                <div key={doc} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h5 className="font-medium text-gray-900">
                      {doc.replace(/([A-Z])/g, ' $1').trim()}
                    </h5>
                    <p className="text-sm text-gray-600">Document verification status</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={completed}
                      onChange={(e) => handleNestedInputChange('documents', doc, e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/partners/${partner.id}`)}
            disabled={saving}
          >
            {t('common.cancel')}
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? t('common.saving') : t('common.save_changes')}
          </Button>
        </div>
      </div>
    </AdminLayout>
  )
}
