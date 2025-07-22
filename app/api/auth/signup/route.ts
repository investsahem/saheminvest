import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const signupSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  nationalId: z.string().min(1, 'National ID is required'),
  
  // Address
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string().optional(),
  
  // Employment & Financial
  occupation: z.string().min(1, 'Occupation is required'),
  employerName: z.string().optional(),
  monthlyIncome: z.string().optional(),
  
  // Investment Profile
  investmentExperience: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  riskTolerance: z.enum(['Low', 'Medium', 'High']),
  investmentGoals: z.string().min(1, 'Investment goals are required'),
  initialInvestment: z.string().optional(),
  
  // Terms
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
  marketingConsent: z.boolean()
})

function generateReferenceNumber(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `SA-${timestamp}-${random}`.toUpperCase()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request data
    const validationResult = signupSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          message: 'Validation error', 
          errors: validationResult.error.errors 
        },
        { status: 400 }
      )
    }
    
    const data = validationResult.data
    
    // Check if email already exists in applications
    const existingApplication = await prisma.userApplication.findUnique({
      where: { email: data.email }
    })
    
    if (existingApplication) {
      return NextResponse.json(
        { message: 'An application with this email already exists' },
        { status: 409 }
      )
    }
    
    // Check if email already exists in users
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'A user account with this email already exists' },
        { status: 409 }
      )
    }
    
    // Generate reference number
    const referenceNumber = generateReferenceNumber()
    
    // Create the application
    const application = await prisma.userApplication.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dateOfBirth: new Date(data.dateOfBirth),
        nationalId: data.nationalId,
        
        address: data.address,
        city: data.city,
        country: data.country,
        postalCode: data.postalCode || null,
        
        occupation: data.occupation,
        employerName: data.employerName || null,
        monthlyIncome: data.monthlyIncome ? parseFloat(data.monthlyIncome) : null,
        
        investmentExperience: data.investmentExperience,
        riskTolerance: data.riskTolerance,
        investmentGoals: data.investmentGoals,
        initialInvestment: data.initialInvestment ? parseFloat(data.initialInvestment) : null,
        
        agreeToTerms: data.agreeToTerms,
        marketingConsent: data.marketingConsent,
        
        status: 'PENDING',
        notes: `Reference: ${referenceNumber}`
      }
    })
    
    // TODO: Send email notification to user
    // TODO: Send notification to admin about new application
    
    return NextResponse.json({
      message: 'Application submitted successfully',
      referenceNumber,
      applicationId: application.id
    })
    
  } catch (error) {
    console.error('Signup error:', error)
    
    // Handle Prisma unique constraint errors
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { message: 'An application with this information already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 