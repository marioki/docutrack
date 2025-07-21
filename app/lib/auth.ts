// lib/auth.ts
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

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
