#!/usr/bin/env node

/**
 * Fix Portfolio and Wallet Calculations
 * Corrects the calculation issues for completed investments
 */

require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixPortfolioCalculations() {
  console.log('🔧 Fixing Portfolio and Wallet Calculations...')
  
  try {
    // Get Houssam EL Hallak's data to debug
    const user = await prisma.user.findUnique({
      where: { email: 'Elhallak+2@gmail.com' },
      include: {
        investments: {
          include: {
            project: { select: { id: true, title: true, status: true } }
          }
        },
        transactions: {
          where: { type: 'RETURN' },
          orderBy: { createdAt: 'desc' }
        }
      }
    })
    
    if (!user) {
      console.log('❌ User not found')
      return
    }
    
    console.log('👤 User:', user.name, user.email)
    console.log('💰 Current Wallet Balance:', Number(user.walletBalance).toFixed(2))
    console.log('📊 Total Invested:', Number(user.totalInvested).toFixed(2))
    console.log('📈 Total Returns:', Number(user.totalReturns).toFixed(2))
    
    console.log('\n📋 Investments:')
    user.investments.forEach((inv, index) => {
      console.log(`  ${index + 1}. ${inv.project.title}`)
      console.log(`     Amount: $${Number(inv.amount).toFixed(2)}`)
      console.log(`     Expected: $${Number(inv.expectedReturn).toFixed(2)}`)
      console.log(`     Actual: $${Number(inv.actualReturn).toFixed(2)}`)
      console.log(`     Status: ${inv.status} (Project: ${inv.project.status})`)
    })
    
    console.log('\n💸 Return Transactions:')
    let totalProfitTransactions = 0
    user.transactions.forEach((tx, index) => {
      console.log(`  ${index + 1}. ${tx.description}`)
      console.log(`     Amount: $${Number(tx.amount).toFixed(2)}`)
      console.log(`     Date: ${tx.createdAt.toISOString().split('T')[0]}`)
      console.log(`     Investment ID: ${tx.investmentId || 'None'}`)
      totalProfitTransactions += Number(tx.amount)
    })
    
    console.log('\n🧮 Calculations:')
    console.log(`Total from profit transactions: $${totalProfitTransactions.toFixed(2)}`)
    
    // Expected values for Houssam:
    // Investment: $4,953
    // Partial profit: $147.52
    // Final profit: $200.00
    // Total profits: $347.52
    // Expected wallet balance: $4,953 (capital return) + $347.52 (profits) = $5,300.52
    
    console.log('\n📝 Expected values for Houssam:')
    console.log('  Original Investment: $4,953.00')
    console.log('  Partial Profit: $147.52')
    console.log('  Final Profit: $200.00')
    console.log('  Total Profits: $347.52')
    console.log('  Expected Wallet: $4,953.00 (capital) + $347.52 (profits) = $5,300.52')
    
    // Let's call the wallet balance API to see what it calculates
    console.log('\n🔄 Testing wallet balance API calculation...')
    
    // Find completed investments that need capital return
    const completedInvestments = user.investments.filter(inv => inv.project.status === 'COMPLETED')
    
    console.log(`\n🏁 Found ${completedInvestments.length} completed investments`)
    
    for (const investment of completedInvestments) {
      // Check if capital return transaction exists
      const capitalReturn = await prisma.transaction.findFirst({
        where: {
          userId: user.id,
          investmentId: investment.id,
          type: 'RETURN',
          description: { contains: 'Capital Return' }
        }
      })
      
      if (capitalReturn) {
        console.log(`  ✅ Capital return already exists for ${investment.project.title}: $${Number(capitalReturn.amount).toFixed(2)}`)
      } else {
        console.log(`  ❌ Missing capital return for ${investment.project.title}: $${Number(investment.amount).toFixed(2)}`)
        
        // Create the capital return transaction
        console.log(`  🔄 Creating capital return transaction...`)
        
        const newCapitalReturn = await prisma.transaction.create({
          data: {
            userId: user.id,
            investmentId: investment.id,
            type: 'RETURN',
            amount: Number(investment.amount),
            description: `Capital Return - ${investment.project.title}`,
            status: 'COMPLETED',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
        
        console.log(`  ✅ Created capital return: $${Number(newCapitalReturn.amount).toFixed(2)}`)
      }
    }
    
    // Recalculate user's wallet balance
    console.log('\n🔄 Recalculating wallet balance...')
    
    const allTransactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        status: 'COMPLETED'
      }
    })
    
    let newBalance = 0
    let newTotalReturns = 0
    let newTotalInvested = 0
    
    allTransactions.forEach(tx => {
      const amount = Number(tx.amount)
      switch (tx.type) {
        case 'DEPOSIT':
          newBalance += amount
          break
        case 'WITHDRAWAL':
          newBalance -= amount
          break
        case 'INVESTMENT':
          newBalance -= amount
          newTotalInvested += amount
          break
        case 'RETURN':
          newBalance += amount
          newTotalReturns += amount
          break
      }
    })
    
    // Update user's balances
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        walletBalance: newBalance,
        totalInvested: newTotalInvested,
        totalReturns: newTotalReturns
      }
    })
    
    console.log('\n✅ Updated balances:')
    console.log(`  Wallet Balance: $${Number(updatedUser.walletBalance).toFixed(2)}`)
    console.log(`  Total Invested: $${Number(updatedUser.totalInvested).toFixed(2)}`)
    console.log(`  Total Returns: $${Number(updatedUser.totalReturns).toFixed(2)}`)
    
    console.log('\n🎉 Portfolio calculations fixed!')
    
  } catch (error) {
    console.error('❌ Error fixing calculations:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
if (require.main === module) {
  fixPortfolioCalculations().catch(console.error)
}

module.exports = { fixPortfolioCalculations }
