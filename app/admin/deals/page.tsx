'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../../components/layout/AdminLayout'
import { useTranslation, useI18n } from '../../components/providers/I18nProvider'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { DealTimeline } from '../../components/project/DealTimeline'
import { Deal } from '../../types/deals'
import { dealsService } from '../../lib/deals-service'
import { 
  Plus, Filter, Search, Grid, List, MoreVertical, Edit, Trash2, 
  Eye, Pause, Play, Star, TrendingUp, Clock, CheckCircle, 
  AlertCircle, X, RefreshCw, Calendar, DollarSign, Users,
  FileText, Settings, Award, Target, Activity, Check,
  XCircle, PlayCircle, PauseCircle, StopCircle, RotateCcw, Archive, GanttChart
} from 'lucide-react'



export default function AdminDealsPage() {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()
  const router = useRouter()
  
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showDateModal, setShowDateModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showTimelineModal, setShowTimelineModal] = useState(false)
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)
  const [selectedDeals, setSelectedDeals] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; right: number } | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Fetch deals using unified service
  const fetchDeals = async () => {
    try {
      setLoading(true)
      
      const params = {
        limit: 50,
        includeAll: true, // Include all statuses for admin
        status: statusFilter !== 'all' ? statusFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        search: searchTerm || undefined
      }

      const response = await dealsService.fetchDeals(params)
      setDeals(response.deals)
    } catch (error) {
      console.error('Error fetching deals:', error)
      setDeals([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeals()
  }, [searchTerm, statusFilter, categoryFilter])

  // Handle dropdown positioning
  const handleDropdownToggle = (dealId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    if (actionMenuOpen === dealId) {
      setActionMenuOpen(null)
      setDropdownPosition(null)
    } else {
      const button = event.currentTarget
      const rect = button.getBoundingClientRect()
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
      
      setDropdownPosition({
        top: rect.bottom + scrollTop + 8,
        left: rect.left + scrollLeft,
        right: window.innerWidth - (rect.right + scrollLeft)
      })
      setActionMenuOpen(dealId)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActionMenuOpen(null)
        setDropdownPosition(null)
      }
    }

    if (actionMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [actionMenuOpen])

  // Server-side filtering is now handled by the API
  const filteredDeals = deals

  // Handle deal status changes
  const handleStatusChange = async (dealId: string, newStatus: string, reason?: string) => {
    try {
      const formData = new FormData()
      formData.append('status', newStatus)
      if (reason) {
        formData.append('statusReason', reason)
      }
      
      const response = await fetch(`/api/deals/${dealId}`, {
        method: 'PUT',
        body: formData
      })

      if (response.ok) {
        fetchDeals()
        setActionMenuOpen(null)
        setShowApprovalModal(false)
        setShowStatusModal(false)
      }
    } catch (error) {
      console.error('Error updating deal status:', error)
    }
  }

  // Handle date changes
  const handleDateChange = async (dealId: string, startDate: string, endDate: string) => {
    try {
      const formData = new FormData()
      formData.append('startDate', startDate)
      formData.append('endDate', endDate)
      
      const response = await fetch(`/api/deals/${dealId}`, {
        method: 'PUT',
        body: formData
      })

      if (response.ok) {
        fetchDeals()
        setShowDateModal(false)
      }
    } catch (error) {
      console.error('Error updating deal dates:', error)
    }
  }

  // Handle deal deletion
  const handleDeleteDeal = async (dealId: string, dealTitle: string) => {
    const confirmMessage = locale === 'ar' 
      ? `هل أنت متأكد من حذف الصفقة "${dealTitle}"؟ لا يمكن التراجع عن هذا الإجراء.`
      : `Are you sure you want to delete the deal "${dealTitle}"? This action cannot be undone.`
    
    if (confirm(confirmMessage)) {
      try {
        const response = await fetch(`/api/deals/${dealId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          fetchDeals()
          setActionMenuOpen(null)
          alert(locale === 'ar' ? 'تم حذف الصفقة بنجاح' : 'Deal deleted successfully')
        } else {
          const errorData = await response.json()
          alert(errorData.error || (locale === 'ar' ? 'فشل في حذف الصفقة' : 'Failed to delete deal'))
        }
      } catch (error) {
        console.error('Error deleting deal:', error)
        alert(locale === 'ar' ? 'خطأ في حذف الصفقة' : 'Error deleting deal')
      }
    }
  }

  // Handle deal archiving (set status to CANCELLED but keep data)
  const handleArchiveDeal = async (dealId: string, dealTitle: string) => {
    const confirmMessage = locale === 'ar' 
      ? `هل تريد أرشفة الصفقة "${dealTitle}"؟ سيتم إخفاؤها من المستثمرين.`
      : `Do you want to archive the deal "${dealTitle}"? It will be hidden from investors.`
    
    if (confirm(confirmMessage)) {
      try {
        await handleStatusChange(dealId, 'CANCELLED', 'Archived by admin')
        alert(locale === 'ar' ? 'تم أرشفة الصفقة بنجاح' : 'Deal archived successfully')
      } catch (error) {
        console.error('Error archiving deal:', error)
        alert(locale === 'ar' ? 'خطأ في أرشفة الصفقة' : 'Error archiving deal')
      }
    }
  }

  // Handle bulk actions
  const handleBulkStatusChange = async (status: string) => {
    const confirmMessage = locale === 'ar' 
      ? `هل تريد تغيير حالة ${selectedDeals.length} صفقة إلى ${status}؟`
      : `Do you want to change the status of ${selectedDeals.length} deals to ${status}?`
    
    if (confirm(confirmMessage)) {
      try {
        const promises = selectedDeals.map(dealId => handleStatusChange(dealId, status))
        await Promise.all(promises)
        setSelectedDeals([])
        setShowBulkActions(false)
        alert(locale === 'ar' ? 'تم تحديث الصفقات بنجاح' : 'Deals updated successfully')
      } catch (error) {
        console.error('Error updating deals:', error)
        alert(locale === 'ar' ? 'خطأ في تحديث الصفقات' : 'Error updating deals')
      }
    }
  }

  const handleBulkArchive = async () => {
    const confirmMessage = locale === 'ar' 
      ? `هل تريد أرشفة ${selectedDeals.length} صفقة؟`
      : `Do you want to archive ${selectedDeals.length} deals?`
    
    if (confirm(confirmMessage)) {
      try {
        const promises = selectedDeals.map(dealId => {
          const deal = deals.find(d => d.id === dealId)
          return handleStatusChange(dealId, 'CANCELLED', 'Bulk archived by admin')
        })
        await Promise.all(promises)
        setSelectedDeals([])
        setShowBulkActions(false)
        alert(locale === 'ar' ? 'تم أرشفة الصفقات بنجاح' : 'Deals archived successfully')
      } catch (error) {
        console.error('Error archiving deals:', error)
        alert(locale === 'ar' ? 'خطأ في أرشفة الصفقات' : 'Error archiving deals')
      }
    }
  }

  // Handle selection
  const handleSelectDeal = (dealId: string) => {
    setSelectedDeals(prev => 
      prev.includes(dealId) 
        ? prev.filter(id => id !== dealId)
        : [...prev, dealId]
    )
  }

  const handleSelectAll = () => {
    if (selectedDeals.length === filteredDeals.length) {
      setSelectedDeals([])
    } else {
      setSelectedDeals(filteredDeals.map(deal => deal.id))
    }
  }

  // Get status info
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return { color: 'text-gray-600 bg-gray-100', icon: FileText, label: locale === 'ar' ? 'مسودة' : 'Draft' }
      case 'PENDING':
        return { color: 'text-yellow-600 bg-yellow-100', icon: Clock, label: locale === 'ar' ? 'قيد المراجعة' : 'Pending Review' }
      case 'PUBLISHED':
        return { color: 'text-blue-600 bg-blue-100', icon: Eye, label: locale === 'ar' ? 'منشور' : 'Published' }
      case 'ACTIVE':
        return { color: 'text-green-600 bg-green-100', icon: PlayCircle, label: locale === 'ar' ? 'نشط' : 'Active' }
      case 'PAUSED':
        return { color: 'text-orange-600 bg-orange-100', icon: PauseCircle, label: locale === 'ar' ? 'متوقف' : 'Paused' }
      case 'FUNDED':
        return { color: 'text-purple-600 bg-purple-100', icon: Target, label: locale === 'ar' ? 'مكتمل التمويل' : 'Funded' }
      case 'COMPLETED':
        return { color: 'text-green-600 bg-green-100', icon: CheckCircle, label: locale === 'ar' ? 'مكتمل' : 'Completed' }
      case 'CANCELLED':
        return { color: 'text-red-600 bg-red-100', icon: StopCircle, label: locale === 'ar' ? 'ملغي' : 'Cancelled' }
      case 'REJECTED':
        return { color: 'text-red-600 bg-red-100', icon: XCircle, label: locale === 'ar' ? 'مرفوض' : 'Rejected' }
      default:
        return { color: 'text-gray-600 bg-gray-100', icon: Clock, label: status }
    }
  }

  // Use unified service for formatting
  const formatCurrency = (amount: number) => dealsService.formatCurrency(amount, locale)
  const formatDate = (dateString: string) => dealsService.formatDate(dateString, locale)

  // Get stats using unified service
  const stats = dealsService.getDealStats(deals)

  return (
    <AdminLayout
      title={locale === 'ar' ? 'إدارة الصفقات' : 'Deal Management'}
      subtitle={locale === 'ar' ? 'إدارة شاملة لجميع الصفقات والاستثمارات' : 'Comprehensive management of all deals and investments'}
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className={`${locale === 'ar' ? 'mr-4 text-right' : 'ml-4'}`}>
                  <p className={`text-sm font-medium text-gray-600 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                    {locale === 'ar' ? 'إجمالي الصفقات' : 'Total Deals'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className={`${locale === 'ar' ? 'mr-4 text-right' : 'ml-4'}`}>
                  <p className={`text-sm font-medium text-gray-600 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                    {locale === 'ar' ? 'قيد المراجعة' : 'Pending Review'}
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <PlayCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className={`${locale === 'ar' ? 'mr-4 text-right' : 'ml-4'}`}>
                  <p className={`text-sm font-medium text-gray-600 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                    {locale === 'ar' ? 'صفقات نشطة' : 'Active Deals'}
                  </p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div className={`${locale === 'ar' ? 'mr-4 text-right' : 'ml-4'}`}>
                  <p className={`text-sm font-medium text-gray-600 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                    {locale === 'ar' ? 'إجمالي التمويل' : 'Total Funding'}
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(stats.totalFunding)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Actions Bar */}
        {selectedDeals.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className={`flex items-center justify-between ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-4 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-sm font-medium text-blue-900 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                    {locale === 'ar' ? `تم تحديد ${selectedDeals.length} صفقة` : `${selectedDeals.length} deals selected`}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedDeals([])}
                    className="text-blue-700 border-blue-300 hover:bg-blue-100"
                  >
                    {locale === 'ar' ? 'إلغاء التحديد' : 'Clear Selection'}
                  </Button>
                </div>
                
                <div className={`flex items-center gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <Button
                    size="sm"
                    onClick={() => handleBulkStatusChange('ACTIVE')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <PlayCircle className="w-4 h-4 mr-1" />
                    {locale === 'ar' ? 'تنشيط' : 'Activate'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleBulkStatusChange('PAUSED')}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <PauseCircle className="w-4 h-4 mr-1" />
                    {locale === 'ar' ? 'إيقاف' : 'Pause'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleBulkArchive}
                    className="bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    <Archive className="w-4 h-4 mr-1" />
                    {locale === 'ar' ? 'أرشفة' : 'Archive'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Bulk Select */}
              <div className={`flex items-center gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                <input
                  type="checkbox"
                  checked={selectedDeals.length === filteredDeals.length && filteredDeals.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className={`text-sm text-gray-600 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                  {locale === 'ar' ? 'تحديد الكل' : 'Select All'}
                </span>
              </div>
              
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className={`absolute ${locale === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400`} />
                  <input
                    type="text"
                    placeholder={locale === 'ar' ? 'البحث في الصفقات...' : 'Search deals...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full ${locale === 'ar' ? 'pr-10 pl-4 text-right font-arabic' : 'pl-10 pr-4'} py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>
              
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${locale === 'ar' ? 'text-right font-arabic' : ''}`}
              >
                <option value="all">{locale === 'ar' ? 'جميع الحالات' : 'All Status'}</option>
                <option value="PENDING">{locale === 'ar' ? 'قيد المراجعة' : 'Pending Review'}</option>
                <option value="ACTIVE">{locale === 'ar' ? 'نشط' : 'Active'}</option>
                <option value="PAUSED">{locale === 'ar' ? 'متوقف' : 'Paused'}</option>
                <option value="FUNDED">{locale === 'ar' ? 'مكتمل التمويل' : 'Funded'}</option>
                <option value="COMPLETED">{locale === 'ar' ? 'مكتمل' : 'Completed'}</option>
                <option value="CANCELLED">{locale === 'ar' ? 'ملغي' : 'Cancelled'}</option>
                <option value="REJECTED">{locale === 'ar' ? 'مرفوض' : 'Rejected'}</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${locale === 'ar' ? 'text-right font-arabic' : ''}`}
              >
                <option value="all">{locale === 'ar' ? 'جميع الفئات' : 'All Categories'}</option>
                <option value="TECHNOLOGY">{locale === 'ar' ? 'التكنولوجيا' : 'Technology'}</option>
                <option value="ELECTRONICS">{locale === 'ar' ? 'الإلكترونيات' : 'Electronics'}</option>
                <option value="FINANCE">{locale === 'ar' ? 'المالية' : 'Finance'}</option>
                <option value="REAL_ESTATE">{locale === 'ar' ? 'العقارات' : 'Real Estate'}</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>

              {/* Refresh Button */}
              <Button
                onClick={fetchDeals}
                variant="outline"
                className="border-gray-300"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {locale === 'ar' ? 'تحديث' : 'Refresh'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Deals List/Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredDeals.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {locale === 'ar' ? 'لم يتم العثور على صفقات' : 'No deals found'}
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? (locale === 'ar' ? 'جرب تعديل البحث أو المرشحات' : 'Try adjusting your search or filters')
                  : (locale === 'ar' ? 'لم يتم إنشاء أي صفقات بعد' : 'No deals have been created yet')
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredDeals.map((deal) => {
              const statusInfo = getStatusInfo(deal.status)
              const StatusIcon = statusInfo.icon
              const fundingPercentage = (deal.currentFunding / deal.fundingGoal) * 100

              return (
                <Card key={deal.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className={`flex ${locale === 'ar' ? 'flex-row-reverse' : 'flex-row'} items-start justify-between`}>
                      {/* Checkbox */}
                      <div className={`flex items-center ${locale === 'ar' ? 'ml-4' : 'mr-4'}`}>
                        <input
                          type="checkbox"
                          checked={selectedDeals.includes(deal.id)}
                          onChange={() => handleSelectDeal(deal.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                      
                      {/* Deal Info */}
                      <div className={`flex-1 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                        <div className={`flex ${locale === 'ar' ? 'flex-row-reverse' : 'flex-row'} items-start gap-4`}>
                          {/* Deal Image */}
                          {deal.thumbnailImage && (
                            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={deal.thumbnailImage}
                                alt={deal.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          {/* Deal Details */}
                          <div className="flex-1 min-w-0">
                            <div className={`flex ${locale === 'ar' ? 'flex-row-reverse' : 'flex-row'} items-start justify-between mb-2`}>
                              <div className="flex-1">
                                <div className={`flex ${locale === 'ar' ? 'flex-row-reverse' : 'flex-row'} items-center gap-2 mb-1`}>
                                  <h3 className={`text-lg font-semibold text-gray-900 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                                    {deal.title}
                                  </h3>
                                  <div className="px-2 py-1 bg-gray-600 text-white rounded text-xs font-mono font-bold">
                                    ID: {deal.id.slice(-8)}
                                  </div>
                                </div>
                              </div>
                              <div className={`flex ${locale === 'ar' ? 'flex-row-reverse' : 'flex-row'} items-center gap-2 ${locale === 'ar' ? 'mr-4' : 'ml-4'}`}>
                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {statusInfo.label}
                                </div>
                                {deal.featured && (
                                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    <Star className="w-3 h-3 mr-1" />
                                    {locale === 'ar' ? 'مميز' : 'Featured'}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <p className={`text-gray-600 text-sm mb-3 line-clamp-2 ${locale === 'ar' ? 'font-arabic' : ''}`}>
                              {deal.description}
                            </p>
                            
                            {/* Deal Stats */}
                            <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 text-sm ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                              <div>
                                <span className="text-gray-500">{locale === 'ar' ? 'الهدف' : 'Goal'}:</span>
                                <div className="font-semibold">{formatCurrency(deal.fundingGoal)}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">{locale === 'ar' ? 'التمويل الحالي' : 'Current'}:</span>
                                <div className="font-semibold text-green-600">{formatCurrency(deal.currentFunding)}</div>
                              </div>
                              <div>
                                <span className="text-gray-500">{locale === 'ar' ? 'العائد المتوقع' : 'Return'}:</span>
                                <div className="font-semibold text-green-600">{deal.expectedReturn}%</div>
                              </div>
                              <div>
                                <span className="text-gray-500">{locale === 'ar' ? 'المستثمرون' : 'Investors'}:</span>
                                <div className="font-semibold">{deal.investorCount || 0}</div>
                              </div>
                            </div>
                            
                            {/* Deal Duration */}
                            {(deal.startDate || deal.endDate) && (
                              <div className={`mt-3 p-3 bg-blue-50 rounded-lg ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="w-4 h-4 text-blue-600" />
                                  <span className="text-blue-700 font-medium">
                                    {locale === 'ar' ? 'مدة المشروع' : 'Deal Duration'}:
                                  </span>
                                </div>
                                <div className="text-sm text-blue-800 mt-1">
                                  {deal.startDate && deal.endDate ? (
                                    <>
                                      {new Date(deal.startDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                      {' → '}
                                      {new Date(deal.endDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </>
                                  ) : deal.startDate ? (
                                    <>
                                      {locale === 'ar' ? 'يبدأ في' : 'Starts'}: {new Date(deal.startDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </>
                                  ) : deal.endDate ? (
                                    <>
                                      {locale === 'ar' ? 'ينتهي في' : 'Ends'}: {new Date(deal.endDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </>
                                  ) : null}
                                </div>
                              </div>
                            )}
                            
                            {/* Progress Bar */}
                            <div className="mt-3">
                              <div className={`flex justify-between text-xs mb-1 ${locale === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <span className="text-gray-500">{locale === 'ar' ? 'التقدم' : 'Progress'}</span>
                                <span className="font-medium">{Math.round(fundingPercentage)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
                                />
                              </div>
                            </div>
                            
                            {/* Dates */}
                            <div className={`flex ${locale === 'ar' ? 'flex-row-reverse' : 'flex-row'} gap-4 mt-3 text-xs text-gray-500`}>
                              {deal.startDate && (
                                <span>
                                  {locale === 'ar' ? 'البداية' : 'Start'}: {formatDate(deal.startDate)}
                                </span>
                              )}
                              {deal.endDate && (
                                <span>
                                  {locale === 'ar' ? 'النهاية' : 'End'}: {formatDate(deal.endDate)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Menu */}
                      <div className="relative">
                        <button
                          ref={buttonRef}
                          onClick={(e) => handleDropdownToggle(deal.id, e)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Approval Modal */}
        {showApprovalModal && selectedDeal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardContent className="p-6">
                <h3 className={`text-lg font-semibold mb-4 ${locale === 'ar' ? 'text-right font-arabic' : ''}`}>
                  {locale === 'ar' ? 'موافقة على الصفقة' : 'Approve Deal'}
                </h3>
                <p className={`text-gray-600 mb-6 ${locale === 'ar' ? 'text-right font-arabic' : ''}`}>
                  {locale === 'ar' ? 'هل تريد الموافقة على صفقة' : 'Do you want to approve the deal'} "{selectedDeal.title}"?
                </p>
                <div className={`flex gap-3 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <Button
                    onClick={() => handleStatusChange(selectedDeal.id, 'ACTIVE')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {locale === 'ar' ? 'موافقة وتنشيط' : 'Approve & Activate'}
                  </Button>
                  <Button
                    onClick={() => setShowApprovalModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Date Modal */}
        {showDateModal && selectedDeal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardContent className="p-6">
                <h3 className={`text-lg font-semibold mb-4 ${locale === 'ar' ? 'text-right font-arabic' : ''}`}>
                  {locale === 'ar' ? 'تعديل تواريخ الصفقة' : 'Edit Deal Dates'}
                </h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    const startDate = formData.get('startDate') as string
                    const endDate = formData.get('endDate') as string
                    handleDateChange(selectedDeal.id, startDate, endDate)
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-1 ${locale === 'ar' ? 'text-right font-arabic' : ''}`}>
                      {locale === 'ar' ? 'تاريخ البداية' : 'Start Date'}
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      defaultValue={selectedDeal.startDate?.split('T')[0]}
                      className={`w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${locale === 'ar' ? 'text-right' : ''}`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-1 ${locale === 'ar' ? 'text-right font-arabic' : ''}`}>
                      {locale === 'ar' ? 'تاريخ النهاية' : 'End Date'}
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      defaultValue={selectedDeal.endDate?.split('T')[0]}
                      className={`w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${locale === 'ar' ? 'text-right' : ''}`}
                      required
                    />
                  </div>
                  <div className={`flex gap-3 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                    <Button type="submit" className="flex-1">
                      {locale === 'ar' ? 'حفظ' : 'Save'}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowDateModal(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Status Modal */}
        {showStatusModal && selectedDeal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardContent className="p-6">
                <h3 className={`text-lg font-semibold mb-4 ${locale === 'ar' ? 'text-right font-arabic' : ''}`}>
                  {locale === 'ar' ? 'تغيير حالة الصفقة' : 'Change Deal Status'}
                </h3>
                <div className="space-y-2">
                  {['DRAFT', 'PENDING', 'ACTIVE', 'PAUSED', 'FUNDED', 'COMPLETED', 'CANCELLED'].map((status) => {
                    const statusInfo = getStatusInfo(status)
                    const StatusIcon = statusInfo.icon
                    return (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(selectedDeal.id, status)}
                        className={`w-full flex items-center p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 ${locale === 'ar' ? 'flex-row-reverse text-right' : ''}`}
                      >
                        <StatusIcon className="w-4 h-4 mr-3" />
                        <span className={locale === 'ar' ? 'font-arabic' : ''}>{statusInfo.label}</span>
                      </button>
                    )
                  })}
                </div>
                <Button
                  onClick={() => setShowStatusModal(false)}
                  variant="outline"
                  className="w-full mt-4"
                >
                  {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Timeline Modal */}
        {showTimelineModal && selectedDeal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardContent className="p-6">
                <div className={`flex items-center justify-between mb-6 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <h3 className={`text-lg font-semibold ${locale === 'ar' ? 'font-arabic' : ''}`}>
                    {locale === 'ar' ? 'إدارة الجدول الزمني للصفقة' : 'Manage Deal Timeline'}: {selectedDeal.title}
                  </h3>
                  <Button
                    onClick={() => setShowTimelineModal(false)}
                    variant="outline"
                    className="p-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <DealTimeline 
                  dealId={selectedDeal.id} 
                  isOwner={true}
                  className="bg-white border border-gray-200 rounded-lg"
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Portal-based Dropdown Menu */}
        {actionMenuOpen && dropdownPosition && typeof window !== 'undefined' && createPortal(
          <div 
            ref={dropdownRef}
            className="fixed w-64 bg-white rounded-lg shadow-2xl border border-gray-200"
            style={{ 
              top: dropdownPosition.top,
              left: locale === 'ar' ? 'auto' : dropdownPosition.left,
              right: locale === 'ar' ? dropdownPosition.right : 'auto',
              zIndex: 99999
            }}
          >
            <div className="py-2">
              {(() => {
                const deal = deals.find(d => d.id === actionMenuOpen)
                if (!deal) return null
                
                return (
                  <>
                    {/* Quick Actions */}
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h4 className={`text-sm font-medium text-gray-900 ${locale === 'ar' ? 'text-right font-arabic' : ''}`}>
                        {locale === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
                      </h4>
                    </div>
                    
                    {/* View Deal */}
                    <button
                      onClick={() => {
                        router.push(`/admin/deals/${deal.id}`)
                        setActionMenuOpen(null)
                        setDropdownPosition(null)
                      }}
                      className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${locale === 'ar' ? 'flex-row-reverse text-right' : ''}`}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      <span className={locale === 'ar' ? 'font-arabic' : ''}>{locale === 'ar' ? 'عرض الصفقة' : 'View Deal'}</span>
                    </button>
                    
                    {/* Approval Actions */}
                    {deal.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedDeal(deal)
                            setShowApprovalModal(true)
                            setActionMenuOpen(null)
                            setDropdownPosition(null)
                          }}
                          className={`flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50 ${locale === 'ar' ? 'flex-row-reverse text-right' : ''}`}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          <span className={locale === 'ar' ? 'font-arabic' : ''}>{locale === 'ar' ? 'موافقة' : 'Approve'}</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            handleStatusChange(deal.id, 'REJECTED')
                            setActionMenuOpen(null)
                            setDropdownPosition(null)
                          }}
                          className={`flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 ${locale === 'ar' ? 'flex-row-reverse text-right' : ''}`}
                        >
                          <X className="w-4 h-4 mr-2" />
                          <span className={locale === 'ar' ? 'font-arabic' : ''}>{locale === 'ar' ? 'رفض' : 'Reject'}</span>
                        </button>
                      </>
                    )}
                    
                    {/* Status Controls */}
                    {deal.status === 'ACTIVE' && (
                      <button
                        onClick={() => {
                          handleStatusChange(deal.id, 'PAUSED')
                          setActionMenuOpen(null)
                          setDropdownPosition(null)
                        }}
                        className={`flex items-center w-full px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 ${locale === 'ar' ? 'flex-row-reverse text-right' : ''}`}
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        <span className={locale === 'ar' ? 'font-arabic' : ''}>{locale === 'ar' ? 'إيقاف مؤقت' : 'Pause Deal'}</span>
                      </button>
                    )}
                    
                    {deal.status === 'PAUSED' && (
                      <button
                        onClick={() => {
                          handleStatusChange(deal.id, 'ACTIVE')
                          setActionMenuOpen(null)
                          setDropdownPosition(null)
                        }}
                        className={`flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50 ${locale === 'ar' ? 'flex-row-reverse text-right' : ''}`}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        <span className={locale === 'ar' ? 'font-arabic' : ''}>{locale === 'ar' ? 'استئناف' : 'Resume Deal'}</span>
                      </button>
                    )}
                    
                    {/* Date Management */}
                    <button
                      onClick={() => {
                        setSelectedDeal(deal)
                        setShowDateModal(true)
                        setActionMenuOpen(null)
                        setDropdownPosition(null)
                      }}
                      className={`flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 ${locale === 'ar' ? 'flex-row-reverse text-right' : ''}`}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className={locale === 'ar' ? 'font-arabic' : ''}>{locale === 'ar' ? 'تعديل التواريخ' : 'Edit Dates'}</span>
                    </button>
                    
                    {/* Timeline Management */}
                    <button
                      onClick={() => {
                        setSelectedDeal(deal)
                        setShowTimelineModal(true)
                        setActionMenuOpen(null)
                        setDropdownPosition(null)
                      }}
                      className={`flex items-center w-full px-4 py-2 text-sm text-teal-600 hover:bg-teal-50 ${locale === 'ar' ? 'flex-row-reverse text-right' : ''}`}
                    >
                      <GanttChart className="w-4 h-4 mr-2" />
                      <span className={locale === 'ar' ? 'font-arabic' : ''}>{locale === 'ar' ? 'إدارة الجدول الزمني' : 'Manage Timeline'}</span>
                    </button>
                    
                    {/* Advanced Status */}
                    <button
                      onClick={() => {
                        setSelectedDeal(deal)
                        setShowStatusModal(true)
                        setActionMenuOpen(null)
                        setDropdownPosition(null)
                      }}
                      className={`flex items-center w-full px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 ${locale === 'ar' ? 'flex-row-reverse text-right' : ''}`}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      <span className={locale === 'ar' ? 'font-arabic' : ''}>{locale === 'ar' ? 'تغيير الحالة' : 'Change Status'}</span>
                    </button>
                    
                    <div className="border-t border-gray-100 my-2"></div>
                    
                    {/* Archive Action */}
                    <button
                      onClick={() => {
                        handleArchiveDeal(deal.id, deal.title)
                        setActionMenuOpen(null)
                        setDropdownPosition(null)
                      }}
                      className={`flex items-center w-full px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 ${locale === 'ar' ? 'flex-row-reverse text-right' : ''}`}
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      <span className={locale === 'ar' ? 'font-arabic' : ''}>{locale === 'ar' ? 'أرشفة الصفقة' : 'Archive Deal'}</span>
                    </button>
                    
                    {/* Dangerous Actions */}
                    <button
                      onClick={() => {
                        if (confirm(locale === 'ar' ? 'هل أنت متأكد من إلغاء هذه الصفقة؟' : 'Are you sure you want to cancel this deal?')) {
                          handleStatusChange(deal.id, 'CANCELLED')
                          setActionMenuOpen(null)
                          setDropdownPosition(null)
                        }
                      }}
                      className={`flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 ${locale === 'ar' ? 'flex-row-reverse text-right' : ''}`}
                    >
                      <StopCircle className="w-4 h-4 mr-2" />
                      <span className={locale === 'ar' ? 'font-arabic' : ''}>{locale === 'ar' ? 'إلغاء الصفقة' : 'Cancel Deal'}</span>
                    </button>
                    
                    {/* Delete Action - Only for deals without investments */}
                    <button
                      onClick={() => {
                        handleDeleteDeal(deal.id, deal.title)
                        setActionMenuOpen(null)
                        setDropdownPosition(null)
                      }}
                      className={`flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-100 ${locale === 'ar' ? 'flex-row-reverse text-right' : ''}`}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      <span className={locale === 'ar' ? 'font-arabic' : ''}>{locale === 'ar' ? 'حذف الصفقة' : 'Delete Deal'}</span>
                    </button>
                  </>
                )
              })()}
            </div>
          </div>,
          document.body
        )}
      </div>
    </AdminLayout>
  )
}

