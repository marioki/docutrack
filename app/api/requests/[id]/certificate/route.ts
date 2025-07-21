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

    // Get the request and check ownership
    const { data: request, error } = await db
        .from('requests')
        .select('certificate_pdf_url, user_id')
        .eq('id', id)
        .single();

    if (error || !request) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    if (request.user_id !== payload.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (!request.certificate_pdf_url) return NextResponse.json({ error: 'Certificate not available' }, { status: 404 });

    // Download the PDF from Supabase Storage
    const storagePath = request.certificate_pdf_url.replace(/^certificates\//, '').replace(/^certificates\//, '');
    const { data: fileData, error: downloadError } = await db.storage
        .from('certificates')
        .download(storagePath);

    if (downloadError || !fileData)
        return NextResponse.json({ error: 'File not found' }, { status: 404 });

    const response = new NextResponse(fileData);
    response.headers.set('Content-Type', 'application/pdf');
    response.headers.set('Content-Disposition', `attachment; filename="certificado-${id}.pdf"`);
    return response;
} 