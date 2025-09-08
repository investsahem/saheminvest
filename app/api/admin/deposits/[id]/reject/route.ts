import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/db'
import emailService from '../../../../../lib/email'
import notificationService from '../../../../../lib/notifications'
import EmailTriggers from '../../../../../lib/email-triggers'

// POST /api/admin/deposits/[id]/reject - Reject a pending deposit
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: depositId } = await params
    const { reason } = await request.json()

    // Find the pending deposit transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: depositId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    if (transaction.type !== 'DEPOSIT') {
      return NextResponse.json(
        { error: 'Transaction is not a deposit' },
        { status: 400 }
      )
    }

    if (transaction.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Transaction is not pending' },
        { status: 400 }
      )
    }

    // Update transaction status to rejected
    const updatedTransaction = await prisma.transaction.update({
      where: { id: depositId },
      data: {
        status: 'FAILED',
        description: reason ? `${transaction.description} - Rejected: ${reason}` : `${transaction.description} - Rejected by admin`,
        updatedAt: new Date()
      }
    })

    // Send notification to the user
    try {
      await notificationService.createNotification(
        transaction.userId,
        'Deposit Rejected',
        `Your ${transaction.method?.toLowerCase() || 'deposit'} of $${Number(transaction.amount)} has been rejected. ${reason ? `Reason: ${reason}` : 'Please contact support for more information.'}`,
        'DEPOSIT_REJECTED',
        {
          amount: Number(transaction.amount),
          method: transaction.method,
          transactionId: transaction.id,
          reference: transaction.reference,
          reason: reason || 'No reason provided'
        }
      )

      // Send email notification using the new trigger system
      await EmailTriggers.onDepositRejected(transaction.id, reason || 'Please contact our support team for more information.')
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError)
      // Don't fail the transaction if notification fails
    }

    return NextResponse.json({
      message: 'Deposit rejected successfully',
      transaction: {
        id: updatedTransaction.id,
        amount: Number(updatedTransaction.amount),
        method: updatedTransaction.method,
        status: updatedTransaction.status,
        reference: updatedTransaction.reference
      }
    })

  } catch (error) {
    console.error('Error rejecting deposit:', error)
    return NextResponse.json(
      { error: 'Failed to reject deposit' },
      { status: 500 }
    )
  }
}
