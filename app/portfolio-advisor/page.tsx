'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import PortfolioAdvisorLayout from '../components/layout/PortfolioAdvisorLayout'
import { useTranslation, useI18n } from '../components/providers/I18nProvider'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { 
  LineChart, AreaChart, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, Line
} from 'recharts'
import { 
  TrendingUp, TrendingDown, Users, Target, Award, 
  Activity, Calendar, Eye, ArrowUpRight, MessageCircle, 
  PieChart as PieIcon, BarChart3, Building2, FileText, 
  Briefcase, CheckCircle, Clock, AlertCircle, Star, UserCheck
} from 'lucide-react'

const PortfolioAdvisorDashboard = () => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()

  // Advisor metrics
  const activeClients = 45
  const avgReturn = 16.8
  const satisfaction = 94.2
  const monthlyGrowth = 8.7
  const totalAUM = 2850000 // Assets Under Management
  const newClients = 5

  // Portfolio performance data
  const performanceData = [
    { month: 'Jan', portfolio: 2100000, benchmark: 2000000 },
    { month: 'Feb', portfolio: 2250000, benchmark: 2080000 },
    { month: 'Mar', portfolio: 2400000, benchmark: 2150000 },
    { month: 'Apr', portfolio: 2550000, benchmark: 2200000 },
    { month: 'May', portfolio: 2700000, benchmark: 2300000 },
    { month: 'Jun', portfolio: 2850000, benchmark: 2350000 }
  ]

  // Asset allocation
  const assetAllocation = [
    { name: 'Real Estate', value: 35, amount: 997500, color: '#10B981' },
    { name: 'Technology', value: 25, amount: 712500, color: '#3B82F6' },
    { name: 'Healthcare', value: 20, amount: 570000, color: '#8B5CF6' },
    { name: 'Energy', value: 12, amount: 342000, color: '#F59E0B' },
    { name: 'Other', value: 8, amount: 228000, color: '#EF4444' }
  ]

  // Client performance data
  const clientPerformance = [
    { risk: 'Conservative', clients: 15, avgReturn: 12.5, satisfaction: 96 },
    { risk: 'Moderate', clients: 22, avgReturn: 16.8, satisfaction: 94 },
    { risk: 'Aggressive', clients: 8, avgReturn: 22.3, satisfaction: 91 }
  ]

  // Top performing clients
  const topClients = [
    {
      id: 1,
      name: 'Ahmed Al-Mansouri',
      portfolio: 150000,
      return: 28.5,
      risk: 'Aggressive',
      satisfaction: 5,
      lastContact: '2024-01-10'
    },
    {
      id: 2,
      name: 'Fatima Al-Zahra',
      portfolio: 225000,
      return: 24.2,
      risk: 'Moderate',
      satisfaction: 5,
      lastContact: '2024-01-12'
    },
    {
      id: 3,
      name: 'Mohammed Al-Rashid',
      portfolio: 180000,
      return: 21.8,
      risk: 'Moderate',
      satisfaction: 4,
      lastContact: '2024-01-08'
    },
    {
      id: 4,
      name: 'Sara Al-Otaibi',
      portfolio: 95000,
      return: 19.5,
      risk: 'Conservative',
      satisfaction: 5,
      lastContact: '2024-01-15'
    }
  ]

  // Recent activities
  const recentActivities = [
    {
      id: 1,
      type: 'RECOMMENDATION',
      client: 'Ahmed Al-Mansouri',
      action: 'Recommended tech sector investment',
      date: '2024-01-15',
      status: 'ACCEPTED'
    },
    {
      id: 2,
      type: 'MEETING',
      client: 'Fatima Al-Zahra',
      action: 'Portfolio review meeting scheduled',
      date: '2024-01-14',
      status: 'SCHEDULED'
    },
    {
      id: 3,
      type: 'REBALANCE',
      client: 'Mohammed Al-Rashid',
      action: 'Portfolio rebalancing executed',
      date: '2024-01-13',
      status: 'COMPLETED'
    },
    {
      id: 4,
      type: 'ALERT',
      client: 'Sara Al-Otaibi',
      action: 'Risk tolerance assessment due',
      date: '2024-01-12',
      status: 'PENDING'
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'RECOMMENDATION': return Target
      case 'MEETING': return Calendar
      case 'REBALANCE': return Activity
      case 'ALERT': return AlertCircle
      default: return Activity
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'RECOMMENDATION': return 'text-blue-600'
      case 'MEETING': return 'text-green-600'
      case 'REBALANCE': return 'text-purple-600'
      case 'ALERT': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'SCHEDULED': case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <PortfolioAdvisorLayout 
      title={t('portfolioAdvisor.dashboard')}
    >
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">{t('portfolioAdvisor.active_clients')}</p>
                <p className="text-2xl font-bold text-green-900">{activeClients}</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className={`w-4 h-4 text-green-600 ${locale === 'ar' ? 'ml-1' : 'mr-1'}`} />
                  <span className="text-sm text-green-600 font-medium">
                    +{newClients} this month
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('portfolioAdvisor.avg_return')}</p>
                <p className="text-2xl font-bold text-gray-900">{avgReturn}%</p>
                <p className="text-sm text-blue-600 mt-2 font-medium">vs 12.5% benchmark</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('portfolioAdvisor.satisfaction')}</p>
                <p className="text-2xl font-bold text-gray-900">{satisfaction}%</p>
                <p className="text-sm text-purple-600 mt-2 font-medium">Client satisfaction</p>
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
                <p className="text-sm font-medium text-gray-600">Assets Under Management</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAUM)}</p>
                <p className="text-sm text-orange-600 mt-2 font-medium">+{monthlyGrowth}% growth</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Portfolio Performance */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t('portfolioAdvisor.portfolio_performance')}</h3>
                <p className="text-sm text-gray-500">Portfolio vs benchmark performance</p>
              </div>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [formatCurrency(value as number), name]} 
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="portfolio" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.3}
                  name="Portfolio"
                />
                <Area 
                  type="monotone" 
                  dataKey="benchmark" 
                  stroke="#6B7280" 
                  fill="#6B7280" 
                  fillOpacity={0.2}
                  name="Benchmark"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Asset Allocation */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t('portfolioAdvisor.asset_allocation')}</h3>
                <p className="text-sm text-gray-500">Overall asset distribution</p>
              </div>
              <PieIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={assetAllocation}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      dataKey="value"
                      label={({ value }: { name: string, value: number }) => `${value}%`}
                    >
                      {assetAllocation.map((entry, index) => (
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
                  {assetAllocation.map((item) => (
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

      {/* Client Performance by Risk Profile */}
      <div className="grid grid-cols-1 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Client Performance by Risk Profile</h3>
                <p className="text-sm text-gray-500">Performance metrics across different risk categories</p>
              </div>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={clientPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="risk" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="clients" fill="#3B82F6" name="Number of Clients" />
                <Bar dataKey="avgReturn" fill="#10B981" name="Average Return %" />
                <Bar dataKey="satisfaction" fill="#8B5CF6" name="Satisfaction %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: Top Clients and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Performing Clients */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Top Performing Clients</h3>
              <Button variant="outline" size="sm">
                <Eye className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {topClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <UserCheck className="w-4 h-4 text-gray-400" />
                      <h4 className="font-medium text-gray-900">{client.name}</h4>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{client.risk} Risk Profile</p>
                    <div className={`flex items-center mt-2 ${locale === 'ar' ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                      <span className="text-sm text-green-600 font-medium">
                        +{client.return}% return
                      </span>
                      <div className="flex items-center">
                        {renderStars(client.satisfaction)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(client.portfolio)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Last contact: {formatDate(client.lastContact)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <Button variant="outline" size="sm">
                <Activity className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = getActivityIcon(activity.type)
                return (
                  <div key={activity.id} className={`flex items-center ${locale === 'ar' ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                    <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${getActivityColor(activity.type)}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.client}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(activity.date)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('portfolioAdvisor.quick_actions')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="flex flex-col items-center space-y-2 h-20 bg-green-600 hover:bg-green-700">
              <Calendar className="w-6 h-6" />
              <span className="text-sm text-center">{t('portfolioAdvisor.schedule_meeting')}</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
              <Target className="w-6 h-6" />
              <span className="text-sm text-center">{t('portfolioAdvisor.send_recommendations')}</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
              <BarChart3 className="w-6 h-6" />
              <span className="text-sm text-center">{t('portfolioAdvisor.review_portfolios')}</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
              <MessageCircle className="w-6 h-6" />
              <span className="text-sm text-center">{t('portfolioAdvisor.contact_clients')}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </PortfolioAdvisorLayout>
  )
}

export default PortfolioAdvisorDashboard 