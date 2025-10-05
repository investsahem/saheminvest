const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function resetAllToZero() {
  console.log('🔄 Starting complete system reset to $0...')
  console.log('⚠️  WARNING: This will delete ALL investments, transactions, and reset all balances!')
  
  try {
    // 1. Get current system stats
    console.log('\n📊 Current system stats:')
    const totalDeals = await prisma.project.count()
    const totalInvestments = await prisma.investment.count()
    const totalTransactions = await prisma.transaction.count()
    const totalUsers = await prisma.user.count()
    
    console.log(`   Deals: ${totalDeals}`)
    console.log(`   Investments: ${totalInvestments}`)
    console.log(`   Transactions: ${totalTransactions}`)
    console.log(`   Users: ${totalUsers}`)

    // 2. Delete all profit distribution requests
    console.log('\n🗑️ Deleting all profit distribution requests...')
    const deletedRequests = await prisma.profitDistributionRequest.deleteMany({})
    console.log(`✅ Deleted ${deletedRequests.count} profit distribution requests`)

    // 3. Delete all profit distributions
    console.log('🗑️ Deleting all profit distributions...')
    const deletedDistributions = await prisma.profitDistribution.deleteMany({})
    console.log(`✅ Deleted ${deletedDistributions.count} profit distributions`)

    // 4. Delete all investments
    console.log('🗑️ Deleting all investments...')
    const deletedInvestments = await prisma.investment.deleteMany({})
    console.log(`✅ Deleted ${deletedInvestments.count} investments`)

    // 5. Delete all transactions
    console.log('🗑️ Deleting all transactions...')
    const deletedTransactions = await prisma.transaction.deleteMany({})
    console.log(`✅ Deleted ${deletedTransactions.count} transactions`)

    // 6. Reset all deal funding to $0
    console.log('💰 Resetting all deal funding to $0...')
    const updatedDeals = await prisma.project.updateMany({
      data: {
        currentFunding: 0
      }
    })
    console.log(`✅ Reset funding for ${updatedDeals.count} deals`)

    // 7. Reset all user wallet balances to $0 (except keep admin accounts with some balance)
    console.log('💳 Resetting user wallet balances...')
    
    // Reset all users to $0 first
    await prisma.user.updateMany({
      data: {
        walletBalance: 0
      }
    })

    // Give admin/demo accounts some balance to work with
    const demoAccounts = [
      { email: 'admin@sahaminvest.com', balance: 100000 },
      { email: 'investor@sahaminvest.com', balance: 50000 },
      { email: 'partner@sahaminvest.com', balance: 25000 },
      { email: 'advisor@sahaminvest.com', balance: 30000 }
    ]

    let updatedUsers = 0
    for (const account of demoAccounts) {
      const user = await prisma.user.findUnique({
        where: { email: account.email }
      })
      
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { walletBalance: account.balance }
        })
        console.log(`   Set ${account.email} balance to $${account.balance}`)
        updatedUsers++
      }
    }
    
    console.log(`✅ Reset wallet balances (${updatedUsers} demo accounts got fresh balance)`)

    // 8. Reset all partner statistics
    console.log('📊 Resetting partner statistics...')
    const updatedPartners = await prisma.partner.updateMany({
      data: {
        totalFunding: 0,
        completedDeals: 0,
        totalCommission: 0,
        averageReturn: 0,
        successRate: 0,
        rating: 0,
        totalRatings: 0
      }
    })
    console.log(`✅ Reset statistics for ${updatedPartners.count} partners`)

    // 9. Show final stats
    console.log('\n✅ RESET COMPLETE!')
    console.log('📊 Final system stats:')
    
    const finalDeals = await prisma.project.findMany({
      select: {
        title: true,
        currentFunding: true,
        fundingGoal: true,
        status: true
      }
    })

    const finalUsers = await prisma.user.findMany({
      select: {
        email: true,
        walletBalance: true,
        role: true
      }
    })

    console.log('\n💰 Deal funding status:')
    finalDeals.forEach(deal => {
      console.log(`   ${deal.title}: $${deal.currentFunding}/$${deal.fundingGoal} (${deal.status})`)
    })

    console.log('\n💳 User wallet balances:')
    finalUsers.forEach(user => {
      if (user.walletBalance > 0) {
        console.log(`   ${user.email} (${user.role}): $${user.walletBalance}`)
      }
    })

    console.log('\n🎉 System successfully reset to starting state!')
    console.log('   - All investments deleted')
    console.log('   - All transactions deleted') 
    console.log('   - All deal funding reset to $0')
    console.log('   - User wallets reset (demo accounts have fresh balance)')
    console.log('   - Partner statistics reset')
    console.log('\nYou can now start fresh with clean data! 🚀')

  } catch (error) {
    console.error('❌ Error during reset:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the reset
resetAllToZero()

