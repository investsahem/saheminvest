'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslation, useI18n } from '../providers/I18nProvider'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { 
  Calendar, Clock, CheckCircle, Circle, AlertCircle,
  Edit, Save, X, Plus, Trash2
} from 'lucide-react'

interface TimelineItem {
  id: string
  title: string
  description?: string
  date: string
  status: 'completed' | 'current' | 'upcoming'
  type: 'milestone' | 'funding' | 'business' | 'completion'
}

interface DealTimelineProps {
  dealId: string
  isOwner?: boolean
  className?: string
}

export function DealTimeline({ dealId, isOwner = false, className = '' }: DealTimelineProps) {
  const { data: session } = useSession()
  const { t } = useTranslation()
  const { locale } = useI18n()
  
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if user can edit timeline
  const canEdit = isOwner || session?.user?.role === 'ADMIN' || session?.user?.role === 'DEAL_MANAGER'

  useEffect(() => {
    fetchTimeline()
  }, [dealId])

  const fetchTimeline = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/deals/${dealId}/timeline`)
      
      if (response.ok) {
        const data = await response.json()
        setTimeline(data.timeline || [])
      } else {
        setError('Failed to load timeline')
      }
    } catch (error) {
      console.error('Error fetching timeline:', error)
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const saveTimeline = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/deals/${dealId}/timeline`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ timeline })
      })

      if (response.ok) {
        const data = await response.json()
        setTimeline(data.timeline)
        setEditing(false)
      } else {
        setError('Failed to save timeline')
      }
    } catch (error) {
      console.error('Error saving timeline:', error)
      setError('Network error occurred')
    } finally {
      setSaving(false)
    }
  }

  const addTimelineItem = () => {
    const newItem: TimelineItem = {
      id: Date.now().toString(),
      title: locale === 'ar' ? 'مرحلة جديدة' : 'New Milestone',
      description: '',
      date: new Date().toISOString(),
      status: 'upcoming',
      type: 'milestone'
    }
    setTimeline([...timeline, newItem])
  }

  const updateTimelineItem = (id: string, updates: Partial<TimelineItem>) => {
    setTimeline(timeline.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ))
  }

  const removeTimelineItem = (id: string) => {
    setTimeline(timeline.filter(item => item.id !== id))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'current':
        return <AlertCircle className="w-5 h-5 text-blue-600" />
      case 'upcoming':
        return <Circle className="w-5 h-5 text-gray-400" />
      default:
        return <Circle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-200'
      case 'current':
        return 'bg-blue-100 border-blue-200'
      case 'upcoming':
        return 'bg-gray-50 border-gray-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p>{error}</p>
            <Button onClick={fetchTimeline} variant="outline" className="mt-4">
              {locale === 'ar' ? 'إعادة المحاولة' : 'Retry'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {locale === 'ar' ? 'الجدول الزمني للمشروع' : 'Project Timeline'}
          </h2>
          {canEdit && !editing && (
            <Button onClick={() => setEditing(true)} variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              {locale === 'ar' ? 'تحرير' : 'Edit'}
            </Button>
          )}
          {editing && (
            <div className="flex gap-2">
              <Button 
                onClick={saveTimeline} 
                disabled={saving}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? (locale === 'ar' ? 'حفظ...' : 'Saving...') : (locale === 'ar' ? 'حفظ' : 'Save')}
              </Button>
              <Button 
                onClick={() => {
                  setEditing(false)
                  fetchTimeline() // Reset to original data
                }}
                variant="outline"
                size="sm"
              >
                <X className="w-4 h-4 mr-2" />
                {locale === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          )}
        </div>

        {editing && (
          <div className="mb-4">
            <Button onClick={addTimelineItem} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              {locale === 'ar' ? 'إضافة مرحلة' : 'Add Milestone'}
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {timeline.map((item, index) => (
            <div key={item.id} className={`relative ${locale === 'ar' ? 'pr-8' : 'pl-8'}`}>
              {/* Timeline line */}
              {index < timeline.length - 1 && (
                <div className={`absolute top-8 ${locale === 'ar' ? 'right-2' : 'left-2'} w-0.5 h-full bg-gray-300`}></div>
              )}
              
              {/* Timeline item */}
              <div className={`relative flex items-start gap-4 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                {/* Status icon */}
                <div className={`absolute ${locale === 'ar' ? '-right-2' : '-left-2'} top-2 bg-white`}>
                  {getStatusIcon(item.status)}
                </div>

                {/* Content */}
                <div className={`flex-1 ${getStatusColor(item.status)} border rounded-lg p-4`}>
                  {editing ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateTimelineItem(item.id, { title: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={locale === 'ar' ? 'عنوان المرحلة' : 'Milestone title'}
                        />
                        <Button
                          onClick={() => removeTimelineItem(item.id)}
                          variant="outline"
                          size="sm"
                          className="ml-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <textarea
                        value={item.description || ''}
                        onChange={(e) => updateTimelineItem(item.id, { description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={locale === 'ar' ? 'وصف المرحلة' : 'Milestone description'}
                        rows={2}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="date"
                          value={item.date.split('T')[0]}
                          onChange={(e) => updateTimelineItem(item.id, { date: new Date(e.target.value).toISOString() })}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        
                        <select
                          value={item.status}
                          onChange={(e) => updateTimelineItem(item.id, { status: e.target.value as any })}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="upcoming">{locale === 'ar' ? 'قادم' : 'Upcoming'}</option>
                          <option value="current">{locale === 'ar' ? 'حالي' : 'Current'}</option>
                          <option value="completed">{locale === 'ar' ? 'مكتمل' : 'Completed'}</option>
                        </select>
                        
                        <select
                          value={item.type}
                          onChange={(e) => updateTimelineItem(item.id, { type: e.target.value as any })}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="milestone">{locale === 'ar' ? 'معلم' : 'Milestone'}</option>
                          <option value="funding">{locale === 'ar' ? 'تمويل' : 'Funding'}</option>
                          <option value="business">{locale === 'ar' ? 'عمل' : 'Business'}</option>
                          <option value="completion">{locale === 'ar' ? 'إنجاز' : 'Completion'}</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(item.date)}</span>
                        </div>
                      </div>
                      
                      {item.description && (
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {timeline.length === 0 && !editing && (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {locale === 'ar' ? 'لم يتم إضافة جدول زمني بعد' : 'No timeline available yet'}
            </p>
            {canEdit && (
              <Button onClick={() => setEditing(true)} className="mt-4">
                {locale === 'ar' ? 'إضافة جدول زمني' : 'Add Timeline'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}