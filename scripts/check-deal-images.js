const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDealImages() {
  try {
    console.log('Checking current deal images in database...\n')
    
    const deals = await prisma.project.findMany({
      select: {
        id: true,
        title: true,
        thumbnailImage: true,
        images: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    deals.forEach((deal, index) => {
      console.log(`${index + 1}. ${deal.title}`)
      console.log(`   ID: ${deal.id}`)
      console.log(`   Thumbnail: ${deal.thumbnailImage || 'No image'}`)
      console.log(`   Images: ${JSON.stringify(deal.images)}`)
      console.log(`   Updated: ${deal.updatedAt}`)
      console.log('')
    })

    console.log(`Total deals: ${deals.length}`)
    
  } catch (error) {
    console.error('Error checking deals:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDealImages()