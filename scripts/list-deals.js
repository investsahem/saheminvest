// scripts/list-deals.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const projects = await prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        take: 30,
        select: {
            id: true,
            title: true,
            status: true,
            currentFunding: true,
            slug: true,
            _count: {
                select: { investments: true }
            }
        }
    })

    console.log('\n=== All Deals ===\n')
    for (const p of projects) {
        console.log(`ID: ${p.id}`)
        console.log(`  Title: ${p.title}`)
        console.log(`  Slug: ${p.slug || 'N/A'}`)
        console.log(`  Status: ${p.status}`)
        console.log(`  Current Funding: $${Number(p.currentFunding).toLocaleString()}`)
        console.log(`  Investments: ${p._count.investments}`)
        console.log('')
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
