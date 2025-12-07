const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkInvestorData() {
    // Find the investor "اسيا قلموني" 
    const investors = await prisma.user.findMany({
        where: {
            email: { contains: 'Elhallak' }
        },
        select: {
            id: true,
            name: true,
            email: true,
            walletBalance: true,
            totalReturns: true
        }
    })

    console.log('=== Investors Found ===')
    for (const inv of investors) {
        console.log(`\n${inv.name} (${inv.email})`)
        console.log(`  Wallet: $${inv.walletBalance}`)
        console.log(`  Total Returns: $${inv.totalReturns}`)

        // Get their investments
        const investments = await prisma.investment.findMany({
            where: { investorId: inv.id },
            include: { project: { select: { title: true, currentFunding: true } } }
        })

        console.log(`  Investments:`)
        for (const investment of investments) {
            console.log(`    - ${investment.project.title}: $${investment.amount}`)

            // Get transactions for this investment
            const transactions = await prisma.transaction.findMany({
                where: {
                    OR: [
                        { investmentId: investment.id },
                        { userId: inv.id }
                    ]
                },
                orderBy: { createdAt: 'desc' }
            })

            console.log(`    Transactions:`)
            for (const tx of transactions) {
                console.log(`      ${tx.type}: $${tx.amount} - ${tx.description || 'No description'}`)
            }
        }
    }

    await prisma.$disconnect()
}

checkInvestorData().catch(console.error)
