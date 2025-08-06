'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import AdminLayout from '../../components/layout/AdminLayout'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { 
  Building2, Users, DollarSign, TrendingUp, Search, Filter, 
  Plus, Eye, Edit, Trash2, Mail, Phone, MapPin, Calendar,
  CheckCircle, Clock, AlertCircle, X, Star, Award
} from 'lucide-react'

interface Partner {
  id: string
  companyName: string
  contactName: string
  email: string
  phone?: string
  address?: string
  website?: string
  industry: string
  status: 'active' | 'pending' | 'suspended' | 'inactive'
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  joinedAt: string
  lastActive: string
  stats: {
    totalDeals: number
    totalCommission: number
    successRate: number
    activeDeals: number
  }
  documents: {
    businessLicense: boolean
    taxCertificate: boolean
    bankDetails: boolean
    partnership: boolean
  }
}

const PartnersPage = () => {
  const { data: session } = useSession()
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [tierFilter, setTierFilter] = useState<string>('all')
  const [industryFilter, setIndustryFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // Fetch real partners from API
  const fetchPartners = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: '1',
        limit: '50'
      })
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      
      if (tierFilter !== 'all') {
        params.append('tier', tierFilter)
      }
      
      if (industryFilter !== 'all') {
        params.append('industry', industryFilter)
      }
      
      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await fetch(`/api/admin/partners?${params}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setPartners(data.partners)
      } else {
        console.error('Error fetching partners:', response.statusText)
        setPartners([])
      }
    } catch (error) {
      console.error('Error fetching partners:', error)
      setPartners([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPartners()
  }, [statusFilter, tierFilter, industryFilter, searchTerm])

  const handleViewPartner = async (partnerId: string) => {
    try {
      const response = await fetch(`/api/admin/partners/${partnerId}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const partner = await response.json()
        setSelectedPartner(partner)
        setShowViewModal(true)
      } else {
        alert('Error fetching partner details')
      }
    } catch (error) {
      console.error('Error fetching partner:', error)
      alert('Error fetching partner details')
    }
  }

  const handleEditPartner = async (partnerId: string) => {
    try {
      const response = await fetch(`/api/admin/partners/${partnerId}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const partner = await response.json()
        setSelectedPartner(partner)
        setShowEditModal(true)
      } else {
        alert('Error fetching partner details')
      }
    } catch (error) {
      console.error('Error fetching partner:', error)
      alert('Error fetching partner details')
    }
  }

  const handleUpdatePartnerStatus = async (partnerId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/partners/${partnerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      })
      
      if (response.ok) {
        alert(`Partner ${status.toLowerCase()} successfully!`)
        fetchPartners() // Refresh the list
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating partner:', error)
      alert('Error updating partner')
    }
  }

  const handleDeletePartner = async (partnerId: string) => {
    if (!confirm('Are you sure you want to delete this partner? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/partners/${partnerId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (response.ok) {
        alert('Partner deleted successfully!')
        fetchPartners() // Refresh the list
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting partner:', error)
      alert('Error deleting partner')
    }
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
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString))
  }

  const getStatusBadge = (status: Partner['status']) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'suspended':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'inactive':
        return `${baseClasses} bg-gray-100 text-gray-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getTierBadge = (tier: Partner['tier']) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
    switch (tier) {
      case 'platinum':
        return `${baseClasses} bg-purple-100 text-purple-800`
      case 'gold':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'silver':
        return `${baseClasses} bg-gray-100 text-gray-800`
      case 'bronze':
        return `${baseClasses} bg-orange-100 text-orange-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getTierIcon = (tier: Partner['tier']) => {
    switch (tier) {
      case 'platinum':
        return <Award className="w-4 h-4 text-purple-600" />
      case 'gold':
        return <Award className="w-4 h-4 text-yellow-600" />
      case 'silver':
        return <Award className="w-4 h-4 text-gray-600" />
      case 'bronze':
        return <Award className="w-4 h-4 text-orange-600" />
      default:
        return <Award className="w-4 h-4 text-gray-600" />
    }
  }

  // Calculate summary statistics
  const activePartners = partners.filter(p => p.status === 'active').length
  const pendingPartners = partners.filter(p => p.status === 'pending').length
  const totalCommissions = partners.reduce((sum, p) => sum + p.stats.totalCommission, 0)
  const totalDeals = partners.reduce((sum, p) => sum + p.stats.totalDeals, 0)
  const avgSuccessRate = partners.length > 0 
    ? partners.reduce((sum, p) => sum + p.stats.successRate, 0) / partners.length 
    : 0

  // Filter partners
  const filteredPartners = partners.filter(partner => {
    const matchesSearch = searchTerm === '' || 
      partner.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.industry.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || partner.status === statusFilter
    const matchesTier = tierFilter === 'all' || partner.tier === tierFilter
    const matchesIndustry = industryFilter === 'all' || partner.industry === industryFilter

    return matchesSearch && matchesStatus && matchesTier && matchesIndustry
  })

  // Get unique industries for filter
  const industries = Array.from(new Set(partners.map(p => p.industry)))

  if (loading) {
    return (
      <AdminLayout
        title="Partner Management"
        subtitle="Manage business partnerships and collaborations"
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title="Partner Management"
      subtitle="Manage business partnerships and collaborations"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Active Partners</p>
                  <p className="text-2xl font-bold text-blue-900">{activePartners}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">Pending</p>
                  <p className="text-2xl font-bold text-yellow-900">{pendingPartners}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Total Commissions</p>
                  <p className="text-2xl font-bold text-green-900">{formatCurrency(totalCommissions)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Total Deals</p>
                  <p className="text-2xl font-bold text-purple-900">{totalDeals}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-700">Avg Success Rate</p>
                  <p className="text-2xl font-bold text-indigo-900">{avgSuccessRate.toFixed(1)}%</p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search partners..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                  <option value="inactive">Inactive</option>
                </select>

                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Tiers</option>
                  <option value="platinum">Platinum</option>
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                  <option value="bronze">Bronze</option>
                </select>

                <select
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Industries</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Export
                </Button>
                <Button 
                  className="flex items-center gap-2"
                  onClick={() => setShowAddModal(true)}
                >
                  <Plus className="w-4 h-4" />
                  Add Partner
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map((partner) => (
            <Card key={partner.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {partner.companyName}
                      </h3>
                      <p className="text-sm text-gray-600">{partner.contactName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTierIcon(partner.tier)}
                    <span className={getTierBadge(partner.tier)}>
                      {partner.tier.charAt(0).toUpperCase() + partner.tier.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span className="truncate">{partner.email}</span>
                  </div>
                  {partner.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{partner.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="truncate">{partner.industry}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Joined {formatDate(partner.joinedAt)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">{partner.stats.totalDeals}</div>
                    <div className="text-xs text-gray-600">Total Deals</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{formatCurrency(partner.stats.totalCommission)}</div>
                    <div className="text-xs text-gray-600">Commission</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">{partner.stats.successRate}%</div>
                    <div className="text-xs text-gray-600">Success Rate</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">{partner.stats.activeDeals}</div>
                    <div className="text-xs text-gray-600">Active</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className={getStatusBadge(partner.status)}>
                    {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                  </span>
                  <div className="text-xs text-gray-500">
                    Last active: {formatDate(partner.lastActive)}
                  </div>
                </div>

                {/* Document Status */}
                <div className="mb-4">
                  <div className="text-xs text-gray-600 mb-2">Documents:</div>
                  <div className="flex items-center gap-1">
                    {Object.entries(partner.documents).map(([doc, completed]) => (
                      <div
                        key={doc}
                        className={`w-3 h-3 rounded-full ${
                          completed ? 'bg-green-400' : 'bg-gray-300'
                        }`}
                        title={doc.replace(/([A-Z])/g, ' $1').trim()}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewPartner(partner.id)}
                    title="View Details"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditPartner(partner.id)}
                    title="Edit Partner"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {partner.status === 'pending' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-green-600 border-green-300 hover:bg-green-50"
                      onClick={() => handleUpdatePartnerStatus(partner.id, 'active')}
                      title="Approve Partner"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  )}
                  {partner.status === 'active' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => handleUpdatePartnerStatus(partner.id, 'suspended')}
                      title="Suspend Partner"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 border-red-300 hover:bg-red-50"
                    onClick={() => handleDeletePartner(partner.id)}
                    title="Delete Partner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPartners.length === 0 && (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No partners found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No partners match your current filters.
                </p>
                <div className="mt-6">
                  <Button onClick={() => setShowAddModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Partner
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}

export default PartnersPage
