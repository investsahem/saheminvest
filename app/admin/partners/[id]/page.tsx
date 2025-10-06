'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import AdminLayout from '../../../components/layout/AdminLayout'
import { useTranslation, useI18n } from '../../../components/providers/I18nProvider'
import { Card, CardContent } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { 
  Building2, Mail, Phone, MapPin, Globe, Calendar, 
  Edit, ArrowLeft, CheckCircle, Clock, AlertCircle, 
  X, Star, Award, DollarSign, Target, TrendingUp,
  Users, FileText, Shield, Eye
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

export default function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()
  const [partner, setPartner] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

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

  const handleStatusChange = async (newStatus: string) => {
    if (!partner || !resolvedParams?.id) return
    
    if (!confirm(t('partners.confirm_status_change').replace('{status}', newStatus))) {
      return
    }

    try {
      setActionLoading(true)
      const response = await fetch(`/api/admin/partners/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        setPartner(prev => prev ? { ...prev, status: newStatus as any } : null)
        alert(t('partners.partner_updated').replace('{status}', newStatus.toLowerCase()))
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating partner status:', error)
      alert(t('partners.update_error'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!partner || !resolvedParams?.id) return
    
    if (!confirm(t('partners.delete_confirmation'))) {
      return
    }

    try {
      setActionLoading(true)
      const response = await fetch(`/api/admin/partners/${resolvedParams.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (response.ok) {
        alert(t('partners.partner_deleted'))
        router.push('/admin/partners')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting partner:', error)
      alert(t('partners.delete_error'))
    } finally {
      setActionLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(dateString))
  }

  const getStatusBadge = (status: Partner['status']) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'suspended':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'inactive':
        return `${baseClasses} bg-gray-100 text-gray-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getTierBadge = (tier: Partner['tier']) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
    switch (tier) {
      case 'platinum':
        return `${baseClasses} bg-purple-100 text-purple-800`
      case 'gold':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'silver':
        return `${baseClasses} bg-gray-100 text-gray-800`
      case 'bronze':
        return `${baseClasses} bg-orange-100 text-orange-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  if (loading) {
    return (
      <AdminLayout
        title={t('partners.partner_details')}
        subtitle={t('partners.view_partner_information')}
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
        title={t('partners.partner_details')}
        subtitle={t('partners.view_partner_information')}
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
        title={t('partners.partner_details')}
        subtitle={t('partners.view_partner_information')}
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
      title={partner.companyName}
      subtitle={t('partners.partner_details')}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/partners')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </Button>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/partners/${partner.id}/edit`)}
              disabled={actionLoading}
            >
              <Edit className="w-4 h-4 mr-2" />
              {t('common.edit')}
            </Button>
            
            {partner.status === 'pending' && (
              <Button
                onClick={() => handleStatusChange('active')}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {t('partners.approve')}
              </Button>
            )}
            
            {partner.status === 'active' && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange('suspended')}
                disabled={actionLoading}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-2" />
                {t('common.suspend')}
              </Button>
            )}
          </div>
        </div>

        {/* Partner Overview */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                {partner.logoUrl ? (
                  <img 
                    src={partner.logoUrl} 
                    alt={`${partner.companyName} logo`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Building2 className="w-12 h-12 text-gray-400" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{partner.companyName}</h1>
                    <p className="text-gray-600 mb-2">{partner.contactName}</p>
                    <p className="text-sm text-gray-500">{partner.industry}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={getTierBadge(partner.tier)}>
                      <Award className="w-4 h-4 mr-1" />
                      {partner.tier.charAt(0).toUpperCase() + partner.tier.slice(1)}
                    </span>
                    <span className={getStatusBadge(partner.status)}>
                      {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                {partner.companyDescription && (
                  <p className="text-gray-700 mb-4">{partner.companyDescription}</p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Target className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-blue-900">{partner.stats.totalDeals}</div>
                    <div className="text-xs text-blue-700">{t('partners.total_deals')}</div>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-green-900">{formatCurrency(partner.stats.totalInvested)}</div>
                    <div className="text-xs text-green-700">{t('partners.total_invested')}</div>
                  </div>
                  
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-purple-900">{partner.stats.successRate}%</div>
                    <div className="text-xs text-purple-700">{t('partners.success_rate')}</div>
                  </div>
                  
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <Eye className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-orange-900">{partner.stats.activeDeals}</div>
                    <div className="text-xs text-orange-700">{t('common.active_deals')}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('partners.contact_information')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">{t('forms.email')}</p>
                    <p className="text-gray-900">{partner.email}</p>
                  </div>
                </div>
                
                {partner.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">{t('forms.phone')}</p>
                      <p className="text-gray-900">{partner.phone}</p>
                    </div>
                  </div>
                )}
                
                {partner.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">{t('partner.website')}</p>
                      <a 
                        href={partner.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline"
                      >
                        {partner.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                {partner.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">{t('partner.address')}</p>
                      <p className="text-gray-900">
                        {partner.address}
                        {partner.city && `, ${partner.city}`}
                        {partner.country && `, ${partner.country}`}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">{t('partners.joined')}</p>
                    <p className="text-gray-900">{formatDate(partner.joinedAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">{t('partners.last_active')}</p>
                    <p className="text-gray-900">{formatDate(partner.lastActive)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Status */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('partners.documents_status')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(partner.documents).map(([doc, completed]) => (
                <div
                  key={doc}
                  className={`p-4 rounded-lg border-2 ${
                    completed 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {completed ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <X className="w-5 h-5 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      completed ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {completed ? t('common.completed') : t('common.missing')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {doc.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('common.actions')}</h3>
            
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/partners/${partner.id}/edit`)}
                disabled={actionLoading}
              >
                <Edit className="w-4 h-4 mr-2" />
                {t('partners.edit_partner')}
              </Button>
              
              {partner.status === 'pending' && (
                <Button
                  onClick={() => handleStatusChange('active')}
                  disabled={actionLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t('partners.approve_partner')}
                </Button>
              )}
              
              {partner.status === 'active' && (
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange('suspended')}
                  disabled={actionLoading}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  {t('partners.suspend_partner')}
                </Button>
              )}
              
              {partner.status === 'suspended' && (
                <Button
                  onClick={() => handleStatusChange('active')}
                  disabled={actionLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t('partners.reactivate_partner')}
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={actionLoading}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-2" />
                {t('partners.delete_partner')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
