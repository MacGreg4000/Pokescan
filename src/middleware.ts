import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_ADMIN_PATHS = ['/admin/login']
const PUBLIC_API_PATHS = ['/api/auth/']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Routes publiques — laisser passer
  if (PUBLIC_ADMIN_PATHS.some(p => pathname.startsWith(p))) return NextResponse.next()
  if (PUBLIC_API_PATHS.some(p => pathname.startsWith(p))) return NextResponse.next()

  // Vérifier le cookie de session
  const session = req.cookies.get('pokescan_session')?.value
  const token = process.env.ADMIN_SESSION_TOKEN

  if (!token || session !== token) {
    const loginUrl = new URL('/admin/login', req.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  // Protège toutes les routes /admin/* et /api/admin/*
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
