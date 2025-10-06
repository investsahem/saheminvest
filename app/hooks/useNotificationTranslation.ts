import { useTranslation, useI18n } from '../components/providers/I18nProvider'

/**
 * Hook to translate notifications that use i18n keys
 * 
 * Usage:
 * const { translateNotification } = useNotificationTranslation()
 * const translatedTitle = translateNotification(notification.title, notification.metadata)
 */
export function useNotificationTranslation() {
  const { t } = useTranslation()
  const { locale } = useI18n() // Get current UI language

  const translateNotification = (text: string, metadata?: any) => {
    // Use current UI language instead of database preference
    const isArabic = locale === 'ar'
    
    // Check if metadata contains i18n information
    let parsedMetadata = metadata
    if (typeof metadata === 'string') {
      try {
        parsedMetadata = JSON.parse(metadata)
      } catch {
        parsedMetadata = null
      }
    }

    // If metadata has i18n keys, use them for translation
    if (parsedMetadata?.i18n) {
      const { titleKey, messageKey, variables } = parsedMetadata.i18n
      
      // Determine if this is title or message based on the text content
      // If text matches a translation key pattern, use the key
      const isKey = text.startsWith('notifications.')
      if (isKey) {
        // Handle method translation specifically
        let translatedVariables = { ...variables }
        if (variables?.method) {
          if (variables.method === 'cash') {
            translatedVariables.method = t('notifications.payment_method_cash')
          } else if (variables.method === 'bank transfer') {
            translatedVariables.method = t('notifications.payment_method_bank')
          }
        }
        
        return t(text, translatedVariables)
      }
    }

    // For old notifications without i18n metadata, try to translate based on text patterns
    if (isArabic && !text.startsWith('notifications.')) {
      return translateLegacyNotification(text, t)
    }

    // Fallback to the original text if no i18n data
    return text
  }

  return { translateNotification }
}

// Helper function to translate old notifications that don't have i18n metadata
function translateLegacyNotification(text: string, t: (key: string, variables?: any) => string): string {
  // Extract amount from text
  const amountMatch = text.match(/\$([0-9,]+(?:\.[0-9]{2})?)/g)
  const amount = amountMatch ? amountMatch[0].replace('$', '') : '0'
  
  // Extract deal title from investment messages or deal notifications
  const dealMatch = text.match(/in "([^"]+)"/)?.[1] || text.match(/"([^"]+)"/)?.[1]
  
  // Extract reference from messages
  const refMatch = text.match(/Reference: ([A-Z0-9-]+)/i)?.[1]
  
  // Partner name extraction for deal notifications
  const partnerMatch = text.match(/^([^:]+) has (created|updated)/)?.[1]
  
  // Deal update notifications
  if (text.startsWith('Deal Updated:')) {
    const dealTitle = text.match(/Deal Updated: (.+)/)?.[1]
    return t('notifications.deal_updated_title', { dealTitle: dealTitle || 'المشروع' })
  }
  
  if (text.includes('has updated the deal') && text.includes('requires re-approval')) {
    return t('notifications.deal_updated_message', { 
      partnerName: partnerMatch || 'الشريك', 
      dealTitle: dealMatch || 'المشروع'
    })
  }
  
  // New deal notifications
  if (text.startsWith('New Deal:')) {
    const dealTitle = text.match(/New Deal: (.+)/)?.[1]
    return t('notifications.new_deal_title', { dealTitle: dealTitle || 'المشروع' })
  }
  
  if (text.includes('has created a new deal') && text.includes('requires approval')) {
    return t('notifications.new_deal_message', { 
      partnerName: partnerMatch || 'الشريك', 
      dealTitle: dealMatch || 'المشروع'
    })
  }
  
  // Translate titles (short text)
  if (text === 'Deposit Approved') {
    return t('notifications.deposit_approved_title')
  }
  
  if (text === 'Deposit Rejected') {
    return t('notifications.deposit_rejected_title')
  }
  
  if (text === 'Deposit Request Submitted') {
    return t('notifications.deposit_pending_title')
  }
  
  if (text === '🎯 Investment Successful' || text === 'Investment Successful') {
    return t('notifications.investment_success_title')
  }
  
  // Translate messages (longer text)
  if (text.includes('approved and added')) {
    return t('notifications.deposit_approved_message', { amount, reference: refMatch || '' })
  }
  
  if (text.includes('rejected') && text.includes('contact support')) {
    return t('notifications.deposit_rejected_message', { amount, reason: 'يرجى الاتصال بالدعم للحصول على مزيد من المعلومات.' })
  }
  
  if (text.includes('pending approval')) {
    const method = text.includes('cash') ? t('notifications.payment_method_cash') : t('notifications.payment_method_bank')
    return t('notifications.deposit_pending_message', { amount, method })
  }
  
  if (text.includes('investment') && text.includes('confirmed')) {
    return t('notifications.investment_success_message', { amount, dealTitle: dealMatch || 'المشروع', reference: refMatch || '' })
  }
  
  // Return original text if no pattern matches
  return text
}

