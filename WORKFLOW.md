# Investment Platform - Development Workflow

## Project Overview

Build a modern investment platform connecting project owners with investors, featuring automated revenue distribution, real-time tracking, and comprehensive dashboard management.

### Key Features
- **Timeline**: 30 days MVP delivery
- **User Types**: Investors, Project Owners, Admin
- **Core Features**: Portfolio tracking, Auto revenue distribution

## Technology Stack

### Frontend & Backend
- **Next.js 15**: App Router, Server Components, Server Actions
- **Tailwind CSS**: Styling framework with custom design system
- **NextAuth.js**: Authentication with OAuth and credentials
- **TypeScript**: Full type safety across the application

### Database & Services
- **PostgreSQL**: Primary database for production
- **Prisma ORM**: Type-safe database toolkit and query builder
- **Cloudinary**: Image and file storage with optimization
- **Brevo**: Email service for notifications and communications

## Development Workflow

### 1. Environment Setup

```bash
# Initialize Next.js 15 project
npx create-next-app@latest investment-platform --typescript --tailwind --eslint --app

# Install dependencies
npm install @prisma/client prisma @next-auth/prisma-adapter next-auth
npm install cloudinary @types/bcryptjs bcryptjs
npm install @hookform/resolvers react-hook-form zod
npm install lucide-react @radix-ui/react-*
```

### 2. Database Setup

```bash
# Initialize Prisma
npx prisma init

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database
npx prisma db seed
```

### 3. Authentication Configuration

#### NextAuth Setup
```typescript
// lib/auth.ts
import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      // Implementation details...
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub
        session.user.role = token.role
      }
      return session
    }
  }
}
```

#### Middleware Protection
```typescript
// middleware.ts
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Custom middleware logic
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        if (pathname.startsWith("/admin")) {
          return token?.role === "ADMIN"
        }
        
        if (pathname.startsWith("/dashboard")) {
          return !!token
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/api/protected/:path*"]
}
```

### 4. File Upload System

#### Cloudinary Configuration
```typescript
// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const uploadImage = async (file: File, folder: string = 'investment-platform') => {
  try {
    const buffer = await file.arrayBuffer()
    const bytes = Buffer.from(buffer)
    
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: folder,
          transformation: [
            { width: 1024, height: 768, crop: 'limit', quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(bytes)
    })
  } catch (error) {
    throw new Error('Failed to upload image')
  }
}
```

### 5. API Development Standards

#### Route Structure
```typescript
// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Implementation...
}

export async function POST(request: NextRequest) {
  // Implementation...
}
```

#### Data Validation
```typescript
// lib/validations.ts
import { z } from 'zod'

export const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  fundingGoal: z.number().min(1000, 'Minimum funding goal is $1,000'),
  expectedReturn: z.number().min(0).max(100, 'Expected return must be between 0-100%'),
  duration: z.number().min(30, 'Minimum duration is 30 days'),
})
```

### 6. Component Development

#### Component Structure
```typescript
// components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  onClick,
  disabled = false
}) => {
  // Implementation...
}
```

### 7. Testing Strategy

#### Unit Testing
- Component testing with Jest and React Testing Library
- API endpoint testing with supertest
- Database query testing with test database
- Utility function testing

#### Integration Testing
- End-to-end user flows with Playwright
- Payment system testing
- Email notification testing
- File upload testing

#### Test Commands
```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### 8. Security Implementation

#### Security Checklist
- [x] JWT token validation
- [x] Role-based access control
- [x] Session management
- [x] Password hashing (bcrypt)
- [x] Input validation and sanitization
- [x] SQL injection prevention (Prisma)
- [x] XSS protection
- [x] CSRF protection
- [x] Rate limiting
- [x] File upload validation

#### Security Middleware
```typescript
// lib/security.ts
import rateLimit from 'express-rate-limit'

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
})

export const validateInput = (data: any, schema: any) => {
  return schema.validate(data)
}
```

### 9. Deployment Workflow

#### Environment Variables
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/investment_platform"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email Service
BREVO_API_KEY="your-brevo-api-key"
FROM_EMAIL="noreply@yourdomain.com"

# Platform Settings
PLATFORM_FEE_PERCENTAGE="2.5"
MIN_INVESTMENT_AMOUNT="100"
MAX_INVESTMENT_AMOUNT="50000"
```

#### Deployment Steps
1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Setup PostgreSQL database (Neon, Supabase, or Railway)
4. Run database migrations in production
5. Configure custom domain and SSL
6. Setup monitoring and analytics

### 10. Code Quality Standards

#### ESLint Configuration
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "no-unused-vars": "error",
    "no-console": "warn",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

#### Git Workflow
1. Feature branches from `main`
2. Commit messages follow conventional commits
3. Pull request reviews required
4. Automated testing before merge
5. Deployment from `main` branch

### 11. Performance Optimization

#### Next.js 15 Optimizations
- Server Components for better performance
- Image optimization with next/image
- Dynamic imports for code splitting
- API route optimization
- Database query optimization with Prisma

#### Monitoring
- Error tracking with Sentry
- Performance monitoring with Vercel Analytics
- Database monitoring with Prisma Pulse
- User analytics with Google Analytics

## Best Practices

1. **Type Safety**: Use TypeScript throughout the application
2. **Error Handling**: Implement proper error boundaries and API error responses
3. **Loading States**: Show loading indicators for better UX
4. **Accessibility**: Follow WCAG guidelines
5. **SEO**: Implement proper meta tags and structured data
6. **Mobile First**: Design for mobile devices first
7. **Security**: Regular security audits and dependency updates
8. **Documentation**: Keep README and API documentation updated
9. **Testing**: Maintain test coverage above 80%
10. **Code Reviews**: All code changes require peer review 