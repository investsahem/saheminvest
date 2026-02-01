const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkDeal() {
    const dealId = 'cmh6azjck0001l504outbrn6c'

    const deal = await prisma.project.findUnique({
        where: { id: dealId },
        include: {
            investments: {
                include: {
                    investor: {
                        select: { id: true, name: true }
                    }
                }
            },
            profitDistributions: true,
            owner: {
                select: { id: true, name: true, email: true }
            }
        }
    })

    if (!deal) {
        console.log('Deal not found!')
        await prisma.$disconnect()
        return
    }

    console.log('=== DEAL DIAGNOSTIC REPORT ===')
    console.log('')
    console.log('📋 BASIC INFO:')
    console.log(`   ID: ${deal.id}`)
    console.log(`   Title: ${deal.title}`)
    console.log(`   Status: ${deal.status}`)
    console.log(`   Partner: ${deal.owner?.name} (${deal.owner?.email})`)
    console.log('')
    console.log('💰 FUNDING INFO:')
    console.log(`   Funding Goal: $${deal.fundingGoal}`)
    console.log(`   Current Funding: $${deal.currentFunding}`)
    console.log(`   Min Investment: $${deal.minInvestment}`)
    console.log('')
    console.log('👥 INVESTORS:')
    console.log(`   Total Investments: ${deal.investments.length}`)

    // Count unique investors
    const uniqueInvestors = new Set(deal.investments.map(inv => inv.investorId))
    console.log(`   Unique Investors: ${uniqueInvestors.size}`)

    if (deal.investments.length > 0) {
        console.log('   Investment Details:')
        deal.investments.forEach((inv, i) => {
            console.log(`     ${i + 1}. Investor: ${inv.investor?.name || 'Unknown'} - Amount: $${inv.amount}`)
        })
    }
    console.log('')
    console.log('📊 PROFIT DISTRIBUTIONS:')
    console.log(`   Total Distributions: ${deal.profitDistributions.length}`)
    if (deal.profitDistributions.length > 0) {
        deal.profitDistributions.forEach((dist, i) => {
            console.log(`     ${i + 1}. Amount: $${dist.amount} - Status: ${dist.status} - Date: ${dist.distributionDate}`)
        })
    }
    console.log('')
    console.log('🔍 BUTTON STATUS ANALYSIS:')
    const canDistribute = deal.status === 'ACTIVE' || deal.status === 'FUNDED'
    console.log(`   Current Status: ${deal.status}`)
    console.log(`   Button Enabled Condition: status === 'ACTIVE' || status === 'FUNDED'`)
    console.log(`   Button Should Be: ${canDistribute ? '✅ ENABLED' : '❌ DISABLED'}`)
    console.log('')
    if (!canDistribute) {
        console.log('⚠️  ISSUE FOUND: The button is disabled because the deal status is not ACTIVE or FUNDED.')
        console.log(`   Current status: ${deal.status}`)
        console.log('   To enable the button, the deal status needs to be changed to ACTIVE or FUNDED.')
    }

    await prisma.$disconnect()
}

checkDeal().catch(console.error)
