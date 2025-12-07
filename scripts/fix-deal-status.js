const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixDealStatus() {
    // Find the deal
    const deal = await prisma.project.findFirst({
        where: { title: 'هواتف مستعملة' }
    })

    if (!deal) {
        console.log('Deal not found!')
        return
    }

    console.log('=== Current Deal Status ===')
    console.log(`ID: ${deal.id}`)
    console.log(`Title: ${deal.title}`)
    console.log(`Status: ${deal.status}`)
    console.log(`Current Funding: $${deal.currentFunding}`)

    // Calculate total investments from investment records
    const investments = await prisma.investment.aggregate({
        where: { projectId: deal.id },
        _sum: { amount: true }
    })

    const totalInvested = Number(investments._sum.amount) || 0
    console.log(`\nTotal Invested (from records): $${totalInvested}`)

    // Update to COMPLETED and set correct funding
    const updated = await prisma.project.update({
        where: { id: deal.id },
        data: {
            status: 'COMPLETED',
            currentFunding: totalInvested
        }
    })

    console.log('\n=== Updated Deal Status ===')
    console.log(`Status: ${updated.status}`)
    console.log(`Current Funding: $${updated.currentFunding}`)

    await prisma.$disconnect()
}

fixDealStatus().catch(console.error)
