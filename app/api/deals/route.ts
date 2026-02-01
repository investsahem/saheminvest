import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth'
import { PrismaClient } from '@prisma/client'
import { calculateUniqueInvestors, debugInvestorCount } from '../../lib/investor-utils'
import { toSafeMoney, toSafeDecimal } from '../../lib/decimal-utils'
import { v2 as cloudinary } from 'cloudinary'

const prisma = new PrismaClient()

// Configure Cloudinary on-demand (env vars may not be available at module load time)
const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

// GET /api/deals - Get all deals with filtering
export async function GET(request: NextRequest) {
  try {
    console.log('=== DEALS API START ===')

    const session = await getServerSession(authOptions)
    console.log('Session user:', session?.user?.id, session?.user?.role)

    const { searchParams } = new URL(request.url)
    console.log('Search params:', Object.fromEntries(searchParams.entries()))

    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const includeAll = searchParams.get('includeAll') === 'true'
    const partner = searchParams.get('partner') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    console.log('Parsed params:', { status, category, featured, search, includeAll, partner, page, limit })

    // Build where clause
    const where: any = {}

    // Status filtering
    if (status) {
      // Handle comma-separated status values
      const statusArray = status.split(',').map(s => s.trim())
      where.status = statusArray.length === 1 ? statusArray[0] : { in: statusArray }
    } else if (!includeAll && !partner) {
      // For non-admin users (but not partners viewing their own deals), only show active/published deals by default
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
      console.log('Partner filtering enabled for user:', session.user.id)
    }

    // Try to fetch deals with error handling for each step
    console.log('Fetching deals with where clause:', JSON.stringify(where))

    let deals = []
    let total = 0

    // Start with the simplest possible query
    console.log('Step 1: Testing basic project query...')

    try {
      // Test basic query first
      const basicDeals = await prisma.project.findMany({
        where,
        select: {
          id: true,
          title: true,
          status: true
        },
        take: 5
      })
      console.log('Basic query successful, found', basicDeals.length, 'deals')

      // Now try with owner
      console.log('Step 2: Testing with owner include...')
      const dealsWithOwner = await prisma.project.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        },
        take: 5
      })
      console.log('Owner include successful, found', dealsWithOwner.length, 'deals')

      // Try with investments count
      console.log('Step 3: Testing with investments count...')
      const dealsWithCount = await prisma.project.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              partnerProfile: {
                select: {
                  id: true,
                  companyName: true,
                  displayName: true,
                  tagline: true,
                  logo: true,
                  brandColor: true,
                  isVerified: true,
                  isPublic: true
                }
              }
            }
          },
          profitDistributions: {
            select: {
              id: true,
              amount: true,
              profitRate: true,
              distributionDate: true,
              status: true
            },
            orderBy: {
              distributionDate: 'desc'
            }
          },
          investments: {
            select: {
              investorId: true
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
      })

      const totalCount = await prisma.project.count({ where })

      console.log('Full query successful!')

      // Keep investments for now to calculate unique investor count
      deals = dealsWithCount
      total = totalCount

    } catch (queryError) {
      console.error('Query failed at step:', (queryError as Error).message)
      console.error('Query error stack:', (queryError as Error).stack)
      throw queryError
    }

    // Apply privacy controls based on user role
    const userRole = session?.user?.role
    const isAdmin = userRole === 'ADMIN'
    const isDealManager = userRole === 'DEAL_MANAGER'
    const isPartner = userRole === 'PARTNER'
    const isInvestor = !isAdmin && !isDealManager && !isPartner

    // Transform deals to match unified interface and apply privacy filters
    const transformedDeals = deals.map(deal => {
      // Calculate unique investor count from investments using helper function
      const investments = (deal as any).investments || []
      const uniqueInvestorCount = calculateUniqueInvestors(investments)

      // Debug logging for investor count
      debugInvestorCount(deal.id, investments, 'API /deals route')

      const filteredDeal = {
        ...deal,
        investorCount: uniqueInvestorCount, // Use unique investor count instead of total investments
        fundingGoal: Number(deal.fundingGoal),
        currentFunding: Number(deal.currentFunding),
        minInvestment: Number(deal.minInvestment),
        expectedReturn: Number(deal.expectedReturn)
      }

      // Hide partner information from investors
      if (isInvestor && deal.owner) {
        (filteredDeal as any).partner = null;
        (filteredDeal as any).owner = {
          id: deal.owner.id,
          name: 'Partner',
          email: '',
          image: deal.owner.image,
          partnerProfile: null
        }
      }

      // Hide investor details from partners (except admins)
      if (isPartner && !isAdmin && !isDealManager) {
        (filteredDeal as any).investments = deal.investments.map((investment: any) => ({
          ...investment,
          investor: {
            id: 'anonymous',
            name: 'Anonymous Investor'
          }
        }))
      } else {
        // For investors and public, hide investments array completely for privacy
        (filteredDeal as any).investments = []
      }

      return filteredDeal
    })

    console.log('=== DEALS API SUCCESS ===')
    console.log('Returning deals count:', transformedDeals.length)
    console.log('Total:', total)

    return NextResponse.json({
      deals: transformedDeals,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    })
  } catch (error) {
    console.error('Error fetching deals:', error)
    console.error('Error details:', (error as Error).message)
    console.error('Stack trace:', (error as Error).stack)
    return NextResponse.json(
      { error: 'Failed to fetch deals', details: (error as Error).message },
      { status: 500 }
    )
  }
}

// POST /api/deals - Create new deal
export async function POST(request: NextRequest) {
  console.log('🚀 POST /api/deals - Deal creation started')
  try {
    const session = await getServerSession(authOptions)
    console.log('👤 Session check:', session?.user ? `User: ${session.user.id}` : 'No session')

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
      user.role === 'PARTNER' ||
      (user.permissions && user.permissions.some(up => up.permission === 'WRITE_DEALS'))

    if (!hasWritePermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    console.log('📝 Form data received:', {
      title: formData.get('title'),
      category: formData.get('category'),
      fundingGoal: formData.get('fundingGoal'),
      hasImage: !!formData.get('image'),
      imageSize: formData.get('image') ? (formData.get('image') as File).size : 0
    })

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const location = formData.get('location') as string
    const fundingGoal = toSafeMoney(formData.get('fundingGoal') as string)
    const minInvestment = toSafeMoney(formData.get('minInvestment') as string)
    const expectedReturn = toSafeDecimal(formData.get('expectedReturn') as string)
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
      console.log('📸 Processing image upload:', {
        name: imageFile.name,
        size: imageFile.size,
        type: imageFile.type
      })

      // Validate image file
      if (imageFile.size > 10 * 1024 * 1024) { // 10MB limit
        console.error('❌ Image file too large:', imageFile.size)
        return NextResponse.json(
          { error: 'Image file is too large. Maximum size is 10MB.' },
          { status: 400 }
        )
      }

      if (!imageFile.type.startsWith('image/')) {
        console.error('❌ Invalid file type:', imageFile.type)
        return NextResponse.json(
          { error: 'Invalid file type. Please upload an image file.' },
          { status: 400 }
        )
      }

      try {
        const bytes = await imageFile.arrayBuffer()
        const buffer = Buffer.from(bytes)

        console.log('☁️ Uploading to Cloudinary...', {
          bufferSize: buffer.length,
          cloudName: process.env.CLOUDINARY_CLOUD_NAME?.substring(0, 3) + '...',
          apiKey: process.env.CLOUDINARY_API_KEY?.substring(0, 3) + '...',
          hasSecret: !!process.env.CLOUDINARY_API_SECRET
        })

        // Verify config
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
          throw new Error('Missing Cloudinary configuration')
        }

        // Upload to Cloudinary
        configureCloudinary() // Ensure config is set at request time
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'image',
              folder: 'sahaminvest/deals',
              // Simplified options to test if transformation is the cause
              transformation: [
                { width: 800, height: 600, crop: 'fill' },
                { quality: 'auto' }
              ]
            },
            (error, result) => {
              if (error) {
                console.error('❌ Cloudinary upload callback error:', error)
                reject(error)
              } else {
                console.log('✅ Cloudinary upload success:', result?.secure_url)
                resolve(result)
              }
            }
          )

          // Handle stream errors
          uploadStream.on('error', (err) => {
            console.error('❌ Cloudinary stream error:', err)
            reject(err)
          })

          uploadStream.end(buffer)
        }) as any

        thumbnailImage = uploadResult.secure_url
        images.push(uploadResult.secure_url)
      } catch (uploadError) {
        console.error('❌ Image upload failed details:', {
          message: (uploadError as Error).message,
          stack: (uploadError as Error).stack,
          raw: uploadError
        })
        // For now, allow deal creation without image rather than failing completely
        console.log('⚠️ Proceeding with deal creation without image due to upload failure')
        thumbnailImage = ''
        images.length = 0

        // Optionally, you can still return the error if you want to force image upload
        // return NextResponse.json(
        //   { error: 'Failed to upload image. Please try again.', details: (uploadError as Error).message },
        //   { status: 500 }
        // )
      }
    }

    // Generate slug
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Create the deal
    console.log('💾 Creating deal in database...', { title, status, thumbnailImage: thumbnailImage ? 'Set' : 'None' })
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
            email: true,
            partnerProfile: {
              select: {
                id: true,
                companyName: true,
                displayName: true,
                tagline: true,
                logo: true,
                brandColor: true,
                isVerified: true,
                isPublic: true
              }
            }
          }
        }
      }
    })

    console.log('✅ Deal created successfully:', { id: deal.id, title: deal.title })
    return NextResponse.json(deal, { status: 201 })
  } catch (error) {
    console.error('Error creating deal:', error)
    console.error('Error details:', (error as Error).message)
    console.error('Stack trace:', (error as Error).stack)
    return NextResponse.json(
      { error: 'Failed to create deal', details: (error as Error).message },
      { status: 500 }
    )
  }
}