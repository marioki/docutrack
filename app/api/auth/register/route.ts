import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin as db } from '../../../lib/supabase';
import { signJwt, setAuthCookie } from '../../../lib/auth';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();
        if (!email || !password) {
            return NextResponse.json({ error: 'Email y password requeridos' }, { status: 400 });
        }

        // ¿email duplicado?
        const { count } = await db
            .from('users')
            .select('id', { head: true, count: 'exact' })
            .eq('email', email);
        if (count && count > 0) {
            return NextResponse.json({ error: 'Usuario ya existe' }, { status: 409 });
        }

        const hash = await bcrypt.hash(password, 10);

        const { data, error } = await db
            .from('users')
            .insert({ email, password_hash: hash, role: 'USER' })
            .select('id, role')
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        if (!data) {
            return NextResponse.json(
                { error: 'Insert succeeded but RLS prevented returning row' },
                { status: 500 }
            );
        }

        const token = signJwt({ id: data.id, role: 'USER' });
        setAuthCookie(token);
        return NextResponse.json({ id: data.id, email }, { status: 201 });
    } catch (e: any) {
        console.error('register error:', e);
        return NextResponse.json({ error: e.message ?? 'unknown' }, { status: 500 });
    }
}
