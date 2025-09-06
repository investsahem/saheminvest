#!/usr/bin/env node

/**
 * Add New Investors to the Platform
 * Creates investor accounts with specified names and emails
 */

require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const newInvestors = [
  {
    name: 'اسيا قلموني',
    email: 'Elhallak+10@gmail.com'
  },
  {
    name: 'رامز قلموني',
    email: 'Elhallak+11@gmail.com'
  },
  {
    name: 'جليلة قلموني',
    email: 'Elhallak+12@gmail.com'
  },
  {
    name: 'احمد علوان',
    email: 'Elhallak+13@gmail.com'
  },
  {
    name: 'عثمان حداد',
    email: 'Elhallak+14@gmail.com'
  }
]

const defaultPassword = 'Azerty@123123'

async function addInvestors() {
  console.log('👥 Adding New Investors to the Platform...')
  console.log('Database URL:', process.env.DATABASE_URL?.split('@')[1] || 'Not found')
  
  try {
    // Hash the password once for all users
    const hashedPassword = await bcrypt.hash(defaultPassword, 12)
    console.log('🔐 Password hashed successfully')
    
    console.log(`\n📝 Creating ${newInvestors.length} investor accounts...`)
    
    const createdInvestors = []
    
    for (const investor of newInvestors) {
      console.log(`\n👤 Creating investor: ${investor.name} (${investor.email})`)
      
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: investor.email }
      })
      
      if (existingUser) {
        console.log(`⚠️  User ${investor.email} already exists, skipping...`)
        continue
      }
      
      // Create the investor user
      const newUser = await prisma.user.create({
        data: {
          name: investor.name,
          email: investor.email,
          password: hashedPassword,
          role: 'INVESTOR',
          emailVerified: new Date(), // Mark as verified for immediate use
          image: null,
          walletBalance: 0,
          totalInvested: 0,
          totalReturns: 0,
          isActive: true,
          kycVerified: false
        }
      })
      
      console.log(`✅ Created investor: ${newUser.name} (ID: ${newUser.id})`)
      console.log(`💰 Initialized wallet with $0 balance`)
      createdInvestors.push(newUser)
    }
    
    // Summary
    console.log(`\n📊 Summary:`)
    console.log(`✅ Successfully created ${createdInvestors.length} new investors`)
    console.log(`📧 All accounts use password: ${defaultPassword}`)
    console.log(`🔐 All accounts are email verified and ready to use`)
    
    // List all investors
    console.log(`\n👥 All Investors in Database:`)
    const allInvestors = await prisma.user.findMany({
      where: { role: 'INVESTOR' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        walletBalance: true,
        totalInvested: true,
        totalReturns: true,
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    allInvestors.forEach((investor, index) => {
      console.log(`  ${index + 1}. ${investor.name} (${investor.email})`)
      console.log(`     Wallet Balance: $${Number(investor.walletBalance).toLocaleString()}`)
      console.log(`     Total Invested: $${Number(investor.totalInvested).toLocaleString()}`)
      console.log(`     Total Returns: $${Number(investor.totalReturns).toLocaleString()}`)
      console.log(`     Status: ${investor.isActive ? 'Active' : 'Inactive'}`)
      console.log(`     Created: ${investor.createdAt.toISOString().split('T')[0]}`)
      console.log('     ---')
    })
    
    console.log('\n🎉 Investor creation completed successfully!')
    
  } catch (error) {
    console.error('❌ Error creating investors:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
if (require.main === module) {
  addInvestors().catch(console.error)
}

module.exports = { addInvestors }
