import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
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
    const searchTerm = searchParams.get('search') || ''

    // Build where clause for documents
    const whereClause: any = {
      uploadedBy: session.user.id
    }

    // Filter by type
    if (type !== 'all') {
      const typeMapping: { [key: string]: string } = {
        'statements': 'REPORT',
        'contracts': 'CONTRACT', 
        'tax': 'REPORT',
        'certificates': 'OTHER'
      }
      whereClause.type = typeMapping[type] || type.toUpperCase()
    }

    // Filter by category
    if (category !== 'all') {
      const categoryMapping: { [key: string]: string } = {
        'statements': 'FINANCIAL',
        'contracts': 'LEGAL',
        'tax': 'COMPLIANCE',
        'certificates': 'COMPLIANCE'
      }
      whereClause.category = categoryMapping[category] || category.toUpperCase()
    }

    // Filter by status
    if (status !== 'all') {
      const statusMapping: { [key: string]: string } = {
        'available': 'APPROVED',
        'processing': 'REVIEW',
        'draft': 'DRAFT',
        'archived': 'ARCHIVED'
      }
      whereClause.status = statusMapping[status] || status.toUpperCase()
    }

    // Search filter
    if (searchTerm) {
      whereClause.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } }
      ]
    }

    // Fetch documents from database
    const documents = await prisma.document.findMany({
      where: whereClause,
      include: {
        project: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate summary statistics
    const totalDocuments = documents.length
    const statementCount = documents.filter(doc => doc.type === 'REPORT' && doc.category === 'FINANCIAL').length
    const contractCount = documents.filter(doc => doc.type === 'CONTRACT').length
    const certificateCount = documents.filter(doc => doc.type === 'OTHER').length
    const taxCount = documents.filter(doc => doc.type === 'REPORT' && doc.category === 'COMPLIANCE').length
    const importantCount = documents.filter(doc => (doc.metadata as any)?.isImportant).length

    // Format documents for frontend
    const formattedDocuments = documents.map(doc => {
      const metadata = doc.metadata as any || {}
      return {
        id: doc.id,
        name: doc.name,
        type: getDisplayType(doc.type, doc.category),
        category: getDisplayCategory(doc.category),
        size: doc.fileSize ? formatFileSize(Number(doc.fileSize)) : 'Unknown',
        format: doc.mimeType?.split('/')[1]?.toUpperCase() || 'PDF',
        date: doc.createdAt.toISOString(),
        status: getDisplayStatus(doc.status),
        description: doc.description || '',
        dealId: doc.projectId,
        dealName: doc.project?.title || null,
        downloadCount: metadata.downloadCount || 0,
        isImportant: metadata.isImportant || false,
        tags: metadata.tags || [],
        uploadedBy: metadata.uploadedBy || 'System',
        url: doc.url
      }
    })

    return NextResponse.json({
      documents: formattedDocuments,
      summary: {
        totalDocuments,
        statementCount,
        contractCount,
        certificateCount,
        taxCount,
        importantCount,
        totalSize: documents.reduce((sum, doc) => sum + Number(doc.fileSize || 0), 0)
      }
    })

  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// Helper function to get display type
function getDisplayType(dbType: string, dbCategory: string): string {
  if (dbType === 'REPORT') {
    if (dbCategory === 'FINANCIAL') return 'statement'
    if (dbCategory === 'COMPLIANCE') return 'tax'
    return 'statement'
  }
  if (dbType === 'CONTRACT') return 'contract'
  if (dbType === 'OTHER') return 'certificate'
  return dbType.toLowerCase()
}

// Helper function to get display category
function getDisplayCategory(dbCategory: string): string {
  const categoryMapping: { [key: string]: string } = {
    'FINANCIAL': 'Monthly Statement',
    'LEGAL': 'Investment Contract',
    'COMPLIANCE': 'Tax Statement',
    'DEAL': 'Deal Documents',
    'MARKETING': 'Marketing Materials'
  }
  return categoryMapping[dbCategory] || dbCategory
}

// Helper function to get display status
function getDisplayStatus(dbStatus: string): string {
  const statusMapping: { [key: string]: string } = {
    'APPROVED': 'available',
    'REVIEW': 'processing',
    'DRAFT': 'draft',
    'ARCHIVED': 'archived'
  }
  return statusMapping[dbStatus] || dbStatus.toLowerCase()
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      name, 
      type, 
      category, 
      description, 
      projectId, 
      fileSize, 
      fileType, 
      tags, 
      isImportant 
    } = body

    // Create new document
    const document = await prisma.document.create({
      data: {
        name,
        type: type.toUpperCase(),
        category: category.toUpperCase(),
        description,
        url: '/temp/placeholder.pdf', // Placeholder URL
        fileName: `${name}.pdf`,
        fileSize: fileSize ? Number(fileSize) : null,
        mimeType: fileType || 'application/pdf',
        uploadedBy: session.user.id,
        projectId: projectId || null,
        metadata: {
          tags: tags || [],
          isImportant: isImportant || false,
          uploadedByName: session.user.name || session.user.email
        },
        status: 'DRAFT'
      },
      include: {
        project: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    const metadata = document.metadata as any || {}
    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        name: document.name,
        type: getDisplayType(document.type, document.category),
        category: getDisplayCategory(document.category),
        size: document.fileSize ? formatFileSize(Number(document.fileSize)) : 'Unknown',
        format: document.mimeType?.split('/')[1]?.toUpperCase() || 'PDF',
        date: document.createdAt.toISOString(),
        status: getDisplayStatus(document.status),
        description: document.description || '',
        dealId: document.projectId,
        dealName: document.project?.title || null,
        downloadCount: 0,
        isImportant: metadata.isImportant || false,
        tags: metadata.tags || [],
        uploadedBy: metadata.uploadedByName || 'System'
      }
    })

  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    )
  }
}
