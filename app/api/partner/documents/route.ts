import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/db'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const category = searchParams.get('category') || 'all'
    const status = searchParams.get('status') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build where conditions
    const whereConditions: any = {
      uploadedBy: session.user.id
    }

    if (type !== 'all') {
      whereConditions.type = type.toUpperCase()
    }

    if (category !== 'all') {
      whereConditions.category = category.toUpperCase()
    }

    if (status !== 'all') {
      whereConditions.status = status.toUpperCase()
    }

    // Get documents with pagination
    const documents = await prisma.document.findMany({
      where: whereConditions,
      include: {
        uploader: {
          select: {
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    })

    // Get total count for pagination
    const totalCount = await prisma.document.count({
      where: whereConditions
    })

    // Calculate summary metrics
    const allDocuments = await prisma.document.findMany({
      where: {
        uploadedBy: session.user.id
      }
    })

    const totalDocuments = allDocuments.length
    const approvedDocuments = allDocuments.filter(d => d.status === 'APPROVED').length
    const pendingReview = allDocuments.filter(d => d.status === 'REVIEW').length
    const totalSize = allDocuments.reduce((sum, doc) => sum + (doc.fileSize || 0), 0)

    // Format documents for response
    const formattedDocuments = documents.map(document => ({
      id: document.id,
      name: document.name,
      type: document.type.toLowerCase(),
      category: document.category.toLowerCase(),
      size: document.fileSize || 0,
      uploadedAt: document.createdAt.toISOString().split('T')[0],
      uploadedBy: document.uploader?.name || 'Unknown',
      dealId: document.project?.id,
      dealTitle: document.project?.title,
      status: document.status.toLowerCase(),
      url: document.url,
      description: document.description
    }))

    return NextResponse.json({
      documents: formattedDocuments,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        currentPage: page,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      },
      summary: {
        totalDocuments,
        approvedDocuments,
        pendingReview,
        totalSize
      }
    })

  } catch (error) {
    console.error('Error fetching partner documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string || 'OTHER'
    const category = formData.get('category') as string || 'DEAL'
    const description = formData.get('description') as string
    const projectId = formData.get('projectId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // In a real implementation, you would upload the file to a cloud storage service
    // For now, we'll simulate the file upload and create a document record
    const fileUrl = `/uploads/${Date.now()}-${file.name}`
    
    const document = await prisma.document.create({
      data: {
        name: file.name,
        type: type.toUpperCase() as any,
        category: category.toUpperCase() as any,
        status: 'DRAFT',
        description,
        url: fileUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedBy: session.user.id,
        projectId: projectId || null
      },
      include: {
        uploader: {
          select: {
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    return NextResponse.json({
      id: document.id,
      name: document.name,
      type: document.type.toLowerCase(),
      category: document.category.toLowerCase(),
      size: document.fileSize || 0,
      uploadedAt: document.createdAt.toISOString().split('T')[0],
      uploadedBy: document.uploader?.name || 'Unknown',
      dealId: document.project?.id,
      dealTitle: document.project?.title,
      status: document.status.toLowerCase(),
      url: document.url,
      description: document.description
    })

  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { documentId, status } = await request.json()

    if (!documentId || !status) {
      return NextResponse.json({ error: 'Document ID and status are required' }, { status: 400 })
    }

    // Verify the document belongs to the current user
    const existingDocument = await prisma.document.findFirst({
      where: {
        id: documentId,
        uploadedBy: session.user.id
      }
    })

    if (!existingDocument) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Update document status
    const updatedDocument = await prisma.document.update({
      where: {
        id: documentId
      },
      data: {
        status: status.toUpperCase() as any
      },
      include: {
        uploader: {
          select: {
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    return NextResponse.json({
      id: updatedDocument.id,
      name: updatedDocument.name,
      type: updatedDocument.type.toLowerCase(),
      category: updatedDocument.category.toLowerCase(),
      size: updatedDocument.fileSize || 0,
      uploadedAt: updatedDocument.createdAt.toISOString().split('T')[0],
      uploadedBy: updatedDocument.uploader?.name || 'Unknown',
      dealId: updatedDocument.project?.id,
      dealTitle: updatedDocument.project?.title,
      status: updatedDocument.status.toLowerCase(),
      url: updatedDocument.url,
      description: updatedDocument.description
    })

  } catch (error) {
    console.error('Error updating document:', error)
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('id')

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
    }

    // Verify the document belongs to the current user
    const existingDocument = await prisma.document.findFirst({
      where: {
        id: documentId,
        uploadedBy: session.user.id
      }
    })

    if (!existingDocument) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Delete the document
    await prisma.document.delete({
      where: {
        id: documentId
      }
    })

    return NextResponse.json({ message: 'Document deleted successfully' })

  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}
