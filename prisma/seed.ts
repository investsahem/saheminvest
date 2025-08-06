import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Demo password for all accounts
  const demoPassword = 'Azerty@123123'
  const hashedPassword = await bcrypt.hash(demoPassword, 12)

  // Demo users data
  const demoUsers = [
    {
      email: 'admin@sahaminvest.com',
      name: 'System Administrator',
      role: 'ADMIN',
      password: hashedPassword,
      isActive: true
    },
    {
      email: 'dealmanager@sahaminvest.com',
      name: 'Deal Manager',
      role: 'DEAL_MANAGER',
      password: hashedPassword,
      isActive: true
    },
    {
      email: 'finance@sahaminvest.com',
      name: 'Financial Officer',
      role: 'FINANCIAL_OFFICER',
      password: hashedPassword,
      isActive: true
    },
    {
      email: 'advisor@sahaminvest.com',
      name: 'Portfolio Advisor',
      role: 'PORTFOLIO_ADVISOR',
      password: hashedPassword,
      isActive: true
    },
    {
      email: 'investor@sahaminvest.com',
      name: 'Demo Investor',
      role: 'INVESTOR',
      password: hashedPassword,
      isActive: true,
      walletBalance: 50000,
      kycVerified: true
    },
    {
      email: 'partner@sahaminvest.com',
      name: 'Demo Partner',
      role: 'PARTNER',
      password: hashedPassword,
      isActive: true,
      kycVerified: true
    }
  ]

  // Create demo users
  for (const userData of demoUsers) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      })

      if (existingUser) {
        console.log(`✅ User ${userData.email} already exists, updating...`)
        await prisma.user.update({
          where: { email: userData.email },
          data: {
            name: userData.name,
            role: userData.role as any,
            password: userData.password,
            isActive: userData.isActive,
            walletBalance: userData.walletBalance || 0,
            kycVerified: userData.kycVerified || false
          }
        })
      } else {
        console.log(`🆕 Creating user ${userData.email}...`)
        await prisma.user.create({
          data: {
            email: userData.email,
            name: userData.name,
            role: userData.role as any,
            password: userData.password,
            isActive: userData.isActive,
            walletBalance: userData.walletBalance || 0,
            kycVerified: userData.kycVerified || false
          }
        })
      }
    } catch (error) {
      console.error(`❌ Error creating user ${userData.email}:`, error)
    }
  }

  // Create demo partner profile for partner user
  try {
    const partnerUser = await prisma.user.findUnique({
      where: { email: 'partner@sahaminvest.com' }
    })

    if (partnerUser) {
      const existingPartner = await prisma.partner.findUnique({
        where: { userId: partnerUser.id }
      })

      if (!existingPartner) {
        console.log('🏢 Creating demo partner profile...')
        await prisma.partner.create({
          data: {
            userId: partnerUser.id,
            companyName: 'Demo Trading Company',
            description: 'A demo trading company for testing purposes',
            website: 'https://demo-trading.com',
            phone: '+966501234567',
            address: 'Riyadh, Saudi Arabia',
            totalDeals: 5,
            completedDeals: 4,
            totalFunding: 250000,
            averageReturn: 12.5,
            rating: 4.8,
            totalRatings: 15
          }
        })
      }
    }
  } catch (error) {
    console.error('❌ Error creating partner profile:', error)
  }

  // Create demo deals/projects
  console.log('🏗️ Creating demo deals...')
  
  const partnerUser = await prisma.user.findUnique({
    where: { email: 'partner@sahaminvest.com' }
  })

  const partner = await prisma.partner.findUnique({
    where: { userId: partnerUser?.id }
  })

  if (partnerUser && partner) {
    const demoDeals = [
      {
        title: 'Green Energy Solar Farm',
        slug: 'green-energy-solar-farm',
        description: 'A large-scale solar energy project aimed at providing clean energy to over 10,000 homes in Saudi Arabia.',
        category: 'RENEWABLE_ENERGY',
        fundingGoal: 500000,
        currentFunding: 325000,
        minInvestment: 1000,
        expectedReturn: 15.5,
        duration: 24,
        riskLevel: 'MEDIUM',
        status: 'ACTIVE',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2025-01-15'),
        images: [
          'https://res.cloudinary.com/dsjjqculz/image/upload/v1754483236/sahaminvest/deals/renewable-energy/renewable-energy-1.jpg',
          'https://res.cloudinary.com/dsjjqculz/image/upload/v1754483238/sahaminvest/deals/renewable-energy/renewable-energy-2.jpg'
        ],
        location: 'Riyadh, Saudi Arabia',
        highlights: [
          'Government backed project',
          'Guaranteed 15.5% annual return',
          'Eco-friendly investment',
          'Tax benefits available'
        ]
      },
      {
        title: 'Tech Startup Incubator',
        slug: 'tech-startup-incubator',
        description: 'Investment opportunity in a technology startup incubator focusing on AI and fintech companies.',
        category: 'TECHNOLOGY',
        fundingGoal: 750000,
        currentFunding: 450000,
        minInvestment: 2500,
        expectedReturn: 22.0,
        duration: 36,
        riskLevel: 'HIGH',
        status: 'ACTIVE',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2027-02-01'),
        images: [
          'https://res.cloudinary.com/dsjjqculz/image/upload/v1754483240/sahaminvest/deals/technology/technology-1.jpg',
          'https://res.cloudinary.com/dsjjqculz/image/upload/v1754483242/sahaminvest/deals/technology/technology-2.jpg'
        ],
        location: 'Dubai, UAE',
        highlights: [
          'Portfolio of 15+ startups',
          'Average 22% annual returns',
          'Expert management team',
          'Exit strategy in 3 years'
        ]
      },
      {
        title: 'Luxury Real Estate Development',
        slug: 'luxury-real-estate-development',
        description: 'Premium residential complex development in the heart of Dubai Marina with world-class amenities.',
        category: 'REAL_ESTATE',
        fundingGoal: 1200000,
        currentFunding: 980000,
        minInvestment: 5000,
        expectedReturn: 18.5,
        duration: 30,
        riskLevel: 'MEDIUM',
        status: 'ACTIVE',
        startDate: new Date('2024-03-10'),
        endDate: new Date('2026-09-10'),
        images: [
          'https://res.cloudinary.com/dsjjqculz/image/upload/v1754483244/sahaminvest/deals/real-estate/real-estate-1.jpg',
          'https://res.cloudinary.com/dsjjqculz/image/upload/v1754483245/sahaminvest/deals/real-estate/real-estate-2.jpg'
        ],
        location: 'Dubai Marina, UAE',
        highlights: [
          'Prime Dubai Marina location',
          'Pre-construction pricing',
          'Guaranteed rental yields',
          'Full service management'
        ]
      },
      {
        title: 'Healthcare Innovation Fund',
        slug: 'healthcare-innovation-fund',
        description: 'Investment in cutting-edge healthcare technology and medical device companies across the MENA region.',
        category: 'HEALTHCARE',
        fundingGoal: 600000,
        currentFunding: 600000,
        minInvestment: 1500,
        expectedReturn: 16.8,
        duration: 48,
        riskLevel: 'MEDIUM',
        status: 'FUNDED',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2028-01-01'),
        images: [
          'https://res.cloudinary.com/dsjjqculz/image/upload/v1754483247/sahaminvest/deals/healthcare/healthcare-1.jpg',
          'https://res.cloudinary.com/dsjjqculz/image/upload/v1754483249/sahaminvest/deals/healthcare/healthcare-2.jpg'
        ],
        location: 'Multiple MENA Locations',
        highlights: [
          'Diversified healthcare portfolio',
          'Experienced medical team',
          'Government partnerships',
          'Strong exit pipeline'
        ]
      },
      {
        title: 'Sustainable Agriculture Project',
        slug: 'sustainable-agriculture-project',
        description: 'Modern hydroponic farming facility using advanced technology to produce organic vegetables year-round.',
        category: 'AGRICULTURE',
        fundingGoal: 400000,
        currentFunding: 125000,
        minInvestment: 500,
        expectedReturn: 12.5,
        duration: 18,
        riskLevel: 'LOW',
        status: 'ACTIVE',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-10-01'),
        images: [
          'https://res.cloudinary.com/dsjjqculz/image/upload/v1754483251/sahaminvest/deals/agriculture/agriculture-1.jpg',
          'https://res.cloudinary.com/dsjjqculz/image/upload/v1754483253/sahaminvest/deals/agriculture/agriculture-2.jpg'
        ],
        location: 'Al Kharj, Saudi Arabia',
        highlights: [
          'Water-efficient technology',
          'Year-round production',
          'Organic certification',
          'Local market demand'
        ]
      },
      {
        title: 'E-commerce Logistics Hub',
        slug: 'ecommerce-logistics-hub',
        description: 'State-of-the-art fulfillment center serving the growing e-commerce market in the Gulf region.',
        category: 'LOGISTICS',
        fundingGoal: 800000,
        currentFunding: 320000,
        minInvestment: 2000,
        expectedReturn: 14.2,
        duration: 36,
        riskLevel: 'MEDIUM',
        status: 'PENDING',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2027-06-01'),
        images: [
          'https://res.cloudinary.com/dsjjqculz/image/upload/v1754483255/sahaminvest/deals/logistics/logistics-1.jpg',
          'https://res.cloudinary.com/dsjjqculz/image/upload/v1754483257/sahaminvest/deals/logistics/logistics-2.jpg'
        ],
        location: 'Jeddah, Saudi Arabia',
        highlights: [
          'Strategic location advantage',
          'Growing e-commerce market',
          'Advanced automation',
          'Multiple revenue streams'
        ]
      }
    ]

    for (const dealData of demoDeals) {
      try {
        const existingDeal = await prisma.project.findUnique({
          where: { slug: dealData.slug }
        })

        if (existingDeal) {
          console.log(`✅ Deal ${dealData.title} already exists, updating...`)
          await prisma.project.update({
            where: { slug: dealData.slug },
            data: {
              ...dealData,
              status: dealData.status as any,
              ownerId: partnerUser.id,
              partnerId: partner.id
            }
          })
        } else {
          console.log(`🆕 Creating deal: ${dealData.title}...`)
          await prisma.project.create({
            data: {
              ...dealData,
              status: dealData.status as any,
              ownerId: partnerUser.id,
              partnerId: partner.id
            }
          })
        }
      } catch (error) {
        console.error(`❌ Error creating deal ${dealData.title}:`, error)
      }
    }
  }

  console.log('✅ Database seeding completed!')
  console.log('📋 Demo accounts created:')
  console.log('  🔐 Password for all accounts: Azerty@123123')
  console.log('')
  console.log('👨‍💼 Admin Users:')
  console.log('  • admin@sahaminvest.com (System Admin)')
  console.log('  • dealmanager@sahaminvest.com (Deal Manager)')
  console.log('  • finance@sahaminvest.com (Financial Officer)')
  console.log('  • advisor@sahaminvest.com (Portfolio Advisor)')
  console.log('')
  console.log('👤 Regular Users:')
  console.log('  • investor@sahaminvest.com (Investor)')
  console.log('  • partner@sahaminvest.com (Partner)')
  console.log('')
  console.log('🏗️ Demo Deals Created:')
  console.log('  • Green Energy Solar Farm (Renewable Energy)')
  console.log('  • Tech Startup Incubator (Technology)')
  console.log('  • Luxury Real Estate Development (Real Estate)')
  console.log('  • Healthcare Innovation Fund (Healthcare)')
  console.log('  • Sustainable Agriculture Project (Agriculture)')
  console.log('  • E-commerce Logistics Hub (Logistics)')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 