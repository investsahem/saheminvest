const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkRealData() {
  console.log('🔍 Checking real data...')

  try {
    // Check real user
    const realUser = await prisma.user.findUnique({
      where: { email: 'Elhallak+1@gmail.com' },
      include: {
        partner: true,
        partnerProfile: true,
        projects: true
      }
    })

    if (realUser) {
      console.log('\n👤 Real User:')
      console.log(`  Email: ${realUser.email}`)
      console.log(`  Name: ${realUser.name}`)
      console.log(`  Role: ${realUser.role}`)
      console.log(`  Wallet Balance: $${realUser.walletBalance}`)
      
      if (realUser.partner) {
        console.log('\n🏢 Partner Profile:')
        console.log(`  Company: ${realUser.partner.companyName}`)
        console.log(`  Status: ${realUser.partner.status}`)
        console.log(`  Tier: ${realUser.partner.tier}`)
        console.log(`  Total Deals: ${realUser.partner.totalDeals}`)
        console.log(`  Total Commission: $${realUser.partner.totalCommission}`)
        console.log(`  Success Rate: ${realUser.partner.successRate}%`)
      }
      
      if (realUser.projects && realUser.projects.length > 0) {
        console.log('\n📋 Real Deals:')
        realUser.projects.forEach((deal, index) => {
          console.log(`  ${index + 1}. ${deal.title}`)
          console.log(`     Status: ${deal.status}`)
          console.log(`     Funding Goal: $${deal.fundingGoal}`)
          console.log(`     Current Funding: $${deal.currentFunding}`)
          console.log(`     Expected Return: ${deal.expectedReturn}%`)
        })
      }
    }

    // Check all partners
    const allPartners = await prisma.partner.findMany({
      include: {
        user: true,
        projects: true
      }
    })

    console.log(`\n📊 Total Partners: ${allPartners.length}`)
    allPartners.forEach((partner, index) => {
      console.log(`\n${index + 1}. ${partner.companyName}`)
      console.log(`   User: ${partner.user.email}`)
      console.log(`   Status: ${partner.status}`)
      console.log(`   Commission: $${partner.totalCommission}`)
      console.log(`   Deals: ${partner.projects.length}`)
    })

  } catch (error) {
    console.error('❌ Error checking real data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkRealData()
