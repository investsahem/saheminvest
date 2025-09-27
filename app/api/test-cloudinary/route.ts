import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow authenticated users to test
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check environment variables
    const config = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'NOT_SET',
      api_key: process.env.CLOUDINARY_API_KEY || 'NOT_SET',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT_SET',
      configured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
    }

    // Test Cloudinary connection
    let cloudinaryTest = null
    if (config.configured) {
      try {
        // Test with a simple API call
        const result = await cloudinary.api.ping()
        cloudinaryTest = { success: true, result }
      } catch (error) {
        cloudinaryTest = { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
    }

    return NextResponse.json({
      message: 'Cloudinary configuration test',
      config,
      cloudinaryTest,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error testing Cloudinary:', error)
    return NextResponse.json(
      { error: 'Failed to test Cloudinary configuration' },
      { status: 500 }
    )
  }
}
