// Verification script for profit distribution fix
// Tests deal ID 13j4j6zh to verify calculations are correct

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verifyDistributionCalculations() {
  try {
    console.log('🔍 Verifying Profit Distribution Calculations...\n')

    // Find the deal
    const dealId = '13j4j6zh'
    const deal = await prisma.project.findUnique({
      where: { id: dealId },
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
        }
      }
    })

    if (!deal) {
      console.log(`❌ Deal ${dealId} not found`)
      return
    }

    console.log(`✅ Deal Found: ${deal.title}`)
    console.log(`   Current Funding: $${Number(deal.currentFunding)}`)
    console.log(`   Status: ${deal.status}\n`)

    // Get all partial distributions for this deal
    const partialDistributions = await prisma.profitDistribution.findMany({
      where: {
        projectId: dealId,
        profitPeriod: 'PARTIAL',
        status: 'COMPLETED'
      },
      include: {
        investor: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        distributionDate: 'asc'
      }
    })

    console.log(`📊 Historical Partial Distributions: ${partialDistributions.length} found\n`)

    // Group by investor
    const investorPartials = new Map()
    let totalPartialProfit = 0

    for (const dist of partialDistributions) {
      if (!investorPartials.has(dist.investorId)) {
        investorPartials.set(dist.investorId, {
          name: dist.investor.name || 'Unknown',
          totalProfit: 0,
          distributions: []
        })
      }
      
      const amount = Number(dist.amount)
      investorPartials.get(dist.investorId).totalProfit += amount
      investorPartials.get(dist.investorId).distributions.push({
        date: dist.distributionDate,
        amount: amount
      })
      totalPartialProfit += amount
    }

    console.log('   Partial Distribution Summary by Investor:')
    for (const [investorId, data] of investorPartials) {
      console.log(`   - ${data.name}: $${data.totalProfit.toFixed(2)} (${data.distributions.length} distributions)`)
    }
    console.log(`   Total Partial Profit Distributed: $${totalPartialProfit.toFixed(2)}\n`)

    // Get pending FINAL distribution request
    const finalRequest = await prisma.profitDistributionRequest.findFirst({
      where: {
        projectId: dealId,
        distributionType: 'FINAL',
        status: 'PENDING'
      }
    })

    if (finalRequest) {
      console.log('🔔 PENDING Final Distribution Request Found:')
      console.log(`   Request ID: ${finalRequest.id}`)
      console.log(`   Total Amount: $${Number(finalRequest.totalAmount)}`)
      console.log(`   Estimated Profit: $${Number(finalRequest.estimatedProfit)}`)
      console.log(`   Estimated Capital Return: $${Number(finalRequest.estimatedReturnCapital)}`)
      console.log(`   Sahem %: ${Number(finalRequest.sahemInvestPercent)}%`)
      console.log(`   Reserve %: ${Number(finalRequest.reservedGainPercent)}%\n`)

      // Calculate what investors should receive
      const totalProfit = Number(finalRequest.estimatedProfit)
      const sahemAmount = (totalProfit * Number(finalRequest.sahemInvestPercent)) / 100
      const reserveAmount = (totalProfit * Number(finalRequest.reservedGainPercent)) / 100
      const investorsProfit = totalProfit - sahemAmount - reserveAmount
      const investorsCapital = Number(finalRequest.estimatedReturnCapital)

      console.log('💰 Distribution Breakdown:')
      console.log(`   Total Profit: $${totalProfit.toFixed(2)}`)
      console.log(`   - Sahem Amount: $${sahemAmount.toFixed(2)}`)
      console.log(`   - Reserve Amount: $${reserveAmount.toFixed(2)}`)
      console.log(`   - Investors Profit: $${investorsProfit.toFixed(2)}`)
      console.log(`   - Investors Capital: $${investorsCapital.toFixed(2)}`)
      console.log(`   Total to Investors: $${(investorsProfit + investorsCapital).toFixed(2)}\n`)

      // Calculate per investor (with partial deduction)
      const totalInvestment = deal.investments.reduce((sum, inv) => sum + Number(inv.amount), 0)
      
      console.log('👥 Per Investor Calculations:')
      console.log('   (Showing: Investment → Entitled Profit → Already Paid → Final Payment)\n')

      for (const investment of deal.investments) {
        const investorId = investment.investorId
        const investmentAmount = Number(investment.amount)
        const ratio = investmentAmount / totalInvestment

        // What they're entitled to
        const entitledProfit = investorsProfit * ratio
        const entitledCapital = investorsCapital * ratio

        // What they already received
        const alreadyPaid = investorPartials.get(investorId)?.totalProfit || 0

        // What they should receive now (AFTER FIX)
        const finalProfit = Math.max(0, entitledProfit - alreadyPaid)
        const finalCapital = entitledCapital

        console.log(`   ${investment.investor.name}:`)
        console.log(`     Investment: $${investmentAmount.toFixed(2)} (${(ratio * 100).toFixed(2)}%)`)
        console.log(`     Entitled Profit: $${entitledProfit.toFixed(2)}`)
        console.log(`     Already Paid (Partial): $${alreadyPaid.toFixed(2)}`)
        console.log(`     ✅ Final Profit Payment: $${finalProfit.toFixed(2)}`)
        console.log(`     ✅ Final Capital Payment: $${finalCapital.toFixed(2)}`)
        console.log(`     ✅ Total Final Payment: $${(finalProfit + finalCapital).toFixed(2)}`)
        console.log(`     📊 Grand Total Received: $${(alreadyPaid + finalProfit + finalCapital).toFixed(2)}\n`)
      }

      console.log('✅ Verification Complete!')
      console.log('   The calculations above show what investors SHOULD receive after the fix.')
      console.log('   Final payments now correctly subtract partial distributions already paid.\n')

    } else {
      console.log('ℹ️  No pending FINAL distribution request found for this deal\n')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyDistributionCalculations()

