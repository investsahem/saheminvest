const { PrismaClient } = require('@prisma/client')
const { v2: cloudinary } = require('cloudinary')

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const prisma = new PrismaClient()

async function testSingleUpdate() {
  try {
    console.log('🧪 Testing single deal update...\n')
    
    // Get the first deal
    const deal = await prisma.project.findFirst({
      where: {
        thumbnailImage: {
          not: null
        }
      }
    })
    
    if (!deal) {
      console.log('No deals found')
      return
    }
    
    console.log(`📝 Deal: ${deal.title}`)
    console.log(`🖼️  Current image: ${deal.thumbnailImage}`)
    console.log(`🆔 Deal ID: ${deal.id}\n`)
    
    // Upload a distinctive test image
    console.log('⬆️  Uploading new test image...')
    const result = await cloudinary.uploader.upload('https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop', {
      folder: 'sahaminvest/deals',
      public_id: `test-${Date.now()}`,
      transformation: [
        { width: 800, height: 600, crop: 'fill' },
        { quality: 'auto' },
        { format: 'jpg' }
      ]
    })
    
    console.log(`✅ New image uploaded: ${result.secure_url}`)
    
    // Update in database
    console.log('💾 Updating database...')
    const updatedDeal = await prisma.project.update({
      where: { id: deal.id },
      data: {
        thumbnailImage: result.secure_url,
        images: [result.secure_url]
      }
    })
    
    console.log(`✅ Database updated!`)
    console.log(`🔗 New URL: ${updatedDeal.thumbnailImage}\n`)
    
    // Test API response
    console.log('🌐 Testing API response...')
    const apiResponse = await fetch(`http://localhost:3000/api/deals/${deal.id}`)
    if (apiResponse.ok) {
      const apiData = await apiResponse.json()
      console.log(`✅ API returns: ${apiData.thumbnailImage}`)
      
      if (apiData.thumbnailImage === result.secure_url) {
        console.log('✅ API is returning the correct updated image!')
      } else {
        console.log('❌ API is NOT returning the updated image!')
      }
    } else {
      console.log('❌ API request failed')
    }
    
    console.log('\n🎯 Next Steps:')
    console.log('1. Go to http://localhost:3000/deals')
    console.log('2. Look for the deal:', deal.title)
    console.log('3. Check if the image changed to a building/architecture photo')
    console.log('4. If not, the issue is in the frontend React component')
    console.log('5. Check browser console for image load logs')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSingleUpdate()