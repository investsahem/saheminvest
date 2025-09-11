import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '../../../../lib/auth'
import { z } from 'zod'
import { createUserFromApplication } from '../../../../lib/user-onboarding'

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

    // If approved, create partner account and send welcome email
    if (status === 'APPROVED') {
      console.log('🎉 Partner application approved, creating user account for:', existingApplication.email)
      
      try {
        // Create user account with temporary password and email
        const userCreationResult = await createUserFromApplication({
          email: existingApplication.email,
          name: existingApplication.contactName,
          phone: existingApplication.phone || undefined,
          role: 'PARTNER',
          applicationId: applicationId,
          applicationType: 'partner'
        })
        
        if (userCreationResult.success && userCreationResult.user) {
          console.log('✅ Partner user account created successfully for:', existingApplication.email)
          
          // Create partner profile linked to the user
          try {
            await prisma.partner.create({
              data: {
                companyName: existingApplication.companyName,
                contactName: existingApplication.contactName,
                phone: existingApplication.phone,
                address: existingApplication.address,
                website: existingApplication.website,
                industry: existingApplication.industry,
                description: existingApplication.description,
                userId: userCreationResult.user.id,
                status: 'PENDING', // They still need to complete onboarding
                tier: 'BRONZE'
              }
            })
            console.log('✅ Partner profile created successfully for:', existingApplication.contactName)
          } catch (partnerProfileError) {
            console.error('❌ Failed to create partner profile:', partnerProfileError)
            // The user account was created, so they can still log in
          }
        } else {
          console.error('❌ Failed to create partner user account:', userCreationResult.error)
        }
      } catch (partnerCreationError) {
        console.error('❌ Error during partner creation:', partnerCreationError)
        // Continue with the approval even if user creation fails
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
