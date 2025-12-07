const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkDeal() {
    const deal = await prisma.project.findFirst({
        where: { title: 'هواتف مستعملة' },
        select: {
            id: true,
            title: true,
            status: true,
            currentFunding: true,
            fundingGoal: true
        }
    })

    console.log('=== Deal Status ===')
    console.log(`Title: ${deal.title}`)
    console.log(`Status: ${deal.status}`)
    console.log(`Funding: $${deal.currentFunding} / $${deal.fundingGoal}`)

    await prisma.$disconnect()
}

checkDeal().catch(console.error)
