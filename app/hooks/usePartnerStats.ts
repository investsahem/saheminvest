import { useState, useEffect } from 'react'

interface PartnerStats {
  totalRaised: number
  activeDeals: number
  successRate: number
  totalDeals: number
  completedDeals: number
  avgDealSize: number
  totalInvestors: number
  totalInvestments: number
  isGrowing: boolean
}

export function usePartnerStats() {
  const [stats, setStats] = useState<PartnerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/partner/stats', {
        credentials: 'include',
        cache: 'no-store'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setStats(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching partner stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics')
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  }
}
