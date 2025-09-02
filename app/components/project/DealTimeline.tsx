'use client'

import { Check, Clock, AlertCircle } from 'lucide-react'
import { useI18n } from '../providers/I18nProvider'

interface TimelinePhase {
  phase: string
  date: Date
  completed: boolean
  description?: string
}

interface DealTimelineProps {
  timeline: TimelinePhase[]
  className?: string
}

export default function DealTimeline({ timeline, className = '' }: DealTimelineProps) {
  const { locale } = useI18n()

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date)
  }

  const getPhaseIcon = (phase: TimelinePhase, index: number) => {
    if (phase.completed) {
      return <Check className="w-4 h-4 text-white" />
    }
    
    const now = new Date()
    const isUpcoming = phase.date > now
    const isCurrent = !phase.completed && index === timeline.findIndex(p => !p.completed)
    
    if (isCurrent) {
      return <Clock className="w-4 h-4 text-white" />
    }
    
    if (isUpcoming) {
      return <div className="w-2 h-2 bg-white rounded-full" />
    }
    
    return <AlertCircle className="w-4 h-4 text-white" />
  }

  const getPhaseColor = (phase: TimelinePhase, index: number) => {
    if (phase.completed) {
      return 'bg-green-500'
    }
    
    const now = new Date()
    const isUpcoming = phase.date > now
    const isCurrent = !phase.completed && index === timeline.findIndex(p => !p.completed)
    
    if (isCurrent) {
      return 'bg-blue-500'
    }
    
    if (isUpcoming) {
      return 'bg-gray-400'
    }
    
    return 'bg-red-500'
  }

  const getLineColor = (index: number) => {
    const currentPhase = timeline[index]
    const nextPhase = timeline[index + 1]
    
    if (currentPhase.completed) {
      return 'border-green-500'
    }
    
    return 'border-gray-300'
  }

  return (
    <div className={`${className}`}>
      <div className={`space-y-4 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
        {timeline.map((phase, index) => (
          <div key={index} className="relative flex items-start">
            {/* Timeline Line */}
            {index < timeline.length - 1 && (
              <div 
                className={`absolute ${locale === 'ar' ? 'right-4' : 'left-4'} top-8 w-px h-8 border-l-2 ${getLineColor(index)}`}
                style={{ 
                  [locale === 'ar' ? 'right' : 'left']: '1rem',
                  top: '2rem',
                  height: '2rem'
                }}
              />
            )}
            
            {/* Phase Icon */}
            <div className={`flex-shrink-0 ${locale === 'ar' ? 'ml-4' : 'mr-4'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getPhaseColor(phase, index)}`}>
                {getPhaseIcon(phase, index)}
              </div>
            </div>
            
            {/* Phase Content */}
            <div className="flex-1 min-w-0">
              <div className={`flex items-center justify-between ${locale === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                <h4 className={`text-sm font-medium text-gray-900 ${locale === 'ar' ? 'text-right font-arabic' : 'text-left'}`}>
                  {phase.phase}
                </h4>
                <span className={`text-xs text-gray-500 ${locale === 'ar' ? 'mr-2' : 'ml-2'}`}>
                  {formatDate(phase.date)}
                </span>
              </div>
              {phase.description && (
                <p className={`mt-1 text-xs text-gray-600 ${locale === 'ar' ? 'text-right font-arabic' : 'text-left'}`}>
                  {phase.description}
                </p>
              )}
              
              {/* Status Badge */}
              <div className={`mt-2 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                {phase.completed ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {locale === 'ar' ? 'مكتمل' : 'Completed'}
                  </span>
                ) : index === timeline.findIndex(p => !p.completed) ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {locale === 'ar' ? 'قيد التنفيذ' : 'In Progress'}
                  </span>
                ) : phase.date > new Date() ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {locale === 'ar' ? 'قادم' : 'Upcoming'}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {locale === 'ar' ? 'متأخر' : 'Delayed'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

