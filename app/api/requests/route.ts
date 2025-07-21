import { supabaseAdmin as db } from '../../lib/supabase';
import { verifyJwt } from '../../lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const token = req.headers.get('cookie')?.match(/token=([^;]+);?/i)?.[1];
    const payload = token ? await verifyJwt(token) : null;
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const form = await req.formData();
    const type = form.get('certificate_type') as string;
    const file = form.get('attachment') as File | null;
    const firstName = form.get('first_name') as string;
    const lastName = form.get('last_name') as string;
    const personalId = form.get('personal_id') as string;
    const birthDate = form.get('birth_date') as string;

    if (!type || !file || !firstName || !lastName || !personalId || !birthDate)
        return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const path = `user-${payload.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await db
        .storage
        .from('attachments')
        .upload(path, arrayBuffer, { contentType: file.type });

    if (uploadError)
        return NextResponse.json({ error: uploadError.message }, { status: 500 });

    const { data, error } = await db
        .from('requests')
        .insert({
            user_id: payload.id,
            certificate_type: type,
            status: 'RECEIVED',
            attachment_url: `attachments/${path}`,
            first_name: firstName,
            last_name: lastName,
            personal_id: personalId,
            birth_date: birthDate,
        })
        .select('id, status')
        .single();

    if (error)
        return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data, { status: 201 });
}

export async function GET(req: Request) {
    const token = req.headers.get('cookie')?.match(/token=([^;]+);?/i)?.[1];
    const payload = token ? await verifyJwt(token) : null;
    if (!payload)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await db
        .from('requests')
        .select('id, certificate_type, status, created_at')
        .eq('user_id', payload.id)
        .order('created_at', { ascending: false });

    if (error)
        return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data);
}