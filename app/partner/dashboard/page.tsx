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
import { formatRawPercentage, formatCurrency, formatNumber } from '../utils/formatters'

interface PartnerDashboardData {
  partnerData: {
    companyName: string
    rating: number
    totalDeals: number
    completedDeals: number
    activeDeals: number
    totalFunding: number
    averageReturn: number
    successRate: number
    totalInvestors: number
    monthlyGrowth: number
    totalRevenue: number
    pendingApprovals: number
  }
  performanceData: Array<{
    month: string
    revenue: number
    deals: number
    investors: number
  }>
  currentDeals: Array<{
    id: string
    title: string
    fundingGoal: number
    currentFunding: number
    expectedReturn: number
    duration: number
    status: string
    investorsCount: number
    stage: string
  }>
  recentActivities: Array<{
    id: string
    type: string
    message: string
    time: string
    icon: string
    color: string
  }>
}

const PartnerDashboard = () => {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<PartnerDashboardData | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session?.user) return

      try {
        const response = await fetch('/api/partner/dashboard')
        if (response.ok) {
          const data = await response.json()
          setDashboardData(data)
        } else {
          console.error('Failed to fetch partner dashboard data')
        }
      } catch (error) {
        console.error('Error fetching partner dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [session])



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
      <PartnerLayout title={t('partner.dashboard')} subtitle={t('partner.welcome_message')}>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PartnerLayout>
    )
  }

  if (!dashboardData) {
    return (
      <PartnerLayout title={t('partner.dashboard')} subtitle={t('partner.welcome_message')}>
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('common.error_loading_data')}</h2>
            <p className="text-gray-600">{t('common.try_again')}</p>
          </CardContent>
        </Card>
      </PartnerLayout>
    )
  }

  const { partnerData, performanceData, currentDeals, recentActivities } = dashboardData

  return (
    <PartnerLayout title={t('partner.dashboard')} subtitle={t('partner.welcome_message')}>
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Link href="/partner/deals/create">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Plus className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">{t('partner.create_deal')}</h3>
                    <p className="text-sm text-blue-700">{t('partner.create_new_deal_subtitle')}</p>
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
                    <h3 className="font-semibold text-green-900">{t('partner.my_deals')}</h3>
                    <p className="text-sm text-green-700">{partnerData.activeDeals} {t('partner.filter_active')}</p>
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
                    <h3 className="font-semibold text-purple-900">{t('partner.analytics')}</h3>
                    <p className="text-sm text-purple-700">{partnerData.successRate}% {t('partner.success_rate')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/partner/profit-distributions">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-900">Profit Distributions</h3>
                    <p className="text-sm text-emerald-700">Distribute profits to investors</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/partner/communications">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-orange-900">{t('partner.communications')}</h3>
                    <p className="text-sm text-orange-700">{t('partner.messages')}</p>
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
                  <p className="text-sm font-medium text-blue-700">{t('partner.total_returns')}</p>
                  <p className="text-2xl font-bold text-blue-900">{formatCurrency(partnerData.totalRevenue)}</p>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{partnerData.monthlyGrowth}% {t('partner.this_month')}
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
                  <p className="text-sm font-medium text-green-700">{t('partner.active_deals')}</p>
                  <p className="text-2xl font-bold text-green-900">{partnerData.activeDeals}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <Target className="w-3 h-3 mr-1" />
                    {partnerData.totalDeals} {t('deals.total_deals')}
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
                  <p className="text-sm font-medium text-purple-700">{t('partner.success_rate')}</p>
                  <p className="text-2xl font-bold text-purple-900">{formatRawPercentage(partnerData.successRate)}%</p>
                  <p className="text-xs text-purple-600 flex items-center mt-1">
                    <Award className="w-3 h-3 mr-1" />
                    {partnerData.completedDeals} {t('partner.completed')}
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
                  <p className="text-sm font-medium text-orange-700">{t('partner.total_investors')}</p>
                  <p className="text-2xl font-bold text-orange-900">{partnerData.totalInvestors}</p>
                  <p className="text-xs text-orange-600 flex items-center mt-1">
                    <Users className="w-3 h-3 mr-1" />
                    {t('partner.rating')}: {partnerData.rating} ⭐
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
                <h3 className="text-lg font-semibold text-gray-900">{t('partner.performance_metrics')}</h3>
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
                <h3 className="text-lg font-semibold text-gray-900">{t('partner.my_deals')}</h3>
                <Link href="/partner/deals">
                  <Button variant="outline" size="sm">
{t('partner.view_all')}
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
                      <span>{t('deals.card.progress')}</span>
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
                        <div className="text-gray-500">{t('deals.card.raised')}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{deal.expectedReturn}%</div>
                        <div className="text-gray-500">{t('partner.return')}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{deal.investorsCount}</div>
                        <div className="text-gray-500">{t('deals.investors')}</div>
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
              <h3 className="text-lg font-semibold text-gray-900">{t('partner.recent_activity')}</h3>
              <Link href="/partner/notifications">
                <Button variant="outline" size="sm">
{t('partner.view_all')}
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const getIcon = (iconName: string) => {
                  switch (iconName) {
                    case 'DollarSign': return <DollarSign className={`w-5 h-5 ${activity.color}`} />
                    case 'CheckCircle': return <CheckCircle className={`w-5 h-5 ${activity.color}`} />
                    case 'Target': return <Target className={`w-5 h-5 ${activity.color}`} />
                    case 'MessageSquare': return <MessageSquare className={`w-5 h-5 ${activity.color}`} />
                    default: return <Activity className={`w-5 h-5 ${activity.color}`} />
                  }
                }
                return (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0`}>
                      {getIcon(activity.icon)}
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