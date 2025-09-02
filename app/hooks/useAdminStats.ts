import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface AdminStats {
  pendingApplications: number
  isLoading: boolean
}

export function useAdminStats(): AdminStats {
  const { data: session } = useSession()
  const [stats, setStats] = useState<AdminStats>({
    pendingApplications: 0,
    isLoading: true
  })

  useEffect(() => {
    const fetchAdminStats = async () => {
      if (!session?.user || session.user.role !== 'ADMIN') {
        setStats(prev => ({ ...prev, isLoading: false }))
        return
      }

      try {
        // Fetch applications to get pending count
        const applicationsResponse = await fetch('/api/admin/applications')
        const applicationsData = applicationsResponse.ok ? await applicationsResponse.json() : null

        const pendingApplications = applicationsData?.applications 
          ? applicationsData.applications.filter((app: any) => app.status === 'PENDING').length 
          : 0

        setStats({
          pendingApplications,
          isLoading: false
        })
      } catch (error) {
        console.error('Error fetching admin stats:', error)
        setStats(prev => ({ ...prev, isLoading: false }))
      }
    }

    fetchAdminStats()
  }, [session])

  return stats
}


