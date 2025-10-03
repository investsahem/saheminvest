'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { useTranslation } from '../../components/providers/I18nProvider'
import AdminLayout from '../../components/layout/AdminLayout'
import { 
  Building2,
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Search,
  Filter,
  FileText,
  AlertCircle,
  Briefcase,
  DollarSign,
  Globe,
  Users,
  Star,
  TrendingUp
} from 'lucide-react'

interface PartnerApplication {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string
  website?: string
  address: string
  city: string
  country: string
  industry: string
  businessType: string
  description: string
  yearsExperience?: number
  investmentAreas: string[]
  minimumDealSize?: number
  maximumDealSize?: number
  previousDeals?: number
  status: string
  createdAt: string
  reviewedAt?: string
  reviewer?: {
    id: string
    name: string
    email: string
  }
  notes?: string
}

interface ApplicationStats {
  total: number
  pending: number
  approved: number
  rejected: number
}

export default function PartnerApplicationsPage() {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const [applications, setApplications] = useState<PartnerApplication[]>([])
  const [stats, setStats] = useState<ApplicationStats>({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedApplication, setSelectedApplication] = useState<PartnerApplication | null>(null)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/admin/partner-applications')
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications || [])
        
        // Calculate stats
        const apps = data.applications || []
        const stats = {
          total: apps.length,
          pending: apps.filter((app: PartnerApplication) => app.status === 'PENDING').length,
          approved: apps.filter((app: PartnerApplication) => app.status === 'APPROVED').length,
          rejected: apps.filter((app: PartnerApplication) => app.status === 'REJECTED').length
        }
        setStats(stats)
      } else {
        console.error('Failed to fetch partner applications')
      }
    } catch (error) {
      console.error('Error fetching partner applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApplicationAction = async (applicationId: string, action: 'approve' | 'reject', notes?: string) => {
    setProcessing(applicationId)
    try {
      const response = await fetch(`/api/admin/partner-applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: action === 'approve' ? 'APPROVED' : 'REJECTED', 
          reviewNotes: notes || `Partner application ${action}d by admin`
        })
      })
      
      if (response.ok) {
        await fetchApplications()
        setSelectedApplication(null)
        alert(`Partner application ${action}d successfully!`)
      } else {
        alert(`Failed to ${action} partner application`)
      }
    } catch (error) {
      console.error(`Error ${action}ing partner application:`, error)
      alert(`Error ${action}ing partner application`)
    } finally {
      setProcessing(null)
    }
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return t('partner_applications.not_specified')
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch = (app.companyName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (app.contactName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (app.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (app.phone || '').includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || (app.status?.toLowerCase() || '') === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <AdminLayout title={t('partner_applications.title')} subtitle={t('partner_applications.subtitle')}>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout 
      title={t('partner_applications.title')}
      subtitle={t('partner_applications.subtitle')}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={t('partner_applications.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('partner_applications.all_status')}</option>
              <option value="pending">{t('partner_applications.pending')}</option>
              <option value="approved">{t('partner_applications.approved')}</option>
              <option value="rejected">{t('partner_applications.rejected')}</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-700">{t('partner_applications.total_applications')}</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-yellow-700">{t('partner_applications.pending_review')}</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-700">{t('partner_applications.approved')}</p>
                  <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-red-700">{t('partner_applications.rejected')}</p>
                  <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('partner_applications.company')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('partner_applications.contact')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('partner_applications.industry')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('partner_applications.experience')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('partner_applications.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('partner_applications.submitted')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('partner_applications.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{application.companyName || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{application.businessType || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{application.contactName || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{application.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{application.industry || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{application.city}, {application.country}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{application.yearsExperience || 0} {t('partner_applications.years')}</div>
                        <div className="text-sm text-gray-500">{application.previousDeals || 0} {t('partner_applications.deals')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status || '')}`}>
                          {getStatusIcon(application.status || '')}
                          <span className="ml-1 capitalize">{(application.status || 'unknown').toLowerCase()}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {application.createdAt ? formatDate(application.createdAt) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedApplication(application)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {application.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApplicationAction(application.id, 'approve')}
                                disabled={processing === application.id}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                {processing === application.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApplicationAction(application.id, 'reject')}
                                disabled={processing === application.id}
                                className="border-red-300 text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredApplications.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">{t('partner_applications.no_applications_found')}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? t('partner_applications.adjust_search')
                    : t('partner_applications.no_submissions')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Detail Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">{t('partner_applications.application_details')}</h3>
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Company Information */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                        <Building2 className="w-5 h-5 mr-2" />
                        {t('partner_applications.company_information')}
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700">{t('partner_applications.company_name')}</label>
                          <p className="text-sm text-gray-900">{selectedApplication.companyName || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">{t('partner_applications.contact_person')}</label>
                          <p className="text-sm text-gray-900">{selectedApplication.contactName || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">{t('partner_applications.email')}</label>
                          <p className="text-sm text-gray-900">{selectedApplication.email || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">{t('partner_applications.phone')}</label>
                          <p className="text-sm text-gray-900">{selectedApplication.phone || 'N/A'}</p>
                        </div>
                        {selectedApplication.website && (
                          <div>
                            <label className="text-sm font-medium text-gray-700">{t('partner_applications.website')}</label>
                            <p className="text-sm text-blue-600">
                              <a href={selectedApplication.website} target="_blank" rel="noopener noreferrer">
                                {selectedApplication.website}
                              </a>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                        <MapPin className="w-5 h-5 mr-2" />
                        {t('partner_applications.address')}
                      </h4>
                      <p className="text-sm text-gray-900">
                        {[selectedApplication.address, selectedApplication.city, selectedApplication.country]
                          .filter(Boolean)
                          .join(', ') || 'N/A'}
                      </p>
                    </div>

                    {/* Business Information */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                        <Briefcase className="w-5 h-5 mr-2" />
                        {t('partner_applications.business_information')}
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700">{t('partner_applications.industry')}</label>
                          <p className="text-sm text-gray-900">{selectedApplication.industry || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">{t('partner_applications.business_type')}</label>
                          <p className="text-sm text-gray-900">{selectedApplication.businessType || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">{t('partner_applications.years_experience')}</label>
                          <p className="text-sm text-gray-900">{selectedApplication.yearsExperience || 0} {t('partner_applications.years')}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">{t('partner_applications.previous_deals')}</label>
                          <p className="text-sm text-gray-900">{selectedApplication.previousDeals || 0} {t('partner_applications.deals')}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Investment Focus */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        {t('partner_applications.investment_focus')}
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700">{t('partner_applications.investment_areas')}</label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedApplication.investmentAreas.map(area => (
                              <span key={area} className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">{t('partner_applications.deal_size_range')}</label>
                          <p className="text-sm text-gray-900">
                            {formatCurrency(selectedApplication.minimumDealSize)} - {formatCurrency(selectedApplication.maximumDealSize)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Company Description */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        {t('partner_applications.company_description')}
                      </h4>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {selectedApplication.description || 'N/A'}
                      </p>
                    </div>

                    {/* Application Status */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3">{t('partner_applications.application_status')}</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedApplication.status || '')}`}>
                            {getStatusIcon(selectedApplication.status || '')}
                            <span className="ml-2 capitalize">{(selectedApplication.status || 'unknown').toLowerCase()}</span>
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            {t('partner_applications.submitted')}: {formatDate(selectedApplication.createdAt)}
                          </p>
                        </div>
                        {selectedApplication.reviewedAt && selectedApplication.reviewer && (
                          <div>
                            <p className="text-sm text-gray-600">
                              {t('partner_applications.reviewed_by')}: {selectedApplication.reviewer.name} {t('partner_applications.on')} {formatDate(selectedApplication.reviewedAt)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedApplication.status === 'PENDING' && (
                  <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
                    <Button
                      variant="outline"
                      onClick={() => handleApplicationAction(selectedApplication.id, 'reject')}
                      disabled={processing === selectedApplication.id}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {t('partner_applications.reject')}
                    </Button>
                    <Button
                      onClick={() => handleApplicationAction(selectedApplication.id, 'approve')}
                      disabled={processing === selectedApplication.id}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {processing === selectedApplication.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      {t('partner_applications.approve_create_account')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
