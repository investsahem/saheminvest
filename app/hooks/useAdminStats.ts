import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface AdminStats {
  pendingApplications: number
  pendingPartnerApplications: number
  isLoading: boolean
}

export function useAdminStats(): AdminStats {
  const { data: session } = useSession()
  const [stats, setStats] = useState<AdminStats>({
    pendingApplications: 0,
    pendingPartnerApplications: 0,
    isLoading: true
  })

  useEffect(() => {
    const fetchAdminStats = async () => {
      if (!session?.user || session.user.role !== 'ADMIN') {
        setStats(prev => ({ ...prev, isLoading: false }))
        return
      }

      try {
        // Fetch both investor and partner applications to get pending counts
        const [applicationsResponse, partnerApplicationsResponse] = await Promise.all([
          fetch('/api/admin/applications'),
          fetch('/api/admin/partner-applications')
        ])
        
        const applicationsData = applicationsResponse.ok ? await applicationsResponse.json() : null
        const partnerApplicationsData = partnerApplicationsResponse.ok ? await partnerApplicationsResponse.json() : null

        const pendingApplications = applicationsData?.applications 
          ? applicationsData.applications.filter((app: any) => app.status === 'PENDING').length 
          : 0

        const pendingPartnerApplications = partnerApplicationsData?.applications 
          ? partnerApplicationsData.applications.filter((app: any) => app.status === 'PENDING').length 
          : 0

        setStats({
          pendingApplications,
          pendingPartnerApplications,
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


