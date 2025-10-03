const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function resetDealInvestments() {
  console.log('🔄 Resetting investments for deal cmg254qhr0001vuog13j4j6zh...')

  try {
    const dealId = 'cmg254qhr0001vuog13j4j6zh'
    
    // First, check if the deal exists
    const deal = await prisma.project.findUnique({
      where: { id: dealId },
      include: {
        investments: {
          include: {
            investor: {
              select: {
                email: true,
                name: true
              }
            }
          }
        }
      }
    })

    if (!deal) {
      console.log('❌ Deal not found!')
      return
    }

    console.log(`✅ Found deal: ${deal.title}`)
    console.log(`   Current funding: $${deal.currentFunding}`)
    console.log(`   Funding goal: $${deal.fundingGoal}`)
    console.log(`   Current investments: ${deal.investments.length}`)

    if (deal.investments.length > 0) {
      console.log('\n📋 Current investments:')
      deal.investments.forEach((investment, index) => {
        console.log(`  ${index + 1}. ${investment.investor.name || investment.investor.email}: $${investment.amount}`)
      })

      // Delete all investments for this deal
      console.log('\n🗑️ Deleting all investments...')
      const deletedInvestments = await prisma.investment.deleteMany({
        where: { projectId: dealId }
      })
      console.log(`✅ Deleted ${deletedInvestments.count} investments`)

      // Delete related transactions
      console.log('🗑️ Deleting related transactions...')
      const deletedTransactions = await prisma.transaction.deleteMany({
        where: {
          description: {
            contains: deal.title
          }
        }
      })
      console.log(`✅ Deleted ${deletedTransactions.count} related transactions`)

      // Delete profit distributions for this deal
      console.log('🗑️ Deleting profit distributions...')
      const deletedDistributions = await prisma.profitDistribution.deleteMany({
        where: { projectId: dealId }
      })
      console.log(`✅ Deleted ${deletedDistributions.count} profit distributions`)

      // Delete profit distribution requests for this deal
      console.log('🗑️ Deleting profit distribution requests...')
      const deletedRequests = await prisma.profitDistributionRequest.deleteMany({
        where: { projectId: dealId }
      })
      console.log(`✅ Deleted ${deletedRequests.count} profit distribution requests`)
    }

    // Reset the deal's current funding to 0
    console.log('\n💰 Resetting deal funding to $0...')
    const updatedDeal = await prisma.project.update({
      where: { id: dealId },
      data: {
        currentFunding: 0
      }
    })

    console.log('✅ Deal investments reset successfully!')
    console.log(`   Deal: ${updatedDeal.title}`)
    console.log(`   Current funding: $${updatedDeal.currentFunding}`)
    console.log(`   Funding goal: $${updatedDeal.fundingGoal}`)
    console.log(`   Status: ${updatedDeal.status}`)

    // Update partner statistics
    console.log('\n📊 Updating partner statistics...')
    const partner = await prisma.partner.findFirst({
      where: {
        user: {
          projects: {
            some: {
              id: dealId
            }
          }
        }
      }
    })

    if (partner) {
      // Recalculate partner's total funding from all their deals
      const partnerDeals = await prisma.project.findMany({
        where: { ownerId: partner.userId }
      })

      const totalFunding = partnerDeals.reduce((sum, deal) => sum + Number(deal.currentFunding), 0)

      await prisma.partner.update({
        where: { id: partner.id },
        data: {
          totalFunding: totalFunding
        }
      })

      console.log(`✅ Updated partner total funding to $${totalFunding}`)
    }

  } catch (error) {
    console.error('❌ Error resetting deal investments:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetDealInvestments()
