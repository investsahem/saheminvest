const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function setProfitTo1400() {
  try {
    console.log('🔍 Finding deal to update profit to $1,400...')
    
    const deal = await prisma.project.findFirst({
      where: { currentFunding: 19953 },
      include: {
        profitDistributionRequests: {
          where: {
            distributionType: 'FINAL',
            status: 'PENDING'
          }
        }
      }
    })

    if (!deal || !deal.profitDistributionRequests.length) {
      console.log('❌ Deal or final request not found!')
      return
    }

    const finalRequest = deal.profitDistributionRequests[0]
    
    // Calculate with $1,400 profit instead of $1,397
    const totalCapital = 19953
    const partialCapitalPaid = 8700 // What investors got in partials
    const remainingCapital = totalCapital - partialCapitalPaid // $11,253
    
    const totalProfit = 1400 // Round up to $1,400
    const sahemCommissionPercent = 10
    const sahemCommission = Math.round((totalProfit * sahemCommissionPercent) / 100) // $140
    const profitToInvestors = totalProfit - sahemCommission // $1,260
    
    const finalTotalAmount = remainingCapital + totalProfit // $12,653
    
    // Calculate new gain percent
    const newGainPercent = (totalProfit / totalCapital) * 100 // 7.0194...%
    
    console.log(`\n📊 New calculations with $1,400 profit:`)
    console.log(`   Total Capital: $${totalCapital}`)
    console.log(`   Total Profit: $${totalProfit}`)
    console.log(`   New Gain %: ${newGainPercent.toFixed(2)}%`)
    console.log(`   Remaining Capital: $${remainingCapital}`)
    console.log(`   Sahem Commission (${sahemCommissionPercent}%): $${sahemCommission}`)
    console.log(`   Profit to Investors: $${profitToInvestors}`)
    console.log(`   Final Total: $${finalTotalAmount}`)
    console.log(`   \n✨ Grand Total Deal: $${totalCapital + totalProfit}`)

    console.log(`\n🔧 Updating final request...`)
    
    await prisma.profitDistributionRequest.update({
      where: { id: finalRequest.id },
      data: {
        totalAmount: finalTotalAmount,
        estimatedProfit: totalProfit,
        estimatedReturnCapital: remainingCapital,
        estimatedGainPercent: newGainPercent,
        sahemInvestPercent: sahemCommissionPercent,
        reservedGainPercent: 0,
        reservedAmount: 0,
        sahemInvestAmount: sahemCommission
      }
    })

    console.log(`✅ Updated successfully!`)
    console.log(`\n✨ FINAL RESULT:`)
    console.log(`   Investors will receive in FINAL:`)
    console.log(`      - Capital: $${remainingCapital}`)
    console.log(`      - Profit: $${profitToInvestors}`)
    console.log(`      - Total: $${remainingCapital + profitToInvestors}`)
    console.log(`\n   Grand Total Deal: $${totalCapital + totalProfit} ✓`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setProfitTo1400()


