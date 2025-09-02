import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/db'
import emailService from '../../../../lib/email'
import notificationService from '../../../../lib/notifications'

// POST /api/admin/deposits/manual - Add manual deposit for an investor
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { userId, amount, method, description } = await request.json()

    // Validate input
    if (!userId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      )
    }

    // Verify the user exists and is an investor
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true, 
        walletBalance: true 
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.role !== 'INVESTOR') {
      return NextResponse.json(
        { error: 'User is not an investor' },
        { status: 400 }
      )
    }

    // Create the transaction record
    const transaction = await prisma.transaction.create({
      data: {
        userId: userId,
        amount: parseFloat(amount.toString()),
        type: 'DEPOSIT',
        method: method.toUpperCase(),
        status: 'COMPLETED', // Manual deposits are immediately completed
        description: description || `Manual ${method} deposit added by admin`,
        reference: `MAN-DEP-${Date.now()}`
      }
    })

    // Update user's wallet balance
    await prisma.user.update({
      where: { id: userId },
      data: {
        walletBalance: {
          increment: parseFloat(amount.toString())
        }
      }
    })

    // Send notification to the user
    try {
      await notificationService.createNotification(
        userId,
        'Deposit Successful',
        `Your ${method} deposit of $${amount} has been processed and added to your wallet.`,
        'DEPOSIT_COMPLETED',
        {
          amount: parseFloat(amount.toString()),
          method: method,
          transactionId: transaction.id,
          reference: transaction.reference
        }
      )

      // Send email notification
      await emailService.sendDepositConfirmation({
        to: user.email,
        userName: user.name || 'User',
        amount: parseFloat(amount.toString()),
        method: method,
        reference: transaction.reference || '',
        newBalance: Number(user.walletBalance) + parseFloat(amount.toString())
      })
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError)
      // Don't fail the transaction if notification fails
    }

    return NextResponse.json({
      message: 'Manual deposit added successfully',
      transaction: {
        id: transaction.id,
        amount: Number(transaction.amount),
        method: transaction.method,
        reference: transaction.reference,
        status: transaction.status
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        newBalance: Number(user.walletBalance) + parseFloat(amount.toString())
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error adding manual deposit:', error)
    return NextResponse.json(
      { error: 'Failed to add manual deposit' },
      { status: 500 }
    )
  }
}
