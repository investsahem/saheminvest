'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../../components/layout/AdminLayout'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useTranslation } from '../../components/providers/I18nProvider'
import { CheckCircle, XCircle, Clock, Eye, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react'

interface UpdateRequest {
  id: string
  projectId: string
  changesSummary: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  reviewedAt?: string
  rejectionReason?: string
  proposedChanges: any
  project: {
    id: string
    title: string
    category: string
    status: string
    thumbnailImage?: string
  }
  requester: {
    id: string
    name: string
    email: string
    partnerProfile?: {
      companyName: string
      logo?: string
    }
  }
  reviewer?: {
    id: string
    name: string
    email: string
  }
}

export default function DealUpdatesPage() {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const router = useRouter()
  const [updateRequests, setUpdateRequests] = useState<UpdateRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<UpdateRequest | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')

  useEffect(() => {
    fetchUpdateRequests()
  }, [filter])

  const fetchUpdateRequests = async () => {
    try {
      const response = await fetch(`/api/admin/deal-update-requests?status=${filter}`)
      if (response.ok) {
        const data = await response.json()
        setUpdateRequests(data.updateRequests)
      }
    } catch (error) {
      console.error('Error fetching update requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId: string) => {
    if (!confirm(t('deal_updates.approve_confirmation'))) {
      return
    }

    setProcessing(true)
    try {
      const response = await fetch(`/api/admin/deal-update-requests/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'approve' })
      })

      if (response.ok) {
        alert(t('deal_updates.approved_success'))
        fetchUpdateRequests()
        setShowModal(false)
        setSelectedRequest(null)
      } else {
        alert(t('deal_updates.approval_failed'))
      }
    } catch (error) {
      console.error('Error approving update request:', error)
      alert(t('deal_updates.approval_error'))
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (requestId: string) => {
    if (!rejectionReason.trim()) {
      alert(t('deal_updates.rejection_reason_required'))
      return
    }

    setProcessing(true)
    try {
      const response = await fetch(`/api/admin/deal-update-requests/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'reject',
          rejectionReason
        })
      })

      if (response.ok) {
        alert(t('deal_updates.rejected_success'))
        fetchUpdateRequests()
        setShowModal(false)
        setSelectedRequest(null)
        setRejectionReason('')
      } else {
        alert(t('deal_updates.rejection_failed'))
      }
    } catch (error) {
      console.error('Error rejecting update request:', error)
      alert(t('deal_updates.rejection_error'))
    } finally {
      setProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <AdminLayout
      title={t('deal_updates.title')}
      subtitle={t('deal_updates.subtitle')}
    >
      <div className="space-y-6">
        {/* Filter tabs */}
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              filter === 'PENDING'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('deal_updates.pending')} ({updateRequests.filter(r => r.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setFilter('APPROVED')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              filter === 'APPROVED'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('deal_updates.approved')}
          </button>
          <button
            onClick={() => setFilter('REJECTED')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              filter === 'REJECTED'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('deal_updates.rejected')}
          </button>
        </div>

        {/* Update requests list */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : updateRequests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">{t('deal_updates.no_requests_found').replace('{status}', filter.toLowerCase())}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {updateRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(request.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(request.createdAt)}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {request.project.title}
                      </h3>

                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-sm text-gray-600">{t('deal_updates.requested_by')}:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {request.requester.partnerProfile?.companyName || request.requester.name}
                        </span>
                        <span className="text-xs text-gray-500">({request.requester.email})</span>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">{t('deal_updates.proposed_changes')}:</h4>
                        <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                          {request.changesSummary}
                        </pre>
                      </div>

                      {request.reviewer && (
                        <div className="text-sm text-gray-500">
                          {t('deal_updates.reviewed_by')} {request.reviewer.name} {t('deal_updates.on')} {formatDate(request.reviewedAt!)}
                        </div>
                      )}

                      {request.rejectionReason && (
                        <div className="bg-red-50 p-3 rounded-lg mt-2">
                          <p className="text-sm text-red-800">
                            <strong>{t('deal_updates.rejection_reason')}:</strong> {request.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <Button
                        onClick={() => {
                          setSelectedRequest(request)
                          setShowModal(true)
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {t('deal_updates.view_details')}
                      </Button>

                      {request.status === 'PENDING' && (
                        <>
                          <Button
                            onClick={() => handleApprove(request.id)}
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {t('deal_updates.approve')}
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedRequest(request)
                              setShowModal(true)
                            }}
                            variant="outline"
                            disabled={processing}
                            className="border-red-600 text-red-600 hover:bg-red-50"
                            size="sm"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            {t('deal_updates.reject')}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal for viewing details and rejection */}
        {showModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {t('deal_updates.update_request_details')}
                </h2>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('deal_updates.deal')}: {selectedRequest.project.title}
                  </h3>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">{t('deal_updates.changes_summary')}:</h4>
                    <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                      {selectedRequest.changesSummary}
                    </pre>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">{t('deal_updates.detailed_changes')}:</h4>
                    <pre className="text-xs text-gray-600 overflow-x-auto">
                      {JSON.stringify(selectedRequest.proposedChanges, null, 2)}
                    </pre>
                  </div>
                </div>

                {selectedRequest.status === 'PENDING' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('deal_updates.rejection_reason_label')}:
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('deal_updates.rejection_placeholder')}
                    />
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <Button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedRequest(null)
                    setRejectionReason('')
                  }}
                  variant="outline"
                  disabled={processing}
                >
                  {t('deal_updates.close')}
                </Button>

                {selectedRequest.status === 'PENDING' && (
                  <>
                    <Button
                      onClick={() => handleReject(selectedRequest.id)}
                      disabled={processing || !rejectionReason.trim()}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {processing ? t('deal_updates.processing') : t('deal_updates.reject')}
                    </Button>
                    <Button
                      onClick={() => handleApprove(selectedRequest.id)}
                      disabled={processing}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {processing ? t('deal_updates.processing') : t('deal_updates.approve')}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

