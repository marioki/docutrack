// lib/auth.ts
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET!;

export interface JwtPayload {
    id: string;
    role: 'USER' | 'ADMIN';
}

// Firmar token 15 min
export function signJwt(payload: JwtPayload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

// Leer token
export function verifyJwt(token: string) {
    try {
        return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
        return null;
    }
}

// Escribir cookie HttpOnly
export async function setAuthCookie(token: string) {
    (await cookies()).set('token', token, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        maxAge: 60 * 15,
    });
}

// Borrar cookie
export async function clearAuthCookie() {
    (await cookies()).set('token', '', { path: '/', maxAge: 0 });
}


// Devuelve una respuesta con cookie seteada
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