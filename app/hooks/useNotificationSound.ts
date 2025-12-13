'use client'

import { useRef, useCallback, useEffect } from 'react'
import { playNotificationSound } from '../lib/sounds'

/**
 * Hook to manage notification sounds with proper tracking of unread count changes
 * Plays a sound when the unread notification count increases
 */
export function useNotificationSound() {
    const previousUnreadRef = useRef<number | null>(null)
    const hasInteractedRef = useRef(false)

    // Track user interaction to enable sound (browsers block autoplay)
    useEffect(() => {
        const enableSound = () => {
            hasInteractedRef.current = true
        }

        // Listen for any user interaction
        document.addEventListener('click', enableSound, { once: true })
        document.addEventListener('keydown', enableSound, { once: true })
        document.addEventListener('touchstart', enableSound, { once: true })

        return () => {
            document.removeEventListener('click', enableSound)
            document.removeEventListener('keydown', enableSound)
            document.removeEventListener('touchstart', enableSound)
        }
    }, [])

    /**
     * Check if sound should play based on unread count change
     * Call this whenever you fetch new notification data
     */
    const checkAndPlaySound = useCallback((currentUnread: number) => {
        // Skip if this is the first load (previousUnread is null)
        if (previousUnreadRef.current === null) {
            previousUnreadRef.current = currentUnread
            return
        }

        // Play sound if unread count increased
        if (currentUnread > previousUnreadRef.current) {
            // Only play if user has interacted with the page
            if (hasInteractedRef.current) {
                playNotificationSound()
            }
        }

        // Update the reference
        previousUnreadRef.current = currentUnread
    }, [])

    /**
     * Reset the previous unread count (useful when component unmounts/remounts)
     */
    const reset = useCallback(() => {
        previousUnreadRef.current = null
    }, [])

    return {
        checkAndPlaySound,
        reset
    }
}
