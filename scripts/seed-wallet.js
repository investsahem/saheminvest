const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedWalletBalance() {
  try {
    console.log('Adding wallet balance to demo users...')

    // Find demo users and add wallet balance
    const demoUsers = [
      { email: 'investor@sahaminvest.com', balance: 50000 },
      { email: 'partner@sahaminvest.com', balance: 25000 },
      { email: 'advisor@sahaminvest.com', balance: 30000 },
      { email: 'admin@sahaminvest.com', balance: 100000 }
    ]

    for (const userData of demoUsers) {
      const user = await prisma.user.findUnique({
        where: { email: userData.email }
      })

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            walletBalance: userData.balance
          }
        })
        console.log(`Updated ${userData.email} wallet balance to $${userData.balance}`)
      } else {
        console.log(`User ${userData.email} not found, skipping...`)
      }
    }

    console.log('✅ Successfully updated wallet balances!')

  } catch (error) {
    console.error('Error updating wallet balances:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedWalletBalance()