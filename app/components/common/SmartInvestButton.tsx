'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ReactNode } from 'react'

interface SmartInvestButtonProps {
  dealId?: string
  children: ReactNode
  className?: string
  [key: string]: any // for other props like onClick, etc.
}

export default function SmartInvestButton({ 
  dealId, 
  children, 
  className = '', 
  ...props 
}: SmartInvestButtonProps) {
  const { data: session, status } = useSession()
  
  // If user is authenticated, redirect to appropriate investment page
  if (session) {
    const investUrl = dealId ? `/deals/${dealId}` : '/deals'
    
    return (
      <Link href={investUrl} className={className} {...props}>
        {children}
      </Link>
    )
  }
  
  // If not authenticated, redirect to sign up
  return (
    <Link href="/auth/signup" className={className} {...props}>
      {children}
    </Link>
  )
}
