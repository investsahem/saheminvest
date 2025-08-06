const { PrismaClient } = require('@prisma/client')
const { v2: cloudinary } = require('cloudinary')

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const prisma = new PrismaClient()

async function forceImageUpdate() {
  try {
    console.log('🔄 Force updating deal images to test the system...\n')
    
    // Get all deals with images
    const deals = await prisma.project.findMany({
      select: {
        id: true,
        title: true,
        thumbnailImage: true
      }
    })
    
    console.log(`Found ${deals.length} deals\n`)
    
    for (const deal of deals) {
      if (deal.thumbnailImage) {
        console.log(`Updating ${deal.title}...`)
        console.log(`Current image: ${deal.thumbnailImage}`)
        
        // Upload a new random image
        const randomImageUrl = `https://picsum.photos/800/600?random=${Date.now()}`
        
        try {
          const result = await cloudinary.uploader.upload(randomImageUrl, {
            folder: 'sahaminvest/deals',
            public_id: `updated-${deal.id}-${Date.now()}`,
            transformation: [
              { width: 800, height: 600, crop: 'fill' },
              { quality: 'auto' },
              { format: 'jpg' }
            ]
          })
          
          // Update in database
          await prisma.project.update({
            where: { id: deal.id },
            data: {
              thumbnailImage: result.secure_url,
              images: [result.secure_url]
            }
          })
          
          console.log(`✅ Updated to: ${result.secure_url}`)
          console.log('')
          
        } catch (error) {
          console.error(`❌ Failed to update ${deal.title}:`, error.message)
        }
      } else {
        console.log(`⏭️  Skipping ${deal.title} - no image`)
      }
    }
    
    console.log('🎉 All deals updated! Check the /deals page now.')
    console.log('💡 If images still don\'t show, the issue is in the frontend caching.')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

forceImageUpdate()