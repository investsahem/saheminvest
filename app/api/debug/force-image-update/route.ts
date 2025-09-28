import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow authenticated users
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { dealId, imageUrl } = await request.json()

    if (!dealId || !imageUrl) {
      return NextResponse.json(
        { error: 'dealId and imageUrl are required' },
        { status: 400 }
      )
    }

    console.log('🔧 FORCE IMAGE UPDATE:', { dealId, imageUrl })

    // Force update the deal with the new image URL
    const updatedDeal = await prisma.project.update({
      where: { id: dealId },
      data: {
        thumbnailImage: imageUrl,
        images: [imageUrl]
      }
    })

    console.log('✅ FORCE UPDATE SUCCESS:', {
      id: updatedDeal.id,
      title: updatedDeal.title,
      thumbnailImage: updatedDeal.thumbnailImage,
      images: updatedDeal.images
    })

    return NextResponse.json({
      message: 'Image URL force updated successfully',
      deal: {
        id: updatedDeal.id,
        title: updatedDeal.title,
        thumbnailImage: updatedDeal.thumbnailImage,
        images: updatedDeal.images
      }
    })
  } catch (error) {
    console.error('Error force updating image:', error)
    return NextResponse.json(
      { error: 'Failed to force update image' },
      { status: 500 }
    )
  }
}
