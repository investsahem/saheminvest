'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import InvestorLayout from '../components/layout/InvestorLayout'
import { useTranslation, useI18n } from '../components/providers/I18nProvider'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { 
  LineChart, AreaChart, PieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, Line
} from 'recharts'
import { 
  TrendingUp, TrendingDown, DollarSign, Target, Award, 
  Activity, Calendar, Eye, ArrowUpRight, ArrowDownRight, 
  PieChart as PieIcon, BarChart3, Wallet, FileText, 
  Users, Building2, Clock, CheckCircle, History
} from 'lucide-react'

const InvestorPortfolio = () => {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('6M')

  // Sample portfolio data
  const portfolioValue = 25000
  const totalInvested = 20000
  const totalReturns = 5000
  const returnPercentage = 25.0
  const todayChange = 850
  const todayPercentage = 3.4

  // Portfolio growth data
  const portfolioGrowthData = [
    { month: 'Jan', value: 20000, invested: 20000 },
    { month: 'Feb', value: 20800, invested: 20000 },
    { month: 'Mar', value: 21500, invested: 21000 },
    { month: 'Apr', value: 22200, invested: 21000 },
    { month: 'May', value: 23800, invested: 22000 },
    { month: 'Jun', value: 25000, invested: 22000 }
  ]

  // Investment distribution data
  const investmentDistribution = [
    { name: 'Real Estate', value: 40, amount: 10000, color: '#10B981' },
    { name: 'Technology', value: 25, amount: 6250, color: '#3B82F6' },
    { name: 'Healthcare', value: 20, amount: 5000, color: '#8B5CF6' },
    { name: 'Energy', value: 10, amount: 2500, color: '#F59E0B' },
    { name: 'Agriculture', value: 5, amount: 1250, color: '#EF4444' }
  ]

  // Monthly returns data
  const monthlyReturns = [
    { month: 'Jan', returns: 800 },
    { month: 'Feb', returns: 1200 },
    { month: 'Mar', returns: 950 },
    { month: 'Apr', returns: 1100 },
    { month: 'May', returns: 1400 },
    { month: 'Jun', returns: 1650 }
  ]

  // Recent activities
  const recentActivities = [
    {
      id: 1,
      type: 'investment',
      title: 'Invested in Tech Startup Fund',
      amount: 2500,
      date: '2024-01-15',
      status: 'completed',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'return',
      title: 'Monthly Return - Real Estate Portfolio',
      amount: 450,
      date: '2024-01-10',
      status: 'received',
      icon: DollarSign,
      color: 'text-blue-600'
    },
    {
      id: 3,
      type: 'withdrawal',
      title: 'Partial Withdrawal',
      amount: 1000,
      date: '2024-01-08',
      status: 'processed',
      icon: TrendingDown,
      color: 'text-orange-600'
    },
    {
      id: 4,
      type: 'dividend',
      title: 'Dividend Payment - Healthcare Fund',
      amount: 180,
      date: '2024-01-05',
      status: 'received',
      icon: Award,
      color: 'text-purple-600'
    }
  ]

  // Active investments
  const activeInvestments = [
    {
      id: 1,
      name: 'Downtown Commercial Complex',
      sector: 'Real Estate',
      invested: 8000,
      currentValue: 9200,
      returns: 15.0,
      duration: '18 months',
      status: 'active',
      nextPayout: '2024-02-01'
    },
    {
      id: 2,
      name: 'Tech Innovation Fund',
      sector: 'Technology',
      invested: 6000,
      currentValue: 7100,
      returns: 18.3,
      duration: '12 months',
      status: 'active',
      nextPayout: '2024-01-25'
    },
    {
      id: 3,
      name: 'Healthcare Development Project',
      sector: 'Healthcare',
      invested: 4000,
      currentValue: 4600,
      returns: 15.0,
      duration: '24 months',
      status: 'active',
      nextPayout: '2024-02-15'
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

  return (
    <InvestorLayout 
      title={t('investor.dashboard')}
    >
      {/* Performance Summary Header */}
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-600">{t('investor.performance_summary')}</h2>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">{t('investor.current_value')}</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(portfolioValue)}</p>
                                 <div className="flex items-center mt-2">
                   <ArrowUpRight className={`w-4 h-4 text-green-600 ${locale === 'ar' ? 'ml-1' : 'mr-1'}`} />
                   <span className="text-sm text-green-600 font-medium">
                     +{formatCurrency(todayChange)} ({todayPercentage}%)
                   </span>
                 </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('investor.total_invested')}</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalInvested)}</p>
                <p className="text-sm text-gray-500 mt-2">{t('investor.active_investments')}: 8</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('investor.total_returns')}</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalReturns)}</p>
                <p className="text-sm text-green-600 mt-2 font-medium">+{returnPercentage}% ROI</p>
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
                <p className="text-sm font-medium text-gray-600">{t('investor.monthly_returns')}</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(1650)}</p>
                <p className="text-sm text-blue-600 mt-2 font-medium">This month</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Portfolio Growth Chart */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t('investor.portfolio_growth')}</h3>
                <p className="text-sm text-gray-500">Portfolio value vs invested amount</p>
              </div>
                             <div className={`flex ${locale === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                 {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map((period) => (
                   <Button
                     key={period}
                     variant={timeframe === period ? 'primary' : 'outline'}
                     size="sm"
                     onClick={() => setTimeframe(period)}
                     className="text-xs"
                   >
                     {period}
                   </Button>
                 ))}
               </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={portfolioGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="invested" 
                  stackId="1"
                  stroke="#6B7280" 
                  fill="#E5E7EB" 
                  name="Invested"
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stackId="2"
                  stroke="#10B981" 
                  fill="#10B981" 
                  name="Portfolio Value"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Investment Distribution Chart */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t('investor.investment_distribution')}</h3>
                <p className="text-sm text-gray-500">By sector allocation</p>
              </div>
              <PieIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex">
              <div className="flex-1">
                                 <ResponsiveContainer width="100%" height={200}>
                   <PieChart>
                     <Pie
                       data={investmentDistribution}
                       cx="50%"
                       cy="50%"
                       outerRadius={70}
                       dataKey="value"
                       label={({ value }: { name: string, value: number }) => `${value}%`}
                     >
                       {investmentDistribution.map((entry, index) => (
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
                   {investmentDistribution.map((item) => (
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

      {/* Monthly Returns Chart */}
      <div className="grid grid-cols-1 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t('investor.monthly_returns')}</h3>
                <p className="text-sm text-gray-500">Monthly return trends</p>
              </div>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyReturns}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="returns" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="Monthly Returns"
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: Active Investments and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Active Investments */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">{t('investor.active_investments')}</h3>
                             <Button variant="outline" size="sm">
                 <Eye className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
                 View All
               </Button>
            </div>
            <div className="space-y-4">
              {activeInvestments.map((investment) => (
                <div key={investment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{investment.name}</h4>
                    <p className="text-sm text-gray-500">{investment.sector}</p>
                                         <div className={`flex items-center mt-2 ${locale === 'ar' ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                       <span className="text-sm text-gray-600">
                         Invested: {formatCurrency(investment.invested)}
                       </span>
                       <span className="text-sm text-green-600 font-medium">
                         +{investment.returns}%
                       </span>
                     </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(investment.currentValue)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Next payout: {formatDate(investment.nextPayout)}
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
              <h3 className="text-lg font-semibold text-gray-900">{t('investor.recent_activity')}</h3>
                             <Button variant="outline" size="sm">
                 <History className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
                 View History
               </Button>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon
                return (
                                     <div key={activity.id} className={`flex items-center ${locale === 'ar' ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
                     <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center`}>
                       <Icon className={`w-5 h-5 ${activity.color}`} />
                     </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{formatDate(activity.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${activity.color}`}>
                        {activity.type === 'withdrawal' ? '-' : '+'}
                        {formatCurrency(activity.amount)}
                      </p>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {activity.status}
                      </span>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('investor.quick_actions')}</h3>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <Button className="flex flex-col items-center space-y-2 h-20">
               <Target className="w-6 h-6" />
               <span className="text-sm text-center">{t('investor.invest_now')}</span>
             </Button>
             <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
               <Wallet className="w-6 h-6" />
               <span className="text-sm text-center">{t('investor.withdraw_funds')}</span>
             </Button>
             <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
               <FileText className="w-6 h-6" />
               <span className="text-sm text-center">{t('investor.view_statements')}</span>
             </Button>
             <Button variant="outline" className="flex flex-col items-center space-y-2 h-20">
               <Users className="w-6 h-6" />
               <span className="text-sm text-center">{t('investor.contact_advisor')}</span>
             </Button>
           </div>
        </CardContent>
      </Card>
    </InvestorLayout>
  )
}

export default InvestorPortfolio 