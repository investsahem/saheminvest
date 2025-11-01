// Create PARTIAL distribution requests as a partner would
// This creates PENDING requests that admin needs to approve

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const DEAL_ID = 'cmg254qhr0001vuog13j4j6zh' // هواتف مستعملة

async function createPartialRequest(requestNumber, data) {
  console.log(`\n📝 Creating Partial Distribution Request #${requestNumber}...`)
  
  try {
    // Get the deal
    const deal = await prisma.project.findUnique({
      where: { id: DEAL_ID },
      include: {
        owner: true // The partner
      }
    })

    if (!deal) {
      throw new Error('Deal not found')
    }

    console.log(`   Deal: ${deal.title}`)
    console.log(`   Partner: ${deal.owner.name}`)
    console.log(`   Current Funding: $${Number(deal.currentFunding)}`)

    // Calculate total amount and profit for this partial distribution
    const totalAmount = data.totalAmount
    const profitPercent = data.profitPercent
    const closingPercent = data.closingPercent
    const profit = (Number(deal.currentFunding) * profitPercent) / 100
    const capitalReturn = totalAmount - profit

    console.log(`\n   Distribution Details:`)
    console.log(`   - Total Amount: $${totalAmount}`)
    console.log(`   - Profit Percent: ${profitPercent}%`)
    console.log(`   - Calculated Profit: $${profit.toFixed(2)}`)
    console.log(`   - Capital Return: $${capitalReturn.toFixed(2)}`)
    console.log(`   - Closing Percent: ${closingPercent}%`)

    // Create the distribution request
    const request = await prisma.profitDistributionRequest.create({
      data: {
        projectId: DEAL_ID,
        partnerId: deal.ownerId,
        totalAmount: totalAmount,
        estimatedGainPercent: profitPercent,
        estimatedClosingPercent: closingPercent,
        distributionType: 'PARTIAL',
        description: data.description,
        estimatedProfit: profit,
        estimatedReturnCapital: capitalReturn,
        sahemInvestPercent: 20, // Default 20%
        reservedGainPercent: 0,  // No reserve for partials
        status: 'PENDING',
        requestedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log(`\n   ✅ Request created successfully!`)
    console.log(`   Request ID: ${request.id}`)
    console.log(`   Status: ${request.status}`)
    console.log(`\n   👉 Admin can now approve this in: Admin → Profit Distributions`)

    return request

  } catch (error) {
    console.error(`   ❌ Error creating request:`, error)
    throw error
  }
}

async function main() {
  console.log('🚀 Creating Partial Distribution Requests as Partner...')
  console.log('=' .repeat(60))

  try {
    // Check if deal has investments
    const deal = await prisma.project.findUnique({
      where: { id: DEAL_ID },
      include: {
        investments: true,
        profitDistributions: {
          where: { status: 'COMPLETED' }
        }
      }
    })

    if (!deal) {
      throw new Error(`Deal ${DEAL_ID} not found`)
    }

    if (deal.investments.length === 0) {
      throw new Error('No investments found. Run reset-deal-13j4j6zh.js first!')
    }

    console.log(`\n📊 Deal Status:`)
    console.log(`   Title: ${deal.title}`)
    console.log(`   Investments: ${deal.investments.length}`)
    console.log(`   Total Funding: $${Number(deal.currentFunding)}`)
    console.log(`   Completed Distributions: ${deal.profitDistributions.length}`)

    // Check if there are already completed partials
    if (deal.profitDistributions.length > 0) {
      console.log(`\n   ⚠️  Warning: This deal already has ${deal.profitDistributions.length} completed distributions`)
      console.log(`   This might be from the reset script. Continue anyway? (This will create REQUESTS)`)
    }

    // Partial Request #1
    // Based on actual data: Total $699.47
    // Profit: ~3.5% of $19,953 = ~$698.36
    console.log('\n' + '='.repeat(60))
    const request1 = await createPartialRequest(1, {
      totalAmount: 700,
      profitPercent: 3.5,
      closingPercent: 40,
      description: 'توزيع جزئي أول - تاريخ 15/5/2025'
    })

    console.log('\n' + '='.repeat(60))
    console.log('✅ Partial Request #1 Created!')
    console.log('=' .repeat(60))

    // Ask if user wants to create second partial request
    console.log('\n📝 To create Partial Request #2, run this script with argument "second"')
    console.log('   Example: node scripts/create-partial-requests.js second')

    // If argument "second" is passed, create second request
    if (process.argv[2] === 'second') {
      console.log('\n' + '='.repeat(60))
      const request2 = await createPartialRequest(2, {
        totalAmount: 700,
        profitPercent: 3.5,
        closingPercent: 80,
        description: 'توزيع جزئي ثاني - تاريخ 27/5/2025'
      })

      console.log('\n' + '='.repeat(60))
      console.log('✅ Partial Request #2 Created!')
      console.log('=' .repeat(60))
    }

    console.log('\n📋 Summary:')
    console.log('   1. Login to Admin panel')
    console.log('   2. Go to: Admin → Profit Distributions')
    console.log('   3. You should see PENDING partial request(s)')
    console.log('   4. Click "تفاصيل" to review')
    console.log('   5. Click "موافقة" to approve')
    console.log('   6. After approving partials, run script to create FINAL request')
    console.log('\n')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

