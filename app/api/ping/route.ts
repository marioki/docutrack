import { supabaseAdmin as db } from '../../lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
    const { error, count } = await db
        .from('users')
        .select('id', { head: true, count: 'exact' });

    if (error) {
        return NextResponse.json({ ok: false, error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, users: count });
}
