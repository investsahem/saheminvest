import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { PrismaClient } from '@prisma/client'
import emailService from '../../../lib/email'
import notificationService from '../../../lib/notifications'

const prisma = new PrismaClient()

// POST /api/wallet/deposit - Create a deposit request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { amount, method, cardDetails } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid deposit amount' },
        { status: 400 }
      )
    }

    if (!method || !['cash', 'card', 'bank'].includes(method)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      )
    }

    // For card payments, validate card details
    if (method === 'card') {
      if (!cardDetails || !cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
        return NextResponse.json(
          { error: 'Card details are required for card payments' },
          { status: 400 }
        )
      }
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

    // Create transaction record
    const result = await prisma.$transaction(async (tx) => {
      // For cash and bank transfers, create as PENDING (requires admin approval)
      // For card payments, process immediately (simulate payment processing)
      const status = method === 'card' ? 'COMPLETED' : 'PENDING'
      
      const transaction = await tx.transaction.create({
        data: {
          userId: session.user.id,
          type: 'DEPOSIT',
          amount: parseFloat(amount),
          description: `Deposit via ${method === 'cash' ? 'cash at office' : method === 'card' ? 'credit/debit card' : 'bank transfer'}`,
          method: method.toUpperCase(),
          status: status,
          reference: `DEP-${Date.now()}`
        }
      })

      // If card payment, update wallet balance immediately
      if (method === 'card') {
        await tx.user.update({
          where: { id: session.user.id },
          data: {
            walletBalance: {
              increment: parseFloat(amount)
            }
          }
        })
      }

      return transaction
    })

    // Send notifications
    if (method === 'card') {
      // Send immediate confirmation for card payments
      try {
        await notificationService.createNotification(
          session.user.id,
          'Deposit Successful',
          `Your deposit of $${Number(amount).toLocaleString()} has been processed successfully.`,
          'success',
          {
            type: 'deposit_completed',
            amount: Number(amount),
            method: method,
            reference: result.reference
          }
        )
      } catch (notificationError) {
        console.error('Failed to send deposit notification:', notificationError)
      }
    } else {
      // Send pending notification for cash/bank transfers
      try {
        await notificationService.createNotification(
          session.user.id,
          'Deposit Request Submitted',
          `Your deposit request of $${Number(amount).toLocaleString()} via ${method === 'cash' ? 'cash' : 'bank transfer'} has been submitted and is pending approval.`,
          'info',
          {
            type: 'deposit_pending',
            amount: Number(amount),
            method: method,
            reference: result.reference
          }
        )
      } catch (notificationError) {
        console.error('Failed to send deposit notification:', notificationError)
      }
    }

    return NextResponse.json({
      success: true,
      transaction: {
        id: result.id,
        amount: Number(result.amount),
        method: method,
        status: result.status.toLowerCase(),
        reference: result.reference,
        message: method === 'card' 
          ? 'Deposit processed successfully!' 
          : 'Deposit request submitted and pending approval.'
      }
    })

  } catch (error) {
    console.error('Error processing deposit:', error)
    return NextResponse.json(
      { error: 'Failed to process deposit' },
      { status: 500 }
    )
  }
}


