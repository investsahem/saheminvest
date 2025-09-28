import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const dealId = formData.get('dealId') as string
    const imageFile = formData.get('image') as File

    if (!dealId) {
      return NextResponse.json({ error: 'dealId is required' }, { status: 400 })
    }

    console.log('🔧 BYPASSING CLOUDINARY - Direct image handling')

    let thumbnailImage = null
    let images: string[] = []

    if (imageFile && imageFile.size > 0) {
      console.log('📤 Processing image without Cloudinary...')
      
      // Convert image to base64 data URL (temporary solution)
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = buffer.toString('base64')
      const mimeType = imageFile.type || 'image/jpeg'
      const dataUrl = `data:${mimeType};base64,${base64}`
      
      // For now, we'll use a placeholder URL that includes the filename
      // In production, you'd want to upload to a different service
      thumbnailImage = `https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=${encodeURIComponent(imageFile.name)}`
      images = [thumbnailImage]
      
      console.log('✅ Image processed (placeholder):', thumbnailImage)
    }

    // Update the deal
    const updatedDeal = await prisma.project.update({
      where: { id: dealId },
      data: {
        thumbnailImage,
        images,
        updatedAt: new Date()
      }
    })

    console.log('✅ Deal updated successfully:', {
      id: updatedDeal.id,
      title: updatedDeal.title,
      thumbnailImage: updatedDeal.thumbnailImage
    })

    return NextResponse.json({
      message: 'Deal updated successfully (bypassing Cloudinary)',
      deal: {
        id: updatedDeal.id,
        title: updatedDeal.title,
        thumbnailImage: updatedDeal.thumbnailImage,
        images: updatedDeal.images
      }
    })

  } catch (error) {
    console.error('❌ Error bypassing Cloudinary:', error)
    return NextResponse.json(
      { error: 'Failed to update deal' },
      { status: 500 }
    )
  }
}
