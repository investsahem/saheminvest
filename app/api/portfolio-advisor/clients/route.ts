import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Fetch assigned clients for portfolio advisor
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a portfolio advisor
    if (session.user.role !== 'PORTFOLIO_ADVISOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const assignments = await prisma.userInvestorAssignment.findMany({
      where: {
        advisorId: session.user.id,
        isActive: true
      },
      include: {
        investor: {
          select: {
            id: true,
            name: true,
            email: true,
            walletBalance: true,
            totalInvested: true,
            totalReturns: true,
            createdAt: true,
            investments: {
              select: {
                id: true,
                amount: true,
                status: true,
                createdAt: true,
                project: {
                  select: {
                    id: true,
                    title: true,
                    category: true
                  }
                }
              },
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const clients = assignments.map(assignment => ({
      assignmentId: assignment.id,
      assignedAt: assignment.createdAt,
      ...assignment.investor,
      activeInvestments: assignment.investor.investments.filter(inv => inv.status === 'ACTIVE').length,
      lastInvestment: assignment.investor.investments[0]?.createdAt || null
    }))

    return NextResponse.json({ clients })
  } catch (error) {
    console.error('Error fetching assigned clients:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}