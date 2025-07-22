import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '../../../../lib/auth'
import { z } from 'zod'

const prisma = new PrismaClient()

const updateApplicationSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED']),
  rejectionReason: z.string().optional()
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user has admin permissions
    const allowedRoles = ['ADMIN', 'DEAL_MANAGER']
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validationResult = updateApplicationSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          message: 'Invalid request data',
          errors: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { status, rejectionReason } = validationResult.data
    const resolvedParams = await params
    const applicationId = resolvedParams.id

    // Check if application exists
    const existingApplication = await prisma.userApplication.findUnique({
      where: { id: applicationId }
    })

    if (!existingApplication) {
      return NextResponse.json(
        { message: 'Application not found' },
        { status: 404 }
      )
    }

    // Validate rejection reason is provided when rejecting
    if (status === 'REJECTED' && !rejectionReason?.trim()) {
      return NextResponse.json(
        { message: 'Rejection reason is required when rejecting an application' },
        { status: 400 }
      )
    }

    // Update the application
    const updatedApplication = await prisma.userApplication.update({
      where: { id: applicationId },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
        reviewedBy: session.user.id,
        reviewedAt: new Date()
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // TODO: Send email notification to applicant about status change
    
    // If approved, TODO: Create user account and send welcome email
    if (status === 'APPROVED') {
      // Logic to create user account from approved application
      // This would typically include:
      // 1. Create User record
      // 2. Send welcome email with login instructions
      // 3. Maybe send temporary password
    }

    return NextResponse.json({
      application: updatedApplication,
      message: 'Application status updated successfully'
    })

  } catch (error) {
    console.error('Error updating application:', error)
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 