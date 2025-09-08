import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import EmailTriggers from '../../../../lib/email-triggers'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Send monthly reports to all investors
    await EmailTriggers.sendMonthlyReports()

    return NextResponse.json({ 
      success: true, 
      message: 'Monthly reports sent to all investors'
    })

  } catch (error) {
    console.error('Monthly reports error:', error)
    return NextResponse.json(
      { error: 'Failed to send monthly reports', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
