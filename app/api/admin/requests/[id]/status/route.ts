import { NextResponse } from 'next/server';
import { supabaseAdmin as db } from '../../../../../lib/supabase';
import { verifyJwt } from '../../../../../lib/auth';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const token = req.headers.get('cookie')?.match(/token=([^;]+);?/i)?.[1];
    const payload = token ? await verifyJwt(token) : null;
    if (!payload || payload.role !== 'ADMIN')
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { status } = await req.json();
    const allowed = [
        'VALIDATING',
        'ISSUED',
        'REJECTED',
        'NEEDS_CORRECTION',
    ];
    if (!allowed.includes(status))
        return NextResponse.json({ error: 'Status inválido' }, { status: 400 });

    const { data, error } = await db
        .from('requests')
        .update({ status })
        .eq('id', id)
        .select('id, status')
        .single();

    if (error)
        return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data);
}
