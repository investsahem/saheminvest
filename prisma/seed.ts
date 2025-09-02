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

  // Demo deals removed - using real deals from partners instead
  console.log('ℹ️  Skipping demo deals creation - using real partner deals...')


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
  console.log('🏗️ Real Deals:')
  console.log('  • Using actual partner-created deals instead of demo data')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 