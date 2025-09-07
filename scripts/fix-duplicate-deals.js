const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixDuplicateDeals() {
  try {
    console.log('🔍 Looking for duplicate "هواتف مستعملة" deals...')
    
    // Find all deals with the same title
    const duplicateDeals = await prisma.project.findMany({
      where: { 
        title: 'هواتف مستعملة'
      },
      include: {
        investments: {
          include: {
            profitDistributions: true
          }
        },
        profitDistributions: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    console.log(`Found ${duplicateDeals.length} deals with title "هواتف مستعملة"`)

    if (duplicateDeals.length < 2) {
      console.log('No duplicates found.')
      return
    }

    // Analyze each deal
    for (let i = 0; i < duplicateDeals.length; i++) {
      const deal = duplicateDeals[i]
      const totalProfitDistributions = deal.profitDistributions.reduce((sum, dist) => sum + Number(dist.amount), 0)
      const fundingPercentage = (Number(deal.currentFunding) / Number(deal.fundingGoal)) * 100
      
      console.log(`\n📊 Deal ${i + 1}:`)
      console.log('- ID:', deal.id)
      console.log('- Title:', deal.title)
      console.log('- Expected Return:', deal.expectedReturn + '%')
      console.log('- Funding Goal:', Number(deal.fundingGoal))
      console.log('- Current Funding:', Number(deal.currentFunding))
      console.log('- Funding Percentage:', fundingPercentage.toFixed(1) + '%')
      console.log('- Investments Count:', deal.investments.length)
      console.log('- Profit Distributions Total:', '$' + totalProfitDistributions)
      console.log('- Owner:', deal.owner.name, '(' + deal.owner.email + ')')
      console.log('- Created:', deal.createdAt)
      console.log('- Status:', deal.status)
    }

    // Identify the problematic deal (the one with wrong data)
    let dealToDelete = null
    let dealToKeep = null

    for (const deal of duplicateDeals) {
      const fundingPercentage = (Number(deal.currentFunding) / Number(deal.fundingGoal)) * 100
      const totalProfitDistributions = deal.profitDistributions.reduce((sum, dist) => sum + Number(dist.amount), 0)
      
      // The bad deal has 1.4% return or extremely high funding percentage
      if (Number(deal.expectedReturn) === 1.4 || fundingPercentage > 1000) {
        dealToDelete = deal
      } else if (Number(deal.expectedReturn) === 4 && fundingPercentage === 100) {
        dealToKeep = deal
      }
    }

    if (!dealToDelete) {
      console.log('❌ Could not identify which deal to delete. Manual inspection needed.')
      return
    }

    if (!dealToKeep) {
      console.log('❌ Could not identify which deal to keep. Manual inspection needed.')
      return
    }

    console.log(`\n🗑️ Deal to DELETE:`)
    console.log('- ID:', dealToDelete.id)
    console.log('- Expected Return:', dealToDelete.expectedReturn + '%')
    console.log('- Current Funding:', Number(dealToDelete.currentFunding))
    console.log('- Funding %:', ((Number(dealToDelete.currentFunding) / Number(dealToDelete.fundingGoal)) * 100).toFixed(1) + '%')

    console.log(`\n✅ Deal to KEEP:`)
    console.log('- ID:', dealToKeep.id)
    console.log('- Expected Return:', dealToKeep.expectedReturn + '%')
    console.log('- Current Funding:', Number(dealToKeep.currentFunding))
    console.log('- Funding %:', ((Number(dealToKeep.currentFunding) / Number(dealToKeep.fundingGoal)) * 100).toFixed(1) + '%')

    // Ask for confirmation (in a real scenario, you'd want manual confirmation)
    console.log('\n⚠️ About to delete the problematic deal. Proceeding...')

    // Delete related records first (due to foreign key constraints)
    
    // 1. Delete profit distributions
    console.log('🗑️ Deleting profit distributions...')
    const deletedDistributions = await prisma.profitDistribution.deleteMany({
      where: { projectId: dealToDelete.id }
    })
    console.log(`Deleted ${deletedDistributions.count} profit distributions`)

    // 2. Delete investments
    console.log('🗑️ Deleting investments...')
    const deletedInvestments = await prisma.investment.deleteMany({
      where: { projectId: dealToDelete.id }
    })
    console.log(`Deleted ${deletedInvestments.count} investments`)

    // 3. Delete the deal itself
    console.log('🗑️ Deleting the duplicate deal...')
    await prisma.project.delete({
      where: { id: dealToDelete.id }
    })

    console.log('✅ Duplicate deal deleted successfully!')

    // Verify the remaining deal
    const remainingDeal = await prisma.project.findUnique({
      where: { id: dealToKeep.id },
      include: {
        investments: true,
        profitDistributions: true
      }
    })

    if (remainingDeal) {
      const fundingPercentage = (Number(remainingDeal.currentFunding) / Number(remainingDeal.fundingGoal)) * 100
      const totalProfitDistributions = remainingDeal.profitDistributions.reduce((sum, dist) => sum + Number(dist.amount), 0)
      
      console.log('\n🎉 Verification - Remaining deal:')
      console.log('- ID:', remainingDeal.id)
      console.log('- Title:', remainingDeal.title)
      console.log('- Expected Return:', remainingDeal.expectedReturn + '%')
      console.log('- Funding:', `${Number(remainingDeal.currentFunding)} / ${Number(remainingDeal.fundingGoal)} (${fundingPercentage.toFixed(1)}%)`)
      console.log('- Investments:', remainingDeal.investments.length)
      console.log('- Profit Distributions Total:', '$' + totalProfitDistributions)
      console.log('- Status:', remainingDeal.status)
    }

    console.log('\n✅ Duplicate deal cleanup completed!')

  } catch (error) {
    console.error('❌ Error fixing duplicate deals:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
fixDuplicateDeals()
