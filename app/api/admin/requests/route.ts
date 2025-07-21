import { NextResponse } from 'next/server';
import { supabaseAdmin as db } from '../../../lib/supabase';
import { verifyJwt } from '../../../lib/auth';

export async function GET(req: Request) {
    const token = req.headers.get('cookie')?.match(/token=([^;]+);?/i)?.[1];
    const payload = token && verifyJwt(token);
    if (!payload || payload.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await db
        .from('requests')
        .select('id, certificate_type, status, created_at, users(email)')
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}
