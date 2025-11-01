// Create FINAL distribution request as a partner would
// Run this AFTER approving both partial distributions

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const DEAL_ID = 'cmg254qhr0001vuog13j4j6zh' // هواتف مستعملة

async function createFinalRequest() {
  console.log('\n📝 Creating FINAL Distribution Request...')
  
  try {
    // Get the deal with all distributions
    const deal = await prisma.project.findUnique({
      where: { id: DEAL_ID },
      include: {
        owner: true,
        profitDistributions: {
          where: {
            status: 'COMPLETED',
            profitPeriod: 'PARTIAL'
          }
        },
        investments: true
      }
    })

    if (!deal) {
      throw new Error('Deal not found')
    }

    console.log(`   Deal: ${deal.title}`)
    console.log(`   Partner: ${deal.owner.name}`)
    console.log(`   Current Funding: $${Number(deal.currentFunding)}`)
    console.log(`   Investments: ${deal.investments.length}`)

    // Calculate totals from completed partials
    const totalPartialsDistributed = deal.profitDistributions.reduce(
      (sum, dist) => sum + Number(dist.amount), 
      0
    )

    console.log(`\n   📊 Historical Partials:`)
    console.log(`   - Completed partial distributions: ${deal.profitDistributions.length}`)
    console.log(`   - Total distributed in partials: $${totalPartialsDistributed.toFixed(2)}`)

    if (deal.profitDistributions.length === 0) {
      console.log(`\n   ⚠️  Warning: No completed partial distributions found!`)
      console.log(`   You should approve the partial requests first before creating FINAL request.`)
      console.log(`   Continue anyway? (y/n)`)
    }

    // FINAL distribution amounts
    // Let's say deal made 7% total profit = $1,396.71
    // Already distributed ~$1,400 in partials
    // Remaining profit: minimal
    // But need to return full capital: $19,953
    
    const totalProfit = 1400 // Total profit for the entire deal
    const profitPercent = (totalProfit / Number(deal.currentFunding)) * 100
    const totalReturnAmount = Number(deal.currentFunding) + totalProfit // Full capital + profit
    const capitalReturn = Number(deal.currentFunding) // Return full capital

    console.log(`\n   Distribution Details:`)
    console.log(`   - Total Return Amount: $${totalReturnAmount.toFixed(2)}`)
    console.log(`   - Total Profit: $${totalProfit.toFixed(2)} (${profitPercent.toFixed(2)}%)`)
    console.log(`   - Capital Return: $${capitalReturn.toFixed(2)}`)
    console.log(`   - Already distributed in partials: $${totalPartialsDistributed.toFixed(2)}`)

    // Create the FINAL distribution request
    const request = await prisma.profitDistributionRequest.create({
      data: {
        projectId: DEAL_ID,
        partnerId: deal.ownerId,
        totalAmount: totalReturnAmount,
        estimatedGainPercent: profitPercent,
        estimatedClosingPercent: 100, // Deal is closing 100%
        distributionType: 'FINAL',
        description: 'توزيع نهائي - إغلاق الصفقة وإرجاع رأس المال + الأرباح',
        estimatedProfit: totalProfit,
        estimatedReturnCapital: capitalReturn,
        sahemInvestPercent: 20, // 20% commission
        reservedGainPercent: 0,
        status: 'PENDING',
        requestedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log(`\n   ✅ FINAL request created successfully!`)
    console.log(`   Request ID: ${request.id}`)
    console.log(`   Status: ${request.status}`)
    console.log(`\n   👉 Admin can now review this in: Admin → Profit Distributions`)
    console.log(`\n   📊 Admin will see:`)
    console.log(`   - Historical partials: $${totalPartialsDistributed.toFixed(2)}`)
    console.log(`   - Final distribution: Calculated after subtracting partials`)
    console.log(`   - Grand total: Complete picture of the deal`)
    console.log(`\n   🎯 Expected per investor (after subtracting partials):`)
    console.log(`   - System will automatically subtract the $${totalPartialsDistributed.toFixed(2)} already paid`)
    console.log(`   - Investors will receive remaining amounts only`)
    console.log(`   - NO duplicate payments!`)

    return request

  } catch (error) {
    console.error(`   ❌ Error creating request:`, error)
    throw error
  }
}

async function main() {
  console.log('🚀 Creating FINAL Distribution Request as Partner...')
  console.log('=' .repeat(60))

  try {
    const request = await createFinalRequest()

    console.log('\n' + '='.repeat(60))
    console.log('✅ FINAL Request Created Successfully!')
    console.log('=' .repeat(60))

    console.log('\n📋 Next Steps:')
    console.log('   1. Login to Admin panel')
    console.log('   2. Go to: Admin → Profit Distributions')
    console.log('   3. You should see the FINAL request (نهائي)')
    console.log('   4. Click "تفاصيل" to review')
    console.log('   5. Verify:')
    console.log('      - Partner data is READ-ONLY ✅')
    console.log('      - Shows historical partials ✅')
    console.log('      - Shows final payment (after deducting partials) ✅')
    console.log('      - Shows grand total ✅')
    console.log('      - Per-investor breakdown correct ✅')
    console.log('   6. Click "موافقة وتوزيع الأرباح" to approve')
    console.log('   7. Verify investors receive correct amounts!')
    console.log('\n')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

