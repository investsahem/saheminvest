const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function removeUnwantedInvestor() {
  try {
    console.log('🔍 Looking for unwanted investor to remove...')
    
    // Find the deal
    const deal = await prisma.project.findFirst({
      where: { 
        title: 'هواتف مستعملة',
        expectedReturn: 4,
        id: 'cmf9y3xx90001vu7pbf8xsz5n'
      },
      include: {
        investments: {
          include: {
            investor: {
              select: { id: true, name: true, email: true }
            },
            profitDistributions: true
          }
        }
      }
    })

    if (!deal) {
      console.error('❌ Deal not found')
      return
    }

    console.log('✅ Deal found:', deal.title)
    console.log('Current investors:', deal.investments.length)

    // Find the investor to remove (adeeb.sharawi@sahaminvest.com)
    const investmentToRemove = deal.investments.find(inv => 
      inv.investor.email === 'adeeb.sharawi@sahaminvest.com'
    )

    if (!investmentToRemove) {
      console.log('❌ Investor adeeb.sharawi@sahaminvest.com not found in this deal')
      return
    }

    console.log('🗑️ Found investor to remove:')
    console.log('- Name:', investmentToRemove.investor.name)
    console.log('- Email:', investmentToRemove.investor.email)
    console.log('- Investment ID:', investmentToRemove.id)
    console.log('- Investment Amount:', Number(investmentToRemove.amount))
    console.log('- Profit Distributions:', investmentToRemove.profitDistributions.length)

    // Find the investor to keep (اديب شعراني)
    const investmentToKeep = deal.investments.find(inv => 
      inv.investor.email === 'Elhallak+15@gmail.com'
    )

    if (!investmentToKeep) {
      console.error('❌ Investor اديب شعراني not found in this deal')
      return
    }

    console.log('✅ Investor to keep:')
    console.log('- Name:', investmentToKeep.investor.name)
    console.log('- Email:', investmentToKeep.investor.email)
    console.log('- Investment Amount:', Number(investmentToKeep.amount))

    // Delete profit distributions for the unwanted investor
    console.log('🗑️ Deleting profit distributions for unwanted investor...')
    const deletedDistributions = await prisma.profitDistribution.deleteMany({
      where: { 
        investmentId: investmentToRemove.id
      }
    })
    console.log(`Deleted ${deletedDistributions.count} profit distributions`)

    // Delete the investment
    console.log('🗑️ Deleting investment...')
    await prisma.investment.delete({
      where: { id: investmentToRemove.id }
    })
    console.log('✅ Investment deleted')

    // Update the investor's totals (subtract the removed investment)
    console.log('🔄 Updating investor totals...')
    await prisma.user.update({
      where: { id: investmentToRemove.investor.id },
      data: {
        totalInvested: { decrement: Number(investmentToRemove.amount) },
        totalReturns: { decrement: Number(investmentToRemove.expectedReturn) }
      }
    })
    console.log('✅ Updated investor totals')

    // Update deal funding (subtract the removed investment)
    console.log('🔄 Updating deal funding...')
    await prisma.project.update({
      where: { id: deal.id },
      data: {
        currentFunding: { decrement: Number(investmentToRemove.amount) }
      }
    })
    console.log('✅ Updated deal funding')

    // Final verification
    const finalCheck = await prisma.project.findUnique({
      where: { id: deal.id },
      include: {
        investments: {
          include: {
            investor: {
              select: { name: true, email: true }
            }
          }
        },
        profitDistributions: {
          include: {
            investor: {
              select: { name: true }
            }
          }
        }
      }
    })

    console.log('\n🎉 Final verification:')
    console.log('Deal ID:', finalCheck.id)
    console.log('Deal Title:', finalCheck.title)
    console.log('Expected Return:', finalCheck.expectedReturn + '%')
    console.log('Funding Goal:', Number(finalCheck.fundingGoal))
    console.log('Current Funding:', Number(finalCheck.currentFunding))
    console.log('Funding Percentage:', ((Number(finalCheck.currentFunding) / Number(finalCheck.fundingGoal)) * 100).toFixed(1) + '%')
    console.log('Total Investments:', finalCheck.investments.length)
    console.log('Total Profit Distributions:', finalCheck.profitDistributions.length)
    
    console.log('\nRemaining Investors:')
    finalCheck.investments.forEach((inv, i) => {
      console.log(`${i + 1}. ${inv.investor.name} (${inv.investor.email}) - $${Number(inv.amount)}`)
    })

    console.log('\nProfit Distributions:')
    finalCheck.profitDistributions.forEach((dist, i) => {
      console.log(`${i + 1}. ${dist.investor.name} - $${Number(dist.amount)} on ${dist.distributionDate.toDateString()}`)
    })

    console.log('\n✅ Unwanted investor removed successfully!')

  } catch (error) {
    console.error('❌ Error removing unwanted investor:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
removeUnwantedInvestor()
