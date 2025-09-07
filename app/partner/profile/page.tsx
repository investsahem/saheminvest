'use client'

import { useState } from 'react'
import PartnerLayout from '../../components/layout/PartnerLayout'

const PartnerProfilePage = () => {
  const [loading, setLoading] = useState(false)

  if (loading) {
    return (
      <PartnerLayout title="Partner Profile" subtitle="Manage your company profile">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PartnerLayout>
    )
  }

  return (
    <PartnerLayout 
      title="Partner Profile" 
      subtitle="Create and manage your company profile for investors"
    >
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Partner Profile</h1>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Profile Management</h2>
          <p className="text-blue-700">
            Full partner profile management features including company information, 
            investment focus, contact details, and more will be available here.
          </p>
        </div>
      </div>
    </PartnerLayout>
  )
}

export default PartnerProfilePage
