const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function completeFundedDeal() {
  try {
    console.log('🎯 Completing the funded "هواتف مستعملة" deal...')
    
    // Find the specific deal
    const deal = await prisma.project.findFirst({
      where: {
        title: 'هواتف مستعملة',
        status: 'FUNDED'
      },
      include: {
        investments: {
          where: { status: 'ACTIVE' },
          include: {
            investor: {
              select: {
                id: true,
                name: true,
                email: true,
                walletBalance: true
              }
            }
          }
        }
      }
    })

    if (!deal) {
      console.log('❌ Deal not found or already completed')
      return
    }

    console.log(`📋 Deal: ${deal.title}`)
    console.log(`   ID: ${deal.id}`)
    console.log(`   Status: ${deal.status}`)
    console.log(`   Expected Return: ${deal.expectedReturn}%`)
    console.log(`   Active Investments: ${deal.investments.length}`)

    const profitRate = Number(deal.expectedReturn) || 7 // Use 7% as shown in the data

    console.log(`\n🔄 Processing completion with ${profitRate}% return...`)

    await prisma.$transaction(async (tx) => {
      // Update deal status to COMPLETED
      await tx.project.update({
        where: { id: deal.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          actualReturn: profitRate,
          completionNotes: `Deal completed with ${profitRate}% return - Capital returned to investors`
        }
      })

      let totalCapitalReturned = 0
      let totalProfitsDistributed = 0

      // Process each investment
      for (const investment of deal.investments) {
        const investmentAmount = Number(investment.amount)
        const profitAmount = (investmentAmount * profitRate) / 100
        const totalReturn = investmentAmount + profitAmount

        console.log(`\n   👤 ${investment.investor.name}:`)
        console.log(`      💰 Capital: $${investmentAmount.toLocaleString()}`)
        console.log(`      📈 Profit: $${profitAmount.toLocaleString()} (${profitRate}%)`)
        console.log(`      💵 Total Return: $${totalReturn.toLocaleString()}`)
        console.log(`      🏦 Current Wallet: $${Number(investment.investor.walletBalance).toLocaleString()}`)

        // 1. Return the original capital
        await tx.transaction.create({
          data: {
            userId: investment.investorId,
            investmentId: investment.id,
            type: 'RETURN',
            amount: investmentAmount,
            status: 'COMPLETED',
            description: `Capital return from completed deal: ${deal.title}`,
            reference: `CAP-${Date.now()}-${investment.id.slice(-6)}`
          }
        })

        // 2. Distribute profits
        if (profitAmount > 0) {
          await tx.transaction.create({
            data: {
              userId: investment.investorId,
              investmentId: investment.id,
              type: 'RETURN',
              amount: profitAmount,
              status: 'COMPLETED',
              description: `Profit distribution from completed deal: ${deal.title} (${profitRate}% return)`,
              reference: `PROFIT-${Date.now()}-${investment.id.slice(-6)}`
            }
          })
        }

        // 3. Update investor's wallet balance
        const newWalletBalance = Number(investment.investor.walletBalance) + totalReturn
        await tx.user.update({
          where: { id: investment.investorId },
          data: {
            walletBalance: newWalletBalance,
            totalReturns: {
              increment: profitAmount
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

        totalCapitalReturned += investmentAmount
        totalProfitsDistributed += profitAmount

        console.log(`      ✅ New Wallet Balance: $${newWalletBalance.toLocaleString()}`)
      }

      console.log(`\n📊 Summary:`)
      console.log(`   💰 Total Capital Returned: $${totalCapitalReturned.toLocaleString()}`)
      console.log(`   📈 Total Profits Distributed: $${totalProfitsDistributed.toLocaleString()}`)
      console.log(`   👥 Investors Affected: ${deal.investments.length}`)
    })

    console.log(`\n✅ Deal "${deal.title}" completed successfully!`)
    console.log(`🎉 All investors now have their capital + profits in their wallets!`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
completeFundedDeal()
