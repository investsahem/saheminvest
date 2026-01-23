import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import { PrismaClient } from '@prisma/client'
import { emailService } from '../../../../lib/email'
import notificationService from '../../../../lib/notifications'
import EmailTriggers from '../../../../lib/email-triggers'

const prisma = new PrismaClient()

// GET /api/admin/transactions/[id] - Get single transaction
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { permissions: true }
    })

    if (!user || (user.role !== 'ADMIN' && !user.permissions.some(p => p.permission === 'READ_TRANSACTIONS'))) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            walletBalance: true
          }
        },
        investment: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
                category: true,
                status: true
              }
            }
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

    return NextResponse.json({
      id: transaction.id,
      type: transaction.type.toLowerCase(),
      amount: Number(transaction.amount),
      status: transaction.status.toLowerCase(),
      user: {
        id: transaction.user.id,
        name: transaction.user.name,
        email: transaction.user.email,
        role: transaction.user.role,
        walletBalance: Number(transaction.user.walletBalance)
      },
      deal: transaction.investment?.project ? {
        id: transaction.investment.project.id,
        title: transaction.investment.project.title,
        category: transaction.investment.project.category,
        status: transaction.investment.project.status
      } : undefined,
      investment: transaction.investment ? {
        id: transaction.investment.id,
        amount: Number(transaction.investment.amount)
      } : undefined,
      description: transaction.description,
      reference: transaction.reference,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
      method: transaction.method || undefined
    })

  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/transactions/[id] - Update transaction status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { permissions: true }
    })

    if (!user || (user.role !== 'ADMIN' && !user.permissions.some(p => p.permission === 'WRITE_TRANSACTIONS'))) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status, notes } = body

    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Use Prisma transaction for atomic operations
    const result = await prisma.$transaction(async (tx) => {
      // Update transaction status
      const updatedTransaction = await tx.transaction.update({
        where: { id },
        data: {
          status: status.toUpperCase(),
          notes: notes || null
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      })

      // If approving a deposit, update user wallet balance
      if (status.toLowerCase() === 'completed' && existingTransaction.type === 'DEPOSIT' && existingTransaction.status === 'PENDING') {
        const updatedUser = await tx.user.update({
          where: { id: existingTransaction.userId },
          data: {
            walletBalance: {
              increment: existingTransaction.amount
            }
          }
        })

        // Send email and notification for approved deposit
        try {
          await emailService.sendDepositApprovedEmail(
            existingTransaction.user.email,
            existingTransaction.user.name || 'User',
            Number(existingTransaction.amount),
            existingTransaction.reference || '',
            Number(updatedUser.walletBalance)
          )

          await notificationService.notifyDepositApproved(
            existingTransaction.userId,
            Number(existingTransaction.amount),
            Number(updatedUser.walletBalance),
            existingTransaction.reference || ''
          )
        } catch (emailError) {
          console.error('Failed to send deposit approval notifications:', emailError)
        }
      }

      // If approving a withdrawal, deduct from user wallet balance
      if (status.toLowerCase() === 'completed' && existingTransaction.type === 'WITHDRAWAL' && existingTransaction.status === 'PENDING') {
        await tx.user.update({
          where: { id: existingTransaction.userId },
          data: {
            walletBalance: {
              decrement: existingTransaction.amount
            }
          }
        })

        // Send withdrawal confirmation
        try {
          await notificationService.createNotification(
            existingTransaction.userId,
            'Withdrawal Processed',
            `Your withdrawal of $${Number(existingTransaction.amount).toLocaleString()} has been processed successfully.`,
            'success',
            {
              type: 'withdrawal_completed',
              amount: Number(existingTransaction.amount),
              reference: existingTransaction.reference
            }
          )

          // Send withdrawal approved email
          await EmailTriggers.onWithdrawalApproved(existingTransaction.id)
        } catch (notificationError) {
          console.error('Failed to send withdrawal notification:', notificationError)
        }
      }

      // If rejecting a withdrawal, just notify user (funds were already deduced? No, withdrawals are pending requests usually holding funds or just request logic. 
      // Based on withdraw route, funds are NOT deducted strictly at request time in this codebase based on this update logic (it deducts on completion).
      // Wait, let's double check withdrawal logic.
      // In withdrawal route: walletBalance < amount check is done, but NO deduction happens in POST.
      // So if rejected, we just update status to FAILED/REJECTED.

      if ((status.toLowerCase() === 'failed' || status.toLowerCase() === 'rejected') && existingTransaction.type === 'WITHDRAWAL' && existingTransaction.status === 'PENDING') {
        try {
          // Send withdrawal rejection email
          await EmailTriggers.onWithdrawalRejected(existingTransaction.id, notes || 'Withdrawal request rejected by admin')
        } catch (error) {
          console.error('Failed to send withdrawal rejection email:', error)
        }
      }

      return updatedTransaction
    })

    return NextResponse.json({
      id: result.id,
      type: result.type.toLowerCase(),
      amount: Number(result.amount),
      status: result.status.toLowerCase(),
      user: result.user,
      description: result.description,
      reference: result.reference,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
      method: result.method || undefined,
      notes: result.notes || undefined
    })

  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/transactions/[id] - Delete transaction (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin only' },
        { status: 403 }
      )
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id }
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Only allow deletion of pending or failed transactions
    if (transaction.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot delete completed transactions' },
        { status: 400 }
      )
    }

    await prisma.transaction.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Transaction deleted successfully' })

  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
}
