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
    const includeInvestments = searchParams.get('includeInvestments') === 'true'
    const includeDistributions = searchParams.get('includeDistributions') === 'true'
    
    // For admin/deal manager, always include full details
    const userRole = session?.user?.role
    const isAdmin = userRole === 'ADMIN' || userRole === 'DEAL_MANAGER'
    
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
        investments: (isAdmin || includeInvestments) ? {
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
        } : false,
        profitDistributions: (isAdmin || includeDistributions) ? {
          include: {
            approvedBy: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            distributionDate: 'desc'
          }
        } : false,
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
    const isAdminRole = userRole === 'ADMIN' || userRole === 'DEAL_MANAGER'
    const isPartner = userRole === 'PARTNER'
    const isInvestor = !isAdminRole && !isPartner

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
    if (isPartner && !isAdminRole && deal.investments) {
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

    // Calculate unique investor count
    const uniqueInvestorIds = new Set((deal.investments || []).map(inv => inv.investorId))
    const uniqueInvestorCount = uniqueInvestorIds.size

    // Map partnerProfile to partner for consistency with frontend expectations
    const responseData = {
      ...filteredDeal,
      partner: filteredDeal.owner?.partnerProfile || null,
      investorCount: uniqueInvestorCount // Use unique investor count instead of total investments
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
    const isPartner = user?.role === 'PARTNER'
    const hasWritePermission = user?.permissions.some(up => up.permission === 'WRITE_DEALS')

    if (!isOwner && !isAdmin && !isDealManager && !hasWritePermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }
    
    // If the user is a partner (not admin/deal manager), create an update request instead of updating directly
    const requiresApproval = isPartner && !isAdmin && !isDealManager

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
      console.log('Cloudinary env check:', {
        cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
        api_key: !!process.env.CLOUDINARY_API_KEY,
        api_secret: !!process.env.CLOUDINARY_API_SECRET
      })
      
      // Check Cloudinary configuration
      console.log('Cloudinary configuration:', {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'NOT_SET',
        api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT_SET',
        api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT_SET'
      })
      
      // Cloudinary upload - RESTORED
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error('Cloudinary configuration missing - proceeding without image upload')
        // Keep existing image and continue with update
        thumbnailImage = existingDeal.thumbnailImage
        images = [...existingDeal.images]
      } else {
      
      try {
        console.log('🚀 Starting Cloudinary upload with Data URI method...')
        const bytes = await imageFile.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        // Convert to Data URI (better for serverless)
        const base64 = buffer.toString('base64')
        const dataUri = `data:${imageFile.type};base64,${base64}`
        
        // Upload to Cloudinary using upload method (not upload_stream)
        const uploadResult = await cloudinary.uploader.upload(dataUri, {
          resource_type: 'image',
          folder: 'sahaminvest/deals',
          transformation: [
            { width: 800, height: 600, crop: 'fill' },
            { quality: 'auto' }
          ]
        })
        
        console.log('✅ Cloudinary upload successful:', uploadResult.secure_url)

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
        console.log('✅ CLOUDINARY UPLOAD SUCCESS - Image URL:', uploadResult.secure_url)
        console.log('✅ CLOUDINARY UPLOAD SUCCESS - Public ID:', uploadResult.public_id)
        
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError)
        console.error('Upload error details:', {
          message: uploadError instanceof Error ? uploadError.message : 'Unknown error',
          stack: uploadError instanceof Error ? uploadError.stack : 'No stack trace'
        })
        
        // ALWAYS proceed without image upload on error - don't fail the entire update
        console.log('Proceeding with update without image change due to upload failure')
        thumbnailImage = existingDeal.thumbnailImage
        images = [...existingDeal.images]
        
        // Log the error but don't return 500 - let the deal update continue
        console.log('Deal update will continue with existing image due to upload error')
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

    // If partner requires approval, create an update request instead of updating directly
    if (requiresApproval) {
      console.log('Partner update detected - creating update request for admin approval')
      
      // Generate changes summary
      const changes: string[] = []
      if (title !== existingDeal.title) changes.push(`Title: "${existingDeal.title}" → "${title}"`)
      if (description !== existingDeal.description) changes.push(`Description updated`)
      if (fundingGoal !== Number(existingDeal.fundingGoal)) changes.push(`Funding Goal: $${existingDeal.fundingGoal} → $${fundingGoal}`)
      if (minInvestment !== Number(existingDeal.minInvestment)) changes.push(`Min Investment: $${existingDeal.minInvestment} → $${minInvestment}`)
      if (expectedReturn !== Number(existingDeal.expectedReturn)) changes.push(`Expected Return: ${existingDeal.expectedReturn}% → ${expectedReturn}%`)
      if (duration !== existingDeal.duration) changes.push(`Duration: ${existingDeal.duration} → ${duration} days`)
      if (status !== existingDeal.status) changes.push(`Status: ${existingDeal.status} → ${status}`)
      if (thumbnailImage !== existingDeal.thumbnailImage) changes.push(`Image updated`)
      
      const changesSummary = changes.length > 0 ? changes.join('\n') : 'General updates'
      
      // Create the update request
      const updateRequest = await prisma.dealUpdateRequest.create({
        data: {
          projectId: id,
          requestedBy: session.user.id,
          proposedChanges: updateData,
          changesSummary,
          status: 'PENDING'
        },
        include: {
          project: {
            select: {
              id: true,
              title: true
            }
          },
          requester: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })
      
      console.log('Update request created successfully:', updateRequest.id)
      
      return NextResponse.json({
        message: 'Update request submitted successfully. Waiting for admin approval.',
        updateRequest: {
          id: updateRequest.id,
          status: updateRequest.status,
          changesSummary: updateRequest.changesSummary,
          createdAt: updateRequest.createdAt
        },
        requiresApproval: true
      })
    }
    
    // Admin/Deal Manager can update directly
    console.log('Admin/Deal Manager update - updating deal directly')
    console.log('Updating deal in database with thumbnailImage:', updateData.thumbnailImage)
    console.log('📊 UPDATE DATA BEING SAVED:', {
      thumbnailImage: updateData.thumbnailImage,
      images: updateData.images,
      title: updateData.title
    })
    
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
    console.log('📊 FINAL DEAL DATA:', {
      id: deal.id,
      title: deal.title,
      thumbnailImage: deal.thumbnailImage,
      images: deal.images
    })
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