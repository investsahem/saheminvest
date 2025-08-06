const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding transactions...')

  try {
    // Get existing users
    const users = await prisma.user.findMany({
      include: {
        investments: {
          include: {
            project: true
          }
        }
      }
    })

    if (users.length === 0) {
      console.log('❌ No users found. Please run user seeding first.')
      return
    }

    // Sample transactions
    const transactions = [
      {
        userId: users.find(u => u.email === 'investor@sahaminvest.com')?.id,
        type: 'DEPOSIT',
        amount: 15000.00,
        status: 'COMPLETED',
        description: 'Initial wallet funding via bank transfer',
        reference: 'DEP-2024-001',
        method: 'bank'
      },
      {
        userId: users.find(u => u.email === 'investor@sahaminvest.com')?.id,
        type: 'DEPOSIT',
        amount: 5500.00,
        status: 'COMPLETED',
        description: 'Additional funding via credit card',
        reference: 'DEP-2024-002',
        method: 'card'
      },
      {
        userId: users.find(u => u.email === 'investor@sahaminvest.com')?.id,
        type: 'INVESTMENT',
        amount: 5000.00,
        status: 'COMPLETED',
        description: 'Investment in Electronics Manufacturing Project',
        reference: 'INV-2024-001'
      },
      {
        userId: users.find(u => u.email === 'investor@sahaminvest.com')?.id,
        type: 'INVESTMENT',
        amount: 3000.00,
        status: 'COMPLETED',
        description: 'Investment in Real Estate Development',
        reference: 'INV-2024-002'
      },
      {
        userId: users.find(u => u.email === 'investor@sahaminvest.com')?.id,
        type: 'RETURN',
        amount: 750.00,
        status: 'COMPLETED',
        description: 'Q4 2023 Return - Real Estate Project',
        reference: 'RET-2024-001'
      },
      {
        userId: users.find(u => u.email === 'investor@sahaminvest.com')?.id,
        type: 'RETURN',
        amount: 450.00,
        status: 'COMPLETED',
        description: 'Monthly Return - Tech Portfolio',
        reference: 'RET-2024-002'
      },
      {
        userId: users.find(u => u.email === 'investor@sahaminvest.com')?.id,
        type: 'FEE',
        amount: 200.00,
        status: 'COMPLETED',
        description: 'Platform management fee',
        reference: 'FEE-2024-001'
      },
      {
        userId: users.find(u => u.email === 'partner@sahaminvest.com')?.id,
        type: 'COMMISSION',
        amount: 250.00,
        status: 'COMPLETED',
        description: 'Partnership commission for deal referral',
        reference: 'COM-2024-001'
      },
      {
        userId: users.find(u => u.email === 'investor@sahaminvest.com')?.id,
        type: 'WITHDRAWAL',
        amount: 2000.00,
        status: 'PENDING',
        description: 'Withdrawal request to bank account',
        reference: 'WIT-2024-001',
        method: 'bank'
      },
      {
        userId: users.find(u => u.email === 'advisor@sahaminvest.com')?.id,
        type: 'DEPOSIT',
        amount: 8000.00,
        status: 'PENDING',
        description: 'Wallet funding - pending approval',
        reference: 'DEP-2024-003',
        method: 'bank'
      }
    ]

    // Create transactions
    for (const transaction of transactions) {
      if (transaction.userId) {
        await prisma.transaction.create({
          data: {
            ...transaction,
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
          }
        })
      }
    }

    console.log('✅ Transactions seeded successfully!')
    
    // Show summary
    const transactionCount = await prisma.transaction.count()
    console.log(`📊 Total transactions: ${transactionCount}`)

  } catch (error) {
    console.error('❌ Error seeding transactions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()