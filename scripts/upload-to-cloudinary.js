const { PrismaClient } = require('@prisma/client')
const { v2: cloudinary } = require('cloudinary')
const fs = require('fs')
const path = require('path')

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const prisma = new PrismaClient()

// Sample image URLs (using placeholder images from various sources)
const sampleImages = {
  'electronics': 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&h=600&fit=crop',
  'construction': 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop',
  'phone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=600&fit=crop',
  'energy': 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop',
  'healthcare': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop'
}

async function uploadImagesToCloudinary() {
  try {
    console.log('Starting Cloudinary upload process...')
    
    const uploadedImages = {}
    
    // Upload each image to Cloudinary
    for (const [key, imageUrl] of Object.entries(sampleImages)) {
      try {
        console.log(`Uploading ${key} image...`)
        
        const result = await cloudinary.uploader.upload(imageUrl, {
          folder: 'sahaminvest/deals',
          public_id: `deal-${key}`,
          transformation: [
            { width: 800, height: 600, crop: 'fill' },
            { quality: 'auto' },
            { format: 'jpg' }
          ]
        })
        
        uploadedImages[key] = result.secure_url
        console.log(`✅ Uploaded ${key}: ${result.secure_url}`)
        
      } catch (error) {
        console.error(`❌ Failed to upload ${key}:`, error.message)
      }
    }
    
    // Update database with Cloudinary URLs
    console.log('\nUpdating database with Cloudinary URLs...')
    
    const dealUpdates = [
      {
        slug: 'smart-electronics-manufacturing',
        imageKey: 'electronics'
      },
      {
        slug: 'luxury-real-estate-development',
        imageKey: 'construction'
      },
      {
        slug: 'mobile-technology-innovation',
        imageKey: 'phone'
      },
      {
        slug: 'sustainable-energy-project',
        imageKey: 'energy'
      },
      {
        slug: 'healthcare-technology-platform',
        imageKey: 'healthcare'
      }
    ]
    
    for (const update of dealUpdates) {
      if (uploadedImages[update.imageKey]) {
        try {
          const deal = await prisma.project.update({
            where: { slug: update.slug },
            data: {
              thumbnailImage: uploadedImages[update.imageKey],
              images: [uploadedImages[update.imageKey]]
            }
          })
          console.log(`✅ Updated ${deal.title} with Cloudinary image`)
        } catch (error) {
          console.error(`❌ Failed to update ${update.slug}:`, error.message)
        }
      }
    }
    
    console.log('\n🎉 Successfully uploaded images to Cloudinary and updated database!')
    
  } catch (error) {
    console.error('Error in upload process:', error)
  } finally {
    await prisma.$disconnect()
  }
}

uploadImagesToCloudinary()