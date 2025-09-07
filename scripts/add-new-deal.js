const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function addNewDeal() {
  try {
    console.log('🔍 Looking for partner with email: Elhallak+1@gmail.com')
    
    // Find the partner by email
    const partner = await prisma.user.findUnique({
      where: { 
        email: 'Elhallak+1@gmail.com' 
      },
      include: {
        partnerProfile: true
      }
    })

    if (!partner) {
      console.error('❌ Partner not found with email: Elhallak+1@gmail.com')
      console.log('Available partners:')
      
      const allPartners = await prisma.user.findMany({
        where: { role: 'PARTNER' },
        select: { id: true, email: true, name: true }
      })
      
      console.table(allPartners)
      return
    }

    if (partner.role !== 'PARTNER') {
      console.error('❌ User found but role is not PARTNER:', partner.role)
      return
    }

    console.log('✅ Partner found:', {
      id: partner.id,
      name: partner.name,
      email: partner.email,
      role: partner.role
    })

    // Create the timeline data
    const timeline = [
      {
        id: '1',
        title: 'فتح الصفقة',
        description: 'تم فتح الصفقة وإتاحتها للمستثمرين',
        date: '2025-05-28',
        status: 'completed',
        type: 'milestone'
      },
      {
        id: '2', 
        title: 'بدأ التمويل',
        description: 'بدأت عملية جمع التمويل من المستثمرين',
        date: '2025-05-28',
        status: 'completed',
        type: 'milestone'
      },
      {
        id: '3',
        title: 'إغلاق التمويل', 
        description: 'تم إغلاق باب الاستثمار وجمع التمويل المطلوب',
        date: '2025-05-29',
        status: 'completed',
        type: 'milestone'
      },
      {
        id: '4',
        title: 'شراء البضائع',
        description: 'تم شراء الهواتف المستعملة',
        date: '2025-06-03',
        status: 'completed', 
        type: 'milestone'
      },
      {
        id: '5',
        title: 'إستلام البضائع',
        description: 'تم استلام البضائع وفحصها',
        date: '2025-06-25',
        status: 'completed',
        type: 'milestone'
      },
      {
        id: '6',
        title: 'بدأ البيع',
        description: 'بدأت عملية بيع الهواتف المستعملة',
        date: '2025-06-28',
        status: 'completed',
        type: 'milestone'
      },
      {
        id: '7',
        title: 'توزيع جزئي للأرباح',
        description: 'تم توزيع جزء من الأرباح على المستثمرين',
        date: '2025-07-10',
        status: 'completed',
        type: 'milestone'
      },
      {
        id: '8',
        title: 'إستكمال توزيع الأرباح',
        description: 'تم توزيع كامل الأرباح على المستثمرين',
        date: '2025-08-07',
        status: 'completed',
        type: 'milestone'
      },
      {
        id: '9',
        title: 'إغلاق الصفقة',
        description: 'تم إغلاق الصفقة بنجاح وتحقيق الأرباح المستهدفة',
        date: '2025-08-07',
        status: 'completed',
        type: 'milestone'
      }
    ]

    // Create the deal
    console.log('📝 Creating new deal...')
    
    const newDeal = await prisma.project.create({
      data: {
        title: 'هواتف مستعملة',
        description: 'مشروع تجارة الهواتف المستعملة مع عوائد مضمونة تتراوح بين 3% إلى 5%',
        fundingGoal: 20000,
        currentFunding: 20000, // Fully funded since it's completed
        minInvestment: 1000,
        expectedReturn: 4, // Average of 3-5%
        riskLevel: 'LOW',
        duration: 60, // 2 months in days
        category: 'TECHNOLOGY',
        status: 'COMPLETED',
        startDate: new Date('2025-05-28'),
        endDate: new Date('2025-08-07'),
        images: ['https://res.cloudinary.com/dsjjqculz/image/upload/v1/sahaminvest/deals/used-phones.jpg'],
        documents: [],
        timeline: timeline,
        ownerId: partner.id,
        location: 'Lebanon',
        highlights: ['عوائد مضمونة 3-5%', 'مدة قصيرة شهرين', 'خبرة في السوق'],
        tags: ['هواتف', 'تكنولوجيا', 'تجارة', 'مستعملة'],
        featured: false,
        priority: 0
      }
    })

    console.log('✅ Deal created successfully!')
    console.log('Deal Details:', {
      id: newDeal.id,
      title: newDeal.title,
      fundingGoal: newDeal.fundingGoal,
      currentFunding: newDeal.currentFunding,
      expectedReturn: newDeal.expectedReturn + '%',
      status: newDeal.status,
      duration: newDeal.duration + ' days',
      ownerId: newDeal.ownerId
    })

    // Create a sample investment to show it has 1 investor
    console.log('💰 Creating sample investment...')
    
    // Find an investor to create the investment
    const investor = await prisma.user.findFirst({
      where: { role: 'INVESTOR' }
    })

    if (investor) {
      const investment = await prisma.investment.create({
        data: {
          amount: 20000,
          status: 'COMPLETED',
          investorId: investor.id,
          projectId: newDeal.id,
          expectedReturn: 800, // 4% return = 800
          actualReturn: 800,
          investmentDate: new Date('2025-05-28'),
          lastReturnDate: new Date('2025-08-07')
        }
      })

      console.log('✅ Investment created:', {
        id: investment.id,
        amount: investment.amount,
        investor: investor.email,
        expectedReturn: investment.expectedReturn,
        actualReturn: investment.actualReturn
      })

      // Update user's wallet and investment totals
      await prisma.user.update({
        where: { id: investor.id },
        data: {
          totalInvested: { increment: 20000 },
          totalReturns: { increment: 800 }
        }
      })

      console.log('✅ Updated investor totals')
    }

      // Create profit distribution record
      console.log('💸 Creating profit distribution...')
      
      const profitDistribution = await prisma.profitDistribution.create({
        data: {
          amount: 800,
          distributionDate: new Date('2025-08-07'),
          profitPeriod: 'quarterly',
          status: 'COMPLETED',
          profitRate: 4, // 4% profit rate
          investmentShare: 100, // 100% of the investment gets the profit
          investmentId: investment.id,
          projectId: newDeal.id,
          investorId: investor.id
        }
      })

      console.log('✅ Profit distribution created:', {
        id: profitDistribution.id,
        amount: profitDistribution.amount,
        status: profitDistribution.status
      })
    }

    console.log('✅ Profit distribution created:', {
      id: profitDistribution.id,
      amount: profitDistribution.amount,
      status: profitDistribution.status
    })

    console.log('\n🎉 Deal creation completed successfully!')
    console.log('📊 Summary:')
    console.log('- Deal ID:', newDeal.id)
    console.log('- Deal Name: هواتف مستعملة')
    console.log('- Investors: 1')
    console.log('- Duration: 2 months')
    console.log('- Required Funding: $20,000')
    console.log('- Profit Rate: 3-5%')
    console.log('- Status: COMPLETED')
    console.log('- Timeline: 9 milestones completed')

  } catch (error) {
    console.error('❌ Error creating deal:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
addNewDeal()
