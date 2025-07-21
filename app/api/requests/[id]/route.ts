import { NextResponse } from 'next/server';
import { supabaseAdmin as db } from '../../../lib/supabase';
import { verifyJwt } from '../../../lib/auth';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const token = req.headers.get('cookie')?.match(/token=([^;]+);?/i)?.[1];
    const payload = token ? await verifyJwt(token) : null;
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: request, error } = await db
        .from('requests')
        .select('id, certificate_type, status, created_at, first_name, last_name, personal_id, birth_date, attachment_url, user_id')
        .eq('id', id)
        .single();

    if (error || !request) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    if (request.user_id !== payload.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    return NextResponse.json(request);
} 