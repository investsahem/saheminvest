import { emailService } from './email'
import { prisma } from './db'

/**
 * Email Trigger System for Sahem Invest
 * Handles automatic email notifications for various user actions
 */

export class EmailTriggers {
  // User Registration and Onboarding
  static async onUserRegistration(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          role: true
        }
      })

      if (!user) return

      // Send welcome email
      await emailService.sendWelcomeEmail(
        user.email,
        user.name || 'User',
        user.role as 'INVESTOR' | 'PARTNER' | 'PORTFOLIO_ADVISOR'
      )

      console.log(`Welcome email sent to ${user.email}`)
    } catch (error) {
      console.error('Error sending welcome email:', error)
    }
  }

  // Deposit Notifications
  static async onDepositApproved(depositId: string) {
    try {
      const deposit = await prisma.deposit.findUnique({
        where: { id: depositId },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })

      if (!deposit) return

      // Get updated wallet balance
      const wallet = await prisma.wallet.findUnique({
        where: { userId: deposit.userId },
        select: { balance: true }
      })

      await emailService.sendDepositApprovedEmail(
        deposit.user.email,
        deposit.user.name || 'User',
        Number(deposit.amount),
        deposit.reference || deposit.id,
        Number(wallet?.balance || 0)
      )

      console.log(`Deposit approval email sent to ${deposit.user.email}`)
    } catch (error) {
      console.error('Error sending deposit approval email:', error)
    }
  }

  static async onDepositRejected(depositId: string, reason: string) {
    try {
      const deposit = await prisma.deposit.findUnique({
        where: { id: depositId },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })

      if (!deposit) return

      await emailService.sendDepositRejection({
        to: deposit.user.email,
        userName: deposit.user.name || 'User',
        amount: Number(deposit.amount),
        method: deposit.method,
        reference: deposit.reference || deposit.id,
        reason
      })

      console.log(`Deposit rejection email sent to ${deposit.user.email}`)
    } catch (error) {
      console.error('Error sending deposit rejection email:', error)
    }
  }

  // Investment Notifications
  static async onInvestmentMade(investmentId: string) {
    try {
      const investment = await prisma.investment.findUnique({
        where: { id: investmentId },
        include: {
          investor: {
            select: {
              name: true,
              email: true
            }
          },
          project: {
            select: {
              title: true,
              owner: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      })

      if (!investment) return

      // Send confirmation to investor
      await emailService.sendInvestmentConfirmationEmail(
        investment.investor.email,
        investment.investor.name || 'User',
        Number(investment.amount),
        investment.project.title,
        investment.id
      )

      // Notify partner about new investment
      await emailService.sendEmail({
        to: [{ email: investment.project.owner.email, name: investment.project.owner.name || 'Partner' }],
        subject: `New Investment in ${investment.project.title}`,
        htmlContent: `
          <h2>New Investment Received!</h2>
          <p>Your deal "${investment.project.title}" has received a new investment of $${Number(investment.amount).toLocaleString()}.</p>
          <p><a href="${process.env.NEXTAUTH_URL}/partner/deals">View your deals</a></p>
        `
      })

      console.log(`Investment confirmation emails sent for investment ${investmentId}`)
    } catch (error) {
      console.error('Error sending investment confirmation emails:', error)
    }
  }

  // Deal Status Notifications
  static async onDealSubmitted(dealId: string) {
    try {
      const deal = await prisma.project.findUnique({
        where: { id: dealId },
        include: {
          owner: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })

      if (!deal) return

      // Get admin emails
      const admins = await prisma.user.findMany({
        where: {
          OR: [
            { role: 'ADMIN' },
            { role: 'DEAL_MANAGER' }
          ]
        },
        select: { email: true }
      })

      const adminEmails = admins.map(admin => admin.email)

      // Notify admins
      await emailService.sendDealPendingNotification(
        adminEmails,
        deal.title,
        deal.owner.name || 'Partner',
        deal.id
      )

      console.log(`Deal submission notification sent to admins for deal ${dealId}`)
    } catch (error) {
      console.error('Error sending deal submission notification:', error)
    }
  }

  static async onDealApproved(dealId: string) {
    try {
      const deal = await prisma.project.findUnique({
        where: { id: dealId },
        include: {
          owner: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })

      if (!deal) return

      await emailService.sendDealStatusEmail(
        deal.owner.email,
        deal.owner.name || 'Partner',
        deal.title,
        'APPROVED'
      )

      console.log(`Deal approval email sent to ${deal.owner.email}`)
    } catch (error) {
      console.error('Error sending deal approval email:', error)
    }
  }

  static async onDealRejected(dealId: string, reason?: string) {
    try {
      const deal = await prisma.project.findUnique({
        where: { id: dealId },
        include: {
          owner: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })

      if (!deal) return

      await emailService.sendDealStatusEmail(
        deal.owner.email,
        deal.owner.name || 'Partner',
        deal.title,
        'REJECTED',
        reason
      )

      console.log(`Deal rejection email sent to ${deal.owner.email}`)
    } catch (error) {
      console.error('Error sending deal rejection email:', error)
    }
  }

  // KYC Notifications
  static async onKYCStatusChange(userId: string, status: 'APPROVED' | 'REJECTED' | 'PENDING', reason?: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true
        }
      })

      if (!user) return

      await emailService.sendKYCStatusEmail(
        user.email,
        user.name || 'User',
        status,
        reason
      )

      console.log(`KYC status email sent to ${user.email}`)
    } catch (error) {
      console.error('Error sending KYC status email:', error)
    }
  }

  // Security Alerts
  static async onSuspiciousLogin(userId: string, details: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true
        }
      })

      if (!user) return

      await emailService.sendSecurityAlertEmail(
        user.email,
        user.name || 'User',
        'SUSPICIOUS_ACTIVITY',
        details
      )

      console.log(`Security alert email sent to ${user.email}`)
    } catch (error) {
      console.error('Error sending security alert email:', error)
    }
  }

  static async onPasswordChange(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true
        }
      })

      if (!user) return

      await emailService.sendSecurityAlertEmail(
        user.email,
        user.name || 'User',
        'PASSWORD_CHANGE',
        'Your password was successfully changed'
      )

      console.log(`Password change notification sent to ${user.email}`)
    } catch (error) {
      console.error('Error sending password change notification:', error)
    }
  }

  // Return/Profit Distributions
  static async onReturnPayment(investmentId: string, amount: number) {
    try {
      const investment = await prisma.investment.findUnique({
        where: { id: investmentId },
        include: {
          investor: {
            select: {
              name: true,
              email: true
            }
          },
          project: {
            select: {
              title: true
            }
          }
        }
      })

      if (!investment) return

      await emailService.sendReturnPaymentEmail(
        investment.investor.email,
        investment.investor.name || 'User',
        amount,
        investment.project.title,
        `RET-${investment.id}`
      )

      console.log(`Return payment email sent to ${investment.investor.email}`)
    } catch (error) {
      console.error('Error sending return payment email:', error)
    }
  }

  // Monthly Reports
  static async sendMonthlyReports() {
    try {
      const investors = await prisma.user.findMany({
        where: {
          role: 'INVESTOR',
          emailVerified: { not: null }
        },
        select: {
          id: true,
          name: true,
          email: true
        }
      })

      for (const investor of investors) {
        try {
          // Calculate portfolio stats
          const investments = await prisma.investment.findMany({
            where: { investorId: investor.id },
            include: {
              project: {
                select: {
                  status: true,
                  expectedReturn: true
                }
              }
            }
          })

          const wallet = await prisma.wallet.findUnique({
            where: { userId: investor.id },
            select: { balance: true }
          })

          const totalInvestments = investments.reduce((sum, inv) => sum + Number(inv.amount), 0)
          const portfolioValue = totalInvestments + Number(wallet?.balance || 0)
          const activeDeals = investments.filter(inv => 
            ['ACTIVE', 'PUBLISHED', 'FUNDED'].includes(inv.project.status)
          ).length

          // For demo purposes, calculate estimated returns
          const totalReturns = investments.reduce((sum, inv) => {
            if (inv.project.status === 'COMPLETED') {
              return sum + (Number(inv.amount) * (Number(inv.project.expectedReturn) / 100))
            }
            return sum
          }, 0)

          // Calculate monthly growth (simplified)
          const monthlyGrowth = totalReturns > 0 ? (totalReturns / totalInvestments) * 100 : 0

          await emailService.sendMonthlyPortfolioReport(
            investor.email,
            investor.name || 'User',
            {
              totalInvestments,
              totalReturns,
              portfolioValue,
              monthlyGrowth,
              activeDeals
            }
          )

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100))
        } catch (error) {
          console.error(`Error sending monthly report to ${investor.email}:`, error)
        }
      }

      console.log(`Monthly reports sent to ${investors.length} investors`)
    } catch (error) {
      console.error('Error sending monthly reports:', error)
    }
  }

  // System Maintenance Notifications
  static async sendMaintenanceNotification(maintenanceData: {
    startTime: string
    endTime: string
    description: string
    affectedServices: string[]
  }) {
    try {
      const users = await prisma.user.findMany({
        where: {
          emailVerified: { not: null }
        },
        select: {
          email: true
        }
      })

      const recipients = users.map(user => user.email)

      await emailService.sendMaintenanceNotificationEmail(recipients, maintenanceData)

      console.log(`Maintenance notification sent to ${recipients.length} users`)
    } catch (error) {
      console.error('Error sending maintenance notification:', error)
    }
  }

  // Admin Alerts
  static async sendAdminAlert(subject: string, message: string, actionUrl?: string) {
    try {
      const admins = await prisma.user.findMany({
        where: {
          role: 'ADMIN'
        },
        select: {
          email: true
        }
      })

      for (const admin of admins) {
        await emailService.sendAdminNotificationEmail(
          admin.email,
          subject,
          message,
          actionUrl
        )
      }

      console.log(`Admin alert sent to ${admins.length} administrators`)
    } catch (error) {
      console.error('Error sending admin alert:', error)
    }
  }
}

export default EmailTriggers
