const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function cleanFakeData() {
  console.log('🧹 Cleaning fake demo data...')

  try {
    // Keep only the real user (Elhallak+1@gmail.com)
    const realUser = await prisma.user.findUnique({
      where: { email: 'Elhallak+1@gmail.com' }
    })

    if (!realUser) {
      console.log('❌ Real user not found!')
      return
    }

    console.log(`✅ Found real user: ${realUser.email} (ID: ${realUser.id})`)

    // Delete all fake demo partners (keep only real user's partner profile if exists)
    const fakePartners = await prisma.partner.findMany({
      where: {
        userId: {
          not: realUser.id
        }
      },
      include: {
        user: true
      }
    })

    console.log(`🗑️ Found ${fakePartners.length} fake partners to delete`)

    // Delete fake partners and their associated users
    for (const partner of fakePartners) {
      console.log(`Deleting fake partner: ${partner.companyName} (${partner.user.email})`)
      
      // Delete partner first (due to foreign key constraints)
      await prisma.partner.delete({
        where: { id: partner.id }
      })

      // Delete the associated user if it's a demo user
      if (partner.user.email.includes('@sahaminvest.com') || 
          partner.user.email.includes('demo') ||
          partner.user.email.includes('test') ||
          partner.user.email.includes('@emiratesrealestate.ae') ||
          partner.user.email.includes('@greenenergy.ae') ||
          partner.user.email.includes('@healthinnovations.ae') ||
          partner.user.email.includes('@financeconsulting.ae') ||
          partner.user.email.includes('@retailsolutions.ae')) {
        
        await prisma.user.delete({
          where: { id: partner.userId }
        })
        console.log(`  ✅ Deleted fake user: ${partner.user.email}`)
      }
    }

    // Delete fake deals (keep only deals owned by real user)
    const fakeDeals = await prisma.project.findMany({
      where: {
        ownerId: {
          not: realUser.id
        }
      }
    })

    console.log(`🗑️ Found ${fakeDeals.length} fake deals to delete`)

    for (const deal of fakeDeals) {
      console.log(`Deleting fake deal: ${deal.title}`)
      await prisma.project.delete({
        where: { id: deal.id }
      })
    }

    // Delete fake transactions (keep only real user's transactions)
    const fakeTransactions = await prisma.transaction.findMany({
      where: {
        userId: {
          not: realUser.id
        }
      }
    })

    console.log(`🗑️ Found ${fakeTransactions.length} fake transactions to delete`)

    for (const transaction of fakeTransactions) {
      await prisma.transaction.delete({
        where: { id: transaction.id }
      })
    }

    // Delete fake investments (keep only real user's investments)
    const fakeInvestments = await prisma.investment.findMany({
      where: {
        investorId: {
          not: realUser.id
        }
      }
    })

    console.log(`🗑️ Found ${fakeInvestments.length} fake investments to delete`)

    for (const investment of fakeInvestments) {
      await prisma.investment.delete({
        where: { id: investment.id }
      })
    }

    // Delete other fake demo users (admin, deal_manager, etc.)
    const fakeUsers = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: realUser.id } },
          {
            OR: [
              { email: { contains: '@sahaminvest.com' } },
              { email: { contains: 'demo' } },
              { email: { contains: 'test' } },
              { email: { contains: 'admin@' } },
              { email: { contains: 'partner@' } },
              { email: { contains: 'investor@' } },
              { email: { contains: 'advisor@' } }
            ]
          }
        ]
      }
    })

    console.log(`🗑️ Found ${fakeUsers.length} fake users to delete`)

    for (const user of fakeUsers) {
      console.log(`Deleting fake user: ${user.email}`)
      
      // Delete related data first to avoid foreign key constraints
      await prisma.notification.deleteMany({
        where: { userId: user.id }
      })
      
      await prisma.userPermission.deleteMany({
        where: { userId: user.id }
      })
      
      await prisma.userInvestorAssignment.deleteMany({
        where: { 
          OR: [
            { advisorId: user.id },
            { investorId: user.id }
          ]
        }
      })
      
      await prisma.partnerNotificationSettings.deleteMany({
        where: { userId: user.id }
      })
      
      await prisma.partnerSecuritySettings.deleteMany({
        where: { userId: user.id }
      })
      
      await prisma.partnerProfile.deleteMany({
        where: { userId: user.id }
      })
      
      // Now delete the user
      await prisma.user.delete({
        where: { id: user.id }
      })
    }

    console.log('✅ Fake data cleanup completed!')
    
    // Show summary of remaining data
    const remainingUsers = await prisma.user.count()
    const remainingPartners = await prisma.partner.count()
    const remainingDeals = await prisma.project.count()
    const remainingTransactions = await prisma.transaction.count()
    const remainingInvestments = await prisma.investment.count()

    console.log('\n📊 Remaining real data:')
    console.log(`  Users: ${remainingUsers}`)
    console.log(`  Partners: ${remainingPartners}`)
    console.log(`  Deals: ${remainingDeals}`)
    console.log(`  Transactions: ${remainingTransactions}`)
    console.log(`  Investments: ${remainingInvestments}`)

  } catch (error) {
    console.error('❌ Error cleaning fake data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanFakeData()
