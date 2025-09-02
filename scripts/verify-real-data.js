const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyRealData() {
  console.log('🔍 Verifying all real data creation...\n')

  try {
    // Get all deals
    const realDeals = await prisma.project.findMany({
      where: {
        slug: {
          in: [
            'used-phones-trading', 
            'electronics-rental', 
            'mobile-phones-trading',
            'smart-kids-devices',
            'used-cellular-phones',
            'electrical-tools-phones-installment',
            'financial-transactions'
          ]
        }
      },
      include: {
        investments: {
          include: {
            investor: true,
            transactions: true
          }
        }
      }
    })

    console.log(`📊 Found ${realDeals.length} real deals\n`)

    for (const deal of realDeals) {
      let dealIcon = '📱'
      if (deal.slug === 'electronics-rental') dealIcon = '💻'
      if (deal.slug === 'mobile-phones-trading') dealIcon = '📞'

      console.log(`${dealIcon} ${deal.title}:`)
      console.log(`   Slug: ${deal.slug}`)
      console.log(`   Funding Goal: $${deal.fundingGoal}`)
      console.log(`   Current Funding: $${deal.currentFunding}`)
      console.log(`   Expected Return: ${deal.expectedReturn}%`)
      console.log(`   Duration: ${deal.duration} days`)
      console.log(`   Status: ${deal.status}`)
      console.log(`   Start Date: ${deal.startDate?.toDateString()}`)
      console.log(`   End Date: ${deal.endDate?.toDateString()}`)
      console.log(`   Investments: ${deal.investments.length}\n`)

      // Show investments for this deal
      if (deal.investments.length > 0) {
        console.log('   💰 Investments:')
        for (const investment of deal.investments) {
          console.log(`     Investor: ${investment.investor.name}`)
          console.log(`     Amount: $${investment.amount}`)
          console.log(`     Expected Return: $${investment.expectedReturn}`)
          console.log(`     Actual Return: $${investment.actualReturn}`)
          console.log(`     Status: ${investment.status}`)
          console.log(`     Date: ${investment.investmentDate.toDateString()}`)
          console.log(`     Transactions: ${investment.transactions.length}\n`)
        }
      }
    }

    // Check all real investors
    const realInvestors = await prisma.user.findMany({
      where: {
        email: {
          in: ['adeeb.sharawi@sahaminvest.com', 'houssam.elhaltak@sahaminvest.com']
        }
      },
      include: {
        investments: {
          include: {
            project: true
          }
        },
        transactions: true
      }
    })

    console.log(`👥 Real Investors Summary:\n`)

    for (const investor of realInvestors) {
      console.log(`👤 ${investor.name}:`)
      console.log(`   Email: ${investor.email}`)
      console.log(`   Wallet Balance: $${investor.walletBalance}`)
      console.log(`   Total Invested: $${investor.totalInvested}`)
      console.log(`   Total Returns: $${investor.totalReturns}`)
      console.log(`   Active Investments: ${investor.investments.length}`)
      console.log(`   Total Transactions: ${investor.transactions.length}`)

      // Show investments breakdown
      if (investor.investments.length > 0) {
        console.log('   📈 Investment Breakdown:')
        for (const investment of investor.investments) {
          console.log(`     • ${investment.project.title}: $${investment.amount} (${investment.status})`)
        }
      }

      // Transaction summary
      const transactionSummary = investor.transactions.reduce((acc, transaction) => {
        if (!acc[transaction.type]) {
          acc[transaction.type] = { count: 0, total: 0 }
        }
        acc[transaction.type].count++
        acc[transaction.type].total += parseFloat(transaction.amount)
        return acc
      }, {})

      console.log('   📊 Transaction Summary:')
      for (const [type, summary] of Object.entries(transactionSummary)) {
        console.log(`     ${type}: ${summary.count} transactions, Total: $${summary.total.toFixed(2)}`)
      }
      console.log('')
    }

    // Overall summary
    const totalInvestments = realInvestors.reduce((sum, investor) => sum + parseFloat(investor.totalInvested), 0)
    const totalReturns = realInvestors.reduce((sum, investor) => sum + parseFloat(investor.totalReturns), 0)
    const totalTransactions = realInvestors.reduce((sum, investor) => sum + investor.transactions.length, 0)

    console.log('📊 Overall Summary:')
    console.log(`   Total Real Deals: ${realDeals.length}`)
    console.log(`   Total Real Investors: ${realInvestors.length}`)
    console.log(`   Total Investments: $${totalInvestments.toFixed(2)}`)
    console.log(`   Total Returns: $${totalReturns.toFixed(2)}`)
    console.log(`   Total Transactions: ${totalTransactions}`)

  } catch (error) {
    console.error('❌ Error verifying data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyRealData()
