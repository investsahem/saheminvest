import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Demo password for all accounts
  const demoPassword = 'Azerty@123123'
  const hashedPassword = await bcrypt.hash(demoPassword, 12)

  // Custom user passwords
  const adminPassword = await bcrypt.hash('Admin@123123', 12)
  const partnerPassword = await bcrypt.hash('partner@123123', 12)
  const investorPassword = await bcrypt.hash('investor@123123', 12)

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
    },
    // Custom users requested
    {
      email: 'Elhallak@gmail.com',
      name: 'Admin User',
      role: 'ADMIN',
      password: adminPassword,
      isActive: true,
      kycVerified: true
    },
    {
      email: 'Elhallak+1@gmail.com',
      name: 'Partner User',
      role: 'PARTNER',
      password: partnerPassword,
      isActive: true,
      kycVerified: true
    },
    {
      email: 'Elhallak+2@gmail.com',
      name: 'Investor User',
      role: 'INVESTOR',
      password: investorPassword,
      isActive: true,
      walletBalance: 10000,
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

  // Create demo partner profiles for partner users
  const partnerEmails = ['partner@sahaminvest.com', 'Elhallak+1@gmail.com']
  
  for (const partnerEmail of partnerEmails) {
    try {
      const partnerUser = await prisma.user.findUnique({
        where: { email: partnerEmail }
      })

      if (partnerUser) {
        const existingPartner = await prisma.partner.findUnique({
          where: { userId: partnerUser.id }
        })

        if (!existingPartner) {
          const isCustomUser = partnerEmail === 'Elhallak+1@gmail.com'
          console.log(`🏢 Creating ${isCustomUser ? 'custom' : 'demo'} partner profile for ${partnerEmail}...`)
          
          await prisma.partner.create({
            data: {
              userId: partnerUser.id,
              companyName: isCustomUser ? 'Elhallak Trading Company' : 'Demo Trading Company',
              description: isCustomUser ? 'Custom partner company for Elhallak user' : 'A demo trading company for testing purposes',
              website: isCustomUser ? 'https://elhallak-trading.com' : 'https://demo-trading.com',
              phone: isCustomUser ? '+966501234568' : '+966501234567',
              address: isCustomUser ? 'Jeddah, Saudi Arabia' : 'Riyadh, Saudi Arabia',
              totalDeals: isCustomUser ? 0 : 5,
              completedDeals: isCustomUser ? 0 : 4,
              totalFunding: isCustomUser ? 0 : 250000,
              averageReturn: isCustomUser ? null : 12.5,
              rating: isCustomUser ? 0 : 4.8,
              totalRatings: isCustomUser ? 0 : 15
            }
          })
        }
      }
    } catch (error) {
      console.error(`❌ Error creating partner profile for ${partnerEmail}:`, error)
    }
  }

  // Demo deals removed - using real deals from partners instead
  console.log('ℹ️  Skipping demo deals creation - using real partner deals...')


  console.log('✅ Database seeding completed!')
  console.log('📋 Demo accounts created:')
  console.log('  🔐 Default password for demo accounts: Azerty@123123')
  console.log('')
  console.log('👨‍💼 Admin Users:')
  console.log('  • admin@sahaminvest.com (System Admin) - Password: Azerty@123123')
  console.log('  • dealmanager@sahaminvest.com (Deal Manager) - Password: Azerty@123123')
  console.log('  • finance@sahaminvest.com (Financial Officer) - Password: Azerty@123123')
  console.log('  • advisor@sahaminvest.com (Portfolio Advisor) - Password: Azerty@123123')
  console.log('')
  console.log('👤 Regular Users:')
  console.log('  • investor@sahaminvest.com (Investor) - Password: Azerty@123123')
  console.log('  • partner@sahaminvest.com (Partner) - Password: Azerty@123123')
  console.log('')
  console.log('🆕 Custom Users:')
  console.log('  • Elhallak@gmail.com (Admin) - Password: Admin@123123')
  console.log('  • Elhallak+1@gmail.com (Partner) - Password: partner@123123')
  console.log('  • Elhallak+2@gmail.com (Investor) - Password: investor@123123')
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