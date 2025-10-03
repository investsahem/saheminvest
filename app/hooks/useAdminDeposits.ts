'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface AdminDepositsStats {
  pendingCount: number
  totalCount: number
  isLoading: boolean
  error: string | null
}

export const useAdminDeposits = () => {
  const { data: session } = useSession()
  const [stats, setStats] = useState<AdminDepositsStats>({
    pendingCount: 0,
    totalCount: 0,
    isLoading: true,
    error: null
  })

  const fetchDepositsStats = async () => {
    if (!session?.user || session.user.role !== 'ADMIN') {
      setStats(prev => ({ ...prev, isLoading: false }))
      return
    }

    try {
      setStats(prev => ({ ...prev, isLoading: true, error: null }))
      
      const response = await fetch('/api/admin/deposits')
      
      if (response.ok) {
        const data = await response.json()
        setStats({
          pendingCount: data.pending || 0,
          totalCount: data.total || 0,
          isLoading: false,
          error: null
        })
      } else {
        setStats(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to fetch deposits data'
        }))
      }
    } catch (error) {
      console.error('Error fetching deposits stats:', error)
      setStats(prev => ({
        ...prev,
        isLoading: false,
        error: 'Network error'
      }))
    }
  }

  useEffect(() => {
    fetchDepositsStats()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchDepositsStats, 30000)
    
    return () => clearInterval(interval)
  }, [session])

  return {
    ...stats,
    refetch: fetchDepositsStats
  }
}
