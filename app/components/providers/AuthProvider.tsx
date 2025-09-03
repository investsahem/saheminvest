'use client'

import { SessionProvider, signOut } from 'next-auth/react'
import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'

interface AuthProviderProps {
  children: React.ReactNode
}

// Auto-logout and session management component
function SessionManager() {
  const { data: session, status, update } = useSession()
  const [isMobile, setIsMobile] = useState(false)
  const lastActivityRef = useRef<number>(Date.now())
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Session management - no auto-logout (using server-side session expiry)
  useEffect(() => {
    if (!session) return

    // Update activity timestamp for mobile session refresh
    const updateActivity = () => {
      lastActivityRef.current = Date.now()
    }

    // Activity events to track for mobile session management
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']

    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true })
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity)
      })
    }
  }, [session])

  // Mobile session refresh logic
  useEffect(() => {
    if (isMobile && status === 'loading') {
      const timer = setTimeout(() => {
        update()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [status, isMobile, update])

  // Force session refresh when app becomes visible on mobile
  useEffect(() => {
    if (isMobile && typeof window !== 'undefined') {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && session) {
          update()
          lastActivityRef.current = Date.now() // Reset activity timer
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
    <SessionProvider 
      refetchInterval={0} // Disable automatic refetch (rely on server session expiry)
      refetchOnWindowFocus={false}
    >
      <SessionManager />
      {children}
    </SessionProvider>
  )
}

