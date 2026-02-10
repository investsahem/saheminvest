'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { useTranslation } from '../../components/providers/I18nProvider'
import AdminLayout from '../../components/layout/AdminLayout'
import {
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
  DollarSign
} from 'lucide-react'

interface Application {
  id: string
  fullName: string
  email: string
  phone: string
  dateOfBirth: string
  address: string
  city: string
  country: string
  occupation: string
  annualIncome: number
  investmentExperience: string
  riskTolerance: string
  investmentGoals: string
  identityDocument: string
  status: string
  submittedAt: string
  reviewedAt?: string
  reviewer?: {
    id: string
    name: string
    email: string
  }
  reviewNotes?: string
}

interface ApplicationStats {
  total: number
  pending: number
  approved: number
  rejected: number
}

export default function ApplicationsPage() {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<ApplicationStats>({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectingApplication, setRejectingApplication] = useState<Application | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/admin/applications')
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications || [])

        // Calculate stats
        const apps = data.applications || []
        const stats = {
          total: apps.length,
          pending: apps.filter((app: Application) => app.status === 'PENDING').length,
          approved: apps.filter((app: Application) => app.status === 'APPROVED').length,
          rejected: apps.filter((app: Application) => app.status === 'REJECTED').length
        }
        setStats(stats)
      } else {
        console.error('Failed to fetch applications')
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApplicationAction = async (applicationId: string, action: 'approve' | 'reject', notes?: string) => {
    setProcessing(applicationId)
    try {
      console.log(`🔄 Attempting to ${action} application:`, {
        applicationId,
        action,
        notes,
        session: session?.user
      })

      // For rejection, we need to provide a rejection reason
      const requestBody = action === 'approve'
        ? {
          status: 'APPROVED',
          reviewNotes: notes || 'Application approved by admin'
        }
        : {
          status: 'REJECTED',
          rejectionReason: notes || 'Application rejected by admin - no specific reason provided',
          reviewNotes: notes || 'Application rejected by admin'
        }

      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      console.log(`📡 API Response:`, {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Success:`, data)
        await fetchApplications()
        setSelectedApplication(null)
        alert(`Application ${action}d successfully!`)
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        console.error(`❌ API Error:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        alert(`Failed to ${action} application: ${errorData.message || response.statusText}`)
      }
    } catch (error) {
      console.error(`💥 Network/Runtime Error:`, error)
      alert(`Error ${action}ing application: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setProcessing(null)
    }
  }

  const handleRejectClick = (application: Application) => {
    setRejectingApplication(application)
    setRejectionReason('')
    setShowRejectModal(true)
  }

  const handleRejectConfirm = async () => {
    if (!rejectingApplication || !rejectionReason.trim()) {
      alert(t('applications.rejection_reason_required'))
      return
    }

    await handleApplicationAction(rejectingApplication.id, 'reject', rejectionReason)
    setShowRejectModal(false)
    setRejectingApplication(null)
    setRejectionReason('')
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
    const matchesSearch = (app.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (app.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (app.phone || '').includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || (app.status?.toLowerCase() || '') === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <AdminLayout title={t('applications.title')} subtitle={t('applications.subtitle')}>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  // Debug: Show session status in development or if there are issues
  if (!session?.user) {
    return (
      <AdminLayout title={t('applications.authentication_required')} subtitle={t('applications.auth_required_message')}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('applications.authentication_required')}</h3>
            <p className="text-gray-600 mb-6">{t('applications.auth_required_message')}</p>
            <div className="bg-gray-100 p-4 rounded-lg mb-4 text-left">
              <p className="text-sm text-gray-600">
                Debug Info:<br />
                Session: {session ? 'exists' : 'null'}<br />
                User: {session?.user ? 'exists' : 'null'}<br />
                Role: {session?.user?.role || 'none'}<br />
                Current URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}
              </p>
            </div>
            <Button onClick={() => window.location.href = '/auth/signin'} className="bg-blue-600 hover:bg-blue-700">
              {t('applications.sign_in')}
            </Button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  // Debug: Show role mismatch
  if (session.user.role !== 'ADMIN') {
    return (
      <AdminLayout title={t('applications.access_denied')} subtitle={t('applications.access_denied_message')}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('applications.access_denied')}</h3>
            <p className="text-gray-600 mb-6">{t('applications.access_denied_message')}</p>
            <div className="bg-gray-100 p-4 rounded-lg mb-4 text-left">
              <p className="text-sm text-gray-600">
                Your Role: {session.user.role}<br />
                Required: ADMIN<br />
                User ID: {session.user.id}<br />
                Email: {session.user.email}
              </p>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title={t('applications.title')}
      subtitle={t('applications.subtitle')}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={t('applications.search_placeholder')}
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
              <option value="all">{t('applications.all_status')}</option>
              <option value="pending">{t('applications.pending')}</option>
              <option value="approved">{t('applications.approved')}</option>
              <option value="rejected">{t('applications.rejected')}</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-700">{t('applications.total_applications')}</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
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
                  <p className="text-sm font-medium text-yellow-700">{t('applications.pending_review')}</p>
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
                  <p className="text-sm font-medium text-green-700">{t('applications.approved')}</p>
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
                  <p className="text-sm font-medium text-red-700">{t('applications.rejected')}</p>
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
                      {t('applications.applicant')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('applications.contact')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('applications.income')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('applications.experience')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('applications.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('applications.submitted')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('applications.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{application.fullName || t('applications.na')}</div>
                            <div className="text-sm text-gray-500">{application.occupation || t('applications.na')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{application.email || t('applications.na')}</div>
                        <div className="text-sm text-gray-500">{application.phone || t('applications.na')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(application.annualIncome || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{t(`applications.experience_levels.${application.investmentExperience}`) !== `applications.experience_levels.${application.investmentExperience}` ? t(`applications.experience_levels.${application.investmentExperience}`) : (application.investmentExperience || t('applications.na'))}</div>
                        <div className="text-sm text-gray-500">{t('applications.risk')}: {t(`applications.risk_levels.${application.riskTolerance}`) !== `applications.risk_levels.${application.riskTolerance}` ? t(`applications.risk_levels.${application.riskTolerance}`) : (application.riskTolerance || t('applications.na'))}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status || '')}`}>
                          {getStatusIcon(application.status || '')}
                          <span className="ml-1">{t(`applications.${(application.status || 'unknown').toLowerCase()}`)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {application.submittedAt ? formatDate(application.submittedAt) : t('applications.na')}
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
                                onClick={() => handleRejectClick(application)}
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
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">{t('applications.no_applications_found')}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || statusFilter !== 'all'
                    ? t('applications.adjust_search')
                    : t('applications.no_submissions')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Detail Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">{t('applications.application_details')}</h3>
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">{t('applications.personal_information')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t('applications.full_name')}</label>
                        <p className="text-sm text-gray-900">{selectedApplication.fullName || t('applications.na')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t('applications.email')}</label>
                        <p className="text-sm text-gray-900">{selectedApplication.email || t('applications.na')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t('applications.phone')}</label>
                        <p className="text-sm text-gray-900">{selectedApplication.phone || t('applications.na')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t('applications.date_of_birth')}</label>
                        <p className="text-sm text-gray-900">
                          {selectedApplication.dateOfBirth ? new Date(selectedApplication.dateOfBirth).toLocaleDateString() : t('applications.na')}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">{t('applications.address')}</label>
                        <p className="text-sm text-gray-900">
                          {[selectedApplication.address, selectedApplication.city, selectedApplication.country]
                            .filter(Boolean)
                            .join(', ') || t('applications.na')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">{t('applications.financial_information')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t('applications.occupation')}</label>
                        <p className="text-sm text-gray-900">{selectedApplication.occupation || t('applications.na')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t('applications.annual_income')}</label>
                        <p className="text-sm text-gray-900">{formatCurrency(selectedApplication.annualIncome || 0)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Investment Profile */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">{t('applications.investment_profile')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t('applications.investment_experience')}</label>
                        <p className="text-sm text-gray-900">{t(`applications.experience_levels.${selectedApplication.investmentExperience}`) !== `applications.experience_levels.${selectedApplication.investmentExperience}` ? t(`applications.experience_levels.${selectedApplication.investmentExperience}`) : (selectedApplication.investmentExperience || t('applications.na'))}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t('applications.risk_tolerance')}</label>
                        <p className="text-sm text-gray-900">{t(`applications.risk_levels.${selectedApplication.riskTolerance}`) !== `applications.risk_levels.${selectedApplication.riskTolerance}` ? t(`applications.risk_levels.${selectedApplication.riskTolerance}`) : (selectedApplication.riskTolerance || t('applications.na'))}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">{t('applications.investment_goals')}</label>
                        <p className="text-sm text-gray-900">{selectedApplication.investmentGoals || t('applications.na')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  {selectedApplication.status === 'PENDING' && (
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => handleRejectClick(selectedApplication)}
                        disabled={processing === selectedApplication.id}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        {t('applications.reject')}
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
                        {t('applications.approve')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Reason Modal */}
        {showRejectModal && rejectingApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{t('applications.reject_application')}</h3>
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    {t('applications.reject_confirm_message')} <strong>{rejectingApplication.fullName}</strong>.
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    {t('applications.rejection_reason_prompt')}
                  </p>

                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder={t('applications.rejection_reason_placeholder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowRejectModal(false)}
                    disabled={processing === rejectingApplication.id}
                  >
                    {t('applications.cancel')}
                  </Button>
                  <Button
                    onClick={handleRejectConfirm}
                    disabled={processing === rejectingApplication.id || !rejectionReason.trim()}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {processing === rejectingApplication.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    {t('applications.reject_application')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
} 