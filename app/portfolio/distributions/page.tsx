'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import InvestorLayout from '../../components/layout/InvestorLayout'
import { useTranslation } from '../../components/providers/I18nProvider'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { 
  DollarSign, 
  TrendingUp,
  Calendar,
  Target,
  ArrowUpRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  Download
} from 'lucide-react'

interface ProfitDistribution {
  id: string
  amount: number
  profitRate: number
  distributionDate: string
  status: string
  profitPeriod: string
  project: {
    id: string
    title: string
    thumbnailImage?: string
  }
  investment: {
    id: string
    amount: number
  }
  investmentShare: number
}

interface DistributionSummary {
  totalDistributed: number
  totalInvestmentValue: number
  averageReturn: number
  distributionCount: number
  lastDistributionDate: string
}

export default function DistributionsPage() {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const [distributions, setDistributions] = useState<ProfitDistribution[]>([])
  const [summary, setSummary] = useState<DistributionSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    const fetchDistributions = async () => {
      if (!session?.user) return

      try {
        const params = new URLSearchParams()
        if (statusFilter !== 'all') params.append('status', statusFilter)
        if (typeFilter !== 'all') params.append('type', typeFilter)

        const response = await fetch(`/api/portfolio/distributions?${params}`)
        if (response.ok) {
          const data = await response.json()
          setDistributions(data.distributions)
          setSummary(data.summary)
        } else {
          console.error('Failed to fetch distributions')
        }
      } catch (error) {
        console.error('Error fetching distributions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDistributions()
  }, [session, statusFilter, typeFilter])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'FINAL':
        return 'bg-purple-100 text-purple-800'
      case 'PARTIAL':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <InvestorLayout title="Profit Distributions" subtitle="Track your investment returns">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </InvestorLayout>
    )
  }

  return (
    <InvestorLayout title="Profit Distributions" subtitle="Track your investment returns">
      <div className="space-y-6">
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Total Distributed</p>
                    <p className="text-2xl font-bold text-green-900">
                      {formatCurrency(summary.totalDistributed)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Average Return</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {summary.averageReturn.toFixed(1)}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Distributions</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {summary.distributionCount}
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
                    <p className="text-sm font-medium text-orange-700">Last Distribution</p>
                    <p className="text-lg font-bold text-orange-900">
                      {formatDate(summary.lastDistributionDate)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Controls */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="min-w-0">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="PENDING">Pending</option>
                  </select>
                </div>

                <div className="min-w-0">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="PARTIAL">Partial</option>
                    <option value="FINAL">Final</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Distribution History */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribution History</h3>

            {distributions.length > 0 ? (
              <div className="space-y-4">
                {distributions.map((distribution) => (
                  <div key={distribution.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{distribution.project.title}</h4>
                          <div className="flex gap-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(distribution.status)}`}>
                              {getStatusIcon(distribution.status)}
                              <span className="ml-1">{distribution.status}</span>
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(distribution.profitPeriod)}`}>
                              {distribution.profitPeriod}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Amount Distributed</p>
                            <p className="font-bold text-green-600">{formatCurrency(distribution.amount)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Your Investment</p>
                            <p className="font-medium">{formatCurrency(distribution.investment.amount)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Return Rate</p>
                            <p className="font-medium">{distribution.profitRate.toFixed(2)}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Distribution Date</p>
                            <p className="font-medium">{formatDate(distribution.distributionDate)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(distribution.amount)}
                        </p>
                        <div className="flex items-center gap-1 mt-1 justify-end">
                          <ArrowUpRight className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-600">
                            +{distribution.profitRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Distributions Yet</h3>
                <p className="text-gray-600 mb-4">
                  You haven't received any profit distributions yet. Keep investing and check back later!
                </p>
                <Button onClick={() => window.location.href = '/deals'}>
                  Browse Deals
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </InvestorLayout>
  )
}

