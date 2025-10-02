'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import AdminLayout from '../../components/layout/AdminLayout'
import { useTranslation } from '../../components/providers/I18nProvider'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { 
  UserCheck, Eye, Check, X, Clock, AlertCircle, 
  Search, Filter, ChevronLeft, ChevronRight,
  Calendar, Mail, Phone, FileText, User
} from 'lucide-react'

interface AdvisorApplication {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  investmentExperience: string
  riskTolerance: string
  investmentGoals: string
  monthlyIncome: number | null
  initialInvestment: number | null
  notes: string | null
  status: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED'
  rejectionReason: string | null
  createdAt: string
  reviewedAt: string | null
  reviewer: {
    id: string
    name: string
    email: string
  } | null
}

interface PortfolioAdvisor {
  id: string
  name: string
  email: string
  clientCount: number
}

const AdvisorApplicationsPage = () => {
  const { t } = useTranslation()
  const { data: session } = useSession()
  
  const [applications, setApplications] = useState<AdvisorApplication[]>([])
  const [advisors, setAdvisors] = useState<PortfolioAdvisor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<AdvisorApplication | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedAdvisor, setSelectedAdvisor] = useState('')
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchApplications()
    fetchAdvisors()
  }, [currentPage, statusFilter])

  const fetchApplications = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        status: statusFilter
      })

      const response = await fetch(`/api/advisor-applications?${params}`)
      const data = await response.json()

      if (response.ok) {
        setApplications(data.applications)
        setTotalPages(data.pagination.pages)
      } else {
        console.error('Error fetching applications:', data.error)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAdvisors = async () => {
    try {
      const response = await fetch('/api/portfolio-advisors')
      const data = await response.json()

      if (response.ok) {
        setAdvisors(data.advisors)
      } else {
        console.error('Error fetching advisors:', data.error)
      }
    } catch (error) {
      console.error('Error fetching advisors:', error)
    }
  }

  const handleApplicationAction = async () => {
    if (!selectedApplication || !actionType) return

    try {
      const body: any = {
        status: actionType === 'approve' ? 'APPROVED' : 'REJECTED'
      }

      if (actionType === 'reject' && rejectionReason) {
        body.rejectionReason = rejectionReason
      }

      if (actionType === 'approve' && selectedAdvisor) {
        body.assignedAdvisorId = selectedAdvisor
      }

      const response = await fetch(`/api/advisor-applications/${selectedApplication.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (response.ok) {
        setShowModal(false)
        setSelectedApplication(null)
        setActionType(null)
        setRejectionReason('')
        setSelectedAdvisor('')
        fetchApplications()
      } else {
        console.error('Error updating application:', data.error)
      }
    } catch (error) {
      console.error('Error updating application:', error)
    }
  }

  const openActionModal = (application: AdvisorApplication, action: 'approve' | 'reject') => {
    setSelectedApplication(application)
    setActionType(action)
    setShowModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />
      case 'IN_PROGRESS': return <AlertCircle className="w-4 h-4" />
      case 'APPROVED': return <Check className="w-4 h-4" />
      case 'REJECTED': return <X className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const filteredApplications = applications.filter(app =>
    app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <AdminLayout title="Advisor Applications">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title={t('advisor_applications.title')}>
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('advisor_applications.total_applications')}</p>
                  <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                </div>
                <UserCheck className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('advisor_applications.pending_review')}</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {applications.filter(app => app.status === 'PENDING').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('advisor_applications.approved')}</p>
                  <p className="text-2xl font-bold text-green-600">
                    {applications.filter(app => app.status === 'APPROVED').length}
                  </p>
                </div>
                <Check className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('advisor_applications.available_advisors')}</p>
                  <p className="text-2xl font-bold text-purple-600">{advisors.length}</p>
                </div>
                <User className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={t('advisor_applications.search_placeholder')}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">{t('advisor_applications.all_status')}</option>
                  <option value="pending">{t('advisor_applications.pending')}</option>
                  <option value="in_progress">{t('advisor_applications.in_progress')}</option>
                  <option value="approved">{t('advisor_applications.approved')}</option>
                  <option value="rejected">{t('advisor_applications.rejected')}</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t('advisor_applications.applicant')}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t('advisor_applications.experience')}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t('advisor_applications.risk_tolerance')}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t('advisor_applications.status')}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t('advisor_applications.applied')}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">{t('advisor_applications.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((application) => (
                    <tr key={application.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {application.firstName} {application.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{application.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-900">{application.investmentExperience}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-900">{application.riskTolerance}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {getStatusIcon(application.status)}
                          {application.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          {new Date(application.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {application.status === 'PENDING' && (
                            <>
                              <Button 
                                variant="primary" 
                                size="sm"
                                onClick={() => openActionModal(application, 'approve')}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openActionModal(application, 'reject')}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredApplications.length === 0 && (
                <div className="text-center py-8">
                  <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">{t('advisor_applications.no_applications_found')}</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-700">
                  {t('advisor_applications.page_of').replace('{current}', currentPage.toString()).replace('{total}', totalPages.toString())}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {t('advisor_applications.previous')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    {t('advisor_applications.next')}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Modal */}
        {showModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {actionType === 'approve' ? t('advisor_applications.approve_application') : t('advisor_applications.reject_application')}
              </h3>
              
              <div className="mb-4">
                <p className="text-gray-600">
                  {actionType === 'approve' 
                    ? `${t('advisor_applications.approve_application')} for ${selectedApplication.firstName} ${selectedApplication.lastName}?`
                    : `${t('advisor_applications.reject_application')} for ${selectedApplication.firstName} ${selectedApplication.lastName}?`
                  }
                </p>
              </div>

              {actionType === 'approve' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('advisor_applications.assign_portfolio_advisor')}
                  </label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedAdvisor}
                    onChange={(e) => setSelectedAdvisor(e.target.value)}
                  >
                    <option value="">{t('advisor_applications.select_advisor')}</option>
                    {advisors.map((advisor) => (
                      <option key={advisor.id} value={advisor.id}>
                        {advisor.name} ({advisor.clientCount} clients)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {actionType === 'reject' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('advisor_applications.rejection_reason')}
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder={t('advisor_applications.rejection_placeholder')}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  {t('advisor_applications.cancel')}
                </Button>
                <Button 
                  variant={actionType === 'approve' ? 'primary' : 'outline'}
                  onClick={handleApplicationAction}
                  disabled={actionType === 'reject' && !rejectionReason}
                >
                  {actionType === 'approve' ? t('advisor_applications.approve') : t('advisor_applications.reject')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdvisorApplicationsPage