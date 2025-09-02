'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const InvestorPortfolio = () => {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new dashboard
    router.replace('/portfolio/dashboard')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
}

export default InvestorPortfolio 