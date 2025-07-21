import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from './app/lib/auth';

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const token = req.cookies.get('token')?.value;
    const payload = token ? await verifyJwt(token) : null;

    if (!payload) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    const isAdminRoute = pathname.startsWith('/admin');
    if (isAdminRoute && payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/forbidden', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard', '/admin/:path*'],
};
