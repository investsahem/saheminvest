const { PrismaClient } = require('@prisma/client')
const DATABASE_URL_UNPOOLED = 'postgresql://neondb_owner:npg_a1UtIzmvcO7g@ep-bitter-haze-a2gakcp4.eu-central-1.aws.neon.tech/neondb?sslmode=require'

const prisma = new PrismaClient({
  datasources: { db: { url: DATABASE_URL_UNPOOLED } }
})

async function fixExistingDistribution() {
  console.log('🔍 Checking Existing Distribution\n')
  
  try {
    await prisma.$connect()
    
    // Find the approved distribution
    const distRequest = await prisma.profitDistributionRequest.findFirst({
      where: {
        status: 'APPROVED',
        distributionType: 'PARTIAL'
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        project: {
          include: {
            investments: {
              include: {
                investor: true
              }
            }
          }
        }
      }
    })
    
    if (!distRequest) {
      console.log('❌ No approved distribution found')
      return
    }
    
    console.log(`📊 Distribution Request: ${distRequest.id}`)
    console.log(`   Total Amount: $${distRequest.totalAmount}`)
    console.log(`   Estimated Profit: $${distRequest.estimatedProfit}`)
    console.log(`   Estimated Return Capital: $${distRequest.estimatedReturnCapital}`)
    console.log(`   Reserved: $${distRequest.reservedAmount}`)
    console.log(`   Sahem: $${distRequest.sahemInvestAmount}`)
    
    // Check what was actually distributed
    const profitDistributions = await prisma.profitDistribution.findMany({
      where: {
        projectId: distRequest.projectId,
        profitPeriod: 'PARTIAL'
      },
      include: {
        investor: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
    
    console.log(`\n💰 Current Profit Distributions (${profitDistributions.length}):`)
    profitDistributions.forEach((dist, i) => {
      console.log(`   ${i + 1}. ${dist.investor.name}: $${dist.amount}`)
    })
    
    // Check transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: new Date(distRequest.createdAt.getTime() - 60000),
          lte: new Date(distRequest.createdAt.getTime() + 3600000)
        },
        OR: [
          { type: 'PROFIT_DISTRIBUTION' },
          { type: 'RETURN' }
        ]
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`\n📝 Transactions (${transactions.length}):`)
    let totalProfitDist = 0
    let totalReturn = 0
    transactions.forEach((tx, i) => {
      console.log(`   ${i + 1}. ${tx.user.name}: ${tx.type} - $${tx.amount}`)
      if (tx.type === 'PROFIT_DISTRIBUTION') totalProfitDist += Number(tx.amount)
      if (tx.type === 'RETURN') totalReturn += Number(tx.amount)
    })
    console.log(`\n   Total PROFIT_DISTRIBUTION: $${totalProfitDist}`)
    console.log(`   Total RETURN: $${totalReturn}`)
    
    // Calculate what SHOULD have been distributed
    const totalAmount = Number(distRequest.totalAmount)
    const estimatedProfit = Number(distRequest.estimatedProfit)
    const estimatedCapital = Number(distRequest.estimatedReturnCapital)
    const reserved = Number(distRequest.reservedAmount)
    const sahem = Number(distRequest.sahemInvestAmount)
    
    const netToInvestors = totalAmount - reserved - sahem
    const profitRatio = totalAmount > 0 ? (estimatedProfit / totalAmount) : 0
    const capitalRatio = totalAmount > 0 ? (estimatedCapital / totalAmount) : 0
    
    const investorProfit = netToInvestors * profitRatio
    const investorCapital = netToInvestors * capitalRatio
    
    console.log(`\n✅ CORRECT Calculations:`)
    console.log(`   Net to Investors: $${netToInvestors.toFixed(2)}`)
    console.log(`   Profit Ratio: ${(profitRatio * 100).toFixed(2)}%`)
    console.log(`   Capital Ratio: ${(capitalRatio * 100).toFixed(2)}%`)
    console.log(`   Investor Profit: $${investorProfit.toFixed(2)}`)
    console.log(`   Investor Capital: $${investorCapital.toFixed(2)}`)
    
    console.log(`\n❌ CURRENT (Wrong) vs ✅ CORRECT:`)
    console.log(`   Profit Distributed: $${totalProfitDist} (should be $${investorProfit.toFixed(2)})`)
    console.log(`   Capital Returned: $${totalReturn} (should be $${investorCapital.toFixed(2)})`)
    
    if (Math.abs(totalProfitDist - investorProfit) > 1 || Math.abs(totalReturn - investorCapital) > 1) {
      console.log(`\n⚠️  MISMATCH DETECTED! Need to fix the distributions.`)
      console.log(`\nShould I delete the incorrect distributions and re-create them? (Y/N)`)
      console.log(`This will:`)
      console.log(`  1. Delete existing profit distributions`)
      console.log(`  2. Delete existing transactions`)
      console.log(`  3. Restore investor wallet balances`)
      console.log(`  4. Re-create with correct amounts`)
    } else {
      console.log(`\n✅ Distributions are already correct!`)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixExistingDistribution()
