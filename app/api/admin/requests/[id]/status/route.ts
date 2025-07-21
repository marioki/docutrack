import { NextResponse } from 'next/server';
import { supabaseAdmin as db } from '../../../../../lib/supabase';
import { verifyJwt } from '../../../../../lib/auth';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

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

    let certificate_pdf_url = null;

    if (status === 'ISSUED') {
        // Get request details for the certificate
        const { data: request, error: reqError } = await db
            .from('requests')
            .select('id, first_name, last_name, certificate_type, created_at')
            .eq('id', id)
            .single();

        if (reqError || !request)
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });

        // Generate PDF
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 400]);
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        page.drawText('Certificado', { x: 50, y: 350, size: 32, font, color: rgb(0, 0.53, 0.71) });
        page.drawText(`Nombre: ${request.first_name} ${request.last_name}`, { x: 50, y: 300, size: 18, font });
        page.drawText(`Tipo: ${request.certificate_type}`, { x: 50, y: 270, size: 18, font });
        page.drawText(`Fecha de emisión: ${new Date(request.created_at).toLocaleDateString()}`, { x: 50, y: 240, size: 18, font });
        page.drawText(`ID de solicitud: ${request.id}`, { x: 50, y: 210, size: 14, font, color: rgb(0.5,0.5,0.5) });

        const pdfBytes = await pdfDoc.save();

        // Upload to Supabase Storage
        const fileName = `certificate-${id}-${Date.now()}.pdf`;
        const { error: uploadError } = await db.storage
            .from('certificates')
            .upload(fileName, pdfBytes, { contentType: 'application/pdf', upsert: true });

        if (uploadError)
            return NextResponse.json({ error: uploadError.message }, { status: 500 });

        certificate_pdf_url = `certificates/${fileName}`;
    }

    // Update the request
    const { data, error } = await db
        .from('requests')
        .update(status === 'ISSUED'
            ? { status, certificate_pdf_url }
            : { status }
        )
        .eq('id', id)
        .select('id, status, certificate_pdf_url')
        .single();

    if (error)
        return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data);
}
