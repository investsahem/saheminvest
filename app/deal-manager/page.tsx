'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import DealManagerLayout from '../components/layout/DealManagerLayout'
import { useTranslation, useI18n } from '../components/providers/I18nProvider'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { 
  LineChart, AreaChart, PieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, Line, BarChart, Bar
} from 'recharts'
import { 
  TrendingUp, TrendingDown, Target, Award, 
  Activity, Calendar, Eye, ArrowUpRight, Users, 
  PieChart as PieIcon, BarChart3, Building2, FileText, 
  Briefcase, CheckCircle, Clock, AlertCircle
} from 'lucide-react'

const DealManagerDashboard = () => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()

  // Sample deal data
  const totalDeals = 45
  const activeDeals = 12
  const completedDeals = 28
  const totalValue = 8750000
  const monthlyGrowth = 15.8
  const successRate = 87.5

  // Deal pipeline data
  const dealPipelineData = [
    { month: 'Jan', deals: 8, value: 1200000 },
    { month: 'Feb', deals: 12, value: 1800000 },
    { month: 'Mar', deals: 15, value: 2100000 },
    { month: 'Apr', deals: 18, value: 2450000 },
    { month: 'May', deals: 22, value: 3200000 },
    { month: 'Jun', deals: 25, value: 3800000 }
  ]

  // Sector distribution data
  const sectorDistribution = [
    { name: 'Real Estate', value: 35, amount: 3062500, color: '#F59E0B' },
    { name: 'Technology', value: 25, amount: 2187500, color: '#3B82F6' },
    { name: 'Healthcare', value: 20, amount: 1750000, color: '#8B5CF6' },
    { name: 'Manufacturing', value: 15, amount: 1312500, color: '#10B981' },
    { name: 'Energy', value: 5, amount: 437500, color: '#EF4444' }
  ]

  // Partner performance data
  const partnerPerformance = [
    { partner: 'Advanced Tech Co.', deals: 8, success: 95, revenue: 2100000 },
    { partner: 'Modern Construction', deals: 6, success: 90, revenue: 1800000 },
    { partner: 'Healthcare Plus', deals: 5, success: 85, revenue: 1200000 },
    { partner: 'Green Energy Ltd.', deals: 4, success: 88, revenue: 950000 },
    { partner: 'Smart Trading', deals: 3, success: 92, revenue: 750000 }
  ]

  // Recent deals
  const recentDeals = [
    {
      id: 1,
      title: 'Tech Innovation Fund II',
      partner: 'Advanced Tech Co.',
      amount: 450000,
      status: 'ACTIVE',
      date: '2024-01-15',
      investors: 24
    },
    {
      id: 2,
      title: 'Downtown Commercial Complex',
      partner: 'Modern Construction', 
      amount: 680000,
      status: 'COMPLETED',
      date: '2024-01-10',
      investors: 35
    },
    {
      id: 3,
      title: 'Medical Equipment Financing',
      partner: 'Healthcare Plus',
      amount: 320000,
      status: 'ACTIVE',
      date: '2024-01-08',
      investors: 18
    },
    {
      id: 4,
      title: 'Solar Panel Manufacturing',
      partner: 'Green Energy Ltd.',
      amount: 520000,
      status: 'PENDING',
      date: '2024-01-05',
      investors: 28
    }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return CheckCircle
      case 'COMPLETED': return Award
      case 'PENDING': return Clock
      case 'CANCELLED': return AlertCircle
      default: return Activity
    }
  }

  return (
    <DealManagerLayout 
      title={t('dealManager.dashboard')}
    >
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">{t('dealManager.active_deals')}</p>
                <p className="text-2xl font-bold text-orange-900">{activeDeals}</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className={`w-4 h-4 text-orange-600 ${locale === 'ar' ? 'ml-1' : 'mr-1'}`} />
                  <span className="text-sm text-orange-600 font-medium">
                    +3 this month
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('dealManager.total_value')}</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
                <p className="text-sm text-gray-500 mt-2">Total portfolio value</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('dealManager.success_rate')}</p>
                <p className="text-2xl font-bold text-gray-900">{successRate}%</p>
                <p className="text-sm text-green-600 mt-2 font-medium">Above industry avg</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('dealManager.monthly_growth')}</p>
                <p className="text-2xl font-bold text-gray-900">+{monthlyGrowth}%</p>
                <p className="text-sm text-blue-600 mt-2 font-medium">vs last month</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Deal Pipeline Chart */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t('dealManager.deal_pipeline')}</h3>
                <p className="text-sm text-gray-500">Monthly deal flow and values</p>
              </div>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dealPipelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'value' ? formatCurrency(value as number) : value, 
                    name === 'value' ? 'Deal Value' : 'Number of Deals'
                  ]} 
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="deals" 
                  stroke="#F59E0B" 
                  fill="#FEF3C7" 
                  name="Number of Deals"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sector Distribution Chart */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t('dealManager.sector_distribution')}</h3>
                <p className="text-sm text-gray-500">Investment by sector</p>
              </div>
              <PieIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={sectorDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      dataKey="value"
                      label={({ value }: { name: string, value: number }) => `${value}%`}
                    >
                      {sectorDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value}%`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className={`w-44 ${locale === 'ar' ? 'mr-2' : 'ml-2'}`}>
                <div className="space-y-2">
                  {sectorDistribution.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className={`w-2 h-2 rounded-full ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs text-gray-600">{item.name}</span>
                      </div>
                      <span className="text-xs font-medium text-gray-900">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: Recent Deals and Partner Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Deals */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">{t('dealManager.recent_deals')}</h3>
              <Button variant="outline" size="sm">
                <Eye className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {recentDeals.map((deal) => {
                const StatusIcon = getStatusIcon(deal.status)
                return (
                  <div key={deal.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <StatusIcon className="w-4 h-4 text-gray-400" />
                        <h4 className="font-medium text-gray-900">{deal.title}</h4>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{deal.partner}</p>
                      <div className={`flex items-center mt-2 ${locale === 'ar' ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                        <span className="text-sm text-gray-600">
                          {deal.investors} investors
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deal.status)}`}>
                          {deal.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(deal.amount)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(deal.date)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Partner Performance */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">{t('dealManager.partner_performance')}</h3>
              <Button variant="outline" size="sm">
                <Building2 className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
                Manage Partners
              </Button>
            </div>
            <div className="space-y-4">
              {partnerPerformance.map((partner, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{partner.partner}</h4>
                    <div className={`flex items-center mt-2 ${locale === 'ar' ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                      <span className="text-sm text-gray-600">
                        {partner.deals} deals
                      </span>
                      <span className="text-sm text-green-600 font-medium">
                        {partner.success}% success
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(partner.revenue)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Total revenue
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Deal Manager Dashboard</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Link href="/deal-manager/deals">
              <Button className="flex flex-col items-center space-y-2 h-20 w-full bg-blue-600 hover:bg-blue-700">
                <Briefcase className="w-6 h-6" />
                <span className="text-sm text-center">Manage Deals</span>
              </Button>
            </Link>
            <Link href="/deal-manager/analytics">
              <Button variant="outline" className="flex flex-col items-center space-y-2 h-20 w-full">
                <BarChart3 className="w-6 h-6" />
                <span className="text-sm text-center">Deal Analytics</span>
              </Button>
            </Link>
            <Link href="/deal-manager/partners">
              <Button variant="outline" className="flex flex-col items-center space-y-2 h-20 w-full">
                <Building2 className="w-6 h-6" />
                <span className="text-sm text-center">Partner Management</span>
              </Button>
            </Link>
            <Link href="/deal-manager/investors">
              <Button variant="outline" className="flex flex-col items-center space-y-2 h-20 w-full">
                <Users className="w-6 h-6" />
                <span className="text-sm text-center">Investor Relations</span>
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link href="/deal-manager/performance">
              <Button variant="outline" className="flex flex-col items-center space-y-2 h-20 w-full">
                <Target className="w-6 h-6" />
                <span className="text-sm text-center">Performance Tracking</span>
              </Button>
            </Link>
            <Link href="/deal-manager/documents">
              <Button variant="outline" className="flex flex-col items-center space-y-2 h-20 w-full">
                <FileText className="w-6 h-6" />
                <span className="text-sm text-center">Documents</span>
              </Button>
            </Link>
            <Link href="/deal-manager/settings">
              <Button variant="outline" className="flex flex-col items-center space-y-2 h-20 w-full">
                <Activity className="w-6 h-6" />
                <span className="text-sm text-center">Settings</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </DealManagerLayout>
  )
}

export default DealManagerDashboard 