import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import { PrismaClient } from '@prisma/client'
import { emailService } from '../../../../lib/email'

const prisma = new PrismaClient()

// POST /api/admin/deal-update-requests/[id] - Approve or reject update request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin or deal manager
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (user?.role !== 'ADMIN' && user?.role !== 'DEAL_MANAGER') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { action, rejectionReason } = await request.json()

    if (!action || (action !== 'approve' && action !== 'reject')) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Get the update request with project and requester info
    const updateRequest = await prisma.dealUpdateRequest.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!updateRequest) {
      return NextResponse.json({ error: 'Update request not found' }, { status: 404 })
    }

    if (updateRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'Update request already processed' }, { status: 400 })
    }

    const partnerEmail = updateRequest.project.owner.email
    const partnerName = updateRequest.project.owner.name || 'Partner'
    const dealTitle = updateRequest.project.title
    const dealId = updateRequest.project.id

    if (action === 'approve') {
      // Apply the proposed changes to the deal
      const proposedChanges = updateRequest.proposedChanges as any

      // Ensure the deal becomes ACTIVE on approval
      proposedChanges.status = 'ACTIVE'

      await prisma.project.update({
        where: { id: updateRequest.projectId },
        data: proposedChanges
      })

      // Update the request status
      await prisma.dealUpdateRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          reviewedBy: session.user.id,
          reviewedAt: new Date()
        }
      })

      // Send approval email to partner
      try {
        await emailService.sendDealApprovedEmail(partnerEmail, partnerName, dealTitle, dealId)
        console.log(`Deal approval email sent to ${partnerEmail} for deal: ${dealTitle}`)
      } catch (emailError) {
        console.error('Failed to send deal approval email:', emailError)
      }

      return NextResponse.json({
        message: 'Update request approved and changes applied',
        status: 'approved'
      })
    } else {
      // Reject the update request and set deal status to REJECTED
      await prisma.dealUpdateRequest.update({
        where: { id },
        data: {
          status: 'REJECTED',
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
          rejectionReason: rejectionReason || 'No reason provided'
        }
      })

      // Set the deal status to REJECTED so partner can edit and re-submit
      await prisma.project.update({
        where: { id: updateRequest.projectId },
        data: { status: 'REJECTED' }
      })

      // Send rejection email to partner
      try {
        await emailService.sendDealRejectedEmail(partnerEmail, partnerName, dealTitle, rejectionReason)
        console.log(`Deal rejection email sent to ${partnerEmail} for deal: ${dealTitle}`)
      } catch (emailError) {
        console.error('Failed to send deal rejection email:', emailError)
      }

      return NextResponse.json({
        message: 'Update request rejected',
        status: 'rejected'
      })
    }
  } catch (error) {
    console.error('Error processing update request:', error)
    return NextResponse.json(
      { error: 'Failed to process update request' },
      { status: 500 }
    )
  }
}

// GET /api/admin/deal-update-requests/[id] - Get single update request details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin or deal manager
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (user?.role !== 'ADMIN' && user?.role !== 'DEAL_MANAGER') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const updateRequest = await prisma.dealUpdateRequest.findUnique({
      where: { id },
      include: {
        project: true,
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            partnerProfile: {
              select: {
                companyName: true,
                logo: true
              }
            }
          }
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!updateRequest) {
      return NextResponse.json({ error: 'Update request not found' }, { status: 404 })
    }

    return NextResponse.json({ updateRequest })
  } catch (error) {
    console.error('Error fetching update request:', error)
    return NextResponse.json(
      { error: 'Failed to fetch update request' },
      { status: 500 }
    )
  }
}

