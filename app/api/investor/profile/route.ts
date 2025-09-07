import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'INVESTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Fetch user profile data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        country: true,
        dateOfBirth: true,
        profileImage: true,
        investmentExperience: true,
        riskTolerance: true,
        investmentGoals: true,
        monthlyIncome: true,
        occupation: true,
        nationalId: true,
        preferredLanguage: true,
        timezone: true,
        twoFactorEnabled: true,
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
        marketingEmails: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Split name into first and last name
    const nameParts = user.name?.split(' ') || ['', '']
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    const profile = {
      id: user.id,
      firstName,
      lastName,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      country: user.country || '',
      dateOfBirth: user.dateOfBirth || '',
      profileImage: user.profileImage || '',
      investmentExperience: user.investmentExperience || '',
      riskTolerance: user.riskTolerance || '',
      investmentGoals: user.investmentGoals || '',
      monthlyIncome: user.monthlyIncome ? Number(user.monthlyIncome) : 0,
      occupation: user.occupation || '',
      nationalId: user.nationalId || '',
      preferredLanguage: user.preferredLanguage || 'en',
      timezone: user.timezone || 'UTC',
      twoFactorEnabled: user.twoFactorEnabled || false,
      emailNotifications: user.emailNotifications !== false,
      smsNotifications: user.smsNotifications !== false,
      pushNotifications: user.pushNotifications !== false,
      marketingEmails: user.marketingEmails !== false,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }

    return NextResponse.json({ profile })

  } catch (error) {
    console.error('Error fetching investor profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'INVESTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const data = await request.json()

    // Validate required fields
    if (!data.firstName || !data.email) {
      return NextResponse.json(
        { error: 'First name and email are required' },
        { status: 400 }
      )
    }

    // Combine first and last name
    const fullName = `${data.firstName} ${data.lastName || ''}`.trim()

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: fullName,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        country: data.country || null,
        dateOfBirth: data.dateOfBirth || null,
        profileImage: data.profileImage || null,
        investmentExperience: data.investmentExperience || null,
        riskTolerance: data.riskTolerance || null,
        investmentGoals: data.investmentGoals || null,
        monthlyIncome: data.monthlyIncome ? Number(data.monthlyIncome) : null,
        occupation: data.occupation || null,
        nationalId: data.nationalId || null,
        preferredLanguage: data.preferredLanguage || 'en',
        timezone: data.timezone || 'UTC',
        twoFactorEnabled: data.twoFactorEnabled || false,
        emailNotifications: data.emailNotifications !== false,
        smsNotifications: data.smsNotifications !== false,
        pushNotifications: data.pushNotifications !== false,
        marketingEmails: data.marketingEmails !== false
      }
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        updatedAt: updatedUser.updatedAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Error updating investor profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
