'use client'

import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { useTranslation } from '../../components/providers/I18nProvider'
import AdminLayout from '../../components/layout/AdminLayout'

export default function ApplicationsPage() {
  const { t } = useTranslation()
  const [loading] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <AdminLayout 
      title={t('applications.title')}
      subtitle="Review and manage investor applications"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">24</div>
              <div className="text-gray-600">Total Applications</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-yellow-600">8</div>
              <div className="text-gray-600">Pending Review</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">12</div>
              <div className="text-gray-600">Approved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-red-600">4</div>
              <div className="text-gray-600">Rejected</div>
            </CardContent>
          </Card>
        </div>

        {/* Applications Table */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Recent Applications</h3>
              <Button>Review Applications</Button>
            </div>
            
            <div className="text-center py-12 text-gray-500">
              <p>Application management system coming soon...</p>
              <p className="text-sm mt-2">This page will display user applications for review and approval.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
} 