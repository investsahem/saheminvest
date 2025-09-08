import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { emailService } from '../../../../lib/email'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { emailType, testData } = await request.json()

    let result

    switch (emailType) {
      case 'welcome':
        result = await emailService.sendWelcomeEmail(
          testData.email,
          testData.name,
          testData.userType || 'INVESTOR'
        )
        break

      case 'deposit_approved':
        result = await emailService.sendDepositApprovedEmail(
          testData.email,
          testData.name,
          testData.amount || 1000,
          testData.reference || 'TEST-REF-001',
          testData.newBalance || 5000
        )
        break

      case 'investment_confirmation':
        result = await emailService.sendInvestmentConfirmationEmail(
          testData.email,
          testData.name,
          testData.amount || 2000,
          testData.dealTitle || 'Test Investment Deal',
          testData.reference || 'INV-TEST-001'
        )
        break

      case 'kyc_status':
        result = await emailService.sendKYCStatusEmail(
          testData.email,
          testData.name,
          testData.status || 'APPROVED',
          testData.reason
        )
        break

      case 'deal_status':
        result = await emailService.sendDealStatusEmail(
          testData.email,
          testData.partnerName || testData.name,
          testData.dealTitle || 'Test Deal',
          testData.status || 'APPROVED',
          testData.reason
        )
        break

      case 'security_alert':
        result = await emailService.sendSecurityAlertEmail(
          testData.email,
          testData.name,
          testData.alertType || 'LOGIN',
          testData.details || 'Test security alert'
        )
        break

      case 'monthly_report':
        result = await emailService.sendMonthlyPortfolioReport(
          testData.email,
          testData.name,
          {
            totalInvestments: testData.totalInvestments || 25000,
            totalReturns: testData.totalReturns || 3500,
            portfolioValue: testData.portfolioValue || 28500,
            monthlyGrowth: testData.monthlyGrowth || 12.5,
            activeDeals: testData.activeDeals || 5
          }
        )
        break

      case 'forgot_password':
        result = await emailService.sendForgotPasswordEmail(
          testData.email,
          testData.name,
          'test-token-123',
          `${process.env.NEXTAUTH_URL}/auth/reset-password?token=test-token-123`
        )
        break

      case 'return_payment':
        result = await emailService.sendReturnPaymentEmail(
          testData.email,
          testData.name,
          testData.amount || 1500,
          testData.dealTitle || 'Test Investment Deal',
          testData.reference || 'RET-TEST-001'
        )
        break

      case 'invoice':
        result = await emailService.sendInvoiceEmail(
          testData.email,
          testData.name,
          {
            invoiceNumber: testData.invoiceNumber || 'INV-2024-001',
            amount: testData.amount || 250,
            description: testData.description || 'Platform fees',
            dueDate: testData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            downloadUrl: testData.downloadUrl || `${process.env.NEXTAUTH_URL}/invoices/test.pdf`
          }
        )
        break

      case 'maintenance':
        result = await emailService.sendMaintenanceNotificationEmail(
          [testData.email],
          {
            startTime: testData.startTime || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            endTime: testData.endTime || new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
            description: testData.description || 'Scheduled system maintenance for performance improvements',
            affectedServices: testData.affectedServices || ['Trading Platform', 'User Dashboard', 'Mobile App']
          }
        )
        break

      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Test ${emailType} email sent successfully`,
      result
    })

  } catch (error) {
    console.error('Email test error:', error)
    return NextResponse.json(
      { error: 'Failed to send test email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Get available email types for testing
export async function GET() {
  const emailTypes = [
    {
      type: 'welcome',
      name: 'Welcome Email',
      description: 'Sent when a user registers',
      requiredFields: ['email', 'name', 'userType']
    },
    {
      type: 'deposit_approved',
      name: 'Deposit Approved',
      description: 'Sent when a deposit is approved',
      requiredFields: ['email', 'name', 'amount', 'newBalance']
    },
    {
      type: 'investment_confirmation',
      name: 'Investment Confirmation',
      description: 'Sent when an investment is made',
      requiredFields: ['email', 'name', 'amount', 'dealTitle']
    },
    {
      type: 'kyc_status',
      name: 'KYC Status',
      description: 'Sent when KYC status changes',
      requiredFields: ['email', 'name', 'status']
    },
    {
      type: 'deal_status',
      name: 'Deal Status',
      description: 'Sent when deal status changes',
      requiredFields: ['email', 'partnerName', 'dealTitle', 'status']
    },
    {
      type: 'security_alert',
      name: 'Security Alert',
      description: 'Sent for security events',
      requiredFields: ['email', 'name', 'alertType', 'details']
    },
    {
      type: 'monthly_report',
      name: 'Monthly Portfolio Report',
      description: 'Monthly portfolio summary',
      requiredFields: ['email', 'name']
    },
    {
      type: 'forgot_password',
      name: 'Forgot Password',
      description: 'Password reset email',
      requiredFields: ['email', 'name']
    },
    {
      type: 'return_payment',
      name: 'Return Payment',
      description: 'Investment return notification',
      requiredFields: ['email', 'name', 'amount', 'dealTitle']
    },
    {
      type: 'invoice',
      name: 'Invoice',
      description: 'Billing invoice',
      requiredFields: ['email', 'name', 'amount']
    },
    {
      type: 'maintenance',
      name: 'Maintenance Notification',
      description: 'System maintenance alert',
      requiredFields: ['email']
    }
  ]

  return NextResponse.json({ emailTypes })
}
