#!/usr/bin/env node

/**
 * Update Deal IDs for Better Identification
 * Updates specific deals with custom IDs for differentiation
 */

require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const dealUpdates = [
  {
    title: 'هواتف مستعملة',
    newId: '1997',
    description: 'Used phones deal'
  },
  {
    title: 'أجهزة إلكترونية للأطفال',
    newId: '2006', 
    description: 'Children electronics deal'
  }
]

async function updateDealIds() {
  console.log('🔄 Updating Deal IDs for Better Identification...')
  console.log('Database URL:', process.env.DATABASE_URL?.split('@')[1] || 'Not found')
  
  try {
    // First, check current deals
    console.log('\n📊 Current deals in database:')
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
    
    currentDeals.forEach((deal, index) => {
      console.log(`  ${index + 1}. ID: ${deal.id}`)
      console.log(`     Title: "${deal.title}"`)
      console.log(`     Status: ${deal.status}`)
      console.log(`     Owner: ${deal.owner.email}`)
      console.log('     ---')
    })
    
    console.log(`\n🔄 Processing ${dealUpdates.length} deal ID updates...`)
    
    for (const update of dealUpdates) {
      console.log(`\n📝 Processing: "${update.title}" → ID: ${update.newId}`)
      
      // Find the deal by title
      const existingDeal = await prisma.project.findFirst({
        where: {
          title: update.title
        }
      })
      
      if (!existingDeal) {
        console.log(`❌ Deal "${update.title}" not found, skipping...`)
        continue
      }
      
      console.log(`   Found deal: ${existingDeal.id}`)
      
      // Check if the new ID is already taken
      const existingId = await prisma.project.findUnique({
        where: {
          id: update.newId
        }
      })
      
      if (existingId) {
        console.log(`⚠️  ID "${update.newId}" already exists, skipping...`)
        continue
      }
      
      // Since we can't directly update the ID field in Prisma (it's immutable),
      // we need to create a new record and delete the old one
      console.log(`   Creating new record with ID: ${update.newId}`)
      
      // Get all the data from the existing deal
      const fullDeal = await prisma.project.findUnique({
        where: { id: existingDeal.id },
        include: {
          investments: true
        }
      })
      
      if (!fullDeal) {
        console.log(`❌ Could not fetch full deal data, skipping...`)
        continue
      }
      
      // Create new deal with custom ID
      const newDeal = await prisma.project.create({
        data: {
          id: update.newId,
          title: fullDeal.title,
          description: fullDeal.description,
          category: fullDeal.category,
          location: fullDeal.location,
          fundingGoal: fullDeal.fundingGoal,
          currentFunding: fullDeal.currentFunding,
          minInvestment: fullDeal.minInvestment,
          expectedReturn: fullDeal.expectedReturn,
          duration: fullDeal.duration,
          riskLevel: fullDeal.riskLevel,
          status: fullDeal.status,
          startDate: fullDeal.startDate,
          endDate: fullDeal.endDate,
          publishedAt: fullDeal.publishedAt,
          pausedAt: fullDeal.pausedAt,
          thumbnailImage: fullDeal.thumbnailImage,
          images: fullDeal.images,
          documents: fullDeal.documents,
          highlights: fullDeal.highlights,
          tags: fullDeal.tags,
          timeline: fullDeal.timeline,
          slug: fullDeal.slug,
          featured: fullDeal.featured,
          priority: fullDeal.priority,
          ownerId: fullDeal.ownerId,
          partnerId: fullDeal.partnerId,
          approvedBy: fullDeal.approvedBy,
          approvedAt: fullDeal.approvedAt,
          rejectedReason: fullDeal.rejectedReason,
          createdAt: fullDeal.createdAt,
          updatedAt: new Date()
        }
      })
      
      console.log(`✅ Created new deal with ID: ${newDeal.id}`)
      
      // Update any investments to point to the new deal
      if (fullDeal.investments.length > 0) {
        console.log(`   Updating ${fullDeal.investments.length} investments...`)
        
        const updateResult = await prisma.investment.updateMany({
          where: {
            projectId: existingDeal.id
          },
          data: {
            projectId: update.newId
          }
        })
        
        console.log(`   ✅ Updated ${updateResult.count} investments`)
      }
      
      // Delete the old deal
      await prisma.project.delete({
        where: { id: existingDeal.id }
      })
      
      console.log(`   🗑️  Deleted old deal: ${existingDeal.id}`)
      console.log(`   ✅ Successfully updated "${update.title}" to ID: ${update.newId}`)
    }
    
    // Verify the changes
    console.log('\n✅ Verifying final state...')
    const finalDeals = await prisma.project.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        currentFunding: true,
        fundingGoal: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log('\nFinal deals with updated IDs:')
    finalDeals.forEach((deal, index) => {
      console.log(`  ${index + 1}. ID: ${deal.id} - "${deal.title}"`)
      console.log(`     Status: ${deal.status}`)
      console.log(`     Funding: $${Number(deal.currentFunding).toLocaleString()} / $${Number(deal.fundingGoal).toLocaleString()}`)
      console.log('     ---')
    })
    
    console.log('\n🎉 Deal ID updates completed successfully!')
    
  } catch (error) {
    console.error('❌ Error updating deal IDs:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
if (require.main === module) {
  updateDealIds().catch(console.error)
}

module.exports = { updateDealIds }
