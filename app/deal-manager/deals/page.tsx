'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DealManagerLayout from '../../components/layout/DealManagerLayout'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import DealForm from '../../components/forms/DealForm'
import { 
  Plus, Search, Filter, Eye, Edit, Trash2, Play, Pause, 
  TrendingUp, Users, Calendar, DollarSign, AlertCircle, CheckCircle,
  BarChart3, Target, Building2
} from 'lucide-react'

interface Deal {
  id: string
  title: string
  category: string
  fundingGoal: number
  currentFunding: number
  expectedReturn: number
  duration: number
  riskLevel: string
  status: string
  thumbnailImage: string
  investorCount: number
  partner?: {
    companyName: string
  }
  owner: {
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

const ManageDealsPage = () => {
  const { data: session } = useSession()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddDeal, setShowAddDeal] = useState(false)
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const dealsPerPage = 12

  // Fetch deals
  useEffect(() => {
    fetchDeals()
  }, [])

  const fetchDeals = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (filterStatus !== 'all') params.append('status', filterStatus)
      params.append('limit', '50')

      const response = await fetch(`/api/deals?${params}`, {
        credentials: 'include',
        cache: 'no-store'
      })

      if (response.ok) {
        const data = await response.json()
        setDeals(data.deals || [])
      }
    } catch (error) {
      console.error('Error fetching deals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (dealId: string, newStatus: string) => {
    try {
      const formData = new FormData()
      formData.append('status', newStatus)

      const response = await fetch(`/api/deals/${dealId}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include'
      })

      if (response.ok) {
        await fetchDeals()
      }
    } catch (error) {
      console.error('Error updating deal status:', error)
    }
  }

  const handleDeleteDeal = async (dealId: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) return

    try {
      const response = await fetch(`/api/deals/${dealId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        await fetchDeals()
      }
    } catch (error) {
      console.error('Error deleting deal:', error)
    }
  }

  // Filter and paginate deals
  const filteredDeals = deals.filter(deal => {
    const matchesSearch = searchTerm === '' || 
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (deal.partner?.companyName && deal.partner.companyName.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = filterStatus === 'all' || deal.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredDeals.length / dealsPerPage)
  const paginatedDeals = filteredDeals.slice(
    (currentPage - 1) * dealsPerPage,
    currentPage * dealsPerPage
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800'
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800'
      case 'FUNDED': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return <CheckCircle className="w-4 h-4" />
      case 'DRAFT': return <Edit className="w-4 h-4" />
      case 'PAUSED': return <Pause className="w-4 h-4" />
      case 'FUNDED': return <Target className="w-4 h-4" />
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  if (showAddDeal) {
    return (
      <DealManagerLayout
        title="Add New Deal"
        subtitle="Create a new investment opportunity"
      >
        <DealForm
          mode="create"
          onSubmit={async (formData: FormData) => {
            try {
              const response = await fetch('/api/deals', {
                method: 'POST',
                body: formData,
                credentials: 'include'
              })
              if (response.ok) {
                setShowAddDeal(false)
                fetchDeals()
              }
            } catch (error) {
              console.error('Error creating deal:', error)
            }
          }}
          onCancel={() => setShowAddDeal(false)}
        />
      </DealManagerLayout>
    )
  }

  if (editingDeal) {
    return (
      <DealManagerLayout
        title="Edit Deal"
        subtitle={`Editing: ${editingDeal.title}`}
      >
        <DealForm
          deal={editingDeal}
          mode="edit"
          onSubmit={async (formData: FormData) => {
            try {
              const response = await fetch(`/api/deals/${editingDeal.id}`, {
                method: 'PUT',
                body: formData,
                credentials: 'include'
              })
              if (response.ok) {
                setEditingDeal(null)
                fetchDeals()
              }
            } catch (error) {
              console.error('Error updating deal:', error)
            }
          }}
          onCancel={() => setEditingDeal(null)}
        />
      </DealManagerLayout>
    )
  }

  return (
    <DealManagerLayout
      title="Manage Deals"
      subtitle="Create, edit, and manage investment opportunities"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Deals</p>
                  <p className="text-2xl font-bold text-blue-900">{deals.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Published</p>
                  <p className="text-2xl font-bold text-green-900">
                    {deals.filter(d => d.status === 'PUBLISHED').length}
                  </p>
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
                  <p className="text-sm font-medium text-yellow-700">Draft</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {deals.filter(d => d.status === 'DRAFT').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Edit className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Total Value</p>
                  <p className="text-2xl font-bold text-purple-900">
                    ${deals.reduce((sum, deal) => sum + parseFloat(deal.fundingGoal.toString()), 0).toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
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
                    placeholder="Search deals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="PAUSED">Paused</option>
                  <option value="FUNDED">Funded</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Export
                </Button>
                <Button 
                  className="flex items-center gap-2"
                  onClick={() => setShowAddDeal(true)}
                >
                  <Plus className="w-4 h-4" />
                  Add Deal
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deals Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedDeals.map((deal) => (
                <Card key={deal.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    {/* Deal Image */}
                    <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                      {deal.thumbnailImage ? (
                        <img
                          src={deal.thumbnailImage}
                          alt={deal.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                          <Building2 className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deal.status)}`}>
                          {getStatusIcon(deal.status)}
                          {deal.status}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="absolute top-3 right-3 flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
                          onClick={() => window.open(`/deals/${deal.id}`, '_blank')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
                          onClick={() => setEditingDeal(deal)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Deal Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                          {deal.title}
                        </h3>
                      </div>
                      
                      <p className="text-xs text-gray-500 mb-3">{deal.category} • {deal.partner?.companyName || 'No Partner'}</p>
                      
                      {/* Progress */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{Math.round((deal.currentFunding / deal.fundingGoal) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min((deal.currentFunding / deal.fundingGoal) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">${(deal.fundingGoal / 1000).toFixed(0)}K</div>
                          <div className="text-gray-500">Goal</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">{deal.expectedReturn}%</div>
                          <div className="text-gray-500">Return</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">{deal.investorCount}</div>
                          <div className="text-gray-500">Investors</div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4">
                        {deal.status === 'DRAFT' && (
                          <Button
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => handleStatusChange(deal.id, 'PUBLISHED')}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Publish
                          </Button>
                        )}
                        {deal.status === 'PUBLISHED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs"
                            onClick={() => handleStatusChange(deal.id, 'PAUSED')}
                          >
                            <Pause className="w-3 h-3 mr-1" />
                            Pause
                          </Button>
                        )}
                        {deal.status === 'PAUSED' && (
                          <Button
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => handleStatusChange(deal.id, 'PUBLISHED')}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Resume
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50 text-xs"
                          onClick={() => handleDeleteDeal(deal.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {paginatedDeals.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No deals found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first deal.'
                }
              </p>
              {(!searchTerm && filterStatus === 'all') && (
                <Button onClick={() => setShowAddDeal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Deal
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DealManagerLayout>
  )
}

export default ManageDealsPage