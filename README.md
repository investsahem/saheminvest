# Sahem Invest - Investment Platform

A comprehensive investment platform built with Next.js 15, featuring role-based dashboards, multi-language support, and modern UI/UX design.

## 🚀 Features

### Multi-Role Dashboard System
- **Admin Dashboard** - User management, system analytics, platform oversight
- **Deal Manager Dashboard** - Deal creation, partner management, investor relations  
- **Financial Officer Dashboard** - Financial reporting, transaction monitoring, cash flow analysis
- **Portfolio Advisor Dashboard** - Client management, portfolio optimization, performance tracking
- **Investor Dashboard** - Portfolio overview, investment tracking, returns analysis
- **Partner Dashboard** - Deal submissions, funding progress, performance metrics

### Core Features
- 🔐 **NextAuth.js Authentication** - Secure login with credentials and Google OAuth
- 🌐 **Multi-language Support** - Arabic and English with RTL/LTR layouts
- 📱 **Responsive Design** - Mobile-first approach with Tailwind CSS
- 🎨 **Modern UI Components** - Custom components with smooth animations
- 📊 **Interactive Charts** - Data visualization with Recharts
- 🛡️ **Role-based Access Control** - Middleware-protected routes
- 🗃️ **PostgreSQL Database** - Prisma ORM with type-safe queries

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **Charts**: Recharts
- **Deployment**: Vercel + Neon PostgreSQL

## 🚀 Deployment Instructions

### 1. Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository: `https://github.com/investsahem/saheminvest.git`
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 2. Set up Neon PostgreSQL

1. Go to [Neon](https://neon.tech) and create an account
2. Create a new project
3. Copy the connection string (it will look like): 
   ```
   postgresql://username:password@hostname/database?sslmode=require
   ```

### 3. Configure Environment Variables in Vercel

Add these environment variables in your Vercel project settings:

```bash
# Database (Replace with your Neon connection string)
DATABASE_URL="postgresql://username:password@hostname/database?sslmode=require"

# NextAuth.js (Replace with your domain)
NEXTAUTH_URL="https://your-vercel-app.vercel.app"
NEXTAUTH_SECRET="ddf965f43086c7065cf64dec8eabd19f2aa1dd5bd3908124c73557caba7ed1f5"

# Google OAuth (Optional - for Google sign-in)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Platform Settings
PLATFORM_FEE_PERCENTAGE="2.5"
MIN_INVESTMENT_AMOUNT="100"
MAX_INVESTMENT_AMOUNT="50000"

# Security
ENCRYPTION_KEY="368d2f486cb86664179187677c885b945518f80e6136c5ef403983766d8eb833"
JWT_SECRET="d3dc06cc5873523a1a16dbd3ee1feeb84c2fa47c8cb19c1b57399cae01ab848e"
```

### 4. Database Setup

After deployment, run database migrations:

1. In your Vercel project, go to the "Functions" tab
2. Or use Vercel CLI locally:
   ```bash
   npx vercel env pull .env.local
   npx prisma migrate deploy
   npx prisma db seed
   ```

## 🔐 Default Login Credentials

For testing purposes, you can create users with these roles:
- **Admin**: Full system access
- **Deal Manager**: Deal and partner management  
- **Financial Officer**: Financial reporting and analysis
- **Portfolio Advisor**: Client and portfolio management
- **Investor**: Investment tracking and portfolio view
- **Partner**: Deal submission and progress tracking

## 🌍 Supported Languages

- **English** (Default)
- **Arabic** (RTL support)

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px  
- **Desktop**: > 1024px
- **XL Desktop**: > 1280px

## 🛠️ Development

To run locally:

```bash
# Clone the repository
git clone https://github.com/investsahem/saheminvest.git
cd saheminvest

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Run database migrations
npx prisma migrate dev
npx prisma db seed

# Start development server
npm run dev
```

Visit `http://localhost:3000`

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

For support, email support@sahaminvest.com or create an issue on GitHub.

---

Built with ❤️ using Next.js 15 and Modern Web Technologies
