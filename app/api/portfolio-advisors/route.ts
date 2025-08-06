import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Fetch portfolio advisors
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const advisors = await prisma.user.findMany({
      where: {
        role: 'PORTFOLIO_ADVISOR',
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        assignedInvestors: {
          select: {
            id: true,
            investor: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          where: {
            isActive: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Add client count to each advisor
    const advisorsWithStats = advisors.map(advisor => ({
      ...advisor,
      clientCount: advisor.assignedInvestors.length
    }))

    return NextResponse.json({ advisors: advisorsWithStats })
  } catch (error) {
    console.error('Error fetching portfolio advisors:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}