import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Admin user password
  const adminPassword = await bcrypt.hash('143P7YbANTJL0hzeBIF', 12)

  // Create admin user
  const adminUser = {
    email: 'Elhallak@gmail.com',
    name: 'Admin User',
    role: 'ADMIN',
    password: adminPassword,
    isActive: true,
    kycVerified: true
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: adminUser.email }
    })

    if (existingUser) {
      console.log(`✅ User ${adminUser.email} already exists, updating...`)
      await prisma.user.update({
        where: { email: adminUser.email },
        data: {
          name: adminUser.name,
          role: adminUser.role as any,
          password: adminUser.password,
          isActive: adminUser.isActive,
          kycVerified: adminUser.kycVerified
        }
      })
    } else {
      console.log(`🆕 Creating user ${adminUser.email}...`)
      await prisma.user.create({
        data: {
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role as any,
          password: adminUser.password,
          isActive: adminUser.isActive,
          walletBalance: 0,
          kycVerified: adminUser.kycVerified
        }
      })
    }
  } catch (error) {
    console.error(`❌ Error creating user ${adminUser.email}:`, error)
  }

  console.log('✅ Database seeding completed!')
  console.log('📋 Admin account created:')
  console.log('  • Elhallak@gmail.com (Admin) - Password: 143P7YbANTJL0hzeBIF')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })