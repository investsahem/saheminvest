const { PrismaClient } = require('@prisma/client')
const { v2: cloudinary } = require('cloudinary')

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const prisma = new PrismaClient()

async function testImageUpdate() {
  try {
    console.log('Testing image update process...\n')
    
    // Get the first deal
    const deal = await prisma.project.findFirst({
      where: {
        thumbnailImage: {
          not: null
        }
      }
    })
    
    if (!deal) {
      console.log('No deals with images found')
      return
    }
    
    console.log(`Testing with deal: ${deal.title}`)
    console.log(`Current image: ${deal.thumbnailImage}`)
    console.log(`Deal ID: ${deal.id}\n`)
    
    // Upload a new test image (a different Unsplash image)
    console.log('Uploading new test image...')
    const result = await cloudinary.uploader.upload('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop', {
      folder: 'sahaminvest/deals',
      public_id: `test-update-${Date.now()}`,
      transformation: [
        { width: 800, height: 600, crop: 'fill' },
        { quality: 'auto' },
        { format: 'jpg' }
      ]
    })
    
    console.log(`New image uploaded: ${result.secure_url}`)
    
    // Update the deal in database
    console.log('Updating deal in database...')
    const updatedDeal = await prisma.project.update({
      where: { id: deal.id },
      data: {
        thumbnailImage: result.secure_url,
        images: [result.secure_url]
      }
    })
    
    console.log(`Deal updated successfully!`)
    console.log(`New thumbnailImage: ${updatedDeal.thumbnailImage}`)
    console.log(`\n✅ Test completed! Check the deals page to see if the image changed.`)
    
  } catch (error) {
    console.error('Error in test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testImageUpdate()