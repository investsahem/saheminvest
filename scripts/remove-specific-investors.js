const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function removeSpecificInvestors() {
  try {
    console.log('🔍 Looking for specific investors to remove permanently...')
    
    // List of emails to remove
    const emailsToRemove = [
      'houssamelhallak@example.com',
      'houssam.elhaltak@sahaminvest.com', 
      'adeeb.sharawi@sahaminvest.com',
      'اديبشعراني@example.com'
    ]

    console.log('📋 Emails to remove:')
    emailsToRemove.forEach((email, i) => {
      console.log(`${i + 1}. ${email}`)
    })

    // Find users with these emails
    const usersToRemove = await prisma.user.findMany({
      where: {
        email: {
          in: emailsToRemove
        }
      },
      include: {
        investments: {
          include: {
            profitDistributions: true,
            project: {
              select: { id: true, title: true, currentFunding: true, fundingGoal: true }
            }
          }
        },
        transactions: true,
        notifications: true,
        profitDistributions: true
      }
    })

    console.log(`\n✅ Found ${usersToRemove.length} users to remove:`)
    
    if (usersToRemove.length === 0) {
      console.log('No users found with the specified emails.')
      return
    }

    // Display user details before deletion
    for (let i = 0; i < usersToRemove.length; i++) {
      const user = usersToRemove[i]
      console.log(`\n👤 User ${i + 1}:`)
      console.log('- ID:', user.id)
      console.log('- Name:', user.name)
      console.log('- Email:', user.email)
      console.log('- Role:', user.role)
      console.log('- Investments:', user.investments.length)
      console.log('- Transactions:', user.transactions.length)
      console.log('- Notifications:', user.notifications.length)
      console.log('- Profit Distributions:', user.profitDistributions.length)
      console.log('- Total Invested:', Number(user.totalInvested))
      console.log('- Total Returns:', Number(user.totalReturns))
      console.log('- Wallet Balance:', Number(user.walletBalance))
      
      // Show investment details
      if (user.investments.length > 0) {
        console.log('  📊 Investment Details:')
        user.investments.forEach((inv, j) => {
          console.log(`    ${j + 1}. Project: ${inv.project.title} - Amount: $${Number(inv.amount)}`)
          console.log(`       Profit Distributions: ${inv.profitDistributions.length}`)
        })
      }
    }

    console.log('\n⚠️ Starting permanent deletion process...')

    // Delete process for each user
    for (const user of usersToRemove) {
      console.log(`\n🗑️ Deleting user: ${user.name} (${user.email})`)
      
      // 1. Delete profit distributions first (due to foreign key constraints)
      if (user.profitDistributions.length > 0) {
        console.log('  🗑️ Deleting profit distributions...')
        const deletedDistributions = await prisma.profitDistribution.deleteMany({
          where: { investorId: user.id }
        })
        console.log(`    Deleted ${deletedDistributions.count} profit distributions`)
      }

      // 2. Handle investments and update project funding
      if (user.investments.length > 0) {
        console.log('  🗑️ Processing investments...')
        
        for (const investment of user.investments) {
          // Update project funding (subtract the investment amount)
          await prisma.project.update({
            where: { id: investment.projectId },
            data: {
              currentFunding: { decrement: Number(investment.amount) }
            }
          })
          console.log(`    Updated project funding for: ${investment.project.title}`)
        }

        // Delete investments
        const deletedInvestments = await prisma.investment.deleteMany({
          where: { investorId: user.id }
        })
        console.log(`    Deleted ${deletedInvestments.count} investments`)
      }

      // 3. Delete transactions
      if (user.transactions.length > 0) {
        console.log('  🗑️ Deleting transactions...')
        const deletedTransactions = await prisma.transaction.deleteMany({
          where: { userId: user.id }
        })
        console.log(`    Deleted ${deletedTransactions.count} transactions`)
      }

      // 4. Delete notifications
      if (user.notifications.length > 0) {
        console.log('  🗑️ Deleting notifications...')
        const deletedNotifications = await prisma.notification.deleteMany({
          where: { userId: user.id }
        })
        console.log(`    Deleted ${deletedNotifications.count} notifications`)
      }

      // 5. Delete any other related records (accounts, sessions, etc.)
      console.log('  🗑️ Deleting accounts and sessions...')
      await prisma.account.deleteMany({
        where: { userId: user.id }
      })
      await prisma.session.deleteMany({
        where: { userId: user.id }
      })

      // 6. Finally delete the user
      console.log('  🗑️ Deleting user account...')
      await prisma.user.delete({
        where: { id: user.id }
      })

      console.log(`  ✅ User ${user.name} deleted successfully`)
    }

    console.log('\n🎉 All specified users removed permanently!')

    // Verification - check if any users still exist with these emails
    console.log('\n🔍 Verification - checking if users still exist...')
    const remainingUsers = await prisma.user.findMany({
      where: {
        email: {
          in: emailsToRemove
        }
      }
    })

    if (remainingUsers.length === 0) {
      console.log('✅ Verification successful - no users found with specified emails')
    } else {
      console.log('❌ Warning: Some users still exist:')
      remainingUsers.forEach(user => {
        console.log(`- ${user.name} (${user.email})`)
      })
    }

    // Show summary of remaining users
    console.log('\n📊 Database summary after cleanup:')
    const totalUsers = await prisma.user.count()
    const totalInvestors = await prisma.user.count({ where: { role: 'INVESTOR' } })
    const totalPartners = await prisma.user.count({ where: { role: 'PARTNER' } })
    const totalInvestments = await prisma.investment.count()
    const totalProjects = await prisma.project.count()

    console.log(`- Total Users: ${totalUsers}`)
    console.log(`- Investors: ${totalInvestors}`)
    console.log(`- Partners: ${totalPartners}`)
    console.log(`- Total Investments: ${totalInvestments}`)
    console.log(`- Total Projects: ${totalProjects}`)

  } catch (error) {
    console.error('❌ Error removing investors:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
removeSpecificInvestors()
