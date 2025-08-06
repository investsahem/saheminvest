import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Fetch advisor applications (for admin)
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {}
    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    const applications = await prisma.userApplication.findMany({
      where,
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
      },
      skip,
      take: limit
    })

    const total = await prisma.userApplication.count({ where })

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching advisor applications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Submit advisor application
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is an investor
    if (session.user.role !== 'INVESTOR') {
      return NextResponse.json({ error: 'Only investors can apply for advisor services' }, { status: 403 })
    }

    const body = await request.json()
    const {
      investmentExperience,
      riskTolerance,
      investmentGoals,
      monthlyIncome,
      initialInvestment,
      additionalInfo,
      agreeToTerms
    } = body

    if (!agreeToTerms) {
      return NextResponse.json({ error: 'You must agree to the terms of service' }, { status: 400 })
    }

    // Check if user already has an application
    const existingApplication = await prisma.userApplication.findUnique({
      where: { email: session.user.email! }
    })

    if (existingApplication) {
      return NextResponse.json({ error: 'You already have an advisor application' }, { status: 400 })
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create application
    const application = await prisma.userApplication.create({
      data: {
        firstName: user.name?.split(' ')[0] || 'Unknown',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || new Date('1990-01-01'),
        address: user.address || '',
        city: 'Unknown',
        country: 'Unknown',
        nationalId: 'Unknown',
        occupation: 'Unknown',
        investmentExperience,
        riskTolerance,
        investmentGoals,
        monthlyIncome: monthlyIncome ? parseFloat(monthlyIncome) : null,
        initialInvestment: initialInvestment ? parseFloat(initialInvestment) : null,
        notes: additionalInfo,
        agreeToTerms: true,
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      message: 'Application submitted successfully',
      application: {
        id: application.id,
        status: application.status,
        createdAt: application.createdAt
      }
    })
  } catch (error) {
    console.error('Error submitting advisor application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}