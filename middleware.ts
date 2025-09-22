// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value

  // Liberar o acesso à página de login e arquivos públicos
  const publicPaths = ['/login', '/favicon.ico', '/_next', '/api']
  const isPublic = publicPaths.some((path) => req.nextUrl.pathname.startsWith(path))

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (token && req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth|api).*)',
  ],
}