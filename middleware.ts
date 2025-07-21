import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from './app/lib/auth';

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const isUserRoute = pathname.startsWith('/user');
    const isAdminRoute = pathname.startsWith('/admin');

    if (!isUserRoute && !isAdminRoute) return NextResponse.next();

    const token = req.cookies.get('token')?.value;
    const payload = token && verifyJwt(token);

    if (!payload) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    if (isAdminRoute && payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/forbidden', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/user/:path*', '/admin/:path*'],
};
