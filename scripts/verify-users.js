const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyUsers() {
  console.log('🔍 Verifying demo users in database...\n')
  
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: {
        email: 'asc'
      }
    })

    console.log(`✅ Found ${users.length} users in database:\n`)
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. 📧 ${user.email}`)
      console.log(`   👤 ${user.name}`)
      console.log(`   🎭 ${user.role}`)
      console.log(`   ⚡ ${user.isActive ? 'Active' : 'Inactive'}`)
      console.log(`   📅 Created: ${user.createdAt.toLocaleDateString()}`)
      console.log('')
    })

    console.log('🔐 Password for all demo accounts: Azerty@123123')
    console.log('\n✅ Database verification completed!')
    
  } catch (error) {
    console.error('❌ Error verifying users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyUsers()