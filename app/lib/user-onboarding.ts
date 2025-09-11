import bcrypt from 'bcryptjs'
import { prisma } from './db'
import { emailService } from './email'

interface CreateUserData {
  email: string
  name: string
  phone?: string
  role: 'INVESTOR' | 'PARTNER'
  applicationId: string
  applicationType: 'investor' | 'partner'
}

interface WelcomeEmailData {
  name: string
  email: string
  temporaryPassword: string
  role: string
  loginUrl: string
}

// Generate a secure temporary password
export function generateTemporaryPassword(): string {
  const length = 12
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  
  // Ensure at least one of each type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
  password += '0123456789'[Math.floor(Math.random() * 10)]
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

// Create user account and send welcome email
export async function createUserFromApplication(data: CreateUserData): Promise<{ success: boolean; error?: string; user?: any }> {
  try {
    console.log('🚀 Creating user from application:', data)
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })
    
    if (existingUser) {
      console.log('❌ User already exists:', data.email)
      return { success: false, error: 'User already exists' }
    }
    
    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword()
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10)
    
    console.log('🔐 Generated temporary password for:', data.email)
    
    // Create user account
    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        phone: data.phone,
        password: hashedPassword,
        role: data.role,
        emailVerified: new Date(), // Auto-verify since admin approved
        isActive: true,
        needsPasswordChange: true, // Flag to force password change on first login
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    
    console.log('✅ User created successfully:', newUser.id)
    
    // Send welcome email with login credentials
    const emailResult = await sendWelcomeEmail({
      name: data.name,
      email: data.email,
      temporaryPassword,
      role: data.role,
      loginUrl: process.env.NEXTAUTH_URL + '/auth/signin'
    })
    
    if (!emailResult.success) {
      console.error('❌ Failed to send welcome email:', emailResult.error)
      // Don't fail the user creation if email fails, just log it
    }
    
    return { success: true, user: newUser }
    
  } catch (error) {
    console.error('❌ Error creating user from application:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create user account' 
    }
  }
}

// Send welcome email with login credentials
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('📧 Sending welcome email to:', data.email)
    
    const roleDisplayName = data.role === 'INVESTOR' ? 'Investor' : 'Partner'
    const dashboardUrl = data.role === 'INVESTOR' ? '/portfolio' : '/partner'
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Sahem Invest</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #6be2c9 0%, #23a1ff 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .content { padding: 30px; }
        .credentials-box { background: #f1f5f9; border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .credential-item { margin: 10px 0; }
        .credential-label { font-weight: 600; color: #475569; }
        .credential-value { font-family: 'Courier New', monospace; background: #1e293b; color: #6be2c9; padding: 8px 12px; border-radius: 4px; font-size: 14px; margin-top: 5px; }
        .button { display: inline-block; background: linear-gradient(135deg, #6be2c9 0%, #55e6a5 100%); color: #0b1020; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .warning { background: #fef3cd; border: 1px solid #fbbf24; color: #92400e; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to Sahem Invest!</h1>
            <p>Your ${roleDisplayName} application has been approved</p>
        </div>
        
        <div class="content">
            <h2>Hello ${data.name},</h2>
            
            <p>Congratulations! Your ${roleDisplayName.toLowerCase()} application has been approved by our admin team. We're excited to have you join the Sahem Invest platform.</p>
            
            <div class="credentials-box">
                <h3>🔐 Your Login Credentials</h3>
                <div class="credential-item">
                    <div class="credential-label">Email Address:</div>
                    <div class="credential-value">${data.email}</div>
                </div>
                <div class="credential-item">
                    <div class="credential-label">Temporary Password:</div>
                    <div class="credential-value">${data.temporaryPassword}</div>
                </div>
            </div>
            
            <div class="warning">
                <strong>⚠️ Important Security Notice:</strong><br>
                This is a temporary password. You will be required to change it when you first log in. Please keep this email secure and delete it after setting your new password.
            </div>
            
            <p>
                <a href="${data.loginUrl}" class="button">Login to Your Account</a>
            </p>
            
            <h3>What's Next?</h3>
            <ol>
                <li><strong>Login:</strong> Click the button above or visit <a href="${data.loginUrl}">${data.loginUrl}</a></li>
                <li><strong>Set New Password:</strong> You'll be prompted to create a secure password</li>
                <li><strong>Complete Profile:</strong> Fill out any remaining profile information</li>
                <li><strong>Start ${data.role === 'INVESTOR' ? 'Investing' : 'Managing Deals'}:</strong> Access your dashboard at ${dashboardUrl}</li>
            </ol>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team at <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a>.</p>
            
            <p>Welcome aboard!</p>
            <p><strong>The Sahem Invest Team</strong></p>
        </div>
        
        <div class="footer">
            <p>© 2025 Sahem Invest. All rights reserved.</p>
            <p>This email contains sensitive login information. Please keep it secure.</p>
        </div>
    </div>
</body>
</html>
    `
    
    const textContent = `
Welcome to Sahem Invest!

Hello ${data.name},

Congratulations! Your ${roleDisplayName.toLowerCase()} application has been approved.

Your Login Credentials:
- Email: ${data.email}
- Temporary Password: ${data.temporaryPassword}

IMPORTANT: This is a temporary password. You will be required to change it when you first log in.

Login here: ${data.loginUrl}

What's Next:
1. Login with the credentials above
2. Set a new secure password
3. Complete your profile
4. Start ${data.role === 'INVESTOR' ? 'investing' : 'managing deals'}

If you need help, contact us at ${process.env.SUPPORT_EMAIL}

Welcome aboard!
The Sahem Invest Team
    `
    
    const result = await emailService.sendEmail({
      to: [{ email: data.email, name: data.name }],
      subject: `🎉 Welcome to Sahem Invest - Your ${roleDisplayName} Account is Ready!`,
      htmlContent: htmlContent,
      textContent: textContent
    })
    
    if (result.success) {
      console.log('✅ Welcome email sent successfully to:', data.email)
    } else {
      console.error('❌ Failed to send welcome email:', result.error)
    }
    
    return result
    
  } catch (error) {
    console.error('❌ Error sending welcome email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send welcome email' 
    }
  }
}

// Update user schema to include needsPasswordChange flag (to be added to Prisma schema)
export interface UserWithPasswordChange {
  id: string
  email: string
  name: string
  role: string
  needsPasswordChange: boolean
  // ... other user fields
}
