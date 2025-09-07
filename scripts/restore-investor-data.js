const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function restoreInvestorData() {
  try {
    console.log('🔍 Checking current state after duplicate removal...')
    
    // Find the investor اديب شعراني
    const investor = await prisma.user.findUnique({
      where: { email: 'Elhallak+15@gmail.com' },
      include: {
        investments: {
          include: {
            profitDistributions: true,
            project: {
              select: { id: true, title: true }
            }
          }
        }
      }
    })

    if (!investor) {
      console.error('❌ Investor اديب شعراني not found')
      return
    }

    console.log('✅ Investor found:', investor.name, '(' + investor.email + ')')
    console.log('Current investments:', investor.investments.length)

    // Find the correct remaining deal
    const correctDeal = await prisma.project.findFirst({
      where: { 
        title: 'هواتف مستعملة',
        expectedReturn: 4,
        currentFunding: 20000
      },
      include: {
        investments: true,
        profitDistributions: true
      }
    })

    if (!correctDeal) {
      console.error('❌ Correct deal not found')
      return
    }

    console.log('✅ Correct deal found:', correctDeal.id)
    console.log('Current investments in deal:', correctDeal.investments.length)
    console.log('Current profit distributions in deal:', correctDeal.profitDistributions.length)

    // Check if investor already has investment in the correct deal
    const existingInvestment = await prisma.investment.findFirst({
      where: {
        investorId: investor.id,
        projectId: correctDeal.id
      }
    })

    if (existingInvestment) {
      console.log('✅ Investor already has investment in correct deal:', existingInvestment.id)
    } else {
      console.log('⚠️ Investor missing investment in correct deal. Creating...')
      
      // Create the investment
      const newInvestment = await prisma.investment.create({
        data: {
          amount: 20000,
          status: 'COMPLETED',
          investorId: investor.id,
          projectId: correctDeal.id,
          expectedReturn: 1150, // Total expected return
          actualReturn: 1150,
          investmentDate: new Date('2025-05-28'),
          lastReturnDate: new Date('2025-08-07')
        }
      })

      console.log('✅ Investment created:', newInvestment.id)

      // Create profit distributions
      const distributions = [
        { amount: 200, date: '2025-07-10', description: 'توزيع أرباح جزئي 1' },
        { amount: 200, date: '2025-07-15', description: 'توزيع أرباح جزئي 2' },
        { amount: 250, date: '2025-07-27', description: 'توزيع أرباح جزئي 3' },
        { amount: 500, date: '2025-08-07', description: 'توزيع أرباح نهائي' }
      ]

      console.log('💸 Creating profit distributions...')
      
      for (const dist of distributions) {
        const profitDistribution = await prisma.profitDistribution.create({
          data: {
            amount: dist.amount,
            distributionDate: new Date(dist.date),
            profitPeriod: 'partial',
            status: 'COMPLETED',
            profitRate: (dist.amount / 20000) * 100, // Calculate percentage
            investmentShare: 100,
            investmentId: newInvestment.id,
            projectId: correctDeal.id,
            investorId: investor.id
          }
        })

        console.log(`✅ Profit distribution created: $${dist.amount} on ${dist.date}`)
      }

      // Update investor totals if needed
      await prisma.user.update({
        where: { id: investor.id },
        data: {
          totalInvested: 20000,
          totalReturns: 1150
        }
      })

      console.log('✅ Updated investor totals')
    }

    // Final verification
    const finalCheck = await prisma.project.findUnique({
      where: { id: correctDeal.id },
      include: {
        investments: {
          include: {
            investor: {
              select: { name: true, email: true }
            }
          }
        },
        profitDistributions: {
          include: {
            investor: {
              select: { name: true }
            }
          }
        }
      }
    })

    console.log('\n🎉 Final verification:')
    console.log('Deal ID:', finalCheck.id)
    console.log('Deal Title:', finalCheck.title)
    console.log('Expected Return:', finalCheck.expectedReturn + '%')
    console.log('Funding:', `${Number(finalCheck.currentFunding)} / ${Number(finalCheck.fundingGoal)} (${((Number(finalCheck.currentFunding) / Number(finalCheck.fundingGoal)) * 100).toFixed(1)}%)`)
    console.log('Total Investments:', finalCheck.investments.length)
    console.log('Total Profit Distributions:', finalCheck.profitDistributions.length)
    
    console.log('\nInvestors:')
    finalCheck.investments.forEach((inv, i) => {
      console.log(`${i + 1}. ${inv.investor.name} (${inv.investor.email}) - $${Number(inv.amount)}`)
    })

    console.log('\nProfit Distributions:')
    finalCheck.profitDistributions.forEach((dist, i) => {
      console.log(`${i + 1}. ${dist.investor.name} - $${Number(dist.amount)} on ${dist.distributionDate.toDateString()}`)
    })

  } catch (error) {
    console.error('❌ Error restoring investor data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
restoreInvestorData()
