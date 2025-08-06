'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import PartnerLayout from '../../components/layout/PartnerLayout'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { 
  Users, Search, Filter, Eye, Mail, Phone, MessageSquare,
  TrendingUp, DollarSign, Target, Activity, Calendar, 
  CheckCircle, Clock, AlertCircle, Star, Award, Briefcase,
  PieChart, BarChart3, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import {
  LineChart, AreaChart, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, Line, BarChart, Bar
} from 'recharts'

interface Investor {
  id: string
  name: string
  email: string
  phone?: string
  totalInvested: number
  totalReturns: number
  activeInvestments: number
  completedInvestments: number
  averageReturn: number
  riskProfile: 'Conservative' | 'Moderate' | 'Aggressive'
  joinedAt: string
  lastActive: string
  kycVerified: boolean
  walletBalance: number
  investments: any[]
}

const PartnerInvestorsPage = () => {
  const { data: session } = useSession()
  const [investors, setInvestors] = useState<Investor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRisk, setFilterRisk] = useState('all')
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [timeRange, setTimeRange] = useState('6months')

  // Sample data - in real app, fetch from API filtered by partner's deals
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const sampleInvestors: Investor[] = [
        {
          id: '1',
          name: 'Ahmed Al-Rashid',
          email: 'ahmed@example.com',
          phone: '+966501234567',
          totalInvested: 45000,
          totalReturns: 6750,
          activeInvestments: 2,
          completedInvestments: 3,
          averageReturn: 15.2,
          riskProfile: 'Moderate',
          joinedAt: '2023-01-15',
          lastActive: '2024-01-20',
          kycVerified: true,
          walletBalance: 12500,
          investments: []
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          phone: '+1234567890',
          totalInvested: 32000,
          totalReturns: 4800,
          activeInvestments: 1,
          completedInvestments: 2,
          averageReturn: 14.8,
          riskProfile: 'Conservative',
          joinedAt: '2023-03-20',
          lastActive: '2024-01-19',
          kycVerified: true,
          walletBalance: 8200,
          investments: []
        },
        {
          id: '3',
          name: 'Mohammed Al-Saadoun',
          email: 'mohammed@example.com',
          totalInvested: 78000,
          totalReturns: 14040,
          activeInvestments: 3,
          completedInvestments: 5,
          averageReturn: 18.3,
          riskProfile: 'Aggressive',
          joinedAt: '2022-11-10',
          lastActive: '2024-01-21',
          kycVerified: true,
          walletBalance: 25000,
          investments: []
        },
        {
          id: '4',
          name: 'Lisa Chen',
          email: 'lisa@example.com',
          phone: '+85291234567',
          totalInvested: 23000,
          totalReturns: 3220,
          activeInvestments: 1,
          completedInvestments: 1,
          averageReturn: 13.5,
          riskProfile: 'Conservative',
          joinedAt: '2023-06-12',
          lastActive: '2024-01-18',
          kycVerified: true,
          walletBalance: 5800,
          investments: []
        }
      ]
      setInvestors(sampleInvestors)
      setLoading(false)
    }, 1000)
  }, [])

  // Analytics data
  const investorGrowthData = [
    { month: 'Jan', newInvestors: 2, totalInvestors: 8, totalInvested: 120000 },
    { month: 'Feb', newInvestors: 3, totalInvestors: 11, totalInvested: 145000 },
    { month: 'Mar', newInvestors: 1, totalInvestors: 12, totalInvested: 167000 },
    { month: 'Apr', newInvestors: 2, totalInvestors: 14, totalInvested: 189000 },
    { month: 'May', newInvestors: 1, totalInvestors: 15, totalInvested: 201000 },
    { month: 'Jun', newInvestors: 2, totalInvestors: 17, totalInvested: 223000 }
  ]

  const riskProfileData = [
    { name: 'Conservative', value: 35, count: 6, color: '#10B981' },
    { name: 'Moderate', value: 45, count: 8, color: '#F59E0B' },
    { name: 'Aggressive', value: 20, count: 3, color: '#EF4444' }
  ]

  const handleViewInvestor = (investor: Investor) => {
    setSelectedInvestor(investor)
    setShowViewModal(true)
  }

  const handleSendMessage = (investor: Investor) => {
    // Implement messaging functionality
    alert(`Sending message to ${investor.name}`)
  }

  // Filter investors
  const filteredInvestors = investors.filter(investor => {
    const matchesSearch = searchTerm === '' || 
      investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investor.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRisk = filterRisk === 'all' || investor.riskProfile === filterRisk

    return matchesSearch && matchesRisk
  })

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

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Conservative': return 'bg-green-100 text-green-800'
      case 'Moderate': return 'bg-yellow-100 text-yellow-800'
      case 'Aggressive': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalInvestors = investors.length
  const totalInvested = investors.reduce((sum, inv) => sum + inv.totalInvested, 0)
  const totalReturns = investors.reduce((sum, inv) => sum + inv.totalReturns, 0)
  const averageInvestment = totalInvested / totalInvestors || 0

  return (
    <PartnerLayout
      title="My Investors"
      subtitle="Manage relationships with your investors"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Investors</p>
                  <p className="text-2xl font-bold text-blue-900">{totalInvestors}</p>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +2 this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Total Invested</p>
                  <p className="text-2xl font-bold text-green-900">{formatCurrency(totalInvested)}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +8.7% this month
                  </p>
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
                  <p className="text-sm font-medium text-purple-700">Total Returns</p>
                  <p className="text-2xl font-bold text-purple-900">{formatCurrency(totalReturns)}</p>
                  <p className="text-xs text-purple-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +15.2% this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Avg Investment</p>
                  <p className="text-2xl font-bold text-orange-900">{formatCurrency(averageInvestment)}</p>
                  <p className="text-xs text-orange-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +5.8% this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Investor Growth */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Investor Growth</h3>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {[
                    { value: '3months', label: '3M' },
                    { value: '6months', label: '6M' },
                    { value: '1year', label: '1Y' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTimeRange(option.value)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        timeRange === option.value
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={investorGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    name === 'totalInvested' ? formatCurrency(Number(value)) : value,
                    name === 'totalInvested' ? 'Total Invested' : name === 'newInvestors' ? 'New Investors' : 'Total Investors'
                  ]} />
                  <Legend />
                  <Area type="monotone" dataKey="newInvestors" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="totalInvestors" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Risk Profile Distribution */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Risk Profile Distribution</h3>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={riskProfileData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskProfileData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {riskProfileData.map((profile) => (
                  <div key={profile.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: profile.color }}></div>
                      <span className="text-sm text-gray-600">{profile.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{profile.count}</div>
                      <div className="text-xs text-gray-500">investors</div>
                    </div>
                  </div>
                ))}
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
                    placeholder="Search investors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Risk Profiles</option>
                  <option value="Conservative">Conservative</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Aggressive">Aggressive</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Export
                </Button>
                <Button className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Send Update
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Investors List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInvestors.map((investor) => (
              <Card key={investor.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{investor.name}</h3>
                        <p className="text-xs text-gray-500">{investor.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(investor.riskProfile)}`}>
                        {investor.riskProfile}
                      </span>
                      {investor.kycVerified && (
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  {investor.phone && (
                    <div className="flex items-center gap-2 mb-4">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{investor.phone}</span>
                    </div>
                  )}

                  {/* Investment Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{formatCurrency(investor.totalInvested)}</div>
                      <div className="text-xs text-gray-500">Total Invested</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{investor.averageReturn}%</div>
                      <div className="text-xs text-gray-500">Avg Return</div>
                    </div>
                  </div>

                  {/* Returns */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Returns</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-semibold text-green-600">
                          {formatCurrency(investor.totalReturns)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Investment Count */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-900">{investor.activeInvestments}</div>
                      <div className="text-xs text-gray-500">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-900">{investor.completedInvestments}</div>
                      <div className="text-xs text-gray-500">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-900">{formatCurrency(investor.walletBalance)}</div>
                      <div className="text-xs text-gray-500">Wallet</div>
                    </div>
                  </div>

                  {/* Last Active */}
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      Last active {formatDate(investor.lastActive)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => handleViewInvestor(investor)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => handleSendMessage(investor)}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Message
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => window.open(`mailto:${investor.email}`)}
                    >
                      <Mail className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredInvestors.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No investors found</h3>
              <p className="text-gray-600">
                {searchTerm || filterRisk !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Investors will appear here once they invest in your deals.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PartnerLayout>
  )
}

export default PartnerInvestorsPage