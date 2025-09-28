import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const text = searchParams.get('text') || 'Image'
  const width = parseInt(searchParams.get('w') || '800')
  const height = parseInt(searchParams.get('h') || '600')
  
  // Create a simple SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#4F46E5"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">
        ${text}
      </text>
      <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="16" fill="#E5E7EB" text-anchor="middle" dominant-baseline="middle">
        Uploaded: ${new Date().toLocaleTimeString()}
      </text>
    </svg>
  `
  
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  })
}
