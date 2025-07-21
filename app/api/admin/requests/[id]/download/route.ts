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
    if (!payload || payload.role !== 'ADMIN')
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Get the request to find the attachment URL
    const { data: request, error: requestError } = await db
        .from('requests')
        .select('attachment_url')
        .eq('id', id)
        .single();

    if (requestError || !request)
        return NextResponse.json({ error: 'Request not found' }, { status: 404 });

    if (!request.attachment_url)
        return NextResponse.json({ error: 'No attachment found' }, { status: 404 });

    // Download the file from Supabase Storage
    const { data: fileData, error: downloadError } = await db.storage
        .from('attachments')
        .download(request.attachment_url);

    if (downloadError || !fileData)
        return NextResponse.json({ error: 'File not found' }, { status: 404 });

    // Convert the file to a response
    const response = new NextResponse(fileData);
    
    // Set appropriate headers for file download
    response.headers.set('Content-Type', 'application/octet-stream');
    response.headers.set('Content-Disposition', `attachment; filename="attachment-${id}"`);
    
    return response;
} 