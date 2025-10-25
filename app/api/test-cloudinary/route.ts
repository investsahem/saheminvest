import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function GET() {
  try {
    console.log('🧪 Testing Cloudinary configuration...')
    
    // Check environment variables
    const config = {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
      apiKey: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
      apiSecret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing'
    }
    
    console.log('🔧 Cloudinary config:', config)
    
    // Test API connection by getting account details
    const result = await cloudinary.api.ping()
    
    console.log('✅ Cloudinary ping successful:', result)
    
    return NextResponse.json({
      success: true,
      config,
      ping: result,
      message: 'Cloudinary configuration is working correctly'
    })
  } catch (error) {
    console.error('❌ Cloudinary test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      config: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
        apiKey: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
        apiSecret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing'
      }
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing Cloudinary image upload...')
    
    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    
    if (!imageFile) {
      return NextResponse.json({
        success: false,
        error: 'No image file provided'
      }, { status: 400 })
    }
    
    console.log('📸 Image file:', {
      name: imageFile.name,
      size: imageFile.size,
      type: imageFile.type
    })
    
    // Convert to buffer
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Test upload
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'sahaminvest/test',
          transformation: [
            { width: 400, height: 300, crop: 'fill' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('❌ Upload error:', error)
            reject(error)
          } else {
            console.log('✅ Upload success:', result?.secure_url)
            resolve(result)
          }
        }
      ).end(buffer)
    }) as any
    
    return NextResponse.json({
      success: true,
      uploadResult: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        bytes: uploadResult.bytes
      },
      message: 'Image upload test successful'
    })
  } catch (error) {
    console.error('❌ Image upload test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      details: error
    }, { status: 500 })
  }
}