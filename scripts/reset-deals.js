// scripts/reset-deals.js
// Script to reset specific deals and investor data
// This will:
// 1. Remove all investments from the specified deals
// 2. Delete related profit distributions
// 3. Refund invested capital back to investor wallets
// 4. Remove profit amounts from investor wallets
// 5. Reset deal funding to 0

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Deals to reset - using full CUID format
// cmg254qhr0001vuog13j4j6zh = "هواتف مستعملة" (Used Phones)
// cmg24uh150001vu02w47uusmw = "أجهزة إلكترونية للأطفال" (Children's Electronics) - already empty
const DEAL_IDS = ['cmg254qhr0001vuog13j4j6zh', 'cmg24uh150001vu02w47uusmw']

async function analyzeDeal(dealId) {
    console.log(`\n========== Analyzing Deal: ${dealId} ==========`)

    const project = await prisma.project.findUnique({
        where: { id: dealId },
        include: {
            investments: {
                include: {
                    investor: {
                        select: { id: true, name: true, email: true, walletBalance: true, totalInvested: true, totalReturns: true }
                    },
                    profitDistributions: true
                }
            },
            profitDistributions: true
        }
    })

    if (!project) {
        console.log(`Deal ${dealId} not found!`)
        return null
    }

    console.log(`\nDeal: ${project.title}`)
    console.log(`Status: ${project.status}`)
    console.log(`Current Funding: $${Number(project.currentFunding).toLocaleString()}`)
    console.log(`Funding Goal: $${Number(project.fundingGoal).toLocaleString()}`)
    console.log(`Total Investments: ${project.investments.length}`)
    console.log(`Total Profit Distributions: ${project.profitDistributions.length}`)

    let totalCapitalToRefund = 0
    let totalProfitToRemove = 0

    for (const investment of project.investments) {
        const investorName = investment.investor.name || investment.investor.email
        const capitalAmount = Number(investment.amount)
        const profitReceived = Number(investment.profitReceived)

        console.log(`\n  Investor: ${investorName}`)
        console.log(`    Investment Amount (Capital): $${capitalAmount.toLocaleString()}`)
        console.log(`    Profit Received: $${profitReceived.toLocaleString()}`)
        console.log(`    Current Wallet Balance: $${Number(investment.investor.walletBalance).toLocaleString()}`)
        console.log(`    Profit Distributions: ${investment.profitDistributions.length}`)

        totalCapitalToRefund += capitalAmount
        totalProfitToRemove += profitReceived
    }

    console.log(`\n--- Summary for ${dealId} ---`)
    console.log(`Total Capital to Refund: $${totalCapitalToRefund.toLocaleString()}`)
    console.log(`Total Profit to Remove: $${totalProfitToRemove.toLocaleString()}`)

    return {
        project,
        totalCapitalToRefund,
        totalProfitToRemove
    }
}

async function resetDeal(dealId) {
    console.log(`\n========== RESETTING Deal: ${dealId} ==========`)

    const project = await prisma.project.findUnique({
        where: { id: dealId },
        include: {
            investments: {
                include: {
                    investor: true,
                    profitDistributions: true,
                    transactions: true
                }
            },
            profitDistributions: true
        }
    })

    if (!project) {
        console.log(`Deal ${dealId} not found!`)
        return
    }

    // Process each investment
    for (const investment of project.investments) {
        const investor = investment.investor
        const capitalAmount = Number(investment.amount)
        const profitReceived = Number(investment.profitReceived)

        console.log(`\nProcessing investor: ${investor.name || investor.email}`)
        console.log(`  Refunding capital: $${capitalAmount.toLocaleString()}`)
        console.log(`  Removing profit: $${profitReceived.toLocaleString()}`)

        // Calculate new wallet balance: current + capital - profit
        // BUT wait - the capital was ALREADY deducted from wallet when they invested
        // And profits were ADDED to wallet when distributed
        // So to restore: we just add back the capital (they already have the profit in wallet)
        // Then remove the profit
        // Net: wallet = wallet + capital - profit

        const currentBalance = Number(investor.walletBalance)
        const newBalance = currentBalance + capitalAmount - profitReceived

        console.log(`  Current Balance: $${currentBalance.toLocaleString()}`)
        console.log(`  New Balance: $${newBalance.toLocaleString()}`)

        // Update investor
        await prisma.user.update({
            where: { id: investor.id },
            data: {
                walletBalance: newBalance,
                totalInvested: {
                    decrement: capitalAmount
                },
                totalReturns: {
                    decrement: profitReceived
                }
            }
        })
        console.log(`  ✅ Updated investor balance and stats`)

        // Delete profit distributions for this investment
        const deletedDistributions = await prisma.profitDistribution.deleteMany({
            where: { investmentId: investment.id }
        })
        console.log(`  ✅ Deleted ${deletedDistributions.count} profit distributions`)

        // Delete transactions related to this investment
        const deletedTransactions = await prisma.transaction.deleteMany({
            where: { investmentId: investment.id }
        })
        console.log(`  ✅ Deleted ${deletedTransactions.count} investment transactions`)
    }

    // Delete all investments for this deal
    const deletedInvestments = await prisma.investment.deleteMany({
        where: { projectId: dealId }
    })
    console.log(`\n✅ Deleted ${deletedInvestments.count} investments from deal`)

    // Delete any remaining profit distributions directly on project
    const deletedProjectDistributions = await prisma.profitDistribution.deleteMany({
        where: { projectId: dealId }
    })
    console.log(`✅ Deleted ${deletedProjectDistributions.count} project profit distributions`)

    // Reset deal to initial state
    await prisma.project.update({
        where: { id: dealId },
        data: {
            currentFunding: 0,
            status: 'PUBLISHED' // Reset to published so new investments can be made
        }
    })
    console.log(`✅ Reset deal funding to $0 and status to PUBLISHED`)

    console.log(`\n🎉 Deal ${dealId} has been fully reset!`)
}

async function main() {
    console.log('='.repeat(60))
    console.log('DEAL RESET SCRIPT')
    console.log('='.repeat(60))
    console.log(`Deals to reset: ${DEAL_IDS.join(', ')}`)

    // First, analyze and show what will happen
    console.log('\n\n📊 ANALYSIS PHASE - Showing current state:')
    console.log('-'.repeat(60))

    for (const dealId of DEAL_IDS) {
        await analyzeDeal(dealId)
    }

    // Ask for confirmation
    console.log('\n\n⚠️  WARNING: This script will now RESET the above deals.')
    console.log('This action CANNOT be undone!')
    console.log('\nTo proceed, run this script with --execute flag')
    console.log('Example: node scripts/reset-deals.js --execute\n')

    if (process.argv.includes('--execute')) {
        console.log('\n\n🚀 EXECUTION PHASE - Resetting deals:')
        console.log('-'.repeat(60))

        for (const dealId of DEAL_IDS) {
            await resetDeal(dealId)
        }

        console.log('\n\n✅ All deals have been reset successfully!')
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
