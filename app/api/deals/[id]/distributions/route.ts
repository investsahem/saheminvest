import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/deals/[id]/distributions - Get profit distributions for a deal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dealId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = searchParams.get('limit')

    // Build where clause for transactions
    const where: any = {
      type: 'RETURN',
      investment: {
        projectId: dealId
      }
    }
    
    if (status) {
      where.status = status.toUpperCase()
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    // Get profit distribution transactions for this deal
    const distributions = await prisma.transaction.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        investment: {
          select: {
            id: true,
            amount: true,
            project: {
              select: {
                id: true,
                title: true,
                category: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : undefined
    })

    return NextResponse.json({
      success: true,
      distributions: distributions.map(dist => ({
        id: dist.id,
        amount: Number(dist.amount),
        status: dist.status,
        reference: dist.reference,
        createdAt: dist.createdAt,
        user: dist.user,
        investment: dist.investment
      })),
      count: distributions.length
    })

  } catch (error) {
    console.error('Distributions retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve distributions' },
      { status: 500 }
    )
  }
}