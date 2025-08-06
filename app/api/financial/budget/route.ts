import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'FINANCIAL_OFFICER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

    // Mock budget data (you would typically have a Budget model in your schema)
    const budgetCategories = [
      {
        id: 'operational',
        name: 'Operational Expenses',
        allocated: 250000,
        spent: 185000,
        remaining: 65000,
        percentage: 74,
        status: 'on_track'
      },
      {
        id: 'marketing',
        name: 'Marketing & Acquisition',
        allocated: 150000,
        spent: 142000,
        remaining: 8000,
        percentage: 95,
        status: 'warning'
      },
      {
        id: 'technology',
        name: 'Technology & Infrastructure',
        allocated: 200000,
        spent: 120000,
        remaining: 80000,
        percentage: 60,
        status: 'under_budget'
      },
      {
        id: 'compliance',
        name: 'Compliance & Legal',
        allocated: 80000,
        spent: 85000,
        remaining: -5000,
        percentage: 106,
        status: 'over_budget'
      },
      {
        id: 'reserves',
        name: 'Emergency Reserves',
        allocated: 100000,
        spent: 0,
        remaining: 100000,
        percentage: 0,
        status: 'reserved'
      }
    ]

    // Get actual expense data from transactions
    const startOfYear = new Date(year, 0, 1)
    const endOfYear = new Date(year, 11, 31)

    const expenses = await prisma.transaction.findMany({
      where: {
        type: 'WITHDRAWAL',
        createdAt: {
          gte: startOfYear,
          lte: endOfYear
        }
      }
    })

    // Group expenses by month
    const monthlyExpenses = expenses.reduce((acc, expense) => {
      const month = expense.createdAt.getMonth()
      if (!acc[month]) {
        acc[month] = 0
      }
      acc[month] += expense.amount
      return acc
    }, {} as any)

    // Create monthly budget data
    const monthlyBudgetData = Array.from({ length: 6 }, (_, i) => {
      const month = new Date().getMonth() - (5 - i)
      const monthName = new Date(year, month).toLocaleString('default', { month: 'short' })
      const allocated = 130000 + (i * 5000) // Mock allocated amounts
      const actual = monthlyExpenses[month] || (125000 + Math.random() * 30000)
      
      return {
        month: monthName,
        allocated,
        actual: Math.round(actual),
        variance: Math.round(actual - allocated)
      }
    })

    // Mock budget requests
    const budgetRequests = [
      {
        id: 1,
        department: 'Technology',
        requestor: 'Ahmed Al-Rashid',
        amount: 25000,
        purpose: 'Cloud infrastructure upgrade',
        status: 'pending',
        priority: 'high',
        date: new Date().toISOString().split('T')[0]
      },
      {
        id: 2,
        department: 'Marketing',
        requestor: 'Sara Mohammed',
        amount: 15000,
        purpose: 'Q2 digital marketing campaign',
        status: 'approved',
        priority: 'medium',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
      },
      {
        id: 3,
        department: 'Operations',
        requestor: 'Mohammed Al-Otaibi',
        amount: 8000,
        purpose: 'Office equipment replacement',
        status: 'rejected',
        priority: 'low',
        date: new Date(Date.now() - 172800000).toISOString().split('T')[0]
      }
    ]

    return NextResponse.json({
      budgetCategories,
      monthlyBudgetData,
      budgetRequests,
      summary: {
        totalAllocated: budgetCategories.reduce((sum, cat) => sum + cat.allocated, 0),
        totalSpent: budgetCategories.reduce((sum, cat) => sum + cat.spent, 0),
        totalRemaining: budgetCategories.reduce((sum, cat) => sum + cat.remaining, 0),
        pendingRequests: budgetRequests.filter(r => r.status === 'pending').length
      }
    })

  } catch (error) {
    console.error('Error fetching budget data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'FINANCIAL_OFFICER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { department, amount, purpose, priority = 'medium' } = body

    if (!department || !amount || !purpose) {
      return NextResponse.json(
        { error: 'Missing required fields: department, amount, purpose' },
        { status: 400 }
      )
    }

    // Create budget request (you would typically save this to a BudgetRequest model)
    const budgetRequest = {
      id: Date.now(),
      department,
      requestor: session.user.name || session.user.email,
      amount: parseFloat(amount),
      purpose,
      priority,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
      createdBy: session.user.id
    }

    return NextResponse.json(budgetRequest, { status: 201 })

  } catch (error) {
    console.error('Error creating budget request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'FINANCIAL_OFFICER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { requestId, status, notes } = body

    if (!requestId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: requestId, status' },
        { status: 400 }
      )
    }

    // Update budget request status (mock response)
    const updatedRequest = {
      id: requestId,
      status,
      notes,
      processedBy: session.user.id,
      processedAt: new Date()
    }

    return NextResponse.json(updatedRequest)

  } catch (error) {
    console.error('Error updating budget request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}