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

  // 15-minute auto-logout functionality
  useEffect(() => {
    if (!session) return

    const INACTIVITY_TIMEOUT = 15 * 60 * 1000 // 15 minutes
    const WARNING_TIME = 2 * 60 * 1000 // Show warning 2 minutes before logout
    const CHECK_INTERVAL = 30 * 1000 // Check every 30 seconds

    // Update last activity time
    const updateActivity = () => {
      lastActivityRef.current = Date.now()
    }

    // Show warning before auto-logout
    const showLogoutWarning = () => {
      const confirmed = window.confirm(
        'Your session will expire in 2 minutes due to inactivity. Click OK to stay logged in.'
      )
      if (confirmed) {
        updateActivity()
        update() // Refresh the session
      }
    }

    // Check for inactivity and handle auto-logout
    const checkInactivity = () => {
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivityRef.current

      if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
        console.log('🕐 Auto-logout: User inactive for 15 minutes')
        signOut({ 
          callbackUrl: '/auth/signin?reason=timeout',
          redirect: true 
        })
        return
      }

      // Show warning 2 minutes before timeout
      if (timeSinceLastActivity >= INACTIVITY_TIMEOUT - WARNING_TIME) {
        showLogoutWarning()
        return
      }

      // Continue checking
      timeoutRef.current = setTimeout(checkInactivity, CHECK_INTERVAL)
    }

    // Activity events to track
    const events = [
      'mousedown', 'mousemove', 'keypress', 'scroll', 
      'touchstart', 'click', 'keydown', 'touchmove'
    ]

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true })
    })

    // Start inactivity check
    timeoutRef.current = setTimeout(checkInactivity, CHECK_INTERVAL)

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity)
      })
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current)
        warningTimeoutRef.current = null
      }
    }
  }, [session, update])

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
      refetchInterval={5 * 60} // Refetch every 5 minutes to keep session alive
      refetchOnWindowFocus={true}
    >
      <SessionManager />
      {children}
    </SessionProvider>
  )
}

