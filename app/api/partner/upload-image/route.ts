import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { v2 as cloudinary } from 'cloudinary'

// POST /api/partner/upload-image - Upload partner images to Cloudinary
export async function POST(request: NextRequest) {
  try {
    // Configure Cloudinary at request time to ensure env vars are available
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })

    console.log('📸 Partner image upload - Cloudinary config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'set' : 'MISSING',
      api_key: process.env.CLOUDINARY_API_KEY ? 'set' : 'MISSING',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'set' : 'MISSING',
    })

    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'PARTNER') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('image') as File
    const type = formData.get('type') as string || 'logo'

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
    }

    console.log('📸 File received:', { name: file.name, size: file.size, type: file.type })

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    console.log('📸 Uploading to Cloudinary, buffer size:', buffer.length)

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: `sahaminvest/partners/${session.user.id}`,
          public_id: `${type}_${Date.now()}`,
          format: 'webp',
          quality: 'auto',
        },
        (error, result) => {
          if (error) {
            console.error('📸 Cloudinary upload error:', error)
            reject(error)
          } else {
            console.log('📸 Cloudinary upload success:', result?.secure_url)
            resolve(result)
          }
        }
      ).end(buffer)
    }) as any

    return NextResponse.json({
      success: true,
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id
    })

  } catch (error) {
    console.error('📸 Error uploading image:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}
