import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/auth',
  '/onboarding',
  '/explore',
  '/trending',
  '/launch',
  '/community',
]

// Routes that should never redirect (API, static, etc.)
const BYPASS_ROUTES = [
  '/api/',
  '/_next/',
  '/favicon.ico',
  '/sw.js',
  '/manifest.json',
]

function isPublicRoute(pathname: string): boolean {
  // Check exact matches and prefix matches
  return PUBLIC_ROUTES.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  )
}

function shouldBypass(pathname: string): boolean {
  return BYPASS_ROUTES.some(route => pathname.startsWith(route))
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Skip auth check for bypass routes (API, static assets)
  if (shouldBypass(pathname)) {
    return supabaseResponse
  }

  // Allow public routes without authentication
  if (isPublicRoute(pathname)) {
    return supabaseResponse
  }

  // Protected route - redirect to login if no user
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
