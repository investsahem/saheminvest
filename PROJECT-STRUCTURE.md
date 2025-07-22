# Investment Platform - Project Structure

## Overview

This document outlines the complete file and folder structure for the investment platform built with Next.js 15, Prisma, PostgreSQL, Cloudinary, and NextAuth.js.

## 📁 Root Directory Structure

```
investment-platform/
├── README.md
├── package.json
├── package-lock.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── postcss.config.mjs
├── .env.local
├── .env.example
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── middleware.ts
├── prisma/
├── public/
├── src/
├── docs/
├── tests/
└── scripts/
```

## 📄 Configuration Files

### Root Level Files

#### `package.json`
```json
{
  "name": "investment-platform",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@prisma/client": "^5.7.0",
    "next-auth": "^4.24.5",
    "@next-auth/prisma-adapter": "^1.0.7",
    "prisma": "^5.7.0",
    "cloudinary": "^1.41.0",
    "bcryptjs": "^2.4.3",
    "zod": "^3.22.4",
    "react-hook-form": "^7.48.2",
    "@hookform/resolvers": "^3.3.2",
    "tailwindcss": "^3.3.6",
    "lucide-react": "^0.298.0",
    "recharts": "^2.8.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.5",
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "@types/bcryptjs": "^2.4.6",
    "typescript": "^5.3.3",
    "eslint": "^8.56.0",
    "eslint-config-next": "^15.0.0",
    "prettier": "^3.1.1",
    "jest": "^29.7.0",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.6",
    "playwright": "^1.40.1"
  }
}
```

#### `next.config.ts`
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'lh3.googleusercontent.com'],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
```

#### `tailwind.config.ts`
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
        },
      },
    },
  },
  plugins: [],
}

export default config
```

#### `middleware.ts`
```typescript
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add custom middleware logic here
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

## 🗄️ Database Structure

### `prisma/` Directory
```
prisma/
├── schema.prisma
├── seed.ts
├── migrations/
│   └── (migration files)
└── seeds/
    ├── users.ts
    ├── projects.ts
    └── investments.ts
```

#### `prisma/schema.prisma`
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  INVESTOR
  PROJECT_OWNER
  ADMIN
}

enum ProjectStatus {
  DRAFT
  PENDING
  ACTIVE
  FUNDED
  COMPLETED
  CANCELLED
}

enum InvestmentStatus {
  PENDING
  ACTIVE
  COMPLETED
  CANCELLED
}

enum TransactionType {
  DEPOSIT
  WITHDRAWAL
  INVESTMENT
  RETURN
  FEE
}

model User {
  id                String        @id @default(cuid())
  email             String        @unique
  name              String?
  image             String?
  role              UserRole      @default(INVESTOR)
  emailVerified     DateTime?
  isActive          Boolean       @default(true)
  
  // Profile information
  phone             String?
  address           String?
  dateOfBirth       DateTime?
  kycVerified       Boolean       @default(false)
  
  // Financial
  walletBalance     Decimal       @default(0) @db.Decimal(15, 2)
  totalInvested     Decimal       @default(0) @db.Decimal(15, 2)
  totalReturns      Decimal       @default(0) @db.Decimal(15, 2)
  
  // Relationships
  accounts          Account[]
  sessions          Session[]
  projects          Project[]
  investments       Investment[]
  transactions      Transaction[]
  notifications     Notification[]
  
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  
  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model Project {
  id               String        @id @default(cuid())
  title            String
  description      String        @db.Text
  category         String
  
  // Financial details
  fundingGoal      Decimal       @db.Decimal(15, 2)
  currentFunding   Decimal       @default(0) @db.Decimal(15, 2)
  minInvestment    Decimal       @db.Decimal(15, 2)
  expectedReturn   Decimal       @db.Decimal(5, 2)
  duration         Int
  
  // Status and dates
  status           ProjectStatus @default(DRAFT)
  startDate        DateTime?
  endDate          DateTime?
  
  // Media and documents
  images           String[]
  documents        String[]
  
  // Owner information
  ownerId          String
  owner            User          @relation(fields: [ownerId], references: [id])
  
  // Relationships
  investments      Investment[]
  transactions     Transaction[]
  
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
  
  @@map("projects")
}

model Investment {
  id               String           @id @default(cuid())
  amount           Decimal          @db.Decimal(15, 2)
  status           InvestmentStatus @default(PENDING)
  expectedReturn   Decimal          @db.Decimal(15, 2)
  actualReturn     Decimal          @default(0) @db.Decimal(15, 2)
  
  // Relationships
  investorId       String
  investor         User             @relation(fields: [investorId], references: [id])
  projectId        String
  project          Project          @relation(fields: [projectId], references: [id])
  
  // Tracking
  investmentDate   DateTime         @default(now())
  lastReturnDate   DateTime?
  
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt
  
  @@map("investments")
}

model Transaction {
  id               String          @id @default(cuid())
  amount           Decimal         @db.Decimal(15, 2)
  type             TransactionType
  description      String?
  status           String          @default("completed")
  
  // Relationships
  userId           String
  user             User            @relation(fields: [userId], references: [id])
  projectId        String?
  project          Project?        @relation(fields: [projectId], references: [id])
  
  // Transaction details
  reference        String?         @unique
  metadata         Json?
  
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt
  
  @@map("transactions")
}

model Notification {
  id               String          @id @default(cuid())
  title            String
  message          String          @db.Text
  type             String
  read             Boolean         @default(false)
  
  // Relationships
  userId           String
  user             User            @relation(fields: [userId], references: [id])
  
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt
  
  @@map("notifications")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verificationtokens")
}
```

## 🌐 Public Assets

### `public/` Directory
```
public/
├── favicon.ico
├── logo.svg
├── images/
│   ├── hero-bg.jpg
│   ├── default-avatar.png
│   ├── default-project.jpg
│   └── placeholders/
│       ├── project-placeholder.svg
│       └── user-placeholder.svg
├── icons/
│   ├── apple-touch-icon.png
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   └── android-chrome-192x192.png
└── documents/
    ├── terms-of-service.pdf
    ├── privacy-policy.pdf
    └── investment-guide.pdf
```

## 🎨 Source Code Structure

### `src/` Directory
```
src/
├── app/
├── components/
├── lib/
├── types/
├── hooks/
├── utils/
├── constants/
└── styles/
```

### `src/app/` Directory (Next.js 15 App Router)
```
src/app/
├── layout.tsx
├── page.tsx
├── globals.css
├── loading.tsx
├── error.tsx
├── not-found.tsx
├── api/
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.ts
│   ├── users/
│   │   ├── route.ts
│   │   ├── profile/
│   │   │   └── route.ts
│   │   └── wallet/
│   │       ├── route.ts
│   │       ├── deposit/
│   │       │   └── route.ts
│   │       └── withdraw/
│   │           └── route.ts
│   ├── projects/
│   │   ├── route.ts
│   │   ├── [id]/
│   │   │   └── route.ts
│   │   └── search/
│   │       └── route.ts
│   ├── investments/
│   │   ├── route.ts
│   │   ├── portfolio/
│   │   │   └── route.ts
│   │   └── [id]/
│   │       └── route.ts
│   ├── transactions/
│   │   ├── route.ts
│   │   └── distribute/
│   │       └── route.ts
│   ├── upload/
│   │   └── route.ts
│   ├── admin/
│   │   ├── users/
│   │   │   └── route.ts
│   │   ├── projects/
│   │   │   └── route.ts
│   │   └── analytics/
│   │       └── route.ts
│   └── notifications/
│       └── route.ts
├── auth/
│   ├── signin/
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── signup/
│   │   ├── page.tsx
│   │   └── loading.tsx
│   └── error/
│       └── page.tsx
├── dashboard/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── investor/
│   │   ├── page.tsx
│   │   ├── portfolio/
│   │   │   └── page.tsx
│   │   ├── investments/
│   │   │   └── page.tsx
│   │   └── transactions/
│   │       └── page.tsx
│   ├── project-owner/
│   │   ├── page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   ├── create/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   └── revenue/
│   │       └── page.tsx
│   └── profile/
│       ├── page.tsx
│       └── settings/
│           └── page.tsx
├── admin/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── users/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── projects/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── investments/
│   │   └── page.tsx
│   ├── transactions/
│   │   └── page.tsx
│   ├── analytics/
│   │   └── page.tsx
│   └── settings/
│       └── page.tsx
├── projects/
│   ├── page.tsx
│   ├── [id]/
│   │   ├── page.tsx
│   │   └── invest/
│   │       └── page.tsx
│   └── category/
│       └── [category]/
│           └── page.tsx
├── about/
│   └── page.tsx
├── contact/
│   └── page.tsx
├── legal/
│   ├── terms/
│   │   └── page.tsx
│   ├── privacy/
│   │   └── page.tsx
│   └── disclaimer/
│       └── page.tsx
└── search/
    └── page.tsx
```

### `src/components/` Directory
```
src/components/
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Textarea.tsx
│   ├── Select.tsx
│   ├── Modal.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Alert.tsx
│   ├── Spinner.tsx
│   ├── Tooltip.tsx
│   ├── Dropdown.tsx
│   ├── Tabs.tsx
│   ├── Table.tsx
│   ├── Pagination.tsx
│   ├── Chart.tsx
│   ├── Progress.tsx
│   ├── Avatar.tsx
│   ├── Skeleton.tsx
│   └── index.ts
├── layout/
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── Footer.tsx
│   ├── Navigation.tsx
│   ├── MobileMenu.tsx
│   ├── Breadcrumb.tsx
│   └── index.ts
├── forms/
│   ├── AuthForm.tsx
│   ├── InvestmentForm.tsx
│   ├── ProjectForm.tsx
│   ├── ProfileForm.tsx
│   ├── WalletForm.tsx
│   ├── SearchForm.tsx
│   └── index.ts
├── dashboard/
│   ├── PortfolioOverview.tsx
│   ├── InvestmentCard.tsx
│   ├── ProjectCard.tsx
│   ├── TransactionHistory.tsx
│   ├── Analytics.tsx
│   ├── RevenueChart.tsx
│   ├── InvestorsList.tsx
│   ├── ProjectStats.tsx
│   ├── WalletBalance.tsx
│   ├── NotificationPanel.tsx
│   └── index.ts
├── project/
│   ├── ProjectListing.tsx
│   ├── ProjectDetail.tsx
│   ├── ProjectFilters.tsx
│   ├── ProjectSearch.tsx
│   ├── ProjectGallery.tsx
│   ├── InvestmentInterface.tsx
│   ├── ProjectProgress.tsx
│   └── index.ts
├── admin/
│   ├── AdminOverview.tsx
│   ├── UserManagement.tsx
│   ├── ProjectModeration.tsx
│   ├── SystemSettings.tsx
│   ├── SecurityMonitoring.tsx
│   ├── PlatformAnalytics.tsx
│   └── index.ts
├── common/
│   ├── ErrorBoundary.tsx
│   ├── LoadingSpinner.tsx
│   ├── EmptyState.tsx
│   ├── ImageUpload.tsx
│   ├── FileUpload.tsx
│   ├── SearchBar.tsx
│   ├── FilterPanel.tsx
│   ├── SortDropdown.tsx
│   └── index.ts
└── providers/
    ├── AuthProvider.tsx
    ├── ThemeProvider.tsx
    ├── QueryProvider.tsx
    └── index.ts
```

### `src/lib/` Directory
```
src/lib/
├── auth.ts
├── db.ts
├── cloudinary.ts
├── email.ts
├── security.ts
├── validations.ts
├── utils.ts
├── constants.ts
├── encryption.ts
├── payments.ts
└── api.ts
```

#### Key Library Files

##### `src/lib/auth.ts`
```typescript
import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./db"

export const authOptions: NextAuthOptions = {
  // Configuration details...
}
```

##### `src/lib/db.ts`
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

##### `src/lib/cloudinary.ts`
```typescript
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const uploadImage = async (file: File, folder: string) => {
  // Implementation...
}

export const deleteImage = async (publicId: string) => {
  // Implementation...
}
```

### `src/types/` Directory
```
src/types/
├── auth.ts
├── user.ts
├── project.ts
├── investment.ts
├── transaction.ts
├── notification.ts
├── api.ts
└── index.ts
```

#### Key Type Definitions

##### `src/types/user.ts`
```typescript
export interface User {
  id: string
  email: string
  name?: string
  image?: string
  role: 'INVESTOR' | 'PROJECT_OWNER' | 'ADMIN'
  walletBalance: number
  totalInvested: number
  totalReturns: number
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile extends User {
  phone?: string
  address?: string
  dateOfBirth?: Date
  kycVerified: boolean
}
```

##### `src/types/project.ts`
```typescript
export interface Project {
  id: string
  title: string
  description: string
  category: string
  fundingGoal: number
  currentFunding: number
  minInvestment: number
  expectedReturn: number
  duration: number
  status: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'FUNDED' | 'COMPLETED' | 'CANCELLED'
  images: string[]
  documents: string[]
  ownerId: string
  owner: User
  createdAt: Date
  updatedAt: Date
}
```

### `src/hooks/` Directory
```
src/hooks/
├── useAuth.ts
├── useUser.ts
├── useProjects.ts
├── useInvestments.ts
├── useTransactions.ts
├── useWallet.ts
├── useNotifications.ts
├── useLocalStorage.ts
├── useDebounce.ts
└── index.ts
```

### `src/utils/` Directory
```
src/utils/
├── format.ts
├── validation.ts
├── calculations.ts
├── date.ts
├── currency.ts
├── image.ts
├── api.ts
└── index.ts
```

## 🧪 Testing Structure

### `tests/` Directory
```
tests/
├── __mocks__/
│   ├── next-auth.ts
│   ├── prisma.ts
│   └── cloudinary.ts
├── components/
│   ├── ui/
│   │   ├── Button.test.tsx
│   │   ├── Input.test.tsx
│   │   └── Modal.test.tsx
│   ├── forms/
│   │   ├── AuthForm.test.tsx
│   │   ├── InvestmentForm.test.tsx
│   │   └── ProjectForm.test.tsx
│   └── dashboard/
│       ├── PortfolioOverview.test.tsx
│       ├── InvestmentCard.test.tsx
│       └── ProjectCard.test.tsx
├── api/
│   ├── auth.test.ts
│   ├── users.test.ts
│   ├── projects.test.ts
│   ├── investments.test.ts
│   └── transactions.test.ts
├── lib/
│   ├── auth.test.ts
│   ├── db.test.ts
│   ├── cloudinary.test.ts
│   └── utils.test.ts
├── e2e/
│   ├── auth.spec.ts
│   ├── investment-flow.spec.ts
│   ├── project-creation.spec.ts
│   └── admin-dashboard.spec.ts
├── setup.ts
├── jest.config.js
└── playwright.config.ts
```

## 📝 Documentation

### `docs/` Directory
```
docs/
├── API.md
├── DEPLOYMENT.md
├── SECURITY.md
├── TESTING.md
├── CONTRIBUTING.md
├── CHANGELOG.md
└── components/
    ├── UI_COMPONENTS.md
    ├── FORMS.md
    └── LAYOUTS.md
```

## 🔧 Scripts

### `scripts/` Directory
```
scripts/
├── setup.sh
├── deploy.sh
├── backup.sh
├── migration.js
├── seed-data.js
└── cleanup.js
```

## 📊 Environment Variables

### `.env.example`
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

# Security
ENCRYPTION_KEY="your-encryption-key"
JWT_SECRET="your-jwt-secret"

# Monitoring
SENTRY_DSN="your-sentry-dsn"
ANALYTICS_ID="your-analytics-id"
```

## 🎯 Key Features by Directory

### Authentication (`src/app/auth/`)
- User registration and login
- OAuth integration (Google)
- Email verification
- Password reset functionality

### Dashboard (`src/app/dashboard/`)
- Investor dashboard with portfolio overview
- Project owner dashboard with analytics
- Profile management
- Settings and preferences

### Admin Panel (`src/app/admin/`)
- User management and moderation
- Project approval workflow
- Platform analytics and reporting
- System configuration

### API Routes (`src/app/api/`)
- RESTful API endpoints
- Authentication middleware
- Data validation and sanitization
- Error handling and logging

### Components (`src/components/`)
- Reusable UI components
- Form components with validation
- Dashboard-specific components
- Layout and navigation components

This structure provides a scalable foundation for the investment platform, with clear separation of concerns and modular organization that supports maintainability and team collaboration. 