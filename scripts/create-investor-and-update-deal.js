const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function createInvestorAndUpdateDeal() {
  try {
    console.log('🔍 Creating new investor: اديب شعراني')
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'Elhallak+15@gmail.com' }
    })

    let investor
    if (existingUser) {
      console.log('✅ Investor already exists:', existingUser.email)
      investor = existingUser
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash('Azerty@123123', 12)

      // Create new investor
      investor = await prisma.user.create({
        data: {
          name: 'اديب شعراني',
          email: 'Elhallak+15@gmail.com',
          password: hashedPassword,
          role: 'INVESTOR',
          isActive: true,
          walletBalance: 0,
          totalInvested: 0,
          totalReturns: 0,
          preferredLanguage: 'ar',
          timezone: 'Asia/Beirut'
        }
      })

      console.log('✅ New investor created:', {
        id: investor.id,
        name: investor.name,
        email: investor.email,
        role: investor.role
      })
    }

    // Find deal 2680 - let's search by title since we created it
    console.log('🔍 Looking for deal "هواتف مستعملة"...')
    
    const deal = await prisma.project.findFirst({
      where: { 
        title: 'هواتف مستعملة'
      },
      include: {
        investments: true,
        profitDistributions: true
      }
    })

    if (!deal) {
      console.error('❌ Deal not found with title "هواتف مستعملة"')
      
      // Show available deals
      const allDeals = await prisma.project.findMany({
        select: { id: true, title: true, status: true, ownerId: true }
      })
      console.log('Available deals:')
      console.table(allDeals)
      return
    }

    console.log('✅ Deal found:', {
      id: deal.id,
      title: deal.title,
      status: deal.status,
      currentFunding: deal.currentFunding
    })

    // Check if investor already has investment in this deal
    const existingInvestment = await prisma.investment.findFirst({
      where: {
        investorId: investor.id,
        projectId: deal.id
      }
    })

    let investment
    if (existingInvestment) {
      console.log('✅ Investment already exists for this investor in this deal')
      investment = existingInvestment
    } else {
      // Create investment
      console.log('💰 Creating investment...')
      investment = await prisma.investment.create({
        data: {
          amount: 20000,
          status: 'COMPLETED',
          investorId: investor.id,
          projectId: deal.id,
          expectedReturn: 1150, // Total expected return (200+200+250+500)
          actualReturn: 1150,
          investmentDate: new Date('2025-05-28'),
          lastReturnDate: new Date('2025-08-07')
        }
      })

      console.log('✅ Investment created:', {
        id: investment.id,
        amount: investment.amount,
        investor: investor.name,
        expectedReturn: investment.expectedReturn,
        actualReturn: investment.actualReturn
      })

      // Update investor's totals
      await prisma.user.update({
        where: { id: investor.id },
        data: {
          totalInvested: { increment: 20000 },
          totalReturns: { increment: 1150 }
        }
      })

      console.log('✅ Updated investor totals')
    }

    // Create profit distributions
    console.log('💸 Creating profit distributions...')
    
    const distributions = [
      { amount: 200, date: '2025-07-10', description: 'توزيع أرباح جزئي 1' },
      { amount: 200, date: '2025-07-15', description: 'توزيع أرباح جزئي 2' },
      { amount: 250, date: '2025-07-27', description: 'توزيع أرباح جزئي 3' },
      { amount: 500, date: '2025-08-07', description: 'توزيع أرباح نهائي' }
    ]

    for (const dist of distributions) {
      // Check if distribution already exists
      const existingDist = await prisma.profitDistribution.findFirst({
        where: {
          investmentId: investment.id,
          projectId: deal.id,
          investorId: investor.id,
          amount: dist.amount,
          distributionDate: new Date(dist.date)
        }
      })

      if (!existingDist) {
        const profitDistribution = await prisma.profitDistribution.create({
          data: {
            amount: dist.amount,
            distributionDate: new Date(dist.date),
            profitPeriod: 'partial',
            status: 'COMPLETED',
            profitRate: (dist.amount / 20000) * 100, // Calculate percentage
            investmentShare: 100,
            investmentId: investment.id,
            projectId: deal.id,
            investorId: investor.id
          }
        })

        console.log(`✅ Profit distribution created: $${dist.amount} on ${dist.date}`)
      } else {
        console.log(`✅ Profit distribution already exists: $${dist.amount} on ${dist.date}`)
      }
    }

    // Update deal information to reflect the investment
    await prisma.project.update({
      where: { id: deal.id },
      data: {
        currentFunding: deal.currentFunding + (existingInvestment ? 0 : 20000)
      }
    })

    console.log('\n🎉 Process completed successfully!')
    console.log('📊 Summary:')
    console.log('- Investor: اديب شعراني (Elhallak+15@gmail.com)')
    console.log('- Deal: هواتف مستعملة (ID:', deal.id + ')')
    console.log('- Investment: $20,000 on 28/05/2025')
    console.log('- Total Returns: $1,150')
    console.log('- Profit Distributions:')
    console.log('  • $200 on 10/07/2025')
    console.log('  • $200 on 15/07/2025') 
    console.log('  • $250 on 27/07/2025')
    console.log('  • $500 on 07/08/2025')
    console.log('- Status: All completed')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createInvestorAndUpdateDeal()
