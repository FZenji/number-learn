import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default clerkMiddleware((auth, request: NextRequest) => {
  // Explicitly skip Next.js internal paths (HMR, static assets, etc.)
  if (request.nextUrl.pathname.startsWith('/_next')) {
    return NextResponse.next()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals (including HMR WebSocket) and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
