// Reset deal 13j4j6zh with accurate test data
// This script clears existing data and sets up:
// - 6 investments totaling $19,953
// - 2 partial distributions totaling $1,399.47
// - Ready for final distribution testing

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const DEAL_ID = '13j4j6zh'

// Test data
const INVESTORS = [
  { name: 'Houssam EL Hallak', email: 'houssam.elhallak@sahaminvest.com', amount: 4953 },
  { name: 'اسيا قلموني', email: 'asia.qalmoni@sahaminvest.com', amount: 3000 },
  { name: 'رامز قلموني', email: 'ramez.qalmoni@sahaminvest.com', amount: 3000 },
  { name: 'جليلة قلموني', email: 'jalila.qalmoni@sahaminvest.com', amount: 3000 },
  { name: 'احمد علوان', email: 'ahmad.alwan@sahaminvest.com', amount: 3000 },
  { name: 'عثمان حداد', email: 'othman.haddad@sahaminvest.com', amount: 3000 }
]

const PARTIAL_DISTRIBUTION_1 = {
  date: new Date('2025-05-15'),
  distributions: [
    { email: 'houssam.elhallak@sahaminvest.com', amount: 147.5266877 },
    { email: 'asia.qalmoni@sahaminvest.com', amount: 110.4946625 },
    { email: 'ramez.qalmoni@sahaminvest.com', amount: 110.4946625 },
    { email: 'jalila.qalmoni@sahaminvest.com', amount: 110.4946625 },
    { email: 'ahmad.alwan@sahaminvest.com', amount: 110.4946625 },
    { email: 'othman.haddad@sahaminvest.com', amount: 110.4946625 }
  ]
}

const PARTIAL_DISTRIBUTION_2 = {
  date: new Date('2025-05-27'),
  distributions: [
    { email: 'houssam.elhallak@sahaminvest.com', amount: 200.00 },
    { email: 'asia.qalmoni@sahaminvest.com', amount: 100.00 },
    { email: 'ramez.qalmoni@sahaminvest.com', amount: 100.00 },
    { email: 'jalila.qalmoni@sahaminvest.com', amount: 100.00 },
    { email: 'ahmad.alwan@sahaminvest.com', amount: 100.00 },
    { email: 'othman.haddad@sahaminvest.com', amount: 100.00 }
  ]
}

async function clearDealData(dealId) {
  console.log(`\n🗑️  Clearing existing data for deal ${dealId}...`)
  
  try {
    // Delete in correct order to respect foreign key constraints
    const deletedDistributions = await prisma.profitDistribution.deleteMany({
      where: { projectId: dealId }
    })
    console.log(`   ✅ Deleted ${deletedDistributions.count} profit distributions`)

    const deletedRequests = await prisma.profitDistributionRequest.deleteMany({
      where: { projectId: dealId }
    })
    console.log(`   ✅ Deleted ${deletedRequests.count} distribution requests`)

    const deletedInvestments = await prisma.investment.deleteMany({
      where: { projectId: dealId }
    })
    console.log(`   ✅ Deleted ${deletedInvestments.count} investments`)

    // Reset deal to clean state
    await prisma.project.update({
      where: { id: dealId },
      data: {
        currentFunding: 0,
        status: 'ACTIVE'
      }
    })
    console.log(`   ✅ Reset deal status and funding`)

  } catch (error) {
    console.error('   ❌ Error clearing data:', error)
    throw error
  }
}

async function ensureInvestorsExist() {
  console.log(`\n👥 Ensuring investors exist...`)
  
  const investorMap = new Map()
  
  for (const investorData of INVESTORS) {
    let investor = await prisma.user.findUnique({
      where: { email: investorData.email }
    })

    if (!investor) {
      console.log(`   ➕ Creating investor: ${investorData.name}`)
      investor = await prisma.user.create({
        data: {
          email: investorData.email,
          name: investorData.name,
          role: 'INVESTOR',
          emailVerified: new Date(),
          walletBalance: 0,
          totalReturns: 0
        }
      })
    } else {
      console.log(`   ✅ Investor exists: ${investorData.name}`)
      // Reset wallet for clean test
      await prisma.user.update({
        where: { id: investor.id },
        data: {
          walletBalance: 0,
          totalReturns: 0
        }
      })
    }

    investorMap.set(investorData.email, investor)
  }

  return investorMap
}

async function createInvestments(dealId, investorMap) {
  console.log(`\n💰 Creating investments...`)
  
  const investmentDate = new Date('2025-05-27')
  const investments = []
  let totalFunding = 0

  for (const investorData of INVESTORS) {
    const investor = investorMap.get(investorData.email)
    
    const investment = await prisma.investment.create({
      data: {
        amount: investorData.amount,
        projectId: dealId,
        investorId: investor.id,
        status: 'APPROVED',
        investmentDate: investmentDate,
        createdAt: investmentDate,
        updatedAt: investmentDate
      }
    })

    investments.push(investment)
    totalFunding += investorData.amount
    console.log(`   ✅ ${investorData.name}: $${investorData.amount}`)
  }

  // Update deal with total funding
  await prisma.project.update({
    where: { id: dealId },
    data: { currentFunding: totalFunding }
  })

  console.log(`   📊 Total funding: $${totalFunding}`)
  return investments
}

async function createPartialDistribution(dealId, investorMap, distributionData, distributionNumber) {
  console.log(`\n💸 Creating Partial Distribution #${distributionNumber} (${distributionData.date.toISOString().split('T')[0]})...`)
  
  let totalDistributed = 0

  for (const dist of distributionData.distributions) {
    const investor = investorMap.get(dist.email)
    if (!investor) {
      console.log(`   ⚠️  Investor not found for ${dist.email}`)
      continue
    }

    // Find the investment
    const investment = await prisma.investment.findFirst({
      where: {
        projectId: dealId,
        investorId: investor.id
      }
    })

    if (!investment) {
      console.log(`   ⚠️  Investment not found for ${investor.name}`)
      continue
    }

    // Calculate profit rate
    const investmentAmount = Number(investment.amount)
    const profitRate = (dist.amount / investmentAmount) * 100

    // Create profit distribution record
    await prisma.profitDistribution.create({
      data: {
        amount: dist.amount,
        distributionDate: distributionData.date,
        profitPeriod: 'PARTIAL',
        status: 'COMPLETED',
        profitRate: profitRate,
        investmentShare: (investmentAmount / 19953) * 100,
        investmentId: investment.id,
        projectId: dealId,
        investorId: investor.id,
        createdAt: distributionData.date,
        updatedAt: distributionData.date
      }
    })

    // Update investor wallet
    const currentBalance = Number(investor.walletBalance) || 0
    const currentReturns = Number(investor.totalReturns) || 0
    
    await prisma.user.update({
      where: { id: investor.id },
      data: {
        walletBalance: currentBalance + dist.amount,
        totalReturns: currentReturns + dist.amount
      }
    })

    totalDistributed += dist.amount
    console.log(`   ✅ ${investor.name}: $${dist.amount.toFixed(2)}`)
  }

  console.log(`   📊 Total distributed: $${totalDistributed.toFixed(2)}`)
  return totalDistributed
}

async function verifyDealState(dealId, investorMap) {
  console.log(`\n✅ Verifying deal state...`)

  const deal = await prisma.project.findUnique({
    where: { id: dealId },
    include: {
      investments: true,
      profitDistributions: true
    }
  })

  console.log(`\n📊 Deal Summary:`)
  console.log(`   Deal ID: ${dealId}`)
  console.log(`   Status: ${deal.status}`)
  console.log(`   Total Funding: $${Number(deal.currentFunding)}`)
  console.log(`   Investments: ${deal.investments.length}`)
  console.log(`   Profit Distributions: ${deal.profitDistributions.length}`)

  // Calculate totals per investor
  console.log(`\n👥 Per Investor Status:`)
  for (const investorData of INVESTORS) {
    const investor = investorMap.get(investorData.email)
    const investment = deal.investments.find(inv => inv.investorId === investor.id)
    const distributions = deal.profitDistributions.filter(dist => dist.investorId === investor.id)
    const totalReceived = distributions.reduce((sum, dist) => sum + Number(dist.amount), 0)

    console.log(`   ${investorData.name}:`)
    console.log(`      Invested: $${investorData.amount}`)
    console.log(`      Received in Partials: $${totalReceived.toFixed(2)} (${distributions.length} distributions)`)
    console.log(`      Wallet Balance: $${Number(investor.walletBalance).toFixed(2)}`)
  }

  const totalPartials = deal.profitDistributions.reduce((sum, dist) => sum + Number(dist.amount), 0)
  console.log(`\n💰 Total Partial Distributions: $${totalPartials.toFixed(2)}`)
}

async function main() {
  console.log('🚀 Starting deal reset for 13j4j6zh...')
  console.log('=' .repeat(60))

  try {
    // Step 1: Clear existing data
    await clearDealData(DEAL_ID)

    // Step 2: Ensure investors exist
    const investorMap = await ensureInvestorsExist()

    // Step 3: Create investments
    await createInvestments(DEAL_ID, investorMap)

    // Step 4: Create partial distribution #1
    const total1 = await createPartialDistribution(DEAL_ID, investorMap, PARTIAL_DISTRIBUTION_1, 1)

    // Step 5: Create partial distribution #2
    const total2 = await createPartialDistribution(DEAL_ID, investorMap, PARTIAL_DISTRIBUTION_2, 2)

    // Step 6: Verify everything
    await verifyDealState(DEAL_ID, investorMap)

    console.log('\n' + '='.repeat(60))
    console.log('✅ Deal reset completed successfully!')
    console.log('=' .repeat(60))
    console.log('\n📝 Next Steps:')
    console.log('   1. Partner can now submit FINAL distribution request')
    console.log('   2. Admin should see:')
    console.log(`      - Historical partials: $${(total1 + total2).toFixed(2)}`)
    console.log('      - Final payment: Calculated after subtracting partials')
    console.log('      - Grand total: Complete picture')
    console.log('\n')

  } catch (error) {
    console.error('\n❌ Error during reset:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
main()

