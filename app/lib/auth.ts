import * as jose from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET!;

export interface JwtPayload {
    id: string;
    role: 'USER' | 'ADMIN';
    [key: string]: any;
}

export async function signJwt(payload: JwtPayload) {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('15m')
        .sign(secret);
    return token;
}

export async function verifyJwt(token: string) {
    try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jose.jwtVerify(token, secret);
        return payload as JwtPayload;
    } catch (error) {
        return null;
    }
}

export async function setAuthCookie(token: string) {
    (await cookies()).set('token', token, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        maxAge: 60 * 15,
    });
}

export async function clearAuthCookie() {
    (await cookies()).set('token', '', { path: '/', maxAge: 0 });
}

export function jsonWithAuthCookie(data: Record<string, unknown>,
    token: string, status = 200) {
    const res = NextResponse.json(data, { status });
    res.cookies.set({
        name: 'token',
        value: token,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 15,
    });
    return res;
}