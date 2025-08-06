'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
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

  // Sample documents data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const sampleDocuments: DocumentItem[] = [
        {
          id: '1',
          name: 'AI Healthcare Platform - Business Plan.pdf',
          type: 'contract',
          category: 'deal',
          size: 2457600,
          uploadedAt: '2024-01-20',
          uploadedBy: 'Partner User',
          dealId: '1',
          dealTitle: 'AI Healthcare Platform',
          status: 'approved',
          url: '/documents/business-plan.pdf',
          description: 'Comprehensive business plan for AI healthcare platform investment'
        },
        {
          id: '2',
          name: 'Q4 2023 Financial Report.xlsx',
          type: 'report',
          category: 'financial',
          size: 1843200,
          uploadedAt: '2024-01-18',
          uploadedBy: 'Partner User',
          status: 'approved',
          url: '/documents/q4-report.xlsx',
          description: 'Quarterly financial performance report'
        },
        {
          id: '3',
          name: 'Smart Home Solutions - Pitch Deck.pptx',
          type: 'presentation',
          category: 'marketing',
          size: 5242880,
          uploadedAt: '2024-01-15',
          uploadedBy: 'Partner User',
          dealId: '2',
          dealTitle: 'Smart Home Solutions',
          status: 'review',
          url: '/documents/pitch-deck.pptx',
          description: 'Investor presentation for smart home solutions project'
        },
        {
          id: '4',
          name: 'Partnership Agreement Template.docx',
          type: 'contract',
          category: 'legal',
          size: 1024000,
          uploadedAt: '2024-01-12',
          uploadedBy: 'Partner User',
          status: 'approved',
          url: '/documents/partnership-agreement.docx',
          description: 'Standard partnership agreement template'
        },
        {
          id: '5',
          name: 'Medical Device Manufacturing - Product Images.zip',
          type: 'image',
          category: 'marketing',
          size: 10485760,
          uploadedAt: '2024-01-10',
          uploadedBy: 'Partner User',
          dealId: '3',
          dealTitle: 'Medical Device Manufacturing',
          status: 'approved',
          url: '/documents/product-images.zip',
          description: 'Product images and marketing materials'
        },
        {
          id: '6',
          name: 'Compliance Checklist 2024.pdf',
          type: 'other',
          category: 'compliance',
          size: 512000,
          uploadedAt: '2024-01-08',
          uploadedBy: 'Partner User',
          status: 'draft',
          url: '/documents/compliance-checklist.pdf',
          description: 'Annual compliance requirements checklist'
        }
      ]
      setDocuments(sampleDocuments)
      setLoading(false)
    }, 1000)
  }, [])

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      setUploading(true)
      // Simulate upload
      setTimeout(() => {
        setUploading(false)
        // Add new document to list
        const newDoc: DocumentItem = {
          id: Date.now().toString(),
          name: files[0].name,
          type: 'other',
          category: 'deal',
          size: files[0].size,
          uploadedAt: new Date().toISOString().split('T')[0],
          uploadedBy: session?.user?.name || 'Partner User',
          status: 'draft',
          url: URL.createObjectURL(files[0]),
          description: 'Recently uploaded document'
        }
        setDocuments(prev => [newDoc, ...prev])
      }, 2000)
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

  const handleDelete = (documentId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      setDocuments(prev => prev.filter(doc => doc.id !== documentId))
    }
  }

  const handleStatusChange = (documentId: string, newStatus: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId ? { ...doc, status: newStatus as any } : doc
    ))
  }

  // Calculate summary metrics
  const totalDocuments = documents.length
  const approvedDocuments = documents.filter(d => d.status === 'approved').length
  const pendingReview = documents.filter(d => d.status === 'review').length
  const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0)

  return (
    <PartnerLayout
      title="Documents"
      subtitle="Manage your documents and files"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Documents</p>
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
                  <p className="text-sm font-medium text-green-700">Approved</p>
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
                  <p className="text-sm font-medium text-yellow-700">Pending Review</p>
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
                  <p className="text-sm font-medium text-purple-700">Total Size</p>
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
                    placeholder="Search documents..."
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
                  <option value="all">All Types</option>
                  <option value="contract">Contract</option>
                  <option value="report">Report</option>
                  <option value="presentation">Presentation</option>
                  <option value="image">Image</option>
                  <option value="other">Other</option>
                </select>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="deal">Deal</option>
                  <option value="legal">Legal</option>
                  <option value="financial">Financial</option>
                  <option value="marketing">Marketing</option>
                  <option value="compliance">Compliance</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="review">Review</option>
                  <option value="approved">Approved</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex items-center gap-2"
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Upload'}
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
                          {document.type} • {document.category}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                      {getStatusIcon(document.status)}
                      {document.status}
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
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => handleDownload(document)}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
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
                        Submit for Review
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterType !== 'all' || filterCategory !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Upload your first document to get started.'
                }
              </p>
              {(!searchTerm && filterType === 'all' && filterCategory === 'all' && filterStatus === 'all') && (
                <Button onClick={handleUpload}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
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