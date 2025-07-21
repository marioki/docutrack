import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin as db } from '../../../lib/supabase';
import { signJwt, jsonWithAuthCookie } from '../../../lib/auth';

export async function POST(req: Request) {
    const { email, password } = await req.json();

    const { data: user, error } = await db
        .from('users')
        .select('id, password_hash, role')
        .eq('email', email)
        .single();

    if (error || !user) {
        return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
        return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const token = signJwt({ id: user.id, role: user.role as 'USER' | 'ADMIN' });
    return jsonWithAuthCookie({ id: user.id, email }, token);
}
