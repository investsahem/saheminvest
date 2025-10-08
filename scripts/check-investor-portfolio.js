const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkInvestorPortfolio() {
  try {
    const investorEmail = 'Elhallak+10@gmail.com'
    
    console.log(`\n🔍 Checking portfolio data for ${investorEmail}...\n`)
    
    // Find the investor
    const investor = await prisma.user.findUnique({
      where: { email: investorEmail },
      select: {
        id: true,
        name: true,
        email: true,
        walletBalance: true,
        totalReturns: true
      }
    })

    if (!investor) {
      console.log('❌ Investor not found')
      return
    }

    console.log('👤 Investor Info:')
    console.log(`   Name: ${investor.name}`)
    console.log(`   Email: ${investor.email}`)
    console.log(`   Wallet Balance: $${Number(investor.walletBalance).toFixed(2)}`)
    console.log(`   Total Returns: $${Number(investor.totalReturns).toFixed(2)}`)

    // Get all investments
    const investments = await prisma.investment.findMany({
      where: { investorId: investor.id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      }
    })

    console.log(`\n💰 Investments (${investments.length} total):`)
    let totalInvested = 0
    for (const inv of investments) {
      const amount = Number(inv.amount)
      totalInvested += amount
      console.log(`   - ${inv.project.title}: $${amount.toFixed(2)} (${inv.project.status})`)
    }
    console.log(`   Total Invested: $${totalInvested.toFixed(2)}`)

    // Get all profit distribution transactions
    const profitTransactions = await prisma.transaction.findMany({
      where: {
        userId: investor.id,
        type: 'PROFIT_DISTRIBUTION',
        status: 'COMPLETED'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`\n💸 Profit Distribution Transactions (${profitTransactions.length} total):`)
    let totalProfits = 0
    for (const tx of profitTransactions) {
      const amount = Number(tx.amount)
      totalProfits += amount
      console.log(`   - $${amount.toFixed(2)} - ${tx.description}`)
      console.log(`     Created: ${tx.createdAt.toISOString()}`)
      console.log(`     Investment ID: ${tx.investmentId || 'N/A'}`)
    }
    console.log(`   Total Profits Received: $${totalProfits.toFixed(2)}`)

    // Calculate expected portfolio value
    console.log(`\n📊 Expected Portfolio Calculations:`)
    console.log(`   Total Invested: $${totalInvested.toFixed(2)}`)
    console.log(`   + Distributed Profits: $${totalProfits.toFixed(2)}`)
    console.log(`   = Expected Portfolio Value: $${(totalInvested + totalProfits).toFixed(2)}`)
    console.log(`   Expected Total Returns: $${totalProfits.toFixed(2)}`)

    // Test the API endpoint logic
    console.log(`\n🧪 Testing API Logic:`)
    for (const investment of investments) {
      const profitTxs = await prisma.transaction.findMany({
        where: {
          investmentId: investment.id,
          type: { in: ['RETURN', 'PROFIT_DISTRIBUTION'] },
          status: 'COMPLETED',
          AND: [
            { description: { not: { contains: 'Capital return' } } },
            { description: { not: { contains: 'capital return' } } }
          ]
        }
      })
      
      const distributedProfits = profitTxs.reduce((sum, tx) => sum + Number(tx.amount), 0)
      
      console.log(`   Investment ${investment.id} (${investment.project.title}):`)
      console.log(`     Amount: $${Number(investment.amount).toFixed(2)}`)
      console.log(`     Distributed Profits: $${distributedProfits.toFixed(2)}`)
      console.log(`     Matching Transactions: ${profitTxs.length}`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkInvestorPortfolio()
