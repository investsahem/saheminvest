const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixProfitDistributionLinks() {
  try {
    console.log('🔍 Finding profit distribution transactions without investmentId...')
    
    // Find all PROFIT_DISTRIBUTION transactions that don't have investmentId
    const profitTransactions = await prisma.transaction.findMany({
      where: {
        type: 'PROFIT_DISTRIBUTION',
        investmentId: null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    console.log(`📊 Found ${profitTransactions.length} profit distribution transactions without investmentId`)

    if (profitTransactions.length === 0) {
      console.log('✅ No transactions need fixing!')
      return
    }

    let fixedCount = 0

    for (const transaction of profitTransactions) {
      console.log(`\n🔧 Processing transaction ${transaction.id} for user ${transaction.user.email}`)
      console.log(`   Description: ${transaction.description}`)
      console.log(`   Amount: $${transaction.amount}`)

      // Try to find matching investment based on description and user
      // Look for project title in description
      let projectTitle = null
      if (transaction.description.includes('هواتف مستعملة')) {
        projectTitle = 'هواتف مستعملة'
      } else if (transaction.description.includes('أجهزة إلكترونية للأطفال')) {
        projectTitle = 'أجهزة إلكترونية للأطفال'
      } else {
        // Try to extract project title from description
        const match = transaction.description.match(/من الصفقة "([^"]+)"/)
        if (match) {
          projectTitle = match[1]
        }
      }

      if (!projectTitle) {
        console.log(`   ❌ Could not extract project title from description`)
        continue
      }

      console.log(`   🎯 Looking for project: ${projectTitle}`)

      // Find the project and investment - look for the project that has investments
      const projects = await prisma.project.findMany({
        where: {
          title: projectTitle
        },
        include: {
          _count: {
            select: {
              investments: true
            }
          }
        }
      })

      // Find the project that actually has investments
      const project = projects.find(p => p._count.investments > 0) || projects[0]

      if (!project) {
        console.log(`   ❌ Project not found: ${projectTitle}`)
        continue
      }

      console.log(`   📍 Using project ${project.id} with ${project._count.investments} investments`)

      // Find the user's investment in this project
      const investment = await prisma.investment.findFirst({
        where: {
          projectId: project.id,
          investorId: transaction.userId
        }
      })

      if (!investment) {
        console.log(`   ❌ Investment not found for user ${transaction.user.email} in project ${projectTitle}`)
        continue
      }

      // Update the transaction with the investmentId
      await prisma.transaction.update({
        where: {
          id: transaction.id
        },
        data: {
          investmentId: investment.id
        }
      })

      console.log(`   ✅ Updated transaction ${transaction.id} with investmentId: ${investment.id}`)
      fixedCount++
    }

    console.log(`\n🎉 Successfully fixed ${fixedCount} out of ${profitTransactions.length} transactions`)
    console.log('✅ Profit distribution links have been updated!')

  } catch (error) {
    console.error('❌ Error fixing profit distribution links:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the fix
fixProfitDistributionLinks()
