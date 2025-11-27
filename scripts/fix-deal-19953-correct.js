const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixDealProfitDistributionCorrect() {
  try {
    console.log('🔍 Fixing deal with capital $19,953 with CORRECT calculations...')
    
    const deal = await prisma.project.findFirst({
      where: { currentFunding: 19953 },
      include: {
        profitDistributionRequests: {
          where: {
            distributionType: 'PARTIAL',
            status: 'APPROVED'
          }
        }
      }
    })

    if (!deal) {
      console.log('❌ Deal not found!')
      return
    }

    // Calculate ACTUAL capital paid to investors in partials (after commissions)
    let totalPartialCapitalToInvestors = 0
    deal.profitDistributionRequests.forEach(dist => {
      const amount = Number(dist.totalAmount)
      const reserve = Number(dist.reservedAmount || 0)
      const sahem = Number(dist.sahemInvestAmount || 0)
      const toInvestors = amount - reserve - sahem
      totalPartialCapitalToInvestors += toInvestors
    })

    console.log(`📊 Calculations:`)
    console.log(`   Total Capital: $${deal.currentFunding}`)
    console.log(`   Partial Capital Paid to Investors: $${totalPartialCapitalToInvestors}`)
    
    const remainingCapital = deal.currentFunding - totalPartialCapitalToInvestors
    const gainPercent = 7
    const totalProfit = Math.round((deal.currentFunding * gainPercent) / 100)
    const sahemCommissionPercent = 10
    const sahemCommission = Math.round((totalProfit * sahemCommissionPercent) / 100)
    const profitToInvestors = totalProfit - sahemCommission
    const finalTotalAmount = remainingCapital + totalProfit

    console.log(`   Remaining Capital: $${remainingCapital}`)
    console.log(`   Total Profit (${gainPercent}%): $${totalProfit}`)
    console.log(`   Sahem Commission (${sahemCommissionPercent}%): $${sahemCommission}`)
    console.log(`   Profit to Investors: $${profitToInvestors}`)
    console.log(`   \n✨ Final Distribution Total: $${finalTotalAmount}`)
    console.log(`   💰 What Investors Get: $${remainingCapital + profitToInvestors}`)

    // Find pending final request
    const finalRequest = await prisma.profitDistributionRequest.findFirst({
      where: {
        projectId: deal.id,
        distributionType: 'FINAL',
        status: 'PENDING'
      }
    })

    if (!finalRequest) {
      console.log('\n❌ No pending final request found!')
      return
    }

    console.log(`\n📝 Current final request amounts:`)
    console.log(`   Total Amount: $${finalRequest.totalAmount}`)
    console.log(`   Estimated Profit: $${finalRequest.estimatedProfit}`)
    console.log(`   Estimated Capital: $${finalRequest.estimatedReturnCapital}`)

    console.log(`\n🔧 Updating to correct amounts...`)
    
    await prisma.profitDistributionRequest.update({
      where: { id: finalRequest.id },
      data: {
        totalAmount: finalTotalAmount,
        estimatedProfit: totalProfit,
        estimatedReturnCapital: remainingCapital,
        estimatedGainPercent: gainPercent,
        sahemInvestPercent: sahemCommissionPercent,
        reservedGainPercent: 0,  // NO reserve in final
        reservedAmount: 0,        // NO reserve in final
        sahemInvestAmount: sahemCommission
      }
    })

    console.log(`✅ Updated successfully!`)
    console.log(`\n✨ FINAL RESULT:`)
    console.log(`   Total Capital: $${deal.currentFunding}`)
    console.log(`   Total Profit: $${totalProfit}`)
    console.log(`   Grand Total: $${deal.currentFunding + totalProfit}`)
    console.log(`\n   Partials paid: $${totalPartialCapitalToInvestors} (capital recovery)`)
    console.log(`   Final to pay: $${finalTotalAmount}`)
    console.log(`   \n   Investors will receive in FINAL:`)
    console.log(`      - Capital: $${remainingCapital}`)
    console.log(`      - Profit: $${profitToInvestors}`)
    console.log(`      - Total: $${remainingCapital + profitToInvestors}`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixDealProfitDistributionCorrect()

