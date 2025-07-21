import { NextResponse } from 'next/server';
import { supabaseAdmin as db } from '../../../../lib/supabase';
import { verifyJwt } from '../../../../lib/auth';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    
    const token = req.headers.get('cookie')?.match(/token=([^;]+);?/i)?.[1];
    const payload = token ? await verifyJwt(token) : null;
    if (!payload || payload.role !== 'ADMIN')
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { data, error } = await db
        .from('requests')
        .select('id, certificate_type, status, created_at, attachment_url, users(email)')
        .eq('id', id)
        .single();

    if (error)
        return NextResponse.json({ error: error.message }, { status: 500 });

    if (!data)
        return NextResponse.json({ error: 'Request not found' }, { status: 404 });

    return NextResponse.json(data);
} 