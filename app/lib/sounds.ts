/**
 * Notification Sound Utility
 * Base64 encoded notification sound for instant playback
 */

// Short, pleasant notification "ding" sound (Base64 encoded WAV)
// This is a simple, professional notification tone
export const NOTIFICATION_SOUND_BASE64 = 'data:audio/wav;base64,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'

/**
 * Creates and returns an Audio element with the notification sound
 */
export function createNotificationAudio(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null

    try {
        const audio = new Audio(NOTIFICATION_SOUND_BASE64)
        audio.volume = 0.5 // 50% volume for a pleasant, non-intrusive sound
        return audio
    } catch (error) {
        console.warn('Failed to create notification audio:', error)
        return null
    }
}

/**
 * Plays the notification sound
 * Returns a promise that resolves when the sound finishes or rejects on error
 */
export async function playNotificationSound(): Promise<void> {
    const audio = createNotificationAudio()
    if (!audio) return

    try {
        await audio.play()
    } catch (error) {
        // Browser may block autoplay - this is expected
        // The user will need to interact with the page first
        console.debug('Notification sound blocked (user interaction required):', error)
    }
}
