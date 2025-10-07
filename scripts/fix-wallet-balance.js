const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixWalletBalance() {
  try {
    console.log('🔍 Analyzing wallet balance issue...')
    
    // Find the user with the $4,953 investment
    const users = await prisma.user.findMany({
      where: {
        totalInvested: {
          gt: 0
        }
      },
      include: {
        investments: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
                status: true,
                expectedReturn: true
              }
            }
          }
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    console.log(`📊 Found ${users.length} users with investments`)

    for (const user of users) {
      console.log(`\n👤 User: ${user.name} (${user.email})`)
      console.log(`   💰 Wallet Balance: $${Number(user.walletBalance).toLocaleString()}`)
      console.log(`   📊 Total Invested: $${Number(user.totalInvested).toLocaleString()}`)
      console.log(`   📈 Total Returns: $${Number(user.totalReturns).toLocaleString()}`)
      console.log(`   🎯 Active Investments: ${user.investments.length}`)

      // Check each investment
      for (const investment of user.investments) {
        console.log(`\n   📋 Investment in: ${investment.project.title}`)
        console.log(`      💵 Amount: $${Number(investment.amount).toLocaleString()}`)
        console.log(`      📊 Status: ${investment.status}`)
        console.log(`      🎯 Project Status: ${investment.project.status}`)
        console.log(`      📈 Expected Return: ${investment.project.expectedReturn}%`)

        // If the project is completed or the investment is old, complete it
        const investmentAge = Date.now() - new Date(investment.investmentDate).getTime()
        const daysSinceInvestment = Math.floor(investmentAge / (1000 * 60 * 60 * 24))
        
        if (investment.status === 'ACTIVE' && (investment.project.status === 'COMPLETED' || daysSinceInvestment > 60)) {
          console.log(`      🎯 Completing investment (${daysSinceInvestment} days old)...`)
          
          await completeInvestment(investment, user)
        }
      }
    }

    console.log('\n✅ Wallet balance analysis completed!')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function completeInvestment(investment, user) {
  try {
    const investmentAmount = Number(investment.amount)
    const profitRate = Number(investment.project.expectedReturn) || 0
    const profitAmount = (investmentAmount * profitRate) / 100

    console.log(`        💰 Returning capital: $${investmentAmount.toLocaleString()}`)
    console.log(`        📈 Profit (${profitRate}%): $${profitAmount.toLocaleString()}`)

    await prisma.$transaction(async (tx) => {
      // 1. Return the original capital to investor's wallet
      await tx.transaction.create({
        data: {
          userId: user.id,
          investmentId: investment.id,
          type: 'RETURN',
          amount: investmentAmount,
          status: 'COMPLETED',
          description: `Capital return from completed investment: ${investment.project.title}`,
          reference: `CAP-${Date.now()}-${investment.id.slice(-6)}`
        }
      })

      // 2. Distribute profits (if any)
      if (profitAmount > 0) {
        await tx.transaction.create({
          data: {
            userId: user.id,
            investmentId: investment.id,
            type: 'RETURN',
            amount: profitAmount,
            status: 'COMPLETED',
            description: `Profit from completed investment: ${investment.project.title} (${profitRate}% return)`,
            reference: `PROFIT-${Date.now()}-${investment.id.slice(-6)}`
          }
        })
      }

      // 3. Update investor's wallet balance
      await tx.user.update({
        where: { id: user.id },
        data: {
          walletBalance: {
            increment: investmentAmount + profitAmount // Capital + Profit
          },
          totalReturns: {
            increment: profitAmount // Only count profit as returns
          }
        }
      })

      // 4. Mark investment as completed
      await tx.investment.update({
        where: { id: investment.id },
        data: {
          status: 'COMPLETED',
          actualReturn: profitAmount,
          completedAt: new Date()
        }
      })

      // 5. Update project status if needed
      if (investment.project.status !== 'COMPLETED') {
        await tx.project.update({
          where: { id: investment.project.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
            actualReturn: profitRate
          }
        })
      }
    })

    console.log(`        ✅ Investment completed successfully!`)
    console.log(`        💰 Total returned: $${(investmentAmount + profitAmount).toLocaleString()}`)

  } catch (error) {
    console.error(`        ❌ Error completing investment:`, error)
  }
}

// Run the script
fixWalletBalance()
