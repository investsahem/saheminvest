#!/usr/bin/env node

/**
 * Test Deals API Logic
 */

require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDealsAPILogic() {
  console.log('🧪 Testing Deals API Logic...')
  
  try {
    // Find a partner user
    const partnerUser = await prisma.user.findFirst({
      where: { role: 'PARTNER' },
      include: {
        permissions: true
      }
    })
    
    if (!partnerUser) {
      console.log('❌ No partner user found')
      return
    }
    
    console.log(`👤 Testing for partner: ${partnerUser.name} (${partnerUser.email})`)
    console.log(`📋 Permissions: ${partnerUser.permissions.length}`)
    
    // Simulate the API query that's failing
    console.log('\n🔄 Simulating deals API query...')
    
    const where = {
      ownerId: partnerUser.id // This is what partner=true does
    }
    
    console.log('Query where clause:', JSON.stringify(where, null, 2))
    
    try {
      const [deals, total] = await Promise.all([
        prisma.project.findMany({
          where,
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            },
            partner: {
              select: {
                id: true,
                companyName: true,
                logo: true
              }
            },
            investments: {
              select: {
                id: true,
                amount: true,
                investor: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            },
            _count: {
              select: {
                investments: true
              }
            }
          },
          orderBy: [
            { featured: 'desc' },
            { priority: 'desc' },
            { createdAt: 'desc' }
          ],
          skip: 0,
          take: 50
        }),
        prisma.project.count({ where })
      ])
      
      console.log(`✅ Query successful!`)
      console.log(`📊 Found ${deals.length} deals, total count: ${total}`)
      
      deals.forEach((deal, i) => {
        console.log(`  ${i+1}. ${deal.title} (${deal.status})`)
        console.log(`     Owner: ${deal.owner.name}`)
        console.log(`     Partner: ${deal.partner?.companyName || 'None'}`)
        console.log(`     Investments: ${deal.investments.length}`)
      })
      
      // Test the transformation logic
      console.log('\n🔄 Testing transformation logic...')
      
      const transformedDeals = deals.map(deal => {
        const filteredDeal = {
          ...deal,
          investorCount: deal._count.investments,
          fundingGoal: Number(deal.fundingGoal),
          currentFunding: Number(deal.currentFunding),
          minInvestment: Number(deal.minInvestment),
          expectedReturn: Number(deal.expectedReturn)
        }
        
        // Check for any NaN values
        if (isNaN(filteredDeal.fundingGoal)) {
          console.log(`⚠️  NaN fundingGoal for deal: ${deal.title}`)
        }
        if (isNaN(filteredDeal.currentFunding)) {
          console.log(`⚠️  NaN currentFunding for deal: ${deal.title}`)
        }
        if (isNaN(filteredDeal.minInvestment)) {
          console.log(`⚠️  NaN minInvestment for deal: ${deal.title}`)
        }
        if (isNaN(filteredDeal.expectedReturn)) {
          console.log(`⚠️  NaN expectedReturn for deal: ${deal.title}`)
        }
        
        return filteredDeal
      })
      
      console.log('✅ Transformation successful!')
      
    } catch (queryError) {
      console.error('❌ Query failed:', queryError.message)
      console.error('Stack trace:', queryError.stack)
      
      // Check if it's a Prisma-specific error
      if (queryError.code) {
        console.error('Prisma error code:', queryError.code)
      }
      if (queryError.meta) {
        console.error('Prisma error meta:', queryError.meta)
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing deals API:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
if (require.main === module) {
  testDealsAPILogic().catch(console.error)
}

module.exports = { testDealsAPILogic }
