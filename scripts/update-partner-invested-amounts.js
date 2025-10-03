const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function updatePartnerInvestedAmounts() {
  console.log('💰 Updating partner invested amounts...')

  try {
    // Get all partners
    const partners = await prisma.partner.findMany({
      include: {
        user: true,
        projects: {
          select: {
            id: true,
            title: true,
            currentFunding: true,
            fundingGoal: true,
            status: true
          }
        }
      }
    })

    console.log(`Found ${partners.length} partners`)

    for (const partner of partners) {
      console.log(`\nUpdating partner: ${partner.companyName} (${partner.user.email})`)
      
      // Calculate total invested amount from all their deals
      const totalInvested = partner.projects.reduce((sum, project) => {
        console.log(`  Deal: ${project.title} - Current Funding: $${project.currentFunding}`)
        return sum + Number(project.currentFunding)
      }, 0)

      console.log(`  Total invested amount: $${totalInvested}`)

      // Update the partner's totalFunding field
      await prisma.partner.update({
        where: { id: partner.id },
        data: {
          totalFunding: totalInvested,
          totalDeals: partner.projects.length,
          // Reset commission to 0 since we're not using it anymore
          totalCommission: 0
        }
      })

      console.log(`  ✅ Updated partner totalFunding to $${totalInvested}`)
    }

    console.log('\n✅ Partner invested amounts updated successfully!')

    // Show summary
    const updatedPartners = await prisma.partner.findMany({
      include: {
        user: true
      }
    })

    console.log('\n📊 Updated Partner Summary:')
    updatedPartners.forEach((partner, index) => {
      console.log(`${index + 1}. ${partner.companyName} (${partner.user.email})`)
      console.log(`   Total Invested: $${partner.totalFunding}`)
      console.log(`   Total Deals: ${partner.totalDeals}`)
      console.log(`   Status: ${partner.status}`)
    })

  } catch (error) {
    console.error('❌ Error updating partner invested amounts:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updatePartnerInvestedAmounts()
