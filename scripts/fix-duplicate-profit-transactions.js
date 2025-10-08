const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixDuplicateProfitTransactions() {
  try {
    console.log('🔍 Finding duplicate profit distribution transactions...')
    
    // Find all PROFIT_DISTRIBUTION transactions
    const profitTransactions = await prisma.transaction.findMany({
      where: {
        type: 'PROFIT_DISTRIBUTION'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    console.log(`📊 Found ${profitTransactions.length} total profit distribution transactions`)

    // Group transactions by user and description (to find duplicates from same distribution)
    const transactionGroups = new Map()
    
    for (const transaction of profitTransactions) {
      // Create a key based on userId + description
      const key = `${transaction.userId}:${transaction.description}`
      
      if (!transactionGroups.has(key)) {
        transactionGroups.set(key, [])
      }
      transactionGroups.get(key).push(transaction)
    }

    console.log(`\n🔍 Analyzing ${transactionGroups.size} unique distribution groups...`)

    let duplicatesFound = 0
    let transactionsToDelete = []
    let usersToUpdate = new Map()

    for (const [key, transactions] of transactionGroups.entries()) {
      if (transactions.length > 1) {
        duplicatesFound++
        const [userId, description] = key.split(':')
        const user = transactions[0].user
        
        console.log(`\n⚠️  Found ${transactions.length} duplicate transactions for ${user.email}:`)
        console.log(`   Description: ${description}`)
        
        // Keep the first transaction, sum all amounts
        const totalAmount = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0)
        const firstTx = transactions[0]
        const duplicateTxs = transactions.slice(1)
        
        console.log(`   Individual amounts: ${transactions.map(tx => `$${tx.amount}`).join(', ')}`)
        console.log(`   Total amount: $${totalAmount}`)
        console.log(`   ✅ Keeping transaction ${firstTx.id}`)
        console.log(`   ❌ Will delete ${duplicateTxs.length} duplicate transactions`)
        
        // Mark duplicates for deletion
        transactionsToDelete.push(...duplicateTxs.map(tx => tx.id))
        
        // Calculate the amount to deduct from user's balance (the extra amount)
        const amountToDeduct = transactions.slice(1).reduce((sum, tx) => sum + Number(tx.amount), 0)
        
        if (!usersToUpdate.has(userId)) {
          usersToUpdate.set(userId, {
            email: user.email,
            amountToDeduct: 0
          })
        }
        usersToUpdate.get(userId).amountToDeduct += amountToDeduct
      }
    }

    if (duplicatesFound === 0) {
      console.log('\n✅ No duplicate transactions found!')
      return
    }

    console.log(`\n📋 Summary:`)
    console.log(`   - Found ${duplicatesFound} groups with duplicates`)
    console.log(`   - Will delete ${transactionsToDelete.length} transactions`)
    console.log(`   - Will update ${usersToUpdate.size} user wallets`)

    // Show wallet updates
    console.log(`\n💰 Wallet adjustments:`)
    for (const [userId, userData] of usersToUpdate.entries()) {
      console.log(`   ${userData.email}: -$${userData.amountToDeduct.toFixed(2)}`)
    }

    console.log(`\n🔄 Executing cleanup...`)

    // Execute in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Delete duplicate transactions
      if (transactionsToDelete.length > 0) {
        const deleteResult = await tx.transaction.deleteMany({
          where: {
            id: { in: transactionsToDelete }
          }
        })
        console.log(`   ✅ Deleted ${deleteResult.count} duplicate transactions`)
      }

      // 2. Update user wallets and totalReturns
      for (const [userId, userData] of usersToUpdate.entries()) {
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { walletBalance: true, totalReturns: true }
        })

        if (user) {
          const newBalance = Number(user.walletBalance) - userData.amountToDeduct
          const newTotalReturns = Number(user.totalReturns) - userData.amountToDeduct

          await tx.user.update({
            where: { id: userId },
            data: {
              walletBalance: newBalance,
              totalReturns: newTotalReturns
            }
          })

          console.log(`   ✅ Updated ${userData.email}: Balance $${newBalance.toFixed(2)}, Returns $${newTotalReturns.toFixed(2)}`)
        }
      }
    })

    console.log('\n🎉 Cleanup completed successfully!')
    console.log('✅ Duplicate profit transactions have been removed and balances adjusted')

  } catch (error) {
    console.error('❌ Error fixing duplicate profit transactions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the fix
fixDuplicateProfitTransactions()
