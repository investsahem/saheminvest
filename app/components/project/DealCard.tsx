'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useTranslation } from '../providers/I18nProvider'
import { Button } from '../ui/Button'
import { Card, CardContent } from '../ui/Card'

interface DealCardProps {
  id: string
  title: string
  description: string
  image: string
  fundingGoal: number
  currentFunding: number
  expectedReturn: {
    min: number
    max: number
  }
  duration: number // in months
  endDate: string
  contributorsCount: number
  partnerName: string
  partnerDealsCount: number
  minInvestment: number
  isPartnerView?: boolean
}

export function DealCard({ 
  id,
  title, 
  description, 
  image, 
  fundingGoal,
  currentFunding,
  expectedReturn,
  duration,
  endDate,
  contributorsCount,
  partnerName,
  partnerDealsCount,
  minInvestment,
  isPartnerView = false
}: DealCardProps) {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  const fundingProgress = (currentFunding / fundingGoal) * 100
  const isFundingCompleted = fundingProgress >= 100

  // Privacy controls based on user role
  const isAdmin = session?.user?.role === 'ADMIN'
  const isDealManager = session?.user?.role === 'DEAL_MANAGER'
  const isPartner = session?.user?.role === 'PARTNER'
  const isInvestor = !isAdmin && !isDealManager && !isPartner

  // Determine what information to show based on user role
  const showPartnerName = !isInvestor  // Hide partner name from investors

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const target = new Date(endDate).getTime()
      const difference = target - now

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  // Extract version from Cloudinary URL to use as key for cache busting
  const getImageKey = (imageUrl: string) => {
    if (!imageUrl) return 'no-image'
    
    // For Cloudinary images, extract the version number (v1234567890)
    if (imageUrl.includes('cloudinary.com')) {
      const versionMatch = imageUrl.match(/\/v(\d+)\//);
      if (versionMatch) {
        return `cloudinary-${versionMatch[1]}`
      }
    }
    
    // For other images, use the full URL as key
    return imageUrl
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-32">
        <Image
          key={getImageKey(image)}
          src={image}
          alt={title}
          fill
          className="object-cover"
          unoptimized={image.includes('cloudinary.com')}
        />
        {isFundingCompleted && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {t('deal_card.funding_completed')}
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        {/* Deal Header */}
        <div className="mb-3">
          <div className="mb-2">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{title}</h3>
          </div>
          <p className="text-gray-600 text-sm line-clamp-2 mb-2">{description}</p>
          
          {/* Partner Info - Only show to admins and partners */}
          {showPartnerName && (
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <span className="font-medium">{partnerName}</span>
              <span className="mx-2">•</span>
              <span>{formatNumber(partnerDealsCount)} {t('deal_card.deals_count')}</span>
            </div>
          )}
        </div>

        {/* Deal Stats */}
        <div className="space-y-3">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">{t('deal_card.contributors')}</div>
              <div className="font-bold text-gray-900">{formatNumber(contributorsCount)}</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">{t('deal_card.duration')}</div>
              <div className="font-bold text-gray-900">{duration} {t('deal_card.months')}</div>
            </div>
          </div>

          {/* Funding Goal */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{t('deal_card.funding_goal')}</span>
            <span className="font-bold text-gray-900">
              {formatNumber(fundingGoal)} {t('common.currency')}
            </span>
          </div>

          {/* Expected Return */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{t('deal_card.expected_return')}</span>
            <div className="font-bold text-green-600">
              {expectedReturn.min}% {expectedReturn.max === expectedReturn.min ? '' : `- ${expectedReturn.max}%`}
            </div>
          </div>

          {/* Funding Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
                             <span className="text-gray-600">{t('deal_card.funding_progress')}</span>
              <span className="font-medium">{fundingProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(fundingProgress, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 text-center">
              {formatNumber(currentFunding)} / {formatNumber(fundingGoal)} {t('common.currency')}
            </div>
          </div>

          {/* Countdown Timer */}
          {!isFundingCompleted && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-center text-sm text-gray-600 mb-2">
                                 {t('deal_card.ends_in')}
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-white p-1 rounded">
                  <div className="text-lg font-bold text-gray-900">
                    {timeLeft.days.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-500">{t('deal_card.days')}</div>
                </div>
                <div className="bg-white p-1 rounded">
                  <div className="text-lg font-bold text-gray-900">
                    {timeLeft.hours.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-500">{t('deal_card.hours')}</div>
                </div>
                <div className="bg-white p-1 rounded">
                  <div className="text-lg font-bold text-gray-900">
                    {timeLeft.minutes.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-500">{t('deal_card.minutes')}</div>
                </div>
                <div className="bg-white p-1 rounded">
                  <div className="text-lg font-bold text-gray-900">
                    {timeLeft.seconds.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-500">{t('deal_card.seconds')}</div>
                </div>
              </div>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="space-y-3 pt-4">
            {isPartnerView ? (
              // Partner view - Management buttons
              <Link href={`/deals/${id}`}>
                <Button variant="outline" className="w-full">
                  {t('deal_card.manage_deal')}
                </Button>
              </Link>
            ) : (
              // Investor view - Investment buttons
              <>
                {!isFundingCompleted ? (
                  <>
                    <div className="text-center text-sm text-gray-600 mb-2">
                      {t('deal_card.interested')}
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <Link href={`/deals/${id}/invest`}>
                        <Button className="w-full" size="lg">
                          {t('deal_card.invest_now')}
                        </Button>
                      </Link>
                      <Link href={`/deals/${id}`}>
                        <Button variant="outline" className="w-full">
                          {t('deal_card.more_details')}
                        </Button>
                      </Link>
                    </div>
                  </>
                ) : (
                  <Link href={`/deals/${id}`}>
                    <Button variant="outline" className="w-full">
                      {t('deal_card.view_results')}
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 