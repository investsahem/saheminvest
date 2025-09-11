'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import PasswordChangeModal from './PasswordChangeModal'

interface PasswordChangeGuardProps {
  children: React.ReactNode
}

export default function PasswordChangeGuard({ children }: PasswordChangeGuardProps) {
  const { data: session, update } = useSession()
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  useEffect(() => {
    if (session?.user?.needsPasswordChange) {
      setShowPasswordModal(true)
    }
  }, [session])

  const handlePasswordChangeSuccess = async () => {
    // Update the session to reflect that password change is no longer needed
    await update({
      ...session,
      user: {
        ...session?.user,
        needsPasswordChange: false
      }
    })
    setShowPasswordModal(false)
  }

  const handleModalClose = () => {
    // Don't allow closing if password change is required
    if (session?.user?.needsPasswordChange) {
      return
    }
    setShowPasswordModal(false)
  }

  return (
    <>
      {children}
      
      {session?.user?.needsPasswordChange && (
        <PasswordChangeModal
          isOpen={showPasswordModal}
          onClose={handleModalClose}
          onSuccess={handlePasswordChangeSuccess}
          userEmail={session.user.email || ''}
        />
      )}
    </>
  )
}
