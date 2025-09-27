import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'

// Debug endpoint to check Cloudinary configuration
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow admins to access this debug endpoint
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const cloudinaryConfig = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
      api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing',
      cloud_name_value: process.env.CLOUDINARY_CLOUD_NAME || 'Not set',
    }

    return NextResponse.json({
      message: 'Cloudinary configuration check',
      config: cloudinaryConfig,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error checking Cloudinary config:', error)
    return NextResponse.json(
      { error: 'Failed to check configuration' },
      { status: 500 }
    )
  }
}
