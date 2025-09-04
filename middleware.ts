import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add custom middleware logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Allow debug pages without authentication
        if (pathname.startsWith("/debug")) {
          return true
        }
        
        // Allow all auth pages without authentication
        if (pathname.startsWith("/auth")) {
          return true
        }
        
        // Log token for debugging (only in development)
        if (process.env.NODE_ENV === 'development') {
          console.log('Middleware - Path:', pathname, 'Token role:', token?.role, 'Token exists:', !!token)
        }
        
        // Admin routes
        if (pathname.startsWith("/admin")) {
          return token?.role === "ADMIN"
        }
        
        // Deal Manager routes
        if (pathname.startsWith("/deal-manager")) {
          return token?.role === "DEAL_MANAGER" || token?.role === "ADMIN"
        }
        
        // Financial Officer routes
        if (pathname.startsWith("/financial-officer")) {
          return token?.role === "FINANCIAL_OFFICER" || token?.role === "ADMIN"
        }
        
        // Portfolio Advisor routes
        if (pathname.startsWith("/portfolio-advisor")) {
          return token?.role === "PORTFOLIO_ADVISOR" || token?.role === "ADMIN"
        }
        
        // Investor/Portfolio routes
        if (pathname.startsWith("/portfolio")) {
          return token?.role === "INVESTOR" || token?.role === "ADMIN"
        }
        
        // Partner routes
        if (pathname.startsWith("/partner")) {
          return token?.role === "PARTNER" || token?.role === "ADMIN"
        }
        
        // Dashboard routes (legacy)
        if (pathname.startsWith("/dashboard")) {
          return !!token
        }
        
        // Project owner routes (legacy)
        if (pathname.startsWith("/dashboard/project-owner")) {
          return token?.role === "PARTNER" || token?.role === "ADMIN"
        }
        
        // Investor routes (legacy)
        if (pathname.startsWith("/dashboard/investor")) {
          return token?.role === "INVESTOR" || token?.role === "ADMIN"
        }
        
        // Protected API routes
        if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) {
          return !!token
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    // Protected routes that require authentication
    "/dashboard/:path*", 
    "/admin/:path*",
    "/deal-manager/:path*",
    "/financial-officer/:path*",
    "/portfolio-advisor/:path*",
    "/portfolio/:path*", 
    "/partner/:path*",
    // API routes (excluding auth and public)
    "/api/((?!auth|public).)*"
  ]
} 