import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '../../../lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user has admin permissions (ADMIN or DEAL_MANAGER can view applications)
    const allowedRoles = ['ADMIN', 'DEAL_MANAGER']
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Fetch applications with reviewer information
    const rawApplications = await prisma.userApplication.findMany({
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Map DB fields to frontend expected format
    const applications = rawApplications.map((app: any) => ({
      id: app.id,
      fullName: [app.firstName, app.lastName].filter(Boolean).join(' ') || '',
      email: app.email,
      phone: app.phone,
      dateOfBirth: app.dateOfBirth,
      address: app.address,
      city: app.city,
      country: app.country,
      occupation: app.occupation,
      annualIncome: app.monthlyIncome ? Number(app.monthlyIncome) * 12 : (app.initialInvestment ? Number(app.initialInvestment) : 0),
      investmentExperience: app.investmentExperience,
      riskTolerance: app.riskTolerance,
      investmentGoals: app.investmentGoals,
      identityDocument: app.nationalId,
      status: app.status,
      submittedAt: app.createdAt,
      reviewedAt: app.reviewedAt,
      reviewer: app.reviewer,
      reviewNotes: app.rejectionReason || app.notes
    }))

    return NextResponse.json({
      applications,
      message: 'Applications fetched successfully'
    })

  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 