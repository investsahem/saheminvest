'use client'

import { SessionProvider } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface AuthProviderProps {
  children: React.ReactNode
}

// Session refresh component for mobile
function SessionRefresh() {
  const { data: session, status, update } = useSession()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    // Force session refresh on mobile when status changes
    if (isMobile && status === 'loading') {
      const timer = setTimeout(() => {
        update()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [status, isMobile, update])

  // Force session refresh when navigating to protected routes on mobile
  useEffect(() => {
    if (isMobile && typeof window !== 'undefined') {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && session) {
          update()
        }
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isMobile, session, update])

  return null
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider refetchInterval={300} refetchOnWindowFocus={true}>
      <SessionRefresh />
      {children}
    </SessionProvider>
  )
}

