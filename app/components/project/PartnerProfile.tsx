'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from '../providers/I18nProvider'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'

interface PartnerProfileProps {
  id: string
  companyName: string
  description?: string
  logo?: string
  website?: string
  phone?: string
  totalDeals: number
  completedDeals: number
  totalFunding: number
  averageReturn?: number
  rating: number
  totalRatings: number
  recentDeals?: Array<{
    id: string
    title: string
    expectedReturn: number
    actualReturn?: number
    status: string
    completedAt?: string
  }>
}

export function PartnerProfile({
  id,
  companyName,
  description,
  logo,
  website,
  phone,
  totalDeals,
  completedDeals,
  totalFunding,
  averageReturn,
  rating,
  totalRatings,
  recentDeals = []
}: PartnerProfileProps) {
  const { t } = useTranslation()

  const successRate = totalDeals > 0 ? (completedDeals / totalDeals) * 100 : 0

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )
    }

    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-5 h-5 text-yellow-400" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="half-fill">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path fill="url(#half-fill)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )
    }

    return stars
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-SA').format(num)
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
            {logo ? (
              <Image src={logo} alt={companyName} width={64} height={64} className="object-cover" />
            ) : (
              <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">{companyName.charAt(0)}</span>
              </div>
            )}
          </div>
          <div className="mr-4 flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{companyName}</h2>
            {description && (
              <p className="text-gray-600 mt-1 line-clamp-2">{description}</p>
            )}
          </div>
        </div>

        {/* Rating */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {renderStars(rating)}
            </div>
            <span className="mr-2 text-lg font-semibold text-gray-900">{rating.toFixed(1)}</span>
            <span className="text-sm text-gray-500">({formatNumber(totalRatings)} {t('partner.rating')})</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{formatNumber(totalDeals)}</div>
            <div className="text-sm text-gray-600">{t('partner.completed_deals')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{successRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">{t('partner.success_rate')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              ${formatNumber(totalFunding)}
            </div>
            <div className="text-sm text-gray-600">{t('partner.total_funding')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {averageReturn ? `${averageReturn.toFixed(1)}%` : '--'}
            </div>
            <div className="text-sm text-gray-600">متوسط العائد</div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t pt-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {website && (
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
                <a href={website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                  {website}
                </a>
              </div>
            )}
            {phone && (
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Recent Deals */}
        {recentDeals.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">آخر الصفقات</h3>
            <div className="space-y-3">
              {recentDeals.slice(0, 3).map((deal) => (
                <div key={deal.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{deal.title}</h4>
                    <div className="text-sm text-gray-600">
                      متوقع: {deal.expectedReturn}% 
                      {deal.actualReturn && ` | فعلي: ${deal.actualReturn}%`}
                    </div>
                  </div>
                  <div className="text-left">
                    <div className={`text-sm px-2 py-1 rounded ${
                      deal.status === 'completed' ? 'bg-green-100 text-green-800' :
                      deal.status === 'active' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {t(`status.${deal.status}`)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href={`/partners/${id}/deals`}>
                <Button variant="outline" className="w-full">
                  عرض جميع الصفقات
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 