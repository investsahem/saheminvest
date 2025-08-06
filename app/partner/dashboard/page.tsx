'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import PartnerLayout from '../../components/layout/PartnerLayout'
import { useTranslation } from '../../components/providers/I18nProvider'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { 
  TrendingUp, TrendingDown, Users, DollarSign, Target, 
  Eye, Edit, Calendar, Building2, Award, Activity,
  Briefcase, FileText, BarChart3, MessageSquare, Plus,
  Star, CheckCircle, Clock, AlertCircle, ArrowUpRight
} from 'lucide-react'
import {
  LineChart, AreaChart, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Area, Line
} from 'recharts'

const PartnerDashboard = () => {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)

  // Sample data - would come from API/database in real app
  const partnerData = {
    companyName: session?.user?.name || 'Advanced Technology Company',
    rating: 4.8,
    totalDeals: 15,
    completedDeals: 12,
    activeDeals: 3,
    totalFunding: 850000,
    averageReturn: 6.2,
    successRate: 87,
    totalInvestors: 125,
    monthlyGrowth: 15.8,
    totalRevenue: 189000,
    pendingApprovals: 2
  }

  // Performance data for charts
  const performanceData = [
    { month: 'Jan', revenue: 45000, deals: 2, investors: 15 },
    { month: 'Feb', revenue: 67000, deals: 3, investors: 23 },
    { month: 'Mar', revenue: 89000, deals: 4, investors: 35 },
    { month: 'Apr', revenue: 125000, deals: 5, investors: 48 },
    { month: 'May', revenue: 156000, deals: 6, investors: 62 },
    { month: 'Jun', revenue: 189000, deals: 7, investors: 78 }
  ]

  const currentDeals = [
    {
      id: '1',
      title: 'Used Phones Trading',
      fundingGoal: 20000,
      currentFunding: 20000,
      expectedReturn: 5,
      duration: 2,
      status: 'FUNDED',
      investorsCount: 15,
      stage: 'Execution'
    },
    {
      id: '2',
      title: 'Electronics Commerce',
      fundingGoal: 35000,
      currentFunding: 28000,
      expectedReturn: 6,
      duration: 3,
      status: 'ACTIVE',
      investorsCount: 23,
      stage: 'Funding'
    },
    {
      id: '3',
      title: 'Home Goods Import',
      fundingGoal: 50000,
      currentFunding: 15000,
      expectedReturn: 7,
      duration: 4,
      status: 'ACTIVE',
      investorsCount: 12,
      stage: 'Planning'
    }
  ]

  const recentActivities = [
    {
      id: '1',
      type: 'investment',
      message: 'New investment of $5,000 in Electronics Commerce',
      time: '2 hours ago',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      id: '2',
      type: 'approval',
      message: 'Deal "Home Goods Import" approved by admin',
      time: '5 hours ago',
      icon: CheckCircle,
      color: 'text-blue-600'
    },
    {
      id: '3',
      type: 'completion',
      message: 'Used Phones Trading deal fully funded',
      time: '1 day ago',
      icon: Target,
      color: 'text-purple-600'
    },
    {
      id: '4',
      type: 'message',
      message: 'New message from investor Ahmed Al-Rashid',
      time: '2 days ago',
      icon: MessageSquare,
      color: 'text-orange-600'
    }
  ]

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FUNDED': return 'bg-green-100 text-green-800'
      case 'ACTIVE': return 'bg-blue-100 text-blue-800'
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'FUNDED': return <CheckCircle className="w-4 h-4" />
      case 'ACTIVE': return <Activity className="w-4 h-4" />
      case 'DRAFT': return <Clock className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <PartnerLayout title={t('partner.dashboard')}>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PartnerLayout>
    )
  }

  return (
    <PartnerLayout title={t('partner.dashboard')}>
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/partner/deals/create">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Plus className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">Create Deal</h3>
                    <p className="text-sm text-blue-700">New opportunity</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/partner/deals">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900">My Deals</h3>
                    <p className="text-sm text-green-700">{partnerData.activeDeals} active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/partner/analytics">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-900">Analytics</h3>
                    <p className="text-sm text-purple-700">{partnerData.successRate}% success</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/partner/investors">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-orange-900">Investors</h3>
                    <p className="text-sm text-orange-700">{partnerData.totalInvestors} total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Revenue</p>
                  <p className="text-2xl font-bold text-blue-900">{formatCurrency(partnerData.totalRevenue)}</p>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{partnerData.monthlyGrowth}% this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Active Deals</p>
                  <p className="text-2xl font-bold text-green-900">{partnerData.activeDeals}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <Target className="w-3 h-3 mr-1" />
                    {partnerData.totalDeals} total deals
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Success Rate</p>
                  <p className="text-2xl font-bold text-purple-900">{partnerData.successRate}%</p>
                  <p className="text-xs text-purple-600 flex items-center mt-1">
                    <Award className="w-3 h-3 mr-1" />
                    {partnerData.completedDeals} completed
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Total Investors</p>
                  <p className="text-2xl font-bold text-orange-900">{partnerData.totalInvestors}</p>
                  <p className="text-xs text-orange-600 flex items-center mt-1">
                    <Users className="w-3 h-3 mr-1" />
                    Rating: {partnerData.rating} ⭐
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Deal Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Chart */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Revenue Performance</h3>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">+{partnerData.monthlyGrowth}%</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Current Deals */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Current Deals</h3>
                <Link href="/partner/deals">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {currentDeals.map((deal) => (
                  <div key={deal.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 text-sm">{deal.title}</h4>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deal.status)}`}>
                        {getStatusIcon(deal.status)}
                        {deal.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{Math.round((deal.currentFunding / deal.fundingGoal) * 100)}%</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min((deal.currentFunding / deal.fundingGoal) * 100, 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{formatCurrency(deal.currentFunding)}</div>
                        <div className="text-gray-500">Raised</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{deal.expectedReturn}%</div>
                        <div className="text-gray-500">Return</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{deal.investorsCount}</div>
                        <div className="text-gray-500">Investors</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
              <Link href="/partner/notifications">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon
                return (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </PartnerLayout>
  )
}

export default PartnerDashboard