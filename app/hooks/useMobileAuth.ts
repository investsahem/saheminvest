'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function useMobileAuth(requiredRole?: string) {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [isReady, setIsReady] = useState(false)

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
    // Handle mobile authentication issues
    if (isMobile && status === 'unauthenticated') {
      console.log('Mobile authentication failed, redirecting to signin')
      router.push('/auth/signin')
      return
    }

    if (isMobile && status === 'authenticated' && session) {
      // Force session refresh on mobile to ensure role is available
      if (!session.user?.role && !isReady) {
        console.log('Mobile session missing role, refreshing...')
        update().then(() => {
          setIsReady(true)
        })
        return
      }

      // Check role authorization
      if (requiredRole && session.user?.role !== requiredRole && session.user?.role !== 'ADMIN') {
        console.log('Mobile user does not have required role:', requiredRole, 'User role:', session.user?.role)
        router.push('/auth/signin')
        return
      }

      setIsReady(true)
    } else if (!isMobile) {
      // Desktop authentication
      if (status === 'unauthenticated') {
        router.push('/auth/signin')
        return
      }

      if (status === 'authenticated') {
        if (requiredRole && session?.user?.role !== requiredRole && session?.user?.role !== 'ADMIN') {
          router.push('/auth/signin')
          return
        }
        setIsReady(true)
      }
    }
  }, [status, session, isMobile, requiredRole, router, update, isReady])

  // Force refresh on page visibility change (mobile fix)
  useEffect(() => {
    if (isMobile) {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && status === 'authenticated') {
          update()
        }
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isMobile, status, update])

  return {
    session,
    status,
    isMobile,
    isReady,
    isAuthenticated: status === 'authenticated',
    hasRequiredRole: requiredRole ? session?.user?.role === requiredRole || session?.user?.role === 'ADMIN' : true
  }
}

