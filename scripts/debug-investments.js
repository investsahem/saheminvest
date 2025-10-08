const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugInvestmentsAndTransactions() {
  try {
    console.log('🔍 Checking existing investments and transactions...')
    
    // Check all projects
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            investments: true
          }
        }
      }
    })

    console.log('\n📊 Projects:')
    projects.forEach(project => {
      console.log(`  - ${project.title} (${project._count.investments} investments)`)
    })

    // Check all investments
    const investments = await prisma.investment.findMany({
      include: {
        investor: {
          select: {
            email: true,
            name: true
          }
        },
        project: {
          select: {
            title: true
          }
        }
      }
    })

    console.log('\n💰 Investments:')
    investments.forEach(investment => {
      console.log(`  - ${investment.investor.email} invested $${investment.amount} in "${investment.project.title}"`)
    })

    // Check profit distribution transactions
    const profitTransactions = await prisma.transaction.findMany({
      where: {
        type: 'PROFIT_DISTRIBUTION'
      },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    })

    console.log('\n💸 Profit Distribution Transactions:')
    profitTransactions.forEach(transaction => {
      console.log(`  - ${transaction.user.email}: $${transaction.amount} - ${transaction.description}`)
    })

    // Check users who have both investments and profit transactions
    console.log('\n🔗 Matching users:')
    const investorEmails = [...new Set(investments.map(inv => inv.investor.email))]
    const profitEmails = [...new Set(profitTransactions.map(tx => tx.user.email))]
    
    investorEmails.forEach(email => {
      const hasProfit = profitEmails.includes(email)
      console.log(`  - ${email}: ${hasProfit ? '✅ Has both investment and profit' : '❌ No profit transaction'}`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugInvestmentsAndTransactions()
