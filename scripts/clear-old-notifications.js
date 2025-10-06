const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function clearOldNotifications() {
  try {
    console.log('🧹 Clearing old notifications...')
    
    // Get count of notifications before deletion
    const beforeCount = await prisma.notification.count()
    console.log(`📊 Found ${beforeCount} notifications in database`)
    
    // Delete all existing notifications
    const result = await prisma.notification.deleteMany({})
    
    console.log(`✅ Deleted ${result.count} old notifications`)
    console.log('🎉 All old notifications cleared! New notifications will be properly translated.')
    
  } catch (error) {
    console.error('❌ Error clearing notifications:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearOldNotifications()
