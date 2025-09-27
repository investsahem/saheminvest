import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { PrismaClient } from '@prisma/client'
import { v2 as cloudinary } from 'cloudinary'

const prisma = new PrismaClient()

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// GET /api/deals/[id] - Get single deal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const includePartner = searchParams.get('includePartner') === 'true'
    
    const deal = await prisma.project.findUnique({
      where: { id },
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
                description: true,
                logo: true,
                brandColor: true,
                isVerified: true,
                isPublic: true,
                website: true,
                email: true,
                phone: true,
                address: true,
                city: true,
                country: true,
                industry: true,
                foundedYear: true,
                employeeCount: true,
                linkedin: true,
                twitter: true,
                facebook: true,
                investmentAreas: true,
                minimumDealSize: true,
                maximumDealSize: true,
                businessType: true,
                registrationNumber: true
              }
            }
          }
        },
        investments: {
          include: {
            investor: {
              select: {
                id: true,
                name: true,
                image: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        profitDistributions: {
          orderBy: {
            distributionDate: 'desc'
          }
        },
        _count: {
          select: {
            investments: true
          }
        }
      }
    })

    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      )
    }

    // Apply privacy controls based on user role
    const userRole = session?.user?.role
    const isAdmin = userRole === 'ADMIN'
    const isDealManager = userRole === 'DEAL_MANAGER'
    const isPartner = userRole === 'PARTNER'
    const isInvestor = !isAdmin && !isDealManager && !isPartner

    // Filter sensitive information based on role
      const filteredDeal = { ...deal }

    // Hide partner information from investors (unless explicitly requested)
    if (isInvestor && !includePartner) {
      filteredDeal.owner = {
        ...deal.owner,
        name: 'Partner',
        email: '',
        partnerProfile: null
      }
    }

    // Hide investor personal details from partners (except admins)
    if (isPartner && !isAdmin && !isDealManager) {
      filteredDeal.investments = deal.investments.map(investment => ({
        ...investment,
        investor: {
          id: 'anonymous',
          name: 'Anonymous Investor',
          image: null,
          email: ''
        }
      }))
    }

    // Map partnerProfile to partner for consistency with frontend expectations
    const responseData = {
      ...filteredDeal,
      partner: filteredDeal.owner?.partnerProfile || null
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error fetching deal:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deal' },
      { status: 500 }
    )
  }
}

// PUT /api/deals/[id] - Update deal
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    console.log('PUT request received for deal:', id)
    console.log('Session data:', session ? {
      user: session.user,
      expires: session.expires
    } : 'No session')
    
    if (!session?.user) {
      console.log('No session found, returning 401')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the existing deal
    const existingDeal = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: true
      }
    })

    if (!existingDeal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        permissions: true
      }
    })

    const isOwner = existingDeal.ownerId === session.user.id
    const isAdmin = user?.role === 'ADMIN'
    const isDealManager = user?.role === 'DEAL_MANAGER'
    const hasWritePermission = user?.permissions.some(up => up.permission === 'WRITE_DEALS')

    if (!isOwner && !isAdmin && !isDealManager && !hasWritePermission) {
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
    const status = formData.get('status') as string
    const startDate = formData.get('startDate') as string
    const endDate = formData.get('endDate') as string
    const featured = formData.get('featured') === 'true'

    // Handle image upload if new image provided
    const imageFile = formData.get('image') as File
    const existingImageUrl = formData.get('existingImageUrl') as string
    console.log('API received image file:', imageFile ? `${imageFile.name} (${imageFile.size} bytes)` : 'No image')
    console.log('API received existingImageUrl:', existingImageUrl)
    let thumbnailImage = existingDeal.thumbnailImage
    let images = [...existingDeal.images]

    if (imageFile && imageFile.size > 0) {
      console.log('Processing image upload...')
      
      // Check Cloudinary configuration
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error('Cloudinary configuration missing - proceeding without image upload')
        // Keep existing image and continue with update
        thumbnailImage = existingDeal.thumbnailImage
        images = [...existingDeal.images]
      } else {
      
      try {
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
              if (error) {
                console.error('Cloudinary upload error:', error)
                reject(error)
              } else {
                resolve(result)
              }
            }
          ).end(buffer)
        }) as any

      // Delete old image from Cloudinary if exists
      if (existingDeal.thumbnailImage && existingDeal.thumbnailImage.includes('cloudinary.com')) {
        try {
          // Extract public_id from Cloudinary URL
          // URL format: https://res.cloudinary.com/cloud-name/image/upload/v123456/folder/filename.ext
          const urlParts = existingDeal.thumbnailImage.split('/')
          const uploadIndex = urlParts.findIndex(part => part === 'upload')
          if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
            // Skip version if present (starts with 'v' followed by numbers)
            let startIndex = uploadIndex + 1
            if (urlParts[startIndex] && urlParts[startIndex].match(/^v\d+$/)) {
              startIndex += 1
            }
            // Join the remaining parts and remove file extension
            const publicId = urlParts.slice(startIndex).join('/').replace(/\.[^/.]+$/, '')
            console.log('Attempting to delete old image with public_id:', publicId)
            await cloudinary.uploader.destroy(publicId)
          }
        } catch (error) {
          console.error('Error deleting old image:', error)
        }
      }

        thumbnailImage = uploadResult.secure_url
        images = [uploadResult.secure_url, ...images.filter(img => img !== existingDeal.thumbnailImage)]
        console.log('New image uploaded successfully:', thumbnailImage)
        
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError)
        
        // Check if user wants to proceed without image update
        const skipImageUpload = formData.get('skipImageUpload') === 'true'
        if (skipImageUpload) {
          console.log('Proceeding with update without image change due to upload failure')
          // Keep existing image
          thumbnailImage = existingDeal.thumbnailImage
          images = [...existingDeal.images]
        } else {
          return NextResponse.json(
            { 
              error: 'Failed to upload image. You can try again or proceed without changing the image.',
              details: uploadError instanceof Error ? uploadError.message : 'Unknown upload error'
            },
            { status: 500 }
          )
        }
      }
      }
    } else if (existingImageUrl) {
      // Keep existing image URL (no changes needed)
      console.log('Keeping existing image URL:', existingImageUrl)
      thumbnailImage = existingImageUrl
      if (!images.includes(existingImageUrl)) {
        images = [existingImageUrl, ...images]
      }
    }

    // Update slug if title changed
    let slug = existingDeal.slug
    if (title && title !== existingDeal.title) {
      slug = title.toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
    }

    // Determine status-related dates
    const updateData: any = {
      title: title || existingDeal.title,
      description: description || existingDeal.description,
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
      thumbnailImage,
      images,
      slug,
      featured
    }

    // Handle status changes
    if (status !== existingDeal.status) {
      if (status === 'PUBLISHED' && existingDeal.status === 'DRAFT') {
        updateData.publishedAt = new Date()
      } else if (status === 'PAUSED') {
        updateData.pausedAt = new Date()
      } else if (status === 'ACTIVE' && existingDeal.status === 'PAUSED') {
        updateData.pausedAt = null
      }
    }

    // Update the deal
    console.log('Updating deal in database with thumbnailImage:', updateData.thumbnailImage)
    const deal = await prisma.project.update({
      where: { id },
      data: updateData,
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

    console.log('Deal updated successfully, returning with thumbnailImage:', deal.thumbnailImage)
    return NextResponse.json(deal)
  } catch (error) {
    console.error('Error updating deal:', error)
    return NextResponse.json(
      { error: 'Failed to update deal' },
      { status: 500 }
    )
  }
}

// DELETE /api/deals/[id] - Delete deal
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the existing deal
    const existingDeal = await prisma.project.findUnique({
      where: { id },
      include: {
        investments: true
      }
    })

    if (!existingDeal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      )
    }

    // Check if deal has investments
    if (existingDeal.investments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete deal with existing investments' },
        { status: 400 }
      )
    }

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        permissions: true
      }
    })

    const isOwner = existingDeal.ownerId === session.user.id
    const isAdmin = user?.role === 'ADMIN'
    const hasDeletePermission = user?.permissions.some(up => up.permission === 'DELETE_DEALS')

    if (!isOwner && !isAdmin && !hasDeletePermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Delete images from Cloudinary
    if (existingDeal.images.length > 0) {
      for (const imageUrl of existingDeal.images) {
        try {
          if (imageUrl.includes('cloudinary.com')) {
            // Extract public_id from Cloudinary URL
            const urlParts = imageUrl.split('/')
            const uploadIndex = urlParts.findIndex(part => part === 'upload')
            if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
              // Skip version if present
              let startIndex = uploadIndex + 1
              if (urlParts[startIndex] && urlParts[startIndex].match(/^v\d+$/)) {
                startIndex += 1
              }
              const publicId = urlParts.slice(startIndex).join('/').replace(/\.[^/.]+$/, '')
              await cloudinary.uploader.destroy(publicId)
            }
          }
        } catch (error) {
          console.error('Error deleting image:', error)
        }
      }
    }

    // Delete the deal
    await prisma.project.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Deal deleted successfully' })
  } catch (error) {
    console.error('Error deleting deal:', error)
    return NextResponse.json(
      { error: 'Failed to delete deal' },
      { status: 500 }
    )
  }
}