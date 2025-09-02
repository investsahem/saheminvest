const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixDemoUserBalance() {
  try {
    console.log('🔧 Fixing demo user wallet balance...')
    
    // Update the demo investor to have realistic balance
    const result = await prisma.user.update({
      where: { email: 'investor@sahaminvest.com' },
      data: {
        walletBalance: 0, // Since they have no investments, balance should be 0
        totalInvested: 0,
        totalReturns: 0
      }
    })

    console.log('✅ Updated demo investor:')
    console.log(`   Wallet Balance: $${result.walletBalance}`)
    console.log(`   Total Invested: $${result.totalInvested}`)
    console.log(`   Total Returns: $${result.totalReturns}`)

    console.log('\n📋 Summary:')
    console.log('   - Demo investor now shows $0 wallet balance (dynamic)')
    console.log('   - Real investors show their actual investment data')
    console.log('   - To see real portfolio data, log in as:')
    console.log('     • houssam.elhaltak@sahaminvest.com')
    console.log('     • adeeb.sharawi@sahaminvest.com')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixDemoUserBalance()
