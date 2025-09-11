import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '../../../../lib/auth'
import { z } from 'zod'

const prisma = new PrismaClient()

const updatePartnerApplicationSchema = z.object({
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
    const validationResult = updatePartnerApplicationSchema.safeParse(body)
    
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
    const existingApplication = await prisma.partnerApplication.findUnique({
      where: { id: applicationId }
    })

    if (!existingApplication) {
      return NextResponse.json(
        { message: 'Partner application not found' },
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
    const updatedApplication = await prisma.partnerApplication.update({
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

    // If approved, create partner account
    if (status === 'APPROVED') {
      try {
        // Create user account first
        const newUser = await prisma.user.create({
          data: {
            email: existingApplication.email,
            name: existingApplication.contactName,
            role: 'PARTNER',
            isActive: true
          }
        })

        // Create partner profile
        await prisma.partner.create({
          data: {
            companyName: existingApplication.companyName,
            contactName: existingApplication.contactName,
            phone: existingApplication.phone,
            address: existingApplication.address,
            website: existingApplication.website,
            industry: existingApplication.industry,
            description: existingApplication.description,
            userId: newUser.id,
            status: 'PENDING', // They still need to complete onboarding
            tier: 'BRONZE'
          }
        })

        // TODO: Send welcome email with login instructions
        // TODO: Send notification about approved application
        
      } catch (partnerCreationError) {
        console.error('Error creating partner account:', partnerCreationError)
        // Don't fail the application approval, but log the error
      }
    }

    return NextResponse.json({
      application: updatedApplication,
      message: `Partner application ${status.toLowerCase()} successfully`
    })

  } catch (error) {
    console.error('Error updating partner application:', error)
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Partner application not found' },
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
