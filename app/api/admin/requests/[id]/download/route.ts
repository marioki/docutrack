import { NextResponse } from 'next/server';
import { supabaseAdmin as db } from '../../../../../lib/supabase';
import { verifyJwt } from '../../../../../lib/auth';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const token = req.headers.get('cookie')?.match(/token=([^;]+);?/i)?.[1];
    const payload = token ? await verifyJwt(token) : null;
    if (!payload || payload.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Get the request
    const { data: request, error } = await db
        .from('requests')
        .select('attachment_url')
        .eq('id', id)
        .single();

    if (error || !request) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    if (!request.attachment_url) return NextResponse.json({ error: 'File not found' }, { status: 404 });

    // Download the file from Supabase Storage
    const storagePath = request.attachment_url.replace(/^attachments\//, '').replace(/^attachments\//, '');
    const { data: fileData, error: downloadError } = await db.storage
        .from('attachments')
        .download(storagePath);

    if (downloadError || !fileData)
        return NextResponse.json({ error: 'File not found' }, { status: 404 });

    const response = new NextResponse(fileData);
    response.headers.set('Content-Type', 'application/octet-stream');
    response.headers.set('Content-Disposition', `attachment; filename="${request.attachment_url?.split('/').pop() || 'archivo'}"`);
    return response;
} 