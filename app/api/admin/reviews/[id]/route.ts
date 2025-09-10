import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PUT - Update review status (approve/reject)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can manage reviews
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const reviewId = params.id
    const { status, adminNote } = await request.json()

    // Validate status
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be APPROVED or REJECTED' },
        { status: 400 }
      )
    }

    // Check if review exists
    const existingReview = await prisma.partnerReview.findUnique({
      where: { id: reviewId },
      include: {
        investor: {
          select: {
            name: true,
            email: true
          }
        },
        partner: {
          select: {
            companyName: true
          }
        },
        project: {
          select: {
            title: true
          }
        }
      }
    })

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    // Update review status
    const updatedReview = await prisma.partnerReview.update({
      where: { id: reviewId },
      data: {
        status,
        updatedAt: new Date()
      },
      include: {
        investor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            title: true
          }
        },
        partner: {
          select: {
            id: true,
            companyName: true,
            industry: true
          }
        }
      }
    })

    // TODO: Send notification to investor about review status change
    // This could be implemented with the notification system

    return NextResponse.json({
      message: `Review ${status.toLowerCase()} successfully`,
      review: updatedReview
    })

  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a review
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can delete reviews
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const reviewId = params.id

    // Check if review exists
    const existingReview = await prisma.partnerReview.findUnique({
      where: { id: reviewId }
    })

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      )
    }

    // Delete the review
    await prisma.partnerReview.delete({
      where: { id: reviewId }
    })

    return NextResponse.json({
      message: 'Review deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}
