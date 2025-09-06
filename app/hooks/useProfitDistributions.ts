'use client'

import { useState, useEffect } from 'react'

export const useProfitDistributions = () => {
  const [pendingCount, setPendingCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPendingCount = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/profit-distribution-requests?status=PENDING')
      
      if (response.ok) {
        const data = await response.json()
        setPendingCount(data.requests?.length || 0)
        setError(null)
      } else {
        setError('Failed to fetch pending requests')
      }
    } catch (err) {
      console.error('Error fetching profit distribution requests:', err)
      setError('Network error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingCount()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000)
    
    return () => clearInterval(interval)
  }, [])

  return {
    pendingCount,
    isLoading,
    error,
    refetch: fetchPendingCount
  }
}
