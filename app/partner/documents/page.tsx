'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslation } from '../../components/providers/I18nProvider'
import PartnerLayout from '../../components/layout/PartnerLayout'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { 
  Upload, Search, Filter, Eye, Download, Trash2, Edit,
  FileText, Image, File, Calendar, User, Building2, 
  CheckCircle, Clock, AlertCircle, Plus, FolderOpen
} from 'lucide-react'

interface DocumentItem {
  id: string
  name: string
  type: 'contract' | 'report' | 'presentation' | 'image' | 'other'
  category: 'deal' | 'legal' | 'financial' | 'marketing' | 'compliance'
  size: number
  uploadedAt: string
  uploadedBy: string
  dealId?: string
  dealTitle?: string
  status: 'draft' | 'review' | 'approved' | 'archived'
  url: string
  description?: string
}

const PartnerDocumentsPage = () => {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [uploading, setUploading] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [summary, setSummary] = useState<any>({})
  const [pagination, setPagination] = useState<any>({})

  // Fetch real documents data
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true)
        const queryParams = new URLSearchParams({
          type: filterType,
          category: filterCategory,
          status: filterStatus,
          page: '1',
          limit: '50'
        })
        
        const response = await fetch(`/api/partner/documents?${queryParams}`)
        if (response.ok) {
          const data = await response.json()
          setDocuments(data.documents)
          setSummary(data.summary)
          setPagination(data.pagination)
        } else {
          console.error('Failed to fetch documents')
        }
      } catch (error) {
        console.error('Error fetching documents:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchDocuments()
    }
  }, [session, filterType, filterCategory, filterStatus])

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = searchTerm === '' || 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.dealTitle && doc.dealTitle.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = filterType === 'all' || doc.type === filterType
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus

    return matchesSearch && matchesType && matchesCategory && matchesStatus
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'review': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'archived': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'review': return <Clock className="w-4 h-4" />
      case 'draft': return <Edit className="w-4 h-4" />
      case 'archived': return <FolderOpen className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'contract': return <FileText className="w-5 h-5 text-blue-600" />
      case 'report': return <FileText className="w-5 h-5 text-green-600" />
      case 'presentation': return <FileText className="w-5 h-5 text-purple-600" />
      case 'image': return <Image className="w-5 h-5 text-orange-600" />
      default: return <File className="w-5 h-5 text-gray-600" />
    }
  }

  const handleUpload = () => {
    globalThis.document.getElementById('file-upload')?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      setUploading(true)
      try {
        const formData = new FormData()
        formData.append('file', files[0])
        formData.append('type', 'OTHER')
        formData.append('category', 'DEAL')
        formData.append('description', t('partner_documents.descriptions.recently_uploaded'))
        
        const response = await fetch('/api/partner/documents', {
          method: 'POST',
          body: formData
        })
        
        if (response.ok) {
          const newDoc = await response.json()
          setDocuments(prev => [newDoc, ...prev])
          // Update summary
          setSummary((prev: any) => ({
            ...prev,
            totalDocuments: (prev.totalDocuments || 0) + 1,
            totalSize: (prev.totalSize || 0) + files[0].size
          }))
        } else {
          console.error('Failed to upload document')
        }
      } catch (error) {
        console.error('Error uploading document:', error)
      } finally {
        setUploading(false)
      }
    }
  }

  const handleView = (document: DocumentItem) => {
    setSelectedDocument(document)
    setShowViewModal(true)
  }

  const handleDownload = (document: DocumentItem) => {
    // Simulate download
    const link = globalThis.document.createElement('a')
    link.href = document.url
    link.download = document.name
    link.click()
  }

  const handleDelete = async (documentId: string) => {
    if (confirm(t('partner_documents.confirmation.delete_document'))) {
      try {
        const response = await fetch(`/api/partner/documents?id=${documentId}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          const deletedDoc = documents.find(doc => doc.id === documentId)
          setDocuments(prev => prev.filter(doc => doc.id !== documentId))
          // Update summary
          setSummary((prev: any) => ({
            ...prev,
            totalDocuments: Math.max((prev.totalDocuments || 1) - 1, 0),
            totalSize: Math.max((prev.totalSize || 0) - (deletedDoc?.size || 0), 0)
          }))
        } else {
          console.error('Failed to delete document')
        }
      } catch (error) {
        console.error('Error deleting document:', error)
      }
    }
  }

  const handleStatusChange = async (documentId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/partner/documents', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documentId,
          status: newStatus
        })
      })
      
      if (response.ok) {
        const updatedDoc = await response.json()
        setDocuments(prev => prev.map(doc => 
          doc.id === documentId ? updatedDoc : doc
        ))
        // Update summary if status changed to approved or review
        if (newStatus === 'review') {
          setSummary((prev: any) => ({
            ...prev,
            pendingReview: (prev.pendingReview || 0) + 1
          }))
        }
      } else {
        console.error('Failed to update document status')
      }
    } catch (error) {
      console.error('Error updating document status:', error)
    }
  }

  // Get summary metrics from API response
  const totalDocuments = summary.totalDocuments || 0
  const approvedDocuments = summary.approvedDocuments || 0
  const pendingReview = summary.pendingReview || 0
  const totalSize = summary.totalSize || 0

  return (
    <PartnerLayout
      title={t('partner_documents.title')}
      subtitle={t('partner_documents.subtitle')}
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">{t('partner_documents.summary.total_documents')}</p>
                  <p className="text-2xl font-bold text-blue-900">{totalDocuments}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">{t('partner_documents.summary.approved')}</p>
                  <p className="text-2xl font-bold text-green-900">{approvedDocuments}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">{t('partner_documents.summary.pending_review')}</p>
                  <p className="text-2xl font-bold text-yellow-900">{pendingReview}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">{t('partner_documents.summary.total_size')}</p>
                  <p className="text-2xl font-bold text-purple-900">{formatFileSize(totalSize)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder={t('partner_documents.filters.search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{t('partner_documents.filters.all_types')}</option>
                  <option value="contract">{t('partner_documents.types.contract')}</option>
                  <option value="report">{t('partner_documents.types.report')}</option>
                  <option value="presentation">{t('partner_documents.types.presentation')}</option>
                  <option value="image">{t('partner_documents.types.image')}</option>
                  <option value="other">{t('partner_documents.types.other')}</option>
                </select>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{t('partner_documents.filters.all_categories')}</option>
                  <option value="deal">{t('partner_documents.categories.deal')}</option>
                  <option value="legal">{t('partner_documents.categories.legal')}</option>
                  <option value="financial">{t('partner_documents.categories.financial')}</option>
                  <option value="marketing">{t('partner_documents.categories.marketing')}</option>
                  <option value="compliance">{t('partner_documents.categories.compliance')}</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{t('partner_documents.filters.all_status')}</option>
                  <option value="draft">{t('partner_documents.status.draft')}</option>
                  <option value="review">{t('partner_documents.status.review')}</option>
                  <option value="approved">{t('partner_documents.status.approved')}</option>
                  <option value="archived">{t('partner_documents.status.archived')}</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex items-center gap-2"
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? t('partner_documents.filters.uploading') : t('partner_documents.filters.upload')}
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  multiple
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((document) => (
              <Card key={document.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Document Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {getTypeIcon(document.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {document.name}
                        </h3>
                        <p className="text-xs text-gray-500 capitalize">
                          {t(`partner_documents.types.${document.type}`)} • {t(`partner_documents.categories.${document.category}`)}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                      {getStatusIcon(document.status)}
                      {t(`partner_documents.status.${document.status}`)}
                    </span>
                  </div>

                  {/* Deal Info */}
                  {document.dealTitle && (
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{document.dealTitle}</span>
                    </div>
                  )}

                  {/* Description */}
                  {document.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {document.description}
                    </p>
                  )}

                  {/* File Info */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(document.uploadedAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <File className="w-3 h-3" />
                      {formatFileSize(document.size)}
                    </div>
                  </div>

                  {/* Uploaded By */}
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{document.uploadedBy}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => handleView(document)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      {t('partner_documents.actions.view')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => handleDownload(document)}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      {t('partner_documents.actions.download')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50 text-xs"
                      onClick={() => handleDelete(document.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Status Change Actions */}
                  {document.status === 'draft' && (
                    <div className="mt-2">
                      <Button
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => handleStatusChange(document.id, 'review')}
                      >
                        {t('partner_documents.actions.submit_for_review')}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredDocuments.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('partner_documents.empty_state.no_documents')}</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterType !== 'all' || filterCategory !== 'all' || filterStatus !== 'all'
                  ? t('partner_documents.empty_state.adjust_filters')
                  : t('partner_documents.empty_state.upload_first')
                }
              </p>
              {(!searchTerm && filterType === 'all' && filterCategory === 'all' && filterStatus === 'all') && (
                <Button onClick={handleUpload}>
                  <Upload className="w-4 h-4 mr-2" />
                  {t('partner_documents.actions.upload_document')}
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PartnerLayout>
  )
}

export default PartnerDocumentsPage