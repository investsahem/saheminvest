import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/profit-distribution-requests - Get all pending profit distribution requests
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    const where: any = {}
    
    if (search) {
      where.OR = [
        { project: { title: { contains: search, mode: 'insensitive' } } },
        { partner: { name: { contains: search, mode: 'insensitive' } } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (status && status !== 'all') {
      where.status = status
    }

    const requests = await prisma.profitDistributionRequest.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            title: true,
            currentFunding: true,
            fundingGoal: true
          }
        },
        partner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Parse distribution data for each request
    const requestsWithParsedData = requests.map(request => ({
      ...request,
      distributionData: JSON.parse(request.distributionData as string)
    }))

    return NextResponse.json({ requests: requestsWithParsedData })
  } catch (error) {
    console.error('Error fetching profit distribution requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT /api/admin/profit-distribution-requests/[id] - Approve or reject a request
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('id')
    
    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { action, rejectionReason } = body

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    // Get the request details
    const distributionRequest = await prisma.profitDistributionRequest.findUnique({
      where: { id: requestId },
      include: {
        project: {
          include: {
            investments: {
              include: {
                investor: true
              }
            }
          }
        }
      }
    })

    if (!distributionRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    if (distributionRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Request has already been processed' },
        { status: 400 }
      )
    }

    if (action === 'APPROVE') {
      // Process the profit distribution
      const distributionData = distributionRequest.distributionData as any[]
      
      // Create profit distribution records and transactions
      for (const distribution of distributionData) {
        if (distribution.profitAmount > 0) {
          // Find the investment
          const investment = distributionRequest.project.investments.find(
            inv => inv.investorId === distribution.investorId
          )
          
          if (investment) {
            // Create profit distribution record
            await prisma.profitDistribution.create({
              data: {
                amount: distribution.profitAmount,
                profitRate: (distribution.profitAmount / distribution.investmentAmount) * 100,
                investmentShare: (Number(distribution.investmentAmount) / Number(distributionRequest.totalAmount)) * 100,
                distributionDate: new Date(),
                profitPeriod: 'quarterly', // Default period
                status: 'COMPLETED',
                investmentId: investment.id,
                projectId: distributionRequest.projectId,
                investorId: distribution.investorId
              }
            })

            // Create transaction record
            await prisma.transaction.create({
              data: {
                userId: distribution.investorId,
                investmentId: investment.id,
                type: 'RETURN',
                amount: distribution.profitAmount,
                description: `${distributionRequest.description} - ${distributionRequest.project.title}`,
                status: 'COMPLETED'
              }
            })

            // Update investor's wallet balance and total returns
            await prisma.user.update({
              where: { id: distribution.investorId },
              data: {
                walletBalance: {
                  increment: distribution.profitAmount
                },
                totalReturns: {
                  increment: distribution.profitAmount
                }
              }
            })

            // Update investment's actual return
            await prisma.investment.update({
              where: { id: investment.id },
              data: {
                actualReturn: {
                  increment: distribution.profitAmount
                }
              }
            })
          }
        }
      }

      // Update request status
      await prisma.profitDistributionRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          reviewedBy: session.user.id,
          reviewedAt: new Date()
        }
      })

      return NextResponse.json({ 
        message: 'Profit distribution approved and processed successfully' 
      })
    } else {
      // Reject the request
      await prisma.profitDistributionRequest.update({
        where: { id: requestId },
        data: {
          status: 'REJECTED',
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
          rejectionReason: rejectionReason || 'No reason provided'
        }
      })

      return NextResponse.json({ 
        message: 'Profit distribution request rejected' 
      })
    }

  } catch (error) {
    console.error('Error processing profit distribution request:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
