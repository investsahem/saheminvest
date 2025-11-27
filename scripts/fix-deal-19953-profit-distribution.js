const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixDealProfitDistribution() {
  try {
    console.log('🔍 Finding deal with capital $19,953...')
    
    // Find the deal
    const deal = await prisma.project.findFirst({
      where: {
        currentFunding: 19953
      },
      include: {
        investments: {
          include: {
            investor: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        profitDistributionRequests: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!deal) {
      console.log('❌ Deal not found!')
      return
    }

    console.log(`✅ Found deal: ${deal.title} (ID: ${deal.id})`)
    console.log(`   Capital: $${deal.currentFunding}`)
    console.log(`   Investments: ${deal.investments.length}`)
    console.log(`   Distribution requests: ${deal.profitDistributionRequests.length}`)

    // Calculate correct amounts
    const totalCapital = 19953
    const gainPercent = 7
    const totalProfit = Math.round((totalCapital * gainPercent) / 100) // $1,397
    
    console.log(`\n📊 Correct calculations:`)
    console.log(`   Total Capital: $${totalCapital}`)
    console.log(`   Gain Percent: ${gainPercent}%`)
    console.log(`   Total Profit: $${totalProfit}`)
    console.log(`   Total Deal: $${totalCapital + totalProfit}`)

    // Find partial distributions
    const partialRequests = deal.profitDistributionRequests.filter(
      r => r.distributionType === 'PARTIAL' && r.status === 'APPROVED'
    )
    
    const totalPartialCapital = partialRequests.reduce((sum, r) => sum + Number(r.totalAmount), 0)
    
    // Find pending final request
    const finalRequest = deal.profitDistributionRequests.find(
      r => r.distributionType === 'FINAL' && r.status === 'PENDING'
    )

    console.log(`\n📦 Partial distributions:`)
    console.log(`   Count: ${partialRequests.length}`)
    console.log(`   Total paid: $${totalPartialCapital}`)

    // Calculate what the final should be
    const remainingCapital = totalCapital - totalPartialCapital
    const finalTotalAmount = remainingCapital + totalProfit
    const sahemCommissionPercent = 10 // Default, adjust if needed
    const sahemCommission = Math.round((totalProfit * sahemCommissionPercent) / 100)
    const profitToInvestors = totalProfit - sahemCommission

    console.log(`\n✨ Final distribution should be:`)
    console.log(`   Remaining Capital: $${remainingCapital}`)
    console.log(`   Total Profit: $${totalProfit}`)
    console.log(`   Sahem Commission (${sahemCommissionPercent}%): $${sahemCommission}`)
    console.log(`   Profit to Investors: $${profitToInvestors}`)
    console.log(`   Total Final Amount: $${finalTotalAmount}`)
    console.log(`   What investors get: $${remainingCapital + profitToInvestors}`)

    if (finalRequest) {
      console.log(`\n📝 Current final request:`)
      console.log(`   ID: ${finalRequest.id}`)
      console.log(`   Total Amount: $${finalRequest.totalAmount} (should be $${finalTotalAmount})`)
      console.log(`   Estimated Profit: $${finalRequest.estimatedProfit} (should be $${totalProfit})`)
      console.log(`   Estimated Capital: $${finalRequest.estimatedReturnCapital} (should be $${remainingCapital})`)
      console.log(`   Gain Percent: ${finalRequest.estimatedGainPercent}%`)
      console.log(`   Sahem Percent: ${finalRequest.sahemInvestPercent}%`)
      console.log(`   Status: ${finalRequest.status}`)

      const difference = finalTotalAmount - Number(finalRequest.totalAmount)
      console.log(`\n⚠️  Difference: $${difference}`)

      if (difference !== 0) {
        console.log(`\n🔧 Updating final request to correct amounts...`)
        
        const updated = await prisma.profitDistributionRequest.update({
          where: { id: finalRequest.id },
          data: {
            totalAmount: finalTotalAmount,
            estimatedProfit: totalProfit,
            estimatedReturnCapital: remainingCapital,
            estimatedGainPercent: gainPercent,
            sahemInvestPercent: sahemCommissionPercent,
            reservedGainPercent: 0,  // No reserve in final
            reservedAmount: 0,        // No reserve in final
            sahemInvestAmount: sahemCommission
          }
        })

        console.log(`✅ Final request updated successfully!`)
        console.log(`   New Total Amount: $${updated.totalAmount}`)
        console.log(`   New Estimated Profit: $${updated.estimatedProfit}`)
        console.log(`   New Estimated Capital: $${updated.estimatedReturnCapital}`)
      } else {
        console.log(`✅ Final request already has correct amounts!`)
      }
    } else {
      console.log(`\n❌ No pending final request found!`)
    }

    // Show investor breakdown
    console.log(`\n👥 Investor breakdown:`)
    const investorTotals = new Map()
    for (const inv of deal.investments) {
      const current = investorTotals.get(inv.investorId) || 0
      investorTotals.set(inv.investorId, current + Number(inv.amount))
    }

    for (const [investorId, amount] of investorTotals) {
      const investor = deal.investments.find(i => i.investorId === investorId)?.investor
      const ratio = amount / totalCapital
      const capitalReturn = Math.round(remainingCapital * ratio)
      const profitShare = Math.round(profitToInvestors * ratio)
      const totalReturn = capitalReturn + profitShare
      
      console.log(`   ${investor?.name || 'Unknown'}: $${amount} invested (${(ratio * 100).toFixed(2)}%)`)
      console.log(`      -> Capital back: $${capitalReturn}`)
      console.log(`      -> Profit: $${profitShare}`)
      console.log(`      -> Total in final: $${totalReturn}`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixDealProfitDistribution()

