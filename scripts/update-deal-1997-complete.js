#!/usr/bin/env node

/**
 * Complete Deal 1997 (هواتف مستعملة) with Investment and Profit History
 * Updates the deal with real investment data, timeline, and profit distributions
 */

require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Deal timeline and investment data
const dealData = {
  id: '1997',
  title: 'هواتف مستعملة',
  
  // Updated deal info
  status: 'COMPLETED',
  fundingGoal: 20000,
  currentFunding: 19953, // 4953 + (5 * 3000)
  
  // Timeline
  startDate: new Date('2025-04-05'),
  endDate: new Date('2025-05-15'),
  fundingStartDate: new Date('2025-04-05'),
  fundingEndDate: new Date('2025-04-15'),
  
  // Milestones
  timeline: {
    "2025-04-05": "فتح الصفقة",
    "2025-04-15": "إغلاق التمويل", 
    "2025-04-22": "شراء البضائع",
    "2025-05-02": "إستلام البضائع",
    "2025-05-05": "بدأ البيع",
    "2025-05-15": "توزيع جزئي للأرباح"
  },
  
  // Investment data
  investments: [
    {
      investorEmail: 'Elhallak+2@gmail.com',
      investorName: 'Houssam EL Hallak',
      amount: 4953,
      date: new Date('2025-04-27')
    },
    {
      investorEmail: 'Elhallak+10@gmail.com', 
      investorName: 'اسيا قلموني',
      amount: 3000,
      date: new Date('2025-04-27')
    },
    {
      investorEmail: 'Elhallak+11@gmail.com',
      investorName: 'رامز قلموني', 
      amount: 3000,
      date: new Date('2025-04-27')
    },
    {
      investorEmail: 'Elhallak+12@gmail.com',
      investorName: 'جليلة قلموني',
      amount: 3000,
      date: new Date('2025-04-27')
    },
    {
      investorEmail: 'Elhallak+13@gmail.com',
      investorName: 'احمد علوان',
      amount: 3000,
      date: new Date('2025-04-27')
    },
    {
      investorEmail: 'Elhallak+14@gmail.com',
      investorName: 'عثمان حداد',
      amount: 3000,
      date: new Date('2025-04-27')
    }
  ],
  
  // Profit distributions
  profitDistributions: [
    {
      date: new Date('2025-05-15'),
      type: 'PARTIAL',
      description: 'توزيع جزئي للأرباح - الجزء الأول',
      distributions: [
        { investorEmail: 'Elhallak+2@gmail.com', amount: 147.52 },
        { investorEmail: 'Elhallak+10@gmail.com', amount: 110.49 },
        { investorEmail: 'Elhallak+11@gmail.com', amount: 110.49 },
        { investorEmail: 'Elhallak+12@gmail.com', amount: 110.49 },
        { investorEmail: 'Elhallak+13@gmail.com', amount: 110.49 },
        { investorEmail: 'Elhallak+14@gmail.com', amount: 110.49 }
      ]
    },
    {
      date: new Date('2025-05-20'), // Final distribution
      type: 'FINAL',
      description: 'التوزيع النهائي للأرباح',
      distributions: [
        { investorEmail: 'Elhallak+2@gmail.com', amount: 200.00 },
        { investorEmail: 'Elhallak+10@gmail.com', amount: 100.00 },
        { investorEmail: 'Elhallak+11@gmail.com', amount: 100.00 },
        { investorEmail: 'Elhallak+12@gmail.com', amount: 100.00 },
        { investorEmail: 'Elhallak+13@gmail.com', amount: 100.00 },
        { investorEmail: 'Elhallak+14@gmail.com', amount: 100.00 }
      ]
    }
  ]
}

async function updateDealComplete() {
  console.log('💰 Completing Deal 1997 with Investment and Profit History...')
  console.log('Database URL:', process.env.DATABASE_URL?.split('@')[1] || 'Not found')
  
  try {
    // Get all investor user IDs
    console.log('\n👥 Finding investor accounts...')
    const investors = {}
    
    for (const investment of dealData.investments) {
      const user = await prisma.user.findUnique({
        where: { email: investment.investorEmail },
        select: { id: true, name: true, email: true }
      })
      
      if (!user) {
        console.log(`❌ Investor not found: ${investment.investorEmail}`)
        continue
      }
      
      investors[investment.investorEmail] = user
      console.log(`✅ Found: ${user.name} (${user.email})`)
    }
    
    console.log(`\n📊 Found ${Object.keys(investors).length} investors`)
    
    // Update the deal status and funding
    console.log('\n🔄 Updating deal status and funding...')
    const updatedDeal = await prisma.project.update({
      where: { id: dealData.id },
      data: {
        status: dealData.status,
        fundingGoal: dealData.fundingGoal,
        currentFunding: dealData.currentFunding,
        startDate: dealData.startDate,
        endDate: dealData.endDate,
        timeline: dealData.timeline,
        updatedAt: new Date()
      }
    })
    
    console.log(`✅ Updated deal: ${updatedDeal.title}`)
    console.log(`   Status: ${updatedDeal.status}`)
    console.log(`   Funding: $${Number(updatedDeal.currentFunding).toLocaleString()} / $${Number(updatedDeal.fundingGoal).toLocaleString()}`)
    
    // Create investments
    console.log('\n💸 Creating investment records...')
    
    for (const investment of dealData.investments) {
      const investor = investors[investment.investorEmail]
      if (!investor) continue
      
      // Check if investment already exists
      const existingInvestment = await prisma.investment.findFirst({
        where: {
          projectId: dealData.id,
          investorId: investor.id
        }
      })
      
      if (existingInvestment) {
        console.log(`⚠️  Investment already exists for ${investor.name}, updating...`)
        const expectedReturnAmount = investment.amount * 0.06 // 6% average return
        
        await prisma.investment.update({
          where: { id: existingInvestment.id },
          data: {
            amount: investment.amount,
            expectedReturn: expectedReturnAmount,
            investmentDate: investment.date,
            createdAt: investment.date,
            updatedAt: new Date()
          }
        })
      } else {
        // Calculate expected return based on investment amount and deal return rate
        const expectedReturnAmount = investment.amount * 0.06 // 6% average return
        
        const newInvestment = await prisma.investment.create({
          data: {
            projectId: dealData.id,
            investorId: investor.id,
            amount: investment.amount,
            expectedReturn: expectedReturnAmount,
            actualReturn: 0, // Will be updated with profit distributions
            status: 'COMPLETED',
            investmentDate: investment.date,
            createdAt: investment.date,
            updatedAt: new Date()
          }
        })
        
        console.log(`✅ Created investment: ${investor.name} - $${investment.amount.toLocaleString()}`)
      }
      
      // Update investor's total invested
      await prisma.user.update({
        where: { id: investor.id },
        data: {
          totalInvested: { increment: investment.amount }
        }
      })
    }
    
    // Create profit distributions and transactions
    console.log('\n💰 Creating profit distribution records and transactions...')
    
    for (const distribution of dealData.profitDistributions) {
      console.log(`\n📅 Processing ${distribution.type} distribution (${distribution.date.toISOString().split('T')[0]})`)
      
      // Create individual profit distributions and transactions
      for (const dist of distribution.distributions) {
        const investor = investors[dist.investorEmail]
        if (!investor) continue
        
        // Find the investment for this investor
        const investment = await prisma.investment.findFirst({
          where: {
            projectId: dealData.id,
            investorId: investor.id
          }
        })
        
        if (!investment) {
          console.log(`❌ Investment not found for ${investor.name}`)
          continue
        }
        
        // Create profit distribution record
        const profitDistribution = await prisma.profitDistribution.create({
          data: {
            amount: dist.amount,
            distributionDate: distribution.date,
            profitPeriod: distribution.type === 'PARTIAL' ? 'partial' : 'final',
            status: 'COMPLETED',
            profitRate: (dist.amount / Number(investment.amount)) * 100, // Calculate profit rate
            investmentShare: (Number(investment.amount) / dealData.currentFunding) * 100,
            investmentId: investment.id,
            projectId: dealData.id,
            investorId: investor.id,
            createdAt: distribution.date,
            updatedAt: new Date()
          }
        })
        
        // Create return transaction
        const transaction = await prisma.transaction.create({
          data: {
            userId: investor.id,
            type: 'RETURN',
            amount: dist.amount,
            description: `${distribution.description} - صفقة هواتف مستعملة`,
            status: 'COMPLETED',
            createdAt: distribution.date,
            updatedAt: new Date()
          }
        })
        
        // Link the transaction to the profit distribution
        await prisma.profitDistribution.update({
          where: { id: profitDistribution.id },
          data: { transactionId: transaction.id }
        })
        
        // Update investment's actual return
        await prisma.investment.update({
          where: { id: investment.id },
          data: {
            actualReturn: { increment: dist.amount },
            lastReturnDate: distribution.date
          }
        })
        
        // Update investor's wallet balance and total returns
        await prisma.user.update({
          where: { id: investor.id },
          data: {
            walletBalance: { increment: dist.amount },
            totalReturns: { increment: dist.amount }
          }
        })
        
        console.log(`  💸 ${investor.name}: +$${dist.amount.toLocaleString()} (${distribution.type})`)
      }
    }
    
    // Summary
    console.log('\n📊 Final Summary:')
    
    const finalDeal = await prisma.project.findUnique({
      where: { id: dealData.id },
      include: {
        investments: {
          include: {
            investor: { select: { name: true, email: true } }
          }
        },
        _count: { select: { investments: true } }
      }
    })
    
    console.log(`✅ Deal: ${finalDeal.title}`)
    console.log(`   Status: ${finalDeal.status}`)
    console.log(`   Investors: ${finalDeal._count.investments}`)
    console.log(`   Total Raised: $${Number(finalDeal.currentFunding).toLocaleString()}`)
    
    const totalProfits = dealData.profitDistributions.reduce((sum, dist) => 
      sum + dist.distributions.reduce((distSum, d) => distSum + d.amount, 0), 0
    )
    
    console.log(`   Total Profits Distributed: $${totalProfits.toLocaleString()}`)
    
    console.log('\n🎉 Deal completion successful!')
    
  } catch (error) {
    console.error('❌ Error completing deal:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
if (require.main === module) {
  updateDealComplete().catch(console.error)
}

module.exports = { updateDealComplete }
