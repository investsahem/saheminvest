import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

    // Fetch partner with their profile and projects
    const partner = await prisma.user.findUnique({
      where: { 
        id: id,
        role: 'PARTNER'
      },
      include: {
        partnerProfile: true,
        projects: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            fundingGoal: true,
            currentFunding: true,
            expectedReturn: true,
            duration: true,
            riskLevel: true,
            thumbnailImage: true,
            status: true,
            minInvestment: true,
            endDate: true,
            _count: {
              select: {
                investments: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
    }

    // Remove sensitive information
    const sanitizedPartner = {
      id: partner.id,
      name: partner.name,
      email: partner.email,
      role: partner.role,
      createdAt: partner.createdAt,
      partnerProfile: partner.partnerProfile,
      projects: partner.projects
    }

    return NextResponse.json(sanitizedPartner)
  } catch (error) {
    console.error('Error fetching partner:', error)
    return NextResponse.json({ error: 'Failed to fetch partner' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
