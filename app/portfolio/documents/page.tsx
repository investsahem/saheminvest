'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import InvestorLayout from '../../components/layout/InvestorLayout'
import { useTranslation, useI18n } from '../../components/providers/I18nProvider'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { 
  FileText, Download, Eye, Search, Filter, Calendar,
  Shield, CheckCircle, Clock, AlertCircle, Folder,
  FileType, Image, File, Archive, Star,
  Share2, Trash2, Upload, RefreshCw
} from 'lucide-react'

const DocumentsPage = () => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()
  
  const [filter, setFilter] = useState<'all' | 'statements' | 'contracts' | 'tax' | 'certificates'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'type'>('date')
  const [documents, setDocuments] = useState<any[]>([])
  const [summary, setSummary] = useState({
    totalDocuments: 0,
    statementCount: 0,
    contractCount: 0,
    certificateCount: 0,
    taxCount: 0,
    importantCount: 0,
    totalSize: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch documents data
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!session?.user) return

      try {
        setLoading(true)
        setError(null)
        
        const params = new URLSearchParams({
          type: filter !== 'all' ? filter : '',
          search: searchTerm || ''
        })

        const response = await fetch(`/api/portfolio/documents?${params}`)
        if (!response.ok) {
          throw new Error('Failed to fetch documents')
        }

        const data = await response.json()
        setDocuments(data.documents || [])
        setSummary(data.summary || {
          totalDocuments: 0,
          statementCount: 0,
          contractCount: 0,
          certificateCount: 0,
          taxCount: 0,
          importantCount: 0,
          totalSize: 0
        })
      } catch (error) {
        console.error('Error fetching documents:', error)
        setError('Failed to load documents')
        // Set empty fallback data
        setDocuments([])
        setSummary({
          totalDocuments: 0,
          statementCount: 0,
          contractCount: 0,
          certificateCount: 0,
          taxCount: 0,
          importantCount: 0,
          totalSize: 0
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [session, filter, searchTerm])

  const handleRefresh = async () => {
    if (!session?.user) return

    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        type: filter !== 'all' ? filter : '',
        search: searchTerm || ''
      })

      const response = await fetch(`/api/portfolio/documents?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }

      const data = await response.json()
      setDocuments(data.documents || [])
      setSummary(data.summary || {
        totalDocuments: 0,
        statementCount: 0,
        contractCount: 0,
        certificateCount: 0,
        taxCount: 0,
        importantCount: 0,
        totalSize: 0
      })
    } catch (error) {
      console.error('Error refreshing documents:', error)
      setError('Failed to refresh documents')
    } finally {
      setLoading(false)
    }
  }

  // Filter documents (client-side filtering for real-time response)
  const filteredDocuments = documents.filter(doc => {
    // Search filter (additional client-side filtering)
    if (searchTerm && 
        !doc.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !doc.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !doc.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return false
    }

    return true
  })

  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'type':
        return a.type.localeCompare(b.type)
      case 'date':
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime()
    }
  })

  // Group documents by category
  const groupedDocuments = sortedDocuments.reduce((groups, doc) => {
    const category = doc.category
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(doc)
    return groups
  }, {} as Record<string, typeof documents>)

  const formatFileSize = (bytes: string) => {
    return bytes // Already formatted in sample data
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getFileIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'pdf': return <FileType className="w-5 h-5 text-red-600" />
      case 'zip': return <Archive className="w-5 h-5 text-orange-600" />
      case 'jpg':
      case 'jpeg':
      case 'png': return <Image className="w-5 h-5 text-blue-600" />
      default: return <File className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'processing': return <Clock className="w-4 h-4 text-orange-600" />
      case 'expired': return <AlertCircle className="w-4 h-4 text-red-600" />
      default: return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-orange-100 text-orange-800'
      case 'expired': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDownload = (doc: typeof documents[0]) => {
    console.log('Downloading:', doc.name)
    // Implement download logic
  }

  const handlePreview = (doc: typeof documents[0]) => {
    console.log('Previewing:', doc.name)
    // Implement preview logic
  }

  if (loading) {
    return (
      <InvestorLayout title={t('portfolio_documents.title')}>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </InvestorLayout>
    )
  }

  return (
    <InvestorLayout title={t('portfolio_documents.title')} subtitle={t('portfolio_documents.subtitle')}>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('portfolio_documents.summary.total_documents')}</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalDocuments}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('portfolio_documents.summary.statements')}</p>
                <p className="text-2xl font-bold text-gray-900">{summary.statementCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Folder className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('portfolio_documents.summary.contracts')}</p>
                <p className="text-2xl font-bold text-gray-900">{summary.contractCount}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('portfolio_documents.summary.important')}</p>
                <p className="text-2xl font-bold text-gray-900">{summary.importantCount}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('portfolio_documents.search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              {/* Type Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{t('portfolio_documents.filters.all_types')}</option>
                  <option value="statements">{t('portfolio_documents.filters.statements')}</option>
                  <option value="contracts">{t('portfolio_documents.filters.contracts')}</option>
                  <option value="tax">{t('portfolio_documents.filters.tax_documents')}</option>
                  <option value="certificates">{t('portfolio_documents.filters.certificates')}</option>
                </select>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">{t('portfolio_documents.filters.sort_by_date')}</option>
                <option value="name">{t('portfolio_documents.filters.sort_by_name')}</option>
                <option value="type">{t('portfolio_documents.filters.sort_by_type')}</option>
              </select>

              {/* Actions */}
              <Button variant="outline" size="sm">
                <Upload className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
                {t('portfolio_documents.actions.upload')}
              </Button>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="space-y-6">
        {Object.entries(groupedDocuments).map(([category, docs]) => (
          <Card key={category}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                <span className="text-sm text-gray-500">{(docs as any[]).length} {locale === 'ar' ? 'وثيقة' : 'documents'}</span>
              </div>

              <div className="space-y-3">
                {(docs as any[]).map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        {getFileIcon(doc.format)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 truncate">{doc.name}</h4>
                          {doc.isImportant && (
                            <Star className="w-4 h-4 text-orange-500 fill-current" />
                          )}
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                            {getStatusIcon(doc.status)}
                            <span className={locale === 'ar' ? 'mr-1' : 'ml-1'}>
                              {t(`portfolio_documents.status.${doc.status}`)}
                            </span>
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2 line-clamp-1">{doc.description}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(doc.date)}
                          </span>
                          <span>{formatFileSize(doc.size)}</span>
                          <span>{doc.format}</span>
                          {doc.downloadCount > 0 && (
                            <span>{doc.downloadCount} {locale === 'ar' ? 'تحميل' : 'downloads'}</span>
                          )}
                        </div>

                        {doc.dealName && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                              {locale === 'ar' ? `مرتبط بـ: ${doc.dealName}` : `Related to: ${doc.dealName}`}
                            </span>
                          </div>
                        )}

                        {doc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {doc.tags.map((tag: string) => (
                              <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-200 text-gray-700">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {doc.status === 'available' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreview(doc)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(doc)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {sortedDocuments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('portfolio_documents.search.no_results')}</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filter !== 'all'
                ? t('portfolio_documents.search.try_adjusting')
                : t('portfolio_documents.search.no_documents')}
            </p>
            {!searchTerm && filter === 'all' && (
              <Button>
                <Upload className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
                {t('portfolio_documents.actions.upload_document')}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 mb-1">{t('portfolio_documents.security.title')}</h4>
              <p className="text-sm text-gray-600">
                {t('portfolio_documents.security.description')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </InvestorLayout>
  )
}

export default DocumentsPage