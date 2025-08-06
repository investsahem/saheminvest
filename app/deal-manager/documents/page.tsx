'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DealManagerLayout from '../../components/layout/DealManagerLayout'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { 
  FileText, Upload, Download, Eye, Trash2, Search, Filter,
  FolderOpen, File, Image, FileType, Calendar, User,
  CheckCircle, Clock, AlertCircle, Plus, Share, Edit
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

const DocumentsPage = () => {
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
          name: 'Smart City Infrastructure - Contract.pdf',
          type: 'contract',
          category: 'legal',
          size: 2457600, // 2.4 MB
          uploadedAt: '2024-01-20T10:30:00Z',
          uploadedBy: 'Ahmed Al-Rashid',
          dealId: '1',
          dealTitle: 'Smart City Infrastructure',
          status: 'approved',
          url: '/documents/contract-1.pdf',
          description: 'Main investment contract for the Smart City Infrastructure project'
        },
        {
          id: '2',
          name: 'Q4 2023 Performance Report.xlsx',
          type: 'report',
          category: 'financial',
          size: 1024000, // 1 MB
          uploadedAt: '2024-01-18T14:15:00Z',
          uploadedBy: 'Sarah Johnson',
          status: 'approved',
          url: '/documents/q4-report.xlsx',
          description: 'Quarterly performance analysis and financial metrics'
        },
        {
          id: '3',
          name: 'AI Healthcare Platform - Pitch Deck.pptx',
          type: 'presentation',
          category: 'marketing',
          size: 5242880, // 5 MB
          uploadedAt: '2024-01-17T09:45:00Z',
          uploadedBy: 'Mohammed Al-Saadoun',
          dealId: '2',
          dealTitle: 'AI Healthcare Platform',
          status: 'review',
          url: '/documents/pitch-deck-2.pptx',
          description: 'Investment presentation for AI Healthcare Platform'
        },
        {
          id: '4',
          name: 'Compliance Certificate.pdf',
          type: 'other',
          category: 'compliance',
          size: 512000, // 500 KB
          uploadedAt: '2024-01-16T16:20:00Z',
          uploadedBy: 'Legal Team',
          status: 'approved',
          url: '/documents/compliance-cert.pdf',
          description: 'Regulatory compliance certificate'
        },
        {
          id: '5',
          name: 'Project Timeline.png',
          type: 'image',
          category: 'deal',
          size: 768000, // 750 KB
          uploadedAt: '2024-01-15T11:10:00Z',
          uploadedBy: 'Project Manager',
          dealId: '3',
          dealTitle: 'Green Energy Solutions',
          status: 'draft',
          url: '/documents/timeline.png',
          description: 'Visual project timeline and milestones'
        }
      ]
      setDocuments(sampleDocuments)
      setLoading(false)
    }, 1000)
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Add new document to list (in real app, this would come from API response)
      const newDoc: DocumentItem = {
        id: Date.now().toString(),
        name: files[0].name,
        type: 'other',
        category: 'deal',
        size: files[0].size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: session?.user?.name || 'Current User',
        status: 'draft',
        url: `/documents/${files[0].name}`,
        description: 'Recently uploaded document'
      }
      
      setDocuments(prev => [newDoc, ...prev])
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = (document: DocumentItem) => {
    // Simulate download
    const link = globalThis.document.createElement('a')
    link.href = document.url
    link.download = document.name
    link.click()
  }

  const handleView = (document: DocumentItem) => {
    setSelectedDocument(document)
    setShowViewModal(true)
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setDocuments(prev => prev.filter(doc => doc.id !== documentId))
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const handleStatusChange = async (documentId: string, newStatus: DocumentItem['status']) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === documentId ? { ...doc, status: newStatus } : doc
        )
      )
    } catch (error) {
      console.error('Status update failed:', error)
    }
  }

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = searchTerm === '' || 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.dealTitle?.toLowerCase().includes(searchTerm.toLowerCase())

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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'contract': return <FileText className="w-6 h-6 text-blue-600" />
      case 'report': return <FileType className="w-6 h-6 text-green-600" />
      case 'presentation': return <File className="w-6 h-6 text-orange-600" />
      case 'image': return <Image className="w-6 h-6 text-purple-600" />
      default: return <File className="w-6 h-6 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'review': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'archived': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'review': return <Clock className="w-4 h-4" />
      case 'draft': return <Edit className="w-4 h-4" />
      case 'archived': return <AlertCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const documentStats = {
    total: documents.length,
    approved: documents.filter(d => d.status === 'approved').length,
    inReview: documents.filter(d => d.status === 'review').length,
    draft: documents.filter(d => d.status === 'draft').length
  }

  return (
    <DealManagerLayout
      title="Documents"
      subtitle="Manage and organize deal-related documents"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Documents</p>
                  <p className="text-2xl font-bold text-blue-900">{documentStats.total}</p>
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
                  <p className="text-2xl font-bold text-green-900">{documentStats.approved}</p>
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
                  <p className="text-sm font-medium text-yellow-700">In Review</p>
                  <p className="text-2xl font-bold text-yellow-900">{documentStats.inReview}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Draft</p>
                  <p className="text-2xl font-bold text-gray-900">{documentStats.draft}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Edit className="w-6 h-6 text-gray-600" />
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
                  <option value="contract">Contracts</option>
                  <option value="report">Reports</option>
                  <option value="presentation">Presentations</option>
                  <option value="image">Images</option>
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
                  <option value="review">In Review</option>
                  <option value="approved">Approved</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex gap-2">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  multiple
                />
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  disabled={uploading}
                >
                  <Filter className="w-4 h-4" />
                  Export
                </Button>
                <Button 
                  className="flex items-center gap-2"
                  onClick={() => globalThis.document.getElementById('file-upload')?.click()}
                  disabled={uploading}
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredDocuments.map((document) => (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {getFileIcon(document.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {document.name}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                            {getStatusIcon(document.status)}
                            {document.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="capitalize">{document.type}</span>
                          <span className="capitalize">{document.category}</span>
                          <span>{formatFileSize(document.size)}</span>
                          {document.dealTitle && (
                            <span className="text-blue-600">Deal: {document.dealTitle}</span>
                          )}
                        </div>
                        
                        {document.description && (
                          <p className="text-xs text-gray-600 mt-1 truncate">
                            {document.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <User className="w-3 h-3" />
                          <span>{document.uploadedBy}</span>
                          <Calendar className="w-3 h-3 ml-2" />
                          <span>{formatDate(document.uploadedAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(document)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(document)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>

                      {document.status === 'draft' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(document.id, 'review')}
                        >
                          Submit for Review
                        </Button>
                      )}

                      {document.status === 'review' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(document.id, 'approved')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(document.id, 'draft')}
                          >
                            Reject
                          </Button>
                        </div>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                        onClick={() => handleDelete(document.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredDocuments.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterType !== 'all' || filterCategory !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by uploading your first document.'
                }
              </p>
              {(!searchTerm && filterType === 'all' && filterCategory === 'all' && filterStatus === 'all') && (
                <Button onClick={() => globalThis.document.getElementById('file-upload')?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* View Document Modal */}
        {showViewModal && selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Document Details</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowViewModal(false)}
                  >
                    ×
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Document Info */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {getFileIcon(selectedDocument.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{selectedDocument.name}</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="block text-gray-700 font-medium mb-1">Type</label>
                          <p className="text-gray-900 capitalize">{selectedDocument.type}</p>
                        </div>
                        <div>
                          <label className="block text-gray-700 font-medium mb-1">Category</label>
                          <p className="text-gray-900 capitalize">{selectedDocument.category}</p>
                        </div>
                        <div>
                          <label className="block text-gray-700 font-medium mb-1">Size</label>
                          <p className="text-gray-900">{formatFileSize(selectedDocument.size)}</p>
                        </div>
                        <div>
                          <label className="block text-gray-700 font-medium mb-1">Status</label>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedDocument.status)}`}>
                            {getStatusIcon(selectedDocument.status)}
                            {selectedDocument.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedDocument.description && (
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Description</label>
                      <p className="text-gray-900">{selectedDocument.description}</p>
                    </div>
                  )}

                  {/* Deal Info */}
                  {selectedDocument.dealTitle && (
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">Related Deal</label>
                      <p className="text-blue-600">{selectedDocument.dealTitle}</p>
                    </div>
                  )}

                  {/* Upload Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="block text-gray-700 font-medium mb-1">Uploaded By</label>
                        <p className="text-gray-900">{selectedDocument.uploadedBy}</p>
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-1">Upload Date</label>
                        <p className="text-gray-900">{formatDate(selectedDocument.uploadedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-6">
                  <Button onClick={() => handleDownload(selectedDocument)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline">
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowViewModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DealManagerLayout>
  )
}

export default DocumentsPage