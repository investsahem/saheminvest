'use client'

import Link from 'next/link'
import AdminLayout from '../components/layout/AdminLayout'
import { useTranslation, useI18n } from '../components/providers/I18nProvider'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { 
  LineChart, AreaChart, PieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Area, Line
} from 'recharts'
import { 
  TrendingUp, TrendingDown, Users, DollarSign, Target, Activity,
  Calendar, Award, AlertCircle, CheckCircle, Clock, UserCheck,
  BarChart3, PieChart as PieIcon, TrendingUp as GrowthIcon, Eye
} from 'lucide-react'

// Professional sample data for charts
const revenueData = [
  { month: 'Jan', revenue: 45000, profit: 12000, deals: 8 },
  { month: 'Feb', revenue: 52000, profit: 15600, deals: 12 },
  { month: 'Mar', revenue: 48000, profit: 14400, deals: 10 },
  { month: 'Apr', revenue: 61000, profit: 18300, deals: 15 },
  { month: 'May', revenue: 55000, profit: 16500, deals: 13 },
  { month: 'Jun', revenue: 67000, profit: 20100, deals: 18 },
  { month: 'Jul', revenue: 71000, profit: 21300, deals: 20 },
]

const userGrowthData = [
  { month: 'Jan', total: 1100, new: 45, active: 890 },
  { month: 'Feb', total: 1180, new: 80, active: 945 },
  { month: 'Mar', total: 1220, new: 40, active: 980 },
  { month: 'Apr', total: 1350, new: 130, active: 1100 },
  { month: 'May', total: 1420, new: 70, active: 1180 },
  { month: 'Jun', total: 1580, new: 160, active: 1320 },
  { month: 'Jul', total: 1647, new: 67, active: 1420 },
]

const dealDistributionData = [
  { name: 'Electronics', value: 35, amount: 850000, color: '#3B82F6' },
  { name: 'Real Estate', value: 25, amount: 1200000, color: '#10B981' },
  { name: 'Agriculture', value: 20, amount: 450000, color: '#F59E0B' },
  { name: 'Technology', value: 15, amount: 680000, color: '#8B5CF6' },
  { name: 'Healthcare', value: 5, amount: 200000, color: '#EF4444' },
]

const performanceMetrics = [
  { metric: 'Avg Deal Size', value: 85000, change: 12.5, trend: 'up' },
  { metric: 'Success Rate', value: 94.2, change: 3.1, trend: 'up' },
  { metric: 'Time to Fund', value: 4.2, change: -8.3, trend: 'down' },
  { metric: 'ROI Average', value: 15.8, change: 2.4, trend: 'up' },
]

const recentActivities = [
  {
    id: '1',
    type: 'deal_completed',
    message: 'Electronics Trading Deal #2695 completed successfully',
    timestamp: '2024-07-20T14:30:00Z',
    status: 'success',
    amount: 85000
  },
  {
    id: '2',
    type: 'large_investment',
    message: 'Large investment of $25,000 received from Ahmed Mohammed',
    timestamp: '2024-07-20T13:15:00Z',
    status: 'info',
    amount: 25000
  },
  {
    id: '3',
    type: 'new_partner',
    message: 'New partner "Green Energy Corp" registered',
    timestamp: '2024-07-20T11:45:00Z',
    status: 'success',
    amount: null
  },
  {
    id: '4',
    type: 'milestone',
    message: 'Platform reached $5M total investments milestone',
    timestamp: '2024-07-20T09:20:00Z',
    status: 'celebrate',
    amount: 5000000
  },
]

// Enhanced dashboard stats
const dashboardStats = {
  totalUsers: 1647,
  activeInvestors: 1420,
  totalDeals: 89,
  activeDeals: 23,
  totalRevenue: 5480000,
  monthlyRevenue: 671000,
  totalProfit: 1644000,
  monthlyProfit: 201300,
  avgReturn: 15.8,
  successRate: 94.2,
  pendingApprovals: 12,
  systemAlerts: 2,
  newUsersToday: 8,
  completedDealsThisMonth: 20
}

export default function AdminDashboard() {
  const { t } = useTranslation()
  const { locale } = useI18n()

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US').format(num)
  }

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: locale === 'ar' ? 'SAR' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'deal_completed': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'large_investment': return <DollarSign className="w-5 h-5 text-blue-500" />
      case 'new_partner': return <UserCheck className="w-5 h-5 text-purple-500" />
      case 'milestone': return <Award className="w-5 h-5 text-yellow-500" />
      default: return <Activity className="w-5 h-5 text-gray-500" />
    }
  }

  interface MetricCardProps {
    title: string
    value: number
    change: number
    trend: 'up' | 'down'
    icon: any
    format?: 'number' | 'currency' | 'percentage'
  }

  const MetricCard = ({ title, value, change, trend, icon: Icon, format = 'number' }: MetricCardProps) => (
    <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              {format === 'currency' ? formatCurrency(value) : 
               format === 'percentage' ? `${value}%` : formatNumber(value)}
            </p>
            <div className="flex items-center">
              {trend === 'up' ? 
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" /> : 
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              }
              <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {change > 0 ? '+' : ''}{change}%
              </span>
              <span className="text-sm text-gray-500 ml-2">{t('admin.from_last_month')}</span>
            </div>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            trend === 'up' ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <Icon className={`w-6 h-6 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
          </div>
        </div>
        <div className={`absolute bottom-0 left-0 h-1 w-full ${
          trend === 'up' ? 'bg-gradient-to-r from-green-400 to-green-600' : 
                           'bg-gradient-to-r from-red-400 to-red-600'
        }`} />
      </CardContent>
    </Card>
  )

  interface ChartCardProps {
    title: string
    children: React.ReactNode
    icon: any
  }

  const ChartCard = ({ title, children, icon: Icon }: ChartCardProps) => (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Icon className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <Button variant="outline" size="sm" className="text-xs">
            <Eye className="w-3 h-3 mr-1" />
            View Details
          </Button>
        </div>
        {children}
      </CardContent>
    </Card>
  )

  return (
    <AdminLayout 
      title={t('admin.title')} 
      subtitle={t('admin.welcome_message')}
    >
        {/* Today's Activity Card */}
        <div className="mb-8 flex justify-end">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">{t('admin.todays_activity')}</p>
                <p className="text-2xl font-bold text-blue-600">+{dashboardStats.newUsersToday}</p>
                <p className="text-xs text-gray-400">{t('admin.new_users')}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title={t('admin.monthly_revenue')}
            value={dashboardStats.monthlyRevenue}
            change={18.2}
            trend="up"
            icon={DollarSign}
            format="currency"
          />
          <MetricCard
            title={t('admin.active_users')}
            value={dashboardStats.activeInvestors}
            change={12.5}
            trend="up"
            icon={Users}
          />
          <MetricCard
            title={t('admin.success_rate')}
            value={dashboardStats.successRate}
            change={3.1}
            trend="up"
            icon={Target}
            format="percentage"
          />
          <MetricCard
            title={t('admin.avg_roi')}
            value={dashboardStats.avgReturn}
            change={2.4}
            trend="up"
            icon={TrendingUp}
            format="percentage"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <ChartCard title={t('admin.revenue_profit_trends')} icon={BarChart3}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  name="Revenue"
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorProfit)" 
                  name="Profit"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* User Growth Chart */}
          <ChartCard title={t('admin.user_growth_analytics')} icon={GrowthIcon}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  name="Total Users"
                />
                <Line 
                  type="monotone" 
                  dataKey="active" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  dot={{ fill: '#F59E0B', strokeWidth: 2, r: 3 }}
                  name="Active Users"
                />
                <Line 
                  type="monotone" 
                  dataKey="new" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  dot={{ fill: '#EF4444', strokeWidth: 2, r: 3 }}
                  name="New Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Deal Distribution and Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Deal Distribution Pie Chart */}
          <ChartCard title={t('admin.deal_distribution_sector')} icon={PieIcon}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={dealDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {dealDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                                  formatter={(value: number, name: string, props: any) => [
                      `${value}% (${formatCurrency(props.payload.amount)})`, 
                      props.payload.name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {dealDistributionData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-medium text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </ChartCard>

          {/* Performance Metrics */}
          <div className="lg:col-span-2">
            <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">{t('admin.performance_metrics')}</h3>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
{t('admin.this_month')}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {performanceMetrics.map((metric, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">{metric.metric}</span>
                        {metric.trend === 'up' ? 
                          <TrendingUp className="w-4 h-4 text-green-500" /> : 
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        }
                      </div>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {metric.metric.includes('Time') ? `${metric.value} days` :
                           metric.metric.includes('Rate') || metric.metric.includes('ROI') ? `${metric.value}%` :
                           formatCurrency(metric.value)}
                        </span>
                        <span className={`text-sm font-medium ${
                          metric.change > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {metric.change > 0 ? '+' : ''}{metric.change}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
          </div>
        </div>

        {/* Bottom Section: Quick Actions and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Quick Actions */}
          <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Target className="w-5 h-5 text-blue-600 mr-2" />
                {t('admin.quick_actions')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/admin/applications">
                  <Card className="hover:shadow-md transition-all cursor-pointer border border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm mb-1">
                            {t('admin.manage_applications')}
                          </h4>
                          <p className="text-xs text-gray-600">{dashboardStats.pendingApprovals} pending</p>
                        </div>
                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-4 h-4 text-yellow-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/admin/users">
                  <Card className="hover:shadow-md transition-all cursor-pointer border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm mb-1">
                            {t('admin.manage_users')}
                          </h4>
                          <p className="text-xs text-gray-600">{formatNumber(dashboardStats.totalUsers)} users</p>
                        </div>
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/deals">
                  <Card className="hover:shadow-md transition-all cursor-pointer border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm mb-1">
                            {t('admin.manage_deals')}
                          </h4>
                          <p className="text-xs text-gray-600">{dashboardStats.activeDeals} active deals</p>
                </div>
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
                </Link>

                <Card className="hover:shadow-md transition-all cursor-pointer border border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm mb-1">
                          {t('admin.view_analytics')}
                        </h4>
                        <p className="text-xs text-gray-600">{t('admin.detailed_reports')}</p>
                      </div>
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-purple-600" />
                </div>
                </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Recent Activity */}
          <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Activity className="w-5 h-5 text-blue-600 mr-2" />
                {t('admin.recent_activity')}
              </h3>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 mb-1">{activity.message}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
                        {activity.amount && (
                          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {formatCurrency(activity.amount)}
                          </span>
                        )}
                      </div>
                </div>
                </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                {t('admin.view_all_activities')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Deal Management Quick Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Deal Management</h3>
                <Link href="/deals">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {dealDistributionData.reduce((sum, item) => sum + item.value, 0)}
                    </div>
                    <div className="text-sm text-blue-800">Active Deals</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">12</div>
                    <div className="text-sm text-green-800">Draft Deals</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending Approval</span>
                    <span className="text-sm font-medium text-yellow-600">3 deals</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Funded This Month</span>
                    <span className="text-sm font-medium text-green-600">8 deals</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Funding</span>
                    <span className="text-sm font-medium text-blue-600">$2.4M</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link href="/deals" className="flex-1">
                    <Button variant="outline" className="w-full">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Manage Deals
                    </Button>
                  </Link>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Target className="w-4 h-4 mr-2" />
                    Add Deal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investor Portfolio Overview */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Portfolio Overview</h3>
                <Link href="/portfolio">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View Portfolio
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">1,247</div>
                    <div className="text-sm text-purple-800">Total Investors</div>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">$12.5M</div>
                    <div className="text-sm text-indigo-800">AUM</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Investments</span>
                    <span className="text-sm font-medium text-green-600">2,456</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg. Portfolio Size</span>
                    <span className="text-sm font-medium text-blue-600">$10,042</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Portfolio Growth</span>
                    <span className="text-sm font-medium text-green-600">+15.2%</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link href="/admin/users" className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Users
                    </Button>
                  </Link>
                  <Link href="/portfolio">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                      <PieIcon className="w-4 h-4 mr-2" />
                      Analytics
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Investment Performance Tracking */}
        <div className="mt-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Investment Performance</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    This Month
                  </Button>
                  <Link href="/portfolio/analytics">
                    <Button variant="outline" size="sm">
                      <GrowthIcon className="w-4 h-4 mr-2" />
                      Detailed Analytics
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">$2.4M</div>
                  <div className="text-sm text-gray-600 mb-2">Total Invested</div>
                  <div className="flex items-center justify-center text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">+12.5%</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">$380K</div>
                  <div className="text-sm text-gray-600 mb-2">Total Returns</div>
                  <div className="flex items-center justify-center text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">+8.2%</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">15.8%</div>
                  <div className="text-sm text-gray-600 mb-2">Avg ROI</div>
                  <div className="flex items-center justify-center text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">+2.1%</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">94.2%</div>
                  <div className="text-sm text-gray-600 mb-2">Success Rate</div>
                  <div className="flex items-center justify-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">Excellent</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions for Portfolio Management */}
        <div className="mt-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Link href="/deals">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                    <Target className="w-6 h-6" />
                    <span className="text-sm">Manage Deals</span>
                  </Button>
                </Link>
                
                <Link href="/portfolio/investments">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                    <PieIcon className="w-6 h-6" />
                    <span className="text-sm">Investments</span>
                  </Button>
                </Link>
                
                <Link href="/portfolio/wallet">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                    <DollarSign className="w-6 h-6" />
                    <span className="text-sm">Wallet</span>
                  </Button>
                </Link>
                
                <Link href="/portfolio/transactions">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                    <Activity className="w-6 h-6" />
                    <span className="text-sm">Transactions</span>
                  </Button>
                </Link>
                
                <Link href="/portfolio/analytics">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                    <BarChart3 className="w-6 h-6" />
                    <span className="text-sm">Analytics</span>
                  </Button>
                </Link>
                
                <Link href="/admin/users">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                    <Users className="w-6 h-6" />
                    <span className="text-sm">Users</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status Footer */}
        {(dashboardStats.pendingApprovals > 0 || dashboardStats.systemAlerts > 0) && (
          <div className="mt-8">
            <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="w-6 h-6 text-yellow-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1">{t('admin.alerts_attention')}</h4>
                      <p className="text-sm text-yellow-700">
                        {dashboardStats.pendingApprovals} {t('admin.pending_approvals')} • {dashboardStats.systemAlerts} {t('admin.system_alerts')}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-yellow-300 text-yellow-700 hover:bg-yellow-100">
                    <Eye className="w-4 h-4 mr-1" />
                    {t('admin.view_details')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
    </AdminLayout>
  )
} 