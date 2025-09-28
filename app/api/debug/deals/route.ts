import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow authenticated users to debug
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all deals with their image data
    const deals = await prisma.project.findMany({
      select: {
        id: true,
        title: true,
        thumbnailImage: true,
        images: true,
        status: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json({
      message: 'Debug: Current deals in database',
      deals: deals.map(deal => ({
        id: deal.id,
        shortId: deal.id.slice(-8),
        title: deal.title,
        thumbnailImage: deal.thumbnailImage,
        images: deal.images,
        status: deal.status,
        updatedAt: deal.updatedAt,
        hasImage: !!deal.thumbnailImage,
        imageCount: deal.images.length
      })),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error debugging deals:', error)
    return NextResponse.json(
      { error: 'Failed to debug deals' },
      { status: 500 }
    )
  }
}
