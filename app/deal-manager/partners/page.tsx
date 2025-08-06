'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DealManagerLayout from '../../components/layout/DealManagerLayout'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { 
  Plus, Search, Filter, Eye, Edit, Trash2, Mail, Phone, 
  Building2, Users, TrendingUp, DollarSign, Star, Award,
  CheckCircle, Clock, AlertCircle, MapPin, Calendar, Briefcase
} from 'lucide-react'

interface Partner {
  id: string
  companyName: string
  contactName: string
  email: string
  phone?: string
  industry: string
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'INACTIVE'
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'
  totalCommission: number
  successRate: number
  businessLicense?: string
  taxCertificate?: string
  bankDetails?: string
  partnershipAgreement?: string
  lastActive?: string
  joinedAt: string
  projects: any[]
}

const PartnerManagementPage = () => {
  const { data: session } = useSession()
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterTier, setFilterTier] = useState('all')
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // Fetch partners
  useEffect(() => {
    fetchPartners()
  }, [])

  const fetchPartners = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (filterTier !== 'all') params.append('tier', filterTier)

      const response = await fetch(`/api/admin/partners?${params}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setPartners(data.partners || [])
      }
    } catch (error) {
      console.error('Error fetching partners:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewPartner = (partner: Partner) => {
    setSelectedPartner(partner)
    setShowViewModal(true)
  }

  const handleEditPartner = (partner: Partner) => {
    setSelectedPartner(partner)
    setShowEditModal(true)
  }

  const handleUpdatePartnerStatus = async (partnerId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/partners/${partnerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        await fetchPartners()
      }
    } catch (error) {
      console.error('Error updating partner status:', error)
    }
  }

  const handleDeletePartner = async (partnerId: string) => {
    if (!confirm('Are you sure you want to delete this partner?')) return

    try {
      const response = await fetch(`/api/admin/partners/${partnerId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        await fetchPartners()
      }
    } catch (error) {
      console.error('Error deleting partner:', error)
    }
  }

  // Filter partners
  const filteredPartners = partners.filter(partner => {
    const matchesSearch = searchTerm === '' || 
      partner.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.industry.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || partner.status === filterStatus
    const matchesTier = filterTier === 'all' || partner.tier === filterTier

    return matchesSearch && matchesStatus && matchesTier
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'SUSPENDED': return 'bg-red-100 text-red-800'
      case 'INACTIVE': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="w-4 h-4" />
      case 'PENDING': return <Clock className="w-4 h-4" />
      case 'SUSPENDED': return <AlertCircle className="w-4 h-4" />
      case 'INACTIVE': return <AlertCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'PLATINUM': return 'bg-purple-100 text-purple-800'
      case 'GOLD': return 'bg-yellow-100 text-yellow-800'
      case 'SILVER': return 'bg-gray-100 text-gray-800'
      case 'BRONZE': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString))
  }

  return (
    <DealManagerLayout
      title="Partner Management"
      subtitle="Manage and monitor partner relationships"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Partners</p>
                  <p className="text-2xl font-bold text-blue-900">{partners.length}</p>
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
                  <p className="text-sm font-medium text-green-700">Active Partners</p>
                  <p className="text-2xl font-bold text-green-900">
                    {partners.filter(p => p.status === 'ACTIVE').length}
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
                  <p className="text-sm font-medium text-yellow-700">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {partners.filter(p => p.status === 'PENDING').length}
                  </p>
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
                  <p className="text-sm font-medium text-purple-700">Total Commission</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatCurrency(partners.reduce((sum, p) => sum + p.totalCommission, 0))}
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
                    placeholder="Search partners..."
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
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING">Pending</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="INACTIVE">Inactive</option>
                </select>

                <select
                  value={filterTier}
                  onChange={(e) => setFilterTier(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Tiers</option>
                  <option value="PLATINUM">Platinum</option>
                  <option value="GOLD">Gold</option>
                  <option value="SILVER">Silver</option>
                  <option value="BRONZE">Bronze</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Export
                </Button>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Partner
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partners Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPartners.map((partner) => (
              <Card key={partner.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{partner.companyName}</h3>
                        <p className="text-xs text-gray-500">{partner.industry}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(partner.status)}`}>
                        {getStatusIcon(partner.status)}
                        {partner.status}
                      </span>
                      <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium ${getTierColor(partner.tier)}`}>
                        <Star className="w-3 h-3 mr-1" />
                        {partner.tier}
                      </span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{partner.contactName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 truncate">{partner.email}</span>
                    </div>
                    {partner.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{partner.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{partner.projects?.length || 0}</div>
                      <div className="text-xs text-gray-500">Projects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{partner.successRate}%</div>
                      <div className="text-xs text-gray-500">Success Rate</div>
                    </div>
                  </div>

                  {/* Commission */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Commission</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(partner.totalCommission)}
                      </span>
                    </div>
                  </div>

                  {/* Joined Date */}
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      Joined {formatDate(partner.joinedAt)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => handleViewPartner(partner)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => handleEditPartner(partner)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    {partner.status === 'PENDING' && (
                      <Button
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => handleUpdatePartnerStatus(partner.id, 'ACTIVE')}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredPartners.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No partners found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== 'all' || filterTier !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding your first partner.'
                }
              </p>
              {(!searchTerm && filterStatus === 'all' && filterTier === 'all') && (
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Partner
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* View Partner Modal */}
        {showViewModal && selectedPartner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Partner Details</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowViewModal(false)}
                  >
                    ×
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Company Info */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Company Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                        <p className="text-sm text-gray-900">{selectedPartner.companyName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                        <p className="text-sm text-gray-900">{selectedPartner.industry}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPartner.status)}`}>
                          {getStatusIcon(selectedPartner.status)}
                          {selectedPartner.status}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTierColor(selectedPartner.tier)}`}>
                          <Star className="w-3 h-3" />
                          {selectedPartner.tier}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Contact Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                        <p className="text-sm text-gray-900">{selectedPartner.contactName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <p className="text-sm text-gray-900">{selectedPartner.email}</p>
                      </div>
                      {selectedPartner.phone && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <p className="text-sm text-gray-900">{selectedPartner.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Performance</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-gray-900">{selectedPartner.projects?.length || 0}</div>
                        <div className="text-sm text-gray-600">Total Projects</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-gray-900">{selectedPartner.successRate}%</div>
                        <div className="text-sm text-gray-600">Success Rate</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-gray-900">{formatCurrency(selectedPartner.totalCommission)}</div>
                        <div className="text-sm text-gray-600">Total Commission</div>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Timeline</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Joined Date</label>
                        <p className="text-sm text-gray-900">{formatDate(selectedPartner.joinedAt)}</p>
                      </div>
                      {selectedPartner.lastActive && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last Active</label>
                          <p className="text-sm text-gray-900">{formatDate(selectedPartner.lastActive)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-6">
                  <Button onClick={() => handleEditPartner(selectedPartner)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Partner
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

export default PartnerManagementPage