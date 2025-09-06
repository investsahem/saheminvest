#!/usr/bin/env node

/**
 * Test Portfolio API Response
 */

require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testPortfolioAPI() {
  console.log('🧪 Testing Portfolio API Logic...')
  
  try {
    // Get Houssam's investments directly from the database
    const user = await prisma.user.findUnique({
      where: { email: 'Elhallak+2@gmail.com' }
    })
    
    if (!user) {
      console.log('❌ User not found')
      return
    }
    
    const investments = await prisma.investment.findMany({
      where: { investorId: user.id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
            thumbnailImage: true,
            fundingGoal: true,
            currentFunding: true,
            expectedReturn: true,
            duration: true,
            endDate: true,
            createdAt: true,
            updatedAt: true
          }
        }
      },
      orderBy: {
        investmentDate: 'desc'
      }
    })
    
    console.log(`📊 Found ${investments.length} investments for ${user.name}`)
    
    // Simulate the API calculation logic
    let totalInvested = 0 // Only active investments
    let totalHistoricalInvested = 0 // All investments ever made
    let currentPortfolioValue = 0
    let totalReturns = 0
    let totalDistributedProfits = 0
    
    for (const investment of investments) {
      const investedAmount = Number(investment.amount)
      totalHistoricalInvested += investedAmount
      
      console.log(`\n💰 Processing: ${investment.project.title}`)
      console.log(`   Investment: $${investedAmount.toFixed(2)}`)
      console.log(`   Project Status: ${investment.project.status}`)
      
      // Only count as "currently invested" if not completed
      if (investment.project.status !== 'COMPLETED') {
        totalInvested += investedAmount
        console.log(`   ✅ Counted as active investment`)
      } else {
        console.log(`   ❌ Not counted as active (completed)`)
      }

      // Get distributed profits from transactions (excluding capital returns)
      const profitTransactions = await prisma.transaction.findMany({
        where: {
          investmentId: investment.id,
          type: 'RETURN',
          status: 'COMPLETED',
          description: { not: { contains: 'Capital Return' } } // Exclude capital returns
        }
      })
      
      const distributedProfits = profitTransactions.reduce(
        (sum, transaction) => sum + Number(transaction.amount), 0
      )
      
      console.log(`   Profit Transactions: ${profitTransactions.length}`)
      console.log(`   Distributed Profits: $${distributedProfits.toFixed(2)}`)

      // Calculate current value based on project performance
      let currentValue = investedAmount
      const project = investment.project

      if (project.status === 'COMPLETED') {
        // For completed projects, current portfolio value is 0 (capital returned to wallet)
        currentValue = 0
        console.log(`   Current Portfolio Value: $0 (completed - capital in wallet)`)
      } else if (project.status === 'FUNDED') {
        // For funded projects, current value = investment + any distributed profits
        currentValue = investedAmount + distributedProfits
        console.log(`   Current Portfolio Value: $${currentValue.toFixed(2)} (funded)`)
      } else if (project.status === 'ACTIVE') {
        // For active projects, estimate based on expected return and progress + any distributed profits
        const fundingProgress = Number(project.currentFunding) / Number(project.fundingGoal)
        const timeProgress = project.endDate ? 
          Math.min(1, (Date.now() - new Date(project.createdAt).getTime()) / 
          (new Date(project.endDate).getTime() - new Date(project.createdAt).getTime())) : 0
        
        // Conservative estimation: partial expected return based on time progress
        const estimatedReturn = investedAmount * (Number(project.expectedReturn) / 100) * timeProgress * 0.5
        currentValue = investedAmount + estimatedReturn + distributedProfits
        console.log(`   Current Portfolio Value: $${currentValue.toFixed(2)} (active)`)
      } else {
        // For other statuses, just add distributed profits
        currentValue = investedAmount + distributedProfits
        console.log(`   Current Portfolio Value: $${currentValue.toFixed(2)} (other)`)
      }

      currentPortfolioValue += currentValue
      totalDistributedProfits += distributedProfits

      // Calculate returns for completed deals differently
      let totalReturn = 0
      if (project.status === 'COMPLETED') {
        // For completed deals, return is just the distributed profits
        totalReturn = distributedProfits
      } else {
        // For active/funded deals, return is current value - invested amount
        totalReturn = currentValue - investedAmount
      }
      
      totalReturns += totalReturn
      console.log(`   Total Return: $${totalReturn.toFixed(2)}`)
    }

    // Calculate portfolio performance metrics
    const portfolioReturn = totalHistoricalInvested > 0 ? (totalReturns / totalHistoricalInvested) * 100 : 0

    console.log(`\n📈 FINAL CALCULATIONS:`)
    console.log(`   Total Portfolio Value: $${currentPortfolioValue.toFixed(2)}`)
    console.log(`   Active Investments: $${totalInvested.toFixed(2)}`)
    console.log(`   Historical Total Invested: $${totalHistoricalInvested.toFixed(2)}`)
    console.log(`   Total Returns: $${totalReturns.toFixed(2)}`)
    console.log(`   Portfolio Return: ${portfolioReturn.toFixed(2)}%`)
    console.log(`   Distributed Profits: $${totalDistributedProfits.toFixed(2)}`)
    
    console.log(`\n✅ Expected Results:`)
    console.log(`   Portfolio Value: $0.00 (no active investments)`)
    console.log(`   Total Invested (Historical): $4,953.00`)
    console.log(`   Total Returns: $347.52`)
    console.log(`   Wallet Balance: $5,300.52 (capital + profits)`)
    
  } catch (error) {
    console.error('❌ Error testing portfolio API:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
if (require.main === module) {
  testPortfolioAPI().catch(console.error)
}

module.exports = { testPortfolioAPI }
