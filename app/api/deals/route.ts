import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth'
import { PrismaClient } from '@prisma/client'
import { v2 as cloudinary } from 'cloudinary'

const prisma = new PrismaClient()

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// GET /api/deals - Get all deals with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const includeAll = searchParams.get('includeAll') === 'true'
    const partner = searchParams.get('partner') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    // Status filtering
    if (status) {
      // Handle comma-separated status values
      const statusArray = status.split(',').map(s => s.trim())
      where.status = statusArray.length === 1 ? statusArray[0] : { in: statusArray }
    } else if (!includeAll) {
      // For non-admin users, only show active/published deals by default
      where.status = { in: ['ACTIVE', 'PUBLISHED'] }
    }
    
    if (category) {
      where.category = category
    }
    
    if (featured === 'true') {
      where.featured = true
    }

    // Search functionality
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { owner: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Partner filtering - only show deals owned by current user if partner=true
    if (partner && session?.user?.id) {
      where.ownerId = session.user.id
    }

    const [deals, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          partner: {
            select: {
              id: true,
              companyName: true,
              logo: true
            }
          },
          investments: {
            select: {
              id: true,
              amount: true,
              investor: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          _count: {
            select: {
              investments: true
            }
          }
        },
        orderBy: [
          { featured: 'desc' },
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.project.count({ where })
    ])

    // Transform deals to match unified interface
    const transformedDeals = deals.map(deal => ({
      ...deal,
      investorCount: deal._count.investments, // Add backward compatibility
      fundingGoal: Number(deal.fundingGoal),
      currentFunding: Number(deal.currentFunding),
      minInvestment: Number(deal.minInvestment),
      expectedReturn: Number(deal.expectedReturn)
    }))

    return NextResponse.json({
      deals: transformedDeals,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    })
  } catch (error) {
    console.error('Error fetching deals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deals' },
      { status: 500 }
    )
  }
}

// POST /api/deals - Create new deal
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has permission to create deals
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        permissions: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const hasWritePermission = user.role === 'ADMIN' || 
      user.role === 'DEAL_MANAGER' ||
      user.permissions.some(up => up.permission === 'WRITE_DEALS')

    if (!hasWritePermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const location = formData.get('location') as string
    const fundingGoal = parseFloat(formData.get('fundingGoal') as string)
    const minInvestment = parseFloat(formData.get('minInvestment') as string)
    const expectedReturn = parseFloat(formData.get('expectedReturn') as string)
    const duration = parseInt(formData.get('duration') as string)
    const riskLevel = formData.get('riskLevel') as string
    const highlights = JSON.parse(formData.get('highlights') as string || '[]')
    const tags = JSON.parse(formData.get('tags') as string || '[]')
    const status = formData.get('status') as string || 'DRAFT'
    const startDate = formData.get('startDate') as string
    const endDate = formData.get('endDate') as string

    // Handle image upload
    const imageFile = formData.get('image') as File
    let thumbnailImage = ''
    const images: string[] = []

    if (imageFile) {
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Upload to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: 'sahaminvest/deals',
            transformation: [
              { width: 800, height: 600, crop: 'fill' },
              { quality: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        ).end(buffer)
      }) as any

      thumbnailImage = uploadResult.secure_url
      images.push(uploadResult.secure_url)
    }

    // Generate slug
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Create the deal
    const deal = await prisma.project.create({
      data: {
        title,
        description,
        category,
        location,
        fundingGoal,
        minInvestment,
        expectedReturn,
        duration,
        riskLevel,
        highlights,
        tags,
        status: status as any,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        thumbnailImage,
        images,
        slug,
        ownerId: session.user.id
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(deal, { status: 201 })
  } catch (error) {
    console.error('Error creating deal:', error)
    return NextResponse.json(
      { error: 'Failed to create deal' },
      { status: 500 }
    )
  }
}