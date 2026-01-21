import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { toSafeMoney } from '../../../lib/decimal-utils'
import { PrismaClient } from '@prisma/client'
import notificationService from '../../../lib/notifications'
import EmailTriggers from '../../../lib/email-triggers'

const prisma = new PrismaClient()

// POST /api/wallet/withdraw - Create a withdrawal request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { amount, method } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid withdrawal amount' },
        { status: 400 }
      )
    }

    if (!method || !['cash', 'bank'].includes(method)) {
      return NextResponse.json(
        { error: 'Invalid withdrawal method' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        walletBalance: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has sufficient balance
    if (Number(user.walletBalance) < amount) {
      return NextResponse.json(
        { error: `Insufficient balance. Available: $${Number(user.walletBalance).toLocaleString()}` },
        { status: 400 }
      )
    }

    // Create withdrawal transaction (always PENDING for admin approval)
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: 'WITHDRAWAL',
        amount: toSafeMoney(amount),
        description: `Withdrawal via ${method === 'cash' ? 'cash from office' : 'bank transfer'}`,
        method: method.toUpperCase(),
        status: 'PENDING',
        reference: `WTH-${Date.now()}`
      }
    })

    // Send notification
    try {
      await notificationService.createNotification(
        session.user.id,
        'Withdrawal Request Submitted',
        `Your withdrawal request of $${Number(amount).toLocaleString()} via ${method === 'cash' ? 'cash' : 'bank transfer'} has been submitted and is pending approval.`,
        'info',
        {
          type: 'withdrawal_pending',
          amount: Number(amount),
          method: method,
          reference: transaction.reference
        }
      )

      // Notify admins about the new withdrawal request
      await notificationService.notifyNewWithdrawal(
        Number(amount),
        session.user.email!,
        transaction.reference || `WTH-${Date.now()}`
      )

      // Send admin email notification
      await EmailTriggers.notifyAdminNewWithdrawal({
        userName: user.name || 'User',
        userEmail: session.user.email!,
        amount: Number(amount),
        method: method,
        reference: transaction.reference || `WTH-${Date.now()}`
      })
    } catch (notificationError) {
      console.error('Failed to send withdrawal notification:', notificationError)
    }

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        amount: Number(transaction.amount),
        method: method,
        status: transaction.status.toLowerCase(),
        reference: transaction.reference,
        message: 'Withdrawal request submitted and pending approval.'
      }
    })

  } catch (error) {
    console.error('Error processing withdrawal:', error)
    return NextResponse.json(
      { error: 'Failed to process withdrawal' },
      { status: 500 }
    )
  }
}


