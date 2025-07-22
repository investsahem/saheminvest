'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from '../providers/I18nProvider'
import { Button } from '../ui/Button'
import { Card, CardContent } from '../ui/Card'

interface DealCardProps {
  id: string
  title: string
  description: string
  image: string
  dealNumber: string
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
}

export function DealCard({ 
  id,
  title, 
  description, 
  image, 
  dealNumber,
  fundingGoal,
  currentFunding,
  expectedReturn,
  duration,
  endDate,
  contributorsCount,
  partnerName,
  partnerDealsCount,
  minInvestment
}: DealCardProps) {
  const { t } = useTranslation()
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  const fundingProgress = (currentFunding / fundingGoal) * 100
  const isFundingCompleted = fundingProgress >= 100

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
    return new Intl.NumberFormat('ar-SA').format(num)
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
        />
        {isFundingCompleted && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {t('deals.funding_completed')}
          </div>
        )}
      </div>
      
      <CardContent className="p-6">
        {/* Deal Header */}
        <div className="mb-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{title}</h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              N°{dealNumber}
            </span>
          </div>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{description}</p>
          
          {/* Partner Info */}
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <span className="font-medium">{partnerName}</span>
            <span className="mx-2">•</span>
            <span>{formatNumber(partnerDealsCount)} {t('deals.completed_deals')}</span>
          </div>
        </div>

        {/* Deal Stats */}
        <div className="space-y-4">
          {/* Contributors */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{t('deals.contributors_count')}</span>
            <span className="font-bold text-gray-900">{formatNumber(contributorsCount)}</span>
          </div>

          {/* Deal Number */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{t('deals.deal_number')}</span>
            <span className="font-bold text-gray-900">{dealNumber}</span>
          </div>

          {/* Duration */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{t('deals.duration')}</span>
            <span className="font-bold text-gray-900">{duration} {t('deals.months')}</span>
          </div>

          {/* Funding Required */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{t('deals.funding_required')}</span>
            <span className="font-bold text-gray-900">
              {formatNumber(fundingGoal)} {t('common.currency')}
            </span>
          </div>

          {/* Expected Profits */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{t('deals.expected_profits')}</span>
            <div className="text-right">
              <div className="font-bold text-green-600">
                {expectedReturn.min}% {t('common.to')} {expectedReturn.max}%
              </div>
            </div>
          </div>

          {/* Funding Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('deals.funding_progress')}</span>
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
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-center text-sm text-gray-600 mb-2">
                {t('deals.closes_in')}
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-white p-2 rounded">
                  <div className="text-lg font-bold text-gray-900">
                    {timeLeft.days.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-500">{t('deals.days')}</div>
                </div>
                <div className="bg-white p-2 rounded">
                  <div className="text-lg font-bold text-gray-900">
                    {timeLeft.hours.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-500">{t('deals.hours')}</div>
                </div>
                <div className="bg-white p-2 rounded">
                  <div className="text-lg font-bold text-gray-900">
                    {timeLeft.minutes.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-500">{t('deals.minutes')}</div>
                </div>
                <div className="bg-white p-2 rounded">
                  <div className="text-lg font-bold text-gray-900">
                    {timeLeft.seconds.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-500">{t('deals.seconds')}</div>
                </div>
              </div>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="space-y-3 pt-4">
            {!isFundingCompleted ? (
              <>
                <div className="text-center text-sm text-gray-600 mb-2">
                  {t('deals.interested')}
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Link href={`/deals/${id}/invest`}>
                    <Button className="w-full" size="lg">
                      {t('deals.invest_now')}
                    </Button>
                  </Link>
                  <Link href={`/deals/${id}`}>
                    <Button variant="outline" className="w-full">
                      {t('deals.more_info')}
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <Link href={`/deals/${id}`}>
                <Button variant="outline" className="w-full">
                  {t('deals.more_info')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 