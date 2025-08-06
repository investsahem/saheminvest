import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Fetch single advisor application
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin or the applicant themselves
    const application = await prisma.userApplication.findUnique({
      where: { id },
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

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Allow access if user is admin or the applicant
    if (session.user.role !== 'ADMIN' && application.email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ application })
  } catch (error) {
    console.error('Error fetching advisor application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update advisor application (approve/reject)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { status, rejectionReason, assignedAdvisorId } = body

    if (!['APPROVED', 'REJECTED', 'IN_PROGRESS'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    if (status === 'REJECTED' && !rejectionReason) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 })
    }

    const application = await prisma.userApplication.findUnique({
      where: { id }
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const updateData: any = {
      status,
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
      rejectionReason: status === 'REJECTED' ? rejectionReason : null
    }

    const updatedApplication = await prisma.userApplication.update({
      where: { id },
      data: updateData,
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

    // If approved and advisor assigned, create the assignment
    if (status === 'APPROVED' && assignedAdvisorId) {
      // Find the investor user by email
      const investorUser = await prisma.user.findUnique({
        where: { email: application.email }
      })

      if (investorUser) {
        // Check if assignment already exists
        const existingAssignment = await prisma.userInvestorAssignment.findUnique({
          where: {
            advisorId_investorId: {
              advisorId: assignedAdvisorId,
              investorId: investorUser.id
            }
          }
        })

        if (!existingAssignment) {
          await prisma.userInvestorAssignment.create({
            data: {
              advisorId: assignedAdvisorId,
              investorId: investorUser.id,
              isActive: true
            }
          })
        }
      }
    }

    return NextResponse.json({
      message: 'Application updated successfully',
      application: updatedApplication
    })
  } catch (error) {
    console.error('Error updating advisor application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete advisor application
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const application = await prisma.userApplication.findUnique({
      where: { id }
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    await prisma.userApplication.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Application deleted successfully' })
  } catch (error) {
    console.error('Error deleting advisor application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}