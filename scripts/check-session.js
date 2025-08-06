const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    console.log('Checking users in database...\n')
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: {
          select: {
            permission: true
          }
        }
      }
    })

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Permissions: ${user.permissions.map(p => p.permission).join(', ')}`)
      console.log('')
    })

    console.log(`Total users: ${users.length}`)
    console.log('\n📝 To test editing:')
    console.log('1. Make sure you are logged in as admin@sahaminvest.com')
    console.log('2. Or any user with ADMIN role')
    console.log('3. Check browser dev tools for session data')
    
  } catch (error) {
    console.error('Error checking users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()