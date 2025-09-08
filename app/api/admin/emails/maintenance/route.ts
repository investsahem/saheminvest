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

    const { startTime, endTime, description, affectedServices } = await request.json()

    if (!startTime || !endTime || !description || !affectedServices) {
      return NextResponse.json({ 
        error: 'Missing required fields: startTime, endTime, description, affectedServices' 
      }, { status: 400 })
    }

    await EmailTriggers.sendMaintenanceNotification({
      startTime,
      endTime,
      description,
      affectedServices
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Maintenance notification sent to all users'
    })

  } catch (error) {
    console.error('Maintenance notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send maintenance notification', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
