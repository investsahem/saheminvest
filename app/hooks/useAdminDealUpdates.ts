import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface DealUpdateStats {
  pendingCount: number
  totalDealsCount: number
}

export const useAdminDealUpdates = () => {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DealUpdateStats>({
    pendingCount: 0,
    totalDealsCount: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  const fetchStats = async () => {
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'DEAL_MANAGER')) {
      setIsLoading(false)
      return
    }

    try {
      // Fetch pending update requests count
      const updateRequestsResponse = await fetch('/api/admin/deal-update-requests?status=PENDING', {
        credentials: 'include'
      })

      // Fetch total deals count
      const dealsResponse = await fetch('/api/admin/deals/stats', {
        credentials: 'include'
      })

      let pendingCount = 0
      let totalDealsCount = 0

      if (updateRequestsResponse.ok) {
        const updateData = await updateRequestsResponse.json()
        pendingCount = updateData.updateRequests?.length || 0
      }

      if (dealsResponse.ok) {
        const dealsData = await dealsResponse.json()
        totalDealsCount = dealsData.totalCount || 0
      }

      setStats({
        pendingCount,
        totalDealsCount
      })
    } catch (error) {
      console.error('Error fetching deal update stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    
    return () => clearInterval(interval)
  }, [session])

  return {
    pendingCount: stats.pendingCount,
    totalDealsCount: stats.totalDealsCount,
    isLoading,
    refreshStats: fetchStats
  }
}

