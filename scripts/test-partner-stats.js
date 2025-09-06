#!/usr/bin/env node

/**
 * Test Partner Stats API Logic
 */

require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testPartnerStatsLogic() {
  console.log('🧪 Testing Partner Stats API Logic...')
  
  try {
    // Find a partner user (should be Elhallak+1@gmail.com)
    const partnerUser = await prisma.user.findFirst({
      where: { role: 'PARTNER' }
    })
    
    if (!partnerUser) {
      console.log('❌ No partner user found')
      return
    }
    
    console.log(`👤 Testing for partner: ${partnerUser.name} (${partnerUser.email})`)
    const userId = partnerUser.id
    
    // Simulate the API logic
    console.log('\n🔄 Running partner stats calculations...')
    
    const [
      partnerDeals,
      totalInvestments,
      completedDeals,
      activeDeals
    ] = await Promise.all([
      // Get all partner's deals
      prisma.project.findMany({
        where: { ownerId: userId },
        include: {
          investments: {
            select: {
              amount: true,
              status: true,
              investorId: true
            }
          }
        }
      }),
      
      // Get total investments in partner's deals
      prisma.investment.aggregate({
        where: {
          project: {
            ownerId: userId
          },
          status: 'ACTIVE'
        },
        _sum: {
          amount: true
        },
        _count: {
          id: true
        }
      }),
      
      // Get completed deals count
      prisma.project.count({
        where: {
          ownerId: userId,
          status: 'COMPLETED'
        }
      }),
      
      // Get active deals count
      prisma.project.count({
        where: {
          ownerId: userId,
          status: { in: ['ACTIVE', 'PUBLISHED'] }
        }
      })
    ])
    
    console.log(`📊 Found ${partnerDeals.length} deals for partner`)
    partnerDeals.forEach((deal, i) => {
      console.log(`  ${i+1}. ${deal.title} (${deal.status}) - ${deal.investments.length} investments`)
    })
    
    // Calculate statistics
    const totalRaised = Number(totalInvestments._sum.amount) || 0
    const totalDeals = partnerDeals.length
    const successRate = totalDeals > 0 ? (completedDeals / totalDeals) * 100 : 0
    
    console.log(`\n💰 Total Raised: $${totalRaised.toFixed(2)}`)
    console.log(`📈 Total Deals: ${totalDeals}`)
    console.log(`✅ Completed Deals: ${completedDeals}`)
    console.log(`🔄 Active Deals: ${activeDeals}`)
    console.log(`📊 Success Rate: ${successRate.toFixed(1)}%`)
    
    // Calculate additional metrics
    const avgDealSize = totalDeals > 0 ? totalRaised / totalDeals : 0
    
    // Get unique investors across all partner's deals
    const allInvestments = await prisma.investment.findMany({
      where: {
        project: {
          ownerId: userId
        }
      },
      select: {
        investorId: true
      },
      distinct: ['investorId']
    })
    
    const totalInvestors = allInvestments.length
    
    console.log(`👥 Total Unique Investors: ${totalInvestors}`)
    console.log(`💵 Average Deal Size: $${avgDealSize.toFixed(2)}`)
    console.log(`📋 Total Investments Count: ${totalInvestments._count.id || 0}`)
    
    const stats = {
      totalRaised,
      activeDeals,
      successRate: Math.round(successRate * 10) / 10,
      totalDeals,
      completedDeals,
      avgDealSize,
      totalInvestors,
      totalInvestments: totalInvestments._count.id || 0,
      isGrowing: successRate >= 70
    }
    
    console.log('\n✅ Final stats object:')
    console.log(JSON.stringify(stats, null, 2))
    
  } catch (error) {
    console.error('❌ Error testing partner stats:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
if (require.main === module) {
  testPartnerStatsLogic().catch(console.error)
}

module.exports = { testPartnerStatsLogic }
