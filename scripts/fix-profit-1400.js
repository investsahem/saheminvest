const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixProfit() {
    // Find the PENDING FINAL distribution request for the deal with currentFunding = 19953
    const requests = await prisma.profitDistributionRequest.findMany({
        where: {
            status: 'PENDING',
            distributionType: 'FINAL'
        },
        include: {
            project: true
        }
    })

    console.log('Found requests:', requests.length)

    for (const req of requests) {
        console.log(`\nRequest ${req.id}:`)
        console.log(`  Project: ${req.project.title}`)
        console.log(`  Current Funding: $${req.project.currentFunding}`)
        console.log(`  Estimated Profit: $${req.estimatedProfit}`)
        console.log(`  Total Amount: $${req.totalAmount}`)

        // Check if this is the 19953 deal
        if (Number(req.project.currentFunding) === 19953) {
            console.log('\n  *** THIS IS THE DEAL TO FIX ***')
            console.log('  Updating estimatedProfit from $795 to $1400...')

            await prisma.profitDistributionRequest.update({
                where: { id: req.id },
                data: {
                    estimatedProfit: 1400
                }
            })

            console.log('  ✓ Updated estimatedProfit to $1400')
        }
    }

    await prisma.$disconnect()
}

fixProfit().catch(console.error)
