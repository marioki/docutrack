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
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get the request and check ownership and status
    const { data: request, error } = await db
        .from('requests')
        .select('attachment_url, status, user_id')
        .eq('id', id)
        .single();

    if (error || !request) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    if (request.user_id !== payload.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (request.status !== 'ISSUED') return NextResponse.json({ error: 'Certificate not available' }, { status: 403 });
    if (!request.attachment_url) return NextResponse.json({ error: 'No attachment found' }, { status: 404 });

    // Download the file from Supabase Storage
    const { data: fileData, error: downloadError } = await db.storage
        .from('attachments')
        .download(request.attachment_url);

    if (downloadError || !fileData)
        return NextResponse.json({ error: 'File not found' }, { status: 404 });

    const response = new NextResponse(fileData);
    response.headers.set('Content-Type', 'application/octet-stream');
    response.headers.set('Content-Disposition', `attachment; filename="certificado-${id}"`);
    return response;
} 