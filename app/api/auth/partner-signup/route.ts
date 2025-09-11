import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const partnerApplicationSchema = z.object({
  // Company Information
  companyName: z.string().min(1, 'Company name is required'),
  contactName: z.string().min(1, 'Contact name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  website: z.string().url().optional().or(z.literal('')),
  
  // Address
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string().optional(),
  
  // Business Information
  industry: z.string().min(1, 'Industry is required'),
  businessType: z.string().min(1, 'Business type is required'),
  registrationNumber: z.string().optional(),
  foundedYear: z.string().optional(),
  employeeCount: z.string().optional(),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  
  // Experience & Investment Focus
  yearsExperience: z.string().optional(),
  investmentAreas: z.array(z.string()).min(1, 'At least one investment area is required'),
  minimumDealSize: z.string().optional(),
  maximumDealSize: z.string().optional(),
  previousDeals: z.string().optional(),
  
  // Terms
  agreeToTerms: z.boolean().refine(val => val === true, 'Must agree to terms'),
  marketingConsent: z.boolean()
})

function generateReferenceNumber(): string {
  const prefix = 'PAP' // Partner Application
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request data
    const validationResult = partnerApplicationSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          message: 'Invalid request data',
          errors: validationResult.error.errors 
        },
        { status: 400 }
      )
    }
    
    const data = validationResult.data
    
    // Check if application with this email already exists
    const existingApplication = await prisma.partnerApplication.findUnique({
      where: { email: data.email }
    })
    
    if (existingApplication) {
      return NextResponse.json(
        { message: 'An application with this email already exists' },
        { status: 409 }
      )
    }
    
    // Generate reference number
    const referenceNumber = generateReferenceNumber()
    
    // Create the application
    const application = await prisma.partnerApplication.create({
      data: {
        companyName: data.companyName,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone,
        website: data.website || null,
        
        address: data.address,
        city: data.city,
        country: data.country,
        postalCode: data.postalCode || null,
        
        industry: data.industry,
        businessType: data.businessType,
        registrationNumber: data.registrationNumber || null,
        foundedYear: data.foundedYear ? parseInt(data.foundedYear) : null,
        employeeCount: data.employeeCount || null,
        description: data.description,
        
        yearsExperience: data.yearsExperience ? parseInt(data.yearsExperience) : null,
        investmentAreas: data.investmentAreas,
        minimumDealSize: data.minimumDealSize ? parseFloat(data.minimumDealSize) : null,
        maximumDealSize: data.maximumDealSize ? parseFloat(data.maximumDealSize) : null,
        previousDeals: data.previousDeals ? parseInt(data.previousDeals) : null,
        
        agreeToTerms: data.agreeToTerms,
        marketingConsent: data.marketingConsent,
        
        status: 'PENDING',
        notes: `Reference: ${referenceNumber}`
      }
    })
    
    // TODO: Send email notification to applicant with reference number
    // TODO: Send notification to admin about new partner application
    
    return NextResponse.json({
      message: 'Partner application submitted successfully',
      referenceNumber,
      applicationId: application.id
    })
    
  } catch (error) {
    console.error('Partner application error:', error)
    
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
