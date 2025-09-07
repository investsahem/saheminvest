import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Timeline item interface
interface TimelineItem {
  id: string
  title: string
  description?: string
  date: string
  status: 'completed' | 'current' | 'upcoming'
  type: 'milestone' | 'funding' | 'business' | 'completion'
}

// GET /api/deals/[id]/timeline - Get deal timeline
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const deal = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        timeline: true,
        createdAt: true,
        startDate: true,
        endDate: true,
        status: true,
        ownerId: true
      }
    })

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    // Parse timeline or create default
    let timeline: TimelineItem[] = []
    
    if (deal.timeline && typeof deal.timeline === 'object' && Array.isArray(deal.timeline)) {
      // Safely parse and validate timeline items
      try {
        timeline = (deal.timeline as any[]).map((item: any, index: number) => ({
          id: item.id || `${index + 1}`,
          title: item.title || '',
          description: item.description || '',
          date: item.date || new Date().toISOString(),
          status: item.status || 'upcoming',
          type: item.type || 'milestone'
        })) as TimelineItem[]
      } catch (error) {
        console.error('Error parsing timeline:', error)
        timeline = []
      }
    } else {
      // Create default timeline based on deal status and dates
      timeline = [
        {
          id: '1',
          title: 'فتح الصفقة',
          description: 'تم إنشاء الصفقة وإتاحتها للمستثمرين',
          date: deal.createdAt.toISOString(),
          status: 'completed',
          type: 'milestone'
        },
        {
          id: '2', 
          title: 'بدأ التمويل',
          description: 'بدء قبول الاستثمارات من المستثمرين',
          date: deal.startDate?.toISOString() || deal.createdAt.toISOString(),
          status: deal.status === 'ACTIVE' || deal.status === 'FUNDED' || deal.status === 'COMPLETED' ? 'completed' : 'current',
          type: 'funding'
        },
        {
          id: '3',
          title: 'إغلاق التمويل',
          description: 'انتهاء فترة جمع الاستثمارات',
          date: deal.endDate?.toISOString() || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: deal.status === 'FUNDED' || deal.status === 'COMPLETED' ? 'completed' : 'upcoming',
          type: 'funding'
        },
        {
          id: '4',
          title: 'بدء تنفيذ المشروع',
          description: 'البدء في تنفيذ خطة العمل',
          date: deal.endDate?.toISOString() || new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
          status: deal.status === 'COMPLETED' ? 'completed' : 'upcoming',
          type: 'business'
        },
        {
          id: '5',
          title: 'إكمال المشروع',
          description: 'انتهاء المشروع وتوزيع الأرباح',
          date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
          status: deal.status === 'COMPLETED' ? 'completed' : 'upcoming',
          type: 'completion'
        }
      ]
    }

    return NextResponse.json({
      dealId: deal.id,
      dealTitle: deal.title,
      timeline
    })
  } catch (error) {
    console.error('Error fetching timeline:', error)
    return NextResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// PUT /api/deals/[id]/timeline - Update deal timeline (Partners only)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    const { timeline } = body

    if (!Array.isArray(timeline)) {
      return NextResponse.json({ error: 'Timeline must be an array' }, { status: 400 })
    }

    // Verify user owns this deal or is admin
    const deal = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        ownerId: true
      }
    })

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    const isOwner = deal.ownerId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'
    const isDealManager = session.user.role === 'DEAL_MANAGER'

    if (!isOwner && !isAdmin && !isDealManager) {
      return NextResponse.json({ error: 'Not authorized to update this deal' }, { status: 403 })
    }

    // Validate timeline items
    const validatedTimeline: TimelineItem[] = timeline.map((item: any, index: number) => ({
      id: item.id || (index + 1).toString(),
      title: item.title || `Timeline Item ${index + 1}`,
      description: item.description || '',
      date: item.date || new Date().toISOString(),
      status: ['completed', 'current', 'upcoming'].includes(item.status) ? item.status : 'upcoming',
      type: ['milestone', 'funding', 'business', 'completion'].includes(item.type) ? item.type : 'milestone'
    }))

    // Update deal timeline
    const updatedDeal = await prisma.project.update({
      where: { id },
      data: {
        timeline: validatedTimeline
      },
      select: {
        id: true,
        title: true,
        timeline: true
      }
    })

    return NextResponse.json({
      dealId: updatedDeal.id,
      dealTitle: updatedDeal.title,
      timeline: updatedDeal.timeline
    })
  } catch (error) {
    console.error('Error updating timeline:', error)
    return NextResponse.json({ error: 'Failed to update timeline' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
