import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '../../../../lib/auth'
import { z } from 'zod'
import { createUserFromApplication } from '../../../../lib/user-onboarding'

const prisma = new PrismaClient()

const updateApplicationSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED']),
  rejectionReason: z.string().optional(),
  reviewNotes: z.string().optional()
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

    const { status, rejectionReason, reviewNotes } = validationResult.data
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
        notes: reviewNotes || rejectionReason || null,
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

    // If approved, create user account and send welcome email
    if (status === 'APPROVED') {
      console.log('🎉 Application approved, creating user account for:', existingApplication.email)
      
      try {
        const userCreationResult = await createUserFromApplication({
          email: existingApplication.email,
          name: `${existingApplication.firstName} ${existingApplication.lastName}`,
          phone: existingApplication.phone || undefined,
          role: 'INVESTOR',
          applicationId: applicationId,
          applicationType: 'investor'
        })
        
        if (userCreationResult.success) {
          console.log('✅ User account created successfully for:', existingApplication.email)
        } else {
          console.error('❌ Failed to create user account:', userCreationResult.error)
          // Don't fail the approval if user creation fails, just log it
          // The admin can manually create the account if needed
        }
      } catch (userCreationError) {
        console.error('❌ Error during user creation:', userCreationError)
        // Continue with the approval even if user creation fails
      }
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