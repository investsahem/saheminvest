#!/usr/bin/env node

/**
 * Sync Deal Statuses to Production
 * Updates deal statuses from PUBLISHED to ACTIVE so they appear on frontend
 */

require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

// Use the production Neon database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function syncDealStatuses() {
  console.log('🔄 Syncing Deal Statuses to Production Database...')
  console.log('Database URL:', process.env.DATABASE_URL?.split('@')[1] || 'Not found')
  
  try {
    // First, check current deals
    console.log('\n📊 Checking current deals...')
    const currentDeals = await prisma.project.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        owner: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`Found ${currentDeals.length} deals:`)
    currentDeals.forEach((deal, index) => {
      console.log(`  ${index + 1}. "${deal.title}" - Status: ${deal.status} (Owner: ${deal.owner.email})`)
    })
    
    // Update PUBLISHED deals to ACTIVE
    console.log('\n🔄 Updating PUBLISHED deals to ACTIVE...')
    const updateResult = await prisma.project.updateMany({
      where: {
        status: 'PUBLISHED'
      },
      data: {
        status: 'ACTIVE'
      }
    })
    
    console.log(`✅ Updated ${updateResult.count} deals from PUBLISHED to ACTIVE`)
    
    // Verify the changes
    console.log('\n✅ Verifying changes...')
    const updatedDeals = await prisma.project.findMany({
      select: {
        title: true,
        status: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log('Final deal statuses:')
    updatedDeals.forEach((deal, index) => {
      console.log(`  ${index + 1}. "${deal.title}" - Status: ${deal.status}`)
    })
    
    // Test API visibility
    console.log('\n🔍 Testing API visibility...')
    const visibleDeals = await prisma.project.findMany({
      where: {
        status: { in: ['ACTIVE', 'FUNDED'] }
      }
    })
    
    console.log(`✅ ${visibleDeals.length} deals will be visible on frontend`)
    
    console.log('\n🎉 Database sync completed successfully!')
    
  } catch (error) {
    console.error('❌ Error syncing database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the sync
if (require.main === module) {
  syncDealStatuses().catch(console.error)
}

module.exports = { syncDealStatuses }
