const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Translation mapping for common notification titles and messages
const translations = {
  titles: {
    'Deposit Approved': {
      en: 'Deposit Approved',
      ar: 'تم الموافقة على الإيداع'
    },
    'Deposit Rejected': {
      en: 'Deposit Rejected', 
      ar: 'تم رفض الإيداع'
    },
    'Deposit Request Submitted': {
      en: 'Deposit Request Submitted',
      ar: 'تم إرسال طلب الإيداع'
    },
    '🎯 Investment Successful': {
      en: '🎯 Investment Successful',
      ar: '🎯 استثمار ناجح'
    },
    'Investment Successful': {
      en: 'Investment Successful',
      ar: 'استثمار ناجح'
    }
  }
}

async function translateExistingNotifications() {
  try {
    console.log('🔄 Translating existing notifications...')
    
    // Get all notifications
    const notifications = await prisma.notification.findMany({
      include: {
        user: {
          select: {
            id: true,
            preferredLanguage: true
          }
        }
      }
    })
    
    console.log(`📊 Found ${notifications.length} notifications to process`)
    
    let updatedCount = 0
    
    for (const notification of notifications) {
      const userLang = notification.user?.preferredLanguage || 'en'
      const isArabic = userLang === 'ar'
      
      // Check if we have a translation for this title
      const titleTranslation = translations.titles[notification.title]
      if (titleTranslation) {
        const newTitle = isArabic ? titleTranslation.ar : titleTranslation.en
        
        // Create metadata with translation info
        const metadata = {
          i18n: {
            titleKey: getKeyForTitle(notification.title),
            messageKey: getKeyForMessage(notification.message),
            variables: extractVariables(notification.message)
          },
          originalData: notification.metadata ? JSON.parse(notification.metadata) : {}
        }
        
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            title: newTitle,
            message: translateMessage(notification.message, isArabic),
            metadata: JSON.stringify(metadata)
          }
        })
        
        updatedCount++
      }
    }
    
    console.log(`✅ Updated ${updatedCount} notifications`)
    console.log('🎉 Existing notifications have been translated!')
    
  } catch (error) {
    console.error('❌ Error translating notifications:', error)
  } finally {
    await prisma.$disconnect()
  }
}

function getKeyForTitle(title) {
  const keyMap = {
    'Deposit Approved': 'notifications.deposit_approved_title',
    'Deposit Rejected': 'notifications.deposit_rejected_title',
    'Deposit Request Submitted': 'notifications.deposit_pending_title',
    '🎯 Investment Successful': 'notifications.investment_success_title',
    'Investment Successful': 'notifications.investment_success_title'
  }
  return keyMap[title] || 'notifications.generic_title'
}

function getKeyForMessage(message) {
  if (message.includes('approved and added')) return 'notifications.deposit_approved_message'
  if (message.includes('rejected')) return 'notifications.deposit_rejected_message'
  if (message.includes('pending approval')) return 'notifications.deposit_pending_message'
  if (message.includes('investment') && message.includes('confirmed')) return 'notifications.investment_success_message'
  return 'notifications.generic_message'
}

function extractVariables(message) {
  const variables = {}
  
  // Extract amount
  const amountMatch = message.match(/\$([0-9,]+(?:\.[0-9]{2})?)/g)
  if (amountMatch) {
    variables.amount = amountMatch[0].replace('$', '').replace(',', '')
  }
  
  // Extract method
  if (message.includes('cash')) variables.method = 'cash'
  if (message.includes('bank')) variables.method = 'bank transfer'
  
  // Extract reference
  const refMatch = message.match(/Reference: ([A-Z0-9-]+)/i)
  if (refMatch) {
    variables.reference = refMatch[1]
  }
  
  return variables
}

function translateMessage(message, isArabic) {
  if (!isArabic) return message
  
  // Basic Arabic translations for common messages
  if (message.includes('approved and added')) {
    const amount = message.match(/\$([0-9,]+(?:\.[0-9]{2})?)/)?.[0] || '$0'
    return `تمت الموافقة على إيداعك بقيمة ${amount} وتمت إضافته إلى محفظتك.`
  }
  
  if (message.includes('rejected')) {
    const amount = message.match(/\$([0-9,]+(?:\.[0-9]{2})?)/)?.[0] || '$0'
    return `تم رفض إيداعك بقيمة ${amount}. يرجى الاتصال بالدعم للحصول على مزيد من المعلومات.`
  }
  
  if (message.includes('pending approval')) {
    const amount = message.match(/\$([0-9,]+(?:\.[0-9]{2})?)/)?.[0] || '$0'
    const method = message.includes('cash') ? 'نقداً' : 'تحويل بنكي'
    return `طلب الإيداع الخاص بك بقيمة ${amount} عبر ${method} قيد المراجعة.`
  }
  
  if (message.includes('investment') && message.includes('confirmed')) {
    const amount = message.match(/\$([0-9,]+(?:\.[0-9]{2})?)/)?.[0] || '$0'
    const dealMatch = message.match(/in "([^"]+)"/)?.[1] || 'المشروع'
    return `تم استثمارك بقيمة ${amount} في "${dealMatch}" بنجاح.`
  }
  
  return message // Fallback to original if no translation found
}

translateExistingNotifications()
