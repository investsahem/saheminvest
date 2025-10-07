const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function completeDealsWithInvestments() {
  try {
    console.log('🔍 Finding deals with investments but 0% funding progress...')
    
    // Find deals that have investments but show 0% progress
    const dealsWithInvestments = await prisma.project.findMany({
      where: {
        status: {
          in: ['ACTIVE', 'PUBLISHED', 'FUNDED']
        }
      },
      include: {
        investments: {
          where: { status: 'ACTIVE' },
          include: {
            investor: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    console.log(`📊 Found ${dealsWithInvestments.length} deals to check`)

    for (const deal of dealsWithInvestments) {
      if (deal.investments.length > 0) {
        const totalInvested = deal.investments.reduce((sum, inv) => sum + Number(inv.amount), 0)
        const fundingProgress = (totalInvested / Number(deal.fundingGoal)) * 100
        
        console.log(`\n📋 Deal: ${deal.title}`)
        console.log(`   ID: ${deal.id}`)
        console.log(`   Status: ${deal.status}`)
        console.log(`   Funding Goal: $${Number(deal.fundingGoal).toLocaleString()}`)
        console.log(`   Current Funding: $${Number(deal.currentFunding).toLocaleString()}`)
        console.log(`   Actual Invested: $${totalInvested.toLocaleString()}`)
        console.log(`   Funding Progress: ${fundingProgress.toFixed(1)}%`)
        console.log(`   Investors: ${deal.investments.length}`)

        // If there's a mismatch between currentFunding and actual investments
        if (Math.abs(Number(deal.currentFunding) - totalInvested) > 0.01) {
          console.log(`   ⚠️  Mismatch detected! Updating currentFunding...`)
          
          await prisma.project.update({
            where: { id: deal.id },
            data: {
              currentFunding: totalInvested
            }
          })
          
          console.log(`   ✅ Updated currentFunding to $${totalInvested.toLocaleString()}`)
        }

        // If the deal appears to be completed (has investments but low funding progress)
        // and it's an older deal, mark it as completed
        const dealAge = Date.now() - new Date(deal.createdAt).getTime()
        const daysSinceCreation = Math.floor(dealAge / (1000 * 60 * 60 * 24))
        
        if (daysSinceCreation > 30 && deal.status !== 'COMPLETED') {
          console.log(`   🎯 Deal is ${daysSinceCreation} days old with investments. Completing deal...`)
          
          // Complete the deal using our new completion logic
          await completeDealsManually(deal.id, Number(deal.expectedReturn))
        }
      }
    }

    console.log('\n✅ Deal analysis and updates completed!')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function completeDealsManually(dealId, finalProfitRate = null) {
  try {
    // Get the deal with all investments
    const deal = await prisma.project.findUnique({
      where: { id: dealId },
      include: {
        investments: {
          where: { status: 'ACTIVE' },
          include: {
            investor: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!deal) {
      throw new Error(`Deal ${dealId} not found`)
    }

    if (deal.status === 'COMPLETED') {
      console.log(`   ⚠️  Deal ${deal.title} is already completed`)
      return
    }

    // Use the provided profit rate or the expected return as default
    const profitRate = finalProfitRate !== null ? finalProfitRate : Number(deal.expectedReturn)

    const result = await prisma.$transaction(async (tx) => {
      // Update deal status to COMPLETED
      const updatedDeal = await tx.project.update({
        where: { id: dealId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          actualReturn: profitRate,
          completionNotes: `Deal completed automatically with ${profitRate}% return`
        }
      })

      const capitalReturns = []
      const profitDistributions = []

      // Process each investment
      for (const investment of deal.investments) {
        const investmentAmount = Number(investment.amount)
        const profitAmount = (investmentAmount * profitRate) / 100

        console.log(`     👤 Processing investor ${investment.investor.name}:`)
        console.log(`        💰 Capital: $${investmentAmount.toLocaleString()}`)
        console.log(`        📈 Profit: $${profitAmount.toLocaleString()} (${profitRate}%)`)

        // 1. Return the original capital to investor's wallet
        const capitalReturn = await tx.transaction.create({
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

        // 2. Distribute profits (if any)
        let profitReturn = null
        if (profitAmount > 0) {
          profitReturn = await tx.transaction.create({
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
        await tx.user.update({
          where: { id: investment.investorId },
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

        capitalReturns.push(capitalReturn)
        if (profitReturn) {
          profitDistributions.push(profitReturn)
        }
      }

      return {
        deal: updatedDeal,
        capitalReturns,
        profitDistributions,
        totalCapitalReturned: deal.investments.reduce((sum, inv) => sum + Number(inv.amount), 0),
        totalProfitsDistributed: deal.investments.reduce((sum, inv) => sum + (Number(inv.amount) * profitRate) / 100, 0),
        investorCount: deal.investments.length
      }
    })

    console.log(`   ✅ Deal "${deal.title}" completed successfully!`)
    console.log(`      💰 Total capital returned: $${result.totalCapitalReturned.toLocaleString()}`)
    console.log(`      📈 Total profits distributed: $${result.totalProfitsDistributed.toLocaleString()}`)
    console.log(`      👥 Investors affected: ${result.investorCount}`)

    return result

  } catch (error) {
    console.error(`❌ Error completing deal ${dealId}:`, error)
    throw error
  }
}

// Run the script
completeDealsWithInvestments()
