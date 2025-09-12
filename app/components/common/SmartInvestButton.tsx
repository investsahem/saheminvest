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
  
  // If user is authenticated, redirect to investment page
  if (session) {
    const investUrl = dealId ? `/deals/${dealId}/invest` : '/deals'
    
    return (
      <Link href={investUrl} className={className} {...props}>
        {children}
      </Link>
    )
  }
  
  // If not authenticated, redirect to sign-in
  return (
    <Link href="/auth/signin" className={className} {...props}>
      {children}
    </Link>
  )
}
