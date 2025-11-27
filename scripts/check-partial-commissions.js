const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkPartialCommissions() {
  try {
    console.log('🔍 Checking partial distributions...')
    
    const deal = await prisma.project.findFirst({
      where: { currentFunding: 19953 },
      include: {
        profitDistributionRequests: {
          where: {
            distributionType: 'PARTIAL',
            status: 'APPROVED'
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!deal) {
      console.log('❌ Deal not found!')
      return
    }

    console.log(`✅ Found deal: ${deal.title}`)
    console.log(`\n📦 Partial distributions (${deal.profitDistributionRequests.length}):`)
    
    let totalAmount = 0
    let totalReserve = 0
    let totalSahem = 0
    let totalToInvestors = 0

    deal.profitDistributionRequests.forEach((dist, index) => {
      const amount = Number(dist.totalAmount)
      const reserve = Number(dist.reservedAmount || 0)
      const sahem = Number(dist.sahemInvestAmount || 0)
      const toInvestors = amount - reserve - sahem

      console.log(`\nPartial ${index + 1}:`)
      console.log(`  Total Amount: $${amount}`)
      console.log(`  Reserve: $${reserve} (${dist.reservedGainPercent || 0}%)`)
      console.log(`  Sahem: $${sahem} (${dist.sahemInvestPercent || 0}%)`)
      console.log(`  To Investors: $${toInvestors}`)

      totalAmount += amount
      totalReserve += reserve
      totalSahem += sahem
      totalToInvestors += toInvestors
    })

    console.log(`\n📊 Totals:`)
    console.log(`  Total Amount: $${totalAmount}`)
    console.log(`  Total Reserve: $${totalReserve}`)
    console.log(`  Total Sahem: $${totalSahem}`)
    console.log(`  Total To Investors: $${totalToInvestors}`)
    console.log(`\n  Capital remaining: $${19953 - totalToInvestors}`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPartialCommissions()

