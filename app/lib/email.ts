interface EmailTemplate {
  subject: string
  htmlContent: string
  textContent?: string
}

interface EmailRecipient {
  email: string
  name?: string
}

interface EmailData {
  to: EmailRecipient[]
  subject: string
  htmlContent: string
  textContent?: string
  templateId?: number
  params?: Record<string, any>
}

class EmailService {
  private apiKey: string
  private fromEmail: string
  private fromName: string
  private baseUrl = 'https://api.brevo.com/v3'

  constructor() {
    this.apiKey = process.env.BREVO_API_KEY!
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@sahaminvest.com'
    this.fromName = 'Sahem Invest'
  }

  private async makeRequest(endpoint: string, data: any) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Brevo API Error: ${response.status} - ${error}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Email service error:', error)
      throw error
    }
  }

  async sendEmail(emailData: EmailData) {
    const payload = {
      sender: {
        name: this.fromName,
        email: this.fromEmail
      },
      to: emailData.to,
      subject: emailData.subject,
      htmlContent: emailData.htmlContent,
      textContent: emailData.textContent
    }

    return await this.makeRequest('/smtp/email', payload)
  }

  async sendTemplateEmail(templateId: number, to: EmailRecipient[], params: Record<string, any> = {}) {
    const payload = {
      sender: {
        name: this.fromName,
        email: this.fromEmail
      },
      to,
      templateId,
      params
    }

    return await this.makeRequest('/smtp/email', payload)
  }

  // Forgot Password Email
  async sendForgotPasswordEmail(email: string, name: string, resetToken: string, resetUrl: string) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password - Sahem Invest</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>We received a request to reset your password for your Sahem Invest account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            <p>For security, this reset link can only be used once.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Sahem Invest. All rights reserved.</p>
            <p>If you have any questions, contact us at support@sahaminvest.com</p>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({
      to: [{ email, name }],
      subject: 'Reset Your Password - Sahem Invest',
      htmlContent,
      textContent: `Hello ${name}, we received a request to reset your password. Click this link to reset: ${resetUrl} This link expires in 1 hour.`
    })
  }

  // Transaction Notification Emails
  async sendDepositConfirmationEmail(email: string, name: string, amount: number, reference: string, method: string) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Deposit Confirmation - Sahem Invest</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .amount { font-size: 24px; font-weight: bold; color: #10B981; text-align: center; margin: 20px 0; }
          .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Deposit Received</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Your deposit has been successfully received and is being processed.</p>
            <div class="amount">$${amount.toLocaleString()}</div>
            <div class="details">
              <h3>Transaction Details:</h3>
              <p><strong>Reference:</strong> ${reference}</p>
              <p><strong>Method:</strong> ${method.charAt(0).toUpperCase() + method.slice(1)}</p>
              <p><strong>Status:</strong> Processing</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <p>Your funds will be available in your wallet once the transaction is confirmed by our team.</p>
            <p>You will receive another email once the deposit is approved.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Sahem Invest. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({
      to: [{ email, name }],
      subject: 'Deposit Confirmation - Sahem Invest',
      htmlContent
    })
  }

  async sendDepositApprovedEmail(email: string, name: string, amount: number, reference: string, newBalance: number) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Deposit Approved - Sahem Invest</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .amount { font-size: 24px; font-weight: bold; color: #10B981; text-align: center; margin: 20px 0; }
          .balance { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center; }
          .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Deposit Approved</h1>
          </div>
          <div class="content">
            <h2>Great news, ${name}!</h2>
            <p>Your deposit has been approved and added to your wallet.</p>
            <div class="amount">$${amount.toLocaleString()}</div>
            <div class="balance">
              <h3>Your New Wallet Balance</h3>
              <div style="font-size: 28px; font-weight: bold; color: #3B82F6;">$${newBalance.toLocaleString()}</div>
            </div>
            <p>You can now use these funds to invest in available deals.</p>
            <a href="${process.env.NEXTAUTH_URL}/deals" class="button">Browse Investment Opportunities</a>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Sahem Invest. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({
      to: [{ email, name }],
      subject: 'Deposit Approved - Funds Available',
      htmlContent
    })
  }

  async sendWithdrawalRequestEmail(email: string, name: string, amount: number, reference: string) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Withdrawal Request - Sahem Invest</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #F59E0B, #D97706); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .amount { font-size: 24px; font-weight: bold; color: #F59E0B; text-align: center; margin: 20px 0; }
          .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💸 Withdrawal Request Received</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>We've received your withdrawal request and it's being processed by our team.</p>
            <div class="amount">$${amount.toLocaleString()}</div>
            <div class="details">
              <h3>Request Details:</h3>
              <p><strong>Reference:</strong> ${reference}</p>
              <p><strong>Status:</strong> Under Review</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <p>Processing time: 1-3 business days</p>
            <p>You will receive a confirmation email once the withdrawal is processed.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Sahem Invest. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({
      to: [{ email, name }],
      subject: 'Withdrawal Request Received',
      htmlContent
    })
  }

  async sendInvestmentConfirmationEmail(email: string, name: string, amount: number, dealTitle: string, reference: string) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Investment Confirmation - Sahem Invest</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .amount { font-size: 24px; font-weight: bold; color: #8B5CF6; text-align: center; margin: 20px 0; }
          .deal { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #8B5CF6; }
          .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 Investment Successful</h1>
          </div>
          <div class="content">
            <h2>Congratulations, ${name}!</h2>
            <p>Your investment has been successfully processed.</p>
            <div class="amount">$${amount.toLocaleString()}</div>
            <div class="deal">
              <h3>Investment Details:</h3>
              <p><strong>Deal:</strong> ${dealTitle}</p>
              <p><strong>Reference:</strong> ${reference}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Status:</strong> Active</p>
            </div>
            <p>You can track your investment performance and returns in your portfolio dashboard.</p>
            <a href="${process.env.NEXTAUTH_URL}/portfolio" class="button">View Portfolio</a>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Sahem Invest. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({
      to: [{ email, name }],
      subject: `Investment Confirmed - ${dealTitle}`,
      htmlContent
    })
  }

  async sendReturnPaymentEmail(email: string, name: string, amount: number, dealTitle: string, reference: string) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Return Payment - Sahem Invest</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .amount { font-size: 24px; font-weight: bold; color: #10B981; text-align: center; margin: 20px 0; }
          .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10B981; }
          .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Return Payment Received</h1>
          </div>
          <div class="content">
            <h2>Excellent news, ${name}!</h2>
            <p>You've received a return payment from one of your investments.</p>
            <div class="amount">+$${amount.toLocaleString()}</div>
            <div class="details">
              <h3>Return Details:</h3>
              <p><strong>From:</strong> ${dealTitle}</p>
              <p><strong>Reference:</strong> ${reference}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Type:</strong> Investment Return</p>
            </div>
            <p>This amount has been added to your wallet and is available for reinvestment.</p>
            <a href="${process.env.NEXTAUTH_URL}/portfolio" class="button">View Portfolio</a>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Sahem Invest. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({
      to: [{ email, name }],
      subject: `Return Payment - ${dealTitle}`,
      htmlContent
    })
  }

  // Admin notification emails
  async sendAdminNotificationEmail(adminEmail: string, subject: string, message: string, actionUrl?: string) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject} - Sahem Invest Admin</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #EF4444, #DC2626); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Admin Notification</h1>
          </div>
          <div class="content">
            <h2>${subject}</h2>
            <p>${message}</p>
            ${actionUrl ? `<a href="${actionUrl}" class="button">Take Action</a>` : ''}
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Sahem Invest Admin Panel</p>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({
      to: [{ email: adminEmail, name: 'Admin' }],
      subject: `[ADMIN] ${subject}`,
      htmlContent
    })
  }

  async sendDepositConfirmation(data: {
    to: string
    userName: string
    amount: number
    method: string
    reference: string
    newBalance: number
  }) {
    const { to, userName, amount, method, reference, newBalance } = data

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .amount { font-size: 24px; font-weight: bold; color: #10B981; text-align: center; margin: 20px 0; }
          .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Deposit Confirmed</h1>
          </div>
          <div class="content">
            <h2>Hi ${userName},</h2>
            <p>Great news! Your deposit has been successfully processed and added to your wallet.</p>
            
            <div class="amount">$${amount.toLocaleString()}</div>
            
            <div class="details">
              <h3>Transaction Details:</h3>
              <p><strong>Amount:</strong> $${amount.toLocaleString()}</p>
              <p><strong>Method:</strong> ${method.charAt(0).toUpperCase() + method.slice(1)}</p>
              <p><strong>Reference:</strong> ${reference}</p>
              <p><strong>New Wallet Balance:</strong> $${newBalance.toLocaleString()}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p>Your funds are now available for investment. You can start exploring investment opportunities right away!</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Sahem Invest. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({
      to: [{ email: to, name: userName }],
      subject: 'Deposit Confirmed - Funds Added to Your Wallet',
      htmlContent
    })
  }

  async sendDepositRejection(data: {
    to: string
    userName: string
    amount: number
    method: string
    reference: string
    reason: string
  }) {
    const { to, userName, amount, method, reference, reason } = data

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background: linear-gradient(135deg, #EF4444, #DC2626); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .amount { font-size: 24px; font-weight: bold; color: #EF4444; text-align: center; margin: 20px 0; }
          .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Deposit Rejected</h1>
          </div>
          <div class="content">
            <h2>Hi ${userName},</h2>
            <p>We regret to inform you that your recent deposit request has been rejected.</p>
            
            <div class="amount">$${amount.toLocaleString()}</div>
            
            <div class="details">
              <h3>Transaction Details:</h3>
              <p><strong>Amount:</strong> $${amount.toLocaleString()}</p>
              <p><strong>Method:</strong> ${method.charAt(0).toUpperCase() + method.slice(1)}</p>
              <p><strong>Reference:</strong> ${reference}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Reason:</strong> ${reason}</p>
            </div>
            
            <p>If you have any questions about this rejection or need assistance with making a deposit, please don't hesitate to contact our support team.</p>
            
            <a href="mailto:support@sahaminvest.com" class="button">Contact Support</a>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Sahem Invest. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({
      to: [{ email: to, name: userName }],
      subject: 'Deposit Request Rejected - Action Required',
      htmlContent
    })
  }

  // Deal Approval Notifications
  async sendDealPendingNotification(adminEmails: string[], dealTitle: string, partnerName: string, dealId: string) {
    const adminUrl = `${process.env.NEXTAUTH_URL}/admin/deals`
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Deal Pending Approval - Sahem Invest</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #F59E0B, #D97706); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .deal-info { background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Deal Pending Approval</h1>
          </div>
          <div class="content">
            <p>Dear Admin,</p>
            
            <p>A partner has submitted a deal that requires your approval.</p>
            
            <div class="deal-info">
              <strong>Deal Title:</strong> ${dealTitle}<br>
              <strong>Partner:</strong> ${partnerName}<br>
              <strong>Status:</strong> Pending Review<br>
              <strong>Deal ID:</strong> ${dealId}
            </div>
            
            <p>Please review the deal and approve or reject it as appropriate.</p>
            
            <a href="${adminUrl}" class="button">Review Deal</a>
            
            <p>Best regards,<br>The Sahem Invest System</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Sahem Invest. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const recipients = adminEmails.map(email => ({ email, name: 'Admin' }))

    return await this.sendEmail({
      to: recipients,
      subject: `🔔 Deal Pending Approval: ${dealTitle}`,
      htmlContent
    })
  }

  async sendDealUpdateNotification(adminEmails: string[], dealTitle: string, partnerName: string, dealId: string, changes: string[]) {
    const adminUrl = `${process.env.NEXTAUTH_URL}/admin/deals`
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Deal Updated - Requires Re-approval - Sahem Invest</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .deal-info { background: #F3E8FF; border: 1px solid #8B5CF6; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .changes { background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✏️ Deal Updated - Re-approval Required</h1>
          </div>
          <div class="content">
            <p>Dear Admin,</p>
            
            <p>A partner has updated an existing deal that requires your re-approval.</p>
            
            <div class="deal-info">
              <strong>Deal Title:</strong> ${dealTitle}<br>
              <strong>Partner:</strong> ${partnerName}<br>
              <strong>Status:</strong> Pending Re-approval<br>
              <strong>Deal ID:</strong> ${dealId}
            </div>
            
            <div class="changes">
              <strong>Changes Made:</strong><br>
              ${changes.map(change => `• ${change}`).join('<br>')}
            </div>
            
            <p>Please review the updated deal and approve or reject the changes.</p>
            
            <a href="${adminUrl}" class="button">Review Updated Deal</a>
            
            <p>Best regards,<br>The Sahem Invest System</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Sahem Invest. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const recipients = adminEmails.map(email => ({ email, name: 'Admin' }))

    return await this.sendEmail({
      to: recipients,
      subject: `✏️ Deal Updated - Re-approval Required: ${dealTitle}`,
      htmlContent
    })
  }
}

export const emailService = new EmailService()
export default emailService