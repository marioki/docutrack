import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { supabaseAdmin as db } from '../../../lib/supabase';
import { signJwt, jsonWithAuthCookie } from '../../../lib/auth';

const RegisterSchema = z.object({
    email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'),
    password: z.string().min(6),
});

export async function POST(req: Request) {
    try {
        const json = await req.json();
        const { email, password } = RegisterSchema.parse(json);

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
        return jsonWithAuthCookie({ id: data.id, email }, token, 201);

    } catch (e: unknown) {
        if (e instanceof z.ZodError) {
            return NextResponse.json({ error: 'Datos inválidos', details: e.issues }, { status: 400 });
        }

        console.error('register error:', e);
        const message = e instanceof Error ? e.message : 'unknown';
        return NextResponse.json({ error: message }, { status: 500 });
    }

}
