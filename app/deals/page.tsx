'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { DealCard } from '../components/project/DealCard'
import AdminLayout from '../components/layout/AdminLayout'
import { useTranslation, useI18n } from '../components/providers/I18nProvider'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

// Enhanced deals data with different statuses
const sampleDeals = [
  {
    id: '1',
    title: 'phone_title',
    description: 'phone_description',
    image: '/images/phone-deal.jpg',
    dealNumber: '2695',
    fundingGoal: 20000,
    currentFunding: 20000,
    expectedReturn: { min: 3, max: 5 },
    duration: 2,
    endDate: '2024-12-31T23:59:59',
    contributorsCount: 1,
    partnerName: 'advanced_tech',
    partnerDealsCount: 15,
    minInvestment: 1000,
    status: 'COMPLETED' as const,
    createdAt: '2024-01-15',
    completedAt: '2024-03-15'
  },
  {
    id: '2',
    title: 'electronics_title',
    description: 'electronics_description',
    image: '/images/electronics-deal.jpg',
    dealNumber: '2696',
    fundingGoal: 50000,
    currentFunding: 35000,
    expectedReturn: { min: 4, max: 7 },
    duration: 3,
    endDate: '2024-08-15T23:59:59',
    contributorsCount: 12,
    partnerName: 'smart_trading',
    partnerDealsCount: 8,
    minInvestment: 2000,
    status: 'ACTIVE' as const,
    createdAt: '2024-06-01',
    completedAt: null
  },
  {
    id: '3',
    title: 'construction_title', 
    description: 'construction_description',
    image: '/images/construction-deal.jpg',
    dealNumber: '2697',
    fundingGoal: 100000,
    currentFunding: 25000,
    expectedReturn: { min: 5, max: 8 },
    duration: 6,
    endDate: '2024-09-30T23:59:59',
    contributorsCount: 5,
    partnerName: 'modern_construction',
    partnerDealsCount: 23,
    minInvestment: 5000,
    status: 'ACTIVE' as const,
    createdAt: '2024-07-10',
    completedAt: null
  },
  {
    id: '4',
    title: 'Real Estate Development',
    description: 'Commercial real estate development project in prime location',
    image: '/images/construction-deal.jpg',
    dealNumber: '2698',
    fundingGoal: 200000,
    currentFunding: 0,
    expectedReturn: { min: 6, max: 10 },
    duration: 12,
    endDate: '2025-01-31T23:59:59',
    contributorsCount: 0,
    partnerName: 'modern_construction',
    partnerDealsCount: 23,
    minInvestment: 10000,
    status: 'DRAFT' as const,
    createdAt: '2024-07-20',
    completedAt: null
  },
  {
    id: '5',
    title: 'Agricultural Investment',
    description: 'Sustainable farming project with guaranteed returns',
    image: '/images/construction-deal.jpg',
    dealNumber: '2699',
    fundingGoal: 75000,
    currentFunding: 75000,
    expectedReturn: { min: 2, max: 4 },
    duration: 4,
    endDate: '2024-02-28T23:59:59',
    contributorsCount: 18,
    partnerName: 'smart_trading',
    partnerDealsCount: 8,
    minInvestment: 1500,
    status: 'EXPIRED' as const,
    createdAt: '2023-10-15',
    completedAt: null
  }
]

export default function DealsPage() {
  const { t } = useTranslation()
  const { locale } = useI18n()
  const { data: session } = useSession()
  
  const [filter, setFilter] = useState('ALL')
  
  // Check if user is admin or deal manager
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'DEAL_MANAGER'
  
  // Check if user is authenticated
  const isAuthenticated = !!session?.user
  
  // Filter deals based on selected status
  const filteredDeals = filter === 'ALL' 
    ? sampleDeals 
    : sampleDeals.filter(deal => deal.status === filter)

  // Calculate statistics
  const stats = {
    total: sampleDeals.length,
    active: sampleDeals.filter(deal => deal.status === 'ACTIVE').length,
    completed: sampleDeals.filter(deal => deal.status === 'COMPLETED').length,
    totalFunding: sampleDeals.reduce((sum, deal) => sum + deal.currentFunding, 0)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US').format(num)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      case 'EXPIRED': return 'bg-red-100 text-red-800'
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Enhanced deal card with admin features
  const EnhancedDealCard = ({ deal }: { deal: typeof sampleDeals[0] }) => (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
      {/* Status Badge */}
      <div className="absolute top-3 right-3 z-10">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deal.status)}`}>
          {t(`deals.deal_status.${deal.status}`)}
        </span>
      </div>
      
      <CardContent className="p-0">
        {/* Deal Image */}
        <div className="relative h-48 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
          <div className="text-white text-center">
            <h3 className="text-xl font-bold mb-2">
              {deal.title.includes('_') ? t(`deals.sample_deals.${deal.title}`) : deal.title}
            </h3>
            <p className="text-sm opacity-90">#{deal.dealNumber}</p>
          </div>
        </div>

        <div className="p-6">
          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {deal.description.includes('_') ? t(`deals.sample_deals.${deal.description}`) : deal.description}
          </p>
          
          {/* Funding Progress */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">{t('deals.funding_progress')}</span>
              <span className="text-sm text-gray-600">
                {Math.round((deal.currentFunding / deal.fundingGoal) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${Math.min((deal.currentFunding / deal.fundingGoal) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
              <span>{formatNumber(deal.currentFunding)} {t('common.currency')}</span>
              <span>{formatNumber(deal.fundingGoal)} {t('common.currency')}</span>
            </div>
          </div>
          
          {/* Deal Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <span className="text-gray-500">{t('deals.expected_return')}</span>
              <p className="font-semibold">{deal.expectedReturn.min}-{deal.expectedReturn.max}%</p>
            </div>
            <div>
              <span className="text-gray-500">{t('deals.duration')}</span>
              <p className="font-semibold">{deal.duration} {t('deals.months')}</p>
            </div>
          </div>
          
          {/* Partner Info */}
          <div className="mb-4 pb-4 border-b border-gray-100">
            <p className="text-xs text-gray-500 mb-1">{t('deals.partner')}</p>
            <p className="font-medium text-sm">
              {deal.partnerName.includes('_') ? t(`deals.partners.${deal.partnerName}`) : deal.partnerName}
            </p>
            <p className="text-xs text-gray-400">{deal.partnerDealsCount} {t('deals.deals_completed')}</p>
          </div>
          
          {/* Actions */}
          <div className="space-y-2">
            {isAuthenticated && !isAdmin && deal.status === 'ACTIVE' && (
              <Button className="w-full">
                {t('deals.invest_now')}
              </Button>
            )}
            
            {!isAuthenticated && deal.status === 'ACTIVE' && (
              <Button className="w-full" variant="outline">
                {t('auth.signin.title')}
              </Button>
            )}
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                {t('deals.view_details')}
              </Button>
              
              {isAdmin && (
                <Button variant="outline" size="sm" className="flex-1">
                  {t('deals.manage_deal')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Define the page content
  const pageContent = (
    <>
      {/* Statistics Cards */}
      {isAdmin && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('deals.overview')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{t('deals.total_deals')}</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{t('deals.active_deals')}</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🟢</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{t('deals.completed_deals')}</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{t('deals.total_funding')}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(stats.totalFunding)}
                    </p>
                    <p className="text-xs text-gray-500">{t('common.currency')}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'ACTIVE', 'COMPLETED', 'EXPIRED', 'DRAFT'] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
              className="text-sm"
            >
              {status === 'ALL' ? t('deals.filter_all') : t(`deals.filter_${status.toLowerCase()}`)}
            </Button>
          ))}
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <Button>
            {t('deals.add_new_deal')}
          </Button>
        )}
      </div>

      {/* Deals Grid */}
      {filteredDeals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.map((deal) => (
            <EnhancedDealCard key={deal.id} deal={deal} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <div className="text-gray-500 text-lg mb-4">{t('deals.no_deals_available')}</div>
          <div className="text-gray-400">{t('deals.check_back_soon')}</div>
          {isAdmin && (
            <Button className="mt-4">
              {t('deals.add_new_deal')}
            </Button>
          )}
        </div>
      )}
    </>
  )

  // Use appropriate layout based on user role
  if (isAdmin) {
    return (
      <AdminLayout 
        title={t('deals.title')}
        subtitle={t('deals.subtitle')}
      >
        {pageContent}
      </AdminLayout>
    )
  } else {
    // For non-admin users, use a simple container layout
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{t('deals.title')}</h1>
              {t('deals.subtitle') && (
                <p className="text-gray-600">{t('deals.subtitle')}</p>
              )}
            </div>
            {pageContent}
          </div>
        </div>
      </div>
    )
  }
} 