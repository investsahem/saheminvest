import { Resend } from 'resend'

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
  private _resend: Resend | null = null
  private fromEmail: string
  private fromName: string
  private infoEmail: string
  private billingEmail: string
  private supportEmail: string
  private adminEmail: string

  constructor() {
    // Don't initialize Resend here - it will fail during build if API key is missing
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@notifications.saheminvest.com'
    this.infoEmail = process.env.INFO_EMAIL || 'info@sahaminvest.com'
    this.billingEmail = process.env.BILLING_EMAIL || 'billing@sahaminvest.com'
    this.supportEmail = process.env.SUPPORT_EMAIL || 'support@sahaminvest.com'
    this.adminEmail = process.env.ADMIN_EMAIL || 'admin@sahaminvest.com'
    this.fromName = 'Sahem Invest'
  }

  // Lazy-load Resend client to avoid build-time errors
  private get resend(): Resend {
    if (!this._resend) {
      const apiKey = process.env.RESEND_API_KEY
      if (!apiKey) {
        throw new Error('RESEND_API_KEY environment variable is not set')
      }
      this._resend = new Resend(apiKey)
    }
    return this._resend
  }

  async sendEmail(emailData: EmailData) {
    try {
      // Check if API key is configured
      if (!process.env.RESEND_API_KEY) {
        console.warn('⚠️ RESEND_API_KEY not configured, skipping email send')
        return {
          success: false,
          error: 'Email service not configured (RESEND_API_KEY missing)'
        }
      }

      // Extract email addresses from recipients
      const toAddresses = emailData.to.map(recipient => recipient.email)

      console.log('🚀 Sending email via Resend:', {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: toAddresses,
        subject: emailData.subject
      })

      const { data, error } = await this.resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: toAddresses,
        subject: emailData.subject,
        html: emailData.htmlContent,
        text: emailData.textContent
      })

      if (error) {
        console.error('❌ Resend API Error:', error)
        return {
          success: false,
          error: `Resend API Error: ${error.message}`,
          status: 400
        }
      }

      console.log('✅ Resend API success:', data)

      return {
        success: true,
        data: data,
        messageId: data?.id
      }
    } catch (error) {
      console.error('💥 Email service error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async sendTemplateEmail(templateId: number, to: EmailRecipient[], params: Record<string, any> = {}) {
    // Resend doesn't use template IDs the same way as Brevo
    // For now, we'll log a warning and return
    console.warn('⚠️ Template emails are not supported with Resend in the same way. Use sendEmail with HTML content.')
    return {
      success: false,
      error: 'Template emails not supported - use sendEmail with HTML content'
    }
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
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 40px; border-radius: 0 0 8px 8px; }
          .security-notice { background: #FEF3C7; border: 1px solid #F59E0B; padding: 20px; border-radius: 8px; margin: 25px 0; }
          .button { display: inline-block; background: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 25px 0; font-weight: bold; text-align: center; }
          .button:hover { background: #2563EB; }
          .token-info { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3B82F6; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .security-tips { background: #F3F4F6; padding: 20px; border-radius: 6px; margin: 20px 0; }
          @media (max-width: 600px) {
            .container { padding: 10px; }
            .header, .content { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
            <p style="font-size: 18px; margin-top: 10px;">Secure your Sahem Invest account</p>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>We received a request to reset your password for your Sahem Invest account. If you made this request, click the button below to create a new password.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" class="button">🔑 Reset My Password</a>
            </div>

            <div class="security-notice">
              <h3>⚠️ Security Notice</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li><strong>This link expires in 1 hour</strong> for your security</li>
                <li>The link can only be used once</li>
                <li>If you didn't request this, please ignore this email</li>
                <li>Your current password remains unchanged until you complete the reset</li>
              </ul>
            </div>

            <div class="token-info">
              <h3>🔍 Request Details</h3>
              <p><strong>Requested on:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Account:</strong> ${email}</p>
              <p><strong>Request ID:</strong> ${resetToken.substring(0, 8)}...</p>
            </div>

            <div class="security-tips">
              <h3>🛡️ Security Tips</h3>
              <ul style="margin: 10px 0; padding-left: 20px; font-size: 14px;">
                <li>Always use a strong, unique password for your investment account</li>
                <li>Never share your password or reset links with anyone</li>
                <li>Enable two-factor authentication when available</li>
                <li>Regularly monitor your account for suspicious activity</li>
              </ul>
            </div>

            <p style="margin-top: 30px;"><strong>Didn't request this?</strong> If you didn't request a password reset, someone may have entered your email address by mistake. You can safely ignore this email - your account remains secure.</p>
            
            <p style="font-size: 14px; color: #666;">If you're having trouble clicking the button, copy and paste this link into your browser: <br><a href="${resetUrl}" style="color: #3B82F6; word-break: break-all;">${resetUrl}</a></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Sahem Invest. All rights reserved.</p>
            <p>🏢 Secure Investment Platform | 📧 <a href="mailto:${this.supportEmail}" style="color: #3B82F6;">${this.supportEmail}</a></p>
            <p>🌐 Visit us at <a href="https://sahaminvest.com" style="color: #3B82F6;">sahaminvest.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `

    const textContent = `
Password Reset Request - Sahem Invest

Hello ${name},

We received a request to reset your password for your Sahem Invest account.

Reset your password: ${resetUrl}

SECURITY NOTICE:
- This link expires in 1 hour for your security
- The link can only be used once
- If you didn't request this, please ignore this email
- Your current password remains unchanged until you complete the reset

Request Details:
- Requested on: ${new Date().toLocaleString()}
- Account: ${email}
- Request ID: ${resetToken.substring(0, 8)}...

If you didn't request this password reset, someone may have entered your email address by mistake. You can safely ignore this email - your account remains secure.

Need help? Contact us at ${this.supportEmail}

© ${new Date().getFullYear()} Sahem Invest. All rights reserved.
Visit us at https://sahaminvest.com
    `

    return await this.sendEmail({
      to: [{ email, name }],
      subject: '🔐 Reset Your Sahem Invest Password - Action Required',
      htmlContent,
      textContent
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

  async sendWithdrawalApprovedEmail(email: string, name: string, amount: number, reference: string, method: string) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Withdrawal Approved - Sahem Invest</title>
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
            <h1>✅ Withdrawal Approved</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Good news! Your withdrawal request has been approved and processed successfully.</p>
            <div class="amount">$${amount.toLocaleString()}</div>
            <div class="details">
              <h3>Transaction Details:</h3>
              <p><strong>Reference:</strong> ${reference}</p>
              <p><strong>Method:</strong> ${method}</p>
              <p><strong>Status:</strong> Completed</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <p>The funds should reflect in your account shortly, depending on the withdrawal method chosen.</p>
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
      subject: 'Withdrawal Approved - Funds Sent',
      htmlContent
    })
  }

  async sendWithdrawalRejectedEmail(email: string, name: string, amount: number, reference: string, reason: string) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Withdrawal Rejected - Sahem Invest</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #EF4444, #DC2626); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .amount { font-size: 24px; font-weight: bold; color: #EF4444; text-align: center; margin: 20px 0; }
          .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Withdrawal Rejected</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>We're writing to inform you that your withdrawal request has been rejected.</p>
            <div class="amount">$${amount.toLocaleString()}</div>
            <div class="details">
              <h3>Transaction Details:</h3>
              <p><strong>Reference:</strong> ${reference}</p>
              <p><strong>Status:</strong> Rejected</p>
              <p><strong>Reason:</strong> ${reason}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <p>The funds have been returned to your Sahem Invest wallet. If you believe this is an error, please contact our support team.</p>
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
      subject: 'Withdrawal Request Rejected',
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

  // Admin notification for new investments
  async sendAdminNewInvestmentEmail(adminEmail: string, data: {
    investorName: string
    investorEmail: string
    amount: number
    dealTitle: string
    dealId: string
  }) {
    const { investorName, investorEmail, amount, dealTitle, dealId } = data
    const adminUrl = `${process.env.NEXTAUTH_URL}/admin/investments`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Investment - Sahem Invest Admin</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .amount { font-size: 28px; font-weight: bold; color: #8B5CF6; text-align: center; margin: 20px 0; }
          .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #8B5CF6; }
          .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 New Investment Received</h1>
          </div>
          <div class="content">
            <p>A new investment has been made on the platform.</p>
            <div class="amount">$${amount.toLocaleString()}</div>
            <div class="details">
              <h3>Investment Details:</h3>
              <p><strong>Investor:</strong> ${investorName}</p>
              <p><strong>Investor Email:</strong> ${investorEmail}</p>
              <p><strong>Deal:</strong> ${dealTitle}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <div style="text-align: center;">
              <a href="${adminUrl}" class="button">View Investments</a>
            </div>
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
      subject: `[ADMIN] New Investment: $${amount.toLocaleString()} in ${dealTitle}`,
      htmlContent
    })
  }

  // Admin notification for new deposits
  async sendAdminNewDepositEmail(adminEmail: string, data: {
    userName: string
    userEmail: string
    amount: number
    method: string
    reference: string
  }) {
    const { userName, userEmail, amount, method, reference } = data
    const adminUrl = `${process.env.NEXTAUTH_URL}/admin/transactions`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Deposit - Sahem Invest Admin</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .amount { font-size: 28px; font-weight: bold; color: #10B981; text-align: center; margin: 20px 0; }
          .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10B981; }
          .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💵 New Deposit Submitted</h1>
          </div>
          <div class="content">
            <p>A new deposit has been submitted and requires approval.</p>
            <div class="amount">$${amount.toLocaleString()}</div>
            <div class="details">
              <h3>Deposit Details:</h3>
              <p><strong>User:</strong> ${userName}</p>
              <p><strong>Email:</strong> ${userEmail}</p>
              <p><strong>Method:</strong> ${method.charAt(0).toUpperCase() + method.slice(1)}</p>
              <p><strong>Reference:</strong> ${reference}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <div style="text-align: center;">
              <a href="${adminUrl}" class="button">Review Deposit</a>
            </div>
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
      subject: `[ADMIN] New Deposit: $${amount.toLocaleString()} from ${userName}`,
      htmlContent
    })
  }

  // Admin notification for new withdrawal requests
  async sendAdminNewWithdrawalEmail(adminEmail: string, data: {
    userName: string
    userEmail: string
    amount: number
    method: string
    reference: string
  }) {
    const { userName, userEmail, amount, method, reference } = data
    const adminUrl = `${process.env.NEXTAUTH_URL}/admin/transactions`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Withdrawal Request - Sahem Invest Admin</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #F59E0B, #D97706); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .amount { font-size: 28px; font-weight: bold; color: #F59E0B; text-align: center; margin: 20px 0; }
          .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #F59E0B; }
          .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💸 New Withdrawal Request</h1>
          </div>
          <div class="content">
            <p>A new withdrawal request has been submitted and requires approval.</p>
            <div class="amount">$${amount.toLocaleString()}</div>
            <div class="details">
              <h3>Withdrawal Details:</h3>
              <p><strong>User:</strong> ${userName}</p>
              <p><strong>Email:</strong> ${userEmail}</p>
              <p><strong>Method:</strong> ${method === 'cash' ? 'Cash from Office' : 'Bank Transfer'}</p>
              <p><strong>Reference:</strong> ${reference}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <div style="text-align: center;">
              <a href="${adminUrl}" class="button">Review Withdrawal</a>
            </div>
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
      subject: `[ADMIN] Withdrawal Request: $${amount.toLocaleString()} from ${userName}`,
      htmlContent
    })
  }

  // Admin notification for profit distribution approved
  async sendAdminProfitDistributionEmail(adminEmail: string, data: {
    dealTitle: string
    totalAmount: number
    distributionType: string
    investorCount: number
    approvedBy: string
  }) {
    const { dealTitle, totalAmount, distributionType, investorCount, approvedBy } = data
    const adminUrl = `${process.env.NEXTAUTH_URL}/admin/profit-distribution-requests`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Profit Distribution Processed - Sahem Invest Admin</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .amount { font-size: 28px; font-weight: bold; color: #3B82F6; text-align: center; margin: 20px 0; }
          .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3B82F6; }
          .badge { display: inline-block; background: ${distributionType === 'FINAL' ? '#10B981' : '#F59E0B'}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
          .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Profit Distribution Processed</h1>
          </div>
          <div class="content">
            <p>A profit distribution has been approved and processed.</p>
            <div class="amount">$${totalAmount.toLocaleString()}</div>
            <div class="details">
              <h3>Distribution Details:</h3>
              <p><strong>Deal:</strong> ${dealTitle}</p>
              <p><strong>Type:</strong> <span class="badge">${distributionType}</span></p>
              <p><strong>Investors Affected:</strong> ${investorCount}</p>
              <p><strong>Approved By:</strong> ${approvedBy}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <div style="text-align: center;">
              <a href="${adminUrl}" class="button">View Distributions</a>
            </div>
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
      subject: `[ADMIN] Profit Distribution: $${totalAmount.toLocaleString()} for ${dealTitle}`,
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

  // Welcome and Onboarding Emails
  async sendWelcomeEmail(email: string, name: string, userType: 'INVESTOR' | 'PARTNER' | 'PORTFOLIO_ADVISOR') {
    const dashboardUrl = userType === 'INVESTOR' ? '/portfolio' :
      userType === 'PARTNER' ? '/partner/dashboard' :
        '/portfolio-advisor'

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Sahem Invest</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .welcome-box { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6; }
          .button { display: inline-block; background: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .features { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Sahem Invest!</h1>
            <p style="font-size: 18px; margin-top: 10px;">Your investment journey begins now</p>
          </div>
          <div class="content">
            <div class="welcome-box">
              <h2>Hello ${name}!</h2>
              <p>Welcome to Sahem Invest, the premier investment platform connecting investors with verified opportunities.</p>
              <p>Your account has been successfully created as a <strong>${userType.replace('_', ' ').toLowerCase()}</strong>.</p>
            </div>

            <div class="features">
              <h3>🚀 Get Started:</h3>
              <ul>
                ${userType === 'INVESTOR' ? `
                  <li>✅ Browse available investment opportunities</li>
                  <li>✅ Add funds to your wallet</li>
                  <li>✅ Start investing with as little as $100</li>
                  <li>✅ Track your portfolio performance</li>
                ` : userType === 'PARTNER' ? `
                  <li>✅ Create and submit investment deals</li>
                  <li>✅ Manage your deal portfolio</li>
                  <li>✅ Track investor participation</li>
                  <li>✅ Monitor deal performance</li>
                ` : `
                  <li>✅ Manage client portfolios</li>
                  <li>✅ Provide investment recommendations</li>
                  <li>✅ Track client performance</li>
                  <li>✅ Generate detailed reports</li>
                `}
              </ul>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.NEXTAUTH_URL}${dashboardUrl}" class="button">Access Your Dashboard</a>
            </div>

            <p><strong>Need help?</strong> Our support team is here to assist you at <a href="mailto:${this.supportEmail}">${this.supportEmail}</a></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Sahem Invest. All rights reserved.</p>
            <p>Visit us at <a href="https://sahaminvest.com">sahaminvest.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({
      to: [{ email, name }],
      subject: `Welcome to Sahem Invest, ${name}! 🎉`,
      htmlContent
    })
  }

  // Partner Welcome/Approval Email (Bilingual)
  async sendPartnerWelcomeEmail(email: string, name: string, password?: string) {
    const dashboardUrl = `${process.env.NEXTAUTH_URL}/partner/dashboard`
    const loginUrl = `${process.env.NEXTAUTH_URL}/auth/signin`

    const credentialsSection = password ? `
      <div style="background: #EFF6FF; border: 1px solid #3B82F6; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <h3 style="color: #1D4ED8; margin-top: 0;">🔑 بيانات تسجيل الدخول | Login Credentials</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #374151;"><strong>البريد الإلكتروني | Email:</strong></td>
            <td style="padding: 8px 0; color: #1D4ED8;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #374151;"><strong>كلمة المرور | Password:</strong></td>
            <td style="padding: 8px 0; color: #1D4ED8;">${password}</td>
          </tr>
        </table>
        <p style="margin-top: 15px; color: #92400E; font-size: 13px;">
          ⚠️ يرجى تغيير كلمة المرور بعد تسجيل الدخول الأول
          <br/>⚠️ Please change your password after first login
        </p>
      </div>
    ` : ''

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome Partner - Sahem Invest</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 40px; border-radius: 0 0 8px 8px; }
          .welcome-box { background: #D1FAE5; border: 1px solid #10B981; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center; }
          .features { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border: 1px solid #E5E7EB; }
          .button { display: inline-block; background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; font-size: 16px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .step { display: flex; align-items: flex-start; margin: 12px 0; }
          .step-number { background: #3B82F6; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0; }
          @media (max-width: 600px) {
            .container { padding: 10px; }
            .header, .content { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 مرحباً بك كشريك في ساهم إنفست</h1>
            <p style="font-size: 18px; margin-top: 10px;">Welcome as a Partner at Sahem Invest</p>
          </div>
          <div class="content">
            <h2>مرحباً ${name}! 👋</h2>

            <div class="welcome-box">
              <h3 style="color: #059669; margin: 0;">✅ تم تفعيل حسابك كشريك</h3>
              <p style="margin: 10px 0 0 0; color: #065F46;">Your partner account has been activated successfully</p>
            </div>

            <p>يسعدنا انضمامك إلى منصة ساهم إنفست كشريك معتمد. يمكنك الآن إنشاء وإدارة الصفقات الاستثمارية.</p>
            <p>We're delighted to have you join Sahem Invest as an approved partner. You can now create and manage investment deals.</p>

            ${credentialsSection}

            <div class="features">
              <h3>🚀 خطوات البدء | Getting Started</h3>
              <div style="margin: 15px 0;">
                <p><span style="background: #3B82F6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 13px; margin-right: 8px;">1</span> <strong>سجل الدخول إلى لوحة التحكم</strong> | Log in to your dashboard</p>
                <p><span style="background: #3B82F6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 13px; margin-right: 8px;">2</span> <strong>أكمل ملفك الشخصي</strong> | Complete your profile</p>
                <p><span style="background: #3B82F6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 13px; margin-right: 8px;">3</span> <strong>أنشئ أول صفقة استثمارية</strong> | Create your first investment deal</p>
                <p><span style="background: #3B82F6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 13px; margin-right: 8px;">4</span> <strong>تابع أداء صفقاتك</strong> | Track your deals performance</p>
              </div>
            </div>

            <div class="features">
              <h3>✨ مميزات حسابك | Your Account Features</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>📊 لوحة تحكم شاملة | Comprehensive dashboard</li>
                <li>💼 إنشاء وإدارة الصفقات | Create & manage deals</li>
                <li>👥 متابعة المستثمرين | Track investors</li>
                <li>📈 تحليلات الأداء | Performance analytics</li>
                <li>💰 إدارة توزيع الأرباح | Profit distribution management</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${dashboardUrl}" class="button">🚀 الدخول إلى لوحة التحكم | Go to Dashboard</a>
            </div>

            <p><strong>تحتاج مساعدة؟</strong> تواصل مع فريق الدعم على <a href="mailto:${this.supportEmail}">${this.supportEmail}</a></p>
            <p><strong>Need help?</strong> Contact our support team at <a href="mailto:${this.supportEmail}">${this.supportEmail}</a></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Sahem Invest. All rights reserved.</p>
            <p>Visit us at <a href="https://sahaminvest.com">sahaminvest.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({
      to: [{ email, name }],
      subject: '🎉 مرحباً بك كشريك في ساهم إنفست | Welcome Partner - Sahem Invest',
      htmlContent
    })
  }

  // Deal Approved Email (Bilingual)
  async sendDealApprovedEmail(email: string, name: string, dealTitle: string, dealId: string) {
    const dashboardUrl = `${process.env.NEXTAUTH_URL}/partner/deals/${dealId}/manage`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Deal Approved - Sahem Invest</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 40px; border-radius: 0 0 8px 8px; }
          .status-box { background: #D1FAE5; border: 1px solid #10B981; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center; }
          .deal-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #E5E7EB; }
          .button { display: inline-block; background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; font-size: 16px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ تمت الموافقة على صفقتك</h1>
            <p style="font-size: 18px; margin-top: 10px;">Your Deal Has Been Approved</p>
          </div>
          <div class="content">
            <h2>مرحباً ${name}! 👋</h2>

            <div class="status-box">
              <h3 style="color: #059669; margin: 0;">✅ تمت الموافقة على صفقتك وهي الآن نشطة</h3>
              <p style="margin: 10px 0 0 0; color: #065F46;">Your deal has been approved and is now active</p>
            </div>

            <div class="deal-info">
              <h3>📋 تفاصيل الصفقة | Deal Details</h3>
              <p><strong>اسم الصفقة | Deal Name:</strong> ${dealTitle}</p>
              <p><strong>الحالة | Status:</strong> <span style="color: #059669; font-weight: bold;">نشطة | Active ✅</span></p>
            </div>

            <p>يمكن للمستثمرين الآن الاطلاع على صفقتك والاستثمار فيها.</p>
            <p>Investors can now view and invest in your deal.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${dashboardUrl}" class="button">📊 إدارة الصفقة | Manage Deal</a>
            </div>

            <p><strong>تحتاج مساعدة؟</strong> تواصل مع فريق الدعم على <a href="mailto:${this.supportEmail}">${this.supportEmail}</a></p>
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
      subject: `✅ تمت الموافقة على صفقتك: ${dealTitle} | Deal Approved - Sahem Invest`,
      htmlContent
    })
  }

  // Deal Rejected Email (Bilingual)
  async sendDealRejectedEmail(email: string, name: string, dealTitle: string, reason?: string) {
    const dashboardUrl = `${process.env.NEXTAUTH_URL}/partner/deals`

    const reasonSection = reason ? `
      <div style="background: #FEF2F2; border: 1px solid #EF4444; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #DC2626; margin-top: 0;">📝 سبب الرفض | Rejection Reason</h3>
        <p style="color: #7F1D1D;">${reason}</p>
      </div>
    ` : ''

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Deal Rejected - Sahem Invest</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #EF4444, #DC2626); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 40px; border-radius: 0 0 8px 8px; }
          .status-box { background: #FEF2F2; border: 1px solid #EF4444; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center; }
          .deal-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #E5E7EB; }
          .button { display: inline-block; background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; font-size: 16px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ تم رفض صفقتك</h1>
            <p style="font-size: 18px; margin-top: 10px;">Your Deal Has Been Rejected</p>
          </div>
          <div class="content">
            <h2>مرحباً ${name}! 👋</h2>

            <div class="status-box">
              <h3 style="color: #DC2626; margin: 0;">❌ لم تتم الموافقة على صفقتك</h3>
              <p style="margin: 10px 0 0 0; color: #7F1D1D;">Your deal was not approved</p>
            </div>

            <div class="deal-info">
              <h3>📋 تفاصيل الصفقة | Deal Details</h3>
              <p><strong>اسم الصفقة | Deal Name:</strong> ${dealTitle}</p>
              <p><strong>الحالة | Status:</strong> <span style="color: #DC2626; font-weight: bold;">مرفوضة | Rejected ❌</span></p>
            </div>

            ${reasonSection}

            <p>يمكنك تعديل الصفقة وإعادة تقديمها للمراجعة.</p>
            <p>You can edit the deal and resubmit it for review.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${dashboardUrl}" class="button">📝 تعديل الصفقة | Edit Deal</a>
            </div>

            <p><strong>تحتاج مساعدة؟</strong> تواصل مع فريق الدعم على <a href="mailto:${this.supportEmail}">${this.supportEmail}</a></p>
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
      subject: `❌ تم رفض صفقتك: ${dealTitle} | Deal Rejected - Sahem Invest`,
      htmlContent
    })
  }

  // Account Verification Email
  async sendAccountVerificationEmail(email: string, name: string, verificationUrl: string) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Account - Sahem Invest</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .verification-box { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid #10B981; }
          .button { display: inline-block; background: #10B981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Verify Your Account</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Thank you for registering with Sahem Invest! To complete your account setup and start investing, please verify your email address.</p>
            
            <div class="verification-box">
              <h3>✅ One Click Verification</h3>
              <p>Click the button below to verify your email and activate your account:</p>
              <a href="${verificationUrl}" class="button">Verify My Account</a>
            </div>

            <p><strong>Important:</strong> This verification link will expire in 24 hours for security reasons.</p>
            <p>If you didn't create an account with Sahem Invest, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Sahem Invest. All rights reserved.</p>
            <p>Need help? Contact us at <a href="mailto:${this.supportEmail}">${this.supportEmail}</a></p>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({
      to: [{ email, name }],
      subject: 'Verify Your Sahem Invest Account 🔐',
      htmlContent
    })
  }

  // KYC Status Notifications
  async sendKYCStatusEmail(email: string, name: string, status: 'APPROVED' | 'REJECTED' | 'PENDING', reason?: string) {
    const statusConfig = {
      APPROVED: {
        color: '#10B981',
        icon: '✅',
        title: 'KYC Approved',
        message: 'Congratulations! Your KYC verification has been approved. You can now access all platform features.'
      },
      REJECTED: {
        color: '#EF4444',
        icon: '❌',
        title: 'KYC Rejected',
        message: 'Your KYC verification has been rejected. Please review the reason below and resubmit your documents.'
      },
      PENDING: {
        color: '#F59E0B',
        icon: '⏳',
        title: 'KYC Under Review',
        message: 'Your KYC documents are being reviewed by our team. We\'ll notify you once the review is complete.'
      }
    }

    const config = statusConfig[status]

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${config.title} - Sahem Invest</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${config.color}; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .status-box { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${config.color}; }
          .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${config.icon} ${config.title}</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            
            <div class="status-box">
              <p>${config.message}</p>
              ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
              ${status === 'REJECTED' ? `
                <p><strong>Next Steps:</strong></p>
                <ul>
                  <li>Review the rejection reason above</li>
                  <li>Prepare updated documents</li>
                  <li>Resubmit your KYC verification</li>
                </ul>
              ` : ''}
            </div>

            ${status === 'APPROVED' ? `
              <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL}/portfolio" class="button">Access Your Dashboard</a>
              </div>
            ` : status === 'REJECTED' ? `
              <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL}/portfolio/settings" class="button">Resubmit KYC</a>
              </div>
            ` : ''}
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Sahem Invest. All rights reserved.</p>
            <p>Questions? Contact us at <a href="mailto:${this.supportEmail}">${this.supportEmail}</a></p>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({
      to: [{ email, name }],
      subject: `${config.title} - Sahem Invest`,
      htmlContent
    })
  }

  // Deal Status Notifications for Partners
  async sendDealStatusEmail(email: string, partnerName: string, dealTitle: string, status: 'APPROVED' | 'REJECTED', reason?: string) {
    const statusConfig = {
      APPROVED: {
        color: '#10B981',
        icon: '🎉',
        title: 'Deal Approved',
        message: 'Great news! Your deal has been approved and is now live for investors.'
      },
      REJECTED: {
        color: '#EF4444',
        icon: '❌',
        title: 'Deal Rejected',
        message: 'Your deal submission has been rejected. Please review the feedback and resubmit.'
      }
    }

    const config = statusConfig[status]

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${config.title} - ${dealTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${config.color}; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .deal-box { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${config.color}; }
          .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${config.icon} ${config.title}</h1>
          </div>
          <div class="content">
            <h2>Hello ${partnerName},</h2>
            
            <div class="deal-box">
              <h3>📋 Deal: ${dealTitle}</h3>
              <p>${config.message}</p>
              ${reason ? `<p><strong>Admin Feedback:</strong> ${reason}</p>` : ''}
            </div>

            <div style="text-align: center;">
              <a href="${process.env.NEXTAUTH_URL}/partner/deals" class="button">View My Deals</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Sahem Invest. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({
      to: [{ email, name: partnerName }],
      subject: `${config.title}: ${dealTitle}`,
      htmlContent
    })
  }

  // Monthly Portfolio Report
  async sendMonthlyPortfolioReport(email: string, name: string, reportData: {
    totalInvestments: number
    totalReturns: number
    portfolioValue: number
    monthlyGrowth: number
    activeDeals: number
  }) {
    const { totalInvestments, totalReturns, portfolioValue, monthlyGrowth, activeDeals } = reportData

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Monthly Portfolio Report - Sahem Invest</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .stat-box { background: white; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #8B5CF6; }
          .stat-value { font-size: 24px; font-weight: bold; color: #8B5CF6; }
          .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Monthly Portfolio Report</h1>
            <p>${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Here's your portfolio performance summary for this month:</p>
            
            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-value">$${portfolioValue.toLocaleString()}</div>
                <div>Portfolio Value</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${monthlyGrowth >= 0 ? '+' : ''}${monthlyGrowth.toFixed(1)}%</div>
                <div>Monthly Growth</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">$${totalReturns.toLocaleString()}</div>
                <div>Total Returns</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${activeDeals}</div>
                <div>Active Deals</div>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.NEXTAUTH_URL}/portfolio/analytics" class="button">View Detailed Analytics</a>
            </div>
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
      subject: `📊 Your Monthly Portfolio Report - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      htmlContent
    })
  }

  // Security Alert Emails
  async sendSecurityAlertEmail(email: string, name: string, alertType: 'LOGIN' | 'PASSWORD_CHANGE' | 'SUSPICIOUS_ACTIVITY', details: string) {
    const alertConfig = {
      LOGIN: {
        icon: '🔐',
        title: 'New Login Detected',
        message: 'A new login to your account has been detected.'
      },
      PASSWORD_CHANGE: {
        icon: '🔑',
        title: 'Password Changed',
        message: 'Your account password has been successfully changed.'
      },
      SUSPICIOUS_ACTIVITY: {
        icon: '⚠️',
        title: 'Suspicious Activity Alert',
        message: 'We detected unusual activity on your account.'
      }
    }

    const config = alertConfig[alertType]

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Security Alert - ${config.title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #EF4444, #DC2626); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .alert-box { background: #FEF2F2; border: 1px solid #EF4444; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background: #EF4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${config.icon} Security Alert</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            
            <div class="alert-box">
              <h3>${config.title}</h3>
              <p>${config.message}</p>
              <p><strong>Details:</strong> ${details}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <p>If this was you, no action is needed. If you didn't authorize this activity, please secure your account immediately.</p>

            <div style="text-align: center;">
              <a href="${process.env.NEXTAUTH_URL}/portfolio/settings" class="button">Secure My Account</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Sahem Invest. All rights reserved.</p>
            <p>Security concerns? Contact us immediately at <a href="mailto:${this.supportEmail}">${this.supportEmail}</a></p>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({
      to: [{ email, name }],
      subject: `🚨 Security Alert: ${config.title}`,
      htmlContent
    })
  }

  // Billing and Invoice Emails (using billing@sahaminvest.com as sender)
  async sendInvoiceEmail(email: string, name: string, invoiceData: {
    invoiceNumber: string
    amount: number
    description: string
    dueDate: string
    downloadUrl: string
  }) {
    const { invoiceNumber, amount, description, dueDate, downloadUrl } = invoiceData

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${invoiceNumber} - Sahem Invest</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .invoice-box { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
          .amount { font-size: 28px; font-weight: bold; color: #3B82F6; text-align: center; margin: 20px 0; }
          .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📄 Invoice ${invoiceNumber}</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            
            <div class="invoice-box">
              <h3>Invoice Details</h3>
              <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
              <p><strong>Description:</strong> ${description}</p>
              <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
              
              <div class="amount">$${amount.toLocaleString()}</div>
            </div>

            <div style="text-align: center;">
              <a href="${downloadUrl}" class="button">Download Invoice</a>
            </div>

            <p>If you have any questions about this invoice, please contact our billing team.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Sahem Invest. All rights reserved.</p>
            <p>Billing questions? Contact <a href="mailto:${this.billingEmail}">${this.billingEmail}</a></p>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({
      to: [{ email, name }],
      subject: `Invoice ${invoiceNumber} - Sahem Invest`,
      htmlContent
    })
  }

  // System Maintenance Notifications
  async sendMaintenanceNotificationEmail(recipients: string[], maintenanceData: {
    startTime: string
    endTime: string
    description: string
    affectedServices: string[]
  }) {
    const { startTime, endTime, description, affectedServices } = maintenanceData

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Scheduled Maintenance - Sahem Invest</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #F59E0B, #D97706); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .maintenance-box { background: #FEF3C7; border: 1px solid #F59E0B; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .services-list { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔧 Scheduled Maintenance</h1>
          </div>
          <div class="content">
            <h2>Important Notice</h2>
            
            <div class="maintenance-box">
              <h3>⏰ Maintenance Schedule</h3>
              <p><strong>Start:</strong> ${new Date(startTime).toLocaleString()}</p>
              <p><strong>End:</strong> ${new Date(endTime).toLocaleString()}</p>
              <p><strong>Duration:</strong> Approximately ${Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60))} hours</p>
            </div>

            <p><strong>Description:</strong> ${description}</p>

            <div class="services-list">
              <h3>🔧 Affected Services:</h3>
              <ul>
                ${affectedServices.map(service => `<li>${service}</li>`).join('')}
              </ul>
            </div>

            <p>We apologize for any inconvenience and appreciate your patience during this maintenance window.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Sahem Invest. All rights reserved.</p>
            <p>Questions? Contact <a href="mailto:${this.supportEmail}">${this.supportEmail}</a></p>
          </div>
        </div>
      </body>
      </html>
    `

    const recipientList = recipients.map(email => ({ email, name: 'User' }))

    return await this.sendEmail({
      to: recipientList,
      subject: '🔧 Scheduled Maintenance Notification - Sahem Invest',
      htmlContent
    })
  }

  // Admin notification for NEW profit distribution request (when partner submits)
  async sendAdminNewDistributionRequestEmail(adminEmail: string, data: {
    dealTitle: string
    partnerName: string
    partnerEmail: string
    totalAmount: number
    distributionType: string
    estimatedGainPercent: number
    requestId: string
  }) {
    const { dealTitle, partnerName, partnerEmail, totalAmount, distributionType, estimatedGainPercent, requestId } = data
    const adminUrl = `${process.env.NEXTAUTH_URL}/admin/profit-distributions`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Profit Distribution Request - Sahem Invest Admin</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #F59E0B, #D97706); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .amount { font-size: 28px; font-weight: bold; color: #F59E0B; text-align: center; margin: 20px 0; }
          .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #F59E0B; }
          .badge { display: inline-block; background: ${distributionType === 'FINAL' ? '#10B981' : '#8B5CF6'}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
          .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 New Distribution Request</h1>
          </div>
          <div class="content">
            <p>A partner has submitted a new profit distribution request that requires your approval.</p>
            <div class="amount">$${totalAmount.toLocaleString()}</div>
            <div class="details">
              <h3>Request Details:</h3>
              <p><strong>Deal:</strong> ${dealTitle}</p>
              <p><strong>Partner:</strong> ${partnerName}</p>
              <p><strong>Partner Email:</strong> ${partnerEmail}</p>
              <p><strong>Type:</strong> <span class="badge">${distributionType}</span></p>
              <p><strong>Estimated Gain:</strong> ${estimatedGainPercent}%</p>
              <p><strong>Request ID:</strong> ${requestId}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <div style="text-align: center;">
              <a href="${adminUrl}" class="button">Review Request</a>
            </div>
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
      subject: `[ADMIN] New Distribution Request: ${dealTitle} - ${distributionType}`,
      htmlContent
    })
  }

  // Partner notification when their distribution request is approved
  async sendPartnerDistributionApprovedEmail(email: string, partnerName: string, data: {
    dealTitle: string
    totalAmount: number
    distributionType: string
    investorCount: number
    profitDistributed: number
    capitalReturned: number
  }) {
    const { dealTitle, totalAmount, distributionType, investorCount, profitDistributed, capitalReturned } = data
    const partnerUrl = `${process.env.NEXTAUTH_URL}/partner/profit-distributions`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Distribution Approved - Sahem Invest</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .amount { font-size: 28px; font-weight: bold; color: #10B981; text-align: center; margin: 20px 0; }
          .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10B981; }
          .badge { display: inline-block; background: ${distributionType === 'FINAL' ? '#10B981' : '#8B5CF6'}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
          .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Distribution Approved!</h1>
          </div>
          <div class="content">
            <h2>Hello ${partnerName},</h2>
            <p>Great news! Your profit distribution request has been approved and processed.</p>
            <div class="amount">$${totalAmount.toLocaleString()}</div>
            <div class="details">
              <h3>Distribution Details:</h3>
              <p><strong>Deal:</strong> ${dealTitle}</p>
              <p><strong>Type:</strong> <span class="badge">${distributionType}</span></p>
              <p><strong>Total Amount:</strong> $${totalAmount.toLocaleString()}</p>
              ${profitDistributed > 0 ? `<p><strong>Profit Distributed:</strong> $${profitDistributed.toLocaleString()}</p>` : ''}
              ${capitalReturned > 0 ? `<p><strong>Capital Returned:</strong> $${capitalReturned.toLocaleString()}</p>` : ''}
              <p><strong>Investors Affected:</strong> ${investorCount}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p>All investors have been notified and their wallets have been updated accordingly.</p>
            <div style="text-align: center;">
              <a href="${partnerUrl}" class="button">View Distributions</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Sahem Invest. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({
      to: [{ email, name: partnerName }],
      subject: `✅ Distribution Approved: ${dealTitle}`,
      htmlContent
    })
  }

  // Investor notification when they receive a profit distribution
  async sendInvestorDistributionEmail(email: string, investorName: string, data: {
    dealTitle: string
    distributionType: string
    profitAmount: number
    capitalAmount: number
    totalAmount: number
    profitRate: number
    newWalletBalance: number
  }) {
    const { dealTitle, distributionType, profitAmount, capitalAmount, totalAmount, profitRate, newWalletBalance } = data
    const portfolioUrl = `${process.env.NEXTAUTH_URL}/portfolio/wallet`
    const isPartial = distributionType === 'PARTIAL'

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="utf-8">
        <title>${isPartial ? 'استرداد رأس المال' : 'توزيع الأرباح'} - ساهم إنفست</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.8; color: #333; direction: rtl; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, ${isPartial ? '#8B5CF6, #7C3AED' : '#10B981, #059669'}); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .amount { font-size: 32px; font-weight: bold; color: ${isPartial ? '#8B5CF6' : '#10B981'}; text-align: center; margin: 20px 0; }
          .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-right: 4px solid ${isPartial ? '#8B5CF6' : '#10B981'}; }
          .badge { display: inline-block; background: ${isPartial ? '#8B5CF6' : '#10B981'}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
          .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .balance { background: #DBEAFE; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isPartial ? '💰 استرداد رأس المال' : '🎉 توزيع الأرباح'}</h1>
          </div>
          <div class="content">
            <h2>مرحباً ${investorName}،</h2>
            <p>${isPartial ? 'تم إرجاع جزء من رأس المال المستثمر إلى محفظتك.' : 'تهانينا! تم توزيع الأرباح من استثمارك.'}</p>
            <div class="amount">+$${totalAmount.toLocaleString()}</div>
            <div class="details">
              <h3>تفاصيل التوزيع:</h3>
              <p><strong>الصفقة:</strong> ${dealTitle}</p>
              <p><strong>النوع:</strong> <span class="badge">${isPartial ? 'توزيع جزئي' : 'توزيع نهائي'}</span></p>
              ${capitalAmount > 0 ? `<p><strong>رأس المال المسترد:</strong> $${capitalAmount.toLocaleString()}</p>` : ''}
              ${profitAmount > 0 ? `<p><strong>الأرباح:</strong> $${profitAmount.toLocaleString()}</p>` : ''}
              ${profitRate > 0 ? `<p><strong>نسبة الربح:</strong> ${profitRate.toFixed(1)}%</p>` : ''}
              <p><strong>التاريخ:</strong> ${new Date().toLocaleDateString('ar-SA')}</p>
            </div>
            <div class="balance">
              <p><strong>رصيد المحفظة الجديد:</strong></p>
              <p style="font-size: 24px; font-weight: bold; color: #3B82F6;">$${newWalletBalance.toLocaleString()}</p>
            </div>
            <div style="text-align: center;">
              <a href="${portfolioUrl}" class="button">عرض المحفظة</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ساهم إنفست. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({
      to: [{ email, name: investorName }],
      subject: isPartial ? `💰 استرداد رأس المال - ${dealTitle}` : `🎉 توزيع الأرباح - ${dealTitle}`,
      htmlContent
    })
  }

  // Application Rejection Email
  async sendApplicationRejectionEmail(data: {
    to: string
    applicantName: string
    rejectionReason: string
  }) {
    const { to, applicantName, rejectionReason } = data

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; }
          .header { background: linear-gradient(135deg, #EF4444, #DC2626); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .content h2 { color: #1a1a1a; }
          .content p { color: #333; line-height: 1.8; font-size: 15px; }
          .reason-box { background: #FEF2F2; border: 1px solid #FECACA; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .reason-box h3 { color: #991B1B; margin-top: 0; }
          .reason-box p { color: #7F1D1D; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #E5E7EB; }
          .button { display: inline-block; background: #2563EB; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #999; font-size: 13px; }
          .divider { border: none; border-top: 1px solid #E5E7EB; margin: 30px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ تم رفض الطلب</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">Application Rejected</p>
          </div>
          <div class="content">
            <h2>مرحباً ${applicantName}،</h2>
            <p>نأسف لإبلاغك بأنه تم مراجعة طلبك للانضمام إلى منصة سهم للاستثمار، وللأسف لم تتم الموافقة عليه في هذا الوقت.</p>
            
            <div class="reason-box">
              <h3>📋 سبب الرفض:</h3>
              <p>${rejectionReason}</p>
            </div>
            
            <div class="info-box">
              <h3>ماذا يمكنك فعله؟</h3>
              <ul style="color: #333; line-height: 2;">
                <li>مراجعة سبب الرفض أعلاه وتصحيح أي معلومات ناقصة</li>
                <li>التواصل مع فريق الدعم للحصول على مزيد من التوضيح</li>
                <li>إعادة تقديم طلبك بعد استيفاء المتطلبات</li>
              </ul>
            </div>

            <hr class="divider">

            <p style="color: #666; font-size: 13px;">
              <strong>Dear ${applicantName},</strong><br>
              We regret to inform you that your application to join Sahem Invest has been reviewed and unfortunately was not approved at this time.<br>
              <strong>Reason:</strong> ${rejectionReason}<br>
              If you have any questions, please don't hesitate to contact our support team.
            </p>

            <div style="text-align: center;">
              <a href="mailto:support@sahaminvest.com" class="button">📧 تواصل مع الدعم</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Sahem Invest - سهم للاستثمار. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({
      to: [{ email: to, name: applicantName }],
      subject: '❌ تم رفض طلبك - سهم للاستثمار | Application Rejected - Sahem Invest',
      htmlContent
    })
  }

  // Password Changed Confirmation Email
  async sendPasswordChangedEmail(email: string, name: string) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Changed - Sahem Invest</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 40px; border-radius: 0 0 8px 8px; }
          .security-notice { background: #FEF3C7; border: 1px solid #F59E0B; padding: 20px; border-radius: 8px; margin: 25px 0; }
          .success-box { background: #D1FAE5; border: 1px solid #10B981; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          @media (max-width: 600px) {
            .container { padding: 10px; }
            .header, .content { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 تم تغيير كلمة المرور</h1>
            <p style="font-size: 18px; margin-top: 10px;">Password Changed Successfully</p>
          </div>
          <div class="content">
            <h2>مرحباً ${name},</h2>

            <div class="success-box">
              <h3 style="color: #059669; margin: 0;">✅ تم تغيير كلمة المرور بنجاح</h3>
              <p style="margin: 10px 0 0 0; color: #065F46;">Your password has been changed successfully</p>
            </div>

            <p>تم تغيير كلمة مرور حسابك في سهم للاستثمار بنجاح.</p>
            <p>Your Sahem Invest account password has been successfully changed.</p>

            <div class="security-notice">
              <h3>⚠️ تنبيه أمني | Security Notice</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li><strong>التاريخ والوقت:</strong> ${new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' })}</li>
                <li><strong>Date & Time:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Riyadh' })}</li>
                <li><strong>الحساب:</strong> ${email}</li>
              </ul>
              <p style="margin-top: 15px; color: #92400E;">
                إذا لم تقم بهذا التغيير، يرجى التواصل مع فريق الدعم فوراً.
                <br/>If you did not make this change, please contact our support team immediately.
              </p>
            </div>

            <p><strong>تحتاج مساعدة؟</strong> تواصل مع فريق الدعم على <a href="mailto:${this.supportEmail}">${this.supportEmail}</a></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Sahem Invest. All rights reserved.</p>
            <p>Visit us at <a href="https://sahaminvest.com">sahaminvest.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `

    return await this.sendEmail({
      to: [{ email, name }],
      subject: '🔐 تم تغيير كلمة المرور بنجاح | Password Changed - Sahem Invest',
      htmlContent
    })
  }
}


export const emailService = new EmailService()
export default emailService